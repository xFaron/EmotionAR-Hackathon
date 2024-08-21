const vidfeed = document.getElementById("vidfeed");
const canvas = document.getElementById("vidoverlay");
const ctx = canvas.getContext('2d');

let vidSize = {
	width: vidfeed.clientWidth,
	height: vidfeed.clientHeight
};

// To Stream webcam
async function startVideo() {
	navigator.mediaDevices.getUserMedia({ video: true })
		.then((stream) => {
			vidfeed.srcObject = stream; // This part sends the MediaStream to video

			vidfeed.addEventListener("playing", () => {
				resizeCanvas()
			})
		})
		.catch((err) => {
			console.log("Error: ", err); // To Handle vid error [TODO]
		});
}


// Loads the models
async function loadModels() {
	try {
		console.log("Loading models");
		await faceapi.loadTinyFaceDetectorModel('./models');
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
	const detections = await faceapi.detectAllFaces(vidfeed, new faceapi.TinyFaceDetectorOptions()); // Detect facce with TinyModel
	console.log("Detected");
	const detectionsResized  = faceapi.resizeResults(detections, vidSize); // Resizes results for provided canvas (precaution)
	
	detectionsResized.forEach((face) => {
		let x = face._box._x;
		let y = face._box._y;
		let width = face._box._width;
		let height = face._box._height;
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


window.addEventListener('resize', () => {
	// When the window resizes, the canvas also has to be resized
	resizeCanvas();
})

startVideo();
loadModels();

ctx.fillStyle = 'green';
ctx.strokeStyle = 'green';
ctx.lineWidth = 5;