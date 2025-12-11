// Создаем класс для кастомизации
class SFIDCustomization {
    constructor() {
        this.currentSettings = {
            theme: 'light-theme',
            wallpaper: '',
            music: null,
            colors: {
                primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#2c3e50',
                secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || '#3498db',
                accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#e74c3c',
            }
        };
        this.loadSettings();
        this.applySettings();
        this.addEventListeners();
    }

    loadSettings() {
        const saved = localStorage.getItem('sfid_customization');
        if (saved) {
            try {
                this.currentSettings = JSON.parse(saved);
            } catch(e) { console.log('Ошибка загрузки настроек', e); }
        }
    }

    saveSettings() {
        localStorage.setItem('sfid_customization', JSON.stringify(this.currentSettings));
    }

    applySettings() {
        this.applyTheme(this.currentSettings.theme);
        this.applyWallpaper(this.currentSettings.wallpaper);
        this.applyColorScheme(this.currentSettings.colors);
        this.updateTextColor();
    }

    applyTheme(themeName) {
        document.body.className = themeName;
        this.currentSettings.theme = themeName;
        this.updateTextColor();
        this.saveSettings();
    }

    updateTextColor() {
        if (this.currentSettings.theme.includes('dark')) {
            document.body.style.setProperty('--text-color', '#fff');
        } else {
            document.body.style.setProperty('--text-color', '#000');
        }
    }

    applyWallpaper(wallpaperUrl) {
        document.body.style.backgroundImage = wallpaperUrl ? `url(${wallpaperUrl})` : '';
        this.currentSettings.wallpaper = wallpaperUrl;
        this.saveSettings();
    }

    setWallpaper(file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.applyWallpaper(reader.result);
        };
        reader.readAsDataURL(file);
    }

    setMusic(file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.playMusic(reader.result);
            this.currentSettings.music = reader.result;
            this.saveSettings();
        };
        reader.readAsDataURL(file);
    }

    playMusic(src) {
        let audio = document.getElementById('customMusicPlayer');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'customMusicPlayer';
            audio.loop = true;
            document.body.appendChild(audio);
        }
        audio.src = src;
        audio.play();
    }

    applyColorScheme(colors) {
        if (colors.primary) document.documentElement.style.setProperty('--primary-color', colors.primary);
        if (colors.secondary) document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        if (colors.accent) document.documentElement.style.setProperty('--accent-color', colors.accent);
        this.currentSettings.colors = colors;
        this.saveSettings();
    }

    changeTheme(themeName) {
        this.applyTheme(themeName);
    }

    changeColors(newColors) {
        this.applyColorScheme({ ...this.currentSettings.colors, ...newColors });
    }
    // и т.д. можно расширять
    addEventListeners() {
        document.getElementById('setWallpaperBtn').addEventListener('click', () => {
            const input = document.getElementById('wallpaperInput');
            if (input.files.length > 0) {
                this.setWallpaper(input.files[0]);
            }
        });
        document.getElementById('setMusicBtn').addEventListener('click', () => {
            const input = document.getElementById('musicInput');
            if (input.files.length > 0) {
                this.setMusic(input.files[0]);
            }
        });
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.changeTheme(theme);
            });
        });
        document.getElementById('changeThemeBtn').addEventListener('click', () => {
            // пример: переключить тему между светлой и темной
            const newTheme = this.currentSettings.theme === 'light-theme' ? 'dark-theme' : 'light-theme';
            this.changeTheme(newTheme);
        });
        document.getElementById('changeColorsBtn').addEventListener('click', () => {
            // пример: изменить цвета
            this.changeColors({
                primary: '#1abc9c',
                secondary: '#9b59b6',
                accent: '#f39c12'
            });
        });
        document.getElementById('toggleAdditionalSettings').addEventListener('click', () => {
            const div = document.getElementById('additionalSettings');
            div.style.display = div.style.display === 'none' ? 'block' : 'none';
        });
    }
}

// Создаем экземпляр при загрузке
window.onload = () => {
    window.sfidCustomization = new SFIDCustomization();
};
