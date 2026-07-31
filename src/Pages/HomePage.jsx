import React, { useContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FilterBar, Loader, PokemonList } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';
import { Fab, Alert, Snackbar } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { throttle } from "lodash";

export const HomePage = () => {
    const { 
        active, 
        setActive, 
        loadingMore, 
        allPokemons, 
        totalPokemons,
        loadError 
    } = useContext(PokemonContext);
    const [showScroll, setShowScroll] = useState(false);
    const [showError, setShowError] = useState(false);

    const checkScrollTop = throttle(() => {
        if (!showScroll && window.pageYOffset > 400) {
            setShowScroll(true);
        } else if (showScroll && window.pageYOffset <= 400) {
            setShowScroll(false);
        }
    }, 200);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener('scroll', checkScrollTop);
        return () => {
            window.removeEventListener('scroll', checkScrollTop);
        };
    }, [checkScrollTop, showScroll]);

    // Mostrar errores
    useEffect(() => {
        if (loadError) {
            setShowError(true);
        }
    }, [loadError]);

    const handleCloseError = () => {
        setShowError(false);
    };

    return (
        <>
            <Helmet>
                <title>Pokedex — Explora, busca y filtra todos los Pokémon</title>
                <meta name="description" content="Busca cualquier Pokémon por nombre, filtra por tipo y consulta estadísticas, habilidades y cadenas evolutivas en esta Pokédex interactiva." />
                <link rel="canonical" href="https://pokedex.fabrizziodev.com/" />
                <meta property="og:title" content="Pokedex — Explora, busca y filtra todos los Pokémon" />
                <meta property="og:description" content="Busca cualquier Pokémon por nombre, filtra por tipo y consulta estadísticas, habilidades y cadenas evolutivas." />
                <meta property="og:url" content="https://pokedex.fabrizziodev.com/" />
            </Helmet>

            <h1 className="visually-hidden">Pokedex — Lista de Pokémon</h1>

            <PokemonList />
            <FilterBar />

            {showScroll && (
                <Fab
                    color='warning'
                    size="medium"
                    onClick={scrollToTop}
                    aria-label="Volver arriba"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    <KeyboardArrowUp />
                </Fab>
            )}

            {/* Mensaje de error */}
            <Snackbar 
                open={showError} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseError} 
                    severity="error" 
                    variant="filled"
                >
                    {loadError || "Hubo un error al cargar Pokémon. Inténtalo de nuevo."}
                </Alert>
            </Snackbar>
        </>
    );
};
