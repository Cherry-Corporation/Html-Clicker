// Game state variables
let points = 0;
let pointsPerClick = 1;
let upgradeCost = 10;
let autoClickerRate = 0;
let prestigeLevel = 0;
let boostActive = false;
let boostDuration = 10; // Boost duration in seconds
let autoClickerInterval;

// UI elements
const pointsDisplay = document.getElementById("points");
const pointsPerClickDisplay = document.getElementById("points-per-click");
const autoClickerRateDisplay = document.getElementById("auto-clicker-rate");
const prestigeLevelDisplay = document.getElementById("prestige-level");
const clickerBtn = document.getElementById("clicker-btn");
const upgradeBtn = document.getElementById("upgrade-btn");
const autoClickBtn = document.getElementById("auto-click-btn");
const prestigeBtn = document.getElementById("prestige-btn");
const resetBtn = document.getElementById("reset-btn");
const boostBtn = document.getElementById("boost-btn");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Dark Mode toggle
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggle.classList.toggle("dark-mode");
    updateDarkModeText();
});

// Update text based on dark mode or light mode
function updateDarkModeText() {
    if (document.body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "Switch to Light Mode";
    } else {
        darkModeToggle.textContent = "Switch to Dark Mode";
    }
}

// Click Button
clickerBtn.addEventListener("click", () => {
    let pointsEarned = pointsPerClick;
    if (boostActive) pointsEarned *= 2; // Boost doubles points per click
    points += pointsEarned;
    updateDisplay();
});

// Upgrade Clicker
upgradeBtn.addEventListener("click", () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        pointsPerClick++;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        updateUpgradeBtnText();
        updateDisplay();
    }
});

// Buy Auto-Clicker
autoClickBtn.addEventListener("click", () => {
    if (points >= 50) {
        points -= 50;
        autoClickerRate++;
        if (autoClickerRate === 1) startAutoClicker(); // Start auto-clicker after first purchase
        updateAutoClickBtnText();
        updateDisplay();
    }
});

// Activate Boost
boostBtn.addEventListener("click", () => {
    if (points >= 100 && !boostActive) {
        points -= 100;
        boostActive = true;
        updateBoostBtnText();
        setTimeout(() => {
            boostActive = false;
            updateBoostBtnText();
            updateDisplay();
        }, boostDuration * 1000);
        updateDisplay();
    }
});

// Prestige Button
prestigeBtn.addEventListener("click", () => {
    if (points >= 1000) {
        points = 0;
        pointsPerClick = 1;
        upgradeCost = 10; // Reset upgrade cost on prestige
        autoClickerRate = 0;
        prestigeLevel++;
        updateDisplay();
    }
});

// Reset Button
resetBtn.addEventListener("click", () => {
    points = 0;
    pointsPerClick = 1;
    prestigeLevel = 0;
    upgradeCost = 10; // Reset upgrade cost
    autoClickerRate = 0;
    boostActive = false; // Ensure boost is deactivated
    updateDisplay();
});

// Update the display
function updateDisplay() {
    pointsDisplay.innerText = points;
    pointsPerClickDisplay.innerText = pointsPerClick;
    autoClickerRateDisplay.innerText = autoClickerRate;
    prestigeLevelDisplay.innerText = prestigeLevel;
}

// Auto Clicker Function
function startAutoClicker() {
    autoClickerInterval = setInterval(() => {
        points += autoClickerRate;
        updateDisplay();
    }, 1000);
}

// Update Button Text
function updateUpgradeBtnText() {
    upgradeBtn.innerText = `Upgrade Clicker (Cost: ${upgradeCost} Points)`;
}

function updateAutoClickBtnText() {
    autoClickBtn.innerText = `Buy Auto-Clicker (Cost: 50 Points)`;
}

function updateBoostBtnText() {
    if (boostActive) {
        boostBtn.innerText = `Boost Active! (Duration: ${boostDuration}s)`;
    } else {
        boostBtn.innerText = `Activate Boost (Cost: 100 Points)`;
    }
}

// Initialize Display
updateDisplay();
