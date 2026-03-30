# To-Do App

A comprehensive to-do list application with task management, timers, stopwatch, YouTube, and study-focused features optimized for student productivity.

## Features

- **Task Management**: Add, edit, delete, and filter tasks by priority and status.
- **Persistence**: All tasks, filters, and settings are saved in local storage.
- **Sorting**: Sort tasks by date (ascending/descending) or by creation time.
- **Dark Mode**: Toggle between light and dark themes with visual indicators.
- **Focus Mode**: Hide YouTube tool to minimize distractions during study sessions.
- **Stopwatch**: Start, pause, and reset a stopwatch with millisecond precision, tracking total study time.
- **Timer**: Set and run countdown timers with notifications, including Pomodoro mode.
- **Pomodoro Timer**: Quick 25-minute study sessions with break reminders.
- **Study Stats**: Track tasks completed today and total study time. Stats automatically reset at midnight each day. Displays important tasks (high priority) completion percentage prominently.
- **Intelligent Study Time Tracking**: Counts study time from either stopwatch or timer, preventing double-counting when both are running simultaneously.
- **Spotify Music Player**: Connect your Spotify account and control music playback directly in the app. View currently playing track with album art and skip to next/previous tracks.
- **YouTube**: Search YouTube or watch specific videos directly in the app (can be hidden in Focus Mode).
- **Animated Background**: Subtle animated ASCII character background for aesthetic appeal.
- **Real-time Updates**: Study time and task completion counts update in real-time as you work.

## Usage

1. **Adding Tasks**:
   - Enter task text, select due date, choose priority, and click "Add".
   - Press Enter in the task input to add quickly.

2. **Managing Tasks**:
   - Click on task text to mark as completed.
   - Click "X" to delete a task.

3. **Filtering and Sorting**:
   - Use "All", "Active", "Completed" buttons to filter tasks.
   - Select priority checkboxes to show/hide priorities.
   - Choose sorting option from the dropdown.

4. **Tools**:
   - **Stopwatch**: Click "Start" to begin, "Pause" to stop, "Reset" to clear. Tracks study time.
   - **Timer**: Enter minutes and seconds, click "Start" to begin countdown. Use "Pomodoro" for 25-min sessions.
   - **YouTube**: Enter search query and click "Search" (opens in new tab), or enter video URL/ID and click "Watch". Hide with "hide youtube" button.

5. **Modes and Toggles**:
   - **Dark Mode**: Click "toggle dark mode" button (button darkens when active). All UI elements adapt for better dark mode visibility.
   - **Focus Mode**: Click "hide youtube" button to hide distractions (button darkens when active).

6. **Study Stats**: View daily completed tasks and total study time in the stats section.
   - Shows important tasks (High Priority) completion percentage in larger, bold text
   - Stats reset automatically at midnight (12:00 AM) each day.
   - Tasks are counted as completed only if finished on the current day.
   - Study time counts from running stopwatch and timer, but not both simultaneously to prevent double-counting.

7. **Spotify Music Player**:
   - Click "Connect to Spotify" button to authorize your Spotify account.
   - View currently playing track with album art.
   - Use play/pause, next, and previous buttons to control playback.
   - Click "Logout" to disconnect your Spotify account.
   - **Note**: Requires Spotify Web API credentials setup in the app configuration.
   - **Important**: Ensure you have an active Spotify playback device (desktop/mobile) running in the same account; otherwise controls return 404 and the app shows "Nothing playing".
   - If you get playback-control failures, open the Spotify desktop/mobile app and start a track first, then use the app buttons.
   - You can run both stopwatch and timer at the same time.
   - Study time will only count from one device to prevent inflated time tracking.
   - When one is paused or finished, the other automatically resumes study time counting.

## Installation

No installation required. Open `index.html` in a web browser.

## Spotify Setup

The app uses Spotify's Authorization Code Flow with PKCE for security. Due to OAuth2 requirements, **a backend service is needed to exchange the authorization code for an access token**.

### Option 1: Simple Backend Setup (Recommended)

**Requirements**: Node.js installed

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in or create a new Spotify account
3. Create a new app
4. Copy your **Client ID** and **Client Secret**
5. In Spotify Dashboard, add your redirect URI (this is where Spotify will send the authorization code).
   Example for local development: http://127.0.0.1:3000/callback
   You can choose a different port or localhost address, but it must match exactly in your server config.
6. Create a file named `server.js` in your project root with the following code:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:3000/callback'; // Must match your Spotify App Redirect URI
const FRONTEND_URI = process.env.FRONTEND_URI;

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
    res.redirect(`${FRONTEND_URI}/?code=${code}`);
});

app.listen(3000, () => console.log('Auth server running on port 3000'));
```

7. Install dependencies: `npm install express cors axios dotenv`
8. Create `.env` file with your credentials (replace your_client_id and your_client_secret with your client id & secret) (do NOT push to GitHub! your client secret MUST NOT BE REVEALED TO OTHERS):
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
FRONTEND_URI=http://127.0.0.1:5500
```
9. Run: `node server.js`
10. Update the app to use `http://127.0.0.1:3000/callback` as redirect URI
11. In `script.js`, update SPOTIFY_CLIENT_ID with your Client ID:
```
const SPOTIFY_CLIENT_ID = 'your_client_id_here';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/callback';
```
12. Open your index.html in a browser (`http://127.0.0.1:5500` or your chosen frontend port) and click "Connect to Spotify" to authorize your account.

***Notes for users***
You must have an active Spotify playback device (desktop or mobile) running the same account; otherwise, the player will show “Nothing playing” and controls wont work.
If playback fails, start a track in the Spotify app first, then try controlling it from the web app.
If you change ports or URLs, update both the Spotify Dashboard redirect URI and the FRONTEND_URI in .env.
.env must not be pushed to GitHub!!! Your server.js is safe to share; it only reads secrets from .env.
### Option 2: Use Without Full Authorization (For Testing)

If you just want to see the player UI without real Spotify control:
- Skip the backend setup
- The app shows a notification that backend is needed - this is expected behavior

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)

## Author

JOOWON MAENG (joo1.maeng@gmail.com)