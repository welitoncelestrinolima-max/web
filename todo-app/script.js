/**
 * Gerenciador de Lista de Tarefas
 * Funcionalidades: CRUD, filtros, persistência em localStorage, tema escuro/claro
 */

// ===== Configurações =====
const CONFIG = {
    storageKey: 'tasks-data',
    themeKey: 'theme-preference'
};

// ===== Elementos do DOM =====
const elements = {
    taskInput: document.getElementById('taskInput'),
    addBtn: document.getElementById('addBtn'),
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    clearCompleted: document.getElementById('clearCompleted'),
    clearAll: document.getElementById('clearAll'),
    themeToggle: document.getElementById('themeToggle'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks')
};

// ===== Estado da Aplicação =====
let tasks = [];
let currentFilter = 'all';

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initializeTheme();
    attachEventListeners();
    render();
});

// ===== LocalStorage - Tarefas =====
/**
 * Carrega tarefas do localStorage
 */
function loadTasks() {
    const savedTasks = localStorage.getItem(CONFIG.storageKey);
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

/**
 * Salva tarefas no localStorage
 */
function saveTasks() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(tasks));
}

// ===== Operações com Tarefas =====
/**
 * Cria um novo objeto de tarefa
 * @param {string} text - Texto da tarefa
 * @returns {Object} Objeto da tarefa
 */
function createTask(text) {
    return {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toLocaleDateString('pt-BR')
    };
}

/**
 * Adiciona uma nova tarefa
 */
function addTask() {
    const text = elements.taskInput.value;

    if (!text.trim()) {
        alert('Por favor, digite uma tarefa!');
        elements.taskInput.focus();
        return;
    }

    if (text.length > 100) {
        alert('A tarefa não pode ter mais de 100 caracteres!');
        return;
    }

    tasks.unshift(createTask(text));
    saveTasks();
    elements.taskInput.value = '';
    elements.taskInput.focus();
    render();
}

/**
 * Deleta uma tarefa
 * @param {number} id - ID da tarefa
 */
function deleteTask(id) {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        render();
    }
}

/**
 * Alterna o status de uma tarefa (concluída/pendente)
 * @param {number} id - ID da tarefa
 */
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

/**
 * Edita o texto de uma tarefa
 * @param {number} id - ID da tarefa
 */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Editar tarefa:', task.text);
    if (newText !== null && newText.trim()) {
        if (newText.length > 100) {
            alert('A tarefa não pode ter mais de 100 caracteres!');
            return;
        }
        task.text = newText.trim();
        saveTasks();
        render();
    }
}

/**
 * Limpa tarefas concluídas
 */
function clearCompletedTasks() {
    const completed = tasks.filter(t => t.completed).length;
    if (completed === 0) {
        alert('Não há tarefas concluídas para limpar!');
        return;
    }

    if (confirm(`Tem certeza que deseja deletar ${completed} tarefa(s) concluída(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        currentFilter = 'all';
        updateFilterButtons('all');
        render();
    }
}

/**
 * Limpa todas as tarefas
 */
function clearAllTasks() {
    if (tasks.length === 0) {
        alert('Não há tarefas para limpar!');
        return;
    }

    if (confirm('⚠️ Tem certeza que deseja deletar TODAS as tarefas? Esta ação não pode ser desfeita!')) {
        tasks = [];
        saveTasks();
        currentFilter = 'all';
        updateFilterButtons('all');
        render();
    }
}

// ===== Filtragem =====
/**
 * Filtra tarefas baseado no filtro selecionado
 * @returns {Array} Tarefas filtradas
 */
function getFilteredTasks() {
    switch (currentFilter) {
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'all':
        default:
            return tasks;
    }
}

/**
 * Define o filtro ativo
 * @param {string} filter - Tipo de filtro
 */
function setFilter(filter) {
    currentFilter = filter;
    updateFilterButtons(filter);
    render();
}

/**
 * Atualiza os botões de filtro
 * @param {string} activeFilter - Filtro ativo
 */
function updateFilterButtons(activeFilter) {
    elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });
}

// ===== Estatísticas =====
/**
 * Atualiza as estatísticas
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.pendingTasks.textContent = pending;
}

// ===== Renderização =====
/**
 * Cria um elemento de tarefa
 * @param {Object} task - Objeto da tarefa
 * @returns {HTMLElement} Elemento da tarefa
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.role = 'listitem';
    li.innerHTML = `
        <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? 'checked' : ''}
            aria-label="Marcar tarefa como concluída"
        >
        <div class="task-content">
            <div class="task-text">${escapeHTML(task.text)}</div>
            <div class="task-date">📅 ${task.createdAt}</div>
        </div>
        <div class="task-actions">
            <button class="task-btn task-btn-edit" title="Editar tarefa" aria-label="Editar tarefa">
                ✏️
            </button>
            <button class="task-btn task-btn-delete" title="Deletar tarefa" aria-label="Deletar tarefa">
                🗑️
            </button>
        </div>
    `;

    // Event Listeners
    li.querySelector('.task-checkbox').addEventListener('change', () => {
        toggleTask(task.id);
    });

    li.querySelector('.task-btn-edit').addEventListener('click', () => {
        editTask(task.id);
    });

    li.querySelector('.task-btn-delete').addEventListener('click', () => {
        deleteTask(task.id);
    });

    return li;
}

/**
 * Renderiza a lista de tarefas
 */
function render() {
    const filteredTasks = getFilteredTasks();

    // Limpar lista
    elements.taskList.innerHTML = '';

    // Renderizar tarefas
    if (filteredTasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        filteredTasks.forEach(task => {
            elements.taskList.appendChild(createTaskElement(task));
        });
    }

    // Atualizar estatísticas
    updateStats();
}

// ===== Tema Escuro/Claro =====
/**
 * Inicializa o tema baseado na preferência salva ou sistema
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    }
}

/**
 * Aplica um tema ao documento
 * @param {string} theme - 'dark' ou 'light'
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem(CONFIG.themeKey, 'dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem(CONFIG.themeKey, 'light');
    }
}

/**
 * Alterna entre tema escuro e claro
 */
function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
}

// ===== Utilitários =====
/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== Event Listeners =====
/**
 * Anexa os event listeners aos elementos
 */
function attachEventListeners() {
    // Adicionar tarefa
    elements.addBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Filtros
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Ações
    elements.clearCompleted.addEventListener('click', clearCompletedTasks);
    elements.clearAll.addEventListener('click', clearAllTasks);
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Resposta a mudanças de preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(CONFIG.themeKey)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}
