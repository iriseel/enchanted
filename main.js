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

// Declare other variables
const body = document.querySelector("body");
const invitation = document.querySelector(".invitation");
const instruction = document.querySelector(".instruction");
const button = document.querySelector(".button");
const bg = document.querySelector(".bg");
let fadeInOutTime = 2000;
let animationDelay = 0;

let broodAudio = new Audio('assets/audio/cicadas/broodX.wav');
broodAudio.loop = true;
let cicadaAudio = new Audio('assets/audio/cicadas/cicada_close.wav');
cicadaAudio.loop = true;
let chimeAudios = [
    new Audio('assets/audio/chimes/chime1.mp3'),
    new Audio('assets/audio/chimes/chime2.mp3'),
    new Audio('assets/audio/chimes/chime3.mp3'),
    new Audio('assets/audio/chimes/chime4.mp3'),
    // new Audio('assets/audio/chimes/chime5.mp3'),
    // new Audio('assets/audio/chimes/chime6.mp3')
];

let gongAudio = new Audio('assets/audio/gong.wav');

const ghostImageUrls = [
    "assets/imgs/main/spirit_photo4.jpeg", 
    "assets/imgs/main/anti-vampire_burial.png",  
    "assets/imgs/main/death_mask.png",  
    "assets/imgs/main/dragonfly_moult.jpeg",  
    "assets/imgs/main/ectoplasm1.jpeg",  
    "assets/imgs/main/ectoplasm2.jpeg",  
    "assets/imgs/main/ectoplasm3.jpeg",  
    "assets/imgs/main/leaking_box.png",  
    "assets/imgs/main/levitating_box.png",  
    "assets/imgs/main/Lo_Shu_Square.jpeg",  
    "assets/imgs/main/magic_circle.jpeg",  
    "assets/imgs/main/mocap_box_leaking.png",  
    "assets/imgs/main/moths_from_box.png",  
    "assets/imgs/main/Munich_Manual1.png",  
    "assets/imgs/main/Munich_Manual2.png",  
    "assets/imgs/main/Peppers_Ghost.jpeg", 
    "assets/imgs/main/Solomonic_circle.jpeg", 
    "assets/imgs/main/spirit_photo1.jpeg", 
    "assets/imgs/main/spirit_photo2.jpeg", 
    "assets/imgs/main/spirit_photo3.jpeg", 
    "assets/imgs/main/GNT1-JX01-_2024-04-12T10_22_26.gif",
]

//STAGE 1 // COME CLOSER
let stage1 = false;
let stage1Closer = false;
let stage1EvenCloser = false;
const userFace = document.querySelector(".userFace");


//STAGE 2 // BLINK
let stage2 = false;
const userEyesContainer = document.querySelector(".userEyes");
const userEyes = document.querySelectorAll(".userEye");

const faceCanvasElement = document.getElementsByClassName("face_canvas")[0];
const faceCanvasElements = document.querySelectorAll(".face_canvas");

const landmarkTexts = ["I", "peer", "through", "your", "eyes"];
let landmarkTextIndex = 0;
let landmarkSkipThreshold = 0.9;
let faceCanvasOpacity = .1;

// let userEyesBlur = 20;
// const stage1LeftEye = document.querySelector("svg polygon");

//STAGE 3 // SPEAK
let stage3 = false;

//STAGE 4
let stage4 = false;
const main = document.querySelector(".main");
let eyeHeight;
let eyeHeight_max = 100;
let left_closed = false;
let right_closed = false;
let been_open = true;
let eyesClosed = 0;
const eyesClosedRatio = 620;
const eyesOpenRatio = 680;
let eyeContainers;

const ghostImagefeDisplacementMap = document.querySelector('#displacementFilter feDisplacementMap');

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
    function clickedButton() {
        stage1Start();
        broodAudio.play();
        cicadaAudio.play();

        button.removeEventListener("click", clickedButton);
    };

    button.addEventListener("click", clickedButton);


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



