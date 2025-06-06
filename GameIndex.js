let nave;
let enemigos = [];
let disparos = [];
let disparosEnemigos = [];
let puntos = 0;
let vidas = 3;
let nivel = 1;
let juegoIniciado = false;
let enPausa = false;

let mensajeTemporal = "";
let tiempoMensaje = 0;

let estrellas = [];
let nebulosas = [];
const NUM_ESTRELLAS = 200;
const NUM_NEBULOSAS = 5;

function setup() {
  createCanvas(1000, 790);
  
  for (let i = 0; i < NUM_ESTRELLAS; i++) {
    estrellas.push({
      x: random(width),
      y: random(height),
      z: random(0.2, 1),
      speed: random(0.5, 2),
      size: random(1, 3)
    });
  }
  
  for (let i = 0; i < NUM_NEBULOSAS; i++) {
    nebulosas.push({
      x: random(width),
      y: random(height * 2),
      size: random(100, 300),
      color: color(random(50, 100), random(50, 100), random(150, 255), random(30, 80)),
      speed: random(0.1, 0.5)
    });
  }
}

function draw() {
  drawSpaceBackground();
  
  drawStars();
  drawNebulas();
  
  if (!juegoIniciado) {
    drawMenu();
    return;
  }

  if (enPausa) {
    drawPauseScreen();
    return;
  }

  nave.mover();
  nave.dibujar();

  if (keyIsDown(32) && frameCount % 10 === 0) {
    nave.disparar();
  }

  actualizarEnemigos();
  actualizarDisparos();
  actualizarDisparosEnemigos();
  verificarColisiones();
  dibujarUI();
}

function drawSpaceBackground() {
  let from = color(5, 5, 25);
  let to = color(0, 0, 0);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(from, to, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawStars() {
  for (let estrella of estrellas) {
    estrella.y += estrella.speed * estrella.z;
    
    if (estrella.y > height) {
      estrella.y = 0;
      estrella.x = random(width);
    }
    
    let alpha = map(estrella.z, 0.2, 1, 100, 255);
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(estrella.x, estrella.y, estrella.size * estrella.z);
    
    if (random() < 0.01) {
      fill(255, 255, 255, random(50, 150));
      ellipse(estrella.x, estrella.y, estrella.size * 3 * estrella.z);
    }
  }
}

function drawNebulas() {
  for (let nebulosa of nebulosas) {
    nebulosa.y += nebulosa.speed;
    
    if (nebulosa.y > height + nebulosa.size/2) {
      nebulosa.y = -nebulosa.size/2;
      nebulosa.x = random(width);
    }
    
    push();
    translate(nebulosa.x, nebulosa.y);
    for (let i = 0; i < 3; i++) {
      let size = nebulosa.size * (1 - i*0.3);
      let alpha = nebulosa.color.levels[3] * (1 - i*0.3);
      fill(red(nebulosa.color), green(nebulosa.color), blue(nebulosa.color), alpha);
      ellipse(0, 0, size);
    }
    pop();
  }
}

function drawMenu() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Presiona ENTER para comenzar", width / 2, height / 2 - 40);
  textSize(20);
  text("Controles:", width / 2, height / 2 + 20);
  text("← →  para moverse", width / 2, height / 2 + 50);
  text("ESPACIO para disparar", width / 2, height / 2 + 80);
  text("ENTER para pausar/reanudar", width / 2, height / 2 + 110);
  mostrarTop();

  if (mensajeTemporal && millis() - tiempoMensaje < 3000) {
    textSize(28);
    fill(255, 100, 100);
    text(mensajeTemporal, width / 2, height / 2 - 100);
  }
}

function drawPauseScreen() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("PAUSA", width / 2, height / 2);
}

