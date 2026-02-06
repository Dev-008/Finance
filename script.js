// Initialize EmailJS with your public key
(function(){
    emailjs.init("R-Yd_5-dTCHstTQoE"); // Replace with your actual EmailJS public key
})();

// Storage
let users = JSON.parse(localStorage.getItem('financeTrackerUsers')) || {};
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let expenses = JSON.parse(localStorage.getItem('userExpenses')) || {};
let savingsGoals = JSON.parse(localStorage.getItem('userSavingsGoals')) || {};

// Initialize user's data storage
function initializeUserData() {
    if (currentUser && currentUser.email) {
        if (!expenses[currentUser.email]) {
            expenses[currentUser.email] = [];
        }
        if (!savingsGoals[currentUser.email]) {
            savingsGoals[currentUser.email] = [];
        }
    }
}

// EmailJS configuration check
const EMAILJS_CONFIGURED = true; // Will be true once user sets up EmailJS

window.onload = function() {
    // Set today's date as default in date inputs
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('expense-date')) {
        document.getElementById('expense-date').value = today;
    }
    if (document.getElementById('goal-deadline')) {
        document.getElementById('goal-deadline').value = today;
    }
    
    // Get the last viewed section
    const lastSection = localStorage.getItem('lastViewedSection');
    
    // Check if user is logged in
    if (currentUser && currentUser.email) {
        initializeUserData();
        updateNavbar();
        
        // Restore to the page they were on
        if (lastSection && lastSection !== 'signin' && lastSection !== 'signup') {
            // If they were on a logged-in page, restore it
            if (lastSection === 'dashboard') {
                showDashboard();
            } else {
                showSection(lastSection);
            }
        } else {
            // Otherwise show dashboard
            showDashboard();
        }
    } else {
        // User is not logged in - show signin or last auth page
        if (lastSection === 'signup') {
            showSection('signup');
        } else {
            showSection('signin');
        }
    }
    
    // Add scroll listener for animations
    observeElements();
    
    // Close modal when clicking outside of it
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeEditProfileModal();
            }
        });
    }
};

// Toggle responsive menu
function toggleMenu() {
    const menu = document.getElementById('navbar-menu');
    menu.classList.toggle('active');
}

// Update navbar based on login status
function updateNavbar() {
    const logoutMenu = document.getElementById('logout-menu');
    if (currentUser) {
        logoutMenu.style.display = 'block';
    } else {
        logoutMenu.style.display = 'none';
    }
}

// Handle navigation from navbar
function handleNavigation(section) {
    closeMenu();
    if (section === 'home') {
        if (currentUser) {
            showDashboard();
        } else {
            showSection('signin');
        }
    } else if (section === 'dashboard') {
        if (currentUser) {
            showDashboard();
        } else {
            showError('Please sign in first!');
            showSection('signin');
        }
    } else if (section === 'logout') {
        handleLogout();
    } else if (section === 'help') {
        showHelpModal();
    } else if (section === 'settings') {
        if (currentUser) {
            showSettings();
        } else {
            showError('Please sign in first!');
            showSection('signin');
        }
    }
}

// Close menu
function closeMenu() {
    const menu = document.getElementById('navbar-menu');
    menu.classList.remove('active');
}

// Show help modal
function showHelpModal() {
    const helpContent = `
        <h2 style="color: #1f2937; margin-bottom: 20px;">📖 Help & Guide</h2>
        <div style="color: #6b7280; line-height: 1.8;">
            <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">📊 Dashboard</h3>
            <p>View your financial overview with expense totals, savings progress, and transaction history.</p>
            
            <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">➕ Add Expense</h3>
            <p>Track your spending by adding expenses with categories, amounts, and dates.</p>
            
            <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">📋 View Expenses</h3>
            <p>See all your expenses organized by category with filtering options.</p>
            
            <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">💰 Savings Planner</h3>
            <p>Set savings goals with target amounts, track progress, and manage multiple goals.</p>
            
            <h3 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">📈 Investment Calculator</h3>
            <p>Calculate compound interest and investment growth with different compounding frequencies.</p>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    content.innerHTML = helpContent + `
        <button onclick="this.closest('[style*=position]').remove()" 
            style="
                width: 100%;
                margin-top: 25px;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                font-size: 16px;
            ">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Intersection Observer for scroll animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.stat-card, .expense-item, .goal-item').forEach(el => {
        observer.observe(el);
    });
}

