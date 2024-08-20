const vidfeed = document.getElementById("vidfeed");
const canvas = document.getElementById("vidoverlay");
const ctx = canvas.getContext('2d');

// To Stream webcam
async function startVideo() {
	navigator.mediaDevices.getUserMedia({ video: true })
		.then((stream) => {
			vidfeed.srcObject = stream; // This part sends the MediaStream to video
		})
		.catch((err) => {
			console.log("Error: ", err); // To Handle vid error [TODO]
		});
}


// Loads the models
async function loadModels() {
	await faceapi.loadTinyFaceDetectorModel('/models');
	await faceapi.loadFaceExpressionModel('/models');
}

startVideo();
loadModels();
console.log(faceapi.nets)