import { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Badge, Box, IconButton } from '@mui/material';
// import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Comparador desactivado por ahora
import FavoriteIcon from '@mui/icons-material/Favorite';
import logo from '../assets/poke.png'
import { Searcher } from './Searcher';
import { FavoritesContext } from '../Context/FavoritesContext';

export const Navigation = () => {
	const { favorites } = useContext(FavoritesContext);
	return (
		<>
			<header className='container'>
				<Link to='/' className='logo'>
					<img
						src={logo}
						alt='Logo Pokedex'
					/>
				</Link>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<nav aria-label="Buscar Pokémon">
						<Searcher />
					</nav>
					<Link to='/favoritos' aria-label="Mis favoritos">
						<Badge badgeContent={favorites.length} color="error" max={99} invisible={favorites.length === 0}>
							<IconButton sx={{ color: '#cc0000' }}>
								<FavoriteIcon />
							</IconButton>
						</Badge>
					</Link>
					{/* Comparador desactivado por ahora (ver ComparadorPage.jsx y AppRouter.jsx)
					<Link to='/comparar' aria-label="Comparador de Pokémon">
						<IconButton sx={{ color: '#666' }}>
							<CompareArrowsIcon />
						</IconButton>
					</Link>
					*/}
				</Box>
			</header>
			<main>
				<Outlet />
			</main>
		</>
	);
};