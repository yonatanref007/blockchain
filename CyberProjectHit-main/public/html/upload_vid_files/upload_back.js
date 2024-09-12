const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3002;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|avi|mov|wmv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Videos Only!');
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.render('upload_new');
});

app.post('/upload', upload.single('video'), (req, res) => {
  if (req.file) {
    const title = req.body.title;
    const about = req.body.about;
    const categories = Array.isArray(req.body.category) ? req.body.category : [req.body.category];

    // Here you would typically save this information to a database
    console.log('Title:', title);
    console.log('About:', about);
    console.log('Categories:', categories);
    console.log('Video filename:', req.file.filename);

    res.send('Video uploaded successfully!');
  } else {
    res.status(400).send('No file uploaded or invalid file type.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});