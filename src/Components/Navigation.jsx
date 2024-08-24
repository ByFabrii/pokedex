import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/poke.png'
import { Searcher } from './Searcher';

export const Navigation = () => {
	return (
		<>
			<header className='container'>
				<Link to='/' className='logo'>
					<img
						src={logo}
						alt='Logo Pokedex'
					/>
				</Link>
				<Searcher />
			</header>
			<Outlet />
		</>
	);
};