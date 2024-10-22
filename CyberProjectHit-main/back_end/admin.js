const path = require('path'); // Make sure you require the necessary modules

const check_profiles = (app, db) => {
    app.get('/check_profiles', async (req, res) => {
        //Checking if user is registered
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        //Checking if user is an admin
        if (!req.session.admin) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        res.render('html/admin/users_view');
    });
};

const check_videos = (app, db) => {
    app.get('/delete_videos', async (req, res) => {
        //Checking if user is registered
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        //Checking if user is an admin
        if (!req.session.admin) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        res.render('html/admin/video_delete',{ username: req.session.username });
    });
};


module.exports = {
    check_profiles,
    check_videos
};  