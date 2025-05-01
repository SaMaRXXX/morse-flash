import React, { useRef, useState } from "react";

const textToMorse = {
  A: ".-", B: "-...", C: "-.-.", D: "-..",
  E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", " ": "/"
};

const morseToText = Object.fromEntries(
  Object.entries(textToMorse).map(([k, v]) => [v, k])
);

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [recording, setRecording] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [stream, setStream] = useState(null);

  const threshold = 100;
  let prevBright = 0;
  let flashStart = null;
  let flashPattern = "";

  const convertToMorse = () => {
    const morse = inputText
      .toUpperCase()
      .split("")
      .map((char) => textToMorse[char] || "")
      .join(" ");
    setMorseOutput(morse);
  };

  const blinkMorse = () => {
    const flashes = morseOutput.split("");

    let i = 0;
    const flash = () => {
      if (i >= flashes.length) return;
      const screen = document.body;
      if (flashes[i] === ".") {
        screen.style.backgroundColor = "white";
        setTimeout(() => {
          screen.style.backgroundColor = "black";
          i++;
          setTimeout(flash, 200);
        }, 200);
      } else if (flashes[i] === "-") {
        screen.style.backgroundColor = "white";
        setTimeout(() => {
          screen.style.backgroundColor = "black";
          i++;
          setTimeout(flash, 300);
        }, 500);
      } else {
        i++;
        setTimeout(flash, 300);
      }
    };
    flash();
  };

  const decodeMorse = (morse) =>
    morse
      .trim()
      .split(" ")
      .map((code) => morseToText[code] || "")
      .join("");

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setStream(stream);
  };

  const stopWebcam = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const analyzeFrame = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(videoRef.current, 0, 0, 100, 100);
    const imageData = context.getImageData(0, 0, 100, 100).data;

    let brightness = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      brightness +=
        (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
    }
    brightness = brightness / (imageData.length / 4);

    const now = Date.now();

    if (brightness > threshold && prevBright <= threshold) {
      flashStart = now;
    } else if (brightness <= threshold && prevBright > threshold && flashStart) {
      const duration = now - flashStart;
      if (duration < 300) flashPattern += ".";
      else flashPattern += "-";
      flashPattern += " ";
      flashStart = null;
    }

    prevBright = brightness;

    if (recording) requestAnimationFrame(analyzeFrame);
  };

  const handleStart = () => {
    setRecording(true);
    flashPattern = "";
    startWebcam();
    setTimeout(() => analyzeFrame(), 1000);
  };

  const handleStop = () => {
    setRecording(false);
    stopWebcam();
    const morse = flashPattern.trim();
    setDecodedText(decodeMorse(morse));
  };

  return (
    <div style={{ padding: 20, backgroundColor: "black", color: "white", minHeight: "100vh" }}>
      <h1>Morse Code Communicator</h1>

      <h2>Text to Morse</h2>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text"
      />
      <button onClick={convertToMorse}>Convert</button>
      <button onClick={blinkMorse}>Flash Morse</button>
      <p><b>Morse:</b> {morseOutput}</p>

      <h2>Morse to Text (using Camera)</h2>
      <video ref={videoRef} width="300" height="200" autoPlay />
      <canvas ref={canvasRef} width="100" height="100" style={{ display: "none" }} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleStart}>Start Recording</button>
        <button onClick={handleStop}>Stop Recording</button>
      </div>
      <p><b>Decoded Text:</b> {decodedText}</p>
    </div>
  );
}



