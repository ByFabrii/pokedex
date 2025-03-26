import React, { useContext, useState, useEffect } from 'react';
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
            <div className='container-filter container'>
                <div className='icon-filter' onClick={() => setActive(!active)}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='icon'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'
                        />
                    </svg>
                    <span>Filtrar</span>
                </div>
            </div>
            
            <PokemonList />
            <FilterBar />
            
            {showScroll && (
                <Fab
                    color='warning'
                    size="medium"
                    onClick={scrollToTop}
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
