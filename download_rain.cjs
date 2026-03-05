const https = require('https');
const fs = require('fs');
const path = require('path');

// Using a direct, reliable Pixabay MP4 of rain on a window
const url = 'https://cdn.pixabay.com/video/2018/06/25/16912-277640243_tiny.mp4';
const dest = path.join(__dirname, 'public', 'rain.mp4');

const file = fs.createWriteStream(dest);

https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            console.log('Download completed.');
        });
    });
}).on('error', (err) => {
    fs.unlink(dest, () => { });
    console.error('Error downloading file:', err.message);
});
