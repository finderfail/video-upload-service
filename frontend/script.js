const API_URL = 'http://localhost:3000';

let token = '';
let currentUser  = '';
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        token = response.data.token;
        currentUser  = username; 
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
    formData.append('author', currentUser ); 

    try {
        await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        alert('Видео загружено!');
        loadVideos(); 
    } catch (error) {
        alert('Ошибка загрузки видео: ' + error.response.data.message);
    }
});
