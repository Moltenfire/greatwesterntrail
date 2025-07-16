import { RNG } from './rng.js';

let date = new Date();
let seed = parseInt(date.toISOString().split("T")[0].replaceAll("-", ""));
let rng = new RNG(seed);
let newgames = 0;
const version = 0;

export function newgame() {
    newgames++;
    updateGWTNZ();
    updateGWT();
}

function updateGWT() {
    let state = getRandomGameStateGWT();
    document.getElementById('gwt-buildings').innerText = buildingString(state);
    document.getElementById('gwt-neutral').innerText = neutralBuildingString(state);
    document.getElementById('gwt-state').innerText = state.stateValue();
}

function updateGWTNZ() {
    let state = getRandomGameStateGWTNZ();
    document.getElementById('gwt-nz-buildings').innerText = buildingString(state);
    document.getElementById('gwt-nz-neutral').innerText = neutralBuildingString(state);
    document.getElementById('gwt-nz-bonus-cards').innerText = bonusCardsString(state);
    document.getElementById('gwt-nz-state').innerText = state.stateValue();
    console.log(`Game ${newgames}: ${buildingString(state)} - ${neutralBuildingString(state)} - ${bonusCardsString(state)} - ${state.stateValue()}`);
}

function getRandomGameStateGWT() {
    let gamestate = {
        buildings: [],
        neutral_buildings: [],
    };

    for (let i = 1; i <= 12; i++) {
        gamestate.buildings.push(rng.nextRange(0, 2));
    }

    let neutral_buildings = ["A", "B", "C", "D", "E", "F", "G"];
    for (let i = neutral_buildings.length - 1; i > 0; i--) {
        let j = rng.nextRange(0, i + 1);
        [neutral_buildings[i], neutral_buildings[j]] = [neutral_buildings[j], neutral_buildings[i]];
    }
    gamestate.neutral_buildings = neutral_buildings;

    gamestate.stateValue = function() {
        let value = "";

        let neutral_buildings_value = this.neutral_buildings.slice(0, -1).join('');
        value += neutral_buildings_value + " ";

        let buildings_value = 0;
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i]) {
                buildings_value |= 1 << i;
            }
        }

        value += formatNumberAsHex(buildings_value, 3) + " ";
        value += formatNumberAsHex(version);

        return value;
    };

    return gamestate;
}

function getRandomGameStateGWTNZ() {
    let gamestate = {
        buildings: [],
        neutral_buildings: [],
        bonus_cards: [],
    };

    for (let i = 1; i <= 10; i++) {
        gamestate.buildings.push(rng.nextRange(0, 2));
    }

    let neutral_buildings = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let i = neutral_buildings.length - 1; i > 0; i--) {
        let j = rng.nextRange(0, i + 1);
        [neutral_buildings[i], neutral_buildings[j]] = [neutral_buildings[j], neutral_buildings[i]];
    }
    gamestate.neutral_buildings = neutral_buildings;

    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 4; i++) {
        let index = rng.nextIndex(numbers);
        let n = numbers[index];
        gamestate.bonus_cards.push(n);
        numbers.splice(index, 1);
    }
    gamestate.bonus_cards = gamestate.bonus_cards.sort((a, b) => a - b);

    gamestate.stateValue = function() {
        let value = "";

        let neutral_buildings_value = this.neutral_buildings.slice(0, -1).join('');
        value += neutral_buildings_value + " ";

        let bonus_cards_value = 0;
        for (let i = 0; i < this.bonus_cards.length; i++) {
            bonus_cards_value |= 1 << this.bonus_cards[i];
        }

        let buildings_value = 0;
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i]) {
                buildings_value |= 1 << i;
            }
        }

        value += formatNumberAsHex(buildings_value + (bonus_cards_value << 10), 5) + " ";
        value += formatNumberAsHex(version);

        return value;
    };

    return gamestate;
}

function buildingString(state) {
    let results = [];
    for (let i = 0; i < state.buildings.length; i++) {
        let side = state.buildings[i] == 0 ? 'A' : 'B';
        results.push(`${i + 1}${side}`);
    }
    return results.join(' ');
}

function neutralBuildingString(state) {
    return state.neutral_buildings.join(' ');
}

function bonusCardsString(state) {
    return state.bonus_cards.map(n => n + 1).join(' ');
}

function formatNumberAsHex(num, length) {
    return num.toString(16).padStart(length, '0').toUpperCase();
}

// Run at load
newgame();
window.newgame = newgame;
