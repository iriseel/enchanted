// Import necessary modules
import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js';

// import text from '@mediapipe/tasks-text/text_bundle.js';
// import audio from '@mediapipe/tasks-audio/audio_bundle.js';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

// Declare MEDIAPIPE variables
let faceLandmarker;
let runningMode = "VIDEO";
let webcamRunning = false;

const video = document.getElementById("webcam");

// Declare eye variables
const body = document.querySelector("body");
const invitation = document.querySelector(".invitation");
const instruction = document.querySelector(".instruction");
const button = document.querySelector(".button");


const faceCanvasElement = document.getElementsByClassName("face_canvas")[0];
const faceCanvasCtx = faceCanvasElement.getContext("2d");
let landmarks_x_cropped = [];
let landmarks_y_cropped = [];
let n_landmarks = [];

// const gridContainer = document.querySelector('.grid-container');

// // Create grid items dynamically
// for (let i = 0; i < 30 * 30; i++) {
//   const gridItem = document.createElement('div');
//   gridItem.classList.add('animated');
//   gridContainer.appendChild(gridItem);
// }

let stage1 = false;
let stage1Launched = false;
//STAGE 1 // COME CLOSER
const userFace = document.querySelector(".userFace");


let stage2 = false;
let stage2Launched = false;
//STAGE 2 // BLINK
const userEyes = document.querySelector(".userEyes");
// const stage1LeftEye = document.querySelector("svg polygon");

let stage3 = false;
let stage3Launched = false;
//STAGE 3 // SPEAK
let wordCount;

let stage4 = false;
let stage4Launched = false;
//STAGE 4
const main = document.querySelector(".main");
let eyeHeight;
let eyeHeight_max = 100;
let left_closed = false;
let right_closed = false;
let been_open = true;
let eyesClosed = 0;
const eyesClosedRatio = 620;
const eyesOpenRatio = 680;

// Function to create FaceLandmarker
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
}
createFaceLandmarker();

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
  button.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam() {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }
    webcamRunning = true;

  const constraints = {
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
  
}

setTimeout(enableCam,100);


