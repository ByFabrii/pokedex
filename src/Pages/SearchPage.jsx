import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CardPokemon } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';

export const SearchPage = () => {
    const location = useLocation();
    const { searchPokemonByName, globalPokemons, loading } = useContext(PokemonContext);

    useEffect(() => {
        if (location.state) {
            searchPokemonByName(location.state);  // Realiza la búsqueda cuando se carga la página
        }
    }, [location.state]);

    return (
        <div className='container'>
            <p className='p-search'>
                {loading ? 'Buscando...' : `Se encontraron ${globalPokemons.length} resultados:`}
            </p>
            <div className='card-list-pokemon container'>
                {globalPokemons.map(pokemon => (
                    <CardPokemon pokemon={pokemon} key={pokemon.id} />
                ))}
            </div>
        </div>
    );
};
