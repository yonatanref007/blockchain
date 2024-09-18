const path = require('path'); // Make sure you require the necessary modules

const check_profiles = (app, db) => {
    app.get('/check_profiles', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        if (!req.session.admin) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
        res.render('html/admin/users_view');
    });
};

const check_videos = (app, db) => {
    app.get('/check_videos', async (req, res) => {
        if (!req.session.username) {
            return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
        }
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