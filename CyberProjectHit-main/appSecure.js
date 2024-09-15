const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const path = require('path');
const { Client } = require('pg');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bodyParser = require('body-parser');
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const multer = require("multer")
const RegisterUtils = require("./back_end/register.js")
const logInUtils = require("./back_end/log_in.js")
const passwordUtils = require("./back_end/resetPassword.js")
const profileUtils = require("./back_end/Profie.js")
const mainUtils = require("./back_end/main.js")
const videoUtils = require("./back_end/video.js")
// Loading configuration file
const config = JSON.parse(fs.readFileSync('config.json'));

app.use(express.static(path.join(__dirname, 'public')));
// Setup email transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or any other email service
    auth: {
        user: 'israeltcg0@gmail.com',
        pass: 'Israel1948'
    }
});

// Generate a random secret key
const secretKey = crypto.randomBytes(128).toString('hex');

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false
}));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
// Serve the uploads directory
const uploadsDir = path.join(__dirname, 'public','html', 'upload_vid_files', 'uploads');
app.use('/upload_vid_files/uploads', express.static(uploadsDir));
// Start the server
const port = 3002; // or any port of your choice
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Database connection
const db = new Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "123456",
    port: 5432,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database', err.stack);
    } else {
        console.log('Connected to database');
    }
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/main', 'index.html'));
});


//Start of login
logInUtils.getLoginPage(app)
logInUtils.tryLogin(app, db)
logInUtils.logout(app)
//End of login

//Start of Forgot Password
RegisterUtils.getRegisterPage(app)
RegisterUtils.postRgister(app, db)
//End of Forgot Password


//Start of main
mainUtils.main(app);
mainUtils.registeredmain(app);
mainUtils.about(app);
//End of main

//Start of Forgot Password
passwordUtils.getForgotPassPage(app, db);
passwordUtils.sendForgotPassRequest(app, db);
//End of Forgot Password

//Start of Forgot Password
passwordUtils.sendToResetPgae(app, db);
passwordUtils.resetPassword(app, db);
//End of Reset Password


// Start of Profile
profileUtils.ProfilePage(app, db);
profileUtils.editProfilePage(app, db);
profileUtils.changeProfile(app, db);
// End of Profile


<<<<<<< Updated upstream
// upload videos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/html/upload_vid_files/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const username = req.session.username;
        cb(null, `${uniqueSuffix}+${username}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2 MB limit
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

app.get('/upload_videos', async (req, res) => {
    if (!req.session.username) {
        return res.sendFile(path.join(__dirname, 'public/html/main', 'error.html')); // Show error page
    }
    const username = req.session.username;
    const email = req.session.email;
    return res.render(path.join(__dirname, 'public/html/profile_related', 'upload_new.ejs'));
});

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

        // Handle the case when no file is provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please select a video to upload." });
        }

        // If everything is OK
        res.status(200).json({ message: "Upload successful", files: req.files });
    });
});


// Set up multer for handling file uploads
const uploads = multer({ dest: path.join(__dirname, 'public','html', 'upload_vid_files', 'uploads') });

// Serve the uploads directory
const uploadsDir = path.join(__dirname, 'public','html', 'upload_vid_files', 'uploads');
app.use('/upload_vid_files/uploads', express.static(uploadsDir));
=======
//files page
videoUtils.uploadFilesPage(app, db);
// Handle video uploads
videoUtils.checkFile(app, db);
videoUtils.uploadFile(app, db);
>>>>>>> Stashed changes

videoUtils.goToVideo(app, db);
// Serve the video player HTML file
///app.get('/video-player.html', (req, res) => {
///    res.sendFile(path.join(__dirname, 'public', 'video-player.html'));
///});

// Get the list of videos in the uploads folder
videoUtils.getVideoList(app, db);

<<<<<<< Updated upstream
        // Filter out only video files (optional)
        const videoFiles = files.filter(file => file.endsWith('.mp4'));

        res.json(videoFiles);
    });
});

// Handle video uploads

=======
>>>>>>> Stashed changes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).json({ message: 'Upload failed', error: err.message });
});



videoUtils.deleteVideo(app, db)

