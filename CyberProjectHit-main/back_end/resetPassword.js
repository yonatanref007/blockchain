const path = require('path'); // Make sure you require the necessary modules
const crypto = require('crypto');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const nodemailer = require('nodemailer');

const getForgotPassPage = (app) => {
    app.get('/forgotpassword', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/credential_related', 'forgotpassword.html'));
    });
};
//Email sender adress
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or any other email service
    auth: {
        user: 'israeltcg0@gmail.com',
        pass: 'xrtwgoaxrmuzvghb'
    }
});

const sendForgotPassRequest=(app, db)=>{
    app.post('/forgotPassword', async (req, res) => {
        const { email } = req.body;
        //check If user input exists
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
            //Put token expiry to the user
            await db.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE username = $3", [hash, expiry, username]);
            //Send link to change password to the user
            const mailOptions = {
                to: email,
                from: 'israeltcg0@gmail.com',
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                      `https://${req.headers.host}/reset/${token}\n\n` +
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
}

const sendToResetPgae = (app) => {
    app.get('/reset/:token', (req, res) => {
        //Go to resetpassword page
        const token = req.params.token;
        res.render('../public/html/credential_related/resetpassword', { token });
    });
};

const resetPassword = (app, db) => {
    app.post('/resetPassword', async (req, res) => {
        //save the input from user
        const { token, newPassword, repeatPassword } = req.body;
        
        try {
            if (newPassword !== repeatPassword) {
                return res.status(400).send('Passwords do not match');
            }
            if (!isPasswordComplex(newPassword)) {
                return res.status(400).send('Password does not meet complexity requirements');
            }
            //Check if token is expired / doesnt exist
            const hash = crypto.createHash('sha1').update(token).digest('hex');
            const result = await db.query("SELECT username, reset_token_expiry, salt FROM users WHERE reset_token = $1", [hash]);
    
            if (result.rows.length === 0) {
                return res.status(400).send('Invalid or expired token');
            }
            
            const { username, reset_token_expiry, salt } = result.rows[0];
    
            //Expire token page
            if (reset_token_expiry < new Date()) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
    
            // start of Password history
            //check if password was recentrly used
            const Passwords = await db.query("SELECT id, password FROM passwordhistory WHERE username = $1 ORDER BY id ASC", [username]);
            const newHash = crypto.createHmac('sha256', salt).update(newPassword).digest('hex');
            //Number of passwords in history we need to check
            const { historyLimit } = config.password;
    
            const previousPasswords = Passwords.rows.map(row => row.password);
            if (previousPasswords.includes(newHash)){
                return res.status(400).send('Cant use password you recently used');
            }
            //If exceeds the limit delete the oldest one
            if(Passwords.rows.length === historyLimit){
                const passwordId = Passwords.rows[0].id;
                await db.query("DELETE FROM passwordhistory WHERE id = $1", [passwordId]);
            }
            //Add trhe new password to the password history database
            const query = `INSERT INTO passwordhistory (username, password) VALUES ($1, $2)`;
            await db.query(query, [username, newHash]);
            // end of Password history
            
            //Update the user current password
            await db.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE username = $2", [newHash, username]);
    
            res.status(200).send('Password has been reset successfully');
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).send('Error resetting password');
        }
    });
};

//Password config check
function isPasswordComplex(password) {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialCharacters, requireDictionaryProtection } = config.password;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const existInDictionary = !dictionary.includes(password);

    return password.length >= minLength &&
           (!requireUppercase || hasUppercase) &&
           (!requireLowercase || hasLowercase) &&
           (!requireNumbers || hasNumbers) &&
           (!requireDictionaryProtection || existInDictionary) &&
           (!requireSpecialCharacters || hasSpecial);
}

module.exports = {
    getForgotPassPage,
    sendForgotPassRequest,
    sendToResetPgae,
    resetPassword
};  