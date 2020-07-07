const model = new mi.ArbitraryStyleTransferNetwork();
const modelStatus = document.getElementById('status');
const styleCanvas = document.getElementById('styled');
const styleCanvasContext = styleCanvas.getContext('2d');
const styleImg = document.getElementById('style');

// Change these variables for different animation length and speeds
const framesPerSecondToDraw = 12;
const waitTimeBeforeDrawingEachNewFrame = 3;
const maxFramesInLoop = 6;

// Other variables
let currentFrame = 0;
let frameCount = 0;
let looping = false;
let modelReady = false;
let startButton;
let stopButton;
let styledFrames = [];
let video;
let videoFrames = [];
let videoReady = false;
let time = 0;

// MakeLoop resets variables and begins the actions in the draw loop
function makeLoop() {
  if (modelReady) {
    looping = true;
    videoFrames = [];
    styledFrames = [];
    frameCount = 0;
    // Indicate that we will begin processing the images
    modelStatus.innerHTML = 'Processing . . .';
  }
}

// StopLoop stops the processing in the draw loop
function stopLoop() {
  modelStatus.innerHTML = 'Ready';
  looping = false;
}

// Loads the style transfer model
function preload() {
  model.initialize().then(()=>{
    console.log('Model is Ready');
    modelReady = true;
    modelStatus.innerHTML = 'Ready';
  });
}

// After preload, this creates the video canvas, webcam, and buttons
function setup() {
  createCanvas(320,240);
  background(255);
  frameRate(framesPerSecondToDraw);
  video = createCapture(VIDEO, () => {
    videoReady = true;
    console.log('Video is Ready');
    video.size(320,240);
    // video.hide();
  });
  startButton = createButton('Make Loop');
  stopButton = createButton('Stop');
  startButton.mousePressed(makeLoop);
  stopButton.mousePressed(stopLoop);
}

// The draw function runs continously as a loop and
// framesPerSecondToDraw determines how many times it loops per second.
function draw() {
  // Wait till Make Loop button pressed before looping
  if (looping) {
    // Increase time
    time += 1;
    // Wait cycles before drawing a new frame
    if (time > waitTimeBeforeDrawingEachNewFrame) {
      // Reset time
      time = 0;
      // Render video frame to video canvas
      if (videoFrames.length > 0) {
        image(videoFrames[currentFrame], 0, 0);
      }
      // Render styled frame to style canvas
      if (currentFrame < styledFrames.length) {
        styleCanvasContext.putImageData(styledFrames[currentFrame], 0, 0);
      }
      // Grab frame from video and style it asynchronously
      if ((videoReady) && (videoFrames.length < maxFramesInLoop)) {
        videoFrames[frameCount] = video.get();
        model.stylize(video.elt, styleImg).then((imageData) => {
          // When style transfer complete (aysnchronous)
          // add imageData to syleFrames array
          styledFrames.push(imageData);
          if (styledFrames.length === maxFramesInLoop) {
            modelStatus.innerHTML = 'Loop finished';
          }
        });
        frameCount += 1;
      }
      // Update frame to show next
      currentFrame += 1;
      if (currentFrame >= videoFrames.length) {
        currentFrame = 0;
      }
    }
  }
}
