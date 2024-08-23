




import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

export const CardPokemon = ({pokemon}) => {
  return (
    <Link to={`/pokemon/${pokemon.id}`}>
        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="280"
              image={pokemon.sprites.other.dream_world.front_default}
              alt={`Pokemon ${pokemon.name}`}
              className={'card-img'}
            />
            <CardContent>
            <Typography gutterBottom component="div">
              <span className='pokemon-id'>N° {pokemon.id}</span>
              <h3>{pokemon.name}</h3>
            </Typography>
              <div className='card-info'>
                <div className='card-types'>
                <Typography variant="body2" color="text.secondary">
                  {pokemon.types.map(type => (
                    <span key={type.type.name} className={type.type.name}>
                      {type.type.name}
                    </span>
                  ))}
                </Typography>
                </div>
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
    </Link>
  );
};