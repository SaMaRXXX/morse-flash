import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MORSE_CODE_DICT = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

const REVERSE_DICT = Object.fromEntries(Object.entries(MORSE_CODE_DICT).map(([k, v]) => [v, k]));

export default function MorseFlashApp() {
  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');
  const [decoded, setDecoded] = useState('');
  const [flashLog, setFlashLog] = useState([]);

  const textToMorse = (input) => {
    return input.toUpperCase().split('').map(c => MORSE_CODE_DICT[c] || '').join(' ');
  };

  const morseToText = (input) => {
    return input.trim().split(' ').map(symbol => REVERSE_DICT[symbol] || '?').join('');
  };

  const simulateFlash = (code) => {
    const log = [];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= code.length) return clearInterval(interval);
      const symbol = code[i];
      if (symbol === '.') {
        log.push('Flash (dot)');
      } else if (symbol === '-') {
        log.push('Flash (dash)');
      } else if (symbol === ' ') {
        log.push('Pause (letter)');
      } else if (symbol === '/') {
        log.push('Pause (word)');
      }
      setFlashLog([...log]);
      i++;
    }, 300);
  };

  const handleConvert = () => {
    const morseCode = textToMorse(text);
    setMorse(morseCode);
    simulateFlash(morseCode);
  };

  const handleDecode = () => {
    setDecoded(morseToText(morse));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Morse Code Flashlight Encoder/Decoder</h1>

      <Textarea
        placeholder="Enter text to convert to Morse"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-4"
      />

      <Button onClick={handleConvert} className="mb-4">Convert & Simulate Flash</Button>

      <div className="bg-gray-100 p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold">Morse Code:</h2>
        <p>{morse}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow mb-4">
        <h2 className="font-semibold">Flash Simulation Log:</h2>
        <ul className="list-disc pl-5">
          {flashLog.map((log, idx) => <li key={idx}>{log}</li>)}
        </ul>
      </div>

      <Button onClick={handleDecode} className="mb-4">Decode Morse to Text</Button>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <h2 className="font-semibold">Decoded Text:</h2>
        <p>{decoded}</p>
      </div>
    </div>
  );
}
