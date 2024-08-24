//DOM Elements
const vidfeed = document.getElementById("vidfeed");
const canvas = document.getElementById("vidoverlay");
const camBtn = document.getElementsByClassName("cam")[0];
const cosmeticBtn = document.getElementsByClassName("cosmetic")[0];
const emotionFeed = document.getElementById("emotionfeed");
const ctx = canvas.getContext('2d');

// Other constants
const camBtnOffColor = 'red';
const camBtnOnColor = 'rgb(64, 64, 64)';

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
//Heart Eyes
const heartEyesImg = new Image();
heartEyesImg.src = "./assets/HeartEyes.png";
const heartEyes_data = {
	width: heartEyesImg.width,
	height: heartEyesImg.height,
	leftEye : {x : 5, y : 3}, //left glass eye coord
	rightEye : {x : 12, y : 3} //right glass eye coord
};
//Eyes
const EyesImg = new Image();
EyesImg.src = "./assets/Eyes.png";
const Eyes_data = {
	width: EyesImg.width,
	height: EyesImg.height,
	leftEye : {x : 8, y : 6}, //left glass eye coord
	rightEye : {x : 16, y : 6} //right glass eye coord
};
//NerdGlasses
const nerdGlassesImg = new Image();
nerdGlassesImg.src = "./assets/NerdGlasses.png";
const nerdGlasses_data = {
	width: nerdGlassesImg.width,
	height: nerdGlassesImg.height,
	leftEye : {x : 7, y : 6}, //left glass eye coord
	rightEye : {x : 17, y : 6} //right glass eye coord
};
//NerdGlasses2
const nerdGlasses2Img = new Image();
nerdGlasses2Img.src = "./assets/NerdGlasses2.png";
const nerdGlasses2_data = {
	width: nerdGlasses2Img.width,
	height: nerdGlasses2Img.height,
	leftEye : {x : 8, y : 6}, //left glass eye coord
	rightEye : {x : 16, y : 6} //right glass eye coord
};
//NerdStache
const nerdStacheImg = new Image();
nerdStacheImg.src = "./assets/NerdStache.png";
const nerdStache_data = {
	width: nerdStacheImg.width,
	height: nerdStacheImg.height,
	mouthWidth: 7,
	center: {x : 14, y : 3}
};

let cosmetics = [
	{type: [], img: [], data: [], emoji: "🚫"},
	{type: ['eye'], img: [sunglassImg], data: [sunglass_data], emoji: "😎"},
	{type: ['eye'], img: [heartEyesImg], data: [heartEyes_data], emoji: "😍"},
	{type: ['eye'], img: [EyesImg], data: [Eyes_data], emoji: "👀"},
	{type: ['eye', 'stache'], img: [nerdGlassesImg, nerdStacheImg], data: [nerdGlasses_data, nerdStache_data], emoji: "🥸"}
];
let currentCosmeticNo = 0;

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
	} catch (err) {
		console.log("Error: ", err);
	}
}

// Detects the faces by inputting the vid stream, and draws boxes
async function detectFaces() {
	const detections = await faceapi.detectAllFaces(vidfeed, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions(); // Detect facce with TinyModel
	const detectionsResized  = faceapi.resizeResults(detections, vidSize); // Resizes results for provided canvas (precaution)
	
	detectionsResized.forEach((face) => {

		//Reading emotion
		let top_emotion, top_emotion_val = 0; 
		ctx.clearRect(0, 0, vidSize.width, vidSize.height);
		Object.keys(face.expressions).forEach(emotion => {
			if (top_emotion_val < face.expressions[emotion]){
				top_emotion = emotion;
				top_emotion_val = face.expressions[emotion];
			}
		})

		//Changing feed based on emotion
		if (last_emotion != top_emotion){
			last_emotion = top_emotion;
			emotionFeed.innerHTML = emotion[top_emotion];
		}

		ctx.beginPath();

		//Selecting cosmetics
		let wearable = cosmetics[currentCosmeticNo];

		let loaded = true;
		wearable.img.forEach((img) => {
			loaded = loaded && img.complete
		})

		if (loaded){
			wearable.type.forEach((type, index) => {
				if (type == 'eye'){

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

					let calc = calcEyeImgLocn(wearable.data[index], leftEye, rightEye);
					ctx.imageSmoothingEnabled = false;
					ctx.drawImage(wearable.img[index], calc.x, calc.y, calc.width, calc.height);

				} else if (type == 'stache'){

					// Finding top and central point on mouth
					data = face.landmarks.getMouth();
					let mouthTopPoint = {x:0, y:0}, mouthWidth;
					let sumX = 0, maxY = null, maxX = null, minX = null;
					data.forEach((point) => {
						if (maxY == null || maxY > point.y){
							maxY = point.y;
						}

						if (maxX == null || maxX < point.x){
							maxX = point.x;
						}

						if (maxY == null || maxX > point.x){
							minX = point.x;
						}

						sumX += point.x;
					})
					mouthTopPoint.x = sumX / data.length; // Taking avg of all x values
					mouthTopPoint.y = maxY;
					mouthWidth = Math.abs(maxX - minX);

					//Finding bottom and central point on nose
					data = face.landmarks.getNose();
					let noseBottomPoint = {x:0, y:0};
					sumX = 0, minY = null;
					data.forEach((point) => {
						if (minY == null || minY < point.y){
							minY = point.y
						}

						sumX += point.x;
					})
					noseBottomPoint.x = sumX / data.length; // Taking avg of all x values
					noseBottomPoint.y = minY;

					let calc = calcStacheImgLocn(wearable.data[index], noseBottomPoint, mouthTopPoint, mouthWidth);
					ctx.imageSmoothingEnabled = false;
					ctx.drawImage(wearable.img[index], calc.x, calc.y, calc.width, calc.height);
				}
			})
		}

		ctx.closePath();

	})
}

//Sunglass type image locn finder
function calcEyeImgLocn(img_data, leftEye, rightEye) {

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

//Stache type image locn finder
function calcStacheImgLocn(img_data, noseBottomPoint, mouthTopPoint, mouthWidth){
	let req_vals = { x: 0, y: 0, width: 0, height: 0}; 
	let k = mouthWidth / img_data.mouthWidth;

	// Taking the avg of the noseBottom and mouthTop point to get the central posn of our stache, but as we need the top left corner point, shifting from there by k * img_data.center(vec), k scales it up to appropriate dimensions
	req_vals.x = (noseBottomPoint.x + mouthTopPoint.x)/2 - (img_data.center.x * k);
	req_vals.y = (noseBottomPoint.y + mouthTopPoint.y)/2 - (img_data.center.y * k);

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

function ifLoaded() {
	return new Promise(resolve => {
		const interval = setInterval(() => {
			let loaded = true;
			cosmetics.forEach(wearable => {
				wearable.img.forEach(img => {
					loaded = loaded && img.complete;
				})
			})

			if (loaded) {
				clearInterval(interval);
				resolve();
			}
		}, 100);
	})
}


function loop() {
	if (camOn) {
		detectFaces();
	}

	requestAnimationFrame(loop);
}

async function init() {
	console.log("Loading images");
	await loadModels()
	await ifLoaded();
	console.log("Images loaded!");
	loop();
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

cosmeticBtn.addEventListener('click', () => {
	if (currentCosmeticNo + 1 == cosmetics.length){
		currentCosmeticNo = 0;
	} else {
		currentCosmeticNo++;
	}

	cosmeticBtn.innerHTML = `${cosmetics[currentCosmeticNo].emoji}`;
})

startCam();
init();