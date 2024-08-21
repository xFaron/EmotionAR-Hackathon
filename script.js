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
	await faceapi.loadTinyFaceDetectorModel('./models');
	await faceapi.loadFaceExpressionModel('./models');
}

// Detects the faces by inputting the vid stream
async function detectFace() {
	const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
	return detections
}

// // Draws the boxes for the detections on canvas
// function drawDetections(detections) {

// }


function resizeCanvas() {
	vidSize = {
		width: vidfeed.clientWidth,
		height: vidfeed.clientHeight
	};
	canvas.style.width = `${vidSize.width}px`;
	canvas.style.height = `${vidSize.height}px`;
}


window.addEventListener('resize', () => {
	// When the window resizes, the canvas also has to be resized
	resizeCanvas();
})

startVideo();
loadModels();

// ctx.fillStyle = 'white';
//ctx.fillRect(0, 0, vidSize.width, vidSize.height);

// setTimeout(() => {
// 	let faces = detectFace();
// 	drawDetections(faces);
// }, 100);