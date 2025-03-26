import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, CircularProgress, Paper, Avatar } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { primerMayuscula } from '../Pages/PokemonPage';
import { PokemonContext } from '../Context/PokemonContext';

export const EvolutionChain = ({ pokemonId, mainType, onSelectPokemon }) => {
    const [evolutionData, setEvolutionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getPokemonByID } = useContext(PokemonContext);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            try {
                // Primero obtenemos la especie del Pokémon
                const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
                if (!speciesResponse.ok) throw new Error('Error al obtener datos de la especie');
                
                const speciesData = await speciesResponse.json();
                
                // Luego obtenemos la cadena evolutiva
                const evolutionResponse = await fetch(speciesData.evolution_chain.url);
                if (!evolutionResponse.ok) throw new Error('Error al obtener la cadena evolutiva');
                
                const evolutionChain = await evolutionResponse.json();
                
                // Procesar la cadena evolutiva en un formato más manejable
                const processedChain = await processEvolutionChain(evolutionChain.chain);
                setEvolutionData(processedChain);
            } catch (err) {
                console.error('Error al cargar la cadena evolutiva:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvolutionChain();
    }, [pokemonId]);

    // Función recursiva para procesar la cadena evolutiva
    const processEvolutionChain = async (chain) => {
        // Obtener datos del Pokémon actual en la cadena
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${chain.species.name}/`);
        const pokemonData = await pokemonResponse.json();
        
        const current = {
            id: pokemonData.id,
            name: chain.species.name,
            img: pokemonData.sprites.other.home.front_default || pokemonData.sprites.front_default,
            evolution_details: chain.evolution_details,
            types: pokemonData.types
        };

        // Procesar las evoluciones
        const evolutions = await Promise.all(
            chain.evolves_to.map(async evolution => await processEvolutionChain(evolution))
        );

        return {
            current,
            evolutions
        };
    };

    // Manejador para cuando se hace clic en un Pokémon de la cadena
    const handlePokemonClick = async (id) => {
        // No hacer nada si ya estamos viendo este Pokémon
        if (id === pokemonId) return;
        
        try {
            // Llamar a la función proporcionada por el componente padre
            if (onSelectPokemon) {
                onSelectPokemon(id);
            }
        } catch (error) {
            console.error("Error al cambiar de Pokémon:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} sx={{ color: `var(--color-${mainType})` }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.7)'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    No se pudo cargar la información evolutiva
                </Typography>
            </Paper>
        );
    }

    // Función para renderizar la cadena evolutiva de forma horizontal
    const renderEvolutionChain = (node, isHighlighted = false, isFirst = true) => {
        if (!node) return null;
        
        // Flatten the evolution chain for horizontal display
        const allEvolutions = [];
        
        // Add current pokemon
        allEvolutions.push({
            pokemon: node.current,
            isHighlighted: isHighlighted,
            isFirst: isFirst,
            evolutionDetails: isFirst ? null : node.current.evolution_details[0]
        });
        
        // Add all evolutions recursively
        const addEvolutions = (evol, isFirst = false) => {
            for (const nextEvol of evol.evolutions) {
                allEvolutions.push({
                    pokemon: nextEvol.current,
                    isHighlighted: nextEvol.current.id === pokemonId,
                    isFirst: false,
                    evolutionDetails: nextEvol.current.evolution_details[0]
                });
                addEvolutions(nextEvol);
            }
        };
        
        addEvolutions(node);
        
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    overflowX: 'auto',
                    py: 1,
                    px: 2
                }}
            >
                {allEvolutions.map((evolution, index) => (
                    <React.Fragment key={evolution.pokemon.id}>
                        {/* Evolution arrow and details */}
                        {!evolution.isFirst && (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mx: 1
                                }}
                            >
                                <ArrowForwardIcon 
                                    sx={{ 
                                        color: `var(--color-${mainType})`,
                                        fontSize: '1.2rem'
                                    }} 
                                />
                                {evolution.evolutionDetails?.min_level && (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontSize: '0.6rem',
                                            bgcolor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                            px: 0.8,
                                            py: 0.2,
                                            borderRadius: 1,
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}
                                    >
                                        Nv. {evolution.evolutionDetails.min_level}
                                    </Typography>
                                )}
                                {evolution.evolutionDetails?.item && (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontSize: '0.6rem',
                                            bgcolor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                            px: 0.8,
                                            py: 0.2,
                                            borderRadius: 1,
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}
                                    >
                                        {primerMayuscula(evolution.evolutionDetails.item.name.replace('-', ' '))}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        
                        {/* Pokémon (ahora clickeable) */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                minWidth: { xs: 'auto', sm: '80px' }
                            }}
                        >
                            <Avatar
                                src={evolution.pokemon.img}
                                alt={evolution.pokemon.name}
                                onClick={() => handlePokemonClick(evolution.pokemon.id)}
                                sx={{
                                    width: { xs: 45, md: 55 },
                                    height: { xs: 45, md: 55 },
                                    border: evolution.isHighlighted 
                                        ? `2px solid var(--color-${mainType})` 
                                        : '2px solid rgba(0,0,0,0.1)',
                                    boxShadow: evolution.isHighlighted 
                                        ? `0 0 8px var(--color-${mainType})` 
                                        : 'none',
                                    bgcolor: `rgba(var(--color-${evolution.pokemon.types[0].type.name}-rgb), 0.1)`,
                                    cursor: evolution.isHighlighted ? 'default' : 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: evolution.isHighlighted ? 'none' : 'scale(1.1)',
                                        boxShadow: evolution.isHighlighted 
                                            ? `0 0 8px var(--color-${mainType})` 
                                            : '0 4px 8px rgba(0,0,0,0.2)'
                                    },
                                    position: 'relative',
                                    '&::after': evolution.isHighlighted ? {} : {
                                        content: '""',
                                        position: 'absolute',
                                        top: -3,
                                        right: -3,
                                        width: 15,
                                        height: 15,
                                        borderRadius: '50%',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ccc',
                                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
                                        backgroundSize: '4px 4px',
                                        backgroundPosition: '0 0, 2px 2px',
                                        opacity: 0,
                                        transition: 'opacity 0.2s'
                                    },
                                    '&:hover::after': {
                                        opacity: evolution.isHighlighted ? 0 : 1
                                    }
                                }}
                            />
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    mt: 0.5, 
                                    fontWeight: evolution.isHighlighted ? 700 : 600,
                                    fontSize: '0.7rem',
                                    textAlign: 'center'
                                }}
                            >
                                {primerMayuscula(evolution.pokemon.name)}
                            </Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 0,
                borderRadius: 2,
                background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(var(--color-${mainType}-rgb), 0.1))`,
                backdropFilter: 'blur(5px)',
                border: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                boxShadow: `0 2px 8px rgba(var(--color-${mainType}-rgb), 0.1)`,
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                overflowX: 'auto'
            }}
        >
            {evolutionData ? (
                renderEvolutionChain(evolutionData, evolutionData.current.id === pokemonId)
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Este Pokémon no tiene evoluciones registradas
                </Typography>
            )}
            
            {/* Información evolutiva adicional */}
            <Box sx={{ 
                mt: 0, 
                width: '100%',
                borderTop: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                pt: 0.5,
                px: 1
            }}>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block',
                        textAlign: 'center',
                        fontSize: '0.65rem',
                        color: '#666',
                        fontStyle: 'italic'
                    }}
                >
                    Algunos Pokémon evolucionan mediante objetos especiales, intercambio o en ubicaciones específicas.
                    <br />
                    <span style={{ fontWeight: 'bold' }}>Da clic en cualquier evolución para ver sus detalles.</span>
                </Typography>
            </Box>
        </Paper>
    );
};