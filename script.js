document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
document.getElementById('productivity-toggle').addEventListener('change', function () {
  const isChecked = this.checked;
  const summary = document.getElementById('productivity-summary');
  
  if (isChecked) {
    renderProductivity();  // show and calculate
    summary.style.display = 'block';
  } else {
    summary.style.display = 'none';
  }
});

  // Allow Enter key to add task
  document.getElementById('task-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Apply dark mode on load if saved
  const toggle = document.getElementById('mode-toggle');
  if (localStorage.getItem('mode') === 'dark') {
    document.body.classList.add('dark');
    if (toggle) toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('mode', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }
});

function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();

  if (taskText === '') return;

  const task = {
    text: taskText,
    completed: false
  };

  let tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  input.value = '';
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  const tasks = getTasks();

  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <span>${task.text}</span>
      <div class="button-group">
        <button onclick="markDone(${index})" ${task.completed ? 'disabled' : ''}>✅ Done</button>
        <button onclick="undoTask(${index})" ${!task.completed ? 'disabled' : ''}>↩️ Undo</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function markDone(index) {
  const tasks = getTasks();
  tasks[index].completed = true;
  tasks[index].completedDate = new Date().toISOString(); // 🆕 Add completion date
  saveTasks(tasks);
  renderTasks();
  renderProductivity(); // 🆕 update productivity stats
}


function undoTask(index) {
  const tasks = getTasks();
  tasks[index].completed = false;
  delete tasks[index].completedDate; // 🆕 remove date
  saveTasks(tasks);
  renderTasks();
  renderProductivity();
}


function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  renderTasks();
}
function renderProductivity() {
  const tasks = getTasks();
  const summary = {};
  const today = new Date();

  // Step 1: Create empty summary for last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split('T')[0]; // yyyy-mm-dd
    summary[key] = 0;
  }

  // Step 2: Count completed tasks per day
  tasks.forEach(task => {
    if (task.completed && task.completedDate) {
      const dateKey = task.completedDate.split('T')[0];
      if (summary[dateKey] !== undefined) {
        summary[dateKey]++;
      }
    }
  });

  // Step 3: Display in HTML
  const summaryDiv = document.getElementById('productivity-summary');
  summaryDiv.innerHTML = `<h3>📈 Productivity (Last 5 Days)</h3>`;

  const list = document.createElement('ul');
  list.className = 'prod-list';

  let allDaysProductive = true;

  Object.entries(summary).forEach(([date, count]) => {
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const li = document.createElement('li');
    li.textContent = `${day}: ${count} ✅`;
    list.appendChild(li);

    if (count === 0) {
      allDaysProductive = false;
    }
  });

  summaryDiv.appendChild(list);

  // Step 4: 🎉 Confetti if all 5 days had completed tasks
  if (allDaysProductive && Object.keys(summary).length === 5) {
    launchConfetti();
  }
}
function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff69b4', '#ffd1dc', '#fce4ec', '#cdb4db', '#b5ead7'],
  });
}

function loadTasks() {
  renderTasks();
  renderProductivity(); // 🆕 add this
}
// changes
