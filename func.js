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