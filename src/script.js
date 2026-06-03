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
const exerciseDisplay = document.getElementById('exercise-display');
const completeBtn = document.getElementById('complete-btn');
const newExerciseBtn = document.getElementById('new-exercise-btn');
const scoreValue = document.getElementById('score-value');
const daysCompleted = document.getElementById('days-completed');
const motivationalMessage = document.getElementById('motivational-message');
const increaseRangeBtn = document.getElementById('increase-range-btn');
const decreaseRangeBtn = document.getElementById('decrease-range-btn');
const rangeText = document.getElementById('range-text');
const notificationsToggle = document.getElementById('notifications-toggle');
const notificationTime = document.getElementById('notification-time');
const settingsToggle = document.getElementById('settings-toggle');
const timerSection = document.getElementById('timer-section');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');
const exerciseModal = document.getElementById('exercise-modal');
const exerciseModalBackdrop = document.getElementById('exercise-modal-backdrop');
const exerciseModalClose = document.getElementById('exercise-modal-close');
const exerciseModalTitle = document.getElementById('exercise-modal-title');
const exerciseModalGraphic = document.getElementById('exercise-modal-graphic');
const exerciseModalDescription = document.getElementById('exercise-modal-description');
let lastFocusedElement = null;

// Timer state
let timerState = {
    totalSeconds: 0,
    remainingSeconds: 0,
    isRunning: false,
    intervalId: null
};

// Screen Wake Lock
let wakeLock = null;

// Audio context for completion sound (reuse to avoid creating multiple instances)
let audioContext = null;

// Initialize app state
let appState = {
    score: 0,
    daysCompleted: 0,
    currentExercise: null, // Now stores { exerciseIndex, reps, minReps, maxReps }
    exerciseGeneratedDate: null, // Tracks when current exercise was generated (YYYY-MM-DD)
    lastCompletedDate: null,
    exercisesCompletedToday: 0, // Tracks number of exercises completed today
    exerciseRanges: {}, // Stores custom ranges per exercise: { exerciseIndex: { minReps, maxReps } }
    notificationsEnabled: false,
    notificationTime: '20:00'
};

