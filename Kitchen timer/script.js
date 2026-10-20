
let totalSeconds = 0;
let remainingSeconds = 0;
let timerInterval = null;
let endTime = null;
let isRunning = false;

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");

const inputMinutes = document.getElementById("inputMinutes");
const inputSeconds = document.getElementById("inputSeconds");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

// Display the remaining time
function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");
}

// Read the custom duration
function setCustomTime() {
    if (isRunning) return;

    const minutes = Number(inputMinutes.value);
    const seconds = Number(inputSeconds.value);

    if (
        !Number.isInteger(minutes) ||
        !Number.isInteger(seconds) ||
        minutes < 0 || minutes > 999 ||
        seconds < 0 || seconds > 59
    ) {
        alert("Enter valid minutes (0-999) and seconds (0-59).");
        return false;
    }

    totalSeconds = minutes * 60 + seconds;
    remainingSeconds = totalSeconds;
    updateDisplay();
    return true;
}

// Play an alarm sound
function playSound() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        const audioContext = new AudioContextClass();

        audioContext.resume().then(() => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gain.gain.value = 0.2;

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.6);

            oscillator.onended = () => audioContext.close();
        }).catch(console.error);
    } catch (error) {
        console.error("Sound unavailable:", error);
    }
}

// Stop the countdown interval
function stopInterval() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
}

// Update the countdown
function tick() {
    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    updateDisplay();

    if (remainingSeconds === 0) {
        stopInterval();
        playSound();
        alert("Your food is ready! 🍽️");
    }
}

// Start the timer
startBtn.addEventListener("click", function () {
    if (isRunning) return;

    if (remainingSeconds === 0) {
        if (!setCustomTime()) return;
    }

    if (remainingSeconds <= 0) {
        alert("Please set a time first!");
        return;
    }

    endTime = Date.now() + remainingSeconds * 1000;
    isRunning = true;

    timerInterval = setInterval(tick, 200);
});

// Pause the timer
pauseBtn.addEventListener("click", function () {
    if (!isRunning) return;

    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    stopInterval();
    updateDisplay();
});

// Reset the timer
resetBtn.addEventListener("click", function () {
    stopInterval();
    remainingSeconds = totalSeconds;
    updateDisplay();
});

// Handle custom input changes
inputMinutes.addEventListener("change", setCustomTime);
inputSeconds.addEventListener("change", setCustomTime);

// Handle preset buttons
document.querySelectorAll(".presets button").forEach(button => {
    button.addEventListener("click", function () {
        stopInterval();

        totalSeconds = Number(this.dataset.time);
        remainingSeconds = totalSeconds;

        inputMinutes.value = Math.floor(totalSeconds / 60);
        inputSeconds.value = totalSeconds % 60;

        updateDisplay();
    });
});

// Initial display
updateDisplay();
