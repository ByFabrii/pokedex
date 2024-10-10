import React, { useContext, useState, useEffect } from 'react';
import { PokemonContext } from '../Context/PokemonContext';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip'; // Importa Tooltip si lo usas desde Material UI

import { PokemonPage } from '../Pages/PokemonPage';

export const Searcher = () => {
    const { onInputChange, valueSearch, onResetForm, searchPokemonByName, getPokemonByID } = useContext(PokemonContext);
    const [open, setOpen] = useState(false);
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showTooltip, setShowTooltip] = useState(false); // Estado para controlar el tooltip

    const handleOpenModal = async (idPokemon) => {
        const data = await getPokemonByID(idPokemon);
        setPokemon(data);
        setLoading(false);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const onSearchSubmit = async (e) => {
        e.preventDefault();
        const foundPokemon = await searchPokemonByName(valueSearch);

        if (foundPokemon.length > 0) {
            handleOpenModal(foundPokemon[0].id);
            setErrorMessage(''); 
        } else {
            setErrorMessage('No se han encontrado resultados. Intenta escribiendo el nombre completo del pokemon.');
            setShowTooltip(true); // Muestra el tooltip
            setTimeout(() => setShowTooltip(false), 3000); // Oculta el tooltip después de 3 segundos
        }

        onResetForm();
    };

    return (
        <>
            <form onSubmit={onSearchSubmit}>
                <div className='form-group'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='icon-search'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                        />
                    </svg>
                    <Tooltip title={errorMessage} open={showTooltip} placement="top" arrow>
                        <input
                            type='search'
                            name='valueSearch'
                            value={valueSearch}
                            onChange={onInputChange}
                            placeholder='Buscar nombre de pokemon'
                            required
                        />
                    </Tooltip>
                </div>
                <button className='btn-search'>Buscar</button>
            </form>

            {pokemon && (
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
            )}
        </>
    );
};
