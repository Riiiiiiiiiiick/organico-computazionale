let grid;
let next;

let scala = 2;
let cols, rows;

let dA = 1.0;
let dB = 0.5;
let feed = 0.045;
let k = 0.06;

let startTime;
let lastScala = +2;
let pg;
let textLayer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(30);

  pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0, 0);
  pg.fill(255);
  pg.textSize(52.8*1.8);
  pg.textLeading(45*1.8);
  pg.textAlign(LEFT, CENTER);
  pg.textStyle(BOLD);
  pg.textFont("Helvetica");
  pg.text('ORGANICO /\nCOMPUTAZIONALE',30, height / 3);
  pg.text('REACTION /\nDIFFUSION', width/2, (height*2) / 3);

  textLayer = createGraphics(width, height);
  textLayer.pixelDensity(1);
  textLayer.background(0, 0);
  textLayer.fill(192);
  textLayer.textSize(52.8*1.8);
  textLayer.textLeading(45*1.8);
  textLayer.textAlign(LEFT, CENTER);
  textLayer.textStyle(BOLD);
  textLayer.textFont("Helvetica");
  textLayer.text('ORGANICO /\nCOMPUTAZIONALE', 30, height / 3);
  textLayer.text('REACTION /\nDIFFUSION', width/2, (height*2) / 3);

  startTime = millis();
  inizioSim();
  lastScala = scala;
}

function inizioSim() {
  cols = floor(width / scala);
  rows = floor(height / scala);

  grid = new Array(cols);
  next = new Array(cols);
  for (let x = 0; x < cols; x++) {
    grid[x] = new Array(rows);
    next[x] = new Array(rows);
    for (let y = 0; y < rows; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let c = pg.get(x * scala, y * scala);
      if (c[3] > 0) {
        grid[x][y].b = 1;
      }
    }
  }
}

function draw() {
  background(10);

  scala = 5;

  if (scala !== lastScala) {
    inizioSim();
    lastScala = scala;
  }

  let speedFactor = 1;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = grid[x][y].a;
      let b = grid[x][y].b;

      next[x][y].a = a + speedFactor * (dA * laplaceA(x, y) - a * b * b + feed * (1 - a));
      next[x][y].b = b + speedFactor * (dB * laplaceB(x, y) + a * b * b - (k + feed) * b);

      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }

  noStroke();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let a = next[x][y].a;
      let b = next[x][y].b;
      let value = a - b;
      let threshold = 0.05;

      let col = value > threshold ? color(10, 10, 10) : color(192, 192, 192);
      fill(col);
      rect(x * scala, y * scala, scala, scala);
    }
  }

  textLayer.loadPixels();
  loadPixels();

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let i = (y * width + x) * 4;

      let r = textLayer.pixels[i];
      let g = textLayer.pixels[i + 1];
      let b = textLayer.pixels[i + 2];
      let a = textLayer.pixels[i + 3];

      if (a > 0) {
        let gx = floor(x / scala);
        let gy = floor(y / scala);

        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          let diff = next[gx][gy].a - next[gx][gy].b;
          let threshold = 0.05;

          if (diff < threshold) {
            r = 10;
            g = 10;
            b = 10;
          } else {
            r = 192;
            g = 192;
            b = 192;
          }

          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = 255;
        }
      }
    }
  }

  updatePixels();
  swap();
}



function laplaceA(x, y) {
  let sumA = 0;
  sumA += grid[x][y].a * -1;
  sumA += grid[(x - 1 + cols) % cols][y].a * 0.2;
  sumA += grid[(x + 1) % cols][y].a * 0.2;
  sumA += grid[x][(y - 1 + rows) % rows].a * 0.2;
  sumA += grid[x][(y + 1) % rows].a * 0.2;
  sumA += grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].a * 0.05;
  sumA += grid[(x + 1) % cols][(y - 1 + rows) % rows].a * 0.05;
  sumA += grid[(x + 1) % cols][(y + 1) % rows].a * 0.05;
  sumA += grid[(x - 1 + cols) % cols][(y + 1) % rows].a * 0.05;
  return sumA;
}

function laplaceB(x, y) {
  let sumB = 0;
  sumB += grid[x][y].b * -1;
  sumB += grid[(x - 1 + cols) % cols][y].b * 0.2;
  sumB += grid[(x + 1) % cols][y].b * 0.2;
  sumB += grid[x][(y - 1 + rows) % rows].b * 0.2;
  sumB += grid[x][(y + 1) % rows].b * 0.2;
  sumB += grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].b * 0.05;
  sumB += grid[(x + 1) % cols][(y - 1 + rows) % rows].b * 0.05;
  sumB += grid[(x + 1) % cols][(y + 1) % rows].b * 0.05;
  sumB += grid[(x - 1 + cols) % cols][(y + 1) % rows].b * 0.05;
  return sumB;
}

function swap() {
  let temp = grid;
  grid = next;
  next = temp;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}
