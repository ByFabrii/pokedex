import React, { useContext, useState, useEffect } from 'react';
import { FilterBar, PokemonList } from '../Components';
import { PokemonContext } from '../Context/PokemonContext';
import { Fab } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

export const HomePage = () => {
    const { onClickLoadMore, active, setActive } = useContext(PokemonContext);
    const [showScroll, setShowScroll] = useState(false);

    const checkScrollTop = () => {
        if (!showScroll && window.pageYOffset > 400) {
            setShowScroll(true);
        } else if (showScroll && window.pageYOffset <= 400) {
            setShowScroll(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener('scroll', checkScrollTop);
        return () => {
            window.removeEventListener('scroll', checkScrollTop);
        };
    }, [showScroll]);

    return (
        <>
            <div className='container-filter container'>
                <div className='icon-filter' onClick={() => setActive(!active)}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='icon'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'
                        />
                    </svg>
                    <span>Filtrar</span>
                </div>
            </div>
            <PokemonList />
            <FilterBar />
            <div className="container-btn-load-more container">
                <button className='btn-load-more' onClick={onClickLoadMore}>
                    Cargar más
                </button>
            </div>
            {showScroll && (
                <Fab
                    color='warning'
                    size="medium"
                    onClick={scrollToTop}
                    style={{ position: 'fixed', bottom: '20px', right: '20px' }}
                >
                    <KeyboardArrowUp />
                </Fab>
            )}
        </>
    );
};
