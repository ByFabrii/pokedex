import React, { useContext, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { PokemonContext } from '../Context/PokemonContext';
import Box from '@mui/material/Box';
import {
    Snackbar, Alert, InputBase, IconButton, Paper,
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    ClickAwayListener, CircularProgress, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';
import { FixedSizeList } from 'react-window';

// Importaciones dinámicas para reducir el tamaño inicial
const Modal = lazy(() => import('@mui/material/Modal'));
const Backdrop = lazy(() => import('@mui/material/Backdrop'));
const Fade = lazy(() => import('@mui/material/Fade'));

// Importación dinámica del componente PokemonPage
const PokemonPage = lazy(() => import('../Pages/PokemonPage').then(module => ({
    default: module.PokemonPage
})));

// Agregar componente memoizado para las sugerencias
const MemoizedSuggestion = React.memo(({ pokemon, onClick }) => (
    <ListItem
        onClick={onClick}
        sx={{
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
                backgroundColor: 'rgba(255, 204, 0, 0.1)',
            },
            borderBottom: '1px solid #f0f0f0',
            '&:last-child': {
                borderBottom: 'none'
            }
        }}
    >
        <ListItemAvatar>
            <Avatar
                src={pokemon.sprites.other.home.front_default}
                alt={pokemon.name}
                sx={{
                    background: `rgba(var(--color-${pokemon.types[0].type.name}-rgb), 0.2)`,
                    width: 40,
                    height: 40
                }}
            />
        </ListItemAvatar>
        <ListItemText
            primary={
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                </Typography>
            }
            secondary={
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {pokemon.types.map(type => (
                        <Typography
                            key={type.type.name}
                            variant="caption"
                            sx={{
                                backgroundColor: `var(--color-${type.type.name})`,
                                color: '#fff',
                                px: 1,
                                py: 0.3,
                                borderRadius: '10px',
                                fontSize: '0.65rem'
                            }}
                        >
                            {type.type.name}
                        </Typography>
                    ))}
                </Box>
            }
        />
    </ListItem>
));

// Componente de carga para usar con Suspense
const LoadingFallback = () => (
    <Box 
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '90%', sm: '300px' },
            height: '200px',
            bgcolor: 'background.paper',
            borderRadius: '15px',
            boxShadow: 24,
            p: 4,
        }}
    >
        <CircularProgress sx={{ color: 'var(--color-warning)', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
            Cargando Pokémon...
        </Typography>
    </Box>
);

export const Searcher = () => {
    const {
        onInputChange, valueSearch, onResetForm,
        getPokemonByID, allPokemons
    } = useContext(PokemonContext);

    const [open, setOpen] = useState(false);
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [modalReady, setModalReady] = useState(false);

    const searchRef = useRef(null);
    const searchCache = useRef({}).current;

    // Función mejorada para buscar Pokémon por nombre parcial
    const searchPokemonsByPartialName = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();

        // Verificar en caché
        if (searchCache[searchTermLower]) {
            setSuggestions(searchCache[searchTermLower]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);

        try {
            // Búsqueda optimizada por prefijo en lugar de incluye (mucho más eficiente)
            const localResults = allPokemons.filter(pokemon =>
                pokemon.name.toLowerCase().startsWith(searchTermLower)
            );

            // Si no hay suficientes resultados por prefijo, entonces buscar por inclusión como fallback
            if (localResults.length < 5) {
                const additionalResults = allPokemons
                    .filter(pokemon =>
                        !pokemon.name.toLowerCase().startsWith(searchTermLower) &&
                        pokemon.name.toLowerCase().includes(searchTermLower)
                    )
                    .slice(0, 5 - localResults.length);

                if (localResults.length > 0 || additionalResults.length > 0) {
                    setSuggestions([...localResults, ...additionalResults].slice(0, 5));
                } else {
                    // Usar una cache para evitar solicitudes repetidas
                    if (window.pokemonListCache) {
                        handleAPISearch(searchTermLower, window.pokemonListCache);
                    } else {
                        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
                        const data = await response.json();
                        window.pokemonListCache = data.results;
                        handleAPISearch(searchTermLower, data.results);
                    }
                }
            } else {
                setSuggestions(localResults.slice(0, 5));
            }
        } catch (error) {
            console.error('Error al buscar Pokémon:', error);
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
        }

        // Al final, guardar en caché
        if (suggestions.length > 0) {
            searchCache[searchTermLower] = suggestions;

            // Limitar tamaño de caché (opcional)
            const cacheKeys = Object.keys(searchCache);
            if (cacheKeys.length > 50) {
                delete searchCache[cacheKeys[0]];
            }
        }
    };

    // Función auxiliar para manejar la búsqueda en la API
    const handleAPISearch = async (searchTerm, pokemonList) => {
        // Primero buscar por prefijo
        const prefixMatches = pokemonList.filter(pokemon =>
            pokemon.name.toLowerCase().startsWith(searchTerm)
        ).slice(0, 5);

        // Si no hay suficientes por prefijo, buscar por inclusión
        const matches = prefixMatches.length >= 5 ? prefixMatches : [
            ...prefixMatches,
            ...pokemonList
                .filter(pokemon =>
                    !pokemon.name.toLowerCase().startsWith(searchTerm) &&
                    pokemon.name.toLowerCase().includes(searchTerm)
                )
                .slice(0, 5 - prefixMatches.length)
        ];

        if (matches.length > 0) {
            // Cargar detalles solo para el primer resultado inmediatamente
            try {
                const firstPokemon = await fetch(matches[0].url).then(res => res.json());
                setSuggestions([firstPokemon]);

                // Luego cargar el resto en segundo plano
                Promise.all(
                    matches.slice(1).map(async pokemon => {
                        try {
                            const res = await fetch(pokemon.url);
                            return await res.json();
                        } catch (err) {
                            console.error(`Error cargando ${pokemon.name}:`, err);
                            return null;
                        }
                    })
                ).then(results => {
                    const validResults = results.filter(Boolean);
                    if (validResults.length > 0) {
                        setSuggestions(prev => [...prev, ...validResults]);
                    }
                });
            } catch (error) {
                console.error('Error cargando el primer Pokémon:', error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    // Debounce para no saturar con llamadas mientras el usuario escribe
    const debouncedSearch = useRef(
        debounce((searchTerm) => {
            // Mostrar el spinner inmediatamente 
            setSearchLoading(true);
            // Pequeño retraso para mejorar UX
            setTimeout(() => searchPokemonsByPartialName(searchTerm), 50);
        }, 400) // Mayor tiempo de debounce para mejor rendimiento
    ).current;

    useEffect(() => {
        if (valueSearch) {
            debouncedSearch(valueSearch);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [valueSearch]);

    const handleOpenModal = async (idPokemon) => {
        // Asegurarse de que el modal esté listo para cargar
        setModalReady(true);
        setSearchLoading(true);
        
        try {
            const data = await getPokemonByID(idPokemon);
            setPokemon(data);
            
            // Establecer la carga inmediatamente para mejorar la percepción de velocidad
            setTimeout(() => {
                setOpen(true);
                setLoading(false);
            }, 100);
        } catch (error) {
            console.error("Error al cargar el Pokémon:", error);
            setSnackbarOpen(true);
            setErrorMessage("Error al cargar el Pokémon. Intente nuevamente.");
        } finally {
            setSearchLoading(false);
            setShowSuggestions(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Resetear el estado de carga para la próxima vez
        setTimeout(() => setLoading(true), 300);
    };
    
    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleSuggestionClick = (pokemon) => {
        handleOpenModal(pokemon.id);
        onResetForm();
    };

    const handleClickAway = () => {
        setShowSuggestions(false);
    };

    const onSearchSubmit = async (e) => {
        e.preventDefault();
        if (!valueSearch.trim()) return;

        if (suggestions.length > 0) {
            // Si hay sugerencias, selecciona la primera
            handleOpenModal(suggestions[0].id);
        } else {
            setErrorMessage('Pokémon no encontrado. Intenta con otro nombre.');
            setSnackbarOpen(true);
        }

        onResetForm();
    };

    const handleClearSearch = () => {
        onResetForm();
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearchFocus = () => {
        if (valueSearch.trim()) {
            setShowSuggestions(true);
        }
    };

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: 'relative' }}>
                <Paper
                    component="form"
                    onSubmit={onSearchSubmit}
                    elevation={0}
                    ref={searchRef}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '30px',
                        padding: '4px 10px',
                        width: { xs: '200px', sm: '280px', md: '320px' },
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        '&:hover, &:focus-within': {
                            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                            borderColor: '#ffcc00'
                        }
                    }}
                >
                    <InputBase
                        sx={{
                            ml: 1,
                            flex: 1,
                            fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                        placeholder="Buscar Pokémon..."
                        name="valueSearch"
                        value={valueSearch}
                        onChange={onInputChange}
                        onFocus={handleSearchFocus}
                        inputProps={{
                            'aria-label': 'buscar pokemon',
                            'autoComplete': 'off',
                            'autoCorrect': 'off',
                            'autoCapitalize': 'off',
                            'spellCheck': 'false',
                            'data-form-type': 'other'
                        }}
                    />

                    {searchLoading ? (
                        <CircularProgress size={20} sx={{ mx: 1, color: '#ffcc00' }} />
                    ) : valueSearch ? (
                        <IconButton
                            onClick={handleClearSearch}
                            sx={{
                                p: '6px',
                                color: '#777',
                                '&:hover': { color: '#ff6b6b' }
                            }}
                            aria-label="clear search"
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    ) : null}

                    <IconButton
                        type="submit"
                        sx={{
                            p: '8px',
                            color: '#555',
                            '&:hover': { color: '#ffcc00' }
                        }}
                        aria-label="search"
                    >
                        <SearchIcon />
                    </IconButton>
                </Paper>

                {/* Lista de sugerencias optimizada */}
                {showSuggestions && suggestions.length > 0 && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            maxHeight: '300px',
                            mt: 0.5,
                            zIndex: 1000,
                            borderRadius: '15px',
                            animation: 'fadeIn 0.2s',
                            '@keyframes fadeIn': {
                                '0%': { opacity: 0, transform: 'translateY(-10px)' },
                                '100%': { opacity: 1, transform: 'translateY(0)' }
                            },
                            overflow: 'hidden'
                        }}
                    >
                        <FixedSizeList
                            height={Math.min(suggestions.length * 80, 300)}
                            width="100%"
                            itemSize={60}
                            itemCount={suggestions.length}
                            overscanCount={2}
                        >
                            {({ index, style }) => (
                                <div style={style}>
                                    {suggestions[index] && (
                                        <MemoizedSuggestion
                                            pokemon={suggestions[index]}
                                            onClick={() => handleSuggestionClick(suggestions[index])}
                                        />
                                    )}
                                </div>
                            )}
                        </FixedSizeList>
                    </Paper>
                )}

                {/* Mensaje de "no se encontraron resultados" */}
                {showSuggestions && valueSearch && !searchLoading && suggestions.length === 0 && (
                    <Paper
                        elevation={2}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            mt: 0.5,
                            padding: 2,
                            zIndex: 1000,
                            borderRadius: '15px',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron Pokémon que coincidan con "{valueSearch}"
                        </Typography>
                    </Paper>
                )}

                {/* Indicador visual de carga */}
                {valueSearch && searchLoading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            mt: 0.5,
                            padding: 2,
                            zIndex: 1000,
                            borderRadius: '15px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(5px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <CircularProgress size={22} sx={{ color: '#ffcc00', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            Buscando "{valueSearch}"...
                        </Typography>
                    </Box>
                )}

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity="info"
                        sx={{
                            width: '100%',
                            bgcolor: '#ffcc00',
                            color: '#333',
                            fontWeight: 'medium'
                        }}
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>

                {/* Modal cargado de manera diferida */}
                {modalReady && pokemon && (
                    <Suspense fallback={<LoadingFallback />}>
                        <Modal
                            open={open}
                            onClose={handleClose}
                            closeAfterTransition
                            slots={{ backdrop: Backdrop }}
                            slotProps={{
                                backdrop: {
                                    timeout: 300,
                                },
                            }}
                        >
                            <Fade in={open} timeout={300}>
                                <Box
                                    sx={{
                                        outline: 'none',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: { xs: '95%', sm: '90%', md: '650px' },
                                        maxHeight: { xs: '90vh', md: '85vh' },
                                        borderRadius: '15px',
                                        overflow: 'visible',
                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                        zIndex: 9999,
                                    }}
                                >
                                    <Suspense fallback={<LoadingFallback />}>
                                        <PokemonPage idPokemon={pokemon.id} onClose={handleClose} />
                                    </Suspense>
                                </Box>
                            </Fade>
                        </Modal>
                    </Suspense>
                )}
            </Box>
        </ClickAwayListener>
    );
};