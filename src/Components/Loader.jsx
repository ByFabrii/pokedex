import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const Loader = ({ message = "Cargando Pokémon..." }) => {
	return (
    <Box 
      className="container-loader"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: 2
      }}
    >
      <CircularProgress 
        size={40} 
        sx={{ 
          color: 'var(--color-warning)'
        }} 
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  );
};
