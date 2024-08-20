// DOM elements
const vidfeed = document.getElementById("vidfeed");


// Streaming webcam
navigator.mediaDevices.getUserMedia({ video: true })
.then((stream) => {
		vidfeed.srcObject = stream;
	}
)
.catch((err) => {
		console.log("Error: ", err);
	}
);