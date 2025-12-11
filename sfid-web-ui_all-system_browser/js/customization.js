class SFIDCustomization {
    constructor(app) {
        this.app = app;
        this.currentSettings = {
            theme: 'light-theme',
            wallpaper: '', // URL обоев
            colors: {
                primary: '#2c3e50',
                secondary: '#3498db',
                accent: '#e74c3c'
            },
            sounds: {
                connect: null,
                error: null,
                volume: 70
            },
            font: 'Arial',
            music: null, // URL музыки
            backgroundImage: '', // может быть дублирует wallpaper
            layout: 'default'
        };
        this.autoApply = false;
        this.musicAudio = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.applyCurrentSettings();
        this.setupUI();
    }

    // ЗАГРУЗКА И СОХРАНЕНИЕ
    loadSettings() {
        const saved = localStorage.getItem('sfid_customization');
        if (saved) {
            try {
                this.currentSettings = JSON.parse(saved);
            } catch(e) { console.error('Ошибка парсинга', e); }
        }
    }
    saveSettings() {
        localStorage.setItem('sfid_customization', JSON.stringify(this.currentSettings));
    }

    // ПРИМЕНЕНИЕ ВСЕГО
    applyCurrentSettings() {
        this.applyTheme(this.currentSettings.theme);
        if (this.currentSettings.wallpaper) this.applyWallpaper(this.currentSettings.wallpaper);
        if (this.currentSettings.backgroundImage) this.applyWallpaper(this.currentSettings.backgroundImage);
        this.applyColorScheme(this.currentSettings.colors);
        this.applySoundSettings(this.currentSettings.sounds);
        this.applyFont(this.currentSettings.font);
        if (this.currentSettings.music) this.playMusic(this.currentSettings.music);
        this.applyLayout(this.currentSettings.layout);
    }

    // UI setup
    setupUI() {
        // Обои
        const wallpaperInput = document.getElementById('wallpaperUploader');
        if (wallpaperInput) {
            wallpaperInput.addEventListener('change', () => {
                const file = wallpaperInput.files[0];
                if (file) this.setCustomWallpaper(file);
            });
        }
        // Музыка
        const musicInput = document.getElementById('musicUploader');
        if (musicInput) {
            musicInput.addEventListener('change', () => {
                const file = musicInput.files[0];
                if (file) this.setMusicFile(file);
            });
        }
        // Воспроизвести
        const playBtn = document.getElementById('playMusicBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playMusic(this.currentSettings.music);
            });
        }
        // Стоп
        const stopBtn = document.getElementById('stopMusicBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopMusic();
            });
        }
        // Цвет
        const colorInput = document.getElementById('customColorScheme');
        if (colorInput) {
            colorInput.addEventListener('input', () => {
                this.setColorScheme({ primary: colorInput.value });
            });
        }
        // Шрифт
        const fontSelect = document.getElementById('customFontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', () => {
                this.setFont(fontSelect.value);
            });
        }
        // Тема
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                this.applyTheme(themeSelect.value);
            });
        }
        // Layout
        const layoutSelect = document.getElementById('layoutSelect');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', () => {
                this.setLayout(layoutSelect.value);
            });
        }
        // Сохранить
        const saveBtn = document.getElementById('saveCustomizationBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
                alert('Настройки сохранены!');
            });
        }
    }

    // ===================== ОБОИ =====================
    setCustomWallpaper(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentSettings.wallpaper = e.target.result;
                this.saveSettings();
                this.applyWallpaper(this.currentSettings.wallpaper);
                if (this.app && this.app.showNotification) this.app.showNotification('Обои успешно загружены', 'success');
                resolve(e.target.result);
            };
            reader.onerror = () => reject(new Error('Ошибка загрузки файла'));
            reader.readAsDataURL(file);
        });
    }

    applyWallpaper(wallpaperUrl) {
        if (wallpaperUrl) {
            document.body.style.backgroundImage = `url(${wallpaperUrl})`;
        } else {
            document.body.style.backgroundImage = '';
        }
    }

    // ===================== МУЗЫКА =====================
    setMusicFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentSettings.music = e.target.result;
            this.saveSettings();
            this.playMusic(this.currentSettings.music);
        };
        reader.readAsDataURL(file);
    }

    playMusic(musicUrl) {
        if (this.musicAudio) {
            this.musicAudio.pause();
        }
        if (musicUrl) {
            this.musicAudio = new Audio(musicUrl);
            this.musicAudio.volume = this.currentSettings.sounds.volume / 100;
            this.musicAudio.loop = true;
            this.musicAudio.play().catch(() => {
                alert('Не удалось воспроизвести музыку, возможно блокировка браузера.');
            });
        }
    }

    stopMusic() {
        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio.currentTime = 0;
        }
    }

    // ===================== ЦВЕТА =====================
    setColorScheme(colors) {
        this.currentSettings.colors = { ...this.currentSettings.colors, ...colors };
        this.updateCSSVariables(this.currentSettings.colors);
        this.saveSettings();
    }

    updateCSSVariables(colors) {
        const root = document.documentElement;
        if (colors.primary) root.style.setProperty('--primary-color', colors.primary);
        if (colors.secondary) root.style.setProperty('--secondary-color', colors.secondary);
        if (colors.accent) root.style.setProperty('--accent-color', colors.accent);
    }

    // ===================== ШРИФТ =====================
    setFont(fontName) {
        this.currentSettings.font = fontName;
        document.documentElement.style.setProperty('--main-font', fontName);
        this.saveSettings();
    }

    // ===================== ТЕМЫ =====================
    applyTheme(themeName) {
        // Удаляем все темы
        const themes = ['light-theme', 'dark-theme', 'blue-theme', 'green-theme', 'purple-theme', 'red-theme', 'orange-theme', 'steel-theme', 'pink-theme', 'cyberpunk-theme', 'vintage-theme', 'high-contrast-theme', 'minimal-theme'];
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
        this.currentSettings.theme = themeName;
        this.saveSettings();
        if (this.app && this.app.updateInterface) this.app.updateInterface();
    }

    // ===================== layout =====================
    setLayout(layoutName) {
        this.currentSettings.layout = layoutName;
        this.applyLayout(layoutName);
        this.saveSettings();
    }
    applyLayout(layoutName) {
        const container = document.querySelector('.widgets-container');
        if (container) {
            if (layoutName === 'compact') {
                container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
            } else {
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }
    }

    // ===================== ДОПОЛНИТЕЛЬНО =====================
    // Восстановить все из памяти
    restoreAll() {
        this.loadSettings();
        this.applyCurrentSettings();
    }
}
window.sfidCustomization = new SFIDCustomization();
