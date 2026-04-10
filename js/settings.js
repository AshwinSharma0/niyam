// Settings Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleButtons = document.querySelectorAll('#sidebar-theme-toggle, #header-theme-toggle');
    const themeOptions = document.querySelectorAll('.theme-option');
    const animationsToggle = document.getElementById('animations-toggle');
    const cursorToggle = document.getElementById('cursor-toggle');
    const reminderToggle = document.getElementById('reminder-toggle');
    const streakToggle = document.getElementById('streak-toggle');
    const quoteToggle = document.getElementById('quote-toggle');
    const exportDataBtn = document.getElementById('export-data');
    const importFileInput = document.getElementById('import-file');
    const resetDataBtn = document.getElementById('reset-data');
    const saveProfileBtn = document.querySelector('.save-profile');
    const changePasswordBtn = document.getElementById('change-password');
    const deleteAccountBtn = document.getElementById('delete-account');
    const passwordModal = document.getElementById('password-modal');
    const resetConfirmModal = document.getElementById('reset-confirm-modal');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const passwordForm = document.getElementById('password-form');
    const deleteConfirmInput = document.getElementById('delete-confirm');
    const confirmDeleteBtn = document.querySelector('.confirm-delete');
    const confirmResetBtn = document.querySelector('.confirm-reset');
    const successToast = document.getElementById('success-toast');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const passwordCancelBtn = document.querySelector('.password-cancel');
    const resetCancelBtn = document.querySelector('.reset-cancel');
    const deleteCancelBtn = document.querySelector('.delete-cancel');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const customCursor = document.querySelector('.custom-cursor');

    // Constants
    const SETTINGS_KEY = 'niyam-settings';
