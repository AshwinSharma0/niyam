// Constants
const STORAGE_KEY = 'niyam-data';
const THEME_KEY = 'niyam-theme';

// Motivational quotes
const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Small daily improvements over time lead to stunning results.",
    "You don't have to be great to start, but you have to start to be great.",
    "Don't wait for motivation. Just start and motivation will find you.",
    "Habits are the compound interest of self-improvement.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "You will never always be motivated. You have to learn to be disciplined.",
    "The difference between who you are and who you want to be is what you do.",
    "What you do every day matters more than what you do once in a while.",
    "The only way to do great work is to love what you do."
];

// Category icons mapping
const categoryIcons = {
    health: 'fa-heartbeat',
    productivity: 'fa-laptop-code',
    mindfulness: 'fa-brain',
    learning: 'fa-book',
    other: 'fa-star'
};

// DOM Elements
const currentDateElement = document.getElementById('current-date');
const habitListElement = document.getElementById('habit-list');
const addHabitBtn = document.getElementById('add-habit-btn');
const emptyStateElement = document.querySelector('.empty-state');
const addHabitModal = document.getElementById('add-habit-modal');
const editHabitModal = document.getElementById('edit-habit-modal');
const addHabitForm = document.getElementById('add-habit-form');
const editHabitForm = document.getElementById('edit-habit-form');
const dailyQuoteElement = document.getElementById('daily-quote');
const dailyProgressBar = document.getElementById('daily-progress-bar');
const dailyProgressText = document.getElementById('daily-progress-text');
const streakCountElement = document.getElementById('streak-count');
const completionRateElement = document.getElementById('completion-rate');
const themeToggleButtons = document.querySelectorAll('#sidebar-theme-toggle, #header-theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarClose = document.querySelector('.sidebar-close');
const modalCloseButtons = document.querySelectorAll('.modal-close');
const cancelHabitButton = document.getElementById('cancel-habit');
const deleteHabitButton = document.getElementById('delete-habit');
const weeklyChartCanvas = document.getElementById('weekly-chart');
const customCursor = document.querySelector('.custom-cursor');
const userMenu = document.querySelector('.user-menu');
const dropdownContent = document.querySelector('.dropdown-content');

// State
let habits = [];
let habitHistory = {};
let streak = 0;
let lastCompletionDate = null;
let weeklyData = [0, 0, 0, 0, 0, 0, 0];
let weeklyChart = null;

// Initialize the application
function init() {
    setCurrentDate();
    loadData();
    updateQuote();
    renderHabits();
    updateProgress();
    initializeChart();
    setupEventListeners();
    initTheme();
    setupMobileInteraction();
    setupCustomCursor();
}

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Update the daily quote
function updateQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    
    dailyQuoteElement.textContent = `"${motivationalQuotes[quoteIndex]}"`;
}

// Load data from localStorage
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (data) {
        const parsedData = JSON.parse(data);
        
        // Check if the data is from today
        const today = new Date().toDateString();
        const lastSavedDate = parsedData.date;
        
        if (lastSavedDate === today) {
            // Today's data
            habits = parsedData.habits || [];
        } else {
            // New day, reset completion status
            // But first, update history with yesterday's data
            if (parsedData.habits && parsedData.habits.length > 0) {
                updateHistoryWithPreviousDay(parsedData);
            }
            
            habits = parsedData.habits?.map(habit => ({
                ...habit,
                completed: false
            })) || [];
        }
        
        // Load other state data
        habitHistory = parsedData.history || {};
        streak = parsedData.streak || 0;
        lastCompletionDate = parsedData.lastCompletionDate ? new Date(parsedData.lastCompletionDate) : null;
        
        updateWeeklyData();
    }
}