function showSection(section) {
    // Save current section to localStorage
    localStorage.setItem('lastViewedSection', section);
    
    document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    
    if (section === 'signin' || section === 'signup') {
        document.getElementById('main-tabs').style.display = 'flex';
        document.querySelector('.navbar').style.display = 'none';
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.textContent.toLowerCase().includes(section.replace('sign', 'sign '))) {
                tab.classList.add('active');
            }
        });
    } else {
        document.getElementById('main-tabs').style.display = 'none';
        document.querySelector('.navbar').style.display = 'flex';
    }
    
    if (section === 'profile') {
        showProfileInfo();
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REAL Email Sending Function using EmailJS
async function sendRealEmail(to, subject, message, userName = 'User') {
    try {
        showLoading('Sending email...');
        
        // Check if EmailJS is configured
        if (!EMAILJS_CONFIGURED || typeof emailjs === 'undefined') {
            console.log('📧 Email (Simulated):');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Message:', message);
            
            setTimeout(() => {
                removeLoading();
                showInfo(`📧 Email notification prepared for: ${to}<br><small>Subject: ${subject}</small>`);
            }, 1000);
            return true;
        }
        
        // Send email using EmailJS (when configured)
        const templateParams = {
            to_email: to,
            user_name: userName,
            subject: subject,
            message: message
        };
        
        await emailjs.send('service_nm90w8e', 'template_1pzah2v', templateParams);
        
        removeLoading();
        showSuccess(`✅ Email sent successfully to ${to}!`);
        return true;
        
    } catch (error) {
        console.error('Email Error:', error);
        removeLoading();
        showInfo(`📧 Email prepared for: ${to}<br><small>Unable to send: ${error.message || 'EmailJS not configured'}</small>`);
        return false;
    }
}

async function handleSignUp() {
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const terms = document.getElementById('terms').checked;
    
    if (!username || !email || !password || !confirm) {
        showError('Please fill in all fields!');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address!');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    if (password !== confirm) {
        showError('Passwords do not match!');
        return;
    }
    
    if (!terms) {
        showError('Please agree to the Terms of Service!');
        return;
    }
    
    if (users[email]) {
        showError('An account with this email already exists!');
        return;
    }
    
    const newUser = {
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
        verified: true
    };
    
    users[email] = newUser;
    localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
    
    const welcomeMessage = `Welcome to Personal Finance Tracker!

Hello ${username},

Your account has been successfully created!

Account Details:
- Username: ${username}
- Email: ${email}
- Created: ${new Date().toLocaleString()}

You can now sign in and start tracking your expenses, planning savings, and calculating investments.

⚠️ IMPORTANT: If you did not create this account, please reply to this email immediately and we will delete it within 24 hours.

Best regards,
Personal Finance Tracker Team
(Naveena P, Prithika P & Priyamani D)`;
    
    await sendRealEmail(email, 'Welcome to Personal Finance Tracker - Account Created', welcomeMessage, username);
    
    showSuccess('Account created successfully! Check your email for confirmation. Redirecting to sign in...');
    
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
    document.getElementById('terms').checked = false;
    
    setTimeout(() => {
        showSection('signin');
        document.getElementById('signin-username').value = email;
    }, 3000);
}

async function handleSignIn() {
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;
    const remember = document.getElementById('remember-me').checked;
    
    if (!username || !password) {
        showError('Please fill in all fields!');
        return;
    }
    
    let user = null;
    for (let email in users) {
        if (users[email].email === username || users[email].username === username) {
            user = users[email];
            break;
        }
    }
    
    if (!user) {
        showError('Account not found! Please sign up first.');
        return;
    }
    
    if (user.password !== password) {
        showError('Incorrect password!');
        return;
    }
    
    currentUser = user;
    // Always save currentUser so it persists on page refresh
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showSuccess('Login successful! Welcome back, ' + user.username + '!');
    
    setTimeout(() => showDashboard(), 1500);
}

async function handleForgotPassword() {
    const email = document.getElementById('forgot-email').value.trim();
    
    if (!email) {
        showError('Please enter your email address!');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address!');
        return;
    }
    
    if (!users[email]) {
        showError('No account found with this email address!');
        return;
    }
    
    const resetToken = Math.random().toString(36).substr(2, 9).toUpperCase();
    users[email].resetToken = resetToken;
    users[email].resetTokenExpiry = Date.now() + 3600000;
    localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
    
    const resetMessage = `Password Reset Request

Hello ${users[email].username},

We received a request to reset your password for your Personal Finance Tracker account.

Your Password Reset Token: ${resetToken}

This token will expire in 1 hour.

If you didn't request this, please ignore this email and your password will remain unchanged.

For security, if you didn't request this reset, please contact us immediately.

Best regards,
Personal Finance Tracker Team
(Naveena P, Prithika P & Priyamani D)`;
    
    await sendRealEmail(email, 'Password Reset Request - Personal Finance Tracker', resetMessage, users[email].username);
    
    showSuccess('Password reset link sent to your email! Please check your inbox.');
    
    setTimeout(() => showSection('signin'), 3000);
}

async function handleGoogleSignIn() {
    const googleEmail = prompt('🔐 Google Sign-In\n\nEnter your Google email address:');
    
    if (!googleEmail) return;
    
    if (!isValidEmail(googleEmail)) {
        showError('Invalid email address!');
        return;
    }
    
    if (!users[googleEmail]) {
        const username = googleEmail.split('@')[0];
        const newUser = {
            username: username,
            email: googleEmail,
            password: 'google-oauth-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            verified: true,
            provider: 'google'
        };
        
        users[googleEmail] = newUser;
        localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
        
        const welcomeMessage = `Welcome to Personal Finance Tracker!

Hello ${username},

Your account has been successfully created using Google Sign-In!

Account Details:
- Username: ${username}
- Email: ${googleEmail}
- Provider: Google
- Created: ${new Date().toLocaleString()}

You can now access your account anytime using Google Sign-In.

⚠️ IMPORTANT: If you did not create this account, please reply to this email immediately and we will delete it.

Best regards,
Personal Finance Tracker Team
(Naveena P, Prithika P & Priyamani D)`;
        
        await sendRealEmail(googleEmail, 'Welcome to Personal Finance Tracker - Google Account Created', welcomeMessage, username);
    }
    
    currentUser = users[googleEmail];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showSuccess('Google Sign-In successful! Welcome, ' + currentUser.username + '!');
    
    setTimeout(() => showDashboard(), 2000);
}

async function handleMicrosoftSignIn() {
    const msEmail = prompt('🔐 Microsoft Sign-In\n\nEnter your Microsoft email address:');
    
    if (!msEmail) return;
    
    if (!isValidEmail(msEmail)) {
        showError('Invalid email address!');
        return;
    }
    
    if (!users[msEmail]) {
        const username = msEmail.split('@')[0];
        const newUser = {
            username: username,
            email: msEmail,
            password: 'microsoft-oauth-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            verified: true,
            provider: 'microsoft'
        };
        
        users[msEmail] = newUser;
        localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
        
        await sendRealEmail(msEmail, 'Welcome to Personal Finance Tracker - Microsoft Account Created', `Welcome ${username}! Your account has been created using Microsoft Sign-In. If you didn't create this account, reply immediately.`, username);
    }
    
    currentUser = users[msEmail];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showSuccess('Microsoft Sign-In successful! Welcome, ' + currentUser.username + '!');
    
    setTimeout(() => showDashboard(), 2000);
}

async function handleAppleSignIn() {
    const appleEmail = prompt('🔐 Apple Sign-In\n\nEnter your Apple ID email address:');
    
    if (!appleEmail) return;
    
    if (!isValidEmail(appleEmail)) {
        showError('Invalid email address!');
        return;
    }
    
    if (!users[appleEmail]) {
        const username = appleEmail.split('@')[0];
        const newUser = {
            username: username,
            email: appleEmail,
            password: 'apple-oauth-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            verified: true,
            provider: 'apple'
        };
        
        users[appleEmail] = newUser;
        localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
        
        await sendRealEmail(appleEmail, 'Welcome to Personal Finance Tracker - Apple Account Created', `Welcome ${username}! Your account has been created using Apple Sign-In. If you didn't create this account, reply immediately.`, username);
    }
    
    currentUser = users[appleEmail];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showSuccess('Apple Sign-In successful! Welcome, ' + currentUser.username + '!');
    
    setTimeout(() => showDashboard(), 2000);
}

function showDashboard() {
    if (!currentUser) return;
    
    initializeUserData();
    
    // Update navbar
    updateNavbar();
    
    // Update dashboard header
    document.getElementById('dashboard-username').textContent = currentUser.username;
    document.getElementById('dashboard-date').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    updateOverview();
    displayExpenses();
    displaySavingsGoals();
    
    showSection('dashboard');
}

function switchDashboardView(view) {
    // Hide all dashboard views
    document.querySelectorAll('.dashboard-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(view);
    if (viewElement) {
        viewElement.classList.add('active');
    }
    
    // Update active button
    event.target.classList.add('active');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update content when switching views
    if (view === 'view-expenses') {
        setTimeout(() => displayExpenses(), 100);
    } else if (view === 'savings') {
        setTimeout(() => displaySavingsGoals(), 100);
    } else if (view === 'overview') {
        setTimeout(() => updateOverview(), 100);
    }
}

function updateOverview() {
    const userExpenses = expenses[currentUser.email] || [];
    const userGoals = savingsGoals[currentUser.email] || [];
    
    const totalExpenses = userExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalSavingsTarget = userGoals.reduce((sum, goal) => sum + parseFloat(goal.target || 0), 0);
    const totalSaved = userGoals.reduce((sum, goal) => sum + parseFloat(goal.current || 0), 0);
    
    const statsHtml = `
        <div class="stat-card">
            <div class="stat-icon">💸</div>
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value">₹${totalExpenses.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-label">Total Saved</div>
            <div class="stat-value">₹${totalSaved.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-label">Savings Goals</div>
            <div class="stat-value">${userGoals.length}</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">${userExpenses.length}</div>
        </div>
    `;
    
    document.getElementById('stats-grid').innerHTML = statsHtml;
}

function addExpense() {
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const date = document.getElementById('expense-date').value;
    
    if (!category || !amount || !date) {
        showError('Please fill in all required fields!');
        return;
    }
    
    if (amount <= 0) {
        showError('Amount must be greater than 0!');
        return;
    }
    
    const email = currentUser.email;
    if (!expenses[email]) {
        expenses[email] = [];
    }
    
    const expense = {
        id: Date.now(),
        category,
        amount,
        description,
        date,
        createdAt: new Date().toISOString()
    };
    
    expenses[email].push(expense);
    localStorage.setItem('userExpenses', JSON.stringify(expenses));
    
    showSuccess(`✅ Expense of ₹${amount.toFixed(2)} added successfully!`);
    
    // Clear form
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    
    displayExpenses();
    updateOverview();
}

function displayExpenses() {
    const email = currentUser.email;
    const userExpenses = expenses[email] || [];
    const categoryFilter = document.getElementById('filter-category')?.value || '';
    
    let filteredExpenses = userExpenses;
    if (categoryFilter) {
        filteredExpenses = userExpenses.filter(exp => exp.category === categoryFilter);
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    
    if (filteredExpenses.length === 0) {
        html = '<div class="empty-message">📭 No expenses found. Start tracking your spending!</div>';
    } else {
        html = filteredExpenses.map((expense, index) => `
            <div class="expense-item" style="animation-delay: ${index * 0.05}s">
                <div class="expense-details">
                    <div class="expense-category">${getCategoryEmoji(expense.category)} ${expense.category}</div>
                    <div class="expense-description">${expense.description || 'No description'}</div>
                    <div class="expense-date">${new Date(expense.date).toLocaleDateString()}</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
                    <button class="expense-delete" onclick="deleteExpense(${expense.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    const expensesList = document.getElementById('expenses-list');
    if (expensesList) {
        expensesList.innerHTML = html;
        observeElements();
    }
}

function filterExpenses() {
    displayExpenses();
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const email = currentUser.email;
        expenses[email] = expenses[email].filter(exp => exp.id !== id);
        localStorage.setItem('userExpenses', JSON.stringify(expenses));
        showSuccess('✅ Expense deleted successfully!');
        displayExpenses();
        updateOverview();
    }
}

function deleteAllExpenses() {
    if (confirm('⚠️ Are you sure you want to delete ALL expenses? This cannot be undone!')) {
        const confirmText = prompt('Type "DELETE ALL" to confirm:');
        if (confirmText === 'DELETE ALL') {
            const email = currentUser.email;
            expenses[email] = [];
            localStorage.setItem('userExpenses', JSON.stringify(expenses));
            showSuccess('✅ All expenses deleted successfully!');
            displayExpenses();
            updateOverview();
        }
    }
}

function getCategoryEmoji(category) {
    const emojiMap = {
        'Food': '🍔',
        'Transport': '🚗',
        'Utilities': '💡',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Healthcare': '⚕️',
        'Other': '📌'
    };
    return emojiMap[category] || '📌';
}

function addSavingsGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const current = parseFloat(document.getElementById('goal-current').value);
    const deadline = document.getElementById('goal-deadline').value;
    
    if (!name || !target || !deadline) {
        showError('Please fill in all required fields!');
        return;
    }
    
    if (target <= 0 || current < 0) {
        showError('Please enter valid amounts!');
        return;
    }
    
    if (current > target) {
        showError('Current savings cannot exceed target amount!');
        return;
    }
    
    const email = currentUser.email;
    if (!savingsGoals[email]) {
        savingsGoals[email] = [];
    }
    
    const goal = {
        id: Date.now(),
        name,
        target,
        current,
        deadline,
        createdAt: new Date().toISOString()
    };
    
    savingsGoals[email].push(goal);
    localStorage.setItem('userSavingsGoals', JSON.stringify(savingsGoals));
    
    showSuccess(`✅ Savings goal "${name}" created successfully!`);
    
    // Clear form
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-current').value = '';
    document.getElementById('goal-deadline').value = new Date().toISOString().split('T')[0];
    
    displaySavingsGoals();
    updateOverview();
}

function displaySavingsGoals() {
    const email = currentUser.email;
    const userGoals = savingsGoals[email] || [];
    
    let html = '';
    
    if (userGoals.length === 0) {
        html = '<div class="empty-message">🎯 No savings goals yet. Create one to get started!</div>';
    } else {
        html = userGoals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="goal-item" style="animation-delay: ${index * 0.05}s">
                    <div class="goal-header">
                        <div class="goal-name">💰 ${goal.name}</div>
                        <div class="goal-deadline">
                            ${daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Today!' : 'Overdue'}
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="goal-stats">
                        <div class="goal-stat">
                            <div class="goal-stat-label">Current</div>
                            <div class="goal-stat-value">₹${parseFloat(goal.current).toFixed(2)}</div>
                        </div>
                        <div class="goal-stat">
                            <div class="goal-stat-label">Target</div>
                            <div class="goal-stat-value">₹${parseFloat(goal.target).toFixed(2)}</div>
                        </div>
                        <div class="goal-stat">
                            <div class="goal-stat-label">Progress</div>
                            <div class="goal-stat-value">${progress.toFixed(0)}%</div>
                        </div>
                    </div>
                    <button class="goal-delete" onclick="deleteSavingsGoal(${goal.id})">Delete Goal</button>
                </div>
            `;
        }).join('');
    }
    
    const goalsList = document.getElementById('savings-goals-list');
    if (goalsList) {
        goalsList.innerHTML = html;
        observeElements();
    }
}

function deleteSavingsGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        const email = currentUser.email;
        savingsGoals[email] = savingsGoals[email].filter(goal => goal.id !== id);
        localStorage.setItem('userSavingsGoals', JSON.stringify(savingsGoals));
        showSuccess('✅ Goal deleted successfully!');
        displaySavingsGoals();
        updateOverview();
    }
}

