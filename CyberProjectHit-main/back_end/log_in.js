const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const getLoginPage = (app) => {
    app.get('/login', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/credential_related', 'login.html'));
    });
};


const tryLogin=(app, db)=>{
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
            req.session.email = result.rows[0].email;
            req.session.admin = result.rows[0].admin;
            res.status(200).send('');
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).send('Error logging in');
        }
    });
}

const logout = (app) => {
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
};


module.exports = {
    getLoginPage,
    tryLogin,
    logout
};  