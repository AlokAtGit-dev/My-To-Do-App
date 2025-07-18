document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const totalTasks = document.getElementById('total-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const clearAllBtn = document.getElementById('clear-all');
    const themeToggleBtn = document.getElementById('theme-toggle');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentDate = dueDateInput.value || 'No Date';

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    themeToggleBtn.textContent = savedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';

    // Format date to YYYY-MM-DD for consistency
    function formatDate(date) {
        return date ? new Date(date).toISOString().split('T')[0] : 'No Date';
    }

    // Check if a date is overdue (based on current date: July 19, 2025, 02:03 AM IST)
    function isOverdue(date) {
        if (date === 'No Date') return false;
        const today = new Date('2025-07-19T02:03:00+05:30'); // Current date and time
        today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
        return new Date(date) < today;
    }

    // Group tasks by due date
    function groupTasksByDate() {
        const grouped = {};
        tasks.forEach(task => {
            const date = task.dueDate;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(task);
        });
        return grouped;
    }

    // Render tasks grouped by date
    function renderTasks() {
        taskList.innerHTML = '';
        const groupedTasks = groupTasksByDate();
        Object.keys(groupedTasks).sort().forEach(date => {
            const section = document.createElement('div');
            section.className = `date-section ${isOverdue(date) ? 'overdue' : ''}`;
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date === 'No Date' ? 'No Due Date' : new Date(date).toLocaleDateString();
            dateHeader.innerHTML += '<span class="toggle-icon"></span>';
            dateHeader.addEventListener('click', () => {
                section.classList.toggle('collapsed');
                if (section.classList.contains('collapsed')) {
                    section.classList.add('one-task');
                } else {
                    section.classList.remove('one-task');
                }
            });
            section.appendChild(dateHeader);
            const ul = document.createElement('ul');
            ul.className = 'task-list';
            groupedTasks[date].forEach((task, index) => {
                const globalIndex = tasks.findIndex(t => t.text === task.text && t.dueDate === task.dueDate && t.completed === task.completed);
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${globalIndex})">
                    <span>${task.text}</span>
                    <button onclick="deleteTask(${globalIndex})">Delete</button>
                `;
                ul.appendChild(li);
            });
            section.appendChild(ul);
            taskList.appendChild(section);
        });
        updateStats();
        saveTasks();
    }

    // Add new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Please enter a task!');
            return;
        }
        tasks.push({ text, completed: false, dueDate: currentDate });
        taskInput.value = '';
        renderTasks();
    }

    // Clear dashboard (task input and displayed tasks for current date)
    function clearDashboard() {
        taskInput.value = '';
        tasks = tasks.filter(task => task.dueDate !== currentDate);
        renderTasks();
    }

    // Handle date change
    function handleDateChange() {
        const newDate = formatDate(dueDateInput.value);
        if (newDate !== currentDate) {
            clearDashboard();
            currentDate = newDate;
        }
    }

    // Toggle task completion
    window.toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    };

    // Delete task
    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        renderTasks();
    };

    // Clear all tasks (across all dates)
    function clearAll() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            taskInput.value = '';
            currentDate = dueDateInput.value || 'No Date';
            renderTasks();
        }
    }

    // Update dashboard stats
    function updateStats() {
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = tasks.filter(task => task.completed).length;
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Toggle theme
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        const theme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        themeToggleBtn.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    dueDateInput.addEventListener('change', handleDateChange);
    clearAllBtn.addEventListener('click', clearAll);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Initial render
    renderTasks();
});