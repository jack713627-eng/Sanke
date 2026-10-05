const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const overlay = document.querySelector('#game-overlay');
const overlayKicker = document.querySelector('#overlay-kicker');
const overlayTitle = document.querySelector('#overlay-title');
const overlayMessage = document.querySelector('#overlay-message');
const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');

const gridSize = 24;
const cellSize = canvas.width / gridSize;
const directions = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
};
let snake, food, direction, nextDirection, score, highScore;
let running = false;
let paused = false;
let timer;

highScore = Number(localStorage.getItem('snake-high-score') || 0);
highScoreElement.textContent = highScore;

function resetGame() {
  snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  direction = directions.right;
  nextDirection = direction;
  score = 0;
  scoreElement.textContent = score;
  placeFood();
  draw();
}

function placeFood() {
  do { food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
  while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function startGame() {
  resetGame();
  running = true;
  paused = false;
  overlay.classList.add('hidden');
  pauseButton.textContent = 'Ⅱ';
  pauseButton.setAttribute('aria-label', '暫停遊戲');
  clearInterval(timer);
  timer = setInterval(tick, 105);
}

function endGame() {
  running = false;
  clearInterval(timer);
  overlayKicker.textContent = 'GAME OVER';
  overlayTitle.textContent = '遊戲結束';
  overlayMessage.textContent = `本局分數 ${score}，再試一次吧`;
  startButton.textContent = '重新開始';
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  pauseButton.textContent = paused ? '▶' : 'Ⅱ';
  pauseButton.setAttribute('aria-label', paused ? '繼續遊戲' : '暫停遊戲');
  if (paused) {
    overlayKicker.textContent = 'PAUSED';
    overlayTitle.textContent = '暫停中';
    overlayMessage.textContent = '按空白鍵或播放鍵繼續';
    startButton.textContent = '繼續遊戲';
    overlay.classList.remove('hidden');
  } else overlay.classList.add('hidden');
}

function setDirection(name) {
  const candidate = directions[name];
  if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return;
  nextDirection = candidate;
}

function tick() {
  if (!running || paused) return;
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) return endGame();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem('snake-high-score', highScore);
    }
    placeFood();
  } else snake.pop();
  draw();
}

function draw() {
  ctx.fillStyle = '#0b1511';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#14231c';
  ctx.lineWidth = 1;
  for (let i = 1; i < gridSize; i++) {
    const position = i * cellSize;
    ctx.beginPath(); ctx.moveTo(position, 0); ctx.lineTo(position, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, position); ctx.lineTo(canvas.width, position); ctx.stroke();
  }
  ctx.fillStyle = '#ffb870';
  ctx.beginPath();
  ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize * .31, 0, Math.PI * 2);
  ctx.fill();
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#d4ffb9' : '#69d391';
    const inset = index === 0 ? 2 : 3;
    ctx.fillRect(segment.x * cellSize + inset, segment.y * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2);
  });
}

document.addEventListener('keydown', event => {
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  if (keyMap[event.key]) { event.preventDefault(); setDirection(keyMap[event.key]); }
  if (event.code === 'Space') { event.preventDefault(); togglePause(); }
  if (event.key.toLowerCase() === 'r') startGame();
});

document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
startButton.addEventListener('click', () => paused ? togglePause() : startGame());
pauseButton.addEventListener('click', togglePause);
resetGame();
