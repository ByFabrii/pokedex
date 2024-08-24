import React, { useContext, useEffect, useState } from 'react';
import { PokemonContext } from '../Context/PokemonContext';

export const FilterBar = () => {
    const { active, handleCheckbox, setActive, type } = useContext(PokemonContext);

    return (
        <div className={`container-filters ${active ? 'active' : ''}`}>
            <button className='close-button' onClick={() => setActive(false)}>
                X
            </button>
            <div className='filter-by-type'>
                <span>Tipo</span>
                {type.map((type) => (
                    <div className='group-type' key={type.name}>
                        <input
                            type='checkbox'
                            onChange={handleCheckbox}
                            name={type.name}
                            id={type.name}
                        />
                        <label htmlFor={type.name}>{type.name.charAt(0).toUpperCase() + type.name.slice(1)}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};
