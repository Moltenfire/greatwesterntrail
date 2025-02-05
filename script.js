
const prng = splitmix32((Math.random()*2**32)>>>0);
const version = 0;

function onload() {
    let yourDate = new Date()
    Math.seedrandom(yourDate.toISOString().split('T')[0]);
    newgame();
}

function newgame() {
    state = getRandomGameState();
    document.getElementById('buildings').innerText = buildingString(state);
    document.getElementById('neutral_buildings').innerText = neutralBuildingString(state);
    document.getElementById('bonus_cards').innerText = bonusCardsString(state);
    document.getElementById('state_value').innerText = stateValue(state);
}

function getRandomGameState() {
    let gamestate = {
        buildings: [],
        neutral_buildings: [],
        bonus_cards: [],
    }
    for (let i = 1; i <= 10; i++) {
        gamestate.buildings.push(prng() < 0.5 ? 0 : 1);
    }

    let neutral_buildings = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let i = neutral_buildings.length - 1; i > 0; i--) {
        let j = Math.floor(prng() * (i + 1));
        [neutral_buildings[i], neutral_buildings[j]] = [neutral_buildings[j], neutral_buildings[i]];
    }
    gamestate.neutral_buildings = neutral_buildings;

    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 4; i++) {
        let index = Math.floor(prng() * numbers.length);
        let n = numbers[index];
        gamestate.bonus_cards.push(n);
        numbers.splice(index, 1);
    }
    gamestate.bonus_cards = gamestate.bonus_cards.sort((a, b) => a - b);

    return gamestate;
}

function buildingString(state) {
    let results = [];
    for (let i = 0; i < state.buildings.length; i++) {
        let side = state.buildings[i] == 0 ? 'A' : 'B';
        results.push(`${i+1}${side}`);
    }
    return results.join(' ');
}

function neutralBuildingString(state) {
    return state.neutral_buildings.join(' ');
}

function bonusCardsString(state) {
    let results = [];
    for (let i = 0; i < state.bonus_cards.length; i++) {
        results.push(state.bonus_cards[i]+1);
    }
    return results.join(' ');
}

function formatNumberAsHex(num, length) {
    return num.toString(16).padStart(length, '0').toUpperCase();
}

function stateValue(state) {
    let value = "";

    neutral_buildings_value = "";
    for (let i = 0; i < state.neutral_buildings.length-1; i++) {
        neutral_buildings_value += state.neutral_buildings[i];
    }
    value += neutral_buildings_value + " ";

    bonus_cards_value = 0;
    for (let i = 0; i < state.bonus_cards.length; i++) {
        bonus_cards_value |= 1 << state.bonus_cards[i];
    }
    
    buildings_value = 0;
    for (let i = 0; i < state.buildings.length; i++) {
        if (state.buildings[i]) {
            buildings_value |= 1 << i;
        }
    }
    value += formatNumberAsHex(buildings_value + (bonus_cards_value << 10), 5) + " "

    value += formatNumberAsHex(version);

    return value;
}

function splitmix32(a) {
    return function() {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}
