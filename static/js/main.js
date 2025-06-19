document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = form?.querySelector('button[type="submit"]');
    
    if (form && submitButton) {
        form.addEventListener('submit', function(e) {
            // Show loading state
            showLoading(true, submitButton);
            
            // Add a small delay to show the loading animation
            setTimeout(() => {
                showLoading(false, submitButton);
            }, 1000);
        });
        
        if (window.location.search.includes('success')) {
            setTimeout(() => {
                celebrateSuccess();
            }, 500);
        }
    }
    
    // Add focus animations to form inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
        
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.parentNode.classList.add('has-value');
            } else {
                this.parentNode.classList.remove('has-value');
            }
        });
    });
    
    const flashMessages = document.querySelectorAll('.flash-messages li');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
});

function showLoading(show, button) {
    if (!button) return;
    
    if (show) {
        button.disabled = true;
        button.innerHTML = '<div class="spinner"></div> Processing...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.innerHTML = 'Donate Now 💖';
        button.style.opacity = '1';
    }
}

// Add smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.querySelector('form');
        if (form) {
            e.preventDefault();
            form.submit();
        }
    }
});

// Enhanced button interactions
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn, .nav-btn, .link-btn')) {
        const button = e.target;
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

const amountInput = document.getElementById("amount");
if (amountInput) {
    amountInput.addEventListener("input", function (e) {
        // Remove non-digit characters
        const rawValue = this.value.replace(/\D/g, "");

        // Format as ID-style
        const formatted = new Intl.NumberFormat('id-ID').format(rawValue);

        // Show formatted in visible field
        this.setAttribute("data-raw", rawValue);
        this.value = formatted;
    });

    const form = document.getElementById("donation-form");
    form.addEventListener("submit", function () {
        if (amountInput.getAttribute("data-raw")) {
            amountInput.value = amountInput.getAttribute("data-raw");
        }
    });
}