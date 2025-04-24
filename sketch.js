let paddle, ball, blocks = [];
let level = 1;
let rows, cols;
let blockWidth, blockHeight;
let lives = 3;
let score = 0;
let gameStarted = false;
let paused = false;
let gameOverFlag = false;
let levelCompleted = false;

function setup() {
  createCanvas(600, 400);
  paddle = new Paddle();
  ball = new Ball();
  textFont('Arial');
}

function draw() {
  background(240);

  if (!gameStarted) {
    showStartScreen();
    return;
  }

  if (paused) {
    showPauseScreen();
    return;
  }

  paddle.update();
  paddle.display();

  ball.update();
  ball.display();

  for (let i = blocks.length - 1; i >= 0; i--) {
    let block = blocks[i];
    block.display();

    if (ball.hitsBlock(block)) {
      if (!block.indestructible) {
        if (block.health === 3) {
          score += 30;
        } else if (block.health === 1) {
          score += 10;
        }
      }

      block.hit();
      ball.reverseY();
      if (block.health <= 0 && !block.indestructible) {
        blocks.splice(i, 1);
      }
    }
  }

  ball.checkEdges(paddle);

  if (ball.offScreen()) {
    lives--;
    if (lives > 0) {
      ball.reset();
    } else {
      gameOver();
    }
  }

  if (!levelCompleted && level === 3) {
    let destructibleBlocks = blocks.filter(b => !b.indestructible);
    if (destructibleBlocks.length === 0) {
      winGame();
      levelCompleted = true;
      paused = true;
    }
  } else if (blocks.length === 0 && !levelCompleted && level < 3) {
    levelCompleted = true;
    paused = true;
  }

  drawHUD();

  if (levelCompleted && level < 3) {
    showLevelCompleteScreen();
    return;
  }
}

function setupLevel() {
  blocks = [];
  let colors = ['#A8DADC', '#FBC4AB', '#FFDDD2'];
  rows = level * 3;
  cols = 10;
  blockWidth = width / cols;
  blockHeight = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = c * blockWidth;
      let y = r * blockHeight + 50;
      let health = 1;
      let indestructible = false;

      if (level === 2 && random() < 0.1) {
        health = 3;
      }

      if (level === 3) {
        if (random() < 0.15) health = 3;
        if (random() < 0.05) indestructible = true;
      }

      let colorIndex = r % colors.length;
      blocks.push(new Block(x, y, blockWidth, blockHeight, colors[colorIndex], health, indestructible));
    }
  }

  if (level === 2) ball.speedUp();
  if (level === 3) ball.speedUp(1.2);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    paddle.move(-1);
  } else if (keyCode === RIGHT_ARROW) {
    paddle.move(1);
  } else if (key === ' ') {
    if (!gameStarted) {
      gameStarted = true;
      setupLevel();
      ball.reset();
    } else if (levelCompleted && level < 3) {
      level++;
      setupLevel();
      ball.reset();
      levelCompleted = false;
      paused = false;
    } else {
      paused = !paused;
    }
  } else if (keyCode === ENTER && gameOverFlag) {
    resetGame();
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    paddle.move(0);
  }
}

function drawHUD() {
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(`Vidas: ${lives}`, 10, 20);
  text(`Nivel: ${level}`, 120, 20);
  text(`Puntuación: ${score}`, 230, 20);
}

function showStartScreen() {
  fill(0);
  textSize(24);
  textAlign(CENTER);
  text("BREAKOUT", width / 2, height / 2 - 60);
  textSize(16);
  text("Controles:", width / 2, height / 2 - 30);
  text("← Mover Izquierda", width / 2, height / 2);
  text("→ Mover Derecha", width / 2, height / 2 + 20);
  text("ESPACIO: Iniciar / Pausar", width / 2, height / 2 + 40);
  text("Presiona ESPACIO para empezar", width / 2, height / 2 + 80);
}

function showPauseScreen() {
  fill(0);
  textSize(24);
  textAlign(CENTER);
  text("Juego en Pausa", width / 2, height / 2);
  textSize(16);
  text("Presiona ESPACIO para continuar", width / 2, height / 2 + 30);
}

function showLevelCompleteScreen() {
  fill(0);
  textSize(24);
  textAlign(CENTER);
  text(`¡Nivel ${level} completado!`, width / 2, height / 2 - 20);
  textSize(16);
  text("Presiona ESPACIO para continuar al siguiente nivel", width / 2, height / 2 + 20);
}

function gameOver() {
  textSize(32);
  fill('red');
  textAlign(CENTER);
  text("GAME OVER", width / 2, height / 2 - 20);
  textSize(16);
  text("Presiona ENTER para reiniciar", width / 2, height / 2 + 20);
  noLoop();
  gameOverFlag = true;
}

function winGame() {
  textSize(32);
  fill('green');
  textAlign(CENTER);
  text("¡GANASTE!", width / 2, height / 2 - 20);
  textSize(16);
  text("Presiona ENTER para volver a jugar", width / 2, height / 2 + 20);
  noLoop();
  gameOverFlag = true;
}

function resetGame() {
  level = 1;
  score = 0;
  lives = 3;
  gameStarted = false; // ← importante
  paused = false;
  gameOverFlag = false;
  levelCompleted = false;
  loop(); // reanuda draw()
}

class Paddle {
  constructor() {
    this.w = 100;
    this.h = 15;
    this.x = width / 2 - this.w / 2;
    this.y = height - 30;
    this.speed = 7;
    this.direction = 0;
  }

  update() {
    this.x += this.direction * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }

  move(dir) {
    this.direction = dir;
  }

  display() {
    fill('#457B9D');
    rect(this.x, this.y, this.w, this.h, 10);
  }
}

class Ball {
  constructor() {
    this.r = 10;
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.vx = 4;
    this.vy = -4;
  }

  speedUp(mult = 1.2) {
    this.vx *= mult;
    this.vy *= mult;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  display() {
    fill('#1D3557');
    ellipse(this.x, this.y, this.r * 2);
  }

  reverseY() {
    this.vy *= -1;
  }

  reverseX() {
    this.vx *= -1;
  }

  hitsBlock(block) {
    return (
      this.x + this.r > block.x &&
      this.x - this.r < block.x + block.w &&
      this.y + this.r > block.y &&
      this.y - this.r < block.y + block.h
    );
  }

  checkEdges(paddle) {
    if (this.x < 0 || this.x > width) this.reverseX();
    if (this.y < 0) this.reverseY();

    const touchingPaddle =
      this.vy > 0 &&
      this.y + this.r >= paddle.y &&
      this.y + this.r <= paddle.y + paddle.h &&
      this.x > paddle.x &&
      this.x < paddle.x + paddle.w;

    if (touchingPaddle) {
      this.reverseY();
      let hitPos = (this.x - paddle.x) / paddle.w - 0.5;
      this.vx += hitPos * 4;
    }
  }

  offScreen() {
    return this.y > height;
  }
}

class Block {
  constructor(x, y, w, h, color, health = 1, indestructible = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.health = health;
    this.indestructible = indestructible;
  }

  display() {
    if (this.indestructible) fill('#6D6875');
    else fill(this.color);
    rect(this.x, this.y, this.w, this.h);
    if (this.health > 1) {
      fill(0);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(this.health, this.x + this.w / 2, this.y + this.h / 2);
    }
  }

  hit() {
    if (!this.indestructible) this.health--;
  }
}
