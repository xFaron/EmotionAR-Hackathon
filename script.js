//DOM Elements
const vidfeed = document.getElementById("vidfeed");
const canvas = document.getElementById("vidoverlay");
const camBtn = document.getElementById("camswitch");
const ctx = canvas.getContext('2d');

//Filter images
const sunglassImg = new Image();
sunglassImg.src = "https://w7.pngwing.com/pngs/34/292/png-transparent-sunglasses-thug-life-cool-miscellaneous-angle-white.png";


const camBtnOffColor = 'red';
const camBtnOnColor = 'green';

let vidSize = {
	width: vidfeed.clientWidth,
	height: vidfeed.clientHeight
};
let camOn = false;
let streamVal;

// To Stream webcam
function startCam() {
	navigator.mediaDevices.getUserMedia({ video: true })
		.then((stream) => {
			streamVal = stream
			camOn = true;
			vidfeed.srcObject = stream; // This part sends the MediaStream to video
			vidfeed.addEventListener("playing", () => {
				resizeCanvas()
			})
			camBtn.style["background-color"] = camBtnOnColor;
		})
		.catch((err) => {
			console.log("Error: ", err); // To Handle vid error [TODO]
		});
}


function stopCam() {
	if (streamVal){
		let tracks = streamVal.getTracks();
		tracks.forEach((track) => {track.stop()})
		camOn = false;
		camBtn.style["background-color"] = camBtnOffColor;
	}
}

// Loads the models
async function loadModels() {
	try {
		console.log("Loading models");
		await faceapi.loadTinyFaceDetectorModel('./models');
		await faceapi.loadFaceLandmarkModel('./models')
		await faceapi.loadFaceExpressionModel('./models');
		console.log("Models loaded succefully!");
		detectFaces()
	} catch (err) {
		console.log("Error: ", err);
	}
}

// Detects the faces by inputting the vid stream, and draws boxes
async function detectFaces() {
	console.log("Detecting face");
	const detections = await faceapi.detectAllFaces(vidfeed, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions(); // Detect facce with TinyModel
	console.log("Detected");
	const detectionsResized  = faceapi.resizeResults(detections, vidSize); // Resizes results for provided canvas (precaution)
	
	detectionsResized.forEach((face) => {
		console.log(face);

		//Reading emotion
		let top_emotion, top_emotion_val = 0; 
		Object.keys(face.expressions).forEach(emotion => {
			if (top_emotion_val < face.expressions[emotion]){
				top_emotion = emotion;
				top_emotion_val = face.expressions[emotion];
			}
		})
		console.log(top_emotion);

		//Drawing bounding box
		let x = face.detection._box._x;
		let y = face.detection._box._y;
		let width = face.detection._box._width;
		let height = face.detection._box._height;
		ctx.strokeStyle = "Blue"
		ctx.strokeRect(x, y, width, height);
	})
}


function resizeCanvas() {
	vidSize = {
		width: vidfeed.clientWidth,
		height: vidfeed.clientHeight
	};
	canvas.style.width = `${vidSize.width}px`;
	canvas.style.height = `${vidSize.height}px`;
	canvas.width = vidSize.width;
	canvas.height = vidSize.height;
}


function loop() {
	if (camOn) {
		detectFaces();
		ctx.clearRect(0, 0, vidSize.width, vidSize.height);
	}

	requestAnimationFrame(loop);
}


window.addEventListener('resize', () => {
	// When the window resizes, the canvas also has to be resized
	resizeCanvas();
})

camBtn.addEventListener('click', () => {
	if (camOn){
		stopCam();
	} else {
		startCam();
	}
})

startCam();
loadModels();

ctx.fillStyle = 'green';
ctx.strokeStyle = 'green';
ctx.lineWidth = 5;

