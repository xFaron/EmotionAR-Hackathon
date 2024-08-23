//DOM Elements
const vidfeed = document.getElementById("vidfeed");
const canvas = document.getElementById("vidoverlay");
const camBtn = document.getElementById("camswitch");
const emotionFeed = document.getElementById("emotionfeed");
const ctx = canvas.getContext('2d');

// Other constants
const camBtnOffColor = 'red';
const camBtnOnColor = 'green';

//Filter images
//Sunglass
const sunglassImg = new Image();
sunglassImg.src = "./assets/ThugGlasses.png";
const sunglass_data = {
	width: sunglassImg.width,
	height: sunglassImg.height,
	leftEye : {x : 9, y : 3}, //left glass eye coord
	rightEye : {x : 17, y : 3} //right glass eye coord
};

//Emotion emojis
let emotion = {
	surprised: "😲",
	happy: "😁",
	sad: "😔",
	disgusted: "🤢",
	neutral: "😐",
	angry: "😠",
	fearful : "😨"
};
let last_emotion;

//Video stream variables
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

// To turn off web cam
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
		console.log(emotion[top_emotion]);

		//Changing feed based on emotion
		if (last_emotion != top_emotion){
			last_emotion = top_emotion;
			emotionFeed.innerHTML = emotion[top_emotion];
		}

		// Finding left eye coords
		let data = face.landmarks.getLeftEye();
		let leftEye = {x:0, y:0};
		data.forEach((point) => {
			leftEye.x += point.x;
			leftEye.y += point.y;
		})
		leftEye.x /= 6;
		leftEye.y /= 6;

		// Finding right eye coords
		data = face.landmarks.getRightEye();
		let rightEye = {x:0, y:0};
		data.forEach((point) => {
			rightEye.x += point.x;
			rightEye.y += point.y;
		})
		rightEye.x /= 6;
		rightEye.y /= 6;

		// Drawing filter
		ctx.clearRect(0, 0, vidSize.width, vidSize.height);
		if (last_emotion == "happy"){
			ctx.beginPath();
			if (sunglassImg.complete){
				let calc = calcImgLocn(sunglass_data, leftEye, rightEye);
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(sunglassImg, calc.x, calc.y, calc.width, calc.height);
			}
			ctx.closePath();
		}

		// //Bounding box info
		// let x = face.detection._box._x;
		// let y = face.detection._box._y;
		// let width = face.detection._box._width;
		// let height = face.detection._box._height;

		// //Drawing bounding box

		// ctx.strokeStyle = "Blue"
		// ctx.strokeRect(x, y, width, height);
	})
}

//Sunglass type image locn finder
function calcImgLocn(img_data, leftEye, rightEye) {

	let req_vals = { x: 0, y: 0, width: 0, height: 0};

	let dist_btw_eyes_img = Math.abs(img_data.leftEye.x - img_data.rightEye.x);
	let dist_btw_eyes_actual = Math.abs(leftEye.x - rightEye.x);

	let k = (dist_btw_eyes_actual/dist_btw_eyes_img);

	req_vals.x = leftEye.x - (img_data.leftEye.x * k);
	req_vals.y = leftEye.y - (img_data.leftEye.y * k);
	req_vals.width = img_data.width * k;
	req_vals.height = img_data.height * k;

	return req_vals;
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
loop();