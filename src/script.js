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

// Array of motivational messages
const motivationalMessages = [
    "Stay active, stay healthy! Every day is a new opportunity to improve yourself. 💪",
    "You're stronger than you think! Keep pushing forward! 🌟",
    "Small steps lead to big changes. Keep going! 🚀",
    "Your body can do anything, it's your mind you need to convince! 💯",
    "The only bad workout is the one you didn't do! 🔥",
    "Believe in yourself and you will be unstoppable! ⭐",
    "Progress, not perfection. You've got this! 💪",
    "Every exercise brings you closer to your goals! 🎯",
    "Sweat now, shine later! Keep moving! ✨",
    "Don't stop when you're tired, stop when you're done! 🏆"
];

// Array of success messages for completing an exercise
const successMessages = [
    "Excellent work! Your score has increased. Keep up the great effort! 💪",
    "Amazing! You're crushing it today! 🌟",
    "Fantastic job! You're on fire! 🔥",
    "Well done! Your dedication is inspiring! ⭐",
    "Outstanding! You're getting stronger every day! 💯",
    "Bravo! Keep that momentum going! 🚀",
    "Superb! You're a fitness champion! 🏆",
    "Awesome! Your hard work is paying off! ✨",
    "Great job! You're unstoppable! 💪",
    "Wonderful! You're making excellent progress! 🎯"
];

// Get DOM elements
const exerciseText = document.getElementById('exercise-text');
const completeBtn = document.getElementById('complete-btn');
const newExerciseBtn = document.getElementById('new-exercise-btn');
const scoreValue = document.getElementById('score-value');
const daysCompleted = document.getElementById('days-completed');
const motivationalMessage = document.getElementById('motivational-message');

// Initialize app state
let appState = {
    score: 0,
    daysCompleted: 0,
    currentExercise: '',
    lastCompletedDate: null
};

// Load state from localStorage
function loadState() {
    try {
        const savedState = localStorage.getItem('exerciseAppState');
        if (savedState) {
            appState = JSON.parse(savedState);
        }
    } catch (error) {
        console.error('Error loading state from localStorage:', error);
        // Reset to default state if corrupted
        appState = {
            score: 0,
            daysCompleted: 0,
            currentExercise: '',
            lastCompletedDate: null
        };
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

// Constants
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Calculate days between two dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / MS_PER_DAY);
}

// Generate daily exercise based on date
function generateDailyExercise(date = getTodayDate()) {
    const dateNumber = new Date(date).getTime();
    const index = dateNumber % exercises.length;
    return exercises[index];
}

// Get daily motivational message based on date
function getDailyMotivationalMessage(date = getTodayDate()) {
    const dateNumber = new Date(date).getTime();
    const index = Math.floor(dateNumber / MS_PER_DAY) % motivationalMessages.length;
    return motivationalMessages[index];
}

// Generate a random exercise (not based on date)
function generateRandomExercise() {
    const index = Math.floor(Math.random() * exercises.length);
    return exercises[index];
}

// Update the UI with current state
function updateUI() {
    exerciseText.textContent = appState.currentExercise;
    scoreValue.textContent = calculateCurrentScore();
    daysCompleted.textContent = appState.daysCompleted;
    motivationalMessage.textContent = getDailyMotivationalMessage();
}

// Calculate penalties for missed days
function calculatePenalties(baseScore, missedDays) {
    let score = baseScore;
    
    // Apply linear penalty for each missed day
    // Penalty increases by 5 for each consecutive day: 5, 10, 15, 20...
    for (let i = 0; i < missedDays; i++) {
        const penalty = 5 * (1 + i);
        score = Math.max(0, score - penalty);
    }
    
    return score;
}

// Calculate current score based on last completion date
function calculateCurrentScore() {
    // If user has never completed an exercise, return 0
    if (!appState.lastCompletedDate) {
        return 0;
    }
    
    const today = getTodayDate();
    const daysSinceCompletion = daysBetween(appState.lastCompletedDate, today);
    
    // If completed today or yesterday, no penalty
    if (daysSinceCompletion <= 1) {
        return appState.score;
    }
    
    // Calculate penalty for missed days
    const missedDays = daysSinceCompletion - 1;
    return calculatePenalties(appState.score, missedDays);
}

// Handle exercise completion
function completeExercise() {
    const today = getTodayDate();
    
    // Check if already completed today
    if (appState.lastCompletedDate === today) {
        alert('Great job! You\'ve already completed today\'s exercise!');
        return;
    }
    
    // Calculate days since last completion and apply penalties if needed
    if (appState.lastCompletedDate) {
        const daysSinceCompletion = daysBetween(appState.lastCompletedDate, today);
        
        // If more than 1 day has passed, update saved score with penalties
        if (daysSinceCompletion > 1) {
            const missedDays = daysSinceCompletion - 1;
            appState.score = calculatePenalties(appState.score, missedDays);
        }
    }
    
    // Increase score and days completed
    appState.score += 10;
    appState.daysCompleted += 1;
    appState.lastCompletedDate = today;
    
    saveState();
    updateUI();
    
    // Show random success message
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
    alert(randomMessage);
}

// Handle new exercise request
function getNewExercise() {
    const newExercise = generateRandomExercise();
    appState.currentExercise = newExercise;
    saveState();
    updateUI();
}

// Initialize the app
function initApp() {
    loadState();
    
    // Get today's exercise (use daily exercise if no current exercise set)
    if (!appState.currentExercise) {
        appState.currentExercise = generateDailyExercise();
        saveState();
    }
    
    // Update UI
    updateUI();
    
    // Add event listeners
    completeBtn.addEventListener('click', completeExercise);
    newExerciseBtn.addEventListener('click', getNewExercise);
    
    console.log('App initialized successfully');
}

// Start the app when DOM is ready
initApp();
