const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';

app.post('/auth/callback', async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ error: 'Token exchange failed' });
    }
});

app.get('/callback', (req, res) => {
    const code = req.query.code;
    res.redirect(`http://127.0.0.1:5500/?code=${code}`);
});

app.listen(3000, () => console.log('Auth server running on port 3000'));