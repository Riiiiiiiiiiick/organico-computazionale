let ibmFont;

let grid, next;
let scala = 5;
let simWidth, simHeight;
let cols, rows;
let offsetX;

let dA = 1;
let dB = 0.5;
let feed = 0.05;
let k = 0.06;

let colReactionBright, colReactionDark;
let pickerBright, pickerDark;
let feedSlider, killSlider, dASlider, dBSlider;
let feedValDisplay, killValDisplay, dAValDisplay, dBValDisplay;

function preload() {
  let link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@200&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  frameRate(30);

  simWidth = floor((width * 5) / 6);
  offsetX = floor(width / 6);
  simHeight = height;

  cols = floor(simWidth / scala);
  rows = floor(simHeight / scala);

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

  colReactionDark = color(10, 10, 10);
  colReactionBright = color(192, 192, 192);

  let yStart = 105.6;
  let xMargin = 35.2;
  let gap = 35.2;
  let sliderWidth = offsetX - xMargin * 2;

  function createLabelValue(text, y) {
    let container = createDiv()
      .position(xMargin, y)
      .style('width', sliderWidth + 'px')
      .style('display', 'flex')
      .style('justify-content', 'space-between')
      .style('font-family', "'IBM Plex Mono', monospace")
      .style('font-weight', '200')
      .style('font-style', 'normal')
      .style('color', '#ccc')
      .style('margin', '0');
    let label = createP(text)
      .parent(container)
      .style('margin', '0')
      .style('font-weight', '200')
      .style('font-style', 'normal');
    let value = createP('')
      .parent(container)
      .style('margin', '0')
      .style('font-weight', '200')
      .style('font-style', 'normal');
    return { container, label, value };
  }

  let dAGroup = createLabelValue("diffusione A", yStart);
  dASlider = createSlider(0.1, 2.0, dA, 0.01)
    .position(xMargin, yStart + 20)
    .style('width', sliderWidth + 'px')
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('margin', '0 0 20px 0')
  dAValDisplay = dAGroup.value;

  yStart += gap;
  let dBGroup = createLabelValue("diffusione B", yStart);
  dBSlider = createSlider(0.1, 2.0, dB, 0.01)
    .position(xMargin, yStart + 20)
    .style('width', sliderWidth + 'px')
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('margin', '0 0 10px 0')
  dBValDisplay = dBGroup.value;

  yStart += gap;
  let feedGroup = createLabelValue("feed Rate", yStart);
  feedSlider = createSlider(0.0, 0.1, feed, 0.001)
    .position(xMargin, yStart + 20)
    .style('width', sliderWidth + 'px')
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('margin', '0 0 10px 0')
  feedValDisplay = feedGroup.value;

  yStart += gap;
  let killGroup = createLabelValue("kill Rate", yStart);
  killSlider = createSlider(0.0, 0.1, k, 0.001)
    .position(xMargin, yStart + 20)
    .style('width', sliderWidth + 'px')
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('margin', '0 0 10px 0')
  killValDisplay = killGroup.value;

  yStart += gap*2;
  createP("colore reazione")
    .position(xMargin, yStart)
    .style('font-family', "'IBM Plex Mono', monospace")
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('color', '#ccc')
    .style('margin', '0 0 10px 0')
  pickerBright = createColorPicker(colReactionBright).position(xMargin, yStart + 30);

  yStart += gap*2;
  createP("colore sfondo")
    .position(xMargin, yStart)
    .style('font-family', "'IBM Plex Mono', monospace")
    .style('font-weight', '200')
    .style('font-style', 'normal')
    .style('color', '#ccc')
    .style('margin', '0 0 10px 0')
  pickerDark = createColorPicker(colReactionDark).position(xMargin, yStart + 30);
  
  [pickerBright, pickerDark].forEach((picker) => {
    picker.elt.style.border = '1px solid #666';
  });
  updateUIPositions();
}

