const path = require('path'); 
const fs = require('fs');
const filePath = path.join(__dirname, '../public/html/upload_vid_files/uploads');

const getVideoList = (app, db) => {
    //Fetch videos function
    app.get('/api/videos', async (req, res) => {
        try {
            //getting the request variables
            const name = req.query.Name;
            const creator = req.query.Creator;
            const category = req.query.Type;
            const files = await fs.promises.readdir(filePath);
            const allVideoFiles = files.filter(file => file.endsWith('.mp4'));

            let query = 'SELECT * FROM video WHERE 1=1';
            const params = [];
            //Cheking if filtered by video name
            if (name && name !== '') {
                query += ` AND LOWER(title) LIKE $${params.length + 1}`;
                params.push(`%${name.toLowerCase()}%`);
            }
            //Cheking if filtered by creator
            if (creator && creator !== '') {
                query += ` AND LOWER(username) LIKE $${params.length + 1}`;
                params.push(`%${creator.toLowerCase()}%`);
            }
            //Cheking if filtered by category
            if (category && category !== '') {
                query += ` AND category LIKE $${params.length + 1}`;
                params.push(`%${category}%`);
            }
            //Fetching from db with the filters
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
            //Checking if user is an admin
            if (!req.session.admin) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
            //Checking if user is registered
            if (!req.session.username) {
                return res.sendFile(path.join(__dirname, '../public/html/main', 'error.html'));
            }
            //Return all the users who are not the current user
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
            //Request deletion of user
            const { username } = req.body;
            await db.query('DELETE FROM users WHERE username = $1', [username]);
            res.status(200).send('User deleted successfully');
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
        }
    });
};

const getContract = (app) => {
    app.get('/contract', async (req, res) => {
        try {
            //Get contract adress
            const Path = path.join(__dirname, '../public/smart_contracts/ignition/modules/contractData.json');
            fs.readFile(Path, "utf8", (err, data) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        console.error("File not found:", err.path);
                    } else {
                        console.error("Error reading file:", err);
                    }
                    return res.status(500).send("Error reading contract data.");
                }
                res.json(JSON.parse(data));
            });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
        }
    });
};



module.exports = {
    getVideoList,
    getUserList,
    deleteUserList,
    getContract
};  