// Update history with the previous day's data
function updateHistoryWithPreviousDay(prevData) {
    if (!prevData.date) return;
    
    const prevDate = new Date(prevData.date);
    const dateString = prevDate.toISOString().split('T')[0];
    const allCompleted = prevData.habits.every(habit => habit.completed);
    
    // Add to history
    habitHistory[dateString] = {
        completedCount: prevData.habits.filter(habit => habit.completed).length,
        totalCount: prevData.habits.length,
        allCompleted: allCompleted
    };
    
    // Update streak if all habits were completed
    if (allCompleted) {
        if (!lastCompletionDate) {
            // First completion
            streak = 1;
            lastCompletionDate = prevDate;
        } else {
            // Check if the previous completion was yesterday
            const prevCompletionDate = new Date(lastCompletionDate);
            const dayDiff = Math.floor((prevDate - prevCompletionDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                // Yesterday was completed, increment streak
                streak++;
            } else if (dayDiff > 1) {
                // Streak broken, reset to 1
                streak = 1;
            }
            
            lastCompletionDate = prevDate;
        }
    } else {
        // Not all habits were completed, reset streak
        streak = 0;
        lastCompletionDate = null;
    }
}

// Save data to localStorage
function saveData() {
    const data = {
        habits: habits,
        history: habitHistory,
        streak: streak,
        lastCompletionDate: lastCompletionDate ? lastCompletionDate.toISOString() : null,
        date: new Date().toDateString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Update UI after save
    updateProgress();
    updateWeeklyData();
    if (weeklyChart) {
        updateChart();
    }
}

// Render habits in the UI
function renderHabits() {
    const habitListContainer = document.getElementById('habit-list');
    
    // Clear previous content but keep the empty state
    const emptyState = habitListContainer.querySelector('.empty-state');
    habitListContainer.innerHTML = '';
    
    if (habits.length === 0) {
        habitListContainer.appendChild(emptyState);
        return;
    }
    
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit);
        habitListContainer.appendChild(habitElement);
    });
}

// Create a single habit element
function createHabitElement(habit) {
    const habitElement = document.createElement('div');
    habitElement.className = `habit-item ${habit.completed ? 'completed' : ''}`;
    habitElement.dataset.id = habit.id;
    
    const checkbox = document.createElement('div');
    checkbox.className = `habit-checkbox ${habit.completed ? 'checked' : ''}`;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'habit-info';
    
    const habitName = document.createElement('h3');
    habitName.className = 'habit-name';
    habitName.textContent = habit.title || habit.name;
    
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'habit-category';
    
    const categoryIcon = document.createElement('i');
    categoryIcon.className = `fas ${categoryIcons[habit.category] || categoryIcons.other}`;
    
    const categoryText = document.createElement('span');
    categoryText.textContent = habit.category.charAt(0).toUpperCase() + habit.category.slice(1);
    
    categoryDiv.appendChild(categoryIcon);
    categoryDiv.appendChild(categoryText);
    
    infoDiv.appendChild(habitName);
    infoDiv.appendChild(categoryDiv);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'habit-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-habit';
    editButton.setAttribute('aria-label', 'Edit habit');
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    
    actionsDiv.appendChild(editButton);
    
    habitElement.appendChild(checkbox);
    habitElement.appendChild(infoDiv);
    habitElement.appendChild(actionsDiv);
    
    // Event listeners
    checkbox.addEventListener('click', () => toggleHabit(habit.id));
    editButton.addEventListener('click', () => openEditModal(habit.id));
    
    return habitElement;
}

// Update progress UI
function updateProgress() {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.completed).length;
    
    // Calculate percentage
    const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    
    // Update progress bar
    dailyProgressBar.style.width = `${percentage}%`;
    dailyProgressText.textContent = `${percentage}%`;
    
    // Update streak
    streakCountElement.textContent = streak;
    
    // Check if all habits are completed
    if (totalHabits > 0 && completedHabits === totalHabits) {
        // All completed, celebrate if this is first time today
        const today = new Date().toDateString();
        
        if (!lastCompletionDate || new Date(lastCompletionDate).toDateString() !== today) {
            lastCompletionDate = new Date();
            
            // Increment streak for consecutive days
            if (streak > 0) {
                streak++;
                
                // Celebrate milestone streaks
                if (streak === 7 || streak === 30 || streak === 100) {
                    celebrateStreak(streak);
                }
            } else {
                streak = 1;
            }
            
            saveData();
        }
    }
    
    // Update completion rate
    updateCompletionRate();
}

// Update completion rate for last 7 days
function updateCompletionRate() {
    const today = new Date();
    let totalCompleted = 0;
    let totalHabits = 0;
    
    // Loop through the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        if (habitHistory[dateString]) {
            totalCompleted += habitHistory[dateString].completedCount;
            totalHabits += habitHistory[dateString].totalCount;
        }
    }
    
    // Calculate rate
    const rate = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
    completionRateElement.textContent = `${rate}%`;
}

