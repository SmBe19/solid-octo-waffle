// JavaScript for Random Daily Sport Exercise App

// Array of sport exercises
const exercises = [
    "30 jumping jacks",
    "20 push-ups",
    "15 squats",
    "1-minute plank",
    "20 lunges (10 each leg)",
    "15 burpees",
    "25 sit-ups",
    "30-second wall sit",
    "20 mountain climbers",
    "10 tricep dips",
    "15 high knees (each leg)",
    "20 bicycle crunches",
    "10 jump squats",
    "15 leg raises",
    "30 butt kicks",
    "12 pike push-ups",
    "20 Russian twists",
    "15 box jumps (or step-ups)",
    "1-minute superman hold",
    "20 side lunges (10 each side)"
];

// Get DOM elements
const exerciseText = document.getElementById('exercise-text');
const completeBtn = document.getElementById('complete-btn');
const skipBtn = document.getElementById('skip-btn');
const scoreValue = document.getElementById('score-value');
const daysCompleted = document.getElementById('days-completed');

// Initialize app state
let appState = {
    score: 0,
    daysCompleted: 0,
    currentExercise: '',
    lastCompletedDate: null,
    lastSkippedDate: null,
    consecutiveSkips: 0
};

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('exerciseAppState');
    if (savedState) {
        appState = JSON.parse(savedState);
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('exerciseAppState', JSON.stringify(appState));
}

// Get today's date as a string (YYYY-MM-DD)
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Generate or retrieve daily exercise
function getDailyExercise() {
    const today = getTodayDate();
    
    // Check if we need a new exercise for today
    const savedExerciseDate = localStorage.getItem('exerciseDate');
    const savedExercise = localStorage.getItem('currentExercise');
    
    if (savedExerciseDate === today && savedExercise) {
        return savedExercise;
    }
    
    // Generate new exercise using date as seed for consistency
    const dateNumber = new Date(today).getTime();
    const index = dateNumber % exercises.length;
    const newExercise = exercises[index];
    
    // Save the new exercise
    localStorage.setItem('exerciseDate', today);
    localStorage.setItem('currentExercise', newExercise);
    appState.currentExercise = newExercise;
    saveState();
    
    return newExercise;
}

// Update the UI with current state
function updateUI() {
    exerciseText.textContent = appState.currentExercise;
    scoreValue.textContent = appState.score;
    daysCompleted.textContent = appState.daysCompleted;
}

// Calculate score decrease based on consecutive skips
function calculateScoreDecrease() {
    // Base decrease is 5 points
    // Accelerates: 5, 10, 20, 40, 80...
    return 5 * Math.pow(2, appState.consecutiveSkips);
}

// Handle exercise completion
function completeExercise() {
    const today = getTodayDate();
    
    // Check if already completed today
    if (appState.lastCompletedDate === today) {
        alert('Great job! You\'ve already completed today\'s exercise!');
        return;
    }
    
    // Increase score and days completed
    appState.score += 10;
    appState.daysCompleted += 1;
    appState.lastCompletedDate = today;
    appState.consecutiveSkips = 0; // Reset consecutive skips
    
    saveState();
    updateUI();
    
    alert('Excellent work! Your score has increased. Keep up the great effort! 💪');
}

// Handle exercise skip
function skipExercise() {
    const today = getTodayDate();
    
    // Check if already completed today
    if (appState.lastCompletedDate === today) {
        alert('You\'ve already completed today\'s exercise! No need to skip.');
        return;
    }
    
    // Check if already skipped today
    if (appState.lastSkippedDate === today) {
        alert('You\'ve already skipped today\'s exercise.');
        return;
    }
    
    // Decrease score with acceleration, but don't go below 0
    const decrease = calculateScoreDecrease();
    appState.score = Math.max(0, appState.score - decrease);
    appState.consecutiveSkips += 1;
    appState.lastSkippedDate = today; // Mark as skipped for today
    
    saveState();
    updateUI();
    
    const message = appState.consecutiveSkips > 1 
        ? `Exercise skipped. Score decreased by ${decrease} points. Warning: Consecutive skips accelerate score loss!`
        : `Exercise skipped. Score decreased by ${decrease} points.`;
    
    alert(message);
}

// Initialize the app
function initApp() {
    loadState();
    
    // Get today's exercise
    appState.currentExercise = getDailyExercise();
    
    // Update UI
    updateUI();
    
    // Add event listeners
    completeBtn.addEventListener('click', completeExercise);
    skipBtn.addEventListener('click', skipExercise);
    
    console.log('App initialized successfully');
}

// Start the app when DOM is ready
initApp();
