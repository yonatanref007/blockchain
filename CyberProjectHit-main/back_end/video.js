const path = require('path'); // Make sure you require the necessary modules
const multer = require("multer");
const fs = require('fs');
const uploadPath = path.join(__dirname, '../public/html/upload_vid_files/uploads');
// upload videos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.session.username;
        cb(null, `${uniqueSuffix}+${username}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 3 MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).any();

function checkFileType(file, cb) {
    // Check file extension and mimetype
    const fileType = /mp4$/i;
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileType.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Please upload an MP4 file only.");
    }
}

// Set up multer for handling file uploads
const uploads = multer({ dest: uploadPath });

const getVideoList = (app) => {
    app.get('/api/videos', (req, res) => {
        const videoDir = uploadPath;
        fs.readdir(videoDir, (err, files) => {
            if (err) {
                console.error('Error reading video directory:', err);
                return res.status(500).send('Unable to read video directory');
            }
    
            // Filter out only video files (optional)
            const videoFiles = files.filter(file => file.endsWith('.mp4'));
    
            res.json(videoFiles);
        });
    });
};

const uploadFilesPage = (app) => {
    app.get('/videos', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html')); // Show error page
        }
        return res.sendFile(path.join(__dirname, '../public/html/profile_related', 'upload.html'));
    });
};

const checkFile=(app)=>{ 
    app.post("/videos", (req, res) => {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Handle multer errors (e.g., file too large)
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "Video exceeds the limit of 2 MB." });
                }
                // Generic multer error
                return res.status(500).json({ message: "Server error during upload." });
            } else if (err) {
                // Non-multer errors (e.g., invalid file type)
                return res.status(400).json({ message: err });
            }
            // If everything is OK
            res.status(200).json({ message: "Upload successful", files: req.files });
        });
    });
}

const goToVideo = (app) => {
    app.get('/video-player', async (req, res) => {
        const video = req.query.video;
        const username = req.query.username;
        ///const meta = await db.query("SELECT metamask FROM users WHERE username = $1", [username]);
        ///const { metamask } = meta.rows[0];
    
        ///const result = await db.query("SELECT description, category FROM video WHERE name = $1", [video]);
        ///const { description, category} = result.rows[0];
        console.log('Video:', video);
        console.log('Username:', username);
        res.render('html/main/video-player', { 
            session: req.session, 
            video: video, 
            username: username
            ///metamask: metamask,
            ///description: description,
            ///category: category
        });
    });
};

const deleteVideo = (app) => {
    app.delete('/videos/:filename', (req, res) => {
        const filePath = path.join(uploadPath, req.params.filename);
        fs.unlink(filePath, err => {
            if (err) {
                console.error('Error deleting video:', err);
                return res.status(500).send('Error deleting video');
            }
            res.status(200).send('Video deleted successfully');
        });
    });    
};

// End of Login
module.exports = {
    getVideoList,
    uploadFilesPage,
    checkFile,
    goToVideo,
    deleteVideo
};  