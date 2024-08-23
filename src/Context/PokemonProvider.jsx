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

	// const getGlobalPokemons = async (limit = 151) => {
    //     const baseURL = 'https://pokeapi.co/api/v2/';
    //     setLoading(true);

    //     const res = await fetch(`${baseURL}pokemon?limit=${limit}&offset=0`);
    //     const data = await res.json();

    //     const promises = data.results.map(async pokemon => {
    //         const res = await fetch(pokemon.url);
    //         const data = await res.json();
    //         return data;
    //     });
    //     const results = await Promise.all(promises);

    //     setGlobalPokemons(results);
    //     setLoading(false);
    // };
	
	const getPokemonByID = async id => {
        const baseURL = 'https://pokeapi.co/api/v2/';
        const res = await fetch(`${baseURL}pokemon/${id}`);
        const data = await res.json();
        return data;
    };
	
    const searchPokemonByName = async (name) => {
        setLoading(true);
        try {
            const baseURL = 'https://pokeapi.co/api/v2/pokemon/';
            const res = await fetch(`${baseURL}${name.toLowerCase()}`);
            if (!res.ok) throw new Error('Pokemon not found');
            const data = await res.json();
            setGlobalPokemons([data]);  // Almacena solo el Pokémon encontrado
        } catch (error) {
            console.error(error.message);
            setGlobalPokemons([]);  // Limpia la lista si no se encuentra el Pokémon
        }
        setLoading(false);
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

    const onClickLoadMore = () => {
        setOffset(prevOffset => prevOffset + 20);
    };

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
        setTypeSelected({
            ...typeSelected,
            [e.target.name]: e.target.checked,
        });

        if (e.target.checked) {
            const filteredResults = globalPokemons.filter(pokemon =>
                pokemon.types
                    .map(type => type.type.name)
                    .includes(e.target.name)
            );
            setfilteredPokemons([...filteredPokemons, ...filteredResults]);
        } else {
            const filteredResults = filteredPokemons.filter(
                pokemon =>
                    !pokemon.types
                        .map(type => type.type.name)
                        .includes(e.target.name)
            );
            setfilteredPokemons([...filteredResults]);
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
                onClickLoadMore,
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
