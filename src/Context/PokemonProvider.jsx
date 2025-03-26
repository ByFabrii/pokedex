import { useEffect, useState, useCallback, useRef } from "react";
import { PokemonContext } from "./PokemonContext";
import { useForm } from "../Hooks/useForm";
import { throttle } from "lodash";

export const PokemonProvider = ({ children }) => {
    const [allPokemons, setAllPokemons] = useState([]);
    const [globalPokemons, setGlobalPokemons] = useState([]);
    const [offset, setOffset] = useState(0);
    const [type, setType] = useState([]);
    const [totalPokemons, setTotalPokemons] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const isMounted = useRef(true);

    const { valueSearch, onInputChange, onResetForm } = useForm({
        valueSearch: '',
    });

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [active, setActive] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Limpiar la memoria cuando se desmonta el componente
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Referencia para evitar múltiples cargas simultáneas
    const loadingRef = useRef(false);
    const lastOffsetRef = useRef(offset);
    // Referencia para llevar un registro de los offsets ya procesados
    const processedOffsetsRef = useRef(new Set());
    // Referencia para la cola de offsets pendientes
    const pendingOffsetsRef = useRef([]);

    // Función optimizada para obtener Pokémon con caché
    const getAllPokemons = useCallback(async (limit = 30) => {
        // Prevenir cargas múltiples usando ref en lugar de estado
        if (loadingRef.current || 
            (totalPokemons && allPokemons.length >= totalPokemons) || 
            !isMounted.current) {
            return;
        }

        // Capturar el offset actual para esta carga específica
        const currentOffset = offset;
        
        // Verificar si ya hemos procesado este offset específico
        if (processedOffsetsRef.current.has(currentOffset)) {
            console.log(`Ya hemos procesado el offset ${currentOffset} saltando carga.`);
            return;
        }

        // Marcar que estamos cargando usando la referencia
        loadingRef.current = true;
        lastOffsetRef.current = currentOffset;
        
        try {
            setLoadingMore(true);
            setLoadError(null);

            const baseURL = 'https://pokeapi.co/api/v2/';
            
            console.log(`Cargando Pokémon con offset: ${currentOffset}, límite: ${limit}`);
            
            // 1. Obtener la lista de Pokémon para esta página
            const res = await fetch(`${baseURL}pokemon?limit=${limit}&offset=${currentOffset}`);
            if (!res.ok) throw new Error('Error al cargar la lista de Pokémon');
            
            const data = await res.json();
            
            if (!totalPokemons && isMounted.current) {
                setTotalPokemons(data.count);
            }
            
            // 2. Cargar los detalles en bloques para reducir la carga
            const loadedPokemons = [];
            const chunkSize = 8; // Procesar en bloques de 8 para no saturar
            
            for (let i = 0; i < data.results.length; i += chunkSize) {
                if (!isMounted.current) break;
                
                const chunk = data.results.slice(i, i + chunkSize);
                
                const promises = chunk.map(async (pokemon, index) => {
                    try {
                        // Verificar si ya tenemos este Pokémon en memoria
                        const existingPokemon = allPokemons.find(
                            p => p.name === pokemon.name
                        );
                        if (existingPokemon) return existingPokemon;
                        
                        const res = await fetch(pokemon.url);
                        if (!res.ok) throw new Error(`Error al cargar ${pokemon.name}`);
                        const pokemonData = await res.json();
                        
                        // Agregar offset y otras propiedades para rastreo
                        pokemonData.offset = currentOffset;
                        pokemonData.positionInBatch = i + index;
                        pokemonData.expectedPosition = currentOffset + i + index;
                        
                        return pokemonData;
                    } catch (err) {
                        console.error(`Error al cargar ${pokemon.name}:`, err);
                        return null;
                    }
                });
                
                const results = await Promise.all(promises);
                loadedPokemons.push(...results.filter(Boolean));
                
                // Actualizar el estado incrementalmente para mejorar la experiencia
                if (isMounted.current && loadedPokemons.length > 0) {
                    setAllPokemons(prevPokemons => {
                        // Eliminar duplicados
                        const uniquePokemons = loadedPokemons.filter(
                            newPokemon => !prevPokemons.some(p => p.id === newPokemon.id)
                        );
                        
                        // Ordenar la lista completa por ID para mantener el orden correcto
                        const newPokemonList = [...prevPokemons, ...uniquePokemons]
                            .sort((a, b) => a.id - b.id);
                            
                        return newPokemonList;
                    });
                }
            }
            
            // Marcar este offset como procesado correctamente
            processedOffsetsRef.current.add(currentOffset);
            
            // Verificar si hay offsets pendientes en la cola y procesar el siguiente
            if (pendingOffsetsRef.current.length > 0) {
                const nextOffset = pendingOffsetsRef.current.shift();
                if (nextOffset > currentOffset) {
                    // Sólo procesar offsets mayores para mantener la secuencia
                    setOffset(nextOffset);
                }
            }
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
            setLoadError(error.message);
        } finally {
            if (isMounted.current) {
                setLoadingMore(false);
                setLoading(false);
                
                // Importante: liberar el flag de carga después de completar
                setTimeout(() => {
                    loadingRef.current = false;
                }, 300); // Reducir el tiempo de espera para permitir cargas más frecuentes
            }
        }
    }, [offset, totalPokemons, allPokemons.length]);

    // Manejador de scroll mejorado con control de secuencia
    const handleScroll = useCallback(throttle(() => {
        // Mejorar la detección del final de la página
        const scrollHeight = Math.max(
          document.body.scrollHeight, 
          document.documentElement.scrollHeight
        );
        const scrollPosition = window.innerHeight + window.scrollY;
        const scrollThreshold = scrollHeight - 200; // Umbral más generoso
        
        // Solo incrementar el offset si no estamos cargando y tenemos la página actual completa
        if (scrollPosition >= scrollThreshold && !loadingRef.current) {
            console.log('Detectado final de página, evaluando carga de más Pokémon...');
            
            const nextOffset = offset + 30;
            
            // Verificar si ya hemos procesado o encolado este offset
            if (processedOffsetsRef.current.has(nextOffset) || 
                pendingOffsetsRef.current.includes(nextOffset)) {
                return;
            }
            
            // Si estamos cargando, encolar este offset para procesarlo después
            if (loadingRef.current) {
                console.log(`Carga en progreso, encolando offset ${nextOffset} para después`);
                pendingOffsetsRef.current.push(nextOffset);
                return;
            }
            
            // Si el offset actual no ha sido procesado, tampoco avanzar
            if (!processedOffsetsRef.current.has(offset)) {
                console.log(`Esperando a que se procese el offset actual ${offset} antes de avanzar`);
                return;
            }
            
            // Si llegamos aquí, podemos incrementar el offset con seguridad
            console.log(`Incrementando offset de ${offset} a ${nextOffset}`);
            setOffset(nextOffset);
        }
      }, 250), [offset, loadingRef.current, processedOffsetsRef.current.size]); // Throttle más rápido // Acelerar el throttle
    
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        getTypes();
    }, []);

    useEffect(() => {
        getAllPokemons();
    }, [getAllPokemons, offset]);

    // Obtener tipos de Pokémon con manejo de errores
    const getTypes = async () => {
        try {
            const baseURL = 'https://pokeapi.co/api/v2/';
            const res = await fetch(`${baseURL}type`);
            
            if (!res.ok) throw new Error('Error al cargar tipos de Pokémon');
            
            const data = await res.json();
            if (isMounted.current) {
                setType(data.results);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const getPokemonByID = async id => {
        try {
            const baseURL = 'https://pokeapi.co/api/v2/';
            const res = await fetch(`${baseURL}pokemon/${id}`);
            
            if (!res.ok) throw new Error(`Error al cargar Pokémon ${id}`);
            
            return await res.json();
        } catch (error) {
            console.error(`Error fetching Pokémon ${id}:`, error);
            throw error;
        }
    };

    const searchPokemonByName = async (name) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
            if (response.ok) {
                const data = await response.json();
                return [data];
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error searching Pokémon:', error);
            return [];
        }
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
        const { name, checked } = e.target;

        // Actualiza el estado de los tipos seleccionados
        setTypeSelected(prevTypeSelected => ({
            ...prevTypeSelected,
            [name]: checked,
        }));

        // Filtrar Pokémon de manera más eficiente
        if (checked) {
            const filteredResults = allPokemons.filter(pokemon =>
                pokemon.types.some(type => type.type.name === name)
            );
            
            setfilteredPokemons(prevPokemons => {
                // Eliminar duplicados
                const combinedPokemons = [...prevPokemons, ...filteredResults];
                return combinedPokemons.filter((pokemon, index, self) =>
                    index === self.findIndex(p => p.id === pokemon.id)
                );
            });
        } else {
            setfilteredPokemons(prevPokemons => 
                prevPokemons.filter(pokemon =>
                    !pokemon.types.some(type => type.type.name === name)
                )
            );
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
                loading,
                setLoading,
                active,
                setActive,
                handleCheckbox,
                filteredPokemons,
                type,
                loadingMore,
                totalPokemons,
                setOffset,
                loadError
            }}
        >
            {children}
        </PokemonContext.Provider>
    );
};