const THEME_KEY = 'niyam-theme';
const STORAGE_KEY = 'niyam-data';
    
    // Settings state
    let settings = {
        theme: 'light',
        animations: true,
        customCursor: true,
        reminders: true,
        streakCelebrations: true,
        showQuotes: true
    };

    // Initialize settings
    initSettings();
    setupSidebar();
    setupCustomCursor();
    
    // Theme toggle functionality
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            setTheme(theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            saveSettings();
            showToast('Theme preference saved');
        });
    });
    
    // Toggle switches
    if (animationsToggle) {
        animationsToggle.addEventListener('change', () => {
            settings.animations = animationsToggle.checked;
            document.body.classList.toggle('animations-disabled', !settings.animations);
            saveSettings();
            showToast('Animation settings saved');
        });
    }
    
    if (cursorToggle) {
        cursorToggle.addEventListener('change', () => {
            settings.customCursor = cursorToggle.checked;
            saveSettings();
            showToast('Cursor settings saved');
        });
    }
    
    if (reminderToggle) {
        reminderToggle.addEventListener('change', () => {
            settings.reminders = reminderToggle.checked;
            saveSettings();
            showToast('Reminder settings saved');
        });
    }
    
    if (streakToggle) {
        streakToggle.addEventListener('change', () => {
            settings.streakCelebrations = streakToggle.checked;
            saveSettings();
            showToast('Streak celebration settings saved');
        });
    }
    
    if (quoteToggle) {
        quoteToggle.addEventListener('change', () => {
            settings.showQuotes = quoteToggle.checked;
            saveSettings();
            showToast('Quote settings saved');
        });
    }
    
    // Save profile
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // Data management
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    if (importFileInput) {
        importFileInput.addEventListener('change', importData);
    }
    
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', () => {
            openModal(resetConfirmModal);
        });
    }
    
    // Account management
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            openModal(passwordModal);
        });
    }
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            openModal(deleteAccountModal);
        });
    }
    
    // Password form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // In a real app, we would send this to a server
            // Here we'll just simulate success
            
            closeModals();
            showToast('Password updated successfully');
            passwordForm.reset();
        });
    }
    
    // Delete account confirmation
    if (deleteConfirmInput) {
        deleteConfirmInput.addEventListener('input', () => {
            confirmDeleteBtn.disabled = deleteConfirmInput.value !== 'DELETE';
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            // In a real app, we would send this to a server
            // Here we'll just simulate account deletion
            
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
    
    // Reset data confirmation
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', resetAllData);
    }
    
    // Modal close buttons
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Cancel buttons
    if (passwordCancelBtn) passwordCancelBtn.addEventListener('click', closeModals);
    if (resetCancelBtn) resetCancelBtn.addEventListener('click', closeModals);
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeModals);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === passwordModal || e.target === resetConfirmModal || e.target === deleteAccountModal) {
            closeModals();
        }
    });
    
    // Initialize settings
    function initSettings() {
        // Load saved settings
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
        // Apply settings to UI
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            settings.theme = savedTheme;
        }
        
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcons(true);
            
            // Set active theme in selector
            themeOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.theme === 'dark');
            });
        } else {
            // Set active theme in selector
            themeOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.theme === 'light');
            });
        }
        
        // Set toggle states
        if (animationsToggle) animationsToggle.checked = settings.animations;
        if (cursorToggle) cursorToggle.checked = settings.customCursor;
        if (reminderToggle) reminderToggle.checked = settings.reminders;
        if (streakToggle) streakToggle.checked = settings.streakCelebrations;
        if (quoteToggle) quoteToggle.checked = settings.showQuotes;
        
        // Apply animations setting
        if (!settings.animations) {
            document.body.classList.add('animations-disabled');
        }
    }
    
    // Toggle between light and dark themes
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        settings.theme = isDark ? 'dark' : 'light';
        saveSettings();
        
        updateThemeIcons(isDark);
        
        // Update active theme in selector
        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === settings.theme);
        });
    }
    
    // Set theme explicitly
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            localStorage.setItem(THEME_KEY, 'dark');
            settings.theme = 'dark';
            updateThemeIcons(true);
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem(THEME_KEY, 'light');
            settings.theme = 'light';
            updateThemeIcons(false);
        }
    }
    
    // Update theme toggle icons
    function updateThemeIcons(isDark) {
        themeToggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            const text = button.querySelector('span');
            
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                if (text) text.textContent = 'Light Mode';
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                if (text) text.textContent = 'Dark Mode';
            }
        });
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    
    // Show toast notification
    function showToast(message) {
        if (successToast) {
            const toastMessage = successToast.querySelector('.toast-message');
            if (toastMessage) {
                toastMessage.textContent = message;
            }
            
            successToast.classList.add('show');
            
            setTimeout(() => {
                successToast.classList.remove('show');
            }, 3000);
        }
    }
    
    // Save profile information
    function saveProfile() {
        const displayName = document.getElementById('display-name').value;
        const email = document.getElementById('email').value;
        
        // In a real app, we would send this to a server
        // Here we'll just save it in localStorage for demonstration
        
        const userData = {
            name: displayName,
            email: email
        };
        
        localStorage.setItem('niyam-user', JSON.stringify(userData));
        showToast('Profile updated successfully');
    }
    
    // Export data functionality
    function exportData() {
        const data = localStorage.getItem(STORAGE_KEY);
        
        if (!data) {
            showToast('No data to export');
            return;
        }
        
        // Create a Blob and download link
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        
        a.href = url;
        a.download = `niyam-data-${date}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        showToast('Data exported successfully');
    }
    
    // Import data functionality
    function importData(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data format (basic check)
                if (!data.habits || !Array.isArray(data.habits)) {
                    throw new Error('Invalid data format');
                }
                
                // Import the data
                localStorage.setItem(STORAGE_KEY, event.target.result);
                showToast('Data imported successfully');
                
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing data: Invalid format');
            }
            
            // Reset file input
            importFileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Reset all data
    function resetAllData() {
        localStorage.removeItem(STORAGE_KEY);
        
        // Keep settings and theme
        const settings = localStorage.getItem(SETTINGS_KEY);
        const theme = localStorage.getItem(THEME_KEY);
        
        // Clear all data
        localStorage.clear();
        
        // Restore settings and theme
        if (settings) localStorage.setItem(SETTINGS_KEY, settings);
        if (theme) localStorage.setItem(THEME_KEY, theme);
        
        closeModals();
        showToast('All habit data has been reset');
    }
    
    // Open a modal
    function openModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    // Close all modals
    function closeModals() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        
        // Reset forms
        if (passwordForm) passwordForm.reset();
        if (deleteConfirmInput) deleteConfirmInput.value = '';
        if (confirmDeleteBtn) confirmDeleteBtn.disabled = true;
    }
    
    // Mobile sidebar functionality
    function setupSidebar() {
        // Toggle sidebar on mobile
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('show');
            });
        }
        
        // Close sidebar
        if (sidebarClose && sidebar) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('show');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 &&
                sidebar.classList.contains('show') &&
                !sidebar.contains(e.target) &&
                e.target !== menuToggle) {
                sidebar.classList.remove('show');
            }
        });
    }
    
    // Custom cursor functionality
    function setupCustomCursor() {
        if (!customCursor) return;
        
        // Only on desktop
        if (window.innerWidth > 768 && settings.customCursor) {
            document.addEventListener('mousemove', (e) => {
                customCursor.style.opacity = '1';
                customCursor.style.left = `${e.clientX}px`;
                customCursor.style.top = `${e.clientY}px`;
                
                // Check if hovering over a clickable element
                const target = e.target;
                const isClickable = 
                    target.closest('a') || 
                    target.closest('button') || 
                    target.tagName === 'BUTTON' || 
                    target.tagName === 'A' ||
                    target.closest('.toggle') ||
                    target.closest('input[type="checkbox"]');
                
                if (isClickable) {
                    customCursor.style.width = '50px';
                    customCursor.style.height = '50px';
                    customCursor.style.backgroundColor = 'rgba(91, 33, 182, 0.1)';
                } else {
                    customCursor.style.width = '20px';
                    customCursor.style.height = '20px';
                    customCursor.style.backgroundColor = 'transparent';
                }
            });
            
            document.addEventListener('mouseout', () => {
                customCursor.style.opacity = '0';
            });
        }
    }
}); 