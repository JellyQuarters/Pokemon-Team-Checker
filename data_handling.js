// Variables for DOM elements
var searchButton = document.getElementById("add-btn");
var resetTeamButton = document.getElementById("reset-btn");
var analyzeButton = document.getElementById("analyze");
var userInput = document.getElementById("pokemon-input");

// Global variables
var current_slot = 0;
var teamArray = [];
const typeArray = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"
];
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
const nameExceptions = {
    "mr-mime": "Mr. Mime",
    "mr-rime": "Mr. Rime",
    "mime-jr": "Mime Jr.",
    "type-null": "Type: Null",
    "ho-oh": "Ho-Oh",
    "porygon-z": "Porygon-Z",
    "jangmo-o": "Jangmo-o",
    "hakamo-o": "Hakamo-o",
    "kommo-o": "Kommo-o",
    "tapu-koko": "Tapu Koko",
    "farfetchd": "Farfetch'd",
    "sirfetchd": "Sirfetch'd",
    "nidoran-f": "Nidoran ♀",
    "nidoran-m": "Nidoran ♂",
    "flabebe": "Flabébé"
};

// Pokemon class to hold relevant data
// I'm going to implement methods to parse relevant data from the API response
// whenever they become relevant.
class Pokemon {
    constructor(apiData) {
        this._apiData = apiData;
        // Data required from API before analysis
        this.sprite = apiData.sprites.front_default;
        this.type1 = apiData.types[0].type.name;
        this.type2 = apiData.types[1] ? apiData.types[1].type.name : null;
        this.name = apiData.name;
    }
    
    getProperName() {
        if (nameExceptions[this.name]) {
            return nameExceptions[this.name];
        } else {
            return this.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }

    htmlCardData = `
        <img src="${this.sprite}" alt="${this.name}">
        <p>${this.getProperName()}</p>
        <p>${this.type1.charAt(0).toUpperCase() + this.type1.slice(1)}${this.type2 ? " / " + this.type2.charAt(0).toUpperCase() + this.type2.slice(1) : ""}</p>
    `;

    generateHTMLCard() {
        document.getElementById("slot-" + current_slot).innerHTML = this.htmlCardData;
        document.getElementById("slot-" + current_slot).className = "poke-slot filled";
    }
}

// Helper function to normalize Pokemon names to match PokeAPI requirements.
// Replaces spaces with hyphens and removes special characters.
function normalizeName(pokemon_name) {
    return pokemon_name.replace(/[^a-zA-Z0-9\ ]/g, '').replace(/\s+/g, '-').toLowerCase();
}

// Fetches Pokemon data from PokeAPI using normalized names.
// Returns a promise that resolves to the fetched data.
async function apiCall(name) {
    let normalized_name = normalizeName(name);
    const url = "https://pokeapi.co/api/v2/pokemon/" + normalized_name;
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

// DOM manipulation and event handlers
searchButton.onclick = function() {
    let add_pkmn = normalizeName(document.getElementById("pokemon-input").value);
    apiCall(add_pkmn).then(data => { teamArray.push(new Pokemon(data)); });

    // Deactivate search bar and button if team is full
    if (teamArray.length >= 6) {
        searchButton.disabled = true;
        userInput.disabled = true;
    }

    // Increment current slot for next addition
    current_slot += 1;
}

resetTeamButton.onclick = function() {
    // Reset global variables
    current_slot = 0;
    teamArray = [];
    // Clear team display
    for (let i = 0; i < 6; i++) {
        document.getElementById("slot-" + i).innerHTML = `<p>Empty</p>`;
    }
}