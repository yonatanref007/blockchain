const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const util = require('util');


// Load your custom modules
const RegisterUtils = require("./back_end/register.js");
const logInUtils = require("./back_end/log_in.js");
const passwordUtils = require("./back_end/resetPassword.js");
const profileUtils = require("./back_end/Profie.js");
const mainUtils = require("./back_end/main.js");
const videoUtils = require("./back_end/video.js");
const apiUtils = require("./back_end/api.js");
const adminUtils = require("./back_end/admin.js");

const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./certificate.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const secretKey = crypto.randomBytes(128).toString('hex');
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true, 
        maxAge: 3600000 
    }
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));


const uploadsDir = path.join(__dirname, 'public', 'html', 'upload_vid_files', 'uploads');
app.use('/upload_vid_files/uploads', express.static(uploadsDir));

// Database connection
const db = new Client({
    user: "postgres",
    host: "autorack.proxy.rlwy.net",
    database: "railway",
    password: "wcIioPscrEuExGVPwbToCJFAIHyBkFQG",
    port: 44177,
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

// Login functionality
logInUtils.getLoginPage(app);
logInUtils.tryLogin(app, db);
logInUtils.logout(app);

// Register functionality
RegisterUtils.getRegisterPage(app);
RegisterUtils.postRgister(app, db);

// Main functionality
mainUtils.main(app, db);
mainUtils.about(app);

// Password reset functionality
passwordUtils.getForgotPassPage(app, db);
passwordUtils.sendForgotPassRequest(app, db);
passwordUtils.sendToResetPgae(app, db);
passwordUtils.resetPassword(app, db);

// Profile functionality
profileUtils.ProfilePage(app, db);
profileUtils.editProfilePage(app, db);
profileUtils.changeProfile(app, db);
profileUtils.check_videos(app, db);

// File upload and management
videoUtils.uploadFilesPage(app, db);
videoUtils.checkFile(app, db);
videoUtils.goToVideo(app, db);
videoUtils.deleteVideo(app, db);

// API functionality
apiUtils.getVideoList(app, db);
apiUtils.getUserList(app, db);
apiUtils.deleteUserList(app, db);
apiUtils.getContract(app)
// Admin functionality
adminUtils.check_profiles(app, db);
adminUtils.check_videos(app, db);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const port = 3002;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`Secure server is running on port ${port}`);
});
