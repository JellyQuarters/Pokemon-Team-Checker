var searchButton = document.getElementById("add-btn");
var resetTeamButton = document.getElementById("reset-btn");
var analyzeButton = document.getElementById("analyze");

var current_slot = 0;
var teamArray = [];
const typeArray = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"
];

// Type effectiveness chart
const typeChart = {
    normal: {
        rock: 0.5,
        ghost: 0,
        steel: 0.5
    },
    fire: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 2,
        bug: 2,
        rock: 0.5,
        dragon: 0.5,
        steel: 2
    },
    water: {
        fire: 2,
        water: 0.5,
        grass: 0.5,
        ground: 2,
        rock: 2,
        dragon: 0.5
    },
    electric: {
        water: 2,
        electric: 0.5,
        grass: 0.5,
        ground: 0,
        flying: 2,
        dragon: 0.5
    },
    grass: {
        fire: 0.5,
        water: 2,
        grass: 0.5,
        poison: 0.5,
        ground: 2,
        flying: 0.5,
        bug: 0.5,
        rock: 2,
        dragon: 0.5,
        steel: 0.5
    },
    ice: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 0.5,
        ground: 2,
        flying: 2,
        dragon: 2,
        steel: 0.5
    },
    fighting: {
        normal: 2,
        ice: 2,
        poison: 0.5,
        flying: 0.5,
        psychic: 0.5,
        bug: 0.5,
        rock: 2,
        ghost: 0,
        dark: 2,
        steel: 2,
        fairy: 0.5
    },
    poison: {
        grass: 2,
        poison: 0.5,
        ground: 0.5,
        rock: 0.5,
        ghost: 0.5,
        steel: 0,
        fairy: 2
    },
    ground: {
        fire: 2,
        electric: 2,
        grass: 0.5,
        poison: 2,
        flying: 0,
        bug: 0.5,
        rock: 2,
        steel: 2
    },
    flying: {
        electric: 0.5,
        grass: 2,
        fighting: 2,
        bug: 2,
        rock: 0.5,
        steel: 0.5
    },
    psychic: {
        fighting: 2,
        poison: 2,
        psychic: 0.5,
        dark: 0,
        steel: 0.5
    },
    bug: {
        fire: 0.5,
        grass: 2,
        fighting: 0.5,
        poison: 0.5,
        flying: 0.5,
        psychic: 2,
        ghost: 0.5,
        dark: 2,
        steel: 0.5,
        fairy: 0.5
    },
    rock: {
        fire: 2,
        ice: 2,
        fighting: 0.5,
        ground: 0.5,
        flying: 2,
        bug: 2,
        steel: 0.5
    },
    ghost: {
        normal: 0,
        psychic: 2,
        ghost: 2,
        dark: 0.5
    },
    dragon: {
        dragon: 2,
        steel: 0.5,
        fairy: 0
    },
    dark: {
        fighting: 0.5,
        psychic: 2,
        ghost: 2,
        dark: 0.5,
        fairy: 0.5
    },
    steel: {
        fire: 0.5,
        water: 0.5,
        electric: 0.5,
        ice: 2,
        rock: 2,
        steel: 0.5,
        fairy: 2
    },
    fairy: {
        fire: 0.5,
        fighting: 2,
        poison: 0.5,
        dragon: 2,
        dark: 2,
        steel: 0.5
    }
};

// Type helper function
function getEffectiveness(attackType, defenderType1, defenderType2 = null) {
    if (!typeChart[attackType]) return 1; // Safety check
    // Get multiplier for first type (default to 1 if not listed)
    const mult1 = typeChart[attackType][defenderType1] !== undefined 
                  ? typeChart[attackType][defenderType1] 
                  : 1;
    // If single type, return immediately
    if (!defenderType2) return mult1;
    // Get multiplier for second type
    const mult2 = typeChart[attackType][defenderType2] !== undefined 
                  ? typeChart[attackType][defenderType2] 
                  : 1;
    // Return combined multiplier
    return mult1 * mult2;
}

class Pokemon {
    constructor(name, type1, type2, sprite) {
        this.name = name;
        this.type1 = type1;
        this.type2 = type2;
        this.sprite = sprite;
    }
}

function getCardHTML(pokemon, index) {
    if (!pokemon) {
        return `<p>Empty</p>`;
    }
    return `
        <div class="filled">
            <button class="remove-btn" onclick="removePokemon(${index}); event.stopPropagation()">X</button>
            <img src="${pokemon.sprite}" alt="${pokemon.name}">
            <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
            <p>${pokemon.type1.charAt(0).toUpperCase() + pokemon.type1.slice(1)}${pokemon.type2 ? " / " + pokemon.type2.charAt(0).toUpperCase() + pokemon.type2.slice(1) : ""}</p>
        </div>
    `;
}

searchButton.onclick = function() {   
    // Replace spaces with hyphens for multi-word Pokemon names
    // NOTE: Needs additional work !!!! //
    var pokemonName = document.getElementById("pokemon-input").value.trim().replace(/\s+/g, '-');
    
    // Stop if input is empty
    if (!pokemonName) return;

    // Runs the fetch and adds to team
    getPokemonData(pokemonName).then(data => {
        if (data) {
            // Handles single-type Pokemon individually
            let type2 = data.types[1] ? data.types[1].type.name : null;
            
            // Creates the Pokemon and adds to team array
            const newPokemon = new Pokemon(
                data.name, 
                data.types[0].type.name, 
                type2, 
                data.sprites.front_default
            );

            teamArray[current_slot] = newPokemon;

            // Calls function up date the HTML card for the team member
            document.getElementById("slot-" + current_slot).className = "poke-slot filled";
            document.getElementById("slot-" + current_slot).innerHTML = getCardHTML(newPokemon, current_slot);
            document.getElementById("pokemon-input").value = "";
            
            // Increment slot and disable input if team is full
            current_slot += 1;
            if (current_slot > 5) {
                document.getElementById("pokemon-input").disabled = true;
                searchButton.disabled = true;
            }
        } else {
            alert("Pokémon not found. Please check the name and try again.");
        }
    });
}

async function getPokemonData(name) {
    const url = "https://pokeapi.co/api/v2/pokemon/" + name.toLowerCase();
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        return null;
    }
}

function removePokemon(index) {
    if (index < 0 || index >= teamArray.length) return;
    teamArray.splice(index, 1);
    document.getElementById("slot-" + teamArray.length).innerHTML = `<p>Empty</p>`;
    current_slot -= 1;
    updateTeamDisplay();
    document.getElementById("pokemon-input").disabled = false;
    searchButton.disabled = false;
}

function updateTeamDisplay() {
    for (let i = 0; i < 6; i++) {
        const pokemon = teamArray[i];
        document.getElementById("slot-" + i).innerHTML = getCardHTML(pokemon, i);
    }
}