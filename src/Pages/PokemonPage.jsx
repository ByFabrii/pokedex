import React, { useContext, useEffect, useState } from 'react';
import { Loader } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';
import { Box, Typography, Chip, Paper, IconButton, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeightIcon from '@mui/icons-material/Height';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { EvolutionChain } from '../Components/EvolutionChain';

export const primerMayuscula = (word) => {
    return word[0].toUpperCase() + word.substring(1);
};

export const PokemonPage = ({ idPokemon, onClose }) => {
    const { getPokemonByID } = useContext(PokemonContext);
    const [loading, setLoading] = useState(true);
    const [pokemon, setPokemon] = useState({});
    const [fadeIn, setFadeIn] = useState(false);

    const fetchPokemon = async idPokemon => {
        const data = await getPokemonByID(idPokemon);
        setPokemon(data);
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
    };

    useEffect(() => {
        fetchPokemon(idPokemon);
        return () => setFadeIn(false);
    }, [idPokemon]);

    if (loading) return <Loader />;
    
    const mainType = pokemon.types[0].type.name;
    const statIcons = {
        hp: <FavoriteIcon fontSize="small" sx={{ color: '#ff5959' }} />,
        attack: <BoltIcon fontSize="small" sx={{ color: '#f5ac78' }} />,
        defense: <ShieldIcon fontSize="small" sx={{ color: '#fae078' }} />,
        'special-attack': <AutoFixHighIcon fontSize="small" sx={{ color: '#9db7f5' }} />,
        'special-defense': <ShieldIcon fontSize="small" sx={{ color: '#a7db8d' }} />,
        speed: <CatchingPokemonIcon fontSize="small" sx={{ color: '#fa92b2' }} />
    };

    const statNames = {
        hp: 'HP',
        attack: 'Ataque',
        defense: 'Defensa',
        'special-attack': 'Ataque Esp.',
        'special-defense': 'Defensa Esp.',
        speed: 'Velocidad'
    };

    return (
        <Box 
            sx={{ 
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                // overflow: 'hidden',
                borderRadius: '15px',
                backgroundColor: '#fff',
                opacity: fadeIn ? 1 : 0,
                transform: fadeIn ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
            }}
        >
            {/* Fondo estilizado según el tipo (más pequeño) */}
            <Box 
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '30%', // Reducido del 45% anterior
                    background: `linear-gradient(to bottom, var(--color-${mainType}), rgba(255,255,255,0.7))`,
                    zIndex: 0,
                }}
            />
            
            {/* Botón para cerrar el modal */}
            {onClose && (
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        left: 10, 
                        zIndex: 10,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            )}
            
            {/* Número de Pokémon */}
            <Typography 
                variant="h2" 
                component="span"
                sx={{
                    position: 'absolute',
                    top: { xs: 5, md: 10 },
                    right: { xs: 10, md: 15 },
                    fontSize: { xs: '1.5rem', md: '1.8rem' },
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                    zIndex: 1
                }}
            >
                #{pokemon.id.toString().padStart(3, '0')}
            </Typography>

            {/* Sección superior compacta con imagen y datos básicos */}
            <Grid 
                container 
                sx={{ 
                    position: 'relative',
                    zIndex: 1,
                    pt: { xs: 3, md: 3 },
                    pb: { xs: 0, md: 0 },
                    px: { xs: 2, md: 3 },
                }}
            >
                {/* Columna izquierda: Imagen */}
                <Grid item xs={5} md={5} sx={{ 
                    position: 'relative',
                    // Añadir margen negativo para subir la imagen
                    mt: { xs: -3, sm: -4, md: -13 },
                    // Añadir margen negativo para mover la imagen a la izquierda
                    ml: { xs: -1.5, sm: -2, md: -5 },
                    // Ajustar el eje Z para estar sobre el fondo pero debajo del número
                    zIndex: 9999
                }}>
                    <Box 
                        component="img"
                        src={pokemon.sprites.other.home.front_default}
                        alt={`Pokemon ${pokemon?.name}`}
                        sx={{
                            width: '110%', // Aumentar el tamaño al 120%
                            height: '110%',
							paddingBottom: '25px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
                        }}
                    />
                </Grid>
                
                {/* Columna derecha: Nombre, tipos, altura y peso */}
                <Grid item xs={7} md={7} sx={{ pl: { xs: 1, md: 2 } }}>
                    {/* Nombre del Pokemon */}
                    <Typography 
                        variant="h4" 
                        component="h1"
                        sx={{
                            fontSize: { xs: '1.3rem', md: '1.6rem' },
                            fontWeight: 700,
                            color: '#333',
                            mb: 0.5
                        }}
                    >
                        {primerMayuscula(pokemon.name)}
                    </Typography>
                    
                    {/* Tipos del Pokemon */}
                    <Box 
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            mb: 1.5,
                            justifyContent: 'flex-start'
                        }}
                    >
                        {pokemon.types.map(type => (
                            <Chip
                                key={type.type.name}
                                label={primerMayuscula(type.type.name)}
                                size="small"
                                sx={{
                                    backgroundColor: `var(--color-${type.type.name})`,
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 22
                                }}
                            />
                        ))}
                    </Box>
                    
                    {/* Sección de info - con estilo unificado */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 1.5
                    }}>
                        {/* Sección 1: Características físicas */}
                        <Paper 
                            elevation={0}
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(var(--color-${mainType}-rgb), 0.1))`,
                                backdropFilter: 'blur(5px)',
                                border: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                                boxShadow: `0 2px 8px rgba(var(--color-${mainType}-rgb), 0.1)`
                            }}
                        >
                            <Typography 
                                variant="subtitle2"
                                sx={{
                                    fontSize: { xs: '0.75rem', md: '0.95rem' },
                                    fontWeight: 700,
                                    mb: 0,
                                    color: '#333',
                                    borderBottom: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                                    pb: 0.5
                                }}
                            >
                                Características
                            </Typography>
                            
                            <Grid container spacing={1}>
                                {/* Altura */}
                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            backgroundColor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                            mr: 0.7
                                        }}>
                                            <HeightIcon sx={{ fontSize: '0.8rem', color: `var(--color-${mainType})` }}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} fontSize="0.7rem" lineHeight={1.1}>
                                                Altura
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                                                {(pokemon.height / 10).toFixed(1)} m
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                
                                {/* Peso */}
                                <Grid item xs={6}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            backgroundColor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                            mr: 0.7
                                        }}>
                                            <FitnessCenterIcon sx={{ fontSize: '0.8rem', color: `var(--color-${mainType})` }}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} fontSize="0.7rem" lineHeight={1.1}>
                                                Peso
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                                                {(pokemon.weight / 10).toFixed(1)} kg
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Sección 2: Habilidades con estilo coherente */}
                        <Paper 
                            elevation={0}
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(var(--color-${mainType}-rgb), 0.1))`,
                                backdropFilter: 'blur(5px)',
                                border: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                                boxShadow: `0 2px 8px rgba(var(--color-${mainType}-rgb), 0.1)`
                            }}
                        >
                            <Typography 
                                variant="subtitle2"
                                sx={{
                                    fontSize: { xs: '0.75rem', md: '0.95rem' },
                                    fontWeight: 700,
                                    mb: 0,
                                    color: '#333',
                                    borderBottom: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                                    pb: 0
                                }}
                            >
                                Habilidades
                            </Typography>
                            
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 0.7,
                                pt: 0.3
                            }}>
                                {pokemon.abilities.map((ability, index) => (
                                    <Chip
                                        key={index}
                                        label={primerMayuscula(ability.ability.name.replace('-', ' '))}
                                        size="small"
                                        sx={{
                                            fontSize: '0.85rem',
                                            backgroundColor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                            color: '#555',
                                            fontWeight: 800,
                                            height: 22,
                                            border: `1px solid rgba(var(--color-${mainType}-rgb), 0.3)`
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {/* Panel de estadísticas - ahora más arriba en el diseño */}
            <Box 
                sx={{
                    flex: 1,
                    backgroundColor: '#fff',
                    borderRadius: '15px 15px 0 0',
                    position: 'relative',
                    zIndex: 2,
                    mt: { xs: 1, md: 1 },
                    px: { xs: 2, md: 3 },
                    pt: { xs: 1.5, md: 0 },
                    pb: { xs: 1, md: 1.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Título de estadísticas */}
                <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 700,
                        mb: 1,
                        color: '#333',
                        textAlign: 'center',
                        position: 'relative',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -3,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '30px',
                            height: '2px',
                            backgroundColor: `var(--color-${mainType})`,
                            borderRadius: '2px'
                        }
                    }}
                >
                    Estadísticas
                </Typography>
                
                {/* Lista de estadísticas */}
                <Box sx={{ overflow: 'auto', flex: 1, mt: 1 }}>
                    {pokemon.stats.map((stat, index) => (
                        <Box 
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                                px: { xs: 0, md: 1 }
                            }}
                        >
                            {/* Icono y nombre */}
                            <Box 
                                sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: { xs: '35%', md: '30%' },
                                    mr: 1
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                                    mr: 0.7
                                }}>
                                    {statIcons[stat.stat.name]}
                                </Box>
                                <Typography 
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: { xs: '0.65rem', md: '0.95rem' },
                                        color: '#555',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {statNames[stat.stat.name] || primerMayuscula(stat.stat.name)}
                                </Typography>
                            </Box>
                            
                            {/* Valor numérico */}
                            <Typography 
                                sx={{
                                    width: '1%',
                                    fontWeight: 700,
                                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                                    textAlign: 'right',
                                    mr: 3
                                }}
                            >
                                {stat.base_stat}
                            </Typography>
                            
                            {/* Barra de progreso */}
                            <Box 
                                sx={{
                                    flexGrow: 1,
                                    height: 15,
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${Math.min(stat.base_stat, 100)}%`,
                                        bgcolor: `var(--color-${mainType})`,
                                        borderRadius: 10,
                                        position: 'absolute',
                                        transition: 'width 1s ease-in-out',
                                        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        '@keyframes shimmer': {
                                            '0%': { backgroundPosition: '200% 0' },
                                            '100%': { backgroundPosition: '-200% 0' }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                    
                    {/* Sección de árbol de evoluciones */}
                    <Box sx={{ 
                        mt: 1, 
                        pt: 1, 
                        borderTop: `1px dashed rgba(var(--color-${mainType}-rgb), 0.3)`,
                        position: 'relative'
                    }}>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                textAlign: 'center', 
                                fontSize: { xs: '0.8rem', md: '0.9rem' },
                                fontWeight: 700,
                                mb: 1,
                                color: '#444',
                                position: 'relative',
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -2,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '2px',
                                    backgroundColor: `var(--color-${mainType})`,
                                    borderRadius: '2px'
                                }
                            }}
                        >
                            Línea Evolutiva
                        </Typography>
                        
                        {/* Implementación del árbol de evoluciones */}
                        <EvolutionChain pokemonId={pokemon.id} mainType={mainType} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};