let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
    console.log("called")

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks[0]) {
    //Using this right_eye_face_ratio to return the ratio as a percentage (percentage of face that eye takes up) rather than absolute values, and therefore right_eye_face_ratio won't change with the user's distance from the webcam
    let face_bottom_y = results.faceLandmarks[0][152].y;
    let face_top_y = results.faceLandmarks[0][10].y;

    let nose_y = results.faceLandmarks[0][1].y;
    let nose_x = results.faceLandmarks[0][1].x;

    // RIGHT EYE ////////////////////////////////
    let right_eye_bottom_y = results.faceLandmarks[0][472].y;
    let right_eye_top_y = results.faceLandmarks[0][470].y;

    // LEFT EYE ////////////////////////////////
    let left_eye_bottom_y = results.faceLandmarks[0][477].y;
    let left_eye_top_y = results.faceLandmarks[0][475].y;



    //Facemesh/mediapipe gives the x and y values of its landmarks as percentages of the total webcam view size (where 0 is leftmost, 1 is rightmost), rather than specific numerical coordinates.
    let crop_x_percent = results.faceLandmarks[0][234].x;
    let crop_y_percent = results.faceLandmarks[0][10].y;
    //making this smaller so it doesn't get cut off at edges of canvas
    crop_x_percent = crop_x_percent * .65;
    crop_y_percent = crop_y_percent * .65;

    let crop_width_percent =
        results.faceLandmarks[0][454].x - crop_x_percent;
    let crop_height_percent =
        results.faceLandmarks[0][152].y - crop_y_percent;

    // // multiply the percentages by the faceCanvasElement to get their absolute x,y values, rather than just percentages
    let crop_x = crop_x_percent * faceCanvasElement.width;
    let crop_y = crop_y_percent * faceCanvasElement.height;
    let crop_width = crop_width_percent * faceCanvasElement.width;
    let crop_height = crop_height_percent * faceCanvasElement.height;

    faceCanvasCtx.save();

    clear_canvas();
    n_landmarks = [];
    landmarks_x_cropped = [];
    landmarks_y_cropped = [];

    // draw landmarks on face
    for (const landmarks of results.faceLandmarks) {

        landmarks.forEach((landmark, i) => {

            if (i == 10 || i == 338 || i == 297 || i == 332 || i == 284 || i == 251 || i == 389 || i == 356 || i == 454 || i == 366 || i == 323 || i == 401 || i == 361 || i == 435 || i == 288 || i == 397 || i == 365 || i == 379 || i == 378 || i == 400 || i == 377 || i == 152 || i == 148 || i == 176 || i == 149 || i == 150 || i == 136 || i == 172 || i == 58 || i == 132 || i == 93 || i == 234 || i == 127 || i == 162 || i == 21 || i == 54 || i == 103 || i == 67 || i == 109) {

                let landmark_x_percent = landmark.x;
                let landmark_y_percent = landmark.y;
                let landmark_x =
                    landmark_x_percent * faceCanvasElement.width;
                let landmark_y =
                    landmark_y_percent * faceCanvasElement.height;

                //this code scales up the landmark positions from their original x,y to the new zoomed-in scale
                let landmark_x_cropped1 =
                    ((landmark_x - crop_x) / crop_width ) *
                    faceCanvasElement.width/3;
                let landmark_y_cropped1 =
                    ((landmark_y - crop_y) / crop_height) *
                    faceCanvasElement.height/3;

                const scaleFactor = 1.5; // Adjust as needed

                let landmark_x_cropped2 =
                    ((landmark_x - crop_x) / crop_width ) *
                    faceCanvasElement.width/2;
                let landmark_y_cropped2 =
                    ((landmark_y - crop_y) / crop_height) *
                    faceCanvasElement.height/2;

                    const scaledX2 = landmark_x_cropped2 + (landmark_x_cropped2 - landmark_x_cropped1) * scaleFactor;
const scaledY2 = landmark_y_cropped2 + (landmark_y_cropped2 - landmark_y_cropped1) * scaleFactor;


                faceCanvasCtx.font = "10px Quorum";
                faceCanvasCtx.fillStyle = "white";
            
                    faceCanvasCtx.fillText(
                        "offer", landmark_x_cropped1, landmark_y_cropped1
                    );
                    
                    faceCanvasCtx.fillText(
                        "offer", scaledX2 + getRandomNumber(0,20), scaledY2 + getRandomNumber(0,20)
                    );
                }
            })}


    if (stage1) {
        if (stage1Launched == false) {
            instruction.innerText = "First, come closer.";
            button.innerText = "";
            userFace.classList.replace("hidden", "fadeIn");
            stage1Launched = true;
        }
        
        setFace(
            face_bottom_y,
            face_top_y
        );

    }
    else if (stage2) {
        if (stage2Launched == false) {
            userFace.classList.replace("fadeIn", "hidden");
            userEyes.classList.replace("hidden", "fadeIn");

            instruction.innerText = "Now, offer your sight.";
            button.innerText = "(Blink six times.)";
            stage2Launched = true;
        }

        matchEyeHeight(
            face_bottom_y,
            face_top_y,
            right_eye_bottom_y,
            right_eye_top_y,
            'right', 
            ".userEye.right"
        )

        matchEyeHeight(
            face_bottom_y,
            face_top_y,
            left_eye_bottom_y,
            left_eye_top_y,
            'left',
            ".userEye.left"
        );


        // const points = `${results.faceLandmarks[0][33].x* 500},${results.faceLandmarks[0][33].y* 500} ${results.faceLandmarks[0][159].x* 500},${results.faceLandmarks[0][159].y* 500} ${results.faceLandmarks[0][133].x* 500},${results.faceLandmarks[0][133].y* 500} ${results.faceLandmarks[0][145].x* 500},${results.faceLandmarks[0][145].y* 500}`;
        // stage1LeftEye.setAttribute("points", points);
    }
    else if (stage3) {
        userEyes.classList.add("hidden");
        instruction.innerText = "Now, offer your voice.";
        button.innerText = "(Tell me your name.)";
        detectVoice();
        stage3 = false;
    }
    else if (stage4) {
        instruction.innerText = "Your have shown your devotion. Now, you may enter.";
        userEyes.classList.add("hidden");
        main.classList.remove("hidden");

        matchEyeHeight(
            face_bottom_y,
            face_top_y,
            right_eye_bottom_y,
            right_eye_top_y,
            'right', 
            ".BGeye.right"
        );

        matchEyeHeight(
            face_bottom_y,
            face_top_y,
            left_eye_bottom_y,
            left_eye_top_y,
            'left',
            ".BGeye.left"
        );
            
        } 
        

    }
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

//GENERAL FUNCTIONS
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function map(in_val, in_min, in_max, out_min, out_max) {
    return Math.floor(
        ((in_val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
}

function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
}

function clear_canvas() {
    faceCanvasCtx.clearRect(
        0,
        0,
        faceCanvasElement.width,
        faceCanvasElement.height
    );
}


//STAGE 1 FUNCTIONS
function setFace(
    face_bottom_y,
    face_top_y
) {
    let faceHeight = (face_bottom_y -
        face_top_y) * 100;
        console.log(faceHeight)

    if (faceHeight <= 10) {
        faceHeight = 0;
    } else if (faceHeight >= 60) {
        faceHeight = 100;
    }
    else {
        faceHeight = Math.abs(
            map(faceHeight, 10, 60, 0, 100)
        );
    }
    
    faceHeight = Math.floor(faceHeight);
    userFace.style.height = `${faceHeight}%`;
    userFace.style.width = `${faceHeight * .75}%`;

    if (face_bottom_y > 1) {
        stage1 = false;
        stage2 = true;
    }

}

//STAGE 3 FUNCTIONS // SPEECH
function detectVoice() {
    if ("webkitSpeechRecognition" in window) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = function (event) {
            var interimTranscript = "";
            var finalTranscript = "";

            for (var i = event.resultIndex; i < event.results.length; i++) {
                var transcript = event.results[i][0].transcript;
                transcript.replace("\n", "<br>");

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    wordCount = interimTranscript.split(" ").length;

                } else {
                    interimTranscript += transcript;
                    wordCount = interimTranscript.split(" ").length;
                }
            }

            const speech =
                finalTranscript + interimTranscript;

            const normalizedSpeech = speech.toLowerCase().trim();
            const normalizedTarget = "my name is";
            // console.log("speech:" + normalizedSpeech);

            if (normalizedSpeech.startsWith(normalizedTarget)) {
                console.log("my name is")
                stage4 = true;
                recognition.stop();
            }
        };

        //speech recognition automatically turns off after some silence, so restarting it on end for continuous listening
        recognition.addEventListener("end", () => {
            // console.log("Speech recognition ended. Restarting...");
            recognition.start();
        });
    } else {
    }
}


