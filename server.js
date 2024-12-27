const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 }, // Максимум 1 ГБ
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mkv|avi|mov/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Ошибка: файл должен быть видео формата mp4, mkv, avi или mov!');
  },
});

const usersFilePath = path.join(__dirname, 'users.json');

const readUsersFromFile = () => {
  if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  }
  return {};
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const videosFilePath = path.join(__dirname, 'videos.json');

const readVideosFromFile = () => {
  if (fs.existsSync(videosFilePath)) {
    const data = fs.readFileSync(videosFilePath);
    return JSON.parse(data);
  }
  return [];
};

const writeVideosToFile = (videos) => {
  fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2));
};

let users = readUsersFromFile();

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  users[username] = password; 
  writeUsersToFile(users);
  res.status(201).json({ message: 'Пользователь зарегистрирован' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Неверные учетные данные' });
});


app.post('/upload', upload.single('video'), (req, res) => {
  const { title, author } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Ошибка загрузки видео' });
  }
  const videoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  
  const uniqueId = uuidv4();

  const videos = readVideosFromFile();
  videos.push({ id: uniqueId, title, url: videoUrl, author }); 
  writeVideosToFile(videos);
  res.status(201).json({ message: 'Видео загружено ', videoUrl });
});


app.get('/videos', (req, res) => {
  const videos = readVideosFromFile();
  res.json(videos);
});

app.delete('/videos/:id', (req, res) => {
    const { id } = req.params;
    const videos = readVideosFromFile();
    const updatedVideos = videos.filter(video => video.id !== id);
    if (videos.length === updatedVideos.length) {
      return res.status(404).json({ message: 'Видео не найдено' });
    }
    writeVideosToFile(updatedVideos);
    res.status(200).json({ message: 'Видео удалено' });
});

app.listen(PORT, 'localhost', () => {
  console.log(`Сервер запущен на http://150.241.86.201:${PORT}`);
});