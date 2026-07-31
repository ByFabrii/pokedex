import React, { useContext } from 'react';
import { PokemonContext } from '../Context/PokemonContext';
import { CardPokemon } from './CardPokemon';
import { Loader } from './Loader';

export const PokemonList = () => {
	const { allPokemons, loading, filteredPokemons, loadingFilter } =
		useContext(PokemonContext);

	// Primera vez que se filtra: todavía no hay nada que mostrar, solo el loader.
	if (loadingFilter && filteredPokemons.length === 0) {
		return <Loader message="Buscando Pokémon del tipo seleccionado..." />;
	}

	return (
		<>
				{/* Ya hay resultados de un filtro anterior, pero se está actualizando (ej. se agregó otro tipo) */}
				{loadingFilter && <Loader message="Actualizando resultados..." />}
				<section aria-label="Resultados de Pokémon" className='card-list-pokemon container'>
					{filteredPokemons.length ? (
						<>
							{filteredPokemons.map(pokemon => (
								<CardPokemon pokemon={pokemon} key={pokemon.id} />
							))}
						</>
					) : (
						<>
							{allPokemons.map(pokemon => (
								<CardPokemon pokemon={pokemon} key={pokemon.id} />
							))}
						</>
					)}
				</section>
		</>
	);
};
