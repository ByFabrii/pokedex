import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CardPokemon } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';

export const SearchPage = () => {
    const location = useLocation();
    const { globalPokemons, loading } = useContext(PokemonContext);

	const filteredPokemons = globalPokemons.filter(pokemon =>
		pokemon.name.includes(location.state.toLowerCase().trim())
	);

    return (
		<div className='container'>
			<p className='p-search'>
				Se encontraron <span>{filteredPokemons.length}</span>{' '}
				resultados:
			</p>
			<div className='card-list-pokemon container'>
				{filteredPokemons.map(pokemon => (
					<CardPokemon pokemon={pokemon} key={pokemon.id} />
				))}
			</div>
		</div>
	);
};
