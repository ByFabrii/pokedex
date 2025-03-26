import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';

import { PokemonPage } from '../Pages/PokemonPage';

export const primerMayuscula = (word) => {
  return word[0].toUpperCase() + word.substring(1)
}

export const CardPokemon = ({ pokemon }) => {
  const [open, setOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef(null);
  
  const handleOpenModal = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const mainType = pokemon.types[0].type.name;

  // Opciones de imágenes (corregido el error de sintaxis con notación de corchetes)
  const imageOptions = {
    primary: pokemon.sprites.other.home.front_default,
    secondary: pokemon.sprites.other["official-artwork"]?.front_default,
    fallback: pokemon.sprites.front_default,
  };

  // Determinar qué imagen usar - siempre usar la misma imagen de alta calidad
  const getImageSource = () => {
    return pokemon.sprites.other.home.front_default || 
           pokemon.sprites.other["official-artwork"]?.front_default ||
           pokemon.sprites.front_default;
  };

  // Observador de intersección para carga lazy mejorado
  React.useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Aumentar el margen para precargar con más anticipación
        threshold: 0.1
      }
    );

    observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Precarga optimizada de imágenes
  React.useEffect(() => {
    if (!isVisible) return;
    
    const preloadImage = () => {
      // Solo precargar si no se ha cargado ya
      if (imageLoaded) return;
      
      const img = new Image();
      
      // Configurar primero los manejadores de eventos
      img.onload = () => {
        if (cardRef.current) { // Verificar que el componente sigue montado
          setImageLoaded(true);
          setImageError(false);
        }
      };
      
      img.onerror = () => {
        if (cardRef.current) { // Verificar que el componente sigue montado
          setImageError(true);
        }
      };
      
      // Añadir a la memoria caché del navegador para mejorar el rendimiento
      img.setAttribute('importance', 'high');
      img.src = getImageSource();
      
      // Solicitar que el navegador precargue esta imagen
      if ('fetchPriority' in img) {
        img.fetchPriority = 'high';
      }
    };
    
    // Iniciar precarga con un pequeño retraso para darle prioridad a los elementos visibles
    const timer = setTimeout(preloadImage, 100);
    
    return () => clearTimeout(timer);
  }, [isVisible, getImageSource]);

  return (
    <>
      <Card 
        ref={cardRef}
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
          
          {/* Imagen del Pokémon con estado de carga */}
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
            {isVisible ? (
              <>
                {!imageLoaded && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    width: '80%', 
                    height: '80%',
                    position: 'absolute',
                    top: '10%'
                  }}>
                    <Skeleton 
                      variant="rounded" 
                      animation="wave"
                      width="80%" 
                      height="80%" 
                      sx={{ 
                        bgcolor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                        borderRadius: '50%'
                      }} 
                    />
                  </Box>
                )}
                <CardMedia
                  component="img"
                  image={getImageSource()}
                  alt={`Pokemon ${pokemon.name}`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  sx={{ 
                    width: 'auto',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    transform: 'scale(1.2)',
                    marginTop: '-25px',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    // Añadir el decode="async" mediante style
                    ...(imageLoaded ? {} : { visibility: 'hidden' })
                  }}
                />
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%', 
                height: '100%' 
              }}>
                <Skeleton 
                  variant="rounded" 
                  width="60%" 
                  height="60%" 
                  sx={{ 
                    bgcolor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                    borderRadius: '50%'
                  }} 
                />
              </Box>
            )}
          </Box>

          {/* Resto del componente sin cambios */}
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

          <CardContent
            sx={{
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

      {/* Modal con carga diferida */}
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
              overflow: 'visible',
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