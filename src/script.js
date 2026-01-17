// JavaScript for Random Daily Sport Exercise App

// Exercise definitions with types and default repetition ranges
const exerciseDefinitions = [
    { name: "jumping jacks", unit: "reps", minReps: 20, maxReps: 40 },
    { name: "push-ups", unit: "reps", minReps: 10, maxReps: 30 },
    { name: "squats", unit: "reps", minReps: 10, maxReps: 20 },
    { name: "plank", unit: "seconds", minReps: 30, maxReps: 90 },
    { name: "lunges (each leg)", unit: "reps", minReps: 8, maxReps: 15 },
    { name: "burpees", unit: "reps", minReps: 10, maxReps: 20 },
    { name: "sit-ups", unit: "reps", minReps: 15, maxReps: 35 },
    { name: "wall sit", unit: "seconds", minReps: 20, maxReps: 45 },
    { name: "mountain climbers", unit: "reps", minReps: 15, maxReps: 30 },
    { name: "tricep dips", unit: "reps", minReps: 8, maxReps: 15 },
    { name: "high knees (each leg)", unit: "reps", minReps: 10, maxReps: 20 },
    { name: "bicycle crunches", unit: "reps", minReps: 15, maxReps: 30 },
    { name: "jump squats", unit: "reps", minReps: 8, maxReps: 15 },
    { name: "leg raises", unit: "reps", minReps: 10, maxReps: 20 },
    { name: "butt kicks", unit: "reps", minReps: 20, maxReps: 40 },
    { name: "pike push-ups", unit: "reps", minReps: 8, maxReps: 15 },
    { name: "Russian twists", unit: "reps", minReps: 15, maxReps: 30 },
    { name: "box jumps (or step-ups)", unit: "reps", minReps: 10, maxReps: 20 },
    { name: "superman hold", unit: "seconds", minReps: 30, maxReps: 90 },
    { name: "side lunges (each side)", unit: "reps", minReps: 8, maxReps: 15 }
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
const increaseRangeBtn = document.getElementById('increase-range-btn');
const decreaseRangeBtn = document.getElementById('decrease-range-btn');
const rangeText = document.getElementById('range-text');

// Initialize app state
let appState = {
    score: 0,
    daysCompleted: 0,
    currentExercise: null, // Now stores { exerciseIndex, reps, minReps, maxReps }
    lastCompletedDate: null,
    exerciseRanges: {} // Stores custom ranges per exercise: { exerciseIndex: { minReps, maxReps } }
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
            currentExercise: null,
            lastCompletedDate: null,
            exerciseRanges: {}
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

// Generate an exercise with random reps from the range
function generateExercise(exerciseIndex, customMinReps = null, customMaxReps = null) {
    const definition = exerciseDefinitions[exerciseIndex];
    
    // Use custom ranges if provided, otherwise check stored ranges, then use defaults
    let minReps, maxReps;
    if (customMinReps !== null && customMaxReps !== null) {
        minReps = customMinReps;
        maxReps = customMaxReps;
    } else if (appState.exerciseRanges[exerciseIndex]) {
        minReps = appState.exerciseRanges[exerciseIndex].minReps;
        maxReps = appState.exerciseRanges[exerciseIndex].maxReps;
    } else {
        minReps = definition.minReps;
        maxReps = definition.maxReps;
    }
    
    const reps = Math.floor(Math.random() * (maxReps - minReps + 1)) + minReps;
    
    return {
        exerciseIndex,
        reps,
        minReps,
        maxReps
    };
}

// Format exercise for display
function formatExercise(exercise) {
    if (!exercise) return 'Loading exercise...';
    
    const definition = exerciseDefinitions[exercise.exerciseIndex];
    if (definition.unit === "seconds") {
        if (exercise.reps >= 60) {
            const minutes = Math.floor(exercise.reps / 60);
            const seconds = exercise.reps % 60;
            if (seconds === 0) {
                return `${minutes}-minute ${definition.name}`;
            } else {
                return `${minutes}:${seconds.toString().padStart(2, '0')}-minute ${definition.name}`;
            }
        } else {
            return `${exercise.reps}-second ${definition.name}`;
        }
    } else {
        return `${exercise.reps} ${definition.name}`;
    }
}

// Get daily motivational message based on date
function getDailyMotivationalMessage(date = getTodayDate()) {
    const dateNumber = new Date(date).getTime();
    const index = Math.floor(dateNumber / MS_PER_DAY) % motivationalMessages.length;
    return motivationalMessages[index];
}

// Generate a random exercise (not based on date)
function generateRandomExercise() {
    const index = Math.floor(Math.random() * exerciseDefinitions.length);
    return generateExercise(index);
}

// Update the UI with current state
function updateUI() {
    exerciseText.textContent = formatExercise(appState.currentExercise);
    scoreValue.textContent = calculateCurrentScore();
    daysCompleted.textContent = appState.daysCompleted;
    motivationalMessage.textContent = getDailyMotivationalMessage();
    
    // Update range display and button states
    if (appState.currentExercise) {
        const definition = exerciseDefinitions[appState.currentExercise.exerciseIndex];
        const minReps = appState.currentExercise.minReps;
        const maxReps = appState.currentExercise.maxReps;
        
        // Format range display based on unit type
        if (definition.unit === "seconds") {
            rangeText.textContent = `Range: ${minReps}-${maxReps} seconds`;
        } else {
            rangeText.textContent = `Range: ${minReps}-${maxReps} reps`;
        }
        
        decreaseRangeBtn.disabled = appState.currentExercise.minReps <= definition.minReps && 
                                      appState.currentExercise.maxReps <= definition.maxReps;
    }
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

// Increase the repetition range for current exercise
function increaseRange() {
    if (!appState.currentExercise) return;
    
    const rangeIncrease = 5;
    appState.currentExercise.minReps += rangeIncrease;
    appState.currentExercise.maxReps += rangeIncrease;
    
    // Store the custom range for this exercise
    appState.exerciseRanges[appState.currentExercise.exerciseIndex] = {
        minReps: appState.currentExercise.minReps,
        maxReps: appState.currentExercise.maxReps
    };
    
    // Regenerate reps within new range
    const minReps = appState.currentExercise.minReps;
    const maxReps = appState.currentExercise.maxReps;
    appState.currentExercise.reps = Math.floor(Math.random() * (maxReps - minReps + 1)) + minReps;
    
    saveState();
    updateUI();
}

// Decrease the repetition range for current exercise
function decreaseRange() {
    if (!appState.currentExercise) return;
    
    const definition = exerciseDefinitions[appState.currentExercise.exerciseIndex];
    const rangeDecrease = 5;
    
    // Don't go below the default minimum
    const newMinReps = Math.max(definition.minReps, appState.currentExercise.minReps - rangeDecrease);
    const newMaxReps = Math.max(definition.maxReps, appState.currentExercise.maxReps - rangeDecrease);
    
    // Only update if we can actually decrease
    if (newMinReps < appState.currentExercise.minReps || newMaxReps < appState.currentExercise.maxReps) {
        appState.currentExercise.minReps = newMinReps;
        appState.currentExercise.maxReps = newMaxReps;
        
        // Store or remove the custom range for this exercise
        if (newMinReps === definition.minReps && newMaxReps === definition.maxReps) {
            // Back to defaults, remove custom range
            delete appState.exerciseRanges[appState.currentExercise.exerciseIndex];
        } else {
            appState.exerciseRanges[appState.currentExercise.exerciseIndex] = {
                minReps: newMinReps,
                maxReps: newMaxReps
            };
        }
        
        // Regenerate reps within new range
        const minReps = appState.currentExercise.minReps;
        const maxReps = appState.currentExercise.maxReps;
        appState.currentExercise.reps = Math.floor(Math.random() * (maxReps - minReps + 1)) + minReps;
        
        saveState();
        updateUI();
    }
}

// Initialize the app
function initApp() {
    loadState();
    
    // Get today's exercise (use random exercise if no current exercise set)
    if (!appState.currentExercise) {
        appState.currentExercise = generateRandomExercise();
        saveState();
    }
    
    // Update UI
    updateUI();
    
    // Add event listeners
    completeBtn.addEventListener('click', completeExercise);
    newExerciseBtn.addEventListener('click', getNewExercise);
    increaseRangeBtn.addEventListener('click', increaseRange);
    decreaseRangeBtn.addEventListener('click', decreaseRange);
    
    console.log('App initialized successfully');
}

// Start the app when DOM is ready
initApp();
