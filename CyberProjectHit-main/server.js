const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3002;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for handling file uploads
const upload = multer({ dest: path.join(__dirname, 'public', 'upload_vid_files', 'uploads') });

// Serve the uploads directory
const uploadsDir = path.join(__dirname, 'public', 'upload_vid_files', 'uploads');
app.use('/upload_vid_files/uploads', express.static(uploadsDir));

// Serve the video player HTML file
app.get('/video-player.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-player.html'));
});

// Get the list of videos in the uploads folder
app.get('/api/videos', (req, res) => {
    console.log('Received request for /api/videos');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return res.status(500).json({ error: 'Unable to read uploads directory', details: err.message });
        }
        const videoFiles = files.filter(file => ['.mp4', '.webm', '.ogg'].includes(path.extname(file).toLowerCase()));
        console.log('Found video files:', videoFiles);
        res.json(videoFiles);
    });
});

// Handle video uploads
app.post('/videos', upload.array('file[]'), (req, res) => {
    console.log('Files uploaded:', req.files);
    res.status(200).send('Files uploaded successfully!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Video player available at http://localhost:${port}/video-player.html`);
});
