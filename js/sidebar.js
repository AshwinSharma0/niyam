const SIDEBAR_ITEMS = [
    { label: 'Dashboard', icon: 'fa-home', href: 'dashboard.html', page: 'dashboard' },
    { label: 'Analytics', icon: 'fa-chart-bar', href: 'stats.html', page: 'stats' },
    { label: 'Goals', icon: 'fa-bullseye', href: 'dashboard.html#goals-panel', page: 'goals' },
    { label: 'Achievements', icon: 'fa-trophy', href: 'dashboard.html#achievements-panel', page: 'achievements' },
    { label: 'Settings', icon: 'fa-cog', href: 'settings.html', page: 'settings' },
    { label: 'Logout', icon: 'fa-sign-out-alt', href: 'javascript:void(0)', page: 'logout', action: 'logout' }
];

function renderSidebar() {
    const sidebar = document.querySelector('[data-sidebar]');

    if (!sidebar) return;

    if (typeof window.logout !== 'function') {
        window.logout = function logout() {
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        };
    }

    const currentPage = document.body.dataset.page || inferPageFromPath();

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <a href="index.html" class="logo">
                <span>Niyam</span>
            </a>
            <button class="sidebar-close" aria-label="Close sidebar">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <nav class="sidebar-nav">
            <ul class="sidebar-links">
                ${SIDEBAR_ITEMS.map(item => `
                    <li class="sidebar-link ${isActiveItem(currentPage, item) ? 'active' : ''}">
                        <a href="${item.href}" ${item.action === 'logout' ? 'onclick="logout()"' : ''}>
                            <i class="fas ${item.icon}"></i>
                            <span>${item.label}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </nav>
        <div class="sidebar-footer">
            <button id="sidebar-theme-toggle">
                <i class="fas fa-moon"></i>
                <span>Dark Mode</span>
            </button>
        </div>
    `;
}

function inferPageFromPath() {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('stats')) return 'stats';
    if (path.includes('settings')) return 'settings';
    return 'dashboard';
}

function isActiveItem(currentPage, item) {
    if (item.page === 'goals' || item.page === 'achievements') {
        return currentPage === 'dashboard' && window.location.hash === `#${item.page === 'goals' ? 'goals-panel' : 'achievements-panel'}`;
    }

    return item.page === currentPage;
}

document.addEventListener('DOMContentLoaded', renderSidebar);