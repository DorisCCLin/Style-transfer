const model = new mi.ArbitraryStyleTransferNetwork();
const modelStatus = document.getElementById('status');
const stylizedCanvas = document.getElementById('stylized-canvas');
const stylizedCanvasContext = stylizedCanvas.getContext('2d');
const styleImage = document.getElementById('style-image');
const contentSpinner = document.getElementById('content-spinner');
const stylizedSpinner = document.getElementById('stylized-spinner');
const playStopButton = document.getElementById('play-stop-button');
const buttons = document.getElementsByTagName('button');

// Change these variables for different animation length and speeds
const framesPerSecondToDraw = 12;
const waitTimeBeforeDrawingEachNewFrame = 3;
const maxFramesInLoop = 3;
const contentWidth = 320;
const contentHeight = 240;
const loopTimeout = 1200;

// TODO: Half Tone Comic book CSS?

// TODO: Fix imports

// TODO: Reactify

// Other variables
let p5Canvas;
let video;
let isPlaying = false;
let isWebcam = false;
let isAnimation = true;
let modelReady = false;
let videoReady = false;
let animationFrames = [];
let stylizedAnimationFrames = {
  style1: [],
  style2: [],
  style3: [],
};
let webcamFrames = [];
// let stylizedWebcamFrames = [];
let stylizedWebcamFrames = {
  style1: [],
  style2: [],
  style3: [],
};
let currentFrame = 0;
let frameCount = 0;
let time = 0;
let styleOption = 'style1';
let loopCount = 0;

/**
 Modal section 
 */
// Get the modal
var modal = document.getElementById('infoModal');

// Get the button that opens the modal
var btn = document.getElementById('openBtn');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('closeBtn')[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

/**
 * This updates the style image.
 */
function onSelectStyleClick(element) {
  // console.log('onSelectStyleClick');
  styleImage.src = element.value;
  styleOption = element.name;
  if (!modelReady) {
    return;
  }
  if (isWebcam && videoReady) {
    createWebcamLoop();
    return;
  }
  if (isAnimation) {
    createAnimationLoop();
  }
}

/**
 * This begins looping for animation images.
 */
function onAnimationLoopClick() {
  // console.log('onAnimationLoopClick');
  if (modelReady) {
    createAnimationLoop();
  }
}

/**
 * This sets up the main loop to play and stylize animation frames.
 */
function createAnimationLoop() {
  p5Canvas.show();
  isAnimation = true;
  isWebcam = false;
  isPlaying = true;
  frameCount = 0;
  playStopButton.innerHTML = 'Stop';
  modelStatus.innerHTML = 'Looping';
  if (stylizedAnimationFrames[styleOption].length === 0) {
    // Indicate that we will begin processing the images
    modelStatus.classList.remove('loaded');
    modelStatus.classList.add('loading');
    modelStatus.innerHTML = 'Processing';
    stylizedSpinner.style.display = 'block';
  }
  loop();
  loopCount = 0;
}

/**
 * This begins looping for webcam images.
 */
function onWebcamLoopClick() {
  // console.log('onWebcamLoopClick');
  if (modelReady && videoReady) {
    createWebcamLoop();
    return;
  }
  // Create webcam video if its not ready
  if (!videoReady) {
    contentSpinner.style.display = 'block';
    video = createCapture(VIDEO, () => {
      videoReady = true;
      console.log('Webcam video is Ready');
      video.size(contentWidth, contentHeight);
      video.parent('p5-video-container');
      contentSpinner.style.display = 'none';
      video.style('display', 'none');
      if (modelReady) {
        createWebcamLoop();
      }
    });
  }
}

/**
 * This sets up the main loop to play and stylize webcam frames.
 */
function createWebcamLoop() {
  video.show();
  p5Canvas.show();
  isWebcam = true;
  isAnimation = false;
  isPlaying = true;
  webcamFrames = [];
  stylizedWebcamFrames[styleOption] = [];
  frameCount = 0;
  // Indicate that we will begin processing the images
  modelStatus.classList.remove('loaded');
  modelStatus.classList.add('loading');
  modelStatus.innerHTML = 'Processing';
  stylizedSpinner.style.display = 'block';
  playStopButton.innerHTML = 'Stop';
  loop();
  loopCount = 0;
}

/**
 * This plays or stops looping.
 *
 */
function onPlayStopToggle() {
  if (isAnimation && stylizedAnimationFrames[styleOption].length === 0) {
    return;
  }
  if (isWebcam && stylizedWebcamFrames[styleOption].length === 0) {
    return;
  }
  if (isPlaying) {
    // console.log('Stop Pressed');
    modelStatus.innerHTML = 'Ready';
    playStopButton.innerHTML = 'Play';
    noLoop();
    loopCount = 0;
    isPlaying = false;
  } else {
    // console.log('Play Pressed');
    modelStatus.innerHTML = 'Looping';
    playStopButton.innerHTML = 'Stop';
    loop();
    loopCount = 0;
    isPlaying = true;
  }
}

/**
 * Loads the style transfer model.
 */
function preload() {
  styleImage.width = contentWidth;
  styleImage.height = contentHeight;
  stylizedCanvas.width = contentWidth;
  stylizedCanvas.height = contentHeight;
  stylizedSpinner.style.display = 'block';
  // Disable buttons until model is loaded
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
  model.initialize().then(() => {
    console.log('Model is Ready');
    modelReady = true;
    modelStatus.classList.remove('loading');
    modelStatus.classList.add('loaded');
    modelStatus.innerHTML = 'Ready';
    stylizedSpinner.style.display = 'none';
    // Enable all buttons
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = false;
    }
  });
  for (let i = 0; i < 3; i += 1) {
    animationFrames[i] = createImg(
      `images/defunctcommercials${i}.jpg`,
      `Dancing Animation Frame ${i}`,
      'anonymous',
      () => {
        image(animationFrames[i], 0, 0);
      }
    );
    animationFrames[i].hide();
  }
}

