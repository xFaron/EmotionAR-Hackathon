
# Emotion-AR-Hackathon

**Emotion-AR-Hackathon** is a JavaScript-powered web application. It uses **face-api.js** to detect emotions in real-time and overlay AR filters on your face via a live camera feed. The application also displays your detected emotions on a second interface.

## Features

1. **Real-time Emotion Detection**:
   - Uses the webcam to analyze facial expressions.
   - Detects emotions like happy, sad, angry, surprised, etc., and displays them.

2. **AR Filters**:
   - Multiple filters that can be applied to your face dynamically.
   - Toggle between filters with a button.

3. **Dual Interfaces**:
   - **Camera Interface**: Interact with AR filters and emotion detection in real-time.
   - **Emotion Display Interface**: View your current detected emotion.

## Technology Stack

- **HTML5**: For structuring the web application.
- **CSS3**: For styling the interface.
- **JavaScript**: For application logic and interactivity.
- **face-api.js**: For emotion detection and AR filter integration.
- **Webcam API**: To access and control the user's webcam.

## Usage

1. Navigate to the **Camera Interface**:
   - Click the **Camera On/Off** button to toggle the webcam.
   - Use the **Filter Toggle** button to switch AR filters.

2. Switch to the **Emotion Display Interface** to view your current detected emotion.

## How It Works

1. **Emotion Detection**:
   - The application leverages **face-api.js** to analyze live video feed from the webcam.
   - Based on facial landmarks, the library identifies key emotions.

2. **Filter Application**:
   - AR filters are dynamically overlaid on the detected facial regions using **face-api.js**.
  
## Try it out

The application is hosted on github pages. [Click ME!](https://xfaron.github.io/EmotionAR-Hackathon/)

## Future Enhancements

- Add more advanced AR filters.
- Allow users to save snapshots with applied filters.
- Include a history of detected emotions over time.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for the amazing emotion detection and facial recognition library.
- Inspiration from AR applications like Snapchat and Instagram filters.

## Author

**Harikrishna S**  
