document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count'); // Select the task count element
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');

    //Sidebar toggle
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Update the task count
    const updateTaskCount = () => {
        const totalTasks = taskList.children.length;
        taskCount.textContent = `Total tasks: ${totalTasks}`;
    };

    // Add task to the list
    const addTask = (taskText) => {
        const li = document.createElement('li');
        li.classList.add('task-item');

        // Create a span for task content
        const taskContent = document.createElement('span');
        taskContent.textContent = taskText;
        taskContent.classList.add('task-content');
        li.appendChild(taskContent);

        // Enable editing of tasks when clicking the task item
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskContent.textContent;
            input.classList.add('edit-input');

            li.replaceChild(input, taskContent);

            input.focus();
            input.select();

            const saveEdit = () => {
                if (input.value.trim()) {
                    taskContent.textContent = input.value.trim();
                }
                li.replaceChild(taskContent, input);
                saveTasks();
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveEdit();
            });
        });

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
            saveTasks();
            updateTaskCount(); // Update count after deleting
        };
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
        updateTaskCount(); // Update count after adding
    };

    // Save tasks to local storage
    const saveTasks = () => {
        const tasks = Array.from(taskList.children).map(task => {
            return task.querySelector('.task-content')?.textContent || '';
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Handle adding a new task
    const handleAddTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
            saveTasks();
        }
    };

    // Add click event to the button
    addBtn.addEventListener('click', handleAddTask);

    // Add keydown event to the input field
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });

    // Load tasks from local storage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task));
    };

    // Initialize SortableJS
    new Sortable(taskList, {
        animation: 150,
        onEnd: () => {
            saveTasks();
            updateTaskCount(); // Update count after reordering
        },
    });

    // Initial load
    loadTasks();
    updateTaskCount(); // Update count on page load
});