// Load state from localStorage
function loadState() {
    try {
        const savedState = localStorage.getItem('exerciseAppState');
        if (savedState) {
            appState = JSON.parse(savedState);
            // Ensure exerciseRanges exists
            if (!appState.exerciseRanges) {
                appState.exerciseRanges = {};
            }
            // Ensure notification properties have defaults if not present
            if (appState.notificationsEnabled === undefined) {
                appState.notificationsEnabled = false;
            }
            if (appState.notificationTime === undefined) {
                appState.notificationTime = '20:00';
            }
            // Ensure exerciseGeneratedDate exists for backward compatibility
            if (appState.exerciseGeneratedDate === undefined) {
                appState.exerciseGeneratedDate = null;
            }
            // Ensure exercisesCompletedToday exists
            if (appState.exercisesCompletedToday === undefined) {
                appState.exercisesCompletedToday = 0;
            }
            // Note: Counter will be reset in completeExercise() when first exercise is completed on a new day
        }
    } catch (error) {
        console.error('Error loading state from localStorage:', error);
        // Reset to default state if corrupted
        appState = {
            score: 0,
            daysCompleted: 0,
            currentExercise: null,
            exerciseGeneratedDate: null,
            lastCompletedDate: null,
            exercisesCompletedToday: 0,
            exerciseRanges: {},
            notificationsEnabled: false,
            notificationTime: '20:00'
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

const exerciseGuides = {
    "jumping jacks": "Jump your feet wide while raising your arms overhead, then return to start.",
    "push-ups": "Keep your body in a straight line, lower your chest, then push back up.",
    "squats": "Sit your hips back and down, keep chest up, then drive through your heels to stand.",
    "plank": "Hold a straight line from shoulders to heels while keeping your core tight.",
    "lunges (each leg)": "Step forward, lower both knees to about 90°, then push back up.",
    "burpees": "Squat down, kick your feet back, return to squat, then jump up explosively.",
    "sit-ups": "Lie on your back, lift your torso toward your knees, then lower with control.",
    "wall sit": "Lean against a wall with knees bent around 90° and hold your position.",
    "mountain climbers": "From plank, alternate driving knees toward your chest quickly.",
    "tricep dips": "Lower your body by bending elbows behind you, then press back up.",
    "high knees (each leg)": "Run in place while lifting each knee to waist level.",
    "bicycle crunches": "Alternate elbow-to-opposite-knee with a pedaling leg motion.",
    "jump squats": "Perform a squat, then jump upward and land softly into the next squat.",
    "leg raises": "Lift straight legs upward while keeping your lower back stable.",
    "butt kicks": "Jog in place and kick your heels toward your glutes.",
    "pike push-ups": "In a pike position, lower your head toward the floor, then press up.",
    "Russian twists": "Lean back slightly and rotate your torso side to side.",
    "box jumps (or step-ups)": "Jump or step onto a stable platform, then return down safely.",
    "superman hold": "Lie face down and lift arms and legs off the floor while squeezing your back.",
    "side lunges (each side)": "Step sideways, bend the stepping knee, then push back to center."
};

// Calculate days between two dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / MS_PER_DAY);
}

function createExerciseGraphicSvg(exerciseName) {
    const safeName = exerciseName.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    return `
        <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Exercise guide graphic for ${safeName}">
            <defs>
                <linearGradient id="guideBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f0f4ff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#dbe7ff;stop-opacity:1" />
                </linearGradient>
                <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#667eea" />
                </marker>
            </defs>
            <rect x="0" y="0" width="420" height="220" rx="14" fill="url(#guideBg)"/>
            <line x1="60" y1="185" x2="360" y2="185" stroke="#b8c6ef" stroke-width="4" />
            <circle cx="145" cy="72" r="18" fill="#667eea" />
            <line x1="145" y1="90" x2="145" y2="142" stroke="#667eea" stroke-width="10" stroke-linecap="round" />
            <line x1="145" y1="102" x2="112" y2="125" stroke="#667eea" stroke-width="8" stroke-linecap="round" />
            <line x1="145" y1="102" x2="178" y2="125" stroke="#667eea" stroke-width="8" stroke-linecap="round" />
            <line x1="145" y1="142" x2="120" y2="180" stroke="#667eea" stroke-width="8" stroke-linecap="round" />
            <line x1="145" y1="142" x2="170" y2="180" stroke="#667eea" stroke-width="8" stroke-linecap="round" />
            <path d="M245 135 Q285 95 325 135" fill="none" stroke="#667eea" stroke-width="6" marker-end="url(#arrowHead)" />
        </svg>
    `;
}

function handleModalKeydown(event) {
    if (!exerciseModal || !exerciseModal.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
        closeExerciseModal();
        return;
    }

    if (event.key !== 'Tab') return;

    const focusable = exerciseModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function openExerciseModal() {
    if (!appState.currentExercise || !exerciseModal) return;

    const definition = exerciseDefinitions[appState.currentExercise.exerciseIndex];
    if (!definition) return;
    const guideText = exerciseGuides[definition.name];
    if (!guideText) {
        console.warn(`Missing exercise guide copy for "${definition.name}"`);
    }

    lastFocusedElement = document.activeElement;
    exerciseModalTitle.textContent = definition.name;
    exerciseModalGraphic.innerHTML = createExerciseGraphicSvg(definition.name);
    exerciseModalDescription.textContent = guideText || 'Focus on controlled movement and full range of motion.';
    exerciseModal.classList.add('is-open');
    exerciseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    exerciseModal.addEventListener('keydown', handleModalKeydown);
    if (exerciseModalClose) {
        exerciseModalClose.focus();
    }
}

function closeExerciseModal() {
    if (!exerciseModal) return;
    exerciseModal.classList.remove('is-open');
    exerciseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    exerciseModal.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

// Generate an exercise with random reps from the range
function generateExercise(exerciseIndex) {
    const definition = exerciseDefinitions[exerciseIndex];
    
    // Use stored ranges if available, otherwise use defaults
    let minReps, maxReps;
    if (appState.exerciseRanges && appState.exerciseRanges[exerciseIndex]) {
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
        const rangeDecrease = definition.unit === "seconds" ? 5 : 2;
        
        // Format range display based on unit type
        if (definition.unit === "seconds") {
            rangeText.textContent = `Range: ${minReps}-${maxReps} seconds`;
        } else {
            rangeText.textContent = `Range: ${minReps}-${maxReps} reps`;
        }
        
        // Disable decrease button if we can't decrease by the full amount while keeping both >= 1
        decreaseRangeBtn.disabled = (minReps - rangeDecrease < 1) || (maxReps - rangeDecrease < 1);
        
        // Show/hide timer for seconds-based exercises
        if (definition.unit === "seconds") {
            timerSection.style.display = 'block';
            initializeTimer(appState.currentExercise.reps);
        } else {
            timerSection.style.display = 'none';
            stopTimer();
        }
    }
    
    // Update notification settings UI
    if (notificationsToggle && notificationTime) {
        notificationsToggle.checked = appState.notificationsEnabled;
        notificationTime.value = appState.notificationTime;
        notificationTime.disabled = !appState.notificationsEnabled;
    }
}

// ============================================
// TIMER FUNCTIONS
// ============================================

// Timer completion sound constants
const COMPLETION_SOUND_FREQUENCY = 800; // Hz
const SOUND_INITIAL_VOLUME = 0.3;
const SOUND_END_VOLUME = 0.01;
const SOUND_DURATION = 0.5; // seconds

// Format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize timer with duration
function initializeTimer(seconds) {
    timerState.totalSeconds = seconds;
    timerState.remainingSeconds = seconds;
    timerState.isRunning = false;
    updateTimerDisplay();
}

// Update timer display
function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(timerState.remainingSeconds);
    }
}

// Request screen wake lock to keep screen on
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock acquired');
            
            // Listen for wake lock release
            wakeLock.addEventListener('release', () => {
                console.log('Screen Wake Lock released');
            });
        }
    } catch (err) {
        console.log('Wake Lock error:', err);
    }
}

