document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    let tasks = JSON.parse(localStorage.getItem('analog-tasks')) || {
        today: [],
        next: [],
        someday: []
    };
    
    // Initialize notes
    let notes = JSON.parse(localStorage.getItem('analog-notes')) || {
        today: '',
        next: '',
        someday: ''
    };
    
    // Render initial tasks
    renderTasks('today');
    renderTasks('next');
    renderTasks('someday');
    
    // Load notes
    document.querySelectorAll('.notes-area').forEach(textarea => {
        const cardType = textarea.dataset.card;
        textarea.value = notes[cardType] || '';
        
        // Save notes on change
        textarea.addEventListener('input', function() {
            notes[cardType] = this.value;
            saveNotes();
        });
    });
    
    // Handle card flipping
    document.querySelectorAll('.flip-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardId = this.dataset.card;
            document.getElementById(`${cardId}-card`).classList.toggle('flipped');
        });
    });
    
    // Handle add task buttons
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardType = this.dataset.card;
            addNewTask(cardType);
        });
    });
    
    // Handle clear completed buttons
    document.querySelectorAll('.clear-completed-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardType = this.dataset.card;
            clearCompletedTasks(cardType);
        });
    });
    
    // Status dropdown position tracking
    let currentTaskIndicator = null;
    
    // Handle task status indicator clicks
    document.addEventListener('click', function(e) {
        const statusDropdown = document.getElementById('status-dropdown');
        
        // If clicking outside the dropdown, close it
        if (statusDropdown.classList.contains('active') && 
            !statusDropdown.contains(e.target) && 
            !e.target.classList.contains('task-indicator')) {
            statusDropdown.classList.remove('active');
            return;
        }
        
        // If clicking on a task indicator, show dropdown
        if (e.target.classList.contains('task-indicator')) {
            currentTaskIndicator = e.target;
            const rect = e.target.getBoundingClientRect();
            statusDropdown.style.top = `${rect.top + window.scrollY + 25}px`;
            statusDropdown.style.left = `${rect.left + window.scrollX - 60}px`;
            statusDropdown.classList.add('active');
        }
    });
    
    // Handle dropdown item selection
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!currentTaskIndicator) return;
            
            const status = this.dataset.status;
            const taskItem = currentTaskIndicator.closest('.task-item');
            const taskId = parseInt(taskItem.dataset.id);
            const taskList = currentTaskIndicator.closest('.task-list');
            const cardType = taskList.id.split('-')[0]; // 'today', 'next', or 'someday'
            
            updateTaskStatus(cardType, taskId, status);
            document.getElementById('status-dropdown').classList.remove('active');
        });
    });
    
    // Function to render tasks for a specific card
    function renderTasks(cardType) {
        const taskList = document.getElementById(`${cardType}-tasks`);
        taskList.innerHTML = '';
        
        tasks[cardType].forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;
            
            const indicator = document.createElement('div');
            indicator.className = 'task-indicator';
            
            const statusEl = document.createElement('div');
            statusEl.className = `task-status ${task.status || ''}`;
            indicator.appendChild(statusEl);
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = `task-text ${task.status === 'completed' ? 'completed' : ''}`;
            textInput.value = task.text;
            textInput.placeholder = 'Enter task...';
            
            textInput.addEventListener('change', function() {
                updateTaskText(cardType, task.id, this.value);
            });
            
            textInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                    addNewTask(cardType);
                }
            });
            
            li.appendChild(indicator);
            li.appendChild(textInput);
            taskList.appendChild(li);
        });
        
        // Update the visibility of clear completed button
        updateClearCompletedButton(cardType);
    }
    
    // Function to add a new task
    function addNewTask(cardType) {
        const newTask = {
            id: Date.now(),
            text: '',
            status: ''
        };
        
        tasks[cardType].push(newTask);
        saveTasks();
        renderTasks(cardType);
        
        // Focus the newly added task
        const taskList = document.getElementById(`${cardType}-tasks`);
        const newTaskItem = taskList.lastChild;
        if (newTaskItem) {
            const textInput = newTaskItem.querySelector('.task-text');
            if (textInput) textInput.focus();
        }
    }
    
    // Function to update task text
    function updateTaskText(cardType, taskId, newText) {
        const taskIndex = tasks[cardType].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[cardType][taskIndex].text = newText;
            saveTasks();
            updateClearCompletedButton(cardType);
        }
    }
    
    // Function to update task status
    function updateTaskStatus(cardType, taskId, status) {
        const taskIndex = tasks[cardType].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[cardType][taskIndex].status = status === 'none' ? '' : status;
            saveTasks();
            renderTasks(cardType);
        }
    }
    
    // Function to clear completed tasks
    function clearCompletedTasks(cardType) {
        // Filter out tasks marked as completed
        tasks[cardType] = tasks[cardType].filter(task => task.status !== 'completed');
        saveTasks();
        renderTasks(cardType);
        
        // Show a brief confirmation
        const btn = document.querySelector(`.clear-completed-btn[data-card="${cardType}"]`);
        const originalText = btn.textContent;
        btn.textContent = 'Cleared!';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1000);
    }
    
    // Function to update clear completed button visibility
    function updateClearCompletedButton(cardType) {
        const hasCompletedTasks = tasks[cardType].some(task => task.status === 'completed');
        const btn = document.querySelector(`.clear-completed-btn[data-card="${cardType}"]`);
        
        if (hasCompletedTasks) {
            btn.style.visibility = 'visible';
        } else {
            btn.style.visibility = 'hidden';
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('analog-tasks', JSON.stringify(tasks));
    }
    
    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('analog-notes', JSON.stringify(notes));
    }
});