//COME CLOSER
function stage1Start() { 
    stage1 = true;

    changeInstructionText("First, come closer.");
    bg.classList.add("hidden");
    userFace.classList.replace("hidden", "fadeIn");
    button.classList.add("hidden");
    button.removeEventListener("mouseover", buttonHover);
    button.style.cursor = "default";
    button.style.animation = "none";
        
    setTimeout(() => {
        enableCam();
    }, animationDelay / 2);
}

//BLINK
function stage2Start() {
    webcamRunning = false;
    stage1 = false;
    stage2 = true;
    changeInstructionText("Almost close enough to touch.");
    button.style.border = "none";

    setTimeout(() => {
        userFace.classList.replace("fadeIn", "hidden");
        userEyesContainer.classList.replace("hidden", "fadeIn");

        changeInstructionText("Now, offer your sight.");
        setTimeout(() => { 
            button.classList.replace("hidden", "fadeIn");
            button.style.animation = "glow 5s ease-in-out infinite";
            button.innerText = "(Blink six times.)";
            enableCam();
        }, animationDelay / 2);

    }, animationDelay + 800);
}

//SAY YOUR NAME
function stage3Start() {
    stage2 = false;
    stage3 = true;
    webcamRunning = false;
    userEyesContainer.classList.replace("fadeIn", "hidden");

    button.innerText = "";
    changeInstructionText("Then, your voice.");
    setTimeout(() => { 
        button.innerHTML = "(Tell me your name.<br>Start with, 'My name is...')";
    }, animationDelay + 400);
    detectVoice();
}

