const path = require('path'); // Make sure you require the necessary modules

const main = (app) => {
    app.get('/main', (req, res) => {
        res.render('html/main/main', { username: req.session.username });
    });
};

const about = (app) => {
    app.get('/about', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/main', 'about.html'));
    });
};

module.exports = {
    main,
    about
};  