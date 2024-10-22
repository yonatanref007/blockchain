const path = require('path'); // Make sure you require the necessary modules
const dirpath = path.join(__dirname, '../public/html/main')
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const crypto = require('crypto');
// Load dictionarty file

const dictionary = fs.readFileSync(config.password.dictionaryPath,'utf8').split('\n');

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

const ProfilePage = (app) => {
    app.get('/profile', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(dirpath, 'error.html'));
        }
        const username = req.session.username;
        const email = req.session.email;
        const meta = req.session.metamask;
        res.render('html/profile_related/profile.ejs', { username, email, meta });
    });
};


const editProfilePage = (app) => {
    app.get('/editprofile', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(dirpath, 'error.html')); // Show error page
        }
        const username = req.session.username;
        const email = req.session.email;
        res.render('html/profile_related/editprofile', { username, email });
    });
};


const changeProfile=(app, db)=>{
    app.post('/editprofile', async (req, res) => {
        //Check if session exist
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        //save the input from user
        const {Email ,newUsername, currentPassword, newPassword } = req.body;
        try {
            //Check if email exists
            if (Email != req.session.email){
                const check_email = await db.query("SELECT * FROM users WHERE email = $1", [Email]);
                if (check_email.rows.length != 0) {
                    return res.status(400).send('Invalid email');
                }
                await db.query("UPDATE users SET email = $1 WHERE email = $2", [Email, req.session.email]);
                req.session.email = Email;
            }
            //Check if username exists
            if (newUsername != req.session.username){
                const check_username = await db.query("SELECT * FROM users WHERE username = $1", [newUsername]);
                if (check_username.rows.length != 0) {
                    return res.status(400).send('Invalid username');
                }
                userHistory = await db.query("SELECT username FROM passwordhistory WHERE username = $1", [req.session.username]);
                if(userHistory.rows.length != 0){
                    await db.query("UPDATE passwordhistory SET username = $1 WHERE username = $2", [req.session.username, newUsername]);
                }
                await db.query("UPDATE users SET username = $1 WHERE username = $2", [newUsername, req.session.username]);
                req.session.username = newUsername;
            }
            //Check if password exists
            if(currentPassword != "" && newPassword != ""){
                const result = await db.query("SELECT  password, salt FROM users WHERE username = $1 ", [req.session.username]);
                if (result.rows.length === 0) {
                    return res.status(400).send('User not found');
                }
                //Check if current password is correct
                const dbPassword = result.rows[0].password;
                const salt = result.rows[0].salt;
                const currentHash = crypto.createHmac('sha256', salt).update(currentPassword).digest('hex');
    
                if (currentHash !== dbPassword) {
                    return res.status(400).send('Current password is incorrect');
                }
                //Check if new password meets password complexity 
                if (!isPasswordComplex(newPassword)) {
                    return res.status(400).send('New password does not meet complexity requirements');
                }
    
                // start of Password history
                // check if password is in the password history database
                const Passwords = await db.query("SELECT id, password FROM passwordhistory WHERE username = $1 ORDER BY id ASC", [req.session.username]);
                const newHash = crypto.createHmac('sha256', salt).update(newPassword).digest('hex');
    
                const { historyLimit } = config.password;
    
                const previousPasswords = Passwords.rows.map(row => row.password);
                if (previousPasswords.includes(newHash)){
                    return res.status(400).send('Cant use password you recently used');
                }
                // Delete the oldest password if there are more then the config allows
                if(Passwords.rows.length === historyLimit){
                    const passwordId = Passwords.rows[0].id;
                    await db.query("DELETE FROM passwordhistory WHERE id = $1", [passwordId]);
                }
                //insert the new password to the database
                const query = `INSERT INTO passwordhistory (username, password) VALUES ($1, $2)`;
                await db.query(query, [req.session.username, newHash]);
                // end of Password history
    
                await db.query("UPDATE users SET password = $1 WHERE username = $2", [newHash, req.session.username]);
            }      
            res.status(200).send('Profile Updated successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).send('Error changing password');
        }
    });
}
const check_videos = (app, db) => {
    app.get('/check_videos', async (req, res) => {
        //Go to videos of user
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        res.render('html/profile_related/video_delete_profile',{ username: req.session.username });
    });
};

module.exports = {
    ProfilePage,
    editProfilePage,
    changeProfile,
    check_videos
};  