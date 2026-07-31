# Plan: Arreglar el filtro por tipo de Pokémon

## Contexto

La Pokedex carga los pokemon de forma **incremental** mediante scroll infinito: `getAllPokemons` (`src/Context/PokemonProvider.jsx:40-157`) pide de a 30 pokemon por vez (`offset += 30` en `handleScroll`, líneas 160-198) y los va empujando al array `allPokemons`. No hay virtualización real de la lista (no se usa `react-window` para el grid principal) — lo único "perezoso" es la carga de imágenes por `IntersectionObserver` en `CardPokemon.jsx`. El problema real es que **los datos** de los pokemon no scrolleados todavía ni siquiera existen en memoria.

El filtro por tipo (`handleCheckbox`, `PokemonProvider.jsx:284-313`) hace `allPokemons.filter(...)`. Como `allPokemons` solo contiene lo que el usuario ya scrolleó, el filtro "ve" un subconjunto arbitrario de la Pokedex, dependiente del historial de scroll de esa sesión — ese es el bug reportado.

Se identificaron además estos problemas secundarios en la misma función:

1. **No es reactivo**: el filtrado se calcula una sola vez, en el instante del `onChange` del checkbox. Si después de marcar "fuego" el usuario sigue scrolleando y llegan más pokemon de fuego, esos nuevos nunca entran a `filteredPokemons` porque no hay ningún `useEffect` que recalcule cuando `allPokemons` crece.
2. **Merge incremental frágil**: en vez de recalcular `filteredPokemons` desde cero a partir de qué tipos están marcados (`typeSelected`), se va sumando/restando resultados sobre el estado anterior (líneas 299-311). Esto puede desincronizarse si el usuario marca/desmarca tipos rápido.
3. `globalPokemons` (línea 8) está declarado en el estado y expuesto en el contexto, pero nunca se le asigna nada — es estado muerto, se puede eliminar para no confundir.
4. El botón "Aplicar filtros" en `FilterBar.jsx` (línea 1133-1150) no aplica nada realmente — el filtro ya se ejecutó al tildar el checkbox (`onChange` → `handleCheckbox`). Solo cierra el drawer. No es un bug funcional, pero es engañoso a nivel UX/lectura de código; vale la pena tenerlo en cuenta si se toca esa zona.

**Decisión tomada**: resolver esto usando el endpoint dedicado de PokeAPI `GET /type/{nombre}`, que devuelve la lista completa de pokemon de ese tipo en TODA la Pokedex (independiente de scroll). Es la opción eficiente: solo se piden los ~60-100 pokemon del tipo que realmente interesa, no los ~1300 de la Pokedex completa.

## Cómo funciona `GET /type/{nombre}`

Devuelve algo así (resumido):
```json
{
  "name": "fire",
  "pokemon": [
    { "pokemon": { "name": "charmander", "url": ".../pokemon/4/" }, "slot": 1 },
    { "pokemon": { "name": "vulpix", "url": ".../pokemon/37/" }, "slot": 1 }
  ]
}
```
Ojo: esto da **nombre + url**, no el detalle completo (sprites, stats, etc.) que `CardPokemon` necesita para renderizar. Por eso el flujo tiene dos pasos: 1) pedir la lista de nombres del tipo, 2) para cada nombre que NO esté ya en `allPokemons`, pedir su detalle completo con `GET /pokemon/{nombre}` (tal como ya hace `searchPokemonByName`, línea 244-257, y el loop de `getAllPokemons`, línea 96).

## Enfoque recomendado

Todo el cambio va en `src/Context/PokemonProvider.jsx`. La idea es reemplazar la lógica actual de `handleCheckbox` por un flujo reactivo:

### 1. Estado nuevo para cachear resultados por tipo
Agregar un `useRef` tipo diccionario, por ejemplo `typePokemonCache.current = { fire: [...pokemonDetalleCompleto], water: [...] }`. Así, si el usuario desmarca "fuego" y lo vuelve a marcar, no se repite el fetch a `/type/fire`.

