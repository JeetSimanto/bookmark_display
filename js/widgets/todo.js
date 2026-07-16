/* ============================================================
   TODO.JS — Micro To-Do Checklist Widget
   Persistent task list with stark checkmarks and strikethrough
   ============================================================ */

import StorageController from '../storage.js';

const TodoWidget = (() => {
  let appState = null;

  /**
   * Initialize the todo widget
   * @param {Object} state - The loaded app state
   */
  function init(state) {
    appState = state;
    render();
  }

  /**
   * Render the todo widget into the grid
   */
  function render() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    // Remove existing widget
    const existing = document.getElementById('widget-todo');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.className = 'widget-todo';
    widget.id = 'widget-todo';
    widget.setAttribute('data-id', 'widget-todo');

    widget.innerHTML = `
      <div class="card-header">
        <span class="card-title">
          <span class="card-title-icon">🔥</span>
          TASKS
        </span>
      </div>
      <ul class="todo-list" id="todo-list"></ul>
      <div class="todo-input-row">
        <input type="text" id="todo-input" placeholder="ADD A TASK..." />
        <button id="todo-add-btn">ADD</button>
      </div>
    `;

    grid.appendChild(widget);

    renderItems();

    // Add task handler
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('todo-add-btn');

    const doAdd = () => {
      const text = input.value.trim();
      if (text) {
        addTodo(text);
        input.value = '';
        input.focus();
      }
    };

    addBtn.addEventListener('click', doAdd);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAdd();
    });
  }

  /**
   * Render todo items inside the list
   */
  function renderItems() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    list.innerHTML = '';

    (appState.todos || []).forEach((todo, idx) => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(idx));

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = todo.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'todo-delete';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => deleteTodo(idx));

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

  /**
   * Add a new todo
   */
  function addTodo(text) {
    if (!appState.todos) appState.todos = [];
    appState.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
    StorageController.saveState(appState);
    renderItems();
  }

  /**
   * Toggle todo completion
   */
  function toggleTodo(idx) {
    if (appState.todos[idx]) {
      appState.todos[idx].completed = !appState.todos[idx].completed;
      StorageController.saveState(appState);
      renderItems();
    }
  }

  /**
   * Delete a todo
   */
  function deleteTodo(idx) {
    appState.todos.splice(idx, 1);
    StorageController.saveState(appState);
    renderItems();
  }

  return { init, render };
})();

export default TodoWidget;