function calculateInvestment() {
    const principal = parseFloat(document.getElementById('invest-principal').value);
    const rate = parseFloat(document.getElementById('invest-rate').value);
    const years = parseFloat(document.getElementById('invest-years').value);
    const compound = parseInt(document.getElementById('invest-compound').value);
    
    if (!principal || !rate || !years) {
        showError('Please fill in all fields!');
        return;
    }
    
    if (principal <= 0 || rate < 0 || years <= 0) {
        showError('Please enter valid amounts!');
        return;
    }
    
    // Compound Interest Formula: A = P(1 + r/n)^(nt)
    // Where: P=principal, r=rate/100, n=compound frequency, t=years
    const amount = principal * Math.pow((1 + (rate / 100) / compound), compound * years);
    const interestEarned = amount - principal;
    
    const resultHtml = `
        <div class="result-label">💹 Investment Result</div>
        <div class="result-value">₹${amount.toFixed(2)}</div>
        <div class="result-details">
            <p><strong>Initial Investment:</strong> ₹${principal.toFixed(2)}</p>
            <p><strong>Interest Earned:</strong> ₹${interestEarned.toFixed(2)}</p>
            <p><strong>Annual Interest Rate:</strong> ${rate}%</p>
            <p><strong>Time Period:</strong> ${years} years</p>
            <p><strong>Compounding:</strong> ${compound === 1 ? 'Annually' : compound === 2 ? 'Semi-Annually' : compound === 4 ? 'Quarterly' : compound === 12 ? 'Monthly' : 'Daily'}</p>
            <p><strong>Growth:</strong> ${((interestEarned / principal) * 100).toFixed(2)}%</p>
        </div>
    `;
    
    const resultBox = document.getElementById('investment-result');
    if (resultBox) {
        resultBox.innerHTML = resultHtml;
        resultBox.style.display = 'block';
    }
}

