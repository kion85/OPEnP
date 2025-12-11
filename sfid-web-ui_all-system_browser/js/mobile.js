class SFIDMobileManager {
    constructor(app) {
        this.app = app;
        this.isMobile = false;
        this.isPWA = false;
        this.isStandalone = false;
        this.orientation = 'portrait';
        this.touchGestures = {};
        this.offlineCache = {};
        this.pushNotifications = [];
        this.geofencing = [];
        this.init();
    }

    init() {
        console.log('📱 Инициализация мобильного менеджера...');
        this.detectDeviceType();
        this.initPWA();
        this.initTouchGestures();
        this.initOfflineCache();
        this.setupEventListeners();
        this.checkFeatureSupport();
    }

    detectDeviceType() {
        this.isMobile = this.checkMobileDevice();
        this.orientation = this.getOrientation();
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        console.log(`Устройство: ${this.isMobile ? 'Мобильное' : 'Десктоп'}`);
        console.log(`Ориентация: ${this.orientation}`);
        this.applyMobileStyles();
    }

    checkMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    getOrientation() {
        if (window.screen.orientation) {
            return window.screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait';
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    applyMobileStyles() {
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            if (!document.querySelector('meta[name="viewport"]')) {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(viewport);
            }
            this.adaptInterfaceForMobile();
        }
    }

    adaptInterfaceForMobile() {
        this.createMobileNavigation();
        this.optimizeTouchControls();
        this.setupKeyboardHandling();
    }

    createMobileNavigation() {
        const menuButton = document.createElement('button');
        menuButton.id = 'mobile-menu-button';
        menuButton.className = 'mobile-menu-btn';
        menuButton.innerHTML = '☰';
        menuButton.setAttribute('aria-label', 'Открыть меню');

        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-menu';
        mobileMenu.className = 'mobile-menu';

        const navItems = [
            { name: 'Главная', icon: '🏠', id: 'dashboard' },
            { name: 'Безопасность', icon: '🛡️', id: 'security' },
            { name: 'IoT', icon: '🏠', id: 'iot' },
            { name: 'Сеть', icon: '🌐', id: 'network' },
            { name: 'Настройки', icon: '⚙️', id: 'settings' }
        ];

        navItems.forEach(item => {
            const navItem = document.createElement('div');
            navItem.className = 'mobile-nav-item';
            navItem.innerHTML = `
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.name}</span>
            `;
            navItem.addEventListener('click', () => {
                this.app.showSection(item.id);
                this.hideMobileMenu();
            });
            mobileMenu.appendChild(navItem);
        });

        document.body.appendChild(menuButton);
        document.body.appendChild(mobileMenu);

        document.getElementById('mobile-menu-button').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('mobile-menu');
            const btn = document.getElementById('mobile-menu-button');
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                this.hideMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const button = document.getElementById('mobile-menu-button');
        if (menu.style.display === 'block') {
            this.hideMobileMenu();
        } else {
            this.showMobileMenu();
        }
    }

    showMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const button = document.getElementById('mobile-menu-button');
        menu.style.display = 'block';
        button.classList.add('active');
        setTimeout(() => {
            menu.classList.add('visible');
        }, 10);
    }

    hideMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const button = document.getElementById('mobile-menu-button');
        menu.classList.remove('visible');
        setTimeout(() => {
            menu.style.display = 'none';
            button.classList.remove('active');
        }, 300);
    }

    optimizeTouchControls() {
        document.querySelectorAll('button, .clickable, .card').forEach(el => {
            el.classList.add('touch-optimized');
        });
        this.applySafeAreaInsets();
    }

    applySafeAreaInsets() {
        const style = document.createElement('style');
        style.innerHTML = `
            .safe-area {
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
            }
            .touch-optimized {
                min-height: 44px;
                min-width: 44px;
                padding: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    setupKeyboardHandling() {
        window.addEventListener('resize', () => {
            this.handleKeyboardState();
        });
    }

    handleKeyboardState() {
        const vv = window.visualViewport;
        if (vv) {
            const windowHeight = window.innerHeight;
            if (vv.height < windowHeight * 0.7) {
                document.body.classList.add('keyboard-visible');
                this.scrollToActiveInput();
            } else {
                document.body.classList.remove('keyboard-visible');
            }
        }
    }

    scrollToActiveInput() {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    initPWA() {
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        this.setupPWAInstall();
        this.checkDisplayMode();
    }

    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Service Worker зарегистрирован:', reg);
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            this.showUpdateNotification();
                        }
                    });
                });
            })
            .catch(err => console.error('Ошибка регистрации SW:', err));
    }

    setupPWAInstall() {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
        window.addEventListener('appinstalled', () => {
            this.isPWA = true;
            console.log('PWA установлено');
            this.hideInstallButton();
        });
    }

    showInstallButton(deferredPrompt) {
        const btn = document.createElement('button');
        btn.id = 'install-pwa-btn';
        btn.className = 'install-btn';
        btn.innerHTML = '📱 Установить приложение';
        btn.style.display = 'block';
        btn.onclick = () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choice) => {
                if (choice.outcome === 'accepted') {
                    console.log('Пользователь принял установку');
                }
                deferredPrompt = null;
            });
        };
        document.body.appendChild(btn);
    }

    hideInstallButton() {
        const btn = document.getElementById('install-pwa-btn');
        if (btn) btn.style.display = 'none';
    }

    checkDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isPWA = true;
            this.isStandalone = true;
            console.log('Запущено в режиме standalone');
        }
    }

    initTouchGestures() {
        this.touchGestures = { startX: 0, startY: 0, currentX: 0, currentY: 0, isSwiping: false };
        this.setupGestureListeners();
    }

    setupGestureListeners() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleTouchStart(e) {
        const t = e.touches[0];
        this.touchGestures.startX = t.clientX;
        this.touchGestures.startY = t.clientY;
    }

    handleTouchMove(e) {
        if (!this.touchGestures.isSwiping) this.touchGestures.isSwiping = true;
        const t = e.touches[0];
        this.touchGestures.currentX = t.clientX;
        this.touchGestures.currentY = t.clientY;
        const deltaX = this.touchGestures.currentX - this.touchGestures.startX;
        const deltaY = this.touchGestures.currentY - this.touchGestures.startY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault(); // горизонтальный свайп — блокировать прокрутку
        }
    }

    handleTouchEnd() {
        if (!this.touchGestures.isSwiping) return;
        const deltaX = this.touchGestures.currentX - this.touchGestures.startX;
        const minSwipe = 50;
        if (Math.abs(deltaX) > minSwipe) {
            if (deltaX > 0) this.handleSwipeRight();
            else this.handleSwipeLeft();
        }
        this.resetGestures();
    }

    handleSwipeRight() {
        if (this.touchGestures.startX < 50) {
            this.showMobileMenu();
        }
    }

    handleSwipeLeft() {
        this.hideMobileMenu();
    }

    resetGestures() {
        this.touchGestures = { startX: 0, startY: 0, currentX: 0, currentY: 0, isSwiping: false };
    }

    initOfflineCache() {
        this.offlineCache = { enabled: true, quota: 50 * 1024 * 1024, version: '1.0.0' };
        this.setupConnectionMonitoring();
        this.cacheCriticalResources();
    }

    setupConnectionMonitoring() {
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());
    }

    handleOnlineStatus() {
        console.log('Онлайн');
        document.body.classList.remove('offline');
        document.body.classList.add('online');
        this.app.showNotification('Соединение восстановлено', 'success');
        this.syncOfflineData();
    }

    handleOfflineStatus() {
        console.log('Оффлайн');
        document.body.classList.remove('online');
        document.body.classList.add('offline');
        this.app.showNotification('Нет подключения к интернету', 'warning');
    }

    cacheCriticalResources() {
        const resources = ['/', '/index.html', '/css/styles.css', '/js/app.js', '/manifest.json'];
        console.log('Кэширование ресурсов:', resources);
        // В реальности тут использовался бы Cache API
    }

    syncOfflineData() {
        console.log('Синхронизация оффлайн данных...');
        // Реализовать логику синхронизации оффлайн-данных
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleOrientationChange());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); });
    }

    handleOrientationChange() {
        const newOrientation = this.getOrientation();
        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            this.onOrientationChange();
        }
    }

    onOrientationChange() {
        console.log('Ориентация:', this.orientation);
        this.adaptInterfaceToOrientation();
    }

    adaptInterfaceToOrientation() {
        if (this.orientation === 'landscape') {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Back' || e.keyCode === 27) {
            this.handleBackButton(e);
        }
    }

    handleBackButton(e) {
        this.hideMobileMenu();
    }

    showUpdateNotification() {
        const notif = document.createElement('div');
        notif.id = 'update-notification';
        notif.className = 'update-notification';
        notif.innerHTML = `
            <div class="update-content">
                <h3>Доступно обновление!</h3>
                <p>Новая версия приложения готова к установке.</p>
                <button id="update-btn">Обновить</button>
            </div>`;
        document.body.appendChild(notif);
        document.getElementById('update-btn').onclick = () => { window.location.reload(); };
    }

    requestPushPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Разрешение на уведомления:', permission);
                if (permission === 'granted') {
                    this.subscribeToPushNotifications();
                }
            });
        }
    }

    subscribeToPushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array('BK2e6r5Yw0i7vX8c9dZaB1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2')
                });
            }).then(subscription => {
                console.log('Подписка:', subscription);
            });
        }
    }

    sendPushNotification(title, options) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, options);
            });
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    vibrate(pattern) {
        if ('vibrate' in navigator) navigator.vibrate(pattern);
    }

    setupGeolocation() {
        if ('geolocation' in navigator) {
            console.log('Геолокация поддерживается');
        }
    }

    createGeofence(geoData) {
        const newGeo = {
            id: Date.now(),
            name: geoData.name,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            radius: geoData.radius,
            enabled: true
        };
        this.geofencing.push(newGeo);
        return newGeo;
    }

    checkFeatureSupport() {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            geolocation: 'geolocation' in navigator,
            vibration: 'vibrate' in navigator,
            touch: 'ontouchstart' in window,
            orientation: 'orientation' in screen
        };
        console.log('Поддержка функций:', features);
        return features;
    }

    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isPWA: this.isPWA,
            isStandalone: this.isStandalone,
            orientation: this.orientation,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    optimizeMobilePerformance() {
        this.reduceAnimations();
        this.optimizeMemoryUsage();
        this.managePowerConsumption();
    }

    reduceAnimations() {
        if (this.isMobile) {
            document.body.classList.add('reduced-motion');
        }
    }

    optimizeMemoryUsage() {
        this.cleanupUnusedResources();
    }

    managePowerConsumption() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.suspendBackgroundTasks();
            } else {
                this.resumeBackgroundTasks();
            }
        });
    }

    suspendBackgroundTasks() {
        console.log('Приостановка фоновых задач');
    }

    resumeBackgroundTasks() {
        console.log('Возобновление фоновых задач');
    }

    cleanupUnusedResources() {
        console.log('Очистка ресурсов');
    }

    adaptContentForMobile() {
        this.simplifyComplexWidgets();
        this.optimizeImages();
    }

    simplifyComplexWidgets() {
        document.querySelectorAll('.complex-widget, .data-grid').forEach(w => {
            w.classList.add('mobile-optimized');
        });
    }

    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            img.loading = 'lazy';
            if (navigator.connection && navigator.connection.effectiveType === '2g') {
                img.classList.add('low-quality');
            }
        });
    }

    getBatteryStatus() {
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(battery => {
                return {
                    level: battery.level * 100,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            });
        }
        return Promise.resolve(null);
    }

    saveMobileSettings() {
        const settings = {
            isMobile: this.isMobile,
            orientation: this.orientation,
            gesturesEnabled: true
        };
        localStorage.setItem('sfid_mobile_settings', JSON.stringify(settings));
    }

    loadMobileSettings() {
        const settingsStr = localStorage.getItem('sfid_mobile_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            this.applyLoadedSettings(settings);
        }
    }

    applyLoadedSettings(settings) {
        // Пример применения настроек
        if (settings.gesturesEnabled !== undefined) {
            // Включить/выключить жесты
        }
    }

    destroy() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.removeEventListeners();
    }

    removeEventListeners() {
        // Тут нужно убрать все добавленные слушатели
        console.log('Мобильный менеджер деинициализирован');
    }
}

// Создаем глобальный экземпляр
window.sfidMobile = new SFIDMobileManager();

// Экспорт
export default SFIDMobileManager;
