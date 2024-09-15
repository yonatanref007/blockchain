const path = require('path'); // Make sure you require the necessary modules

const main = (app) => {
    app.get('/main', async (req, res) => {
        if (req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/profile_related', 'reg_main.html'));
        }
        res.sendFile(path.join(__dirname, '../public/html/main', 'main.html'));
    });
};


const registeredmain=(app)=>{
    app.get('/reg_main', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        res.sendFile(path.join(__dirname, '../public/html/profile_related', 'reg_main.html'));
    });
}

const about = (app) => {
    app.get('/about', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/main', 'about.html'));
    });
};

module.exports = {
    main,
    registeredmain,
    about
};  