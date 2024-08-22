const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const path = require('path');
const { Client } = require('pg');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bodyParser = require('body-parser');

// Loading configuration file
const config = JSON.parse(fs.readFileSync('config.json'));

app.use(express.static(path.join(__dirname, 'public')));
// Setup email transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or any other email service
    auth: {
        user: 'best4mecomp@gmail.com',
        pass: 'pdhmsyzlivvdzplw'
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
app.set('views', path.join(__dirname, 'views'));

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

app.get('/index', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Helper function to check password complexity
function isPasswordComplex(password) {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialCharacters } = config.password;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength &&
           (!requireUppercase || hasUppercase) &&
           (!requireLowercase || hasLowercase) &&
           (!requireNumbers || hasNumbers) &&
           (!requireSpecialCharacters || hasSpecial);
}

// Helper function to hash password with HMAC + Salt
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return { salt, hash };
}

// Start of Login
app.get('/login', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
//SQL injection
//' OR '1'='1
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const dbPassword = result.rows[0].password;
        const salt = result.rows[0].salt;
        const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');

        if (hash !== dbPassword) {
            return res.status(401).send('Invalid username or password');
        }

        req.session.username = username;
        req.session.loggedIn = true;
        res.redirect('/main');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});
// End of Login

// Start of Register
app.get('/register', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
//SQL injection , write it inside password and repeat password
//'); DROP TABLE users; --
app.post('/register', async (req, res) => {
    const { username, firstname, lastname, email, password, repeatPassword } = req.body;
    
    try {
        if (!username || !firstname || !lastname || !email || !password || !repeatPassword) {
            return res.status(400).send('All fields are required');
        }

        if (password !== repeatPassword) {
            return res.status(400).send('Passwords mismatch');
        }

        if (!isPasswordComplex(password)) {
            return res.status(400).send('Password does not meet complexity requirements');
        }
        //check if email exists
        const check_email = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (check_email.rows.length != 0) {
            return res.status(400).send('Invalid email');
        }
        //check if username exists
        const check_username = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (check_username.rows.length != 0) {
            return res.status(400).send('Invalid username');
        }

        const { salt, hash } = hashPassword(password);

        const query = `INSERT INTO users (username, firstname, lastname, email, password, salt) 
                       VALUES ($1, $2, $3, $4, $5, $6)`;
        await db.query(query, [username, firstname, lastname, email, hash, salt]);

        res.redirect('/main');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});
// End of Register

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/login'); 
        }
    });
});

//Start of Forgot Password
app.get('/forgotpassword', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgotpassword.html'));
});

app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query("SELECT username FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).send('User with this email does not exist');
        }

        const username = result.rows[0].username;

        //Random token created with sha1
        const token = crypto.randomBytes(20).toString('hex');
        const hash = crypto.createHash('sha1').update(token).digest('hex');
        const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

        await db.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE username = $3", [hash, expiry, username]);

        const mailOptions = {
            to: email,
            from: 'best4mecomp@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `http://${req.headers.host}/reset/${token}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err,info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
            }
            res.status(200).send('An e-mail has been sent with further instructions');
        });
    } catch (error) {
        console.error('Error processing forgot password:', error);
        res.status(500).send('Error processing forgot password');
    }
});
//End of Forgot Password


//Sart of Reset Password
app.get('/reset/:token', (req, res) => {
    const token = req.params.token;
    res.render('resetpassword', { token });
});


app.post('/resetPassword', async (req, res) => {
    const { token, newPassword, repeatPassword } = req.body;

    try {
        if (newPassword !== repeatPassword) {
            return res.status(400).send('Passwords do not match');
        }

        const hash = crypto.createHash('sha1').update(token).digest('hex');
        const result = await db.query("SELECT username, reset_token_expiry FROM users WHERE reset_token = $1", [hash]);

        if (result.rows.length === 0) {
            return res.status(400).send('Invalid or expired token');
        }

        const { username, reset_token_expiry } = result.rows[0];

        //Extire token page
        if (reset_token_expiry < new Date()) {
            return res.sendFile(path.join(__dirname, 'public', 'error.html'));
            //return res.sendFile(path.join(__dirname, 'public', 'error.html'));
        }

        await db.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE username = $2", [newPassword, username]);

        res.status(200).send('Password has been reset successfully');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password');
    }
});
//End of Reset Password


app.get('/main', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); 
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/reg_main', async (req, res) => {
    if (!req.session.username) {
        return res.sendFile(path.join(__dirname, 'public', 'error.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'reg_main.html'));
});

// End of Change Password
app.get('/changepassword', async (req, res) => {
    if (!req.session.username) {
        return res.sendFile(path.join(__dirname, 'public', 'error.html')); // Show error page
    }
    res.setHeader('Cache-Control', 'no-store'); 
    res.sendFile(path.join(__dirname, 'public', 'changepassword.html'));
});

app.post('/changePassword', async (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('Unauthorized');
    }
    const { currentPassword, newPassword } = req.body;
    const username = req.session.username;

    try {
        const result = await db.query("SELECT password, salt FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(400).send('User not found');
        }

        const dbPassword = result.rows[0].password;
        const salt = result.rows[0].salt;
        const currentHash = crypto.createHmac('sha256', salt).update(currentPassword).digest('hex');

        if (currentHash !== dbPassword) {
            return res.status(400).send('Current password is incorrect');
        }

        if (!isPasswordComplex(newPassword)) {
            return res.status(400).send('New password does not meet complexity requirements');
        }

        await db.query("UPDATE users SET password = $1 WHERE username = $2", [newHash, username]);

        res.status(200).send('Password changed successfully');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Error changing password');
    }
});
// End of Change Password



