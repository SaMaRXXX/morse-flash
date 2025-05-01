import React, { useRef, useState, useEffect } from "react";

const morseToText = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D',
  '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H',
  '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
  '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P',
  '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z', '/': ' '
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [morseCode, setMorseCode] = useState("");
  const [stream, setStream] = useState(null);
  const [log, setLog] = useState([]);

  let prevBright = 0;
  let flashStart = null;
  let flashPattern = "";

  const threshold = 100; // Adjust for ambient light

  const decodeMorse = (morse) => {
    return morse.trim().split(" ").map(code => morseToText[code] || '').join('');
  };

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setStream(stream);
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  const analyzeFrame = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(videoRef.current, 0, 0, 100, 100);
    const imageData = context.getImageData(0, 0, 100, 100).data;

    let brightness = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      const avg = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
      brightness += avg;
    }
    brightness = brightness / (imageData.length / 4);

    const now = Date.now();

    if (brightness > threshold && prevBright <= threshold) {
      // Flash started
      flashStart = now;
    } else if (brightness <= threshold && prevBright > threshold && flashStart) {
      // Flash ended
      const duration = now - flashStart;

      if (duration < 300) flashPattern += '.';
      else flashPattern += '-';

      flashPattern += ' ';
      flashStart = null;
    }

    prevBright = brightness;

    if (recording) {
      requestAnimationFrame(analyzeFrame);
    }
  };

  const handleStart = () => {
    setRecording(true);
    flashPattern = '';
    startWebcam();
    setTimeout(() => analyzeFrame(), 1000);
  };

  const handleStop = () => {
    setRecording(false);
    stopWebcam();
    const morse = flashPattern.trim();
    setMorseCode(morse);
    setDecodedText(decodeMorse(morse));
    setLog(log => [...log, { morse, text: decodeMorse(morse) }]);
  };

  return (
    <div className="App">
      <h1>Morse Code from Flashlight</h1>
      <video ref={videoRef} width="300" height="200" autoPlay style={{ display: 'block', marginBottom: '10px' }} />
      <canvas ref={canvasRef} width="100" height="100" style={{ display: 'none' }} />
      <button onClick={handleStart}>Start Recording</button>
      <button onClick={handleStop}>Stop Recording</button>
      <p><strong>Morse:</strong> {morseCode}</p>
      <p><strong>Text:</strong> {decodedText}</p>
    </div>
  );
}