//EYE FUNCTIONS
function generateEyes() {
    const numDivs = 30;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < numDivs; i++) {

        const leftEyeDiv = document.createElement("div");
        leftEyeDiv.classList.add("BGeye", "left");

        const rightEyeDiv = document.createElement("div");
        rightEyeDiv.classList.add("BGeye", "right");

        const eyesContainer = document.createElement("div");
        eyesContainer.classList.add("BGeyes", "eyes");

        eyesContainer.style.top = getRandomNumber(0, viewportHeight - 50) + 'px';
        eyesContainer.style.left = getRandomNumber(0, viewportWidth - 50) + 'px';

        eyesContainer.appendChild(leftEyeDiv);
        eyesContainer.appendChild(rightEyeDiv);
        main.appendChild(eyesContainer);
    }

}

function matchEyeHeight(
    face_bottom_y,
    face_top_y,
    eye_bottom_y,
    eye_top_y,
    whichSide,
    selector
) {
    let eye_face_ratio =
        ((eye_bottom_y - eye_top_y) / (face_bottom_y - face_top_y)) * 10000;
        // console.log("eye_face_ratio", eye_face_ratio)

    if (eye_face_ratio <= eyesClosedRatio) {
        eyeHeight = 0;
        //checking if eyes are closed
        if (whichSide === "left") {
            left_closed = true;
        }
        if (whichSide === "right") {
            right_closed = true;
        }
        //Switch eyes when blinked enough times
        if (left_closed && right_closed && been_open) {
            been_open = false;
            eyesClosed++;
            console.log(eyesClosed);
            //!! Change this number to 6 later !!
            if (stage2 && eyesClosed >= 1) {
                eyesClosed = 0;
                stage2 = false;
                stage3 = true;
                console.log("blinked 6 times")
            }
            if (stage4 && eyesClosed > getRandomNumber(1,4))
            {
                randomEyes();
                eyesClosed = 0;
            }
        }
    } else {
        //eyes are open
        if (whichSide === "left") {
            left_closed = false;
        }
        if (whichSide === "right") {
            right_closed = false;
        }
        if (!left_closed && !right_closed) {
            been_open = true;
        }

        if (eye_face_ratio >= eyesOpenRatio) {
            eyeHeight = eyeHeight_max;
        } else if (eye_face_ratio > eyesClosedRatio && eye_face_ratio < eyesOpenRatio) {
            eyeHeight = Math.abs(
                map(eye_face_ratio, eyesClosedRatio, eyesOpenRatio, 0, eyeHeight_max)
            );
        }
    }
    
    const eye_is_left = whichSide === 'left';
    if (eye_is_left) {
        setEyeHeight(selector, eyeHeight);
    } else {
        setEyeHeight(selector, eyeHeight);
    }
}

//randomly choose two pairs of eyes to match user eyes
function randomEyes() {
    const eyeContainers = document.querySelectorAll(".eyes");
    eyeContainers.forEach((eyeContainer) => {
        eyeContainer.classList.add("hidden");
    });
    let randomIndex1 = getRandomIndex(eyeContainers.length);
    let randomIndex2;
    do {
        randomIndex2 = getRandomIndex(eyeContainers.length);
    } while (randomIndex2 === randomIndex1);

    eyeContainers[randomIndex1].classList.replace("hidden", "visible");
    eyeContainers[randomIndex2].classList.replace("hidden", "visible");
}


function setEyeHeight(selector, eyeHeight) {
    let th = Math.floor(eyeHeight);
    const visibleEyeContainers = document.querySelectorAll(".eyes.visible");
    visibleEyeContainers.forEach((visibleEyeContainer) => {
        if (visibleEyeContainer.querySelector(selector)) {
            visibleEyeContainer.querySelector(selector).style.height = `${th}%`;}
        }
    );

}

(function init() {
    generateEyes();
    randomEyes();
})();