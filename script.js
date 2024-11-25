document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const prioritySelect = document.getElementById('priority-select');

    let sortable; // Declare a variable for SortableJS instance

    // Update the task count
    const updateTaskCount = () => {
        const totalTasks = taskList.children.length;
        taskCount.textContent = `Total tasks: ${totalTasks}`;
    };

    // Add task to the list
    const addTask = (taskText, priority) => {
        const li = document.createElement('li');
        li.classList.add('task-item', `priority-${priority}`); // Add priority class

        // Create a span for task content
        const taskContent = document.createElement('span');
        taskContent.textContent = taskText;
        taskContent.classList.add('task-content');
        li.appendChild(taskContent);

        // Enable editing of tasks
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) return;

            // Create an input for task text
            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskContent.textContent;
            input.classList.add('edit-input');

            // Create a dropdown for task priority
            const priorityDropdown = document.createElement('select');
            priorityDropdown.innerHTML = `
                <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
            `;
            priorityDropdown.classList.add('edit-priority');

            // Replace content with input and dropdown
            li.replaceChild(input, taskContent);
            li.insertBefore(priorityDropdown, li.querySelector('.delete-btn'));

            input.focus();
            input.select();

            const finalizeEdit = () => {
                if (input.value.trim()) {
                    taskContent.textContent = input.value.trim();

                    // Update the priority class
                    const newPriority = priorityDropdown.value;
                    li.classList.remove('priority-low', 'priority-medium', 'priority-high');
                    li.classList.add(`priority-${newPriority}`);

                    // Remove input and dropdown
                    li.replaceChild(taskContent, input);
                    priorityDropdown.remove();

                    saveTasks(); // Save updated task to local storage
                    sortTasks(); // Sort tasks by new priority
                }
            };

            // Finalize edits on Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finalizeEdit();
            });
            priorityDropdown.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finalizeEdit();
            });

            // Save edits when clicking outside
            const handleBlur = (e) => {
                if (e.relatedTarget !== priorityDropdown && e.relatedTarget !== input) {
                    finalizeEdit();
                }
            };

            input.addEventListener('blur', handleBlur);
            priorityDropdown.addEventListener('blur', handleBlur);
        });

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
            sortTasks(); // Sort tasks again
            saveTasks();
            updateTaskCount();
        };

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
        updateTaskCount();
    };

    // Save tasks to local storage
    const saveTasks = () => {
        const tasks = Array.from(taskList.children).map(task => {
            return {
                text: task.querySelector('.task-content').textContent,
                priority: task.classList.contains('priority-high')
                    ? 'high'
                    : task.classList.contains('priority-medium')
                        ? 'medium'
                        : 'low',
            };
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Sort tasks dynamically by priority
    const sortTasks = () => {
        const tasks = Array.from(taskList.children);
        const priorityOrder = { high: 1, medium: 2, low: 3 };

        // Sort DOM elements by priority
        tasks.sort((a, b) => {
            const aPriority = a.classList.contains('priority-high')
                ? 'high'
                : a.classList.contains('priority-medium')
                    ? 'medium'
                    : 'low';

            const bPriority = b.classList.contains('priority-high')
                ? 'high'
                : b.classList.contains('priority-medium')
                    ? 'medium'
                    : 'low';

            return priorityOrder[aPriority] - priorityOrder[bPriority];
        });

        // Clear the task list and re-append sorted tasks
        taskList.innerHTML = '';
        tasks.forEach(task => taskList.appendChild(task));

        // Reinitialize SortableJS after re-rendering
        initializeSortable();
    };

    // Handle adding a new task
    const handleAddTask = () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;

        if (taskText) {
            addTask(taskText, priority);
            taskInput.value = '';
            sortTasks(); // Sort the tasks immediately after adding
            saveTasks(); // Save the updated order
        }
    };

    // Initialize SortableJS
    const initializeSortable = () => {
        if (sortable) {
            sortable.destroy(); // Destroy the previous instance if it exists
        }
        sortable = new Sortable(taskList, {
            animation: 150,
            onEnd: () => {
                saveTasks();
                updateTaskCount(); // Update count after reordering
            },
        });
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
        tasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        tasks.forEach(task => addTask(task.text, task.priority));
        initializeSortable(); // Initialize SortableJS after loading tasks
    };

    // Initial load
    loadTasks();
    updateTaskCount();
});
