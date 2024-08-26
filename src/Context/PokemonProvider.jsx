import { useEffect, useState } from "react";
import { PokemonContext } from "./PokemonContext";
import { useForm } from "../Hooks/useForm";

export const PokemonProvider = ({ children }) => {
    const [allPokemons, setAllPokemons] = useState([]);
    const [globalPokemons, setGlobalPokemons] = useState([]);
    const [offset, setOffset] = useState(0);
    const [type, setType] = useState([]);

    const { valueSearch, onInputChange, onResetForm } = useForm({
        valueSearch: '',
    });

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [active, setActive] = useState(false);

    const getAllPokemons = async (limit = 20) => {
        setLoadingMore(true);
        const baseURL = 'https://pokeapi.co/api/v2/';
        const res = await fetch(`${baseURL}pokemon?limit=${limit}&offset=${offset}`);
        const data = await res.json();

        const promises = data.results.map(async pokemon => {
            const res = await fetch(pokemon.url);
            const data = await res.json();
            return data;
        });
        const results = await Promise.all(promises);

        setAllPokemons(prevPokemons => [...prevPokemons, ...results]);
        setLoadingMore(false);
        setLoading(false);
    };

    const getPokemonByID = async id => {
        const baseURL = 'https://pokeapi.co/api/v2/';
        const res = await fetch(`${baseURL}pokemon/${id}`);
        const data = await res.json();
        return data;
    };

    const searchPokemonByName = async (name) => {
        // Suponiendo que tienes una API que devuelve un solo Pokémon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (response.ok) {
            const data = await response.json();
            return [data];  // Devuelve un array con el objeto Pokémon
        } else {
            return [];  // Devuelve un array vacío si no encuentra el Pokémon
        }
    };

    const getTypes = async () => {
        const baseURL = 'https://pokeapi.co/api/v2/';
        const res = await fetch(`${baseURL}type`);
        const data = await res.json();
        setType(data.results);
    };

    useEffect(() => {
        getTypes();
    }, []);

    useEffect(() => {
        getAllPokemons();
    }, [offset]);

    // const onClickLoadMore = () => {
    //     setOffset(prevOffset => prevOffset + 20);
    // };

    const [typeSelected, setTypeSelected] = useState({
        grass: false,
        normal: false,
        fighting: false,
        flying: false,
        poison: false,
        ground: false,
        rock: false,
        bug: false,
        ghost: false,
        steel: false,
        fire: false,
        water: false,
        electric: false,
        psychic: false,
        ice: false,
        dragon: false,
        dark: false,
        fairy: false,
        unknow: false,
        shadow: false,
    });

    const [filteredPokemons, setfilteredPokemons] = useState([]);

    const handleCheckbox = e => {
        const { name, checked } = e.target;

        // Actualiza el estado de los tipos seleccionados
        setTypeSelected(prevTypeSelected => ({
            ...prevTypeSelected,
            [name]: checked,
        }));

        // Filtra los Pokémon basados en los tipos seleccionados
        if (checked) {
            const filteredResults = allPokemons.filter(pokemon =>
                pokemon.types.some(type => type.type.name === name)
            );
            setfilteredPokemons(prevFilteredPokemons => [...prevFilteredPokemons, ...filteredResults]);
        } else {
            const filteredResults = filteredPokemons.filter(pokemon =>
                !pokemon.types.some(type => type.type.name === name)
            );
            setfilteredPokemons(filteredResults);
        }
    };

    return (
        <PokemonContext.Provider
            value={{
                valueSearch,
                onInputChange,
                onResetForm,
                allPokemons,
                globalPokemons,
                searchPokemonByName,
                getPokemonByID,
                // onClickLoadMore,
                loading,
                setLoading,
                active,
                setActive,
                handleCheckbox,
                filteredPokemons,
                type,
                loadingMore,
                setOffset,
            }}
        >
            {children}
        </PokemonContext.Provider>
    );
};
