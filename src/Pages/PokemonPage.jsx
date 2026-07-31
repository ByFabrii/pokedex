import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader, StatBar } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';
import { FavoritesContext } from '../Context/FavoritesContext';
import { Box, Typography, Chip, Paper, IconButton, Grid, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeightIcon from '@mui/icons-material/Height';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { EvolutionChain } from '../Components/EvolutionChain';
import { statIcons, statNames } from '../utils/statMeta';
import { getTypeEffectiveness } from '../utils/typeEffectiveness';

export const primerMayuscula = (word) => {
    return word[0].toUpperCase() + word.substring(1);
};

export const PokemonPage = ({ idPokemon, onClose }) => {
    const { getPokemonByID } = useContext(PokemonContext);
    const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
    const params = useParams();
    const navigate = useNavigate();
    const resolvedId = idPokemon ?? params.id;
    const handleClose = onClose ?? (() => navigate('/'));
    const [loading, setLoading] = useState(true);
    const [pokemon, setPokemon] = useState({});
    const [fadeIn, setFadeIn] = useState(false);
    const [currentId, setCurrentId] = useState(resolvedId); // Nuevo estado para rastrear el ID actual

    const fetchPokemon = async id => {
        setLoading(true);
        setFadeIn(false);
        const data = await getPokemonByID(id);
        setPokemon(data);
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
    };

    // Actualizar cuando cambia el ID externo o el ID interno
    useEffect(() => {
        if (resolvedId !== currentId) {
            setCurrentId(resolvedId);
        }
    }, [resolvedId]);

    useEffect(() => {
        fetchPokemon(currentId);
        return () => setFadeIn(false);
    }, [currentId]);

    // Función para manejar la selección de un Pokémon desde el árbol evolutivo o una
    // forma alternativa. Dentro de la modal (idPokemon viene por prop) solo actualiza
    // el estado interno, sin tocar la URL, para no disparar la ruta de página completa.
    // Si se usa como página completa (acceso directo por URL), sí navega para mantener
    // el deep-link correcto.
    const handleSelectPokemon = (id) => {
        if (idPokemon) {
            setCurrentId(id);
        } else {
            navigate(`/pokemon/${id}`);
        }
    };

    // Debilidades y resistencias, combinando los 1-2 tipos del Pokémon actual.
    const [weaknesses, setWeaknesses] = useState(null);
    useEffect(() => {
        if (!pokemon?.types) return;
        let cancelled = false;
        setWeaknesses(null);
        getTypeEffectiveness(pokemon.types.map(t => t.type.name))
            .then(result => { if (!cancelled) setWeaknesses(result); })
            .catch(err => {
                console.error('Error al calcular debilidades:', err);
                if (!cancelled) setWeaknesses(null);
            });
        return () => { cancelled = true; };
    }, [pokemon?.id]);

    // Cuando esta vista se muestra a pantalla completa (ruta /pokemon/:id, sin modal
    // encima), el header no tiene fondo propio y deja ver el patrón de pokebolas del
    // body. Mientras se está viendo un Pokémon, reemplazamos ese fondo por el color de
    // su tipo para que el header se integre con el degradado del panel, sin costura.
    const currentMainType = pokemon?.types?.[0]?.type?.name;
    useEffect(() => {
        if (idPokemon || !currentMainType) return;
        document.body.style.backgroundColor = `var(--color-${currentMainType})`;
        document.body.style.backgroundImage = 'none';
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
        };
    }, [idPokemon, currentMainType]);

    // Datos de especie (compartidos por la descripción Pokédex y las formas alternativas).
    const [speciesData, setSpeciesData] = useState(null);
    useEffect(() => {
        if (!pokemon?.species?.url) return;
        let cancelled = false;
        setSpeciesData(null);
        fetch(pokemon.species.url)
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar datos de especie');
                return res.json();
            })
            .then(data => { if (!cancelled) setSpeciesData(data); })
            .catch(err => {
                console.error(err);
                if (!cancelled) setSpeciesData(null);
            });
        return () => { cancelled = true; };
    }, [pokemon?.species?.url]);

    const flavorText = useMemo(() => {
        if (!speciesData) return null;
        const entries = speciesData.flavor_text_entries || [];
        const chosen = entries.find(e => e.language.name === 'es') || entries.find(e => e.language.name === 'en');
        if (!chosen) return null;
        return chosen.flavor_text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
    }, [speciesData]);

    // Sprite shiny: se resetea cada vez que cambia el Pokémon mostrado.
    const [showShiny, setShowShiny] = useState(false);
    useEffect(() => { setShowShiny(false); }, [pokemon?.id]);

    if (loading) return <Loader />;

    const mainType = pokemon.types[0].type.name;
    const hasShiny = Boolean(pokemon?.sprites?.other?.home?.front_shiny);
    const displayedSprite = (showShiny && hasShiny)
        ? pokemon.sprites.other.home.front_shiny
        : pokemon.sprites.other.home.front_default;

    // Cuando no llega idPokemon por prop, este componente está montado directamente
    // por la ruta /pokemon/:id (sin modal encima) y debe ocupar toda la pantalla.
    const isFullPage = !idPokemon;
    // A pantalla completa, el contenido legible se centra en un ancho cómodo
    // (igual que ".container" en el resto del sitio) en vez de quedar como una
    // columna angosta perdida en una pantalla ancha.
    const contentWidthSx = isFullPage ? { width: '100%', maxWidth: '1200px', mx: 'auto' } : {};

    const pokemonName = primerMayuscula(pokemon.name);
    const pokemonTypeNames = pokemon.types.map(type => type.type.name);
    const canonicalUrl = `https://pokedex.fabrizziodev.com/pokemon/${pokemon.id}`;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: pokemonName,
        identifier: String(pokemon.id),
        description: `${pokemonName} es un Pokémon de tipo ${pokemonTypeNames.join(', ')}.`,
        image: pokemon.sprites.other.home.front_default,
        additionalProperty: pokemon.stats.map(stat => ({
            '@type': 'PropertyValue',
            name: statNames[stat.stat.name] || stat.stat.name,
            value: stat.base_stat,
        })),
    };

    return (
        <>
        <Helmet>
            <title>{`${pokemonName} (#${pokemon.id}) — Pokedex`}</title>
            <meta name="description" content={`${pokemonName}: tipo ${pokemonTypeNames.join(' / ')}, estadísticas base, habilidades y cadena evolutiva.`} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content={`${pokemonName} — Pokedex`} />
            <meta property="og:description" content={`Estadísticas, tipo y habilidades de ${pokemonName}.`} />
            <meta property="og:image" content={pokemon.sprites.other.home.front_default} />
            <meta property="og:url" content={canonicalUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
        <Box
            sx={{
                height: '100%',
                minHeight: isFullPage ? '100vh' : undefined,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                // overflow: 'hidden',
                borderRadius: isFullPage ? 0 : '15px',
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
                    // En pantalla completa "30%" queda relativo a un contenedor sin
                    // altura fija y no se pinta bien; usamos una altura en vh, que
                    // siempre es un valor real sin importar el contenedor padre.
                    height: isFullPage ? '45vh' : '30%', // Reducido del 45% anterior
                    background: `linear-gradient(to bottom, var(--color-${mainType}), rgba(255,255,255,0.7))`,
                    zIndex: 0,
                }}
            />
            
            {/* Botón para cerrar el modal */}
            <IconButton
                onClick={handleClose}
                aria-label="Volver"
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
                    ...contentWidthSx,
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
                        src={displayedSprite}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                        <IconButton
                            size="small"
                            onClick={() => toggleFavorite(pokemon)}
                            aria-label={isFavorite(pokemon.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                            sx={{ mb: 0.5 }}
                        >
                            {isFavorite(pokemon.id)
                                ? <FavoriteIcon sx={{ color: '#cc0000' }} />
                                : <FavoriteBorderIcon sx={{ color: '#999' }} />}
                        </IconButton>
                    </Box>

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

                    {/* Sonido y sprite shiny */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        {pokemon.cries?.latest && (
                            <IconButton
                                size="small"
                                aria-label={`Reproducir sonido de ${primerMayuscula(pokemon.name)}`}
                                onClick={() => { new Audio(pokemon.cries.latest).play().catch(() => {}); }}
                                sx={{
                                    bgcolor: `var(--color-${mainType})`,
                                    color: '#fff',
                                    width: 24,
                                    height: 24,
                                    '&:hover': { opacity: 0.85, bgcolor: `var(--color-${mainType})` }
                                }}
                            >
                                <VolumeUpIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                        )}
                        <Tooltip title={hasShiny ? (showShiny ? 'Ver sprite normal' : 'Ver sprite shiny') : 'Sin sprite shiny disponible'}>
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={!hasShiny}
                                    aria-label="Alternar sprite shiny"
                                    onClick={() => setShowShiny(s => !s)}
                                    sx={{ width: 24, height: 24 }}
                                >
                                    <AutoAwesomeIcon sx={{ fontSize: '0.9rem', color: showShiny ? 'var(--color-warning)' : '#999' }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>

                    {/* Formas alternativas / regionales */}
                    {speciesData?.varieties?.length > 1 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {speciesData.varieties.map(variety => (
                                <Chip
                                    key={variety.pokemon.name}
                                    label={primerMayuscula(variety.pokemon.name)}
                                    size="small"
                                    clickable
                                    onClick={() => handleSelectPokemon(variety.pokemon.name)}
                                    variant={variety.pokemon.name === pokemon.name ? 'filled' : 'outlined'}
                                    sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        borderColor: `var(--color-${mainType})`,
                                        ...(variety.pokemon.name === pokemon.name && {
                                            bgcolor: `var(--color-${mainType})`,
                                            color: '#fff'
                                        })
                                    }}
                                />
                            ))}
                        </Box>
                    )}

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
                                component="h3"
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
                                component="h3"
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

                        {/* Sección 3: Descripción Pokédex */}
                        {flavorText && (
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
                                    component="h3"
                                    sx={{
                                        fontSize: { xs: '0.75rem', md: '0.95rem' },
                                        fontWeight: 700,
                                        mb: 0,
                                        color: '#333',
                                        borderBottom: `1px solid rgba(var(--color-${mainType}-rgb), 0.2)`,
                                        pb: 0.5
                                    }}
                                >
                                    Descripción
                                </Typography>
                                <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' }, color: '#555', pt: 0.5 }}>
                                    {flavorText}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Panel de estadísticas - ahora más arriba en el diseño */}
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: '#fff',
                    borderRadius: isFullPage ? 0 : '15px 15px 0 0',
                    position: 'relative',
                    zIndex: 2,
                    mt: { xs: 1, md: 1 },
                    px: { xs: 2, md: 3 },
                    pt: { xs: 1.5, md: 0 },
                    pb: { xs: 1, md: 1.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    ...contentWidthSx,
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
                        <StatBar
                            key={index}
                            icon={statIcons[stat.stat.name]}
                            label={statNames[stat.stat.name] || primerMayuscula(stat.stat.name)}
                            value={stat.base_stat}
                            mainType={mainType}
                        />
                    ))}

                    {/* Debilidades y resistencias */}
                    {weaknesses && Object.values(weaknesses).some(list => list.length > 0) && (
                        <Box sx={{
                            mt: 1,
                            pt: 1,
                            borderTop: `1px dashed rgba(var(--color-${mainType}-rgb), 0.3)`,
                        }}>
                            <Typography
                                variant="subtitle2"
                                component="h3"
                                sx={{ textAlign: 'center', fontSize: { xs: '0.8rem', md: '0.9rem' }, fontWeight: 700, mb: 0.2, color: '#444' }}
                            >
                                Debilidades y resistencias
                            </Typography>
                            <Typography sx={{ textAlign: 'center', fontSize: '0.65rem', color: '#888', mb: 1 }}>
                                Cuánto daño recibe este Pokémon al ser atacado por cada tipo
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {[
                                    { key: 'x4', label: 'Muy débil contra' },
                                    { key: 'x2', label: 'Débil contra' },
                                    { key: 'x0_5', label: 'Resiste' },
                                    { key: 'x0_25', label: 'Resiste mucho' },
                                    { key: 'x0', label: 'Inmune a' },
                                ].filter(({ key }) => weaknesses[key].length > 0).map(({ key, label }) => (
                                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', minWidth: 80 }}>
                                            {label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {weaknesses[key].map(typeName => (
                                                <Chip
                                                    key={typeName}
                                                    label={primerMayuscula(typeName)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `var(--color-${typeName})`,
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        fontSize: '0.65rem',
                                                        height: 20
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Sección de árbol de evoluciones */}
                    <Box sx={{ 
                        mt: 1, 
                        pt: 1, 
                        borderTop: `1px dashed rgba(var(--color-${mainType}-rgb), 0.3)`,
                        position: 'relative'
                    }}>
                        <Typography
                            variant="subtitle2"
                            component="h3"
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
                        <EvolutionChain 
                            pokemonId={pokemon.id} 
                            mainType={mainType} 
                            onSelectPokemon={handleSelectPokemon} 
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
        </>
    );
};