// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });
    
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const loginSection = document.querySelector('.login-section');
    const registerSection = document.querySelector('.register-section');
    const forgotSection = document.querySelector('.forgot-section');
    const switchToRegisterBtn = document.getElementById('switch-to-register');
    const switchToLoginBtn = document.getElementById('switch-to-login');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const backToLoginBtn = document.getElementById('back-to-login');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const successModal = document.getElementById('success-modal');
    const successBtn = document.getElementById('success-btn');
    const successMessage = document.getElementById('success-message');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const registerPassword = document.getElementById('register-password');
    const strengthSegments = document.querySelectorAll('.strength-segment');
    const strengthText = document.querySelector('.strength-text');
    const themeToggle = document.getElementById('theme-toggle');
    const customCursor = document.querySelector('.custom-cursor');
    
    // Initialize theme
    initTheme();
    setupCustomCursor();
    
    // Event Listeners
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('register');
        });
    }
    
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });
    }
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('forgot');
        });
    }
    
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });
    }
    
    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.input-with-icon').querySelector('input');
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Password strength meter
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Success modal close
    if (successBtn) {
        successBtn.addEventListener('click', () => {
            hideModal(successModal);
            
            // Redirect to dashboard if coming from register or login
            if (successBtn.dataset.action === 'redirect') {
                window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Functions
    function switchForm(formType) {
        // Hide all sections first
        loginSection.classList.remove('active');
        registerSection.classList.remove('active');
        forgotSection.classList.remove('active');
        
        // Show the requested section
        if (formType === 'login') {
            loginSection.classList.add('active');
        } else if (formType === 'register') {
            registerSection.classList.add('active');
        } else if (formType === 'forgot') {
            forgotSection.classList.add('active');
        }
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!email) {
            showError('Please enter your email address');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        if (!password) {
            showError('Please enter your password');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        showLoading();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            hideLoading();

            if (!response.ok) {
                const message = data.message || (data.errors && data.errors[0]?.msg) || 'Login failed';
                showError(message);
                return;
            }

            localStorage.setItem('niyam-token', data.token);
            localStorage.setItem('niyam-user', JSON.stringify(data.user || {}));
            successMessage.textContent = 'Login successful! Redirecting to dashboard...';
            successBtn.textContent = 'Continue to Dashboard';
            successBtn.dataset.action = 'redirect';
            showModal(successModal);
        } catch (error) {
            hideLoading();
            showError('Unable to connect to the server. Please try again.');
        }
    }
    
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const termsChecked = document.getElementById('agree-terms').checked;
        
        if (!username) {
            showError('Please enter your full name');
            return;
        }
        
        if (!email) {
            showError('Please enter your email address');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        if (!termsChecked) {
            showError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        
        showLoading();

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            hideLoading();

            if (!response.ok) {
                const message = data.message || (data.errors && data.errors[0]?.msg) || 'Registration failed';
                showError(message);
                return;
            }

            localStorage.setItem('niyam-token', data.token);
            localStorage.setItem('niyam-user', JSON.stringify(data.user || {}));
            successMessage.textContent = 'Your account has been created successfully!';
            successBtn.textContent = 'Get Started';
            successBtn.dataset.action = 'redirect';
            showModal(successModal);
        } catch (error) {
            hideLoading();
            showError('Unable to connect to the server. Please try again.');
        }
    }
    
    function handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value;
        
        // Simple validation
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        // Show loading
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            hideLoading();
            
            // Simulate successful password reset request
            successMessage.textContent = 'Password reset link has been sent to your email!';
            successBtn.textContent = 'OK';
            successBtn.dataset.action = 'close';
            showModal(successModal);
        }, 1500);
    }
    
    function updatePasswordStrength() {
        const password = registerPassword.value;
        let strength = 0;
        
        // Reset all segments
        strengthSegments.forEach(segment => {
            segment.className = 'strength-segment';
        });
        
        // Check password strength
        if (password.length > 0) {
            // Length check
            if (password.length >= 8) strength++;
            
            // Contains number
            if (/\d/.test(password)) strength++;
            
            // Contains lowercase and uppercase
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            
            // Contains special character
            if (/[^a-zA-Z0-9]/.test(password)) strength++;
        }
        
        // Update UI based on strength
        for (let i = 0; i < strength; i++) {
            if (strength === 1) {
                strengthSegments[i].classList.add('weak');
            } else if (strength === 2 || strength === 3) {
                strengthSegments[i].classList.add('medium');
            } else if (strength === 4) {
                strengthSegments[i].classList.add('strong');
            }
        }
        
        // Update text
        if (strength === 0) {
            strengthText.textContent = 'Password strength';
        } else if (strength === 1) {
            strengthText.textContent = 'Weak';
        } else if (strength === 2) {
            strengthText.textContent = 'Medium';
        } else if (strength === 3) {
            strengthText.textContent = 'Good';
        } else {
            strengthText.textContent = 'Strong';
        }
    }
    
    function showModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    function hideModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
        }
    }
    
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }
    }
    
    function initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('niyam-theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcon(true);
        }
    }
    
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('niyam-theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }
    
    function updateThemeIcon(isDark) {
        const icon = themeToggle.querySelector('i');
        
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }
    
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
    
    // Helper function to show error messages
    function showError(message) {
        // Check if error message element exists, if not create one
        let errorElement = document.getElementById('auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'auth-error';
            errorElement.className = 'error-message';
            
            // Insert after the currently active form
            const activeForm = document.querySelector('.form-section.active .auth-form');
            if (activeForm) {
                activeForm.insertAdjacentElement('afterbegin', errorElement);
            }
        }
        
        // Set error message and add shake animation
        errorElement.textContent = message;
        errorElement.classList.add('shake');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            if (errorElement) {
                errorElement.classList.remove('shake');
            }
        }, 500);
    }
}); 