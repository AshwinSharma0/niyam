// Statistics Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleButtons = document.querySelectorAll('#sidebar-theme-toggle, #header-theme-toggle');
    const timeRangeButtons = document.querySelectorAll('.time-range-btn');
    const habitFilter = document.getElementById('habit-filter');
    const chartTypeButtons = document.querySelectorAll('.chart-type-btn');
    const trendChart = document.getElementById('trend-chart');
    const categoryChart = document.getElementById('category-chart');
    const habitCalendar = document.getElementById('habit-calendar');
    const performanceTableBody = document.getElementById('performance-table-body');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const customCursor = document.querySelector('.custom-cursor');

    // Chart instances
    let trendChartInstance = null;
    let categoryChartInstance = null;
    let calendarInstance = null;

    // Constants
    const STORAGE_KEY = 'niyam-data';
const THEME_KEY = 'niyam-theme';

    // State
    let habits = [];
    let habitHistory = {};
    let currentRange = 'week';
    let currentHabitFilter = 'all';
    let chartType = 'line';
    
    // Initialize
    init();
    setupSidebar();
    setupCustomCursor();

    // Initialize everything
    function init() {
        loadData();
        initCalendar();
        populateHabitFilter();
        updateSummaryStats();
        updateCharts();
        updatePerformanceTable();
        updateInsights();
        initTheme();
        setupEventListeners();
    }

    // Load habit data from localStorage
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        
        if (data) {
            const parsedData = JSON.parse(data);
            habits = parsedData.habits || [];
            habitHistory = parsedData.history || {};
        }

        // If no data, create sample data for demonstration
        if (habits.length === 0) {
            createSampleData();
        }
    }

    // Create sample data for demonstration
    function createSampleData() {
        // Sample habit categories
        const categories = ['health', 'productivity', 'mindfulness', 'learning', 'other'];
        
        // Sample habit names
        const habitNames = [
            'Morning Workout',
            'Read 30 minutes',
            'Meditation',
            'Drink 8 glasses of water',
            'Study coding',
            'Journal writing',
            'Take vitamins'
        ];

        // Generate sample habits
        habits = habitNames.map((name, index) => ({
            id: 'sample-' + (index + 1),
            title: name,
            category: categories[Math.floor(Math.random() * categories.length)],
            completed: Math.random() > 0.3,
            createdAt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString()
        }));

        // Generate sample history (past 60 days)
        habitHistory = {};
        const today = new Date();
        
        for (let i = 1; i <= 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            // Random completion rate between 40% and 95%
            const completionRate = 0.4 + (Math.random() * 0.55);
            const completedCount = Math.floor(habits.length * completionRate);
            
            habitHistory[dateString] = {
                completedCount,
                totalCount: habits.length,
                allCompleted: completedCount === habits.length
            };
        }
    }

    // Initialize Fullcalendar
    function initCalendar() {
        if (!habitCalendar) return;
        
        calendarInstance = new FullCalendar.Calendar(habitCalendar, {
            initialView: 'dayGridMonth',
            height: 'auto',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
            },
            events: generateCalendarEvents(),
            eventClick: function(info) {
                alert(`Date: ${info.event.start.toDateString()}\nCompleted: ${info.event.title}`);
            },
            eventColor: '#5b21b6',
            contentHeight: 'auto',
            themeSystem: 'standard',
            viewDidMount: function() {
                setTimeout(function() {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            }
        });
        
        calendarInstance.render();
        
        setTimeout(function() {
            adjustCalendarHeight();
            ensurePerformanceCardVisibility();
        }, 300);
        
        window.addEventListener('resize', function() {
            adjustCalendarHeight();
            ensurePerformanceCardVisibility();
        });
    }

    // Adjust calendar height based on content
    function adjustCalendarHeight() {
        const calendarEl = document.getElementById('habit-calendar');
        const calendarCard = document.querySelector('.calendar-card');
        
        if (calendarEl && calendarCard) {
            const viewportHeight = window.innerHeight;
            const maxHeight = Math.min(350, viewportHeight * 0.4);
            calendarEl.style.maxHeight = maxHeight + 'px';
        }
    }

    // Ensure performance card isn't hidden
    function ensurePerformanceCardVisibility() {
        const performanceCard = document.querySelector('.performance-card');
        const calendarCard = document.querySelector('.calendar-card');
        
        if (performanceCard && calendarCard) {
            const calendarRect = calendarCard.getBoundingClientRect();
            const calendarBottom = calendarRect.bottom;
            
            performanceCard.style.marginTop = '20px';
        }
    }

    // Generate calendar events from habit history
    function generateCalendarEvents() {
        const events = [];
        
        // Loop through habit history
        Object.entries(habitHistory).forEach(([dateStr, dayData]) => {
            const completionPercentage = (dayData.completedCount / dayData.totalCount) * 100;
            let color;
            
            // Color based on completion percentage
            if (completionPercentage === 100) {
                color = '#10b981'; // Perfect day - green
            } else if (completionPercentage >= 75) {
                color = '#6366f1'; // Great day - indigo
            } else if (completionPercentage >= 50) {
                color = '#f59e0b'; // OK day - amber
            } else {
                color = '#ef4444'; // Poor day - red
            }
            
            events.push({
                title: `${dayData.completedCount}/${dayData.totalCount} habits completed`,
                start: dateStr,
                backgroundColor: color,
                borderColor: color,
                allDay: true,
                extendedProps: {
                    percentage: completionPercentage
                }
            });
        });
        
        return events;
    }

    // Populate habit filter dropdown
    function populateHabitFilter() {
        if (!habitFilter) return;
        
        // Clear existing options except "All Habits"
        while (habitFilter.options.length > 1) {
            habitFilter.remove(1);
        }
        
        // Get unique habit names
        const uniqueHabits = [...new Set(habits.map(habit => habit.title || habit.name))];
        
        // Add options to select
        uniqueHabits.forEach(habit => {
            const option = document.createElement('option');
            option.value = habit;
            option.textContent = habit;
            habitFilter.appendChild(option);
        });
    }

    // Update summary statistics
    function updateSummaryStats() {
        // Get elements
        const completionRateEl = document.getElementById('completion-rate');
        const bestStreakEl = document.getElementById('best-streak');
        const totalCompletionsEl = document.getElementById('total-completions');
        const perfectDaysEl = document.getElementById('perfect-days');
        
        // Calculate stats
        const stats = calculateStats();
        
        // Update UI
        if (completionRateEl) completionRateEl.textContent = `${stats.completionRate}%`;
        if (bestStreakEl) bestStreakEl.textContent = `${stats.bestStreak} days`;
        if (totalCompletionsEl) totalCompletionsEl.textContent = stats.totalCompletions;
        if (perfectDaysEl) perfectDaysEl.textContent = `${stats.perfectDays} days`;
    }

    // Calculate statistics from habit history
    function calculateStats() {
        let totalCompletions = 0;
        let totalHabits = 0;
        let perfectDays = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        let lastDate = null;
        
        // Sort dates in chronological order
        const sortedDates = Object.keys(habitHistory).sort();
        
        // Calculate streak and perfect days
        sortedDates.forEach(dateStr => {
            const dayData = habitHistory[dateStr];
            
            totalCompletions += dayData.completedCount;
            totalHabits += dayData.totalCount;
            
            if (dayData.allCompleted) {
                perfectDays++;
                
                // Check if this date continues the streak
                const currentDate = new Date(dateStr);
                
                if (lastDate) {
                    const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 1) {
                        // Continue streak
                        currentStreak++;
                    } else {
                        // Reset streak
                        currentStreak = 1;
                    }
                } else {
                    currentStreak = 1;
                }
                
                lastDate = currentDate;
                
                // Update best streak if needed
                if (currentStreak > bestStreak) {
                    bestStreak = currentStreak;
                }
            } else {
                // Reset streak on incomplete days
                currentStreak = 0;
                lastDate = null;
            }
        });
        
        // Calculate completion rate
        const completionRate = totalHabits > 0 ? Math.round((totalCompletions / totalHabits) * 100) : 0;
        
        return {
            completionRate,
            bestStreak,
            totalCompletions,
            perfectDays
        };
    }

    // Update trend and category charts
    function updateCharts() {
        updateTrendChart();
        updateCategoryChart();
    }

    // Update trend chart
    function updateTrendChart() {
        if (!trendChart) return;
        
        // Get data based on selected time range
        const { labels, data } = getTrendData();
        
        // Destroy previous chart if it exists
        if (trendChartInstance) {
            trendChartInstance.destroy();
        }
        
        // Create new chart
        const ctx = trendChart.getContext('2d');
        
        trendChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion Rate',
                    data: data,
                    backgroundColor: 'rgba(91, 33, 182, 0.6)',
                    borderColor: 'rgba(91, 33, 182, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#5b21b6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    fill: chartType === 'line' ? 'start' : undefined,
                    borderRadius: chartType === 'bar' ? 5 : undefined
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            color: getComputedStyle(document.body).getPropertyValue('--text-light-mode')
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-light-mode')
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Completion Rate: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Get trend data based on selected time range
    function getTrendData() {
        const today = new Date();
        const labels = [];
        const data = [];
        
        let days = 7; // default to week
        
        // Set number of days based on range
        if (currentRange === 'month') {
            days = 30;
        } else if (currentRange === 'year') {
            days = 365;
        } else if (currentRange === 'all') {
            days = 1000; // some large number
        }
        
        // Loop backwards from today
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            // Format label based on time range
            let label;
            if (currentRange === 'week' || currentRange === 'month') {
                label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            } else if (currentRange === 'year') {
                label = date.toLocaleDateString('en-US', { month: 'short' });
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
            
            // Skip labels for yearly view (too many)
            if (currentRange === 'year' && date.getDate() !== 1) {
                continue;
            }
            
            // Skip labels for all-time view (too many)
            if (currentRange === 'all' && (date.getDate() !== 1 || date.getMonth() % 2 !== 0)) {
                continue;
            }
            
            // Get completion percentage for this day
            let percentage = 0;
            if (habitHistory[dateString]) {
                percentage = Math.round((habitHistory[dateString].completedCount / habitHistory[dateString].totalCount) * 100);
            }
            
            // Filter by specific habit if selected
            if (currentHabitFilter !== 'all') {
                // In a real app, we'd have more detailed history here
                // For this demo, we'll use random data
                percentage = Math.floor(Math.random() * 100);
            }
            
            labels.push(label);
            data.push(percentage);
        }
        
        return { labels, data };
    }

    // Update category chart
    function updateCategoryChart() {
        if (!categoryChart) return;
        
        // Categorize habits
        const categories = {};
        
        // Count habits by category
        habits.forEach(habit => {
            if (!categories[habit.category]) {
                categories[habit.category] = {
                    total: 0,
                    completed: 0
                };
            }
            
            categories[habit.category].total++;
            if (habit.completed) {
                categories[habit.category].completed++;
            }
        });
        
        // Prepare data for chart
        const labels = [];
        const completionData = [];
        const totalCountData = [];
        
        Object.entries(categories).forEach(([category, data]) => {
            labels.push(category.charAt(0).toUpperCase() + category.slice(1));
            completionData.push(data.completed);
            totalCountData.push(data.total);
        });
        
        // Destroy previous chart if it exists
        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }
        
        // Create new chart
        const ctx = categoryChart.getContext('2d');
        
        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: completionData,
                    backgroundColor: [
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: [
                        'rgba(124, 58, 237, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(236, 72, 153, 1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            color: getComputedStyle(document.body).getPropertyValue('--text')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update performance table
    function updatePerformanceTable() {
        if (!performanceTableBody) return;
        
        // Clear existing rows
        performanceTableBody.innerHTML = '';
        
        // Create table rows for each habit
        habits.forEach(habit => {
            const row = document.createElement('tr');
            
            // Habit name
            const nameCell = document.createElement('td');
            nameCell.textContent = habit.title || habit.name;
            row.appendChild(nameCell);
            
            // Category
            const categoryCell = document.createElement('td');
            categoryCell.textContent = habit.category.charAt(0).toUpperCase() + habit.category.slice(1);
            row.appendChild(categoryCell);
            
            // Completion rate (random for demo)
            const completionCell = document.createElement('td');
            const completionRate = Math.floor(Math.random() * 100);
            completionCell.textContent = `${completionRate}%`;
            row.appendChild(completionCell);
            
            // Current streak (random for demo)
            const currentStreakCell = document.createElement('td');
            const currentStreak = Math.floor(Math.random() * 10);
            currentStreakCell.textContent = `${currentStreak} days`;
            row.appendChild(currentStreakCell);
            
            // Best streak (random for demo)
            const bestStreakCell = document.createElement('td');
            const bestStreak = Math.max(currentStreak, Math.floor(Math.random() * 30));
            bestStreakCell.textContent = `${bestStreak} days`;
            row.appendChild(bestStreakCell);
            
            // Add row to table
            performanceTableBody.appendChild(row);
        });
    }

    // Update insights section
    function updateInsights() {
        // For demo purposes, we'll just use the existing content
        // In a real app, this would analyze the habit data and generate insights
        
        // Most consistent habit
        const consistentHabit = document.getElementById('consistent-habit');
        if (consistentHabit && habits.length > 0) {
            const randomIndex = Math.floor(Math.random() * habits.length);
            consistentHabit.textContent = habits[randomIndex].title || habits[randomIndex].name;
        }
        
        // Struggling habit
        const strugglingHabit = document.getElementById('struggling-habit');
        if (strugglingHabit && habits.length > 0) {
            const randomIndex = Math.floor(Math.random() * habits.length);
            strugglingHabit.textContent = habits[randomIndex].title || habits[randomIndex].name;
        }
        
        // Best day of the week
        const bestDay = document.getElementById('best-day');
        if (bestDay) {
            const days = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
            bestDay.textContent = days[Math.floor(Math.random() * days.length)];
        }
        
        // Trend direction
        const trendDirection = document.getElementById('trend-direction');
        const trendPercentage = document.getElementById('trend-percentage');
        if (trendDirection && trendPercentage) {
            const isImproving = Math.random() > 0.3;
            trendDirection.textContent = isImproving ? 'improving' : 'declining';
            trendPercentage.textContent = `${Math.floor(Math.random() * 20)}%`;
        }
    }

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcons(true);
        }
        
        // Setup theme toggle
        themeToggleButtons.forEach(button => {
            button.addEventListener('click', toggleTheme);
        });
    }

    // Toggle between light and dark themes
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        
        updateThemeIcons(isDark);
        
        // Update charts with new theme colors
        updateCharts();
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

    // Setup event listeners
    function setupEventListeners() {
        // Time range buttons
        timeRangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                timeRangeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update range and refresh chart
                currentRange = button.dataset.range;
                updateCharts();
            });
        });
        
        // Habit filter
        if (habitFilter) {
            habitFilter.addEventListener('change', () => {
                currentHabitFilter = habitFilter.value;
                updateCharts();
            });
        }
        
        // Chart type buttons
        chartTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                chartTypeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update chart type and refresh chart
                chartType = button.dataset.type;
                updateTrendChart();
            });
        });
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
                    target.closest('select');
                
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