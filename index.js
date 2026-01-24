// ============================================
// TERMS & CONDITIONS FUNCTIONALITY
// ============================================

const loginTermsCheckbox = document.getElementById('loginTermsCheckbox');
const signupTermsCheckbox = document.getElementById('signupTermsCheckbox');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const signupSubmitBtn = document.getElementById('signupSubmitBtn');
const termsModalOverlay = document.getElementById('termsModalOverlay');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const roleSelect = document.getElementById('roleSelect');
const lawyerFields = document.getElementById('lawyerFields');

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    // Reset checkboxes
    loginTermsCheckbox.checked = false;
    signupTermsCheckbox.checked = false;
    
    // Disable submit buttons initially
    loginSubmitBtn.disabled = true;
    signupSubmitBtn.disabled = true;
    
    // Add event listeners for checkbox changes
    loginTermsCheckbox.addEventListener('change', updateLoginButtonState);
    signupTermsCheckbox.addEventListener('change', updateSignupButtonState);
    
    // Tab switching
    loginTab.addEventListener('click', switchToLoginTab);
    signupTab.addEventListener('click', switchToSignupTab);
    
    // Form switching with text links
    switchToSignup.addEventListener('click', switchToSignupTab);
    switchToLogin.addEventListener('click', switchToLoginTab);
    
    // Role selection for lawyer-specific fields
    roleSelect.addEventListener('change', toggleLawyerFields);
    
    // Form submission
    loginForm.addEventListener('submit', handleLoginSubmit);
    signupForm.addEventListener('submit', handleSignupSubmit);
});

// ============================================
// UPDATE BUTTON STATES
// ============================================

function updateLoginButtonState() {
    loginSubmitBtn.disabled = !loginTermsCheckbox.checked;
}

function updateSignupButtonState() {
    signupSubmitBtn.disabled = !signupTermsCheckbox.checked;
}

// ============================================
// TAB SWITCHING
// ============================================

function switchToLoginTab() {
    loginForm.classList.add('active-form');
    signupForm.classList.remove('active-form');
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
}

function switchToSignupTab() {
    signupForm.classList.add('active-form');
    loginForm.classList.remove('active-form');
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
}

// ============================================
// LAWYER FIELDS TOGGLE
// ============================================

function toggleLawyerFields() {
    const selectedRole = roleSelect.value;
    
    if (selectedRole === 'lawyer') {
        lawyerFields.classList.remove('hidden');
    } else {
        lawyerFields.classList.add('hidden');
    }
}

// ============================================
// FORM SUBMISSION HANDLERS
// ============================================

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const termsAccepted = loginTermsCheckbox.checked;
    
    if (!termsAccepted) {
        showStatus('Please accept Terms & Conditions', 'error');
        return;
    }
    
    if (!email || !password) {
        showStatus('Please fill in all fields', 'error');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address', 'error');
        return;
    }
    
    // Store user data in sessionStorage (optional, for dashboard access)
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userType', 'login');
    sessionStorage.setItem('termsAccepted', 'true');
    
    // Show success message
    showStatus('Login successful! Redirecting to dashboard...', 'success');
    console.log('Login:', { email, termsAccepted });
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function handleSignupSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = roleSelect.value;
    const termsAccepted = signupTermsCheckbox.checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
        showStatus('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showStatus('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showStatus('Password must be at least 8 characters', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showStatus('Please accept Terms & Conditions', 'error');
        return;
    }
    
    // If lawyer, check additional fields
    if (role === 'lawyer') {
        const firmName = document.getElementById('firmName').value;
        const country = document.getElementById('country').value;
        
        if (!firmName || !country) {
            showStatus('Please fill in firm details', 'error');
            return;
        }
        
        // Store lawyer details
        sessionStorage.setItem('barNumber', document.getElementById('barNumber').value);
        sessionStorage.setItem('firmName', firmName);
        sessionStorage.setItem('country', country);
    }
    
    // Store user data in sessionStorage (for dashboard access)
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userType', 'signup');
    sessionStorage.setItem('termsAccepted', 'true');
    
    // Show success message
    showStatus('Account created successfully! Redirecting to dashboard...', 'success');
    console.log('Signup:', { name, email, role, termsAccepted });
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// ============================================
// EMAIL VALIDATION
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// STATUS MESSAGES
// ============================================

function showStatus(message, type) {
    const statusDiv = document.getElementById('authStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status show ${type}`;
    
    if (type === 'error') {
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 4000);
    }
}

// ============================================
// TERMS & CONDITIONS MODAL
// ============================================

function openTermsModal(event) {
    event.preventDefault();
    termsModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
    termsModalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside content
termsModalOverlay.addEventListener('click', function(e) {
    if (e.target === termsModalOverlay) {
        closeTermsModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && termsModalOverlay.classList.contains('active')) {
        closeTermsModal();
    }
});
