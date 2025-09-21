const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const patternSelect = document.getElementById('patternSelect');
const durationInput = document.getElementById('duration');
const timerDisplay = document.getElementById('timer');

let isRunning = false;
let intervalId = null;
let startTime = null;
let animationFrameId = null;

// Colors for solid pattern
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];
let currentColorIndex = 0;

// Resize canvas to fill container or screen
function resizeCanvas() {
    if (document.fullscreenElement) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}

// Draw patterns
function drawPattern() {
    const pattern = patternSelect.value;
    const width = canvas.width;
    const height = canvas.height;

    if (pattern === 'solid') {
        ctx.fillStyle = colors[currentColorIndex];
        ctx.fillRect(0, 0, width, height);
    } else if (pattern === 'checkerboard') {
        const size = 50;
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                ctx.fillStyle = colors[Math.floor(Math.random() * 3)];
                ctx.fillRect(x, y, size, size);
            }
        }
    } else if (pattern === 'stripes') {
        const size = 50;
        for (let x = 0; x < width; x += size) {
            ctx.fillStyle = x / size % 2 === 0 ? colors[currentColorIndex] : '#000000';
            ctx.fillRect(x, 0, size, height);
        }
    }
}

// Cycle colors
function cycleColors() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    drawPattern();
}

// Update timer
function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Start cycling
function startCycling() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        startTime = Date.now();
        const duration = parseInt(durationInput.value, 10);
        intervalId = setInterval(cycleColors, duration);
        animationFrameId = setInterval(updateTimer, 1000);
        drawPattern();
    }
}

// Stop cycling
function stopCycling() {
    if (isRunning) {
        isRunning = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearInterval(intervalId);
        clearInterval(animationFrameId);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(resizeCanvas);
    } else {
        document.exitFullscreen().then(resizeCanvas);
    }
}

// Event listeners
startBtn.addEventListener('click', startCycling);
stopBtn.addEventListener('click', stopCycling);
fullscreenBtn.addEventListener('click', toggleFullscreen);
patternSelect.addEventListener('change', () => {
    if (isRunning) drawPattern();
});
durationInput.addEventListener('change', () => {
    if (isRunning) {
        clearInterval(intervalId);
        intervalId = setInterval(cycleColors, parseInt(durationInput.value, 10));
    }
});
window.addEventListener('resize', resizeCanvas);

// Initialize canvas
resizeCanvas();
drawPattern();

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
                console.log('Service Worker registered:', registration);
            },
            (error) => {
                console.error('Service Worker registration failed:', error);
            }
        );
    });
}
