let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = localStorage.getItem("currentFilter") || "all";
let currentSort = localStorage.getItem("currentSort") || "asc";
let totalStudyTime = 0;
let tasksCompletedToday = 0;
let isPomodoro = false;

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

function updateStopwatchDisplay() {
    document.getElementById("stopwatchDisplay").textContent = formatStopwatch(stopwatchElapsed);
}

function startStopwatchInterval() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        stopwatchElapsed = Date.now() - stopwatchStart;
        if (stopwatchRunning && !timerRunning) totalStudyTime += 100;
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
    timerInterval = setInterval(() => {
        if (timerRunning) {
            timerRemaining = Math.max(0, timerEndTime - Date.now());
            if (timerRunning && !stopwatchRunning) totalStudyTime += 250;
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

        const text = document.createElement("span");
        text.textContent = task.text;

        text.onclick = () => {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedAt = Date.now();
            }
            saveTasks();
            renderTasks();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.className = "delete-btn";

        deleteBtn.onclick = () => {
            const originalIndex = tasks.indexOf(task);
            if (originalIndex > -1) {
                tasks.splice(originalIndex, 1);
                saveTasks();
                renderTasks();
            }
        };

        header.appendChild(text);
        header.appendChild(deleteBtn);

        const date = document.createElement("div");
        date.className = "date";
        date.textContent = task.date ? "Due: " + task.date : "";

        li.appendChild(header);
        li.appendChild(date);
        list.appendChild(li);
    });
}

function updateTasksToday() {
    const today = new Date().toDateString();
    tasksCompletedToday = tasks.filter(task => task.completed && task.completedAt && new Date(task.completedAt).toDateString() === today).length;
    document.getElementById('tasksToday').textContent = tasksCompletedToday;
}

function updateStudyTimeDisplay() {
    document.getElementById('studyTime').textContent = formatTime(totalStudyTime);
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

// Daily reset at 12am
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

// persistence
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}
if (localStorage.getItem("focusMode") === "true") {
    document.body.classList.add("focus");
}

checkAndResetDaily();

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
    stopwatchElapsed = Number(localStorage.getItem("stopwatchElapsed")) || 0;
    stopwatchRunning = localStorage.getItem("stopwatchRunning") === "true";
    stopwatchStart = Number(localStorage.getItem("stopwatchStart")) || 0;

    if (stopwatchRunning) {
        if (stopwatchStart > 0) {
            stopwatchElapsed = Math.max(0, Date.now() - stopwatchStart);
        }
        document.getElementById("stopwatchStart").textContent = "Pause";
        startStopwatchInterval();
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
        }
    } else {
        document.getElementById("timerStart").textContent = "Start";
    }

    updateStopwatchDisplay();
    updateTimerDisplay();
}

loadTimerAndStopwatchState();
updateStudyTimeDisplay();
updateTasksToday();
attachPriorityCheckboxListeners();
renderTasks();
