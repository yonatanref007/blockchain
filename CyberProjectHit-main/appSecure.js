const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const path = require('path');
const { Client } = require('pg');

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
mainUtils.main(app, db);
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


//files page
videoUtils.uploadFilesPage(app, db);
// Handle video uploads
videoUtils.checkFile(app, db);
videoUtils.goToVideo(app, db);

// Get the list of videos in the uploads folder
videoUtils.getVideoList(app, db);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



videoUtils.deleteVideo(app, db)