// Release screen wake lock
async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Screen Wake Lock released manually');
        } catch (err) {
            console.log('Wake Lock release error:', err);
        }
    }
}

// Start timer
function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    startTimerBtn.style.display = 'none';
    pauseTimerBtn.style.display = 'inline-block';
    
    // Request wake lock to keep screen on
    requestWakeLock();
    
    timerState.intervalId = setInterval(() => {
        if (timerState.remainingSeconds > 0) {
            timerState.remainingSeconds--;
            updateTimerDisplay();
        } else {
            // Timer completed
            stopTimer();
            playCompletionSound();
            alert('Time\'s up! Great job! 🎉');
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isRunning = false;
    startTimerBtn.style.display = 'inline-block';
    pauseTimerBtn.style.display = 'none';
    
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    
    // Release wake lock when paused
    releaseWakeLock();
}

// Stop timer (reset state)
function stopTimer() {
    timerState.isRunning = false;
    startTimerBtn.style.display = 'inline-block';
    pauseTimerBtn.style.display = 'none';
    
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }
    
    // Release wake lock when stopped
    releaseWakeLock();
}

// Reset timer
function resetTimer() {
    stopTimer();
    timerState.remainingSeconds = timerState.totalSeconds;
    updateTimerDisplay();
}

// Play completion sound
function playCompletionSound() {
    // Create a simple beep sound using Web Audio API
    try {
        // Create or reuse audio context
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = COMPLETION_SOUND_FREQUENCY;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(SOUND_INITIAL_VOLUME, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(SOUND_END_VOLUME, audioContext.currentTime + SOUND_DURATION);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + SOUND_DURATION);
    } catch (err) {
        console.log('Could not play completion sound:', err);
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
    
    // Reset counter if it's a new day
    if (appState.lastCompletedDate !== today) {
        appState.exercisesCompletedToday = 0;
    }
    
    // Calculate points based on exercises completed today
    let pointsToAward;
    if (appState.exercisesCompletedToday === 0) {
        // First exercise of the day
        pointsToAward = 10;
        
        // Calculate days since last completion and apply penalties if needed
        if (appState.lastCompletedDate) {
            const daysSinceCompletion = daysBetween(appState.lastCompletedDate, today);
            
            // If more than 1 day has passed, update saved score with penalties
            if (daysSinceCompletion > 1) {
                const missedDays = daysSinceCompletion - 1;
                appState.score = calculatePenalties(appState.score, missedDays);
            }
        }
        
        // Increment days completed for first exercise of the day
        appState.daysCompleted += 1;
        appState.lastCompletedDate = today;
    } else if (appState.exercisesCompletedToday === 1) {
        // Second exercise of the day
        pointsToAward = 5;
    } else {
        // Third or more exercise of the day
        pointsToAward = 2;
    }
    
    // Award points and increment counter
    appState.score += pointsToAward;
    appState.exercisesCompletedToday += 1;
    
    saveState();
    updateUI();
    
    // Show appropriate success message
    let message;
    if (appState.exercisesCompletedToday === 1) {
        // First exercise of the day
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
        message = randomMessage + ` (+${pointsToAward} points)`;
    } else if (appState.exercisesCompletedToday === 2) {
        // Second exercise of the day
        message = `Great dedication! Second exercise completed today! (+${pointsToAward} points) 🔥`;
    } else {
        // Third or more exercise of the day
        message = `Wow! Exercise #${appState.exercisesCompletedToday} today! You're unstoppable! (+${pointsToAward} points) 🚀`;
    }
    
    alert(message);
    
    // Automatically generate a new exercise after completion
    getNewExercise();
}

// Handle new exercise request
function getNewExercise() {
    const newExercise = generateRandomExercise();
    appState.currentExercise = newExercise;
    appState.exerciseGeneratedDate = getTodayDate();
    saveState();
    updateUI();
}

// Check if we need a new exercise for the day
function checkAndUpdateDailyExercise() {
    const today = getTodayDate();
    
    // Generate new exercise if:
    // 1. No current exercise exists, OR
    // 2. Exercise was generated on a different day
    if (!appState.currentExercise || appState.exerciseGeneratedDate !== today) {
        const newExercise = generateRandomExercise();
        appState.currentExercise = newExercise;
        appState.exerciseGeneratedDate = today;
        saveState();
        return true; // Exercise was updated
    }
    
    return false; // No update needed
}

// Increase the repetition range for current exercise
function increaseRange() {
    if (!appState.currentExercise) return;
    if (!appState.exerciseRanges) appState.exerciseRanges = {};
    
    const definition = exerciseDefinitions[appState.currentExercise.exerciseIndex];
    const rangeIncrease = definition.unit === "seconds" ? 5 : 2;
    
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
    if (!appState.exerciseRanges) appState.exerciseRanges = {};
    
    const definition = exerciseDefinitions[appState.currentExercise.exerciseIndex];
    const rangeDecrease = definition.unit === "seconds" ? 5 : 2;
    
    // Calculate potential new values
    const potentialMinReps = appState.currentExercise.minReps - rangeDecrease;
    const potentialMaxReps = appState.currentExercise.maxReps - rangeDecrease;
    
    // Only decrease if we can decrease by the full amount and both stay above 0
    // This ensures we don't reduce the size of the range
    if (potentialMinReps >= 1 && potentialMaxReps >= 1) {
        appState.currentExercise.minReps = potentialMinReps;
        appState.currentExercise.maxReps = potentialMaxReps;
        
        // Store the custom range for this exercise
        appState.exerciseRanges[appState.currentExercise.exerciseIndex] = {
            minReps: potentialMinReps,
            maxReps: potentialMaxReps
        };
        
        // Regenerate reps within new range
        const minReps = appState.currentExercise.minReps;
        const maxReps = appState.currentExercise.maxReps;
        appState.currentExercise.reps = Math.floor(Math.random() * (maxReps - minReps + 1)) + minReps;
        
        saveState();
        updateUI();
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

// Service Worker registration
let serviceWorkerRegistration = null;
let updateAvailable = false;

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered successfully');
            
            // Listen for service worker updates
            serviceWorkerRegistration.addEventListener('updatefound', () => {
                const newWorker = serviceWorkerRegistration.installing;
                console.log('New service worker found, installing...');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker installed, show update notification
                        console.log('New version available');
                        updateAvailable = true;
                        showUpdateNotification();
                    }
                });
            });
            
            // Check for updates periodically (every 5 minutes)
            setInterval(() => {
                serviceWorkerRegistration.update();
            }, 5 * 60 * 1000); // Check every 5 minutes
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'UPDATE_AVAILABLE') {
                    updateAvailable = true;
                    showUpdateNotification();
                }
            });
            
            return serviceWorkerRegistration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
}

