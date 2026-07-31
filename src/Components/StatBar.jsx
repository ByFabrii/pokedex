import { Box, Typography } from '@mui/material';

export const StatBar = ({ icon, label, value, mainType, maxValue = 100 }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            px: { xs: 0, md: 1 }
        }}
    >
        {/* Icono y nombre */}
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: { xs: '35%', md: '30%' },
                mr: 1
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: `rgba(var(--color-${mainType}-rgb), 0.1)`,
                mr: 0.7
            }}>
                {icon}
            </Box>
            <Typography
                sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.65rem', md: '0.95rem' },
                    color: '#555',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {label}
            </Typography>
        </Box>

        {/* Valor numérico */}
        <Typography
            sx={{
                width: '1%',
                fontWeight: 700,
                fontSize: { xs: '0.7rem', md: '0.9rem' },
                textAlign: 'right',
                mr: 3
            }}
        >
            {value}
        </Typography>

        {/* Barra de progreso */}
        <Box
            sx={{
                flexGrow: 1,
                height: 15,
                bgcolor: 'rgba(0,0,0,0.05)',
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    width: `${Math.min(value, maxValue)}%`,
                    bgcolor: `var(--color-${mainType})`,
                    borderRadius: 10,
                    position: 'absolute',
                    transition: 'width 1s ease-in-out',
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    '@keyframes shimmer': {
                        '0%': { backgroundPosition: '200% 0' },
                        '100%': { backgroundPosition: '-200% 0' }
                    }
                }}
            />
        </Box>
    </Box>
);