/**
 * This creates the p5 canvas.
 * It runs immediately after the preload function.
 */
function setup() {
  p5Canvas = createCanvas(contentWidth, contentHeight);
  p5Canvas.parent('p5-canvas-container');
  background(0);
  frameRate(framesPerSecondToDraw);
  noLoop();
  loopCount = 0;
}

/**
 * This function runs continuously as a loop. It displays the animation
 * or webcam images, and their stylized counterparts.
 * The framesPerSecondToDraw variable determines how many times it loops
 * per second.
 */
function draw() {
  loopCount += 1;
  // console.log('Looping:', loopCount);

  // This times out after loopTimeout is reached so the looping doesn't
  // continue forever.
  if (loopCount > loopTimeout) {
    noLoop();
    loopCount = 0;
    isPlaying = false;
    playStopButton.innerHTML = 'Play';
    modelStatus.innerHTML = 'Ready';
    return;
  }

  // Increase time
  time += 1;

  // Wait cycles before drawing a new frame
  if (time < waitTimeBeforeDrawingEachNewFrame) {
    return;
  }
  // Reset time
  time = 0;

  if (isAnimation) {
    // Render animation frame to content canvas
    if (animationFrames.length > 0) {
      image(animationFrames[currentFrame], 0, 0);
    }

    // Render styled animation frame to style canvas
    if (currentFrame < stylizedAnimationFrames[styleOption].length) {
      stylizedSpinner.style.display = 'none';
      stylizedCanvasContext.putImageData(
        stylizedAnimationFrames[styleOption][currentFrame],
        0,
        0
      );
    }

    // Stylize the animation frames
    if (
      modelReady &&
      animationFrames.length > 0 &&
      stylizedAnimationFrames[styleOption].length === 0
    ) {
      animationFrames.forEach((image) => {
        model.stylize(image.elt, styleImage).then((imageData) => {
          // When style transfer complete (which happens asynchronously)
          // add imageData to styleFrames array
          stylizedAnimationFrames[styleOption].push(imageData);
          if (
            stylizedAnimationFrames[styleOption].length ===
            animationFrames.length
          ) {
            modelStatus.classList.remove('loading');
            modelStatus.classList.add('loaded');
            modelStatus.innerHTML = 'Looping';
            stylizedSpinner.style.display = 'none';
          }
        });
      });
    }

    // Update frame to show next
    currentFrame += 1;
    if (currentFrame >= animationFrames.length) {
      currentFrame = 0;
    }
  }

  if (isWebcam) {
    // Render webcam video frame to content canvas
    if (webcamFrames.length > 0) {
      image(webcamFrames[currentFrame], 0, 0);
    }

    // Render styled webcam frame to style canvas
    if (currentFrame < stylizedWebcamFrames[styleOption].length) {
      stylizedSpinner.style.display = 'none';
      stylizedCanvasContext.putImageData(
        stylizedWebcamFrames[styleOption][currentFrame],
        0,
        0
      );
    }

    // Grab frame from webcam video and style it asynchronously
    if (videoReady && webcamFrames.length < maxFramesInLoop) {
      webcamFrames[frameCount] = video.get();
      model.stylize(video.elt, styleImage).then((imageData) => {
        // When style transfer complete (which happens asynchronously)
        // add imageData to styleFrames array
        stylizedWebcamFrames[styleOption].push(imageData);
        if (stylizedWebcamFrames[styleOption].length === maxFramesInLoop) {
          modelStatus.classList.remove('loading');
          modelStatus.classList.add('loaded');
          modelStatus.innerHTML = 'Looping';
          video.style('display', 'none');
        }
      });
      frameCount += 1;
    }

    // Update frame to show next
    currentFrame += 1;
    if (currentFrame >= webcamFrames.length) {
      currentFrame = 0;
    }
  }
}
