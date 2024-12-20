const path = require('path'); // Make sure you require the necessary modules

const main = (app) => {
    //Go to main page
    app.get('/main', (req, res) => {
        res.render('html/main/main', { username: req.session.username, admin: req.session.admin});
    });
};

const about = (app) => {
    //go to about page
    app.get('/about', async (req, res) => {
        res.sendFile(path.join(__dirname, '../public/html/main', 'about.html'));
    });
};

module.exports = {
    main,
    about
};  