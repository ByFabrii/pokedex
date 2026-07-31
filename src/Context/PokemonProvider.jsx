import { useEffect, useState, useCallback, useRef } from "react";
import { PokemonContext } from "./PokemonContext";
import { useForm } from "../Hooks/useForm";
import { throttle } from "lodash";

export const PokemonProvider = ({ children }) => {
    const [allPokemons, setAllPokemons] = useState([]);
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
    const [loadingFilter, setLoadingFilter] = useState(false);
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

    // --- Carga progresiva de Pokémon por tipo ---
    // En vez de traer TODOS los Pokémon de un tipo de una sola vez (podían ser
    // ~130 peticiones para un tipo grande), se trae un primer lote pequeño para
    // pintar la pantalla rápido, y el resto se va pidiendo de a poco mientras
    // el usuario scrollea (ver handleFilterScroll más abajo).
    const FILTER_INITIAL_BATCH = 30;
    const FILTER_SCROLL_BATCH = 20;

    // typeName -> [{ pokemon: { name, url } }, ...] (respuesta cruda de /type/{nombre})
    const typeNameListCache = useRef({});
    // typeName -> array de Pokémon con detalle completo ya cargados para ese tipo
    const typePokemonCache = useRef({});
    // typeName -> { nextIndex, isComplete } - hasta dónde se avanzó en la lista de ese tipo
    const typeFetchProgressRef = useRef({});
    // Evita disparar dos "cargar más" en simultáneo mientras se scrollea
    const filterLoadMoreLockRef = useRef(false);
    // Se incrementa cada vez que cambia typeSelected; permite descartar
    // resultados de una carga de scroll que llega tarde, después de que el
    // usuario ya cambió de filtro.
    const filterGenerationRef = useRef(0);

    const getTypeNameList = useCallback(async (typeName) => {
        if (typeNameListCache.current[typeName]) {
            return typeNameListCache.current[typeName];
        }

        const baseURL = 'https://pokeapi.co/api/v2/';
        const res = await fetch(`${baseURL}type/${typeName}`);
        if (!res.ok) throw new Error(`Error al cargar tipo ${typeName}`);
        const data = await res.json();

        typeNameListCache.current[typeName] = data.pokemon;
        return data.pokemon;
    }, []);

    // Carga el siguiente lote (batchSize) de Pokémon pendientes de un tipo.
    // Si ese tipo ya está completo, no hace ninguna petición.
    const loadMoreForType = useCallback(async (typeName, batchSize) => {
        const progress = typeFetchProgressRef.current[typeName] || { nextIndex: 0, isComplete: false };

        if (progress.isComplete) {
            return typePokemonCache.current[typeName] || [];
        }

        let nameList;
        try {
            nameList = await getTypeNameList(typeName);
        } catch (error) {
            console.error(`Error al cargar tipo ${typeName}:`, error);
            setLoadError(error.message);
            return typePokemonCache.current[typeName] || [];
        }

        const slice = nameList.slice(progress.nextIndex, progress.nextIndex + batchSize);
        const nextIndex = progress.nextIndex + slice.length;

        if (slice.length === 0) {
            typeFetchProgressRef.current[typeName] = { nextIndex, isComplete: true };
            return typePokemonCache.current[typeName] || [];
        }

        // Reutilizar detalles que ya tenemos en memoria (evita refetch)
        const existing = allPokemons.filter(pokemon =>
            slice.some(p => p.pokemon.name === pokemon.name)
        );
        const needFetch = slice.filter(p =>
            !existing.some(ep => ep.name === p.pokemon.name)
        );

        const chunkSize = 8; // Procesar en bloques de 8 para no saturar
        const fetchedDetails = [];

        for (let i = 0; i < needFetch.length; i += chunkSize) {
            if (!isMounted.current) break;

            const chunk = needFetch.slice(i, i + chunkSize);
            const results = await Promise.all(
                chunk.map(async p => {
                    try {
                        const detailRes = await fetch(p.pokemon.url);
                        if (!detailRes.ok) throw new Error(`Error al cargar ${p.pokemon.name}`);
                        return await detailRes.json();
                    } catch (err) {
                        console.error(`Error al cargar ${p.pokemon.name}:`, err);
                        return null;
                    }
                })
            );
            fetchedDetails.push(...results.filter(Boolean));
        }

        const updatedList = [
            ...(typePokemonCache.current[typeName] || []),
            ...existing,
            ...fetchedDetails,
        ];
        typePokemonCache.current[typeName] = updatedList;
        typeFetchProgressRef.current[typeName] = {
            nextIndex,
            isComplete: nextIndex >= nameList.length,
        };

        return updatedList;
    }, [allPokemons, getTypeNameList]);

    // Combina en un solo array (sin duplicados) lo que hay cacheado para los
    // tipos actualmente marcados.
    const recomputeFilteredFromCache = useCallback((activeTypes) => {
        const merged = activeTypes.flatMap(t => typePokemonCache.current[t] || []);
        const uniquePokemons = merged.filter(
            (pokemon, index, self) => index === self.findIndex(p => p.id === pokemon.id)
        );
        setfilteredPokemons(uniquePokemons);
    }, []);

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

        // Solo actualiza qué tipos están marcados; el useEffect de abajo
        // es quien recalcula `filteredPokemons` a partir de este estado.
        setTypeSelected(prevTypeSelected => ({
            ...prevTypeSelected,
            [name]: checked,
        }));
    };

    // Recalcula filteredPokemons cada vez que cambian los tipos marcados.
    // Solo trae el primer lote (FILTER_INITIAL_BATCH) de cada tipo activo,
    // usando /type/{nombre} como fuente de verdad de TODOS los Pokémon de ese
    // tipo (no solo los que ya se cargaron por scroll). El resto se completa
    // con handleFilterScroll, más abajo, a medida que el usuario scrollea.
    useEffect(() => {
        const activeTypes = Object.keys(typeSelected).filter(
            typeName => typeSelected[typeName]
        );

        filterGenerationRef.current += 1;
        const myGeneration = filterGenerationRef.current;

        if (activeTypes.length === 0) {
            setfilteredPokemons([]);
            setLoadingFilter(false);
            return;
        }

        let cancelled = false;
        setLoadingFilter(true);

        (async () => {
            await Promise.all(
                activeTypes.map(typeName => loadMoreForType(typeName, FILTER_INITIAL_BATCH))
            );

            if (cancelled || filterGenerationRef.current !== myGeneration) return;

            recomputeFilteredFromCache(activeTypes);
            setLoadingFilter(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [typeSelected, loadMoreForType, recomputeFilteredFromCache]);

    // Mientras haya al menos un tipo marcado con Pokémon pendientes por cargar,
    // seguir trayendo lotes (FILTER_SCROLL_BATCH) a medida que el usuario
    // se acerca al final de la página — igual que el scroll infinito normal,
    // pero acotado a los tipos filtrados.
    useEffect(() => {
        const activeTypes = Object.keys(typeSelected).filter(
            typeName => typeSelected[typeName]
        );

        if (activeTypes.length === 0) return;

        const myGeneration = filterGenerationRef.current;

        const handleFilterScroll = throttle(() => {
            if (filterLoadMoreLockRef.current) return;

            const scrollHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const scrollPosition = window.innerHeight + window.scrollY;
            if (scrollPosition < scrollHeight - 200) return;

            const incompleteTypes = activeTypes.filter(
                typeName => !typeFetchProgressRef.current[typeName]?.isComplete
            );
            if (incompleteTypes.length === 0) return;

            filterLoadMoreLockRef.current = true;
            setLoadingFilter(true);

            Promise.all(
                incompleteTypes.map(typeName => loadMoreForType(typeName, FILTER_SCROLL_BATCH))
            )
                .then(() => {
                    if (filterGenerationRef.current !== myGeneration) return;
                    recomputeFilteredFromCache(activeTypes);
                })
                .finally(() => {
                    filterLoadMoreLockRef.current = false;
                    if (filterGenerationRef.current === myGeneration) {
                        setLoadingFilter(false);
                    }
                });
        }, 300);

        window.addEventListener('scroll', handleFilterScroll);
        return () => window.removeEventListener('scroll', handleFilterScroll);
    }, [typeSelected, loadMoreForType, recomputeFilteredFromCache]);

    return (
        <PokemonContext.Provider
            value={{
                valueSearch,
                onInputChange,
                onResetForm,
                allPokemons,
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
                loadingFilter,
                totalPokemons,
                setOffset,
                loadError
            }}
        >
            {children}
        </PokemonContext.Provider>
    );
};