function showProfileInfo() {
    const totalExpenses = (expenses[currentUser.email] || []).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2);
    const totalGoals = (savingsGoals[currentUser.email] || []).length;
    const accountCreated = new Date(currentUser.createdAt).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const profileInfoHtml = `
        <div class="profile-card">
            <div class="profile-item">
                <div class="profile-icon">👤</div>
                <div class="profile-details">
                    <p class="profile-label">Username</p>
                    <p class="profile-value">${currentUser.username}</p>
                </div>
            </div>
            <div class="profile-divider"></div>
            <div class="profile-item">
                <div class="profile-icon">📧</div>
                <div class="profile-details">
                    <p class="profile-label">Email Address</p>
                    <p class="profile-value">${currentUser.email}</p>
                </div>
            </div>
            <div class="profile-divider"></div>
            <div class="profile-item">
                <div class="profile-icon">📅</div>
                <div class="profile-details">
                    <p class="profile-label">Account Created</p>
                    <p class="profile-value">${accountCreated}</p>
                </div>
            </div>
            <div class="profile-divider"></div>
            <div class="profile-item">
                <div class="profile-icon">🔐</div>
                <div class="profile-details">
                    <p class="profile-label">Sign-In Method</p>
                    <p class="profile-value">${currentUser.provider ? currentUser.provider.charAt(0).toUpperCase() + currentUser.provider.slice(1) : 'Email & Password'}</p>
                </div>
            </div>
            <div class="profile-divider"></div>
            <div class="profile-item">
                <div class="profile-icon">✅</div>
                <div class="profile-details">
                    <p class="profile-label">Account Status</p>
                    <p class="profile-value" style="color: #10b981;">Active & Verified</p>
                </div>
            </div>
        </div>
        <div class="profile-stats">
            <div class="stat-box">
                <div class="stat-icon">💸</div>
                <p class="stat-label">Total Expenses</p>
                <p class="stat-number">₹${totalExpenses}</p>
            </div>
            <div class="stat-box">
                <div class="stat-icon">💰</div>
                <p class="stat-label">Savings Goals</p>
                <p class="stat-number">${totalGoals}</p>
            </div>
        </div>
    `;
    
    document.getElementById('profile-info').innerHTML = profileInfoHtml;
}

