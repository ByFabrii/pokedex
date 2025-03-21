import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';

import fondoIMG from '../assets/fondo.png';
import { PokemonPage } from '../Pages/PokemonPage';

export const primerMayuscula = (word) => {
  return word[0].toUpperCase() + word.substring(1)
}

export const CardPokemon = ({ pokemon }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const mainType = pokemon.types[0].type.name;
  
  return (
    <>
      <Card 
        sx={{ 
          maxWidth: 345,
          position: 'relative',
          overflow: 'visible',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <CardActionArea 
          onClick={handleOpenModal}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Fondo de la imagen con degradado según el tipo */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '65%',
              borderRadius: '16px 16px 0 0',
              backgroundImage: `linear-gradient(to bottom, var(--color-${mainType}), rgba(255,255,255,0.7))`,
              opacity: 0.7,
              zIndex: 0
            }}
          />
          
          {/* Imagen del Pokémon */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              padding: '0',
              display: 'flex',
              justifyContent: 'center',
              height: '200px',
            }}
          >
            <CardMedia
              component="img"
              image={pokemon.sprites.other.home.front_default}
              alt={`Pokemon ${pokemon.name}`}
              sx={{ 
                width: 'auto',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                transform: 'scale(1.2)',
                marginTop: '-25px'
              }}
            />
          </Box>

          {/* Número del Pokémon (como una insignia) */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              color: '#666',
              zIndex: 2
            }}
          >
            #{pokemon.id.toString().padStart(3, '0')}
          </Box>

          {/* Contenido e información */}
          <CardContent
            sx={{
              backgroundColor: 'white',
              borderRadius: '20px 20px 16px 16px',
              marginTop: '-10px',
              position: 'relative',
              zIndex: 1,
              padding: '2px 1px 16px',
              flexGrow: 1
            }}
          >
            <Typography 
              variant="h5" 
              component="h3"
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 2
              }}
            >
              {primerMayuscula(pokemon.name)}
            </Typography>
            
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1
              }}
            >
              {pokemon.types.map(type => (
                <Typography 
                  key={type.type.name} 
                  variant="caption"
                  sx={{ 
                    backgroundColor: `var(--color-${type.type.name})`,
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 'medium',
                    textTransform: 'capitalize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {type.type.name}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>

      <Modal
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
          <Box 
            sx={{
              outline: 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: '650px' },
              maxHeight: { xs: '90vh', md: '85vh' },
              borderRadius: '15px',
              overflow: 'visible', // Mantener como 'visible'
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              zIndex: 9999,
            }}
          >
            <PokemonPage idPokemon={pokemon.id} onClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
};