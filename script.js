// Global variable to store selected plan
let selectedPlan = '';

// Plan selection function
function selectPlan(plan) {
    selectedPlan = plan;
    
    // Update the form dropdown
    const planSelect = document.getElementById('plan');
    if (planSelect) {
        planSelect.value = plan;
    }
    
    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Show success message
    const planNames = {
        'basic': 'Basic ($39.99/month)',
        'professional': 'Professional ($69.99/month)',
        'enterprise': 'Enterprise ($99.99/month)'
    };
    
    showSuccessMessage(`${planNames[plan]} plan selected! Fill out the form below to get started.`);
}

// Contact form handling
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        plan: document.getElementById('plan').value,
        description: document.getElementById('description').value,
        timestamp: new Date().toISOString(),
        type: 'contact_form'
    };
    
    try {
        // Here you would integrate with Convex
        // For now, we'll show a success message
        const planText = formData.plan ? ` for the ${formData.plan} plan` : '';
        showSuccessMessage(`Thank you! We'll call you within 24 hours to discuss your website rental${planText}.`);
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        console.log('Form data to be sent to Convex:', formData);
    } catch (error) {
        console.error('Error submitting form:', error);
        showErrorMessage('Something went wrong. Please try again or contact us directly.');
    }
});

// Zoom call scheduling
function scheduleZoomCall() {
    const zoomData = {
        type: 'zoom_request',
        timestamp: new Date().toISOString(),
        status: 'requested',
        selectedPlan: selectedPlan || 'not_selected'
    };
    
    try {
        // Here you would integrate with Convex and your Zoom scheduling system
        showSuccessMessage('Zoom call request received! We\'ll send you a calendar invite within a few hours to discuss your website rental needs.');
        
        console.log('Zoom request to be sent to Convex:', zoomData);
    } catch (error) {
        console.error('Error scheduling Zoom call:', error);
        showErrorMessage('Unable to schedule call right now. Please use the contact form instead.');
    }
}

// Success/Error message functions
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add CSS animation class
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.8s ease-out forwards;
    }
    
    section {
        opacity: 0;
    }
    
    section.animate-fade-in {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Auto-select plan from URL parameters (optional feature)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    
    if (planParam && ['basic', 'professional', 'enterprise'].includes(planParam)) {
        selectPlan(planParam);
    }
});