function editProfile() {
    // Populate the modal with current user data
    document.getElementById('edit-username').value = currentUser.username;
    document.getElementById('display-email').value = currentUser.email;
    
    // Show the modal
    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
    document.getElementById('editProfileForm').reset();
}

function saveProfileChanges(event) {
    event.preventDefault();
    
    const newUsername = document.getElementById('edit-username').value.trim();
    
    if (!newUsername) {
        showError('❌ Username cannot be empty!');
        return;
    }
    
    if (newUsername.length < 3) {
        showError('❌ Username must be at least 3 characters long!');
        return;
    }
    
    if (newUsername.length > 30) {
        showError('❌ Username must be less than 30 characters!');
        return;
    }
    
    // Check if username already exists
    for (let email in users) {
        if (email !== currentUser.email && users[email].username.toLowerCase() === newUsername.toLowerCase()) {
            showError('❌ This username is already taken!');
            return;
        }
    }
    
    // Update user profile
    currentUser.username = newUsername;
    users[currentUser.email].username = newUsername;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
    
    showSuccess('✅ Profile updated successfully!');
    closeEditProfileModal();
    showProfileInfo();
    document.getElementById('dashboard-username').textContent = currentUser.username;
}

// Settings Page Functions
function showSettings() {
    showSection('settings');
    updateSettingsDisplay();
}