// Toggle habit completion status
function toggleHabit(id) {
    const habitIndex = habits.findIndex(habit => habit.id === id);
    
    if (habitIndex !== -1) {
        // Toggle completion status
        habits[habitIndex].completed = !habits[habitIndex].completed;
        
        // Update UI and save data
        renderHabits();
        saveData();
        
        // Add animation if completed
        if (habits[habitIndex].completed) {
            const habitElement = document.querySelector(`.habit-item[data-id="${id}"]`);
            if (habitElement) {
                const checkbox = habitElement.querySelector('.habit-checkbox');
                checkbox.classList.add('animate-bounce');
                setTimeout(() => {
                    checkbox.classList.remove('animate-bounce');
                }, 500);
            }
        }
    }
}

// Open add habit modal
function openAddModal() {
    addHabitModal.classList.add('show');
    setTimeout(() => {
        document.getElementById('habit-name').focus();
    }, 300);
}

// Open edit habit modal
function openEditModal(id) {
    const habit = habits.find(h => h.id === id);
    
    if (habit) {
        // Fill the form with habit data
        document.getElementById('edit-habit-id').value = habit.id;
        document.getElementById('edit-habit-name').value = habit.title || habit.name;
        document.getElementById('edit-habit-category').value = habit.category;
        document.getElementById('edit-habit-reminder').value = habit.reminder || '';
        
        // Show the modal
        editHabitModal.classList.add('show');
        setTimeout(() => {
            document.getElementById('edit-habit-name').focus();
        }, 300);
    }
}

// Close all modals
function closeModals() {
    addHabitModal.classList.remove('show');
    editHabitModal.classList.remove('show');
    
    // Reset forms
    addHabitForm.reset();
    editHabitForm.reset();
}

// Add new habit
function addHabit(e) {
    e.preventDefault();
    
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;
    const reminder = document.getElementById('habit-reminder').value;
    
    if (name) {
        const newHabit = {
            id: Date.now().toString(),
            title: name,
            category,
            reminder,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to habits array
        habits.push(newHabit);
        
        // Update UI and save
        renderHabits();
        saveData();
        closeModals();
        
        // Animate the newly added habit
        setTimeout(() => {
            const newElement = document.querySelector(`.habit-item[data-id="${newHabit.id}"]`);
            if (newElement) {
                newElement.classList.add('animate-fadeIn');
            }
        }, 100);
    }
}

// Edit existing habit
function editHabit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-habit-id').value;
    const name = document.getElementById('edit-habit-name').value.trim();
    const category = document.getElementById('edit-habit-category').value;
    const reminder = document.getElementById('edit-habit-reminder').value;
    
    if (name) {
        const habitIndex = habits.findIndex(h => h.id === id);
        
        if (habitIndex !== -1) {
            // Update habit data
            habits[habitIndex] = {
                ...habits[habitIndex],
                title: name,
                category,
                reminder
            };
            
            // Update UI and save
            renderHabits();
            saveData();
            closeModals();
        }
    }
}

// Delete habit
function deleteHabit() {
    const id = document.getElementById('edit-habit-id').value;
    
    // Find the habit element for animation
    const habitElement = document.querySelector(`.habit-item[data-id="${id}"]`);
    
    if (habitElement) {
        // Animate removal
        habitElement.style.opacity = '0';
        habitElement.style.transform = 'translateX(30px)';
        habitElement.style.height = habitElement.offsetHeight + 'px';
        
        setTimeout(() => {
            habitElement.style.height = '0';
            habitElement.style.margin = '0';
            habitElement.style.padding = '0';
            
            setTimeout(() => {
                // Remove from array
                habits = habits.filter(h => h.id !== id);
                
                // Update UI and save
                renderHabits();
                saveData();
                closeModals();
            }, 300);
        }, 300);
    } else {
        // Fallback if element not found
        habits = habits.filter(h => h.id !== id);
        renderHabits();
        saveData();
        closeModals();
    }
}

// Update weekly data for chart
function updateWeeklyData() {
    const today = new Date();
    
    // Reset data
    weeklyData = [0, 0, 0, 0, 0, 0, 0];
    
    // Loop through the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        if (habitHistory[dateString]) {
            const totalHabits = habitHistory[dateString].totalCount;
            const completedHabits = habitHistory[dateString].completedCount;
            
            // Calculate percentage
            const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
            weeklyData[6 - i] = percentage;
        } else if (i === 0 && habits.length > 0) {
            // Today's data
            const totalHabits = habits.length;
            const completedHabits = habits.filter(habit => habit.completed).length;
            const percentage = (completedHabits / totalHabits) * 100;
            weeklyData[6] = percentage;
        }
    }
}

