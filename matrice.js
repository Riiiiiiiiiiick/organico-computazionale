let grid;
let next;

let scala = 50;
let cols = 50;
let rows = 50;

let canvasWidth = cols * scala;
let canvasHeight = rows * scala;

let dA = 1;
let dB = 0.5;
let feed = 0.05388;
let k = 0.06113;

let lastRestartTime = 0;
let restartInterval = 5000*4;

function setup() {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  frameRate(30);
  pixelDensity(1);
  noSmooth();

  initGrid();
}

function initGrid() {
  grid = [];
  next = [];
  for (let x = 0; x < cols; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < rows; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }

  let numCircles = 5;  
  let radius = 4;           

  for (let c = 0; c < numCircles; c++) {
    let centerX = floor(random(radius, cols - radius));
    let centerY = floor(random(radius, rows - radius));

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx * dx + dy * dy <= radius * radius) {
          let x = centerX + dx;
          let y = centerY + dy;
          if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[x][y].b = 1;
          }
        }
      }
    }
  }
}

function draw() {
  if (millis() - lastRestartTime > restartInterval) {
    initGrid();
    lastRestartTime = millis();
  }

  background(255);

  for (let n = 0; n < 4; n++) {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let a = grid[x][y].a;
        let b = grid[x][y].b;
        next[x][y].a = a + dA * laplaceA(x, y) - a * b * b + feed * (1 - a);
        next[x][y].b = b + dB * laplaceB(x, y) + a * b * b - (k + feed) * b;

        next[x][y].a = constrain(next[x][y].a, 0, 1);
        next[x][y].b = constrain(next[x][y].b, 0, 1);
      }
    }
    swap();
  }

  loadPixels();
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    let a = grid[x][y].a;
    let b = grid[x][y].b;
    let diff = a - b;

    let useBright = diff >= 0.1;

    let rCol = useBright ? 192 : 10;
    let gCol = useBright ? 192 : 10;
    let bCol = useBright ? 192 : 10;

    let rStroke = 192 - rCol;
    let gStroke = 192 - gCol;
    let bStroke = 192 - bCol;

    let startX = x * scala;
    let startY = y * scala;

    for (let dx = 0; dx < scala; dx++) {
      for (let dy = 0; dy < scala; dy++) {
        let px = startX + dx;
        let py = startY + dy;
        let i = 4 * (px + py * width);
        if (i >= 0 && i + 3 < pixels.length) {
          if (
          (dx === 0 && dy % 2 === 0) ||
          (dx === scala - 1 && dy % 2 === 0) ||
          (dy === 0 && dx % 2 === 0) ||
          (dy === scala - 1 && dx % 2 === 0)
        ) {
          pixels[i] = rStroke;
          pixels[i + 1] = gStroke;
          pixels[i + 2] = bStroke;
          pixels[i + 3] = 255;
        } else {
          pixels[i] = rCol;
          pixels[i + 1] = gCol;
          pixels[i + 2] = bCol;
          pixels[i + 3] = 255;
        }

        }
      }
    }
  }
}
updatePixels();
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