function updateSettingsDisplay() {
    // Update account information
    document.getElementById('settings-fullname').textContent = currentUser.username || '-';
    document.getElementById('settings-email').textContent = currentUser.email || '-';
    
    // Format and display account creation date
    if (currentUser.createdDate) {
        const date = new Date(currentUser.createdDate);
        document.getElementById('settings-created').textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        document.getElementById('settings-created').textContent = 'Unknown';
    }
    
    // Update data statistics
    const expenses = expenses || [];
    const savingsGoals = savingsGoals || [];
    
    document.getElementById('stats-expenses').textContent = expenses.length || '0';
    document.getElementById('stats-savings').textContent = savingsGoals.length || '0';
    document.getElementById('stats-investments').textContent = '0';
}

function editFullName() {
    const newName = prompt('Enter your full name:', currentUser.username);
    if (newName && newName.trim()) {
        currentUser.username = newName.trim();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update in users array
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].username = newName.trim();
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        updateSettingsDisplay();
        showSuccess('Full name updated successfully!');
    }
}

function editEmail() {
    showInfo('Email address cannot be changed for security reasons.');
}

function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('changePasswordForm').reset();
}

function saveNewPassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate current password
    if (currentPassword !== currentUser.password) {
        showError('Current password is incorrect!');
        return;
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        showError('New password must be at least 6 characters long!');
        return;
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    closeChangePasswordModal();
    showSuccess('Password changed successfully!');
}