//MAIN
function stage4Start() {
    stage3 = false;
    stage4 = true;
    webcamRunning = false;

    userEyesContainer.style.display = "none";
    userFace.style.display = "none"; 

    changeInstructionText("You have shown your devotion. Now, you may enter.");
    gongAudio.play();
    button.style.display = "none";
    generateEyes();

    eyeContainers = document.querySelectorAll(".eyes.BGEyes");
    eyeContainers.forEach((eyeContainer) => {
        eyeContainer.classList.add("hidden");
    });

    randomEyes();

    setTimeout(() => {
        instruction.classList.add("hidden");
        button.classList.add("hidden");
    }, animationDelay + 400);

    main.classList.replace("hidden", "fadeIn");

    enableCam();
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

    // FACE LANDMARKS
    faceCanvasElements.forEach((faceCanvasElement) => {
        const faceCanvasCtx = faceCanvasElement.getContext("2d");
        faceCanvasCtx.save();
        clear_canvas(faceCanvasCtx);
    });

    // find landmarks on face
    for (const landmarks of results.faceLandmarks) {

        let landmarksSkipped = 0;
        landmarks.forEach((landmark, i) => {
            const randomValue = Math.random();

            // Skipping fewer and fewer landmarks each blink
            if (randomValue < landmarkSkipThreshold && landmarksSkipped < landmarks.length) {
                // Skip this landmark
                landmarksSkipped++;
                return; // Skip to the next iteration of the loop
            }

            let landmark_x_percent = landmark.x;
            let landmark_y_percent = landmark.y;
            let landmark_x =
                landmark_x_percent * faceCanvasElement.width;
            let landmark_y =
                landmark_y_percent * faceCanvasElement.height;

            faceCanvasElements.forEach((faceCanvasElement) => {
                const faceCanvasCtx = faceCanvasElement.getContext("2d");
                faceCanvasCtx.font = "6px Ortica";
                faceCanvasCtx.fillStyle = "white";
                faceCanvasCtx.fillText(
                    // landmarkTexts[landmarkTextIndex], landmark_x + getRandomNumber(0,1), landmark_y + getRandomNumber(0,1)
                    "you", landmark_x + getRandomNumber(0,1), landmark_y + getRandomNumber(0,1)

                );
            });

            
        })
    }

    if (stage1) {
        setFace(
            face_bottom_y,
            face_top_y
        );
    }
    else if (stage2) {
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
    else if (stage4) {
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


function clear_canvas(faceCanvasCtx) {
    faceCanvasCtx.clearRect(
        0,
        0,
        faceCanvasElement.width,
        faceCanvasElement.height
    );
}


function buttonHover() {
    button.style.cursor = "n-resize";
    button.style.transform = "scale(1.05)";

    button.addEventListener("mouseout", () => {
        button.style.transform = "scale(1)";
    });
}

function instructionTransition() {
    instruction.classList.add('fadeInOut');

    setTimeout(() => { 
        instruction.classList.remove('fadeInOut');
    }, fadeInOutTime);
}

function animateLetters() {
    animationDelay = 0;
    const invitationElements = document.querySelectorAll('.instruction');

    wrapLettersWithSpan(invitationElements);
    
    document.querySelectorAll('.animated-letter').forEach((letter, i) => {
        letter.style.animationDelay = `${animationDelay}ms`; 
        animationDelay+=400;
    });

    // !! activate this later
    button.style.animationDelay = `${animationDelay+400}ms`;
}

function wrapLettersWithSpan(textsToSpan) {
    textsToSpan.forEach(textToSpan => {
        // Get the text content of the element
        const text = textToSpan.textContent.trim();
    
        const words = text.split(" ");
        const spannedWords = words.map(word => {
            // Split each word into letters
            const letters = word.split("");
            // Wrap each letter in a span
            const spannedLetters = letters.map(letter => `<span class="animated-letter">${letter}</span>`).join("");
            // Wrap the word in a span
            return `<span class="animated-word">${spannedLetters}</span>`;
        }).join(" ");

        textToSpan.innerHTML = spannedWords;
    });
}

function changeInstructionText(text) {
    instruction.innerText = text;
    animateLetters();
}


//STAGE 1 FUNCTIONS
function setFace(
    face_bottom_y,
    face_top_y
) {
    let faceHeight = (face_bottom_y -
        face_top_y) * 100;
    let circleHeight;
    // console.log(faceHeight);

    if (faceHeight <= 30) {
        circleHeight = 0;
    } else if (faceHeight >= 70) {
        circleHeight = 100;
    }
    else {
        circleHeight = Math.abs(
            map(faceHeight, 30, 70, 0, 100)
        );
    }

    if (faceHeight > 45 && faceHeight < 55) {
        if (!stage1Closer) {
            // changeInstructionText("Closer.");
            instruction.innerText = "Closer.";
            stage1Closer = true;
        }
    }
    if (faceHeight >=55 && faceHeight < 70) {
        if (!stage1EvenCloser) {
            // changeInstructionText("Even closer.")
            instruction.innerText = "Even closer.";
            stage1EvenCloser = true;
        }
    }
    
    userFace.style.height = `${Math.floor(circleHeight)}%`;
    userFace.style.width = `${Math.floor(circleHeight) * .60}%`;

    if (circleHeight >= 100) {
        stage2Start();
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

                } else {
                    interimTranscript += transcript;
                }
            }

            const speech =
                finalTranscript + interimTranscript;

            const normalizedSpeech = speech.toLowerCase().trim();
            const words = normalizedSpeech.trim().split(/\s+/);
            const normalizedTarget = "my name is";
            // console.log("speech:" + normalizedSpeech);

            // const targetCount = words.reduce((count, word) => {
            //     if (word === normalizedTarget) {
            //         return count + 1;
            //     }
            //     return count;
            // }, 0);

            // if (targetCount >= 3) {
            if (normalizedSpeech.startsWith(normalizedTarget)) {
            // if (normalizedSpeech.trim() !== "") {
            // if (words.length >= 2) {
                console.log("anything")
                setTimeout(() => {
                    stage4Start();
                    recognition.stop();
                }, 800);
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
    const numDivs = ghostImageUrls.length;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < numDivs; i++) {

        const leftEyeDiv = document.createElement("div");
        leftEyeDiv.classList.add("BGeye", "left");

        const rightEyeDiv = document.createElement("div");
        rightEyeDiv.classList.add("BGeye", "right");

        const ghostImage = document.createElement("div");
        ghostImage.classList.add("ghostImage");
        ghostImage.style.background = `url(${ghostImageUrls[i]}) no-repeat center / cover`;

        const eyesContainer = document.createElement("div");
        eyesContainer.classList.add("BGeyes", "eyes");

        eyesContainer.style.top = getRandomNumber(0, viewportHeight - 50) + 'px';
        eyesContainer.style.left = getRandomNumber(0, viewportWidth - 50) + 'px';

        eyesContainer.appendChild(leftEyeDiv);
        eyesContainer.appendChild(rightEyeDiv);
        eyesContainer.appendChild(ghostImage);
        main.appendChild(eyesContainer);

        eyesContainer.addEventListener("click", () => {
            const newScaleValue = 0;
            ghostImagefeDisplacementMap.setAttribute('scale', newScaleValue.toString());
        });

        eyesContainer.addEventListener("mouseout", () => {
            const OGScaleValue = 100;
            ghostImagefeDisplacementMap.setAttribute('scale', OGScaleValue.toString());
        });
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
            console.log(eyesClosed);
            if (stage2) {
                // landmarkTextIndex++;
                landmarkSkipThreshold -= .1;
                faceCanvasOpacity += (1-0.1)/5;
                chimeAudios[eyesClosed % chimeAudios.length].play();

                const boxShadowValues = [
                    '0 0 0 5px yellow',
                    '0 0 0 10px blue',
                    '0 0 0 15px red',
                    '0 0 0 25px yellow',
                    '0 0 0 35px blue',
                    '0 0 0 45px red',
                    '0 0 0 55px yellow',
                    '0 0 0 65px blue',
                    '0 0 0 75px red',
                    '0 0 0 85px blue',
                    '0 0 0 95px red',
                    '0 0 0 105px yellow',
                    '0 0 0 115px blue',
                    '0 0 0 125px red',
                    '0 0 0 135px yellow',
                    '0 0 0 145px blue',
                    '0 0 0 155px red'
                ];
                const boxShadow = boxShadowValues.join(', ');

                userEyes.forEach((userEye) => userEye.style.boxShadow = boxShadow);
                faceCanvasElements.forEach((faceCanvasElement) => {
                    faceCanvasElement.style.opacity = faceCanvasOpacity;
                });

                // !! Change this to 6 later!!
                if (eyesClosed >= 5) {
                    eyesClosed = 0;
                    stage3Start();
                    console.log("blinked 6 times")
                }
            }
                eyesClosed++;
            if (stage4 && eyesClosed > getRandomNumber(1,4))
            {
                // console.log(getRandomNumber(1,4) + "new set of bg eyes")
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
            const boxShadowValues = [
                '0 0 0 5px yellow',
                '0 0 0 10px blue',
                '0 0 0 15px red'
            ];
            const boxShadow = boxShadowValues.join(', ');
            
            userEyes.forEach((userEye) => userEye.style.boxShadow = boxShadow);
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
    eyeContainers.forEach((eyeContainer) => {
            eyeContainer.classList.replace("visible", "hidden");
    });
    let randomIndex1 = getRandomIndex(eyeContainers.length);
    let randomIndex2;
    do {
        randomIndex2 = getRandomIndex(eyeContainers.length);
    } while (randomIndex2 === randomIndex1);

    eyeContainers[randomIndex1].classList.replace("hidden", "visible");
    eyeContainers[randomIndex2].classList.replace("hidden", "visible");

    console.log(eyeContainers[randomIndex1].style.bg, eyeContainers[randomIndex2].style.bg);
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
    window.addEventListener("DOMContentLoaded", animateLetters);
    button.addEventListener("mouseover", buttonHover);
})();