class Nave {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.velocidad = 5;
    this.tamano = 40;
    this.animacion = 0;
  }

  mover() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.velocidad;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.velocidad;
    this.x = constrain(this.x, 0, width);
    this.animacion = sin(frameCount * 0.1) * 2;
  }

  disparar() {
    disparos.push(new Bala(this.x, this.y - this.tamano, -10, color(0, 255, 255)));
  }

  dibujar() {
    push();
    translate(this.x, this.y + this.animacion);
    
    fill(50, 200, 50);
    beginShape();
    vertex(0, -this.tamano);
    vertex(-this.tamano * 0.4, -this.tamano * 0.3);
    vertex(-this.tamano * 0.5, this.tamano * 0.5);
    vertex(this.tamano * 0.5, this.tamano * 0.5);
    vertex(this.tamano * 0.4, -this.tamano * 0.3);
    endShape(CLOSE);
    
    fill(100, 255, 100);
    ellipse(0, -this.tamano * 0.5, this.tamano * 0.6, this.tamano * 0.3);
    
    fill(200, 250, 255);
    ellipse(0, -this.tamano * 0.7, this.tamano * 0.3, this.tamano * 0.2);
    
    fill(200, 100, 50);
    rect(-this.tamano * 0.3, this.tamano * 0.5, this.tamano * 0.2, this.tamano * 0.3);
    rect(this.tamano * 0.1, this.tamano * 0.5, this.tamano * 0.2, this.tamano * 0.3);
    
    if (frameCount % 10 < 5) {
      fill(255, 150, 0);
      triangle(
        -this.tamano * 0.3, this.tamano * 0.8,
        -this.tamano * 0.2, this.tamano * 0.8 + this.tamano * 0.3,
        -this.tamano * 0.4, this.tamano * 0.8 + this.tamano * 0.3
      );
      triangle(
        this.tamano * 0.1, this.tamano * 0.8,
        this.tamano * 0.2, this.tamano * 0.8 + this.tamano * 0.3,
        this.tamano * 0.0, this.tamano * 0.8 + this.tamano * 0.3
      );
    }
    
    pop();
  }
}

class Enemigo {
  constructor(x, y, vida = 1, esJefe = false) {
    this.x = x;
    this.y = y;
    this.velocidadX = 1 + nivel * 0.5;
    this.velocidadY = 0;
    this.tamano = esJefe ? 70 : vida > 1 ? 35 : 30;
    this.vida = vida;
    this.vidaInicial = vida;
    this.esJefe = esJefe;
    this.tiempoParaCaer = floor(random(60, 180));
    this.contadorCaida = 0;
    this.rotacion = 0;
    this.direccionRotacion = random([-1, 1]);
  }

  actualizar() {
    this.x += this.velocidadX;
    this.rotacion += this.direccionRotacion * 0.02;

    if (this.x <= 0 || this.x >= width) {
      this.velocidadX *= -1;
      this.direccionRotacion *= -1;
    }

    this.contadorCaida++;
    if (this.contadorCaida >= this.tiempoParaCaer) {
      this.velocidadY = 0.5 + nivel * 0.2;
      this.y += this.velocidadY;
    }

    if (random() < 0.01 * nivel ) {
      disparosEnemigos.push(new Bala(this.x, this.y + 15, 5 + nivel, color(255, 100, 0)));
    }
  }

