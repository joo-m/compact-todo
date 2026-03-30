let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = localStorage.getItem("currentFilter") || "all";
let currentSort = localStorage.getItem("currentSort") || "asc";
let totalStudyTime = 0;
let totalStudyTimeThisWeek = 0;
let totalStudyTimeThisYear = 0;
let tasksCompletedToday = 0;
let isPomodoro = false;
let lastStopwatchUpdate = 0;
let lastTimerUpdate = 0;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setFilter(filter) {
    currentFilter = filter;
    localStorage.setItem("currentFilter", filter);
    updateFilterButtons();
    renderTasks();
}

function updateFilterButtons() {
    const filterButtons = document.querySelectorAll('.filters button');
    filterButtons.forEach(button => {
        const filterValue = button.getAttribute('onclick')?.match(/setFilter\('(.+)'\)/)?.[1];
        if (filterValue === currentFilter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark.toString());
}

function toggleFocusMode() {
    document.body.classList.toggle("focus");
    const isFocus = document.body.classList.contains("focus");
    localStorage.setItem("focusMode", isFocus.toString());
}

function toggleSpotifyBox() {
    document.getElementById("spotifyPlayer").classList.toggle("hidden");
    const isHidden = document.getElementById("spotifyPlayer").classList.contains("hidden");
    localStorage.setItem("spotifyBoxHidden", isHidden.toString());
    updateToggleButtons();
}

function toggleStudyStatsBox() {
    document.getElementById("studyStats").classList.toggle("hidden");
    const isHidden = document.getElementById("studyStats").classList.contains("hidden");
    localStorage.setItem("studyStatsHidden", isHidden.toString());
    updateToggleButtons();
}

function toggleStopwatchBox() {
    const stopwatch = document.querySelector(".side-tools .tool:nth-child(1)");
    stopwatch.classList.toggle("hidden");
    const isHidden = stopwatch.classList.contains("hidden");
    localStorage.setItem("stopwatchHidden", isHidden.toString());
    updateToggleButtons();
}

function toggleTimerBox() {
    const timer = document.querySelector(".side-tools .tool:nth-child(2)");
    timer.classList.toggle("hidden");
    const isHidden = timer.classList.contains("hidden");
    localStorage.setItem("timerHidden", isHidden.toString());
    updateToggleButtons();
}

function updateToggleButtons() {
    const toggleButtons = document.querySelectorAll('.toggles button');
    const spotifyBtn = toggleButtons[2];
    const statsBtn = toggleButtons[3];
    const stopwatchBtn = toggleButtons[4];
    const timerBtn = toggleButtons[5];
    
    if (document.getElementById("spotifyPlayer").classList.contains("hidden")) {
        spotifyBtn.classList.add("active");
    } else {
        spotifyBtn.classList.remove("active");
    }
    
    if (document.getElementById("studyStats").classList.contains("hidden")) {
        statsBtn.classList.add("active");
    } else {
        statsBtn.classList.remove("active");
    }
    
    const stopwatch = document.querySelector(".side-tools .tool:nth-child(1)");
    if (stopwatch && stopwatch.classList.contains("hidden")) {
        stopwatchBtn.classList.add("active");
    } else {
        stopwatchBtn.classList.remove("active");
    }
    
    const timer = document.querySelector(".side-tools .tool:nth-child(2)");
    if (timer && timer.classList.contains("hidden")) {
        timerBtn.classList.add("active");
    } else {
        timerBtn.classList.remove("active");
    }
}

function searchYouTube() {
    const query = document.getElementById('youtubeSearchInput').value.trim();
    if (!query) {
        alert('Enter a search keyword for YouTube.');
        return;
    }
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
}

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/, 
        /(?:youtu\.be\/)([\w-]{11})/
    ];
    for (const p of patterns) {
        const match = url.match(p);
        if (match && match[1]) return match[1];
    }
    if (/^[\w-]{11}$/.test(url)) return url;
    return null;
}

function watchYouTube() {
    const urlValue = document.getElementById('youtubeUrlInput').value.trim();
    if (!urlValue) {
        alert('Enter a YouTube URL or ID to watch.');
        return;
    }
    const videoId = extractYouTubeId(urlValue);
    if (!videoId) {
        alert('Could not parse YouTube video ID. Use a valid URL or ID.');
        return;
    }
    const player = document.getElementById('youtubePlayer');
    player.src = `https://www.youtube.com/embed/${videoId}`;
}

