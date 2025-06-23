// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Time left in seconds

const WIN_MESSAGES = [
  "Amazing! You quenched the world's thirst!",
  "Victory! You're a water-saving hero!",
  "You did it! The world is grateful!"
];
const LOSE_MESSAGES = [
  "Try again! The world needs more water!",
  "So close! Give it another shot!",
  "Don't give up! Hydration is key!"
];

// Creates the 4x4 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 16; i++) { // 4x4 grid
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  // Clear all cells before spawning a new item
  cells.forEach(cell => (cell.innerHTML = ''));
  // Select a random cell from the grid to place the item
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  // Decide randomly whether to spawn a water can or an obstacle (mud puddle)
  const spawnObstacle = Math.random() < 0.25; // 25% chance for obstacle
  if (spawnObstacle) {
    randomCell.innerHTML = `
      <div class="obstacle-wrapper">
        <div class="mud-puddle"></div>
      </div>
    `;
    const obstacle = randomCell.querySelector('.mud-puddle');
    if (obstacle) {
      obstacle.addEventListener('click', () => {
        if (!gameActive) return;
        currentCans = Math.max(0, currentCans - 1);
        document.getElementById('current-cans').textContent = currentCans;
        randomCell.innerHTML = '';
      });
    }
  } else {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <img src="img/water-can-transparent.png" alt="Water Can" class="water-can-img" draggable="false" />
      </div>
    `;
    const can = randomCell.querySelector('.water-can-img');
    if (can) {
      can.addEventListener('click', () => {
        if (!gameActive) return;
        updateScore();
        randomCell.innerHTML = '';
      });
    }
  }
}

function updateScore() {
  currentCans++;
  document.getElementById('current-cans').textContent = currentCans;
}

function updateTimer() {
  document.getElementById('timer').textContent = timeLeft;
}

function showConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const confettiCount = 150;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tilt: Math.random() * 10 - 10
    });
  }
  let angle = 0;
  let tiltAngle = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < confettiCount; i++) {
      const c = confetti[i];
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
      ctx.stroke();
    }
    updateConfetti();
  }
  function updateConfetti() {
    angle += 0.01;
    tiltAngle += 0.1;
    for (let i = 0; i < confettiCount; i++) {
      const c = confetti[i];
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(tiltAngle - i / 3) * 15;
      if (c.y > canvas.height) {
        c.x = Math.random() * canvas.width;
        c.y = -10;
      }
    }
  }
  let frame = 0;
  function animate() {
    drawConfetti();
    frame++;
    if (frame < 120) {
      requestAnimationFrame(animate);
    } else {
      canvas.style.display = 'none';
    }
  }
  animate();
}

function showEndMessage(win) {
  const achievements = document.getElementById('achievements');
  const messages = win ? WIN_MESSAGES : LOSE_MESSAGES;
  const msg = messages[Math.floor(Math.random() * messages.length)];
  achievements.textContent = msg;
  if (win) showConfetti();
}

function startTimer() {
  timeLeft = 30;
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('achievements').textContent = '';
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  startTimer();
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop timer
  // Show win or lose message
  showEndMessage(currentCans >= 20);
}

// Reset game state
function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  currentCans = 0;
  timeLeft = 30;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('achievements').textContent = '';
  createGrid();
  // Hide confetti if visible
  document.getElementById('confetti').style.display = 'none';
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
