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

let stage1 = true;
//STAGE 1 // COME CLOSER
const userFace = document.querySelector(".userFace");


let stage2 = false;
//STAGE 2 // BLINK
const userEyes = document.querySelector(".userEyes");
// const stage1LeftEye = document.querySelector("svg polygon");

let stage3 = false;
//STAGE 3 // SPEAK
let wordCount;

let stage4 = false;
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

let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks[0]) {
    //Using this right_eye_face_ratio to return the ratio as a percentage (percentage of face that eye takes up) rather than absolute values, and therefore right_eye_face_ratio won't change with the user's distance from the webcam
    let face_bottom_y = results.faceLandmarks[0][152].y;
    let face_top_y = results.faceLandmarks[0][10].y;

    // RIGHT EYE ////////////////////////////////
    let right_eye_bottom_y = results.faceLandmarks[0][472].y;
    let right_eye_top_y = results.faceLandmarks[0][470].y;

    // LEFT EYE ////////////////////////////////
    let left_eye_bottom_y = results.faceLandmarks[0][477].y;
    let left_eye_top_y = results.faceLandmarks[0][475].y;

    if (stage1) {
        instruction.innerText = "First, come closer.";
        button.innerText = "";
        userFace.classList.remove("hidden");
        
        setFace(
            face_bottom_y
        );

        if (face_bottom_y > 1) {
            stage1 = false;
            stage2 = true;
        }
    }
    else if (stage2) {
        userFace.classList.add("hidden");
        userEyes.classList.remove("hidden");
        instruction.innerText = "Now, offer your sight.";
        button.innerText = "(Blink six times.)";

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
    if (stage3) {
        userEyes.classList.add("hidden");
        instruction.innerText = "Now, offer your voice.";
        button.innerText = "(Tell me your name.)";
        detectVoice();
        stage3 = false;
    }
    else if (stage4) {
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

//STAGE 1 FUNCTIONS
function setFace(
    face_bottom_y
) {
    let faceHeight =
        face_bottom_y * 100;
        // console.log(faceHeight)

    if (faceHeight <= 50) {
        faceHeight = 0;
    } else if (faceHeight >= 100) {
        faceHeight = 100;
    }
    else {
        faceHeight = Math.abs(
            map(faceHeight, 50, 100, 0, 100)
        );
    }
    
    faceHeight = Math.floor(faceHeight);
    userFace.style.height = `${faceHeight}%`;
    userFace.style.width = `${faceHeight * .75}%`;

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
        leftEyeDiv.classList.add("eye", "left");

        const rightEyeDiv = document.createElement("div");
        rightEyeDiv.classList.add("eye", "right");

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
            if (stage2 && eyesClosed >= 6) {
                eyesClosed = 0;
                stage3 = true;
                console.log("blinked 6 times")
            }
            if (eyesClosed > getRandomNumber(1,4))
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
        visibleEyeContainer.querySelector(selector).style.height = `${th}%`;}
    );

}

(function init() {
    // generateEyes();
    // randomEyes();
})();