import { useCallback, useEffect, useState } from 'react';
import { FavoritesContext } from './FavoritesContext';

const STORAGE_KEY = 'pokedexFavorites';

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch {
            // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora.
        }
    }, [favorites]);

    const isFavorite = useCallback(id => favorites.some(f => f.id === id), [favorites]);

    const toggleFavorite = useCallback((pokemon) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.id === pokemon.id);
            if (exists) return prev.filter(f => f.id !== pokemon.id);
            const minimal = {
                id: pokemon.id,
                name: pokemon.name,
                sprite: pokemon.sprites?.other?.home?.front_default || pokemon.sprites?.front_default || null,
                types: (pokemon.types || []).map(t => t.type.name),
            };
            return [...prev, minimal];
        });
    }, []);

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
