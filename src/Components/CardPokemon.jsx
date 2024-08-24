import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

import fondoIMG from '../assets/fondo.png';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { PokemonPage } from '../Pages/PokemonPage';

export const primerMayuscula = (word) => {
  return word[0].toUpperCase() + word.substring(1)
}


export const CardPokemon = ({ pokemon }) => {

  const [open, setOpen] = React.useState(false);
  const handleOpenModal = () => {
    setOpen(true)

  };
  const handleClose = () => setOpen(false);
  return (
    <>
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea onClick={handleOpenModal}>

          <CardMedia
            component="img"
            image={pokemon.sprites.other.dream_world.front_default}
            alt={`Pokemon ${pokemon.name}`}
            className={`card-img ${pokemon.types[0].type.name}`}
            sx={{ backgroundImage: `url(${fondoIMG})`, border: '0px !important' }}
          />

          <CardContent>
            <Typography gutterBottom component="div">
              <span className='pokemon-id'>N° {pokemon.id}</span>
              <h3>{primerMayuscula(pokemon.name)}</h3>
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

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box className={`box ${pokemon.types[0].type.name}`} >
            <PokemonPage idPokemon={pokemon.id} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
};