### 2. Función `fetchPokemonsByType(typeName)`
Nueva función async que:
- Si ya está en `typePokemonCache.current[typeName]`, devuelve eso directo.
- Si no, hace `fetch('https://pokeapi.co/api/v2/type/' + typeName)`.
- Del array `data.pokemon`, extrae los nombres.
- Para cada nombre: si ya existe en `allPokemons` (reutilizar, evita refetch — igual que la línea 91-94 de `getAllPokemons`), lo usa; si no, hace `fetch(pokemon.url)` para traer el detalle completo. Se puede hacer en bloques (`chunkSize`) igual que ya hace `getAllPokemons`, para no disparar 100 requests simultáneos.
- Guarda el resultado en `typePokemonCache.current[typeName]` y lo retorna.
- Considerar exponer un estado `loadingFilter` (booleano) para mostrar un spinner en `FilterBar` mientras esto corre — puede tardar unos segundos la primera vez que se marca un tipo con muchos pokemon.

### 3. Reemplazar `handleCheckbox` por dos piezas separadas
- `handleCheckbox` (el que ya está conectado a los checkboxes) debería quedar simple: solo actualiza `typeSelected` (líneas 288-291 actuales, sin tocar `filteredPokemons` directamente).
- Un nuevo `useEffect(() => { ... }, [typeSelected])` que:
  1. Calcula qué tipos están actualmente en `true` dentro de `typeSelected`.
  2. Si no hay ninguno marcado, `setfilteredPokemons([])` (vuelve a mostrar `allPokemons`, tal como ya maneja `PokemonList.jsx:13`).
  3. Si hay tipos marcados, llama `fetchPokemonsByType` para cada uno (en paralelo con `Promise.all`), une los resultados (OR — un pokemon aparece si matchea *cualquiera* de los tipos marcados) y deduplica por `id` (se puede reusar la misma lógica de `findIndex` que ya existe en las líneas 302-304).
  4. Hace `setfilteredPokemons(resultadoUnido)`.

Esto resuelve de raíz el bug: el resultado ya no depende de `allPokemons` (que es parcial), sino de la respuesta autoritativa de `/type/{nombre}` — y al vivir en un `useEffect` atado a `typeSelected`, se recalcula solo, sin la lógica frágil de sumar/restar incremental.

### 4. Limpieza opcional
- Eliminar `globalPokemons`/`setGlobalPokemons` (línea 8 y 322) ya que no se usa.
- En `FilterBar.jsx`, si se quiere, se puede simplificar el botón "Aplicar filtros" para que solo cierre el drawer (ya lo hace), dejando claro que el filtro ya se aplicó en vivo — o quitar la ilusión de que "aplica" algo y dejarlo como botón "Cerrar".

## Archivos a tocar

- `src/Context/PokemonProvider.jsx` — toda la lógica (agregar `fetchPokemonsByType`, `typePokemonCache`, el nuevo `useEffect`, simplificar `handleCheckbox`, quitar `globalPokemons`).
- `src/Components/FilterBar.jsx` — opcionalmente, mostrar estado de carga (`loadingFilter`) mientras se resuelve un tipo nuevo, y limpieza del botón "Aplicar filtros".
- No hace falta tocar `CardPokemon.jsx` ni `PokemonList.jsx`: ambos ya consumen `filteredPokemons`/`allPokemons` con la forma de datos correcta (objeto completo de pokemon con `.types`, `.sprites`, etc.), que es justo lo que `fetchPokemonsByType` va a producir.

## Checklist de progreso

- [x] Agregar `typePokemonCache` (ref tipo diccionario) en `PokemonProvider.jsx`
- [x] Implementar `fetchPokemonsByType(typeName)`
- [x] Simplificar `handleCheckbox` (solo actualiza `typeSelected`)
- [x] Agregar `useEffect` reactivo sobre `typeSelected` que recalcula `filteredPokemons`
- [x] Agregar `loadingFilter` + spinner en `FilterBar.jsx` y `PokemonList.jsx`
- [x] Eliminar `globalPokemons` (estado muerto)
- [ ] (Opcional) Limpiar botón "Aplicar filtros" en `FilterBar.jsx`

