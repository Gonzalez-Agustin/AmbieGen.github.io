const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const inPath = path.join(__dirname, 'public', 'audio', 'rain.mp3');
const outPath = path.join(__dirname, 'public', 'audio', 'rain.wav');

if (!fs.existsSync(inPath)) {
    console.error("No se encontró rain.mp3", inPath);
    process.exit(1);
}

console.log(`Convirtiendo ${inPath} a ${outPath}... con ${ffmpeg}`);

// Run FFmpeg synchronously to convert
try {
    execSync(`"${ffmpeg}" -y -i "${inPath}" "${outPath}"`);
    console.log("¡Conversión a WAV completada exitosamente!");
} catch (error) {
    console.error("Error al convertir:", error.message);
}