// Show update notification banner
function showUpdateNotification() {
    const updateBanner = document.getElementById('update-banner');
    const updateBtn = document.getElementById('update-btn');
    const dismissBtn = document.getElementById('dismiss-update-btn');
    
    if (updateBanner && (!updateBanner.style.display || updateBanner.style.display === 'none')) {
        updateBanner.style.display = 'block';
        document.body.classList.add('update-visible');
        
        // Add event listeners if not already added
        if (updateBtn && !updateBtn.dataset.listenerAdded) {
            updateBtn.addEventListener('click', applyUpdate);
            updateBtn.dataset.listenerAdded = 'true';
        }
        
        if (dismissBtn && !dismissBtn.dataset.listenerAdded) {
            dismissBtn.addEventListener('click', dismissUpdate);
            dismissBtn.dataset.listenerAdded = 'true';
        }
    }
}

// Apply the update
function applyUpdate() {
    if (!serviceWorkerRegistration || !updateAvailable) {
        console.log('No update available');
        return;
    }
    
    // Send message to service worker to skip waiting
    if (serviceWorkerRegistration.waiting) {
        serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Listen for controlling service worker change
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// Dismiss update notification
function dismissUpdate() {
    const updateBanner = document.getElementById('update-banner');
    if (updateBanner) {
        updateBanner.style.display = 'none';
        document.body.classList.remove('update-visible');
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

// Show a notification
async function showNotification() {
    if (Notification.permission === 'granted') {
        // Use Service Worker notification if available (works even when page is closed)
        if (serviceWorkerRegistration) {
            await serviceWorkerRegistration.showNotification('Time for your exercise! 💪', {
                body: 'Time to do your daily exercise!',
                tag: 'daily-exercise-reminder',
                requireInteraction: false,
                vibrate: [200, 100, 200]
            });
        } else {
            // Fallback to regular notification (only works when page is open)
            new Notification('Time for your exercise! 💪', {
                body: 'Time to do your daily exercise!',
                tag: 'daily-exercise-reminder',
                requireInteraction: false
            });
        }
    }
}

// Check if it's time to send notification and send if needed
async function checkAndSendNotification() {
    const now = new Date();
    const today = getTodayDate();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    
    // Check if we already sent a notification today
    if (lastNotificationDate === today) {
        return; // Already sent notification today
    }
    
    // Parse notification time
    const [notifHours, notifMinutes] = appState.notificationTime.split(':').map(Number);
    const notifTimeInMinutes = notifHours * 60 + notifMinutes;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Send notification if current time is at or past the notification time
    if (currentTimeInMinutes >= notifTimeInMinutes) {
        await showNotification();
        localStorage.setItem('lastNotificationDate', today);
    }
}

// Schedule daily notification
async function scheduleDailyNotification() {
    // Clear any existing interval
    if (window.notificationInterval) {
        clearInterval(window.notificationInterval);
    }
    
    if (!appState.notificationsEnabled) {
        return;
    }
    
    // Store settings in cache for service worker access
    try {
        const cache = await caches.open('notification-cache');
        await cache.put('notificationSettings', new Response(JSON.stringify({
            enabled: appState.notificationsEnabled,
            notificationTime: appState.notificationTime
        })));
    } catch (error) {
        console.log('Could not store notification settings in cache:', error);
    }
    
    // Try to use Periodic Background Sync if available (allows notifications when page is closed)
    if (serviceWorkerRegistration && 'periodicSync' in serviceWorkerRegistration) {
        try {
            await serviceWorkerRegistration.periodicSync.register('check-notification', {
                minInterval: 15 * 60 * 1000 // 15 minutes
            });
            console.log('Periodic Background Sync registered');
        } catch (error) {
            console.log('Periodic Background Sync not available:', error);
        }
    }
    
    // Always use interval as fallback for when page is open (more accurate timing)
    window.notificationInterval = setInterval(checkAndSendNotification, 60000);
    
    // Send message to service worker to keep it aware of the schedule
    if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
        serviceWorkerRegistration.active.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            notificationTime: appState.notificationTime,
            enabled: true
        });
    }
    
    // Also check immediately in case we're at the right time
    await checkAndSendNotification();
}

// Handle notification toggle
async function handleNotificationToggle() {
    const isEnabled = notificationsToggle.checked;
    
    if (isEnabled) {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
            appState.notificationsEnabled = true;
            notificationTime.disabled = false;
            await scheduleDailyNotification();
        } else {
            // Permission denied, revert toggle
            notificationsToggle.checked = false;
            appState.notificationsEnabled = false;
            alert('Notification permission was denied. Please allow notifications when prompted or reset permission in your browser.');
        }
    } else {
        appState.notificationsEnabled = false;
        notificationTime.disabled = true;
        if (window.notificationInterval) {
            clearInterval(window.notificationInterval);
        }
        
        // Notify service worker to stop checking
        if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
            serviceWorkerRegistration.active.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                notificationTime: appState.notificationTime,
                enabled: false
            });
        }
    }
    
    saveState();
    updateUI();
}

