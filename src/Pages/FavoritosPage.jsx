import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Chip, IconButton, Modal, Backdrop, Fade, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FavoritesContext } from '../Context/FavoritesContext';
import { PokemonPage, primerMayuscula } from './PokemonPage';

export const FavoritosPage = () => {
    const { favorites, toggleFavorite } = useContext(FavoritesContext);
    const [openId, setOpenId] = useState(null);

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
            <Helmet>
                <title>Mis favoritos — Pokedex</title>
                <meta name="description" content="Tus Pokémon favoritos guardados en esta Pokédex." />
            </Helmet>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Mis favoritos
            </Typography>

            {favorites.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#666' }}>
                    Aún no tienes favoritos. Marca Pokémon con la estrella desde la lista o su ficha de detalle.
                </Typography>
            ) : (
                <Box
                    component="section"
                    aria-label="Pokémon favoritos"
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 2,
                    }}
                >
                    {favorites.map(fav => {
                        const mainType = fav.types?.[0];
                        return (
                            <Box
                                key={fav.id}
                                onClick={() => setOpenId(fav.id)}
                                sx={{
                                    cursor: 'pointer',
                                    borderRadius: 3,
                                    p: 1.5,
                                    textAlign: 'center',
                                    position: 'relative',
                                    background: mainType
                                        ? `linear-gradient(180deg, rgba(var(--color-${mainType}-rgb), 0.15), #fff 60%)`
                                        : '#f5f5f5',
                                    border: mainType ? `1px solid rgba(var(--color-${mainType}-rgb), 0.3)` : '1px solid #eee',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' }
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }}
                                    aria-label="Quitar de favoritos"
                                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
                                >
                                    <FavoriteIcon sx={{ color: '#cc0000', fontSize: '1rem' }} />
                                </IconButton>
                                <Box component="img" src={fav.sprite} alt={fav.name} sx={{ width: '80%', maxWidth: 100, mx: 'auto', display: 'block' }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mt: 0.5 }}>
                                    {primerMayuscula(fav.name)}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                    {(fav.types || []).map(typeName => (
                                        <Chip
                                            key={typeName}
                                            label={primerMayuscula(typeName)}
                                            size="small"
                                            sx={{ backgroundColor: `var(--color-${typeName})`, color: '#fff', fontSize: '0.6rem', height: 18 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Modal
                open={openId !== null}
                onClose={() => setOpenId(null)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Fade in={openId !== null}>
                    <Box
                        sx={{
                            outline: 'none',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '92%', sm: '90%', md: '650px' },
                            maxHeight: '85vh',
                            borderRadius: '15px',
                            overflow: { xs: 'auto', sm: 'auto', md: 'visible' },
                            WebkitOverflowScrolling: 'touch',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                            zIndex: 9999,
                        }}
                    >
                        {openId !== null && (
                            <PokemonPage idPokemon={openId} onClose={() => setOpenId(null)} />
                        )}
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};
