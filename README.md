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
- **Study Stats**: Track tasks completed today and total study time. Stats automatically reset at midnight each day.
- **Intelligent Study Time Tracking**: Counts study time from either stopwatch or timer, preventing double-counting when both are running simultaneously.
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
   - Stats reset automatically at midnight (12:00 AM) each day.
   - Tasks are counted as completed only if finished on the current day.
   - Study time counts from running stopwatch and timer, but not both simultaneously to prevent double-counting.

7. **Simultaneous Stopwatch and Timer Usage**:
   - You can run both stopwatch and timer at the same time.
   - Study time will only count from one device to prevent inflated time tracking.
   - When one is paused or finished, the other automatically resumes study time counting.

## Installation

No installation required. Open `index.html` in a web browser.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)

## Author

JOOWON MAENG (joo1.maeng@gmail.com)