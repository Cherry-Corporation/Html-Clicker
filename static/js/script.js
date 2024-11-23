// Game state variables
let points = 0;
let pointsPerClick = 1; // Starting points per click
let upgradeCost = 10;
let autoClickerRate = 0;
let prestigeLevel = 0;
let boostActive = false;
let boostDuration = 10; // Boost duration in seconds
let boostTimer = null;
let autoClickerInterval;

// Save control
let stateChanged = false; // Tracks if the state has changed
let saveTimeout = null; // Debounce timer for saving

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

// Load game data from the server
async function loadGame() {
    try {
        const response = await fetch('/load'); // Use a GET route to load data
        if (response.ok) {
            const responseData = await response.json();
            console.log("Loaded game data:", responseData); // Log response to check

            const data = responseData.data || {}; // Access the correct data object
            const preferences = responseData.preferences || {}; // Access the preferences object

            // Set the variables from the loaded data
            points = data.points || 0;
            pointsPerClick = data.pointsPerClick || 1;
            upgradeCost = data.upgradeCost || 10;
            autoClickerRate = data.autoClickerRate || 0;
            prestigeLevel = data.prestigeLevel || 0;
            boostActive = data.boostActive || false;

            // Apply dark mode preference if set
            if (preferences.darkMode) {
                document.body.classList.add("dark-mode");
                darkModeToggle.classList.add("dark-mode");
                updateDarkModeText();
            }

            // Adjust points per click based on the prestige level
            pointsPerClick += prestigeLevel; // Increase points per click by prestige level

            // Log to verify the variables are set correctly
            console.log("Loaded Points:", points);
            console.log("Loaded Points Per Click:", pointsPerClick);

            updateDisplay();
            if (autoClickerRate > 0) startAutoClicker(); // Restart auto-clicker if applicable
            console.log("Game loaded successfully.");
        } else {
            console.error("Failed to load game data:", await response.text());
        }
    } catch (error) {
        console.error("Error loading game data:", error);
    }
}


// Save game data to the server
async function saveGame() {
    try {
        const data = {
            points,
            pointsPerClick,
            upgradeCost,
            autoClickerRate,
            prestigeLevel,
            boostActive
        };
        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            stateChanged = false; // Reset change flag after successful save
            console.log("Game saved successfully.");
        } else {
            console.error("Failed to save game data:", await response.text());
        }
    } catch (error) {
        console.error("Error saving game data:", error);
    }
}

// Mark state as changed whenever a game state variable is modified
function markStateChanged() {
    stateChanged = true;
    saveGame(); // Trigger save whenever the state changes
}


// Dark Mode toggle
darkModeToggle.addEventListener("click", async () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggle.classList.toggle("dark-mode");
    updateDarkModeText();

    // Save the dark mode preference to the server
    const preferences = {
        darkMode: document.body.classList.contains("dark-mode")
    };

    // Send preference update to the server
    try {
        const response = await fetch('/update-preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences })
        });
        if (response.ok) {
            console.log("Dark mode preference saved successfully.");
        } else {
            console.error("Failed to save dark mode preference:", await response.text());
        }
    } catch (error) {
        console.error("Error saving dark mode preference:", error);
    }
});


// Update text based on dark mode or light mode
function updateDarkModeText() {
    if (document.body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "Switch to Light Mode";
    } else {
        darkModeToggle.textContent = "Switch to Dark Mode";
    }
}

// Click Button (earn points)
clickerBtn.addEventListener("click", () => {
    let pointsEarned = pointsPerClick;
    if (boostActive) pointsEarned *= 2; // Boost doubles points per click
    points += pointsEarned;
    markStateChanged(); // Trigger save immediately
    updateDisplay();
});

// Upgrade Clicker
upgradeBtn.addEventListener("click", () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        pointsPerClick++;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        markStateChanged(); // Trigger save immediately
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
        markStateChanged(); // Trigger save immediately
        updateAutoClickBtnText();
        updateDisplay();
    }
});

// Activate Boost
boostBtn.addEventListener("click", () => {
    if (points >= 100 && !boostActive) {
        points -= 100;
        boostActive = true;
        markStateChanged(); // Trigger save immediately
        updateBoostBtnText();
        boostTimer = setTimeout(() => {
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
        pointsPerClick = 1; // Reset to base value before applying prestige bonus
        upgradeCost = 10; // Reset upgrade cost on prestige
        autoClickerRate = 0;
        prestigeLevel++;
        pointsPerClick += prestigeLevel; // Increase points per click based on prestige
        markStateChanged(); // Trigger save immediately
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
    markStateChanged(); // Trigger save immediately
    updateDisplay();
});

// Update the display
function updateDisplay() {
    pointsDisplay.innerText = points;
    pointsPerClickDisplay.innerText = pointsPerClick;
    autoClickerRateDisplay.innerText = autoClickerRate;
    prestigeLevelDisplay.innerText = prestigeLevel;

    updateBoostBtnText();
}

// Auto Clicker Function
function startAutoClicker() {
    clearInterval(autoClickerInterval); // Prevent multiple intervals
    autoClickerInterval = setInterval(() => {
        points += autoClickerRate;
        markStateChanged(); // Trigger save immediately
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
loadGame(); // Load game state when the page loads
