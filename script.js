
let rng = new RNG(0);
const version = 0;

function onload() {
    let date = new Date();
    let y = `${date.getFullYear()}`
    let m = `${date.getMonth()+1}`.padStart(2, "0")
    let d = `${date.getDay()+1}`.padStart(2, "0")
    let seed = parseInt(y + m + d)
    console.log(date)
    console.log(y, m, d, seed)
    rng = new RNG(seed);
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
        gamestate.buildings.push(rng.nextRange(0, 2));
    }

    let neutral_buildings = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let i = neutral_buildings.length - 1; i > 0; i--) {
        let j = rng.nextRange(0, i+1);
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

function RNG(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
}
RNG.prototype.nextFloat = function() {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.nextIndex = function(array) {
    return this.nextRange(0, array.length);
}