  dibujar() {
    push();
    translate(this.x, this.y);
    rotate(this.rotacion);
    
    if (this.esJefe) {
      fill(255, 215, 0);
      beginShape();
      vertex(0, -this.tamano * 0.6);
      bezierVertex(
        -this.tamano * 0.4, -this.tamano * 0.3,
        -this.tamano * 0.6, 0,
        0, this.tamano * 0.6
      );
      bezierVertex(
        this.tamano * 0.6, 0,
        this.tamano * 0.4, -this.tamano * 0.3,
        0, -this.tamano * 0.6
      );
      endShape();
      
      fill(255, 100, 0);
      ellipse(0, 0, this.tamano * 0.4, this.tamano * 0.4);
      fill(0);
      ellipse(-this.tamano * 0.2, -this.tamano * 0.2, 10, 10);
      ellipse(this.tamano * 0.2, -this.tamano * 0.2, 10, 10);
      
    } else if (this.vidaInicial > 1) {
      fill(150, 0, 200);
      beginShape();
      vertex(-this.tamano * 0.5, -this.tamano * 0.3);
      vertex(0, -this.tamano * 0.5);
      vertex(this.tamano * 0.5, -this.tamano * 0.3);
      vertex(this.tamano * 0.4, this.tamano * 0.3);
      vertex(-this.tamano * 0.4, this.tamano * 0.3);
      endShape(CLOSE);
      
      fill(255);
      ellipse(-this.tamano * 0.2, -this.tamano * 0.2, 8, 8);
      ellipse(this.tamano * 0.2, -this.tamano * 0.2, 8, 8);
      fill(0);
      ellipse(-this.tamano * 0.2, -this.tamano * 0.2, 4, 4);
      ellipse(this.tamano * 0.2, -this.tamano * 0.2, 4, 4);
      
    } else {
      fill(0, 100, 255);
      beginShape();
      vertex(0, -this.tamano * 0.5);
      vertex(-this.tamano * 0.4, this.tamano * 0.1);
      vertex(-this.tamano * 0.2, this.tamano * 0.3);
      vertex(this.tamano * 0.2, this.tamano * 0.3);
      vertex(this.tamano * 0.4, this.tamano * 0.1);
      endShape(CLOSE);
      
      fill(200, 240, 255);
      ellipse(0, -this.tamano * 0.2, this.tamano * 0.3, this.tamano * 0.15);
    }
    
    if (this.vidaInicial > 1) {
      fill(0);
      rect(0, -this.tamano * 0.6, this.tamano, 5);
      fill(this.esJefe ? 255 : 255, 0, 0);
      rect(0, -this.tamano * 0.6, map(this.vida, 0, this.vidaInicial, 0, this.tamano), 5);
    }
    
    pop();
  }

  recibirDanio() {
    this.vida--;
    return this.vida <= 0;
  }
}

class Bala {
  constructor(x, y, velocidad, color) {
    this.x = x;
    this.y = y;
    this.velocidad = velocidad;
    this.tamano = 12;
    this.color = color;
    this.tipo = velocidad < 0 ? 'jugador' : 'enemigo';
  }

  actualizar() {
    this.y += this.velocidad;
  }

  dibujar() {
    push();
    translate(this.x, this.y);
    
    if (this.tipo === 'jugador') {
      fill(this.color);
      beginShape();
      vertex(0, -this.tamano);
      vertex(-3, -this.tamano * 0.7);
      vertex(-2, 0);
      vertex(2, 0);
      vertex(3, -this.tamano * 0.7);
      endShape(CLOSE);
      
      fill(255, 255, 255, 150);
      ellipse(0, -this.tamano * 0.5, 6, 10);
    } else {
      fill(255, 100, 0);
      beginShape();
      vertex(0, this.tamano);
      vertex(-3, this.tamano * 0.7);
      vertex(-2, 0);
      vertex(2, 0);
      vertex(3, this.tamano * 0.7);
      endShape(CLOSE);
      
      fill(255, 200, 0);
      ellipse(0, this.tamano * 0.5, 4, 6);
    }
    
    pop();
  }

  fueraDePantalla() {
    return this.y < -20 || this.y > height + 20;
  }
}

function cargarNivel(n) {
  enemigos = [];
  let cantidad = n === 1 ? 10 : n === 2 ? 15 : 20;
  for (let i = 0; i < cantidad; i++) {
    let x = (i % 10) * 50 + 50;
    let y = floor(i / 10) * 50 + 100;
    enemigos.push(new Enemigo(x, y, 1));
  }
  if (n >= 2) enemigos.push(new Enemigo(300, 150, 3));
  if (n === 3) {
    enemigos.push(new Enemigo(100, 200, 3));
    enemigos.push(new Enemigo(500, 200, 3));
    enemigos.push(new Enemigo(width / 2, 100, 7, true));
  }
}

