// Game State
let gameState = {
    game_data: {
        points: 0,
        pointsPerClick: 1,
        upgradeCost: 10,
        autoClickerRate: 0,
        prestigeLevel: 0,
        boostActive: false,
    },
    preferences: {
        darkMode: false,
    },
};

// UI Elements
const elements = {
    pointsDisplay: document.getElementById('points'),
    pointsPerClickDisplay: document.getElementById('points-per-click'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    clickerBtn: document.getElementById('clicker-btn'),
    autoClickBtn: document.getElementById('auto-click-btn'),
    boostBtn: document.getElementById('boost-btn'),
    prestigeBtn: document.getElementById('prestige-btn'),
    resetBtn: document.getElementById('reset-btn'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
};

let autoClickerInterval = null;
let boostTimer = null;

// Load Game State
async function loadGame() {
    try {
        const response = await fetch('/load');
        if (response.ok) {
            const data = await response.json();
            gameState.game_data = { ...gameState.game_data, ...data.game_data };
            gameState.preferences = { ...gameState.preferences, ...data.preferences };

            // Apply Dark Mode
            if (gameState.preferences.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }

            updateDisplay();
            if (gameState.game_data.autoClickerRate > 0) startAutoClicker();
        } else {
            console.error('Failed to load game:', await response.text());
        }
    } catch (err) {
        console.error('Error loading game:', err);
    }
}

// Save Game State
async function saveGame() {
    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameState),
        });

        if (!response.ok) {
            console.error('Failed to save game:', await response.text());
        }
    } catch (err) {
        console.error('Error saving game:', err);
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    gameState.preferences.darkMode = !gameState.preferences.darkMode;
    document.body.classList.toggle('dark-mode', gameState.preferences.darkMode);
    saveGame();
}

// Clicker Button - Earn Points
elements.clickerBtn.addEventListener('click', () => {
    let pointsEarned = gameState.game_data.pointsPerClick;
    if (gameState.game_data.boostActive) pointsEarned *= 2;
    gameState.game_data.points += pointsEarned;

    saveGame();
    updateDisplay();
});

// Upgrade Button - Increase Points Per Click
elements.upgradeBtn.addEventListener('click', () => {
    if (gameState.game_data.points >= gameState.game_data.upgradeCost) {
        gameState.game_data.points -= gameState.game_data.upgradeCost;
        gameState.game_data.pointsPerClick++;
        gameState.game_data.upgradeCost = Math.floor(gameState.game_data.upgradeCost * 1.5);

        saveGame();
        updateDisplay();
    }
});

// Auto-Clicker Button
elements.autoClickBtn.addEventListener('click', () => {
    const autoClickerCost = 50; // Fixed cost for auto-clickers
    if (gameState.game_data.points >= autoClickerCost) {
        gameState.game_data.points -= autoClickerCost;
        gameState.game_data.autoClickerRate++;
        if (!autoClickerInterval) startAutoClicker();

        saveGame();
        updateDisplay();
    }
});

// Boost Button
elements.boostBtn.addEventListener('click', () => {
    const boostCost = 100; // Fixed cost for boosts
    if (gameState.game_data.points >= boostCost && !gameState.game_data.boostActive) {
        gameState.game_data.points -= boostCost;
        gameState.game_data.boostActive = true;

        boostTimer = setTimeout(() => {
            gameState.game_data.boostActive = false;
            saveGame();
            updateDisplay();
        }, 10000); // Boost lasts 10 seconds

        saveGame();
        updateDisplay();
    }
});

// Prestige Button
elements.prestigeBtn.addEventListener('click', () => {
    const prestigeCost = 1000; // Fixed cost for prestige
    if (gameState.game_data.points >= prestigeCost) {
        gameState.game_data.points = 0;
        gameState.game_data.pointsPerClick = 1;
        gameState.game_data.upgradeCost = 10;
        gameState.game_data.autoClickerRate = 0;
        gameState.game_data.boostActive = false;
        gameState.game_data.prestigeLevel++;

        saveGame();
        updateDisplay();
    }
});

// Reset Button
elements.resetBtn.addEventListener('click', () => {
    gameState.game_data = {
        points: 0,
        pointsPerClick: 1,
        upgradeCost: 10,
        autoClickerRate: 0,
        prestigeLevel: 0,
        boostActive: false,
    };

    saveGame();
    updateDisplay();
});

// Start Auto-Clicker
function startAutoClicker() {
    clearInterval(autoClickerInterval);
    autoClickerInterval = setInterval(() => {
        gameState.game_data.points += gameState.game_data.autoClickerRate;
        saveGame();
        updateDisplay();
    }, 1000); // Runs every second
}

// Update Display
function updateDisplay() {
    elements.pointsDisplay.textContent = gameState.game_data.points;
    elements.pointsPerClickDisplay.textContent = gameState.game_data.pointsPerClick;

    // Update Auto-Clicker Rate Display
    const autoClickerRateDisplay = document.getElementById('auto-clicker-rate');
    autoClickerRateDisplay.textContent = `Auto-Clicker Rate: ${gameState.game_data.autoClickerRate}`;

    elements.upgradeBtn.textContent = `Upgrade Clicker (Cost: ${gameState.game_data.upgradeCost} Points)`;
    elements.autoClickBtn.textContent = `Buy Auto-Clicker (Cost: 50 Points)`;
    elements.boostBtn.textContent = gameState.game_data.boostActive
        ? 'Boost Active!'
        : 'Activate Boost (Cost: 100 Points)';
    elements.prestigeBtn.textContent = 'Prestige (Cost: 1000 Points)';
}

// Dark Mode Toggle
elements.darkModeToggle.addEventListener('click', toggleDarkMode);

// Initialize the Game
loadGame();
