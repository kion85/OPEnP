class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('Инициализация менеджера авторизации SFID...');
        this.checkExistingSession();
        // Автоматический вход
        this.autoLogin();
        console.log('Менеджер авторизации готов');
    }

    async autoLogin() {
        // Войти автоматически как гость или системный пользователь
        const user = {
            name: 'Гость',
            role: 'guest',
            loginTime: new Date().toISOString()
        };
        await this.onLoginSuccess(user);
    }

    async onLoginSuccess(user) {
        console.log('Успешная авторизация:', user);
        this.saveSession(user);
        this.showNotification('Добро пожаловать, ' + user.name + '!', 'success');

        if (window.app && typeof app.init === 'function') {
            app.init();
        }
    }

    saveSession(user) {
        localStorage.setItem('sfid_isLoggedIn', 'true');
        localStorage.setItem('sfid_currentUser', JSON.stringify(user));
        localStorage.setItem('sfid_loginTime', new Date().toISOString());
        this.isAuthenticated = true;
        this.currentUser = user;
    }

    checkExistingSession() {
        const isLoggedIn = localStorage.getItem('sfid_isLoggedIn') === 'true';
        const userData = localStorage.getItem('sfid_currentUser');

        if (isLoggedIn && userData) {
            try {
                const user = JSON.parse(userData);
                this.isAuthenticated = true;
                this.currentUser = user;
                document.getElementById('loginPage').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'flex';

                const userElement = document.getElementById('currentUser');
                if (userElement) {
                    userElement.textContent = user.name;
                }
            } catch (e) {
                console.error('Ошибка чтения сессии', e);
            }
        }
    }

    handleLogout() {
        localStorage.removeItem('sfid_isLoggedIn');
        localStorage.removeItem('sfid_currentUser');
        localStorage.removeItem('sfid_loginTime');

        this.isAuthenticated = false;
        this.currentUser = null;
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('mainContainer').style.display = 'none';
    }

    showNotification(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => authManager.handleLogout());
    }
});