function actualizarEnemigos() {
  for (let i = enemigos.length - 1; i >= 0; i--) {
    let enemigo = enemigos[i];
    enemigo.actualizar();
    enemigo.dibujar();

    if (enemigo.y >= height - 10) {
      enemigos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        guardarPuntos();
        mostrarMensaje("¡PERDISTE!");
        reiniciarJuego();
        return;
      }
    }
  }

  if (enemigos.length === 0) {
    nivel++;
    if (nivel > 3) {
      guardarPuntos();
      mostrarMensaje("¡GANASTE!");
      reiniciarJuego();
    } else {
      cargarNivel(nivel);
    }
  }
}

function actualizarDisparos() {
  for (let i = disparos.length - 1; i >= 0; i--) {
    disparos[i].actualizar();
    disparos[i].dibujar();
    if (disparos[i].fueraDePantalla()) {
      disparos.splice(i, 1);
    }
  }
}

function actualizarDisparosEnemigos() {
  for (let i = disparosEnemigos.length - 1; i >= 0; i--) {
    disparosEnemigos[i].actualizar();
    disparosEnemigos[i].dibujar();
    if (disparosEnemigos[i].fueraDePantalla()) {
      disparosEnemigos.splice(i, 1);
    }
  }
}

function verificarColisiones() {
  for (let i = disparos.length - 1; i >= 0; i--) {
    let disparo = disparos[i];
    if (!disparo) continue;

    for (let j = enemigos.length - 1; j >= 0; j--) {
      let enemigo = enemigos[j];
      if (!enemigo) continue;

      if (dist(disparo.x, disparo.y, enemigo.x, enemigo.y) < enemigo.tamano / 2) {
        if (enemigo.recibirDanio()) {
          puntos += enemigo.esJefe ? 10 : (enemigo.vidaInicial > 1 ? 3 : 1);
          enemigos.splice(j, 1);
        }
        disparos.splice(i, 1);
        break;
      }
    }
  }

  for (let i = disparosEnemigos.length - 1; i >= 0; i--) {
    let disparo = disparosEnemigos[i];
    if (!disparo || !nave) continue;

    if (dist(disparo.x, disparo.y, nave.x, nave.y) < nave.tamano / 2) {
      disparosEnemigos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        guardarPuntos();
        mostrarMensaje("¡PERDISTE!");
        reiniciarJuego();
        return;
      }
    }
  }

  for (let i = enemigos.length - 1; i >= 0; i--) {
    let enemigo = enemigos[i];
    if (!enemigo || !nave) continue;

    if (dist(enemigo.x, enemigo.y, nave.x, nave.y) < (nave.tamano + enemigo.tamano) / 2) {
      enemigos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        guardarPuntos();
        mostrarMensaje("¡PERDISTE!");
        reiniciarJuego();
        return;
      }
    }
  }
}

function dibujarUI() {
  fill(255);
  textSize(16);
  text(`Puntos: ${puntos}`, 50, 30);
  text(`Vidas: ${vidas}`, width - 100, 30);
  text(`Nivel: ${nivel}`, width / 2 - 30, 30);
}

function keyPressed() {
  if (!juegoIniciado && keyCode === ENTER) {
    nave = new Nave();
    cargarNivel(nivel);
    juegoIniciado = true;
  } else if (juegoIniciado && keyCode === ENTER) {
    enPausa = !enPausa;
  }
}

function guardarPuntos() {
  let top = JSON.parse(localStorage.getItem("topScores")) || [];
  top.push(puntos);
  top.sort((a, b) => b - a);
  top = top.slice(0, 5);
  localStorage.setItem("topScores", JSON.stringify(top));
}

function mostrarTop() {
  let top = JSON.parse(localStorage.getItem("topScores")) || [];
  textAlign(CENTER);
  textSize(20);
  fill(255);
  text("Top 5 puntuaciones:", width / 2, 100);
  top.forEach((p, i) => {
    text(`${i + 1}. ${p}`, width / 2, 130 + i * 30);
  });
}

function reiniciarJuego() {
  juegoIniciado = false;
  enPausa = false;
  puntos = 0;
  vidas = 3;
  nivel = 1;
  enemigos = [];
  disparos = [];
  disparosEnemigos = [];
}

function mostrarMensaje(texto) {
  mensajeTemporal = texto;
  tiempoMensaje = millis();
}