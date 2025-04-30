import React, { useState, useEffect } from "react";
import "./App.css";

const morseCode = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", " ": "/",
  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----",
};

const inverseMorseCode = Object.fromEntries(
  Object.entries(morseCode).map(([k, v]) => [v, k])
);

function App() {
  const [text, setText] = useState("");
  const [morse, setMorse] = useState("");
  const [flashText, setFlashText] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedMorse, setRecordedMorse] = useState("");

  const textToMorse = (text) =>
    text
      .toUpperCase()
      .split("")
      .map((char) => morseCode[char] || "")
      .join(" ");

  const morseToText = (code) =>
    code
      .split(" ")
      .map((char) => inverseMorseCode[char] || "")
      .join("");

  const flashMorse = async () => {
    const unit = 300;
    for (let symbol of morse) {
      if (symbol === ".") {
        document.body.style.backgroundColor = "white";
        await new Promise((r) => setTimeout(r, unit));
      } else if (symbol === "-") {
        document.body.style.backgroundColor = "white";
        await new Promise((r) => setTimeout(r, unit * 3));
      }
      document.body.style.backgroundColor = "black";
      await new Promise((r) => setTimeout(r, unit));
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = "black";
  }, []);

  const handleRecord = () => {
    setRecording(true);
    setRecordedMorse("");
    let recording = "";
    const start = Date.now();
    const handleKeyDown = () => {
      const t = Date.now() - start;
      recording += t < 400 ? "." : "-";
    };
    window.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      window.removeEventListener("keydown", handleKeyDown);
      setRecordedMorse(recording);
      setRecording(false);
      setFlashText(morseToText(recording));
    }, 5000);
  };

  return (
    <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
      <h1>Morse Code Flash Communicator</h1>

      <input
        type="text"
        value={text}
        placeholder="Enter text"
        onChange={(e) => {
          setText(e.target.value);
          setMorse(textToMorse(e.target.value));
        }}
        style={{ padding: "10px", fontSize: "16px", width: "300px" }}
      />

      <div style={{ margin: "20px" }}>
        <p><strong>Morse Code:</strong> {morse}</p>
        <button onClick={flashMorse} style={{ padding: "10px 20px" }}>
          Flash Morse Code
        </button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Record Morse using Keyboard</h3>
        <button onClick={handleRecord} disabled={recording}>
          {recording ? "Recording..." : "Start Recording"}
        </button>
        <p><strong>Recorded Morse:</strong> {recordedMorse}</p>
        <p><strong>Decoded Text:</strong> {flashText}</p>
      </div>
    </div>
  );
}

export default App;