## Actualización: optimización de red (carga progresiva)

Al probar el fix se detectó que filtrar por un tipo grande (ej. "grass") disparaba ~149 peticiones y ~16MB transferidos, porque se traía el detalle completo de TODOS los pokemon de ese tipo de una sola vez — incluyendo datos que `CardPokemon` ni siquiera usa (moves, abilities, forms, etc.).

**Solución implementada**: carga progresiva por lotes, reusando el mismo patrón de scroll infinito que ya tiene la app para `allPokemons`.

- `getTypeNameList(typeName)`: pide una sola vez `/type/{nombre}` (barato, solo nombres+urls) y lo cachea en `typeNameListCache`.
- `loadMoreForType(typeName, batchSize)`: avanza de a `batchSize` sobre esa lista, reutiliza pokemon ya presentes en `allPokemons` (sin refetch) y solo pide detalle completo de los que faltan. Guarda progreso por tipo en `typeFetchProgressRef` (`{ nextIndex, isComplete }`) para no repetir trabajo.
- Al marcar un tipo: se carga solo el primer lote (`FILTER_INITIAL_BATCH = 30`) → resultados casi instantáneos.
- Mientras el usuario scrollea con un filtro activo y aún queden pokemon de ese tipo sin cargar, un listener de scroll dedicado (`handleFilterScroll`) va pidiendo más lotes (`FILTER_SCROLL_BATCH = 20`) — igual que el scroll infinito normal. Si el usuario nunca llega al final, nunca se piden los pokemon restantes.
- Se agregó `filterGenerationRef` para descartar resultados de una carga de scroll que resuelve tarde, después de que el usuario ya cambió el filtro (evita pisar `filteredPokemons` con datos viejos).

**Alternativa evaluada y descartada por ahora**: migrar a la API GraphQL de PokeAPI (`beta.pokeapi.co/graphql`), que permitiría traer TODOS los pokemon de un tipo con los campos exactos que se necesitan (id, nombre, tipos, sprites) en una sola petición — bajaría de ~130 peticiones/16MB a ~1 petición/<300KB. Mayor beneficio pero depende de un servicio "beta" de la comunidad y requiere más código nuevo. Queda documentado como posible siguiente paso si la carga progresiva no resulta suficiente.

## Verificación

1. Recargar la app en frío (sin haber scrolleado nada) y marcar un tipo poco común, ej. "dragon" o "ice". Debería verse un primer lote (~30) casi al instante, con un loader visible mientras carga.
2. Con ese filtro activo, hacer scroll hasta el final de la página y confirmar que van apareciendo más pokemon del tipo (en lotes de 20) hasta completar el total real (comparar contra `https://pokeapi.co/api/v2/type/ice` en el navegador, campo `pokemon.length`).
3. Marcar dos tipos a la vez (ej. "fuego" + "agua") y confirmar que la unión (OR) se ve correcta y sin duplicados, y que ambos se completan al scrollear.
4. Desmarcar todos los tipos y confirmar que vuelve a verse `allPokemons` (comportamiento actual de `PokemonList.jsx:13`).
5. Marcar el mismo tipo dos veces (marcar/desmarcar/marcar) y confirmar que la segunda vez es instantáneo (usa el cache, incluyendo lo que ya se había cargado por scroll) en vez de volver a pegarle a la API.
6. Revisar la pestaña Network de DevTools: al marcar un tipo grande, debería verse solo ~1 petición a `/type/{nombre}` + un puñado de peticiones a `/pokemon/{nombre}` (según `FILTER_INITIAL_BATCH`), no ~130 de una sola vez. Nuevas tandas solo deberían dispararse al acercarse al final de la página.
