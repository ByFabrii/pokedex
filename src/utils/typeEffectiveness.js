const BASE_URL = 'https://pokeapi.co/api/v2/';

// typeName -> damage_relations de /type/{name}, cacheado en memoria para no
// repetir la misma petición al ver varios Pokémon del mismo tipo en una sesión.
const damageRelationsCache = {};

async function fetchDamageRelations(typeName) {
    if (damageRelationsCache[typeName]) return damageRelationsCache[typeName];
    const res = await fetch(`${BASE_URL}type/${typeName}`);
    if (!res.ok) throw new Error(`Error al cargar relaciones de daño del tipo ${typeName}`);
    const data = await res.json();
    damageRelationsCache[typeName] = data.damage_relations;
    return data.damage_relations;
}

/**
 * Calcula, para un Pokémon con 1 o 2 tipos, contra qué tipos atacantes es
 * débil/resistente/inmune, combinando los multiplicadores de ambos tipos.
 * Los tipos que netean en x1 (se cancelan entre sí) se omiten a propósito.
 */
export async function getTypeEffectiveness(typeNames) {
    const relationsList = await Promise.all(typeNames.map(fetchDamageRelations));
    const multipliers = {};

    const applyFactor = (list, factor) => {
        list.forEach(({ name }) => {
            multipliers[name] = (multipliers[name] ?? 1) * factor;
        });
    };

    relationsList.forEach(relations => {
        applyFactor(relations.double_damage_from, 2);
        applyFactor(relations.half_damage_from, 0.5);
        applyFactor(relations.no_damage_from, 0);
    });

    const buckets = { x4: [], x2: [], x0_5: [], x0_25: [], x0: [] };
    Object.entries(multipliers).forEach(([typeName, factor]) => {
        if (factor === 4) buckets.x4.push(typeName);
        else if (factor === 2) buckets.x2.push(typeName);
        else if (factor === 0.5) buckets.x0_5.push(typeName);
        else if (factor === 0.25) buckets.x0_25.push(typeName);
        else if (factor === 0) buckets.x0.push(typeName);
    });
    return buckets;
}
