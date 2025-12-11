class WidgetsManager {
    constructor() {
        this.widgets = [];
    }

    loadWidgets() {
        console.log('Загрузка виджетов панели управления...');
        const container = document.querySelector('.widgets-container');
        if (!container) {
            console.error('Контейнер для виджетов не найден');
            return;
        }
        container.innerHTML = '';

        // Получение реальных данных
        this.getNetworkInfo().then(info => {
            const demoWidgets = [
                {
                    id: 'system-status',
                    title: 'Статус системы',
                    content: '🟢 Все системы работают',
                    size: 'small',
                    type: 'status'
                },
                {
                    id: 'ip-address',
                    title: 'IP-адрес устройства',
                    content: info.ip || 'Не удалось получить IP',
                    size: 'small',
                    type: 'network'
                },
                {
                    id: 'mac-address',
                    title: 'MAC-адрес устройства',
                    content: 'Доступен только из API/сервера',
                    size: 'small',
                    type: 'network'
                },
                {
                    id: 'wifi-ssid',
                    title: 'Wi-Fi SSID',
                    content: info.ssid || 'Не доступно',
                    size: 'small',
                    type: 'wifi'
                }
            ];

            demoWidgets.forEach(w => this.createWidget(w, container));
        });
        console.log('Виджеты успешно загружены');
    }

    createWidget(config, container) {
        const widget = document.createElement('div');
        widget.className = 'widget widget-' + config.size;
        widget.id = 'widget-' + config.id;
        widget.innerHTML = '<div class="widget-title">' + config.title + '</div><div class="widget-content">' + config.content + '</div>';
        container.appendChild(widget);
        this.widgets.push(widget);
    }

    async getNetworkInfo() {
        // Получение IP через WebRTC (может работать не во всех браузерах)
        const ip = await this.getLocalIP();
        const ssid = await this.getWifiSSID(); // Требует специальных API или сторонних решений
        return { ip, ssid };
    }

    getLocalIP() {
        return new Promise((resolve) => {
            const rtc = new RTCPeerConnection({iceServers: []});
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            rtc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) return;
                const candidate = ice.candidate.candidate;
                const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (ipMatch) {
                    resolve(ipMatch[1]);
                } else {
                    resolve('Не удалось определить IP');
                }
            };
        });
    }

    async getWifiSSID() {
        // Получить SSID — ограниченно, возможно только через API сторонних решений
        // Можно оставить как "не доступно" или реализовать через API сервера
        return 'Нет доступа к SSID';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.widgetsManager = new WidgetsManager();
});
