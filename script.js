/**
 * Gerenciador de Tema Escuro/Claro
 * Persiste a preferência do usuário no localStorage
 */

const THEME_KEY = 'theme-preference';
const themeToggleBtn = document.getElementById('themeToggle');

/**
 * Inicializa o tema baseado na preferência salva ou sistema
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    }
}

/**
 * Aplica o tema ao documento
 * @param {string} theme - 'dark' ou 'light'
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
    }
}

/**
 * Alterna entre tema escuro e claro
 */
function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
}

/**
 * Event Listeners
 */
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Respeita mudanças de preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

// Inicializar tema ao carregar
document.addEventListener('DOMContentLoaded', initializeTheme);

/**
 * Smooth Scroll Fallback para navegadores antigos
 */
if (!CSS.supports('scroll-behavior: smooth')) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