function draw() {
  background(10);

  feed = feedSlider.value();
  k = killSlider.value();
  dA = dASlider.value();
  dB = dBSlider.value();
  colReactionBright = pickerBright.color();
  colReactionDark = pickerDark.color();

  dAValDisplay.html(nf(dA, 1, 2));
  dBValDisplay.html(nf(dB, 1, 2));
  feedValDisplay.html(nf(feed, 1, 3));
  killValDisplay.html(nf(k, 1, 3));

  stroke(255);
  strokeWeight(1);
  line(offsetX, 0, offsetX, height);

  if (mouseIsPressed && mouseX > offsetX) {
    let steps = 20;
    for (let i = 0; i <= steps; i++) {
      let lerpX = lerp(pmouseX, mouseX, i / steps) - offsetX;
      let lerpY = lerp(pmouseY, mouseY, i / steps);
      let mx = floor(lerpX / scala);
      let my = floor(lerpY / scala);
      let r = 5;

      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (dx * dx + dy * dy <= r * r) {
            let x = (mx + dx + cols) % cols;
            let y = (my + dy + rows) % rows;
            grid[x][y].b = 1;
          }
        }
      }
    }
  }

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
      let col = diff > 0.1 ? colReactionDark : colReactionBright;

      for (let dx = 0; dx < scala; dx++) {
        for (let dy = 0; dy < scala; dy++) {
          let px = offsetX + x * scala + dx;
          let py = y * scala + dy;
          let i = 4 * (px + py * width);
          if (i >= 0 && i + 3 < pixels.length) {
            pixels[i] = red(col);
            pixels[i + 1] = green(col);
            pixels[i + 2] = blue(col);
            pixels[i + 3] = 255;
          }
        }
      }
    }
  }
  updatePixels();
}

function laplaceA(x, y) {
  let sum = 0;
  sum += grid[x][y].a * -1;

  sum += grid[(x - 1 + cols) % cols][y].a * 0.2;
  sum += grid[(x + 1) % cols][y].a * 0.2;
  sum += grid[x][(y - 1 + rows) % rows].a * 0.2;
  sum += grid[x][(y + 1) % rows].a * 0.2;

  sum += grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].a * 0.05;
  sum += grid[(x + 1) % cols][(y - 1 + rows) % rows].a * 0.05;
  sum += grid[(x + 1) % cols][(y + 1) % rows].a * 0.05;
  sum += grid[(x - 1 + cols) % cols][(y + 1) % rows].a * 0.05;

  return sum;
}

function laplaceB(x, y) {
  let sum = 0;
  sum += grid[x][y].b * -1;

  sum += grid[(x - 1 + cols) % cols][y].b * 0.2;
  sum += grid[(x + 1) % cols][y].b * 0.2;
  sum += grid[x][(y - 1 + rows) % rows].b * 0.2;
  sum += grid[x][(y + 1) % rows].b * 0.2;

  sum += grid[(x - 1 + cols) % cols][(y - 1 + rows) % rows].b * 0.05;
  sum += grid[(x + 1) % cols][(y - 1 + rows) % rows].b * 0.05;
  sum += grid[(x + 1) % cols][(y + 1) % rows].b * 0.05;
  sum += grid[(x - 1 + cols) % cols][(y + 1) % rows].b * 0.05;

  return sum;
}

function swap() {
  let temp = grid;
  grid = next;
  next = temp;
}

function keyPressed() {
  if (key === 's') {
    let simImage = get(offsetX, 0, simWidth, height);
    simImage.save('reaction-diffusion', 'jpg');
  }
}

function updateUIPositions() {
  let yStart = 105.6;
  let xMargin = 35.2;
  let gap = 35.2;
  let sliderWidth = offsetX - xMargin * 2;

  dASlider.position(xMargin, yStart + 20).style('width', sliderWidth + 'px');
  dBSlider.position(xMargin, yStart + 20 + gap).style('width', sliderWidth + 'px');
  feedSlider.position(xMargin, yStart + 20 + gap * 2).style('width', sliderWidth + 'px');
  killSlider.position(xMargin, yStart + 20 + gap * 3).style('width', sliderWidth + 'px');

  pickerBright.position(xMargin, yStart + 30 + gap * 5);
  pickerDark.position(xMargin, yStart + 30 + gap * 7);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  simWidth = floor((width * 5) / 6);
  offsetX = floor(width / 6);
  simHeight = height;

  cols = floor(simWidth / scala);
  rows = floor(simHeight / scala);

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
  updateUIPositions();
}
