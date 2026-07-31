import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

export const statIcons = {
    hp: <FavoriteIcon fontSize="small" sx={{ color: '#ff5959' }} />,
    attack: <BoltIcon fontSize="small" sx={{ color: '#f5ac78' }} />,
    defense: <ShieldIcon fontSize="small" sx={{ color: '#fae078' }} />,
    'special-attack': <AutoFixHighIcon fontSize="small" sx={{ color: '#9db7f5' }} />,
    'special-defense': <ShieldIcon fontSize="small" sx={{ color: '#a7db8d' }} />,
    speed: <CatchingPokemonIcon fontSize="small" sx={{ color: '#fa92b2' }} />
};

export const statNames = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp.',
    'special-defense': 'Defensa Esp.',
    speed: 'Velocidad'
};
