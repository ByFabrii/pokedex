import React, { useContext, useState, useEffect, useRef } from 'react';
import { PokemonContext } from '../Context/PokemonContext';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { PokemonPage } from '../Pages/PokemonPage';
import {
    Snackbar, Alert, InputBase, IconButton, Paper,
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    ClickAwayListener, CircularProgress, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

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

    const searchRef = useRef(null);

    // Función mejorada para buscar Pokémon por nombre parcial
    const searchPokemonsByPartialName = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            return;
        }

        setSearchLoading(true);

        try {
            // Primero busca en los Pokémon ya cargados (para respuesta inmediata)
            const localResults = allPokemons.filter(pokemon =>
                pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (localResults.length > 0) {
                // Si encontramos resultados localmente, los usamos
                setSuggestions(localResults.slice(0, 5));
            } else {
                // Si no hay resultados locales, hacemos una búsqueda en la API completa
                // Obtener una lista de todos los Pokémon (solo nombres)
                const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
                const data = await response.json();

                // Filtrar los nombres que coincidan con la búsqueda
                const matchingPokemon = data.results.filter(pokemon =>
                    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 5); // Limitamos a 5 resultados

                if (matchingPokemon.length > 0) {
                    // Para cada coincidencia, obtenemos los detalles completos
                    const detailedResults = await Promise.all(
                        matchingPokemon.map(async pokemon => {
                            const res = await fetch(pokemon.url);
                            return await res.json();
                        })
                    );

                    setSuggestions(detailedResults);
                } else {
                    setSuggestions([]);
                }
            }
        } catch (error) {
            console.error('Error al buscar Pokémon:', error);
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Debounce para no saturar con llamadas mientras el usuario escribe
    const debouncedSearch = useRef(
        debounce((searchTerm) => searchPokemonsByPartialName(searchTerm), 300)
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
        setSearchLoading(true);
        const data = await getPokemonByID(idPokemon);
        setPokemon(data);
        setLoading(false);
        setOpen(true);
        setSearchLoading(false);
        setShowSuggestions(false);
    };

    const handleClose = () => setOpen(false);
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

                {/* Lista de sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            mt: 0.5,
                            zIndex: 1000,
                            borderRadius: '15px',
                            animation: 'fadeIn 0.2s',
                            '@keyframes fadeIn': {
                                '0%': { opacity: 0, transform: 'translateY(-10px)' },
                                '100%': { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}
                    >
                        <List sx={{ padding: 0 }}>
                            {suggestions.map((pokemon) => (
                                <ListItem
                                    key={pokemon.id}
                                    onClick={() => handleSuggestionClick(pokemon)}
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
                                            src={
                                                // pokemon.sprites.other.dream_world.front_default || 
                                                pokemon.sprites.other.home.front_default
                                                // pokemon.sprites.front_default
                                            }
                                            alt={pokemon.name}
                                            sx={{
                                                background: `rgba(var(--${pokemon.types[0].type.name}-rgb), 0.2)`,
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
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Mensaje de "no se encontraron resultados" cuando el usuario escribe pero no hay coincidencias */}
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

                {pokemon && (
                    <Modal
                        open={open}
                        onClose={handleClose}
                        closeAfterTransition
                        slots={{ backdrop: Backdrop }}
                        slotProps={{
                            backdrop: {
                                timeout: 500,
                            },
                        }}
                    >
                        <Fade in={open}>
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
                                    overflow: 'visible', // Mantener como 'visible'
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                    zIndex: 9999,
                                }}
                            >
                                <PokemonPage idPokemon={pokemon.id} onClose={handleClose} />
                            </Box>
                        </Fade>
                    </Modal>
                )}
            </Box>
        </ClickAwayListener>
    );
};