function startPomodoro() {
    isPomodoro = true;
    document.getElementById('timerMinutes').value = 25;
    document.getElementById('timerSeconds').value = 0;
    toggleTimer();
}

function getSelectedPriorities() {
    const checkedBoxes = document.querySelectorAll("#priorityFilterContainer input[type='checkbox']:checked");
    return Array.from(checkedBoxes).map(cb => cb.value);
}

function savePriorityFilters() {
    const selected = getSelectedPriorities();
    localStorage.setItem("selectedPriorities", JSON.stringify(selected));
}

// stopwatch state
let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchRunning = false;

function saveStopwatchState() {
    localStorage.setItem("stopwatchElapsed", String(stopwatchElapsed));
    localStorage.setItem("stopwatchRunning", String(stopwatchRunning));
    localStorage.setItem("stopwatchStart", String(stopwatchStart));
    localStorage.setItem("totalStudyTime", String(totalStudyTime));
    localStorage.setItem("totalStudyTimeThisWeek", String(totalStudyTimeThisWeek));
    localStorage.setItem("totalStudyTimeThisYear", String(totalStudyTimeThisYear));
}

function formatStopwatch(ms) {
    const date = new Date(ms);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    const millis = String(ms % 1000).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${millis}`;
}

function formatTime(ms) {
    const date = new Date(ms);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

function formatSongTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateStopwatchDisplay() {
    document.getElementById("stopwatchDisplay").textContent = formatStopwatch(stopwatchElapsed);
}

function startStopwatchInterval() {
    if (stopwatchInterval) return;
    lastStopwatchUpdate = Date.now();
    stopwatchInterval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastStopwatchUpdate;
        lastStopwatchUpdate = now;
        stopwatchElapsed = now - stopwatchStart;
        if (stopwatchRunning) {
            if (timerRunning) {
                totalStudyTime += delta / 2; // half speed when both active
                totalStudyTimeThisWeek += delta / 2;
                totalStudyTimeThisYear += delta / 2;
            } else {
                totalStudyTime += delta; // full speed when only stopwatch
                totalStudyTimeThisWeek += delta;
                totalStudyTimeThisYear += delta;
            }
        }
        updateStopwatchDisplay();
        updateStudyTimeDisplay();
        saveStopwatchState();
    }, 100);
}

function toggleStopwatch() {
    const startBtn = document.getElementById("stopwatchStart");
    if (stopwatchRunning) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchRunning = false;
        startBtn.textContent = "Start";
        saveStopwatchState();
        return;
    }

    stopwatchRunning = true;
    stopwatchStart = Date.now() - stopwatchElapsed;
    lastStopwatchUpdate = Date.now();
    startBtn.textContent = "Pause";
    saveStopwatchState();
    startStopwatchInterval();
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchRunning = false;
    stopwatchElapsed = 0;
    stopwatchStart = 0;
    document.getElementById("stopwatchStart").textContent = "Start";
    updateStopwatchDisplay();
    saveStopwatchState();
}

// timer state
let timerInterval = null;
let timerRemaining = 0;
let timerEndTime = 0;
let timerRunning = false;

function saveTimerState() {
    localStorage.setItem("timerRemaining", String(timerRemaining));
    localStorage.setItem("timerEndTime", String(timerEndTime));
    localStorage.setItem("timerRunning", String(timerRunning));
    localStorage.setItem("timerMinutes", document.getElementById("timerMinutes").value);
    localStorage.setItem("timerSeconds", document.getElementById("timerSeconds").value);
}

function formatTimer(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
}

function updateTimerDisplay() {
    document.getElementById("timerDisplay").textContent = formatTimer(Math.ceil(timerRemaining / 1000));
}

function startTimerInterval() {
    if (timerInterval) return;
    lastTimerUpdate = Date.now();
    timerInterval = setInterval(() => {
        if (timerRunning) {
            const now = Date.now();
            const delta = now - lastTimerUpdate;
            lastTimerUpdate = now;
            timerRemaining = Math.max(0, timerEndTime - now);
            if (stopwatchRunning) {
                totalStudyTime += delta / 2; // half speed when both active
                totalStudyTimeThisWeek += delta / 2;
                totalStudyTimeThisYear += delta / 2;
            } else {
                totalStudyTime += delta; // full speed when only timer
                totalStudyTimeThisWeek += delta;
                totalStudyTimeThisYear += delta;
            }
            updateTimerDisplay();
            updateStudyTimeDisplay();
            saveTimerState();

            if (timerRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerRunning = false;
                timerEndTime = 0;
                document.getElementById("timerStart").textContent = "Start";
                document.body.classList.add("timer-finish");
                setTimeout(() => document.body.classList.remove("timer-finish"), 700);
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                    new Notification("Timer finished!");
                }
                if (isPomodoro) {
                    alert("Pomodoro session complete! Take a 5-minute break.");
                    isPomodoro = false;
                }
                saveTimerState();
            }
        }
    }, 250);
}

function toggleTimer() {
    const startBtn = document.getElementById("timerStart");

    if (timerRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
        timerRemaining = Math.max(0, timerEndTime - Date.now());
        startBtn.textContent = "Start";
        saveTimerState();
        return;
    }

    if (timerRemaining <= 0) {
        const mins = Number(document.getElementById("timerMinutes").value) || 0;
        const secs = Number(document.getElementById("timerSeconds").value) || 0;
        const total = mins * 60 + secs;

        if (total <= 0) {
            alert("Enter a timer duration first.");
            return;
        }

        timerRemaining = total * 1000;
    }

    timerRunning = true;
    timerEndTime = Date.now() + timerRemaining;
    lastTimerUpdate = Date.now();
    startBtn.textContent = "Pause";
    saveTimerState();
    startTimerInterval();
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    timerRemaining = 0;
    timerEndTime = 0;
    document.getElementById("timerStart").textContent = "Start";
    updateTimerDisplay();
    saveTimerState();
}

function renderTasks() {
    updateFilterButtons();
    const selectedPriorities = getSelectedPriorities();
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    updateTasksToday();

    let visibleTasks = [...tasks];

    if (selectedPriorities.length > 0) {
        visibleTasks = visibleTasks.filter(task => selectedPriorities.includes(task.priority));
    }

    if (currentFilter === "active") {
        visibleTasks = visibleTasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        visibleTasks = visibleTasks.filter(task => task.completed);
    }

    visibleTasks.sort((a, b) => {
        if (currentSort === "asc") {
            const aHasDate = a.date ? 0 : 1;
            const bHasDate = b.date ? 0 : 1;
            if (aHasDate !== bHasDate) return aHasDate - bHasDate;
            if (!a.date || !b.date) return 0;
            return new Date(a.date) - new Date(b.date);
        }

        if (currentSort === "desc") {
            const aHasDate = a.date ? 0 : 1;
            const bHasDate = b.date ? 0 : 1;
            if (aHasDate !== bHasDate) return bHasDate - aHasDate;
            if (!a.date || !b.date) return 0;
            return new Date(b.date) - new Date(a.date);
        }

        const aCreated = a.createdAt || 0;
        const bCreated = b.createdAt || 0;

        if (currentSort === "recent") return bCreated - aCreated;
        if (currentSort === "old") return aCreated - bCreated;

        const aHasDate = a.date ? 0 : 1;
        const bHasDate = b.date ? 0 : 1;
        if (aHasDate !== bHasDate) return aHasDate - bHasDate;
        if (!a.date || !b.date) return 0;
        return new Date(a.date) - new Date(b.date);
    });

    visibleTasks.forEach((task) => {
        const li = document.createElement("li");
        li.classList.add(task.priority);

        if (task.completed) li.classList.add("completed");

        const header = document.createElement("div");
        header.className = "task-header";

        const leftPart = document.createElement("div");
        leftPart.className = "task-left";

        const text = document.createElement("span");
        text.textContent = task.text;

        text.onclick = () => {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedAt = Date.now();
                li.classList.add('completing');
                li.addEventListener('animationend', () => {
                    saveTasks();
                    renderTasks();
                }, { once: true });
            } else {
                saveTasks();
                renderTasks();
            }
        };

        const priorityBtn = document.createElement("button");
        priorityBtn.textContent = task.priority.charAt(0).toUpperCase();
        priorityBtn.className = "priority-btn";
        priorityBtn.title = `Priority: ${task.priority}`;
        priorityBtn.onclick = () => {
            const priorities = ['high', 'medium', 'low', 'optional'];
            const currentIndex = priorities.indexOf(task.priority);
            const nextIndex = (currentIndex + 1) % priorities.length;
            task.priority = priorities[nextIndex];
            saveTasks();
            renderTasks();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.className = "delete-btn";

        deleteBtn.onclick = () => {
            const originalIndex = tasks.indexOf(task);
            if (originalIndex > -1) {
                li.classList.add('deleting');
                li.addEventListener('animationend', () => {
                    tasks.splice(originalIndex, 1);
                    saveTasks();
                    renderTasks();
                }, { once: true });
            }
        };

        leftPart.appendChild(priorityBtn);
        leftPart.appendChild(text);
        header.appendChild(leftPart);
        header.appendChild(deleteBtn);

        const date = document.createElement("div");
        date.className = "date";
        date.style.cursor = "pointer";
        date.textContent = task.date ? "Due: " + task.date : "(click to set date)";
        
        date.onclick = () => {
            const newDate = prompt("Enter due date (format: YYYY-MM-DD) or leave blank to remove:", task.date || "");
            if (newDate !== null) {
                task.date = newDate;
                saveTasks();
                renderTasks();
            }
        };

        li.appendChild(header);
        li.appendChild(date);
        list.appendChild(li);
        
        // Add animation for new tasks
        li.classList.add('new-task');
        li.addEventListener('animationend', () => {
            li.classList.remove('new-task');
        }, { once: true });
    });
}

function updateTasksToday() {
    const today = new Date().toDateString();
    tasksCompletedToday = tasks.filter(task => task.completed && task.completedAt && new Date(task.completedAt).toDateString() === today).length;
    document.getElementById('tasksToday').textContent = tasksCompletedToday;
    updatePriorityStats();
}

function updatePriorityStats() {
    const today = new Date().toDateString();
    const todaysTasks = tasks.filter(task => new Date(task.createdAt).toDateString() === today || !task.date);
    
    const priorities = ['high', 'medium', 'low', 'optional'];
    let totalAllTasks = tasks.length;
    let totalCompleted = tasks.filter(task => task.completed).length;
    let importantTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'medium');
    let importantCompleted = importantTasks.filter(task => task.completed).length;
    
    priorities.forEach(priority => {
        const allTasksWithPriority = tasks.filter(task => task.priority === priority);
        const completedWithPriority = allTasksWithPriority.filter(task => task.completed).length;
        
        document.getElementById(`${priority}Completed`).textContent = completedWithPriority;
        document.getElementById(`${priority}Total`).textContent = allTasksWithPriority.length;
    });
    
    // Important tasks (high priority) stats
    const importantPercent = importantTasks.length > 0 ? Math.round((importantCompleted / importantTasks.length) * 100) : 0;
    document.getElementById('importantTasksCompletedPercent').textContent = importantPercent;
    document.getElementById('importantTasksCompletedFraction').textContent = importantCompleted;
    document.getElementById('importantTasksTotal').textContent = importantTasks.length;
    
    // All tasks stats
    const percentComplete = totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;
    document.getElementById('allTasksCompletedPercent').textContent = percentComplete;
    document.getElementById('allTasksCompletedFraction').textContent = totalCompleted;
    document.getElementById('allTasksTotal').textContent = totalAllTasks;
}

function updateStudyTimeDisplay() {
    document.getElementById('studyTime').textContent = formatTime(totalStudyTime);
    document.getElementById('studyTimeWeek').textContent = formatTime(totalStudyTimeThisWeek);
    document.getElementById('studyTimeYear').textContent = formatTime(totalStudyTimeThisYear);
}

function sortTasks() {
    currentSort = document.getElementById("sortOption").value;
    localStorage.setItem("currentSort", currentSort);
    renderTasks();
}

function addTask() {
    const input = document.getElementById("taskInput");
    const dateInput = document.getElementById("dueDate");
    const priority = document.getElementById("priority");

    if (input.value.trim() === "") return;

    const newTask = {
        text: input.value.trim(),
        date: dateInput.value,
        priority: priority.value,
        completed: false,
        createdAt: Date.now()
    };

    tasks.push(newTask);

    input.value = "";
    dateInput.value = "";

    saveTasks();
    renderTasks();
}

function attachPriorityCheckboxListeners() {
    const checkboxes = document.querySelectorAll("#priorityFilterContainer input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            renderTasks();
            savePriorityFilters();
        });
    });
}

// "enter" keyboard key
document.getElementById("taskInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Daily, Weekly, and Yearly reset
function checkAndResetDaily() {
    const lastResetDate = localStorage.getItem("lastResetDate");
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
        totalStudyTime = 0;
        tasksCompletedToday = 0;
        localStorage.setItem("lastResetDate", today);
        localStorage.setItem("totalStudyTime", "0");
    }
}

function checkAndResetWeekly() {
    const lastResetWeek = localStorage.getItem("lastResetWeek");
    const currentWeek = getWeekNumber();
    
    if (lastResetWeek !== currentWeek) {
        totalStudyTimeThisWeek = 0;
        localStorage.setItem("lastResetWeek", currentWeek);
        localStorage.setItem("totalStudyTimeThisWeek", "0");
    }
}

function checkAndResetYearly() {
    const lastResetYear = localStorage.getItem("lastResetYear");
    const currentYear = new Date().getFullYear().toString();
    
    if (lastResetYear !== currentYear) {
        totalStudyTimeThisYear = 0;
        localStorage.setItem("lastResetYear", currentYear);
        localStorage.setItem("totalStudyTimeThisYear", "0");
    }
}

function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay / 7) + "_" + now.getFullYear();
}


// persistence
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}
if (localStorage.getItem("focusMode") === "true") {
    document.body.classList.add("focus");
}

// Restore hidden state
if (localStorage.getItem("spotifyBoxHidden") === "true") {
    document.getElementById("spotifyPlayer").classList.add("hidden");
}
if (localStorage.getItem("studyStatsHidden") === "true") {
    document.getElementById("studyStats").classList.add("hidden");
}
if (localStorage.getItem("stopwatchHidden") === "true") {
    const stopwatch = document.querySelector(".side-tools .tool:nth-child(1)");
    stopwatch.classList.add("hidden");
}
if (localStorage.getItem("timerHidden") === "true") {
    const timer = document.querySelector(".side-tools .tool:nth-child(2)");
    timer.classList.add("hidden");
}

checkAndResetDaily();
checkAndResetWeekly();
checkAndResetYearly();

document.getElementById("sortOption").value = currentSort;

const savedPriorities = JSON.parse(localStorage.getItem("selectedPriorities")) || ["optional", "low", "medium", "high"];
const checkboxes = document.querySelectorAll("#priorityFilterContainer input[type='checkbox']");
checkboxes.forEach(checkbox => {
    if (savedPriorities.includes(checkbox.value)) {
        checkbox.checked = true;
    } else {
        checkbox.checked = false;
    }
});

if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
}

function loadTimerAndStopwatchState() {
    totalStudyTime = Number(localStorage.getItem("totalStudyTime")) || 0;
    totalStudyTimeThisWeek = Number(localStorage.getItem("totalStudyTimeThisWeek")) || 0;
    totalStudyTimeThisYear = Number(localStorage.getItem("totalStudyTimeThisYear")) || 0;
    stopwatchElapsed = Number(localStorage.getItem("stopwatchElapsed")) || 0;
    stopwatchRunning = localStorage.getItem("stopwatchRunning") === "true";
    stopwatchStart = Number(localStorage.getItem("stopwatchStart")) || 0;

    if (stopwatchRunning) {
        if (stopwatchStart > 0) {
            stopwatchElapsed = Math.max(0, Date.now() - stopwatchStart);
        }
        document.getElementById("stopwatchStart").textContent = "Pause";
        startStopwatchInterval();
        lastStopwatchUpdate = Date.now();
    } else {
        document.getElementById("stopwatchStart").textContent = "Start";
    }

    timerRemaining = Number(localStorage.getItem("timerRemaining")) || 0;
    timerEndTime = Number(localStorage.getItem("timerEndTime")) || 0;
    timerRunning = localStorage.getItem("timerRunning") === "true";

    const savedMinutes = localStorage.getItem("timerMinutes");
    const savedSeconds = localStorage.getItem("timerSeconds");
    if (savedMinutes !== null) document.getElementById("timerMinutes").value = savedMinutes;
    if (savedSeconds !== null) document.getElementById("timerSeconds").value = savedSeconds;

    if (timerRunning && timerEndTime > 0) {
        timerRemaining = Math.max(0, timerEndTime - Date.now());
        if (timerRemaining <= 0) {
            timerRunning = false;
            timerEndTime = 0;
        } else {
            document.getElementById("timerStart").textContent = "Pause";
            startTimerInterval();
            lastTimerUpdate = Date.now();
        }
    } else {
        document.getElementById("timerStart").textContent = "Start";
    }

    updateStopwatchDisplay();
    updateTimerDisplay();
}

// Spotify Integration
const SPOTIFY_CLIENT_ID = '65d8610a85544a1082be109c18754d21';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/callback'
let spotifyAccessToken = localStorage.getItem('spotifyAccessToken');
let spotifyCurrentTrack = null;
let spotifyCurrentArtist = null;
let spotifyPlaybackState = false;

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function getSpotifyAuthUrl() {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state', 'user-library-read'];
    return `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}`;
}

function connectSpotify() {
    if (SPOTIFY_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
        alert('Please set your Spotify Client ID in script.js first');
        return;
    }
    window.location.href = getSpotifyAuthUrl();
}

function checkSpotifyAuth() {
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');
        if (token) {
            spotifyAccessToken = token;
            localStorage.setItem('spotifyAccessToken', token);
            window.location.href = window.location.href.split('?')[0].split('#')[0];
            showSpotifyPlayer();
            return;
        }
    }
    
    if (search) {
        const params = new URLSearchParams(search.substring(1));
        const code = params.get('code');
        const error = params.get('error');
        
        if (error) {
            alert(`Spotify authentication failed: ${error}`);
            window.location.href = window.location.href.split('?')[0].split('#')[0];
            return;
        }
        
        if (code) {
            fetch('http://127.0.0.1:3000/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            .then(res => res.json())
            .then(data => {
                console.log('Token received:', data);

                spotifyAccessToken = data.access_token;
                localStorage.setItem('spotifyAccessToken', data.access_token);

                // clean URL (remove ?code=...)
                window.history.replaceState({}, document.title, window.location.pathname);

                showSpotifyPlayer();
                updateCurrentTrack();
            })
            .catch(err => {
                console.error('Auth error:', err);
            });

            return;
        }
    }
    
    if (spotifyAccessToken) {
        showSpotifyPlayer();
        updateCurrentTrack();
    }
}

function showSpotifyPlayer() {
    document.getElementById('spotifyConnectBtn').style.display = 'none';
    document.getElementById('spotifyContent').style.display = 'flex';
}

function hideSpotifyPlayer() {
    document.getElementById('spotifyConnectBtn').style.display = 'block';
    document.getElementById('spotifyContent').style.display = 'none';
}

async function updateCurrentTrack() {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
        });
        if (response.status === 204) {
            document.getElementById('currentTrack').textContent = 'Nothing playing';
            document.getElementById('albumArt').src = '';
            spotifyPlaybackState = false;
            document.getElementById('playPauseBtn').textContent = '▶';
            setTimeout(updateCurrentTrack, 5000);
            return;
        }
        if (response.status === 401) {
            spotifyAccessToken = null;
            localStorage.removeItem('spotifyAccessToken');
            hideSpotifyPlayer();
            return;
        }
        if (!response.ok) {
            console.error('Error fetching current track, status:', response.status);
            setTimeout(updateCurrentTrack, 5000);
            return;
        }

        const data = await response.json();
        if (data && data.item) {
            const trackName = data.item.name;
            const artist = data.item.artists[0].name;
            spotifyCurrentTrack = trackName;
            spotifyCurrentArtist = artist;
            document.getElementById('currentTrack').textContent = `${trackName} by ${artist}`;
            if (data.item.album && data.item.album.images && data.item.album.images[0]) {
                document.getElementById('albumArt').src = data.item.album.images[0].url;
            } else {
                document.getElementById('albumArt').src = '';
            }
            spotifyPlaybackState = data.is_playing;
            document.getElementById('playPauseBtn').textContent = spotifyPlaybackState ? '⏸' : '▶';
            const progressMs = data.progress_ms || 0;
            const durationMs = data.item.duration_ms;
            document.getElementById('progressSlider').max = durationMs;
            document.getElementById('progressSlider').value = progressMs;
            document.getElementById('bottomProgressSlider').max = durationMs;
            document.getElementById('bottomProgressSlider').value = progressMs;
            document.getElementById('currentTime').textContent = formatSongTime(progressMs);
            document.getElementById('totalTime').textContent = formatSongTime(durationMs);
            if (data.device && data.device.volume_percent !== undefined) {
                document.getElementById('volumeSlider').value = data.device.volume_percent;
            }
            updateMarquee();
            updateQueue();
        } else {
            spotifyCurrentTrack = null;
            spotifyCurrentArtist = null;
            document.getElementById('currentTrack').textContent = 'Nothing playing';
            document.getElementById('albumArt').src = '';
            spotifyPlaybackState = false;
            document.getElementById('playPauseBtn').textContent = '▶';
            document.getElementById('progressSlider').max = 100;
            document.getElementById('progressSlider').value = 0;
            document.getElementById('bottomProgressSlider').max = 100;
            document.getElementById('bottomProgressSlider').value = 0;
            document.getElementById('currentTime').textContent = '0:00';
            document.getElementById('totalTime').textContent = '0:00';
            updateMarquee();
            updateQueue();
        }
    } catch (error) {
        console.error('Error fetching current track:', error);
    }
    setTimeout(updateCurrentTrack, 1000);
}

function updateMarquee() {
    const marqueeContent = document.querySelector('.marquee-content');
    if (!spotifyCurrentTrack || !spotifyCurrentArtist) {
        marqueeContent.innerHTML = '';
        return;
    }
    const text = `‎ ‎ ‎ ‎ ‎ now playing: ${spotifyCurrentTrack} by ${spotifyCurrentArtist} `;
    const repeated = text.repeat(50);
    marqueeContent.innerHTML = `<span>${repeated}</span><span>${repeated}</span>`;
}

async function seekPosition(positionMs) {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`
            }
        });
        if (!response.ok) {
            console.error('Error seeking:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error seeking position:', error);
    }
}

