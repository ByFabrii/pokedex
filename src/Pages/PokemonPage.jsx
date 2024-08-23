import React, { useContext, useEffect, useState } from 'react';
import { Loader } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';
import { primerMayuscula } from '../Helper/Helper';

export const PokemonPage = ({ idPokemon }) => {

	const { getPokemonByID } = useContext(PokemonContext);

	const [loading, setLoading] = useState(true);
	const [pokemon, setPokemon] = useState({});

	const fetchPokemon = async idPokemon => {
		const data = await getPokemonByID(idPokemon);
		setPokemon(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchPokemon(idPokemon);
	}, []);

	return (
		<main className='container main-pokemon'>
			{loading ? (
				<Loader />
			) : (
				<>
					<div className='header-main-pokemon'>
						<span className='number-pokemon'>#{pokemon.id}</span>
						<div className='container-img-pokemon'>
							<img
								src={pokemon.sprites.other.dream_world.front_default}
								alt={`Pokemon ${pokemon?.name}`}
							/>
						</div>

						<div className='container-info-pokemon'>
							<h1>{primerMayuscula(pokemon.name)}</h1>
							<div className='card-types info-pokemon-type'>
								{pokemon.types.map(type => (
									<span key={type.type.name} className={`${type.type.name}`}>
										{type.type.name}
									</span>
								))}
							</div>
							<div className='info-pokemon'>
								<div className='group-info'>
									<p>Altura</p>
									<span>{(pokemon.height / 10).toFixed(1)} mts</span>
								</div>
								<div className='group-info'>
									<p>Peso</p>
									<span>{(pokemon.weight / 10).toFixed(1)} KG</span>
								</div>
							</div>
						</div>
					</div>

					<div className='container-stats'>
						<div className='stats'>
							<h1 className='stats-title'>Estadísticas</h1>
							{pokemon.stats.map((stat, index) => (
								<div key={index} className='stat-group'>
									<span className='stat-name'>{primerMayuscula(stat.stat.name)}</span>
									<div className='progress-bar'>
									<div
										className={`progress-fill ${pokemon.types[0].type.name}`}
										style={{ width: `${stat.base_stat}%` }}
									></div>
								</div>
									
									<span className='counter-stat'>{stat.base_stat}</span>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</main>
	);
};
