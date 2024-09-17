const path = require('path');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const crypto = require('crypto');
// Load dictionarty file
const dictionary = fs.readFileSync(config.password.dictionaryPath,'utf8').split('\n');

const getRegisterPage = (app) => {
    app.get('/register', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/credential_related', 'register.html'));
    });
};


const postRgister=(app, db)=>{
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
    
            const passwordHistory = `INSERT INTO passwordhistory (username, password) VALUES ($1, $2)`;
            await db.query(passwordHistory, [username, hash]);
    
            res.status(200).send('');
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).send('Error registering user');
        }
    });
}

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

// Helper function to hash password with HMAC + Salt
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return { salt, hash };
}


module.exports = {
    getRegisterPage,
    postRgister
};  