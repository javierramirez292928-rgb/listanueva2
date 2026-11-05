// Clave para almacenamiento en LocalStorage (Base de Datos JSON)
const STORAGE_KEY = 'todo_app_tasks';

// Obtener tareas guardadas
function getTasks() {
  const tasksJSON = localStorage.getItem(STORAGE_KEY);
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

// Guardar tareas en formato JSON
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Referencias a la interfaz
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty-msg');

// Función que renderiza y actualiza la lista en pantalla
function renderTasks() {
  const tasks = getTasks();
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    // Texto de la tarea (haz clic para marcar como completada)
    const span = document.createElement('span');
    span.className = `task-text ${task.completed ? 'completed' : ''}`;
    span.textContent = task.text;
    span.addEventListener('click', () => toggleTask(index));

    // Botón 'X' para eliminar
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '&times;'; // Muestra la 'X'
    deleteBtn.title = 'Eliminar tarea';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita marcar como completada al eliminar
      deleteTask(index);
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Agregar nueva tarea a la lista
function addTask(text) {
  const tasks = getTasks();
  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });
  saveTasks(tasks);
  renderTasks(); // Actualiza la pantalla inmediatamente
}

// Alternar estado completado
function toggleTask(index) {
  const tasks = getTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  renderTasks();
}

// Eliminar tarea de la lista
function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

// Escuchar el evento de envío del formulario al dar clic en "Agregar"
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text !== '') {
    addTask(text);
    taskInput.value = ''; // Limpia el campo de texto
  }
});

// Renderizar tareas iniciales al cargar la página
renderTasks();

// Registro del Service Worker para funcionamiento sin conexión
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registrado correctamente.'))
      .catch((err) => console.log('Error al registrar Service Worker:', err));
  });
}

const CACHE_NAME = 'todo-pwa-blue-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];
    
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});