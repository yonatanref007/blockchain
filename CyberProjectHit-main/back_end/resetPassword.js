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
                from: 'israeltcg0@gmail.com',
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
}

const sendToResetPgae = (app) => {
    app.get('/reset/:token', (req, res) => {
        const token = req.params.token;
        res.render('../html/credential_related/resetpassword', { token });
    });
};

const resetPassword = (app, db) => {
    app.post('/resetPassword', async (req, res) => {
        const { token, newPassword, repeatPassword } = req.body;
    
        try {
            if (newPassword !== repeatPassword) {
                return res.status(400).send('Passwords do not match');
            }
    
            const hash = crypto.createHash('sha1').update(token).digest('hex');
            const result = await db.query("SELECT username, reset_token_expiry, salt FROM users WHERE reset_token = $1", [hash]);
    
            if (result.rows.length === 0) {
                return res.status(400).send('Invalid or expired token');
            }
    
            const { username, reset_token_expiry, salt } = result.rows[0];
    
            //Extire token page
            if (reset_token_expiry < new Date()) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
    
            // start of Password history
            const Passwords = await db.query("SELECT id, password FROM passwordhistory WHERE username = $1 ORDER BY id ASC", [username]);
            const newHash = crypto.createHmac('sha256', salt).update(newPassword).digest('hex');
    
            const { historyLimit } = config.password;
    
            const previousPasswords = Passwords.rows.map(row => row.password);
            if (previousPasswords.includes(newHash)){
                return res.status(400).send('Cant use password you recently used');
            }
    
            if(Passwords.rows.length === historyLimit){
                const passwordId = Passwords.rows[0].id;
                await db.query("DELETE FROM passwordhistory WHERE id = $1", [passwordId]);
            }
    
            const query = `INSERT INTO passwordhistory (username, password) VALUES ($1, $2)`;
            await db.query(query, [username, newHash]);
            // end of Password history
    
            await db.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE username = $2", [newPassword, username]);
    
            res.status(200).send('Password has been reset successfully');
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).send('Error resetting password');
        }
    });
};

module.exports = {
    getForgotPassPage,
    sendForgotPassRequest,
    sendToResetPgae,
    resetPassword
};  