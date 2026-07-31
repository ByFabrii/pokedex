import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Chip, Grid, IconButton, InputBase, Paper, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { PokemonContext } from '../Context/PokemonContext';
import { StatBar } from '../Components/StatBar';
import { statIcons, statNames } from '../utils/statMeta';
import { getTypeEffectiveness } from '../utils/typeEffectiveness';
import { primerMayuscula } from './PokemonPage';

const MAX_SLOTS = 4;
let nextSlotId = 1;
const createSlot = () => ({ id: nextSlotId++, query: '', pokemon: null, error: null, loading: false });

const SlotPicker = ({ slot, onQueryChange, onSubmit, onPick, onClear, suggestions }) => {
    if (slot.pokemon) {
        return (
            <Chip
                avatar={<Box component="img" src={slot.pokemon.sprites.other.home.front_default} alt={slot.pokemon.name} sx={{ borderRadius: '50%' }} />}
                label={primerMayuscula(slot.pokemon.name)}
                onDelete={onClear}
                sx={{ fontSize: '0.9rem', height: 36 }}
            />
        );
    }

    return (
        <Box sx={{ position: 'relative', width: { xs: '100%', sm: 220 } }}>
            <Paper
                component="form"
                onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ddd',
                    borderRadius: '20px',
                    px: 1,
                }}
            >
                <InputBase
                    placeholder="Nombre o número"
                    value={slot.query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    sx={{ flex: 1, fontSize: '0.85rem', py: 0.5 }}
                />
                <IconButton type="submit" size="small" aria-label="Buscar">
                    {slot.loading ? <ClearIcon sx={{ opacity: 0.3 }} /> : <SearchIcon fontSize="small" />}
                </IconButton>
            </Paper>
            {slot.error && (
                <Typography sx={{ color: '#c62828', fontSize: '0.7rem', mt: 0.3 }}>{slot.error}</Typography>
            )}
            {suggestions.length > 0 && (
                <Paper elevation={3} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, mt: 0.5, maxHeight: 200, overflow: 'auto' }}>
                    {suggestions.map(p => (
                        <Box
                            key={p.id}
                            onClick={() => onPick(p)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                        >
                            <Box component="img" src={p.sprites?.other?.home?.front_default} alt={p.name} sx={{ width: 28, height: 28 }} />
                            <Typography sx={{ fontSize: '0.8rem' }}>{primerMayuscula(p.name)}</Typography>
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
};

export const ComparadorPage = () => {
    const { getPokemonByID, allPokemons } = useContext(PokemonContext);
    const [slots, setSlots] = useState(() => [createSlot(), createSlot()]);
    const [weaknessesById, setWeaknessesById] = useState({});

    const updateSlot = (id, patch) => {
        setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    };

    const suggestionsFor = (query) => {
        const term = query.trim().toLowerCase();
        if (!term) return [];
        return allPokemons
            .filter(p => p.name.toLowerCase().includes(term))
            .slice(0, 6);
    };

    const selectPokemon = (slotId, pokemon) => {
        updateSlot(slotId, { pokemon, query: '', error: null, loading: false });
    };

    const handleSubmit = async (slot) => {
        if (!slot.query.trim()) return;
        const term = slot.query.trim().toLowerCase();
        const localMatch = allPokemons.find(p => p.name.toLowerCase() === term) || allPokemons.find(p => p.name.toLowerCase().startsWith(term));
        if (localMatch) {
            selectPokemon(slot.id, localMatch);
            return;
        }
        updateSlot(slot.id, { loading: true, error: null });
        try {
            const data = await getPokemonByID(term);
            selectPokemon(slot.id, data);
        } catch (err) {
            updateSlot(slot.id, { loading: false, error: 'No se encontró ese Pokémon' });
        }
    };

    const addSlot = () => setSlots(prev => [...prev, createSlot()]);
    const removeSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));
    const clearSlot = (id) => updateSlot(id, { pokemon: null, query: '', error: null });

    // Debilidades de cada Pokémon seleccionado.
    useEffect(() => {
        slots.forEach(slot => {
            if (!slot.pokemon || weaknessesById[slot.pokemon.id]) return;
            getTypeEffectiveness(slot.pokemon.types.map(t => t.type.name))
                .then(result => setWeaknessesById(prev => ({ ...prev, [slot.pokemon.id]: result })))
                .catch(err => console.error('Error al calcular debilidades:', err));
        });
    }, [slots]);

    const selectedPokemons = slots.filter(s => s.pokemon);

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
            <Helmet>
                <title>Comparador de Pokémon — Pokedex</title>
                <meta name="description" content="Compara estadísticas, tipos y debilidades entre dos o más Pokémon." />
            </Helmet>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                Comparador de Pokémon
            </Typography>
            <Typography sx={{ textAlign: 'center', color: '#666', mb: 3 }}>
                Busca dos o más Pokémon por nombre o número para verlos lado a lado.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 4 }}>
                {slots.map(slot => (
                    <Box key={slot.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                        <SlotPicker
                            slot={slot}
                            suggestions={suggestionsFor(slot.query)}
                            onQueryChange={(query) => updateSlot(slot.id, { query, error: null })}
                            onSubmit={() => handleSubmit(slot)}
                            onPick={(p) => selectPokemon(slot.id, p)}
                            onClear={() => clearSlot(slot.id)}
                        />
                        {slots.length > 2 && (
                            <IconButton size="small" onClick={() => removeSlot(slot.id)} aria-label="Quitar espacio">
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ))}
                {slots.length < MAX_SLOTS && (
                    <IconButton onClick={addSlot} aria-label="Agregar otro Pokémon" sx={{ border: '1px dashed #ccc' }}>
                        <AddIcon />
                    </IconButton>
                )}
            </Box>

            {selectedPokemons.length < 2 ? (
                <Typography sx={{ textAlign: 'center', color: '#999' }}>
                    Selecciona al menos 2 Pokémon para compararlos.
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {selectedPokemons.map(({ id: slotId, pokemon }) => {
                        const weaknesses = weaknessesById[pokemon.id];
                        const mainType = pokemon.types[0].type.name;
                        return (
                            <Grid item xs={12} sm={6} md={12 / Math.min(selectedPokemons.length, 4)} key={slotId}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        background: `linear-gradient(180deg, rgba(var(--color-${mainType}-rgb), 0.15), #fff 40%)`,
                                        border: `1px solid rgba(var(--color-${mainType}-rgb), 0.3)`,
                                        height: '100%'
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={pokemon.sprites.other.home.front_default}
                                        alt={`Pokemon ${pokemon.name}`}
                                        sx={{ width: '100%', maxWidth: 140, display: 'block', mx: 'auto' }}
                                    />
                                    <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700 }}>
                                        {primerMayuscula(pokemon.name)} (#{pokemon.id})
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                                        {pokemon.types.map(t => (
                                            <Chip
                                                key={t.type.name}
                                                label={primerMayuscula(t.type.name)}
                                                size="small"
                                                sx={{ backgroundColor: `var(--color-${t.type.name})`, color: '#fff', fontWeight: 600 }}
                                            />
                                        ))}
                                    </Box>
                                    <Typography sx={{ textAlign: 'center', fontSize: '0.85rem', color: '#555', mb: 1.5 }}>
                                        {(pokemon.height / 10).toFixed(1)} m · {(pokemon.weight / 10).toFixed(1)} kg
                                    </Typography>

                                    {pokemon.stats.map((stat, index) => (
                                        <StatBar
                                            key={index}
                                            icon={statIcons[stat.stat.name]}
                                            label={statNames[stat.stat.name] || primerMayuscula(stat.stat.name)}
                                            value={stat.base_stat}
                                            mainType={mainType}
                                        />
                                    ))}

                                    {weaknesses && (weaknesses.x4.length > 0 || weaknesses.x2.length > 0) && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', mb: 0.5 }}>
                                                Débil contra
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {[...weaknesses.x4, ...weaknesses.x2].map(typeName => (
                                                    <Chip
                                                        key={typeName}
                                                        label={primerMayuscula(typeName)}
                                                        size="small"
                                                        sx={{ backgroundColor: `var(--color-${typeName})`, color: '#fff', fontSize: '0.65rem', height: 20 }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};
