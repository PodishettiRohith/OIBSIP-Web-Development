// Task Array State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const pendingEmpty = document.getElementById('pending-empty');
const completedEmpty = document.getElementById('completed-empty');

// Initialization
document.addEventListener('DOMContentLoaded', renderTasks);

// Form Submission Event
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskText = todoInput.value.trim();
  
  if (taskText !== '') {
    addTask(taskText);
    todoInput.value = '';
  }
});

// Helper: Format Date
function formatDate(date) {
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleDateString('en-US', options);
}

// Add New Task
function addTask(text) {
  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: new Date(),
    completedAt: null
  };

  tasks.push(newTask);
  saveAndRender();
}

// Toggle Complete State
function toggleComplete(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      const isCompleted = !task.completed;
      return {
        ...task,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null
      };
    }
    return task;
  });

  saveAndRender();
}

// Edit Task Inline
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt('Edit your task:', task.text);
  if (newText !== null && newText.trim() !== '') {
    task.text = newText.trim();
    saveAndRender();
  }
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

// LocalStorage Persistence
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Render Tasks and Update UI Indicators
function renderTasks() {
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Update Count Badges
  pendingCount.textContent = `${pendingTasks.length} pending`;
  completedCount.textContent = `${completedTasks.length} completed`;

  // Toggle Empty Messages
  pendingEmpty.style.display = pendingTasks.length === 0 ? 'block' : 'none';
  completedEmpty.style.display = completedTasks.length === 0 ? 'block' : 'none';

  // Render Pending List
  pendingTasks.forEach(task => {
    const li = createTaskElement(task);
    pendingList.appendChild(li);
  });

  // Render Completed List
  completedTasks.forEach(task => {
    const li = createTaskElement(task);
    completedList.appendChild(li);
  });
}

// DOM Task Element Builder
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed-item' : ''}`;

  const timeLabel = task.completed
    ? `Completed: ${formatDate(task.completedAt)}`
    : `Added: ${formatDate(task.createdAt)}`;

  li.innerHTML = `
    <div class="task-content">
      <span class="task-text"></span>
      <span class="task-timestamp">${timeLabel}</span>
    </div>
    <div class="task-actions">
      <button class="btn-action btn-complete">${task.completed ? 'Undo' : 'Complete'}</button>
      <button class="btn-action btn-edit">Edit</button>
      <button class="btn-action btn-delete">Delete</button>
    </div>
  `;

  // Prevent XSS Injection using textContent
  li.querySelector('.task-text').textContent = task.text;

  // Attach Event Handlers
  li.querySelector('.btn-complete').addEventListener('click', () => toggleComplete(task.id));
  li.querySelector('.btn-edit').addEventListener('click', () => editTask(task.id));
  li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

  return li;
}