function clearAllData() {
    const confirmClear = confirm('Are you sure you want to clear all data? This action cannot be undone!');
    
    if (confirmClear) {
        const confirmAgain = confirm('This will permanently delete all your expenses, savings goals, and investments. Continue?');
        
        if (confirmAgain) {
            // Clear expenses
            expenses = expenses.filter(e => e.userId !== currentUser.email);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Clear savings goals
            savingsGoals = savingsGoals.filter(g => g.userId !== currentUser.email);
            localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
            
            updateSettingsDisplay();
            showSuccess('All data cleared successfully!');
        }
    }
}

function handleDeleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone!');
    
    if (confirmDelete) {
        const confirmAgain = confirm('This will permanently delete your account and all associated data. Type "DELETE" to confirm.');
        
        if (confirmAgain) {
            // Remove user from users array
            users = users.filter(u => u.email !== currentUser.email);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Remove user's expenses
            expenses = expenses.filter(e => e.userId !== currentUser.email);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Remove user's savings goals
            savingsGoals = savingsGoals.filter(g => g.userId !== currentUser.email);
            localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
            
            // Clear current user
            currentUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('lastViewedSection');
            
            showSuccess('Account deleted successfully!');
            
            setTimeout(() => {
                updateNavbar();
                showSection('signin');
            }, 2000);
        }
    }
}

function handleLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastViewedSection');
        
        // Update navbar
        updateNavbar();
        
        showSuccess('Logged out successfully!');
        
        setTimeout(() => {
            showSection('signin');
            document.getElementById('signin-username').value = '';
            document.getElementById('signin-password').value = '';
        }, 1500);
    }
}

async function handleDeleteAccount() {
    if (!currentUser) return;
    
    const confirmDelete = confirm(
        '⚠️ WARNING: This action cannot be undone!\n\n' +
        'Are you absolutely sure you want to permanently delete your account?\n\n' +
        'All your data will be lost forever.'
    );
    
    if (!confirmDelete) return;
    
    const confirmText = prompt('⚠️ FINAL WARNING\n\nType "DELETE" in CAPITAL letters to confirm permanent account deletion:');
    
    if (confirmText !== 'DELETE') {
        showError('Account deletion cancelled. Text did not match "DELETE".');
        return;
    }
    
    const deletionMessage = `Account Deletion Confirmation

Hello ${currentUser.username},

Your Personal Finance Tracker account has been permanently deleted as requested.

Deleted Account Details:
- Username: ${currentUser.username}
- Email: ${currentUser.email}
- Deletion Date: ${new Date().toLocaleString()}

All your data has been removed from our system and cannot be recovered.

⚠️ IMPORTANT: If you did NOT request this deletion, this may be a security breach. Please contact us immediately at support@financetracker.com

Thank you for using Personal Finance Tracker.

Best regards,
Personal Finance Tracker Team
(Naveena P, Prithika P & Priyamani D)`;
    
    await sendRealEmail(currentUser.email, '⚠️ Account Deleted - Personal Finance Tracker', deletionMessage, currentUser.username);
    
    delete users[currentUser.email];
    localStorage.setItem('financeTrackerUsers', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    
    showSuccess('✅ Your account has been permanently deleted. A confirmation email has been sent.');
    
    currentUser = null;
    
    setTimeout(() => showSection('signup'), 3000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.innerHTML = message;
    
    const card = document.querySelector('.card');
    card.insertBefore(notification, card.firstChild);
    
    setTimeout(() => notification.remove(), 5000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-message';
    notification.innerHTML = message;
    
    const card = document.querySelector('.card');
    card.insertBefore(notification, card.firstChild);
    
    setTimeout(() => notification.remove(), 5000);
}

function showInfo(message) {
    const notification = document.createElement('div');
    notification.className = 'info-message';
    notification.innerHTML = message;
    
    const card = document.querySelector('.card');
    card.insertBefore(notification, card.firstChild);
    
    setTimeout(() => notification.remove(), 8000);
}

function showLoading(message) {
    const notification = document.createElement('div');
    notification.className = 'loading-message';
    notification.id = 'loading-notification';
    notification.textContent = message;
    
    const card = document.querySelector('.card');
    card.insertBefore(notification, card.firstChild);
}

function removeLoading() {
    const loading = document.getElementById('loading-notification');
    if (loading) loading.remove();
}

// Help Section Functions
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const faqAnswer = element.nextElementSibling;
    
    // Close other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.display = 'none';
            }
        }
    });
    
    // Toggle current FAQ
    faqItem.classList.toggle('active');
    if (faqAnswer.style.display === 'none' || !faqAnswer.style.display) {
        faqAnswer.style.display = 'block';
    } else {
        faqAnswer.style.display = 'none';
    }
}