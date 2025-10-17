class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        this.color = (suit === 'Hearts' || suit === 'Diamonds') ? 'red' : 'black';
        this.symbol = this.getSuitSymbol(suit);
    }

    getSuitSymbol(suit) {
        switch (suit) {
            case 'Hearts': return '♥';
            case 'Diamonds': return '♦';
            case 'Clubs': return '♣';
            case 'Spades': return '♠';
            default: return '';
        }
    }

    getValue() {
        if (['J', 'Q', 'K'].includes(this.value)) return 10;
        if (this.value === 'A') return 11;
        return parseInt(this.value);
    }

    toString() {
        return `${this.value} ${this.symbol}`;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.initialize()
    }

    initialize() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.cards = [];

        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(value, suit));
            }
        }
    }

    shuffle() {
        let count = this.cards.length;
        while (count) {
            let i = Math.floor(Math.random() * count--);
            [this.cards[count], this.cards[i]] = [this.cards[i], this.cards[count]];
        }
    }

    deal() {
        return this.cards.pop();
    }

    get remaining() {
        return this.cards.length;
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(drawnCard) {
        this.cards.push(drawnCard)
    }
    
    empty() {
        this.cards = [];
    }

    getTotalValue() {
        let totalValue = 0;
        let numAces = 0;

        for (const card of this.cards) {
            totalValue += card.getValue();
            if (card.value === 'A')
                numAces++;
        }

        while (totalValue > 21 && numAces > 0) {
            totalValue -= 10;
            numAces--;
        }

        return totalValue;
    }
}

const hitButton = document.getElementById('hitButton');
const stayButton = document.getElementById('stayButton');
const playButton = document.getElementById('playButton');
const ComputerHandArea = document.getElementById('ComputerHandArea');
const PlayerHandArea = document.getElementById('PlayerHandArea');
const cardElement = document.getElementById('cardElement');
const deckInfo = document.getElementById('deckInfo');
const cardValueBtm = document.getElementById('cardValueBtm');

let gameDeck = new Deck();
let computerHand = new Hand();
let playerHand = new Hand();

// render cards and total score in hand
function displayHand(hand, areaElement, hideFirstCard = false) {
    const titleHtml = areaElement.querySelector('h2').outerHTML;
    areaElement.innerHTML = titleHtml;

    const cardList = document.createElement('ul');
    cardList.classList.add('card-list');

    hand.cards.forEach((card, index) => {
        const isHidden = hideFirstCard && index === 0;

        const listItem = document.createElement('li');
        listItem.classList.add('card-item');

        if (isHidden) {
            listItem.style.backgroundColor = '#8c8c8c';
            listItem.style.color = 'white';
            listItem.innerHTML = `
                    <div>BACK</div>
                    <small>Hidden</small>
                `;
        } else {
            listItem.classList.add(card.color);
            listItem.innerHTML = `
                    <div>${card.toString()}</div>
                    <small>${card.suit}</small>
                `;
        }

        cardList.appendChild(listItem);
    });

    const totalElement = document.createElement('div');
    totalElement.classList.add('total-score');

    totalElement.textContent = `Total: ${hideFirstCard ? '?' : hand.getTotalValue()}`;

    areaElement.appendChild(cardList);
    areaElement.appendChild(totalElement);
}

// renders drawn card in center
function displayDrawnCard(card) {
    const cardValue = document.getElementById('cardValue');
    const cardSymbol = document.getElementById('cardSymbol');

    cardValueBtm.textContent = card.value;

    cardValue.textContent = card.value;
    cardSymbol.textContent = card.symbol;

    cardElement.className = 'card';
    cardElement.classList.add(card.color);
}

// clears display
function clearDisplay() {
    displayHand(new Hand(), ComputerHandArea);
    displayHand(new Hand(), PlayerHandArea);
    document.getElementById('cardValue').textContent = '';
    document.getElementById('cardSymbol').textContent = '🃏';
    cardValueBtm.textContent = '';
    cardElement.className = 'card';
    deckInfo.textContent = 'Deck: 52';
    document.getElementById('resultText').textContent = "Click 'Deal / Hit' to start a new game!";
}

// plays game
function play() {
    // Reset state
    clearDisplay();
    gameDeck.initialize();
    gameDeck.shuffle();

    playerHand.empty();
    computerHand.empty();

    document.getElementById('resultText').textContent = "Player turn: Hit or Stay?";
    initializeGame(computerHand, playerHand, gameDeck);
}

function hit()
{
    document.getElementById('resultText').textContent = "Player turn: Hit or Stay?";
    const card = gameDeck.deal();
    displayDrawnCard(card);
    playerHand.addCard(card);
    displayHand(playerHand, PlayerHandArea);

    if(computerHand.getTotalValue >= 17)
        document.getElementById('resultText').textContent = "Dealer Stays";
    else {
        document.getElementById('resultText').textContent = "Dealer's Turn";
        card = gameDeck.deal();
        displayDrawnCard(card);
        computerHand.addCard(card);
        displayHand(computerHand, ComputerHandArea);
    }

    document.getElementById('resultText').textContent = "Player turn: Hit or Stay?";

    window.computerHand = computerHand;
    window.playerHand = playerHand;

    setTimeout(() => {
        document.getElementById('cardValue').textContent = '';
        document.getElementById('cardSymbol').textContent = '?';
        document.getElementById('cardValueBtm').textContent = '';
        cardElement.className = 'card';
    }, 500);
}

function initializeGame(computerHand, playerHand, gameDeck)
{
    // Initializing game
    // Deal 2 cards to each player alternately
    for (let i = 0; i < 4; i++) {
        const card = gameDeck.deal();
        if (!card) break;

        displayDrawnCard(card);

        if (i % 2 === 0) {
            // Deal to Dealer
            computerHand.addCard(card);
            displayHand(computerHand, ComputerHandArea, true);
        }
        else {
            // Deal to Player
            playerHand.addCard(card);
            displayHand(playerHand, PlayerHandArea);
        }
        deckInfo.textContent = `Deck: ${gameDeck.remaining}`;
    }

    window.computerHand = computerHand;
    window.playerHand = playerHand;

    setTimeout(() => {
        document.getElementById('cardValue').textContent = '';
        document.getElementById('cardSymbol').textContent = '?';
        document.getElementById('cardValueBtm').textContent = '';
        cardElement.className = 'card';
    }, 500);
}

function endGame(computerHand, playerHand) {
    
}

playButton.addEventListener('click', play);
hitButton.addEventListener('click', hit);
stayButton.addEventListener('click', endGame);

window.onload = clearDisplay;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
console.log("App ID:", appId);