// Handle notification time change
async function handleNotificationTimeChange() {
    appState.notificationTime = notificationTime.value;
    saveState();
    
    // Reschedule with new time
    if (appState.notificationsEnabled) {
        await scheduleDailyNotification();
    }
}

// Handle settings toggle
function handleSettingsToggle() {
    const settingsContent = document.getElementById('settings-content');
    const isCollapsed = settingsContent.style.display === 'none';
    
    if (isCollapsed) {
        settingsContent.style.display = 'block';
        settingsToggle.textContent = '▼';
    } else {
        settingsContent.style.display = 'none';
        settingsToggle.textContent = '▶';
    }
}

// Initialize the app
async function initApp() {
    loadState();
    
    // Register service worker for background notifications
    await registerServiceWorker();
    
    // Check if we need a new exercise for today
    checkAndUpdateDailyExercise();
    
    // Update UI
    updateUI();
    
    // Add event listeners
    completeBtn.addEventListener('click', completeExercise);
    newExerciseBtn.addEventListener('click', getNewExercise);
    increaseRangeBtn.addEventListener('click', increaseRange);
    decreaseRangeBtn.addEventListener('click', decreaseRange);
    if (exerciseDisplay) {
        exerciseDisplay.addEventListener('click', openExerciseModal);
        exerciseDisplay.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openExerciseModal();
            }
        });
    }
    if (exerciseModalClose) {
        exerciseModalClose.addEventListener('click', closeExerciseModal);
    }
    if (exerciseModalBackdrop) {
        exerciseModalBackdrop.addEventListener('click', closeExerciseModal);
    }
    
    // Add timer event listeners
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', startTimer);
    }
    if (pauseTimerBtn) {
        pauseTimerBtn.addEventListener('click', pauseTimer);
    }
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetTimer);
    }
    
    // Add notification event listeners if elements exist
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', handleNotificationToggle);
    }
    if (notificationTime) {
        notificationTime.addEventListener('change', handleNotificationTimeChange);
    }
    if (settingsToggle) {
        settingsToggle.addEventListener('click', handleSettingsToggle);
        // Initialize settings as collapsed
        const settingsContent = document.getElementById('settings-content');
        if (settingsContent) {
            settingsContent.style.display = 'none';
            settingsToggle.textContent = '▶';
        }
    }
    
    // Set up notifications if enabled
    if (appState.notificationsEnabled) {
        await scheduleDailyNotification();
    }
    
    // Set up periodic check for day change (every 60 seconds)
    // This ensures the exercise updates even if the app stays open overnight
    setInterval(() => {
        const wasUpdated = checkAndUpdateDailyExercise();
        if (wasUpdated) {
            updateUI();
            console.log('Exercise updated for new day');
        }
    }, 60000); // Check every minute

    // Handle visibility change for wake lock
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && timerState.isRunning) {
            // Reacquire wake lock when page becomes visible again
            await requestWakeLock();
        } else if (document.visibilityState === 'hidden') {
            // Release wake lock when page becomes hidden to conserve resources
            await releaseWakeLock();
        }
    });
    
    console.log('App initialized successfully');
}

// Start the app when DOM is ready
initApp();
