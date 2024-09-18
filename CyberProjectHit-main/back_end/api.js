const path = require('path'); // Make sure you require the necessary modules
const fs = require('fs');
const filePath = path.join(__dirname, '../public/html/upload_vid_files/uploads');

const getVideoList = (app, db) => {
    app.get('/api/videos', async (req, res) => {
        try {
            const name = req.query.Name;
            const creator = req.query.Creator;
            const category = req.query.Type;

            const files = await fs.promises.readdir(filePath);
            const allVideoFiles = files.filter(file => file.endsWith('.mp4'));

            let query = 'SELECT * FROM video WHERE 1=1';
            const params = [];

            if (name && name !== '') {
                query += ` AND LOWER(title) LIKE $${params.length + 1}`;
                params.push(`%${name.toLowerCase()}%`);
            }

            if (creator && creator !== '') {
                query += ` AND LOWER(username) LIKE $${params.length + 1}`;
                params.push(`%${creator.toLowerCase()}%`);
            }

            if (category && category !== '') {
                query += ` AND category LIKE $${params.length + 1}`;
                params.push(`%${category}%`);
            }

            const result = await db.query(query, params);
            const videoInfo = result.rows;
            const videoNames = videoInfo.map(video => video.name);
            const filteredVideoFiles = allVideoFiles.filter(file => videoNames.includes(file));
            res.json({ videoFiles: filteredVideoFiles, videoInfo: videoInfo });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
        }
    });
};


const getUserList = (app, db) => {
    app.get('/api/users', async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
            if (!req.session.username) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
            const result = await db.query('SELECT * FROM users WHERE username != $1', [req.session.username]);
            const userInfo = result.rows;
            res.json(userInfo);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
        }
    });
};

const deleteUserList = (app, db) => {
    app.post('/api/users', async (req, res) => {
        try {
            const { username } = req.body;
            await db.query('DELETE FROM users WHERE username = $1', [username]);
            res.status(200).send('User deleted successfully');
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
        }
    });
};
// End of Login
module.exports = {
    getVideoList,
    getUserList,
    deleteUserList
};  