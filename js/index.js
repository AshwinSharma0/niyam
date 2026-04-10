// Initialize AOS animation library
AOS.init({
    duration: 800,
    easing: 'ease',
    once: true,
    offset: 100,
    delay: 0
});

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.header-nav');
    const faqItems = document.querySelectorAll('.faq-item');
    const counters = document.querySelectorAll('.counter');
    const customCursor = document.querySelector('.custom-cursor');
    const themeToggle = document.querySelector('#theme-toggle');
    
    // Tab elements
    const previewTabs = document.querySelectorAll('.preview-tab');
    const previewContents = document.querySelectorAll('.preview-content');
    const testimonialTabs = document.querySelectorAll('.testimonial-tab');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    // Initialize Theme
    initTheme();
    
    // Mobile Navigation Toggle
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('show')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // FAQ Accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle the clicked item
            item.classList.toggle('active');
        });
    });
    
    // Counter Animation
    const startCounters = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 30); // Update every 30ms
            
            let count = 0;
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    if (count > target) count = target;
                    counter.textContent = Math.floor(count).toLocaleString();
                    requestAnimationFrame(updateCount);
                }
            };
            
            updateCount();
        });
    };
    
    // Start counters when they come into view
    const observeCounters = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observeCounters.disconnect();
            }
        });
    });
    
    if (counters.length > 0) {
        observeCounters.observe(document.querySelector('.stats'));
    }
    
    // Custom cursor
    if (customCursor) {
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
                    target.closest('.faq-question');
                
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
    
    // Theme toggling
    function initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('niyam-theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcon(true);
        }
        
        // Setup theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }
    
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('niyam-theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }
    
    function updateThemeIcon(isDark) {
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Tab functionality for App Preview
    if (previewTabs.length > 0 && previewContents.length > 0) {
        // Show the first tab content by default
        previewContents[0].classList.add('active');
        previewTabs[0].classList.add('active');
        
        // Add click event listeners to tabs
        previewTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                showPreviewTab(index);
            });
        });
        
        // Navigation with buttons
        const prevButton = document.querySelector('.preview-prev');
        const nextButton = document.querySelector('.preview-next');
        
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                // Find current active tab index
                const currentIndex = Array.from(previewTabs).findIndex(tab => 
                    tab.classList.contains('active')
                );
                
                // Calculate previous index (loop to last if at first)
                const prevIndex = currentIndex === 0 
                    ? previewTabs.length - 1 
                    : currentIndex - 1;
                
                showPreviewTab(prevIndex);
            });
            
            nextButton.addEventListener('click', () => {
                // Find current active tab index
                const currentIndex = Array.from(previewTabs).findIndex(tab => 
                    tab.classList.contains('active')
                );
                
                // Calculate next index (loop to first if at last)
                const nextIndex = currentIndex === previewTabs.length - 1 
                    ? 0 
                    : currentIndex + 1;
                
                showPreviewTab(nextIndex);
            });
        }
        
        // Function to display a specific tab
        function showPreviewTab(index) {
            // Find currently active tab
            const currentActiveTab = Array.from(previewContents).findIndex(content => 
                content.classList.contains('active')
            );
            
            // Apply exit animation to current active content
            if (currentActiveTab !== -1) {
                previewContents[currentActiveTab].classList.add('exit');
                
                // Short delay to allow exit animation to play
                setTimeout(() => {
                    previewContents[currentActiveTab].classList.remove('active');
                    previewContents[currentActiveTab].classList.remove('exit');
                    
                    // Show the specified tab content
                    previewContents[index].classList.add('active');
                }, 300);
            } else {
                // Just show the specified tab content if no active tab
                previewContents[index].classList.add('active');
            }
            
            // Remove active class from all tabs
            previewTabs.forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active to selected tab
            previewTabs[index].classList.add('active');
        }
    }
    
    // Tab functionality for Testimonials
    if (testimonialTabs.length > 0 && testimonialCards.length > 0) {
        // Show the first testimonial by default
        testimonialCards[0].classList.add('active');
        testimonialTabs[0].classList.add('active');
        
        // Add click event listeners to tabs
        testimonialTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                showTestimonial(index);
            });
        });
        
        // Function to display a specific testimonial
        function showTestimonial(index) {
            // Find currently active testimonial
            const currentActiveIndex = Array.from(testimonialCards).findIndex(card => 
                card.classList.contains('active')
            );
            
            // Don't do anything if clicking the already active tab
            if (currentActiveIndex === index) return;
            
            // Apply exit animation to current active testimonial
            if (currentActiveIndex !== -1) {
                testimonialCards[currentActiveIndex].classList.add('exit');
                
                // Short delay to allow exit animation to play
                setTimeout(() => {
                    testimonialCards[currentActiveIndex].classList.remove('active');
                    testimonialCards[currentActiveIndex].classList.remove('exit');
                    
                    // Show the specified testimonial
                    testimonialCards[index].classList.add('active');
                }, 300);
            } else {
                // Just show the specified testimonial if no active one
                testimonialCards[index].classList.add('active');
            }
            
            // Remove active class from all tabs
            testimonialTabs.forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active to selected tab
            testimonialTabs[index].classList.add('active');
        }
    }
    
    // Navbar scroll effect
    const header = document.querySelector('.landing-header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            if (window.scrollY < lastScrollY) {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            } else {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            }
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = window.scrollY;
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Close mobile nav if open
            if (navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                if (mobileNavToggle) {
                    const icon = mobileNavToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}); 