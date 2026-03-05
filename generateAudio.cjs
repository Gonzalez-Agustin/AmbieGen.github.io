const fs = require('fs');
const path = require('path');

// Simple WAV generator
function writeWAV(filename, durationSeconds, generateSample) {
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const dataSize = numSamples * 2; // 16-bit
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // "fmt " sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(1, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
    buffer.writeUInt16LE(2, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample

    // "data" sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        const val = Math.max(-32768, Math.min(32767, Math.round(generateSample(i, sampleRate))));
        buffer.writeInt16LE(val, offset);
        offset += 2;
    }

    fs.writeFileSync(filename, buffer);
}

const outDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Generate simple synthetic sounds
// 1. Rain (Pinkish noise)
writeWAV(path.join(outDir, 'rain.mp3'), 2, () => (Math.random() * 2 - 1) * 15000);

// 2. Forest (Low frequency sine/noise mix)
writeWAV(path.join(outDir, 'forest.mp3'), 2, (i, sr) => Math.sin(i * 2 * Math.PI * 150 / sr) * 10000 + (Math.random() * 5000));

// 3. Cafe (Mid frequency ambient noise)
writeWAV(path.join(outDir, 'cafe.mp3'), 2, (i, sr) => Math.sin(i * 2 * Math.PI * 300 / sr) * 5000 + (Math.random() * 10000));

// 4. Keyboard (Clicking)
writeWAV(path.join(outDir, 'keyboard.mp3'), 2, (i, sr) => (i % Math.floor(sr / 10) < 100) ? (Math.random() * 20000) : 0);

// 5. White noise
writeWAV(path.join(outDir, 'whitenoise.mp3'), 2, () => (Math.random() * 2 - 1) * 20000);

// 6. Jazz (Sine wave chords)
writeWAV(path.join(outDir, 'jazz.mp3'), 2, (i, sr) => {
    return Math.sin(i * 2 * Math.PI * 261.63 / sr) * 5000 +
        Math.sin(i * 2 * Math.PI * 329.63 / sr) * 5000 +
        Math.sin(i * 2 * Math.PI * 392.00 / sr) * 5000;
});

console.log("Synthetic WAV files generated (named .mp3 for compatibility).");