async function setVolume(volume) {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`
            }
        });
        if (!response.ok) {
            console.error('Error setting volume:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error setting volume:', error);
    }
}

async function updateQueue() {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
            headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
        });
        if (response.ok) {
            const data = await response.json();
            if (data.queue && data.queue.length > 0) {
                const next = data.queue[0];
                document.getElementById('nextTrack').textContent = `${next.name} by ${next.artists[0].name}`;
            } else {
                document.getElementById('nextTrack').textContent = 'None';
            }
        } else {
            document.getElementById('nextTrack').textContent = 'None';
        }
    } catch (error) {
        console.error('Error fetching queue:', error);
        document.getElementById('nextTrack').textContent = 'None';
    }
}

async function togglePlayback() {
    if (!spotifyAccessToken) return;
    try {
        const endpoint = spotifyPlaybackState ? 'https://api.spotify.com/v1/me/player/pause' : 'https://api.spotify.com/v1/me/player/play';
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.error('Error toggling playback:', response.status, await response.text());
            if (response.status === 404) {
                alert('Cannot control playback: no active device. Open the Spotify app on a device and play any track first.');
            }
            return;
        }

        spotifyPlaybackState = !spotifyPlaybackState;
        document.getElementById('playPauseBtn').textContent = spotifyPlaybackState ? '⏸' : '▶';
        await updateCurrentTrack();
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

async function nextTrack() {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/next', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.error('Error skipping to next track:', response.status, await response.text());
            if (response.status === 404) alert('No active Spotify playback device found. Open Spotify and play first.');
            return;
        }
        await updateCurrentTrack();
    } catch (error) {
        console.error('Error skipping to next track:', error);
    }
}

async function previousTrack() {
    if (!spotifyAccessToken) return;
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${spotifyAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.error('Error skipping to previous track:', response.status, await response.text());
            if (response.status === 404) alert('No active Spotify playback device found. Open Spotify and play first.');
            return;
        }
        await updateCurrentTrack();
    } catch (error) {
        console.error('Error skipping to previous track:', error);
    }
}

document.getElementById('progressSlider').addEventListener('input', (e) => {
    seekPosition(e.target.value);
});

document.getElementById('bottomProgressSlider').addEventListener('input', (e) => {
    seekPosition(e.target.value);
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    setVolume(e.target.value);
});

loadTimerAndStopwatchState();
updateStudyTimeDisplay();
updateTasksToday();
attachPriorityCheckboxListeners();
checkSpotifyAuth();
updateToggleButtons();
renderTasks();
updateMarquee();
