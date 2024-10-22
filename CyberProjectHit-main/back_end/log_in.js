const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = JSON.parse(fs.readFileSync('config.json'));

const getLoginPage = (app) => {
    //Go to login page
    app.get('/login', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/credential_related', 'login.html'));
    });
};

const loginAttemptsMap = new Map();
const tryLogin=(app, db)=>{
    app.post('/login', async (req, res) => {
        //Get input from user
        const { username, password } = req.body;
        const { maxLoginAttempts } = config.password;
        const blockDuration = 60 * 1000;
        const clientIp = req.ip;
        const attemptsInfo = loginAttemptsMap.get(clientIp) || { attempts: 0, blockUntil: null };
        const currentTime = new Date();
        //Check if IP is blocked
        if (attemptsInfo.blockUntil && attemptsInfo.blockUntil > currentTime) {
            return res.status(403).send(`Too many failed attempts. Try again later.`);
        }
        try {
            //Check if username is wrong
            const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
            if (result.rows.length === 0) {
                return res.status(401).send('Invalid username or password');
            }
            
            const dbPassword = result.rows[0].password;
            const salt = result.rows[0].salt;
            const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
            //Check if password is wrong
            if (hash !== dbPassword) {
                attemptsInfo.attempts += 1;
                //Add count to attemps if attempt > config attemps temp block user
                if (attemptsInfo.attempts >= maxLoginAttempts) {
                    attemptsInfo.blockUntil = new Date(currentTime.getTime() + blockDuration);
                    attemptsInfo.attempts = 0;
                }

                loginAttemptsMap.set(clientIp, attemptsInfo);
                return res.status(401).send('Invalid username or password');
            }
            loginAttemptsMap.delete(clientIp);
            //save uuser session info
            req.session.username = username;
            req.session.loggedIn = true;
            req.session.email = result.rows[0].email;
            req.session.admin = result.rows[0].admin;
            req.session.metamask = result.rows[0].metamask;

            res.status(200).send('');
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).send('Error logging in');
        }
    });
}

const logout = (app) => {
    app.get('/logout', (req, res) => {
        //logout
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error logging out');
            } else {
                res.redirect('/login'); 
            }
        });
    });
};


module.exports = {
    getLoginPage,
    tryLogin,
    logout
};  