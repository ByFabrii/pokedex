import React, { useContext, useState, useEffect } from 'react';
import { PokemonContext } from '../Context/PokemonContext';
import {
    Box,
    Drawer,
    Typography,
    IconButton,
    Divider,
    FormControlLabel,
    Checkbox,
    Chip,
    Button,
    Paper,
    Badge,
    Avatar,
    CircularProgress,
    Tooltip,
    Tab,
    Tabs,
    Grid,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DoneIcon from '@mui/icons-material/Done';
import CategoryIcon from '@mui/icons-material/Category';
import { primerMayuscula } from '../Pages/PokemonPage';

// Definición de colores de tipos para el filtro con iconos más modernos
const typeIcons = {
    bug: '🐛',
    dark: '🌑',
    dragon: '🐉',
    electric: '⚡',
    fairy: '✨',
    fighting: '👊',
    fire: '🔥',
    flying: '🦅',
    ghost: '👻',
    grass: '🌿',
    ground: '🌍',
    ice: '❄️',
    normal: '⭐',
    poison: '☠️',
    psychic: '🔮',
    rock: '🪨',
    steel: '⚙️',
    water: '💧',
};

export const FilterBar = () => {
    const { active, handleCheckbox, setActive, type, filteredPokemons, loadingFilter } = useContext(PokemonContext);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [isApplying, setIsApplying] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [animateItems, setAnimateItems] = useState({});

    // Mantener un registro de los tipos seleccionados para UI
    const handleTypeSelect = (e) => {
        const { name, checked } = e.target;
    
        // Actualizar la lista local de tipos seleccionados
        let newSelectedTypes;
        if (checked) {
            newSelectedTypes = [...selectedTypes, name];
            setSelectedTypes(newSelectedTypes);
            setSelectedCount(prev => prev + 1);
    
            // Animar el elemento seleccionado
            setAnimateItems(prev => ({
                ...prev,
                [name]: true
            }));
    
            setTimeout(() => {
                setAnimateItems(prev => ({
                    ...prev,
                    [name]: false
                }));
            }, 500);
        } else {
            newSelectedTypes = selectedTypes.filter(type => type !== name);
            setSelectedTypes(newSelectedTypes);
            setSelectedCount(prev => prev - 1);
        }
    
        // Llamar al manejador original
        handleCheckbox(e);
    };

    // Función para limpiar todos los filtros
    const clearFilters = () => {
        // Limpiar estado local
        setSelectedTypes([]);
        setSelectedCount(0);

        // Desmarcar todos los checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.checked = false;
                // Disparar evento de cambio para cada checkbox
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            }
        });
    };

    // Efecto de animación al aplicar filtros
    const handleApplyFilters = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            setActive(false);
        }, 500);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Agrupar tipos por categorías
    const typeCategories = {
        elemental: ['fire', 'water', 'grass', 'electric', 'ice'],
        physical: ['normal', 'fighting', 'rock', 'ground', 'steel'],
        special: ['psychic', 'ghost', 'dark', 'fairy', 'dragon'],
        natural: ['poison', 'bug', 'flying']
    };

    return (
        <>
            {/* Botón flotante con indicador de filtros activos */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000
                }}
            >
                <Badge
                    badgeContent={selectedCount}
                    color="error"
                    invisible={selectedCount === 0}
                >
                    <Button
                        variant="contained"
                        startIcon={<FilterAltIcon />}
                        onClick={() => setActive(true)}
                        sx={{
                            bgcolor: 'var(--color-warning)',
                            borderRadius: '50px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: '#c75900',
                            }
                        }}
                    >
                        Filtrar
                    </Button>
                </Badge>
            </Box>

            {/* Panel lateral de filtros con estilo de Pokédex */}
            <Drawer
                anchor="left"
                open={active}
                onClose={() => setActive(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: '30%' },
                        padding: 0,
                        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                        borderRight: '8px solid #cc0000', // Borde rojo estilo Pokédex
                        overflowX: 'hidden'
                    }
                }}
            >
                {/* Encabezado del panel estilo Pokédex */}
                <Box sx={{
                    bgcolor: '#cc0000',
                    py: 2,
                    px: 3,
                    minHeight: '71px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                    {/* Luces LED decorativas estilo Pokédex */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 15,
                        transform: 'translateY(-50%)',
                        width: 45,
                        height: 45,
                        borderRadius: '50%',
                        bgcolor: '#4aa5f0',
                        border: '3px solid white',
                        boxShadow: '0 0 15px #4aa5f0',
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        top: 10,
                        left: 75,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#ff0000',
                        border: '1px solid white',
                        boxShadow: '0 0 8px #ff0000',
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        top: 10,
                        left: 95,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#ffcc00',
                        border: '1px solid white',
                        boxShadow: '0 0 8px #ffcc00',
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        top: 10,
                        left: 115,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#33cc33',
                        border: '1px solid white',
                        boxShadow: '0 0 8px #33cc33',
                        display: { xs: 'none', sm: 'block' }
                    }} />

                    <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        ml: { xs: 0, sm: 20 },
                        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        Filtros Pokédex
                    </Typography>

                    <IconButton
                        onClick={() => setActive(false)}
                        aria-label="cerrar filtros"
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.3)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Pantalla de la Pokédex con fondo cuadriculado */}
                <Box sx={{
                    bgcolor: '#f8f8f8',
                    m: 2,
                    borderRadius: 2,
                    border: '5px solid #333',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                    position: 'relative',
                    backgroundImage: 'linear-gradient(rgba(180,180,180,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180,180,180,.2) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    height: 'calc(100% - 180px)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Chips de tipos seleccionados */}
                    {selectedCount > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                m: 2,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FilterAltIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                <strong>{`${selectedCount} ${selectedCount === 1 ? 'tipo' : 'tipos'} seleccionado${selectedCount === 1 ? '' : 's'}`}</strong>
                            </Typography>

                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selectedTypes.map(typeName => (
                                    <Chip
                                        key={typeName}
                                        label={primerMayuscula(typeName)}
                                        size="small"
                                        avatar={<Avatar>{typeIcons[typeName]}</Avatar>}
                                        sx={{
                                            backgroundColor: `var(--color-${typeName})`,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '0.7rem',
                                            pl: 0
                                        }}
                                        onDelete={() => {
                                            // Simular clic en el checkbox correspondiente
                                            const checkbox = document.getElementById(typeName);
                                            if (checkbox) {
                                                checkbox.click();
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Navegación por pestañas */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            sx={{
                                '& .MuiTab-root': {
                                    fontWeight: 'bold',
                                    color: '#555',
                                    '&.Mui-selected': { color: '#cc0000' }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#cc0000'
                                }
                            }}
                        >
                            <Tab label="Todos" />
                            <Tab label="Elementales" />
                            <Tab label="Físicos" />
                            <Tab label="Especiales" />
                            <Tab label="Naturales" />
                        </Tabs>
                    </Box>

                    {/* Contenido de las pestañas */}
                    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                        {/* Pestaña "Todos" */}
                        {tabValue === 0 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#555',
                                    fontWeight: 'bold',
                                    mb: 1,
                                    minHeight: '24px' // Esto fuerza una altura mínima consistente
                                }}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                    Todos los tipos
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {type.map((tipo) => (
                                        <Grid item xs={6} sm={4} key={tipo.name}>
                                            <Tooltip title={`Pokémon tipo ${primerMayuscula(tipo.name)}`} arrow>
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s',
                                                        transform: animateItems[tipo.name] ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name={tipo.name}
                                                                id={tipo.name}
                                                                onChange={handleTypeSelect}
                                                                checked={selectedTypes.includes(tipo.name)}
                                                                icon={<Box sx={{ p: 0.8 }} />}
                                                                checkedIcon={
                                                                    <DoneIcon sx={{
                                                                        color: 'white',
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                                        borderRadius: '50%',
                                                                        padding: '2px',
                                                                        fontSize: '1rem',
                                                                        zIndex: 3
                                                                    }} />
                                                                }
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    m: 0,
                                                                    zIndex: 10,
                                                                    opacity: 0,
                                                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, width: '100%', height: '100%' }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            bgcolor: `var(--color-${tipo.name})`,
                                                            color: 'white',
                                                            p: 1.5,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minHeight: '80px',
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                            },
                                                            '&:hover:after': {
                                                                opacity: 1
                                                            },
                                                            '.Mui-checked ~ &': {
                                                                '&:before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'rgba(0,0,0,0.15)',
                                                                    zIndex: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '1.8rem',
                                                                mb: 0.5,
                                                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                                            }}
                                                        >
                                                            {typeIcons[tipo.name] || '🔍'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                                fontSize: '0.85rem',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {primerMayuscula(tipo.name)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Pestaña "Elementales" */}
                        {tabValue === 1 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#555',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                    Tipos elementales
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {type
                                        .filter(tipo => typeCategories.elemental.includes(tipo.name))
                                        .map((tipo) => (
                                            <Grid item xs={6} sm={4} key={tipo.name}>
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s',
                                                        transform: animateItems[tipo.name] ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name={tipo.name}
                                                                id={tipo.name}
                                                                onChange={handleTypeSelect}
                                                                checked={selectedTypes.includes(tipo.name)}
                                                                icon={<Box sx={{ p: 0.8 }} />}
                                                                checkedIcon={
                                                                    <DoneIcon sx={{
                                                                        color: 'white',
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                                        borderRadius: '50%',
                                                                        padding: '2px',
                                                                        fontSize: '1rem',
                                                                        zIndex: 3
                                                                    }} />
                                                                }
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    m: 0,
                                                                    zIndex: 10,
                                                                    opacity: 0,
                                                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, width: '100%', height: '100%' }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            bgcolor: `var(--color-${tipo.name})`,
                                                            color: 'white',
                                                            p: 1.5,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minHeight: '80px',
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                            },
                                                            '&:hover:after': {
                                                                opacity: 1
                                                            },
                                                            '.Mui-checked ~ &': {
                                                                '&:before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'rgba(0,0,0,0.15)',
                                                                    zIndex: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '1.8rem',
                                                                mb: 0.5,
                                                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                                            }}
                                                        >
                                                            {typeIcons[tipo.name] || '🔍'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                                fontSize: '0.85rem',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {primerMayuscula(tipo.name)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Pestaña "Físicos" */}
                        {tabValue === 2 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#555',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                    Tipos físicos
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {type
                                        .filter(tipo => typeCategories.physical.includes(tipo.name))
                                        .map((tipo) => (
                                            <Grid item xs={6} sm={4} key={tipo.name}>
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s',
                                                        transform: animateItems[tipo.name] ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name={tipo.name}
                                                                id={tipo.name}
                                                                onChange={handleTypeSelect}
                                                                checked={selectedTypes.includes(tipo.name)}
                                                                icon={<Box sx={{ p: 0.8 }} />}
                                                                checkedIcon={
                                                                    <DoneIcon sx={{
                                                                        color: 'white',
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                                        borderRadius: '50%',
                                                                        padding: '2px',
                                                                        fontSize: '1rem',
                                                                        zIndex: 3
                                                                    }} />
                                                                }
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    m: 0,
                                                                    zIndex: 10,
                                                                    opacity: 0,
                                                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, width: '100%', height: '100%' }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            bgcolor: `var(--color-${tipo.name})`,
                                                            color: 'white',
                                                            p: 1.5,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minHeight: '80px',
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                            },
                                                            '&:hover:after': {
                                                                opacity: 1
                                                            },
                                                            '.Mui-checked ~ &': {
                                                                '&:before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'rgba(0,0,0,0.15)',
                                                                    zIndex: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '1.8rem',
                                                                mb: 0.5,
                                                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                                            }}
                                                        >
                                                            {typeIcons[tipo.name] || '🔍'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                                fontSize: '0.85rem',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {primerMayuscula(tipo.name)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Pestaña "Especiales" */}
                        {tabValue === 3 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#555',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                    Tipos especiales
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {type
                                        .filter(tipo => typeCategories.special.includes(tipo.name))
                                        .map((tipo) => (
                                            <Grid item xs={6} sm={4} key={tipo.name}>
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s',
                                                        transform: animateItems[tipo.name] ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name={tipo.name}
                                                                id={tipo.name}
                                                                onChange={handleTypeSelect}
                                                                checked={selectedTypes.includes(tipo.name)}
                                                                icon={<Box sx={{ p: 0.8 }} />}
                                                                checkedIcon={
                                                                    <DoneIcon sx={{
                                                                        color: 'white',
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                                        borderRadius: '50%',
                                                                        padding: '2px',
                                                                        fontSize: '1rem',
                                                                        zIndex: 3
                                                                    }} />
                                                                }
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    m: 0,
                                                                    zIndex: 10,
                                                                    opacity: 0,
                                                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, width: '100%', height: '100%' }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            bgcolor: `var(--color-${tipo.name})`,
                                                            color: 'white',
                                                            p: 1.5,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minHeight: '80px',
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                            },
                                                            '&:hover:after': {
                                                                opacity: 1
                                                            },
                                                            '.Mui-checked ~ &': {
                                                                '&:before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'rgba(0,0,0,0.15)',
                                                                    zIndex: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '1.8rem',
                                                                mb: 0.5,
                                                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                                            }}
                                                        >
                                                            {typeIcons[tipo.name] || '🔍'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                                fontSize: '0.85rem',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {primerMayuscula(tipo.name)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Pestaña "Naturales" */}
                        {tabValue === 4 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Typography variant="subtitle2" sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: '#555',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#cc0000' }} />
                                    Tipos naturales
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {type
                                        .filter(tipo => typeCategories.natural.includes(tipo.name))
                                        .map((tipo) => (
                                            <Grid item xs={6} sm={4} key={tipo.name}>
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        transition: 'all 0.3s',
                                                        transform: animateItems[tipo.name] ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name={tipo.name}
                                                                id={tipo.name}
                                                                onChange={handleTypeSelect}
                                                                checked={selectedTypes.includes(tipo.name)}
                                                                icon={<Box sx={{ p: 0.8 }} />}
                                                                checkedIcon={
                                                                    <DoneIcon sx={{
                                                                        color: 'white',
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                                        borderRadius: '50%',
                                                                        padding: '2px',
                                                                        fontSize: '1rem',
                                                                        zIndex: 3
                                                                    }} />
                                                                }
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    m: 0,
                                                                    zIndex: 10,
                                                                    opacity: 0,
                                                                    '& .MuiSvgIcon-root': { fontSize: 16 }
                                                                }}
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0, width: '100%', height: '100%' }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            bgcolor: `var(--color-${tipo.name})`,
                                                            color: 'white',
                                                            p: 1.5,
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minHeight: '80px',
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                            },
                                                            '&:hover:after': {
                                                                opacity: 1
                                                            },
                                                            '.Mui-checked ~ &': {
                                                                '&:before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: 'rgba(0,0,0,0.15)',
                                                                    zIndex: 1
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '1.8rem',
                                                                mb: 0.5,
                                                                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                                                            }}
                                                        >
                                                            {typeIcons[tipo.name] || '🔍'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize',
                                                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                                                fontSize: '0.85rem',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {primerMayuscula(tipo.name)}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Resumen de resultados */}
                        {selectedCount > 0 && (
                            <Fade in={true}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        borderRadius: 2,
                                        borderLeft: '4px solid #cc0000',
                                        bgcolor: 'rgba(0, 0, 0, 0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {loadingFilter ? (
                                        <>
                                            <CircularProgress size={18} sx={{ color: '#cc0000', mr: 1.5 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                Buscando Pokémon...
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <CatchingPokemonIcon sx={{ color: '#cc0000', mr: 1 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {filteredPokemons.length} Pokémon{filteredPokemons.length !== 1 && 's'} encontrado{filteredPokemons.length !== 1 && 's'}
                                            </Typography>
                                        </>
                                    )}
                                </Paper>
                            </Fade>
                        )}
                    </Box>
                </Box>

                {/* Botones de la Pokédex */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 2,
                    bgcolor: '#e0e0e0',
                    borderTop: '3px solid #999'
                }}>
                    <Button
                        variant="contained"
                        onClick={clearFilters}
                        startIcon={<RestartAltIcon />}
                        disabled={selectedCount === 0}
                        sx={{
                            flex: 1,
                            bgcolor: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            borderRadius: '8px',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.4)'
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(0,0,0,0.1)',
                                color: 'rgba(255,255,255,0.4)'
                            }
                        }}
                    >
                        Limpiar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        endIcon={isApplying ? <CircularProgress size={16} color="inherit" /> : <FilterAltIcon />}
                        disabled={isApplying}
                        sx={{
                            flex: 2,
                            bgcolor: '#cc0000',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: '#aa0000'
                            }
                        }}
                    >
                        Aplicar filtros
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};