// Initialize Chart.js chart
function initializeChart() {
    if (!weeklyChartCanvas) return;
    
    // Get the day labels
    const dayLabels = getLastSevenDayLabels();
    
    // Configure the chart
    const ctx = weeklyChartCanvas.getContext('2d');
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dayLabels,
            datasets: [{
                label: 'Completion Rate',
                data: weeklyData,
                backgroundColor: 'rgba(91, 33, 182, 0.6)',
                borderColor: 'rgba(91, 33, 182, 1)',
                borderWidth: 1,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(91, 33, 182, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${Math.round(context.raw)}% completed`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update chart with new data
function updateChart() {
    if (!weeklyChart) return;
    
    weeklyChart.data.datasets[0].data = weeklyData;
    weeklyChart.update();
}

// Get labels for the last 7 days
function getLastSevenDayLabels() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        result.push(i === 0 ? 'Today' : dayName);
    }
    
    return result;
}

// Celebrate streak milestones
function celebrateStreak(streakCount) {
    // Configure confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Create interval to launch confetti
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from sides and middle
        confetti({
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            ...defaults
        });
        confetti({
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            ...defaults
        });
    }, 250);
    
    // Show celebration message
    const message = streakCount === 7 ? "One week streak! 🔥" :
                   streakCount === 30 ? "One month streak! 🎉" :
                   "100 day streak! You're amazing! 🏆";
    
    // Create and show toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate the toast
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.transform = 'translateY(-20px)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

// Theme handling
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcons(true);
    }
    
    // Setup theme toggle buttons
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
    
    // Apply theme to Chart.js
    updateChartTheme();
}

// Toggle between light and dark themes
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    
    updateThemeIcons(isDark);
    updateChartTheme();
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

// Update Chart.js theme
function updateChartTheme() {
    if (!weeklyChart) return;
    
    const isDark = document.body.classList.contains('dark-theme');
    
    // Update chart theme
    weeklyChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    weeklyChart.options.scales.y.ticks.color = isDark ? '#e0e0e0' : '#333333';
    weeklyChart.options.scales.x.ticks.color = isDark ? '#e0e0e0' : '#333333';
    
    weeklyChart.update();
}

// Mobile sidebar interaction
function setupMobileInteraction() {
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
    // Function emptied to disable custom cursor completely
    return;
    
    // Original code commented out
    /*
    if (!customCursor) return;
    
    // Only on desktop
    if (window.innerWidth > 768) {
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
                target.closest('.habit-checkbox');
            
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
    */
}

// Setup event listeners
function setupEventListeners() {
    // Add habit button
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', openAddModal);
    }
    
    // Empty state add button
    const emptyStateBtn = document.querySelector('.empty-state .add-habit-btn');
    if (emptyStateBtn) {
        emptyStateBtn.addEventListener('click', openAddModal);
    }
    
    // Form submissions
    addHabitForm.addEventListener('submit', addHabit);
    editHabitForm.addEventListener('submit', editHabit);
    
    // Close modals
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Cancel button
    if (cancelHabitButton) {
        cancelHabitButton.addEventListener('click', closeModals);
    }
    
    // Delete button
    if (deleteHabitButton) {
        deleteHabitButton.addEventListener('click', deleteHabit);
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === addHabitModal || e.target === editHabitModal) {
            closeModals();
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
    
    // Profile dropdown click functionality using new IDs
    const profileButton = document.getElementById('profile-dropdown-btn');
    const profileMenu = document.getElementById('profile-dropdown-menu');
    
    if (profileButton && profileMenu) {
        console.log('Profile elements found with new IDs:', profileButton, profileMenu);
        
        // Handle click on profile button
        profileButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Profile button clicked');
            profileMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileMenu.classList.contains('show') && 
                !profileButton.contains(e.target) && 
                !profileMenu.contains(e.target)) {
                console.log('Clicking outside, closing menu');
                profileMenu.classList.remove('show');
            }
        });
    } else {
        // Fallback to class-based selectors if IDs not found
        const userMenu = document.querySelector('.user-menu');
        const dropdownContent = document.querySelector('.dropdown-content');
        
        if (userMenu && dropdownContent) {
            console.log('Falling back to class selectors for profile menu');
            
            userMenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdownContent.classList.toggle('show');
            });
            
            document.addEventListener('click', function(e) {
                if (dropdownContent.classList.contains('show') && 
                    !userMenu.contains(e.target) && 
                    !dropdownContent.contains(e.target)) {
                    dropdownContent.classList.remove('show');
                }
            });
        }
    }
}

// Custom toast notification for streak celebrations
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius-full);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        text-align: center;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', init); 