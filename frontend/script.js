const API_URL = 'http://localhost:3000';

// слишком тупой чтобы это фулл сам делать


let token = '';
let currentUser  = ''; // Переменная для хранения текущего пользователя

document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        token = response.data.token;
        currentUser  = username; // Сохраняем ник пользователя
        alert('Успешный вход!');
        document.getElementById('auth').style.display = 'none';
        document.getElementById('upload').style.display = 'block';
        document.getElementById('videoList').style.display = 'block';
        loadVideos();
    } catch (error) {
        alert('Ошибка входа: ' + error.response.data.message);
    }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const title = document.getElementById('videoTitle').value;
    const file = document.getElementById('videoFile').files[0];

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('author', currentUser ); // Используем ник текущего пользователя

    try {
        await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        alert('Видео загружено!');
        loadVideos(); // Загружаем список видео после успешной загрузки
    } catch (error) {
        alert('Ошибка загрузки видео: ' + error.response.data.message);
    }
});

const loadVideos = async () => {
    try {
        const response = await axios.get(`${API_URL}/videos`);
        const videos = response.data;
        const videoList = document.getElementById('videos');
        videoList.innerHTML = '';

        videos.forEach(video => {
            const li = document.createElement('li');

            // Создаем кликабельную ссылку
            const link = document.createElement('a');
            link.href = `video.html?url=${encodeURIComponent('http://localhost:3000/uploads/' + video.url)}`; // Переход на страницу просмотра 1735310414178.MP4
            link.textContent = video.title;
            link.target = '_blank'; // Открывать в новой вкладке
            link.style.marginRight = '10px'; // Отступ между ссылкой и кнопкой

            // Создаем кнопку для копирования ссылки
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Скопировать ссылку';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(video.url).then(() => {
                    alert('Ссылка скопирована в буфер обмена!');
                });
            };

            li.appendChild(link);
            li.appendChild(copyButton);
            videoList.appendChild(li);
        });

        document.getElementById('videoList').style.display = 'block'; // Показываем список видео
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
    }
};