function setup(){
  createCanvas(windowWidth,windowHeight);
}

function draw(){
  background(10, 10, 10);
  pixelDensity(4)

  reaction();

}

function reaction(){
  stroke(192,192,192);
  noFill();
  strokeWeight(0.75);
  line(width/2,33,width/2,height-33);

  strokeJoin(ROUND);
  textSize(52.8);
  textLeading(45);
  textStyle(BOLD);
  textFont("Helvetica");
  text('REACTION /\nDIFFUSION',width/2+12,height/2);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(10, 10, 10);
}

