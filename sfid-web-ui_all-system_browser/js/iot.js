class SFIDIoTManager {
    constructor(app) {
        this.app = app;
        this.devices = [];
        this.groups = [];
        this.automations = [];
        this.scenes = [];
        this.discoveredDevices = [];
        this.isScanning = false;
        this.energyConsumption = {
            total: 0,
            today: 0,
            monthly: 0
        };

        this.init();
    }

    // Инициализация IoT менеджера
    init() {
        console.log('🏠 Инициализация IoT менеджера...');
        this.loadDevices();
        this.loadGroups();
        this.loadAutomations();
        this.loadScenes();
        this.startPeriodicUpdates();
    }

    // Загрузка устройств
    loadDevices() {
        const saved = localStorage.getItem('sfid_iot_devices');
        if (saved) {
            this.devices = JSON.parse(saved);
        } else {
            this.devices = this.getDefaultDevices();
            this.saveDevices();
        }
    }

    // Загрузка групп
    loadGroups() {
        const saved = localStorage.getItem('sfid_iot_groups');
        if (saved) {
            this.groups = JSON.parse(saved);
        } else {
            this.groups = this.getDefaultGroups();
            this.saveGroups();
        }
    }

    // Загрузка автоматизаций
    loadAutomations() {
        const saved = localStorage.getItem('sfid_iot_automations');
        if (saved) {
            this.automations = JSON.parse(saved);
        } else {
            this.automations = this.getDefaultAutomations();
            this.saveAutomations();
        }
    }

    // Загрузка сцен
    loadScenes() {
        const saved = localStorage.getItem('sfid_iot_scenes');
        if (saved) {
            this.scenes = JSON.parse(saved);
        } else {
            this.scenes = this.getDefaultScenes();
            this.saveScenes();
        }
    }

    // Сохранение устройств
    saveDevices() {
        localStorage.setItem('sfid_iot_devices', JSON.stringify(this.devices));
    }

    // Сохранение групп
    saveGroups() {
        localStorage.setItem('sfid_iot_groups', JSON.stringify(this.groups));
    }

    // Сохранение автоматизаций
    saveAutomations() {
        localStorage.setItem('sfid_iot_automations', JSON.stringify(this.automations));
    }

    // Сохранение сцен
    saveScenes() {
        localStorage.setItem('sfid_iot_scenes', JSON.stringify(this.scenes));
    }

    // Получение устройств по умолчанию
    getDefaultDevices() {
        return [
            {
                id: 1,
                name: 'Умная лампа гостиная',
                type: 'light',
                manufacturer: 'Xiaomi',
                model: 'Yeelight',
                ip: '192.168.1.101',
                mac: 'AA:BB:CC:DD:EE:01',
                status: 'offline',
                power: false,
                brightness: 100,
                color: '#ffffff',
                room: 'living-room',
                group: 'lighting',
                lastSeen: new Date(),
                energyUsage: 9.5,
                firmware: '1.2.3',
                connection: 'wifi',
                signal: 85,
                automation: true
            },
            {
                id: 2,
                name: 'Умная розетка кухня',
                type: 'socket',
                manufacturer: 'TP-Link',
                model: 'HS100',
                ip: '192.168.1.102',
                mac: 'AA:BB:CC:DD:EE:02',
                status: 'online',
                power: true,
                consumption: 45.2,
                room: 'kitchen',
                group: 'appliances',
                lastSeen: new Date(),
                energyUsage: 0,
                firmware: '2.1.1',
                connection: 'wifi',
                signal: 92,
                automation: true
            },
            {
                id: 3,
                name: 'Датчик температуры спальня',
                type: 'sensor',
                manufacturer: 'Aqara',
                model: 'Temperature Sensor',
                ip: '192.168.1.103',
                mac: 'AA:BB:CC:DD:EE:03',
                status: 'online',
                power: null,
                temperature: 22.5,
                humidity: 45,
                room: 'bedroom',
                group: 'climate',
                lastSeen: new Date(),
                energyUsage: 0.1,
                firmware: '1.0.5',
                connection: 'zigbee',
                signal: 78,
                automation: false
            },
            {
                id: 4,
                name: 'Умный выключатель прихожая',
                type: 'switch',
                manufacturer: 'Sonoff',
                model: 'Basic',
                ip: '192.168.1.104',
                mac: 'AA:BB:CC:DD:EE:04',
                status: 'online',
                power: false,
                room: 'hallway',
                group: 'lighting',
                lastSeen: new Date(),
                energyUsage: 0.5,
                firmware: '3.2.1',
                connection: 'wifi',
                signal: 88,
                automation: true
            },
            {
                id: 5,
                name: 'Камера наблюдения вход',
                type: 'camera',
                manufacturer: 'Reolink',
                model: 'RLC-410',
                ip: '192.168.1.105',
                mac: 'AA:BB:CC:DD:EE:05',
                status: 'online',
                power: true,
                streaming: true,
                motion: true,
                room: 'entrance',
                group: 'security',
                lastSeen: new Date(),
                energyUsage: 12.3,
                firmware: 'v3.0.0.136',
                connection: 'ethernet',
                signal: 100,
                automation: false
            }
        ];
    }

    // Получение групп по умолчанию
    getDefaultGroups() {
        return [
            {
                id: 1,
                name: 'lighting',
                displayName: 'Освещение',
                devices: [1, 4],
                icon: 'lightbulb',
                color: '#f39c12'
            },
            {
                id: 2,
                name: 'climate',
                displayName: 'Климат',
                devices: [3],
                icon: 'thermometer',
                color: '#3498db'
            },
            {
                id: 3,
                name: 'security',
                displayName: 'Безопасность',
                devices: [5],
                icon: 'shield',
                color: '#e74c3c'
            },
            {
                id: 4,
                name: 'appliances',
                displayName: 'Бытовая техника',
                devices: [2],
                icon: 'power',
                color: '#27ae60'
            }
        ];
    }

    // Получение автоматизаций по умолчанию
    getDefaultAutomations() {
        return [
            {
                id: 1,
                name: 'Включение света вечером',
                enabled: true,
                trigger: {
                    type: 'time',
                    time: '18:00',
                    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                },
                conditions: [
                    {
                        type: 'presence',
                        device: 3,
                        value: 'home'
                    }
                ],
                actions: [
                    {
                        type: 'device',
                        device: 1,
                        command: 'turn_on',
                        parameters: { brightness: 70 }
                    }
                ],
                created: new Date()
            },
            {
                id: 2,
                name: 'Выключение при выходе',
                enabled: true,
                trigger: {
                    type: 'location',
                    device: 3,
                    value: 'away'
                },
                conditions: [],
                actions: [
                    {
                        type: 'device',
                        device: 1,
                        command: 'turn_off'
                    },
                    {
                        type: 'device',
                        device: 2,
                        command: 'turn_off'
                    }
                ],
                created: new Date()
            }
        ];
    }

    // Получение сцен по умолчанию
    getDefaultScenes() {
        return [
            {
                id: 1,
                name: 'Кино вечером',
                displayName: 'Киновечер',
                enabled: true,
                devices: [
                    {
                        device: 1,
                        state: { power: true, brightness: 30, color: '#ff6b6b' }
                    }
                ],
                icon: 'film',
                color: '#8e44ad'
            },
            {
                id: 2,
                name: 'Утро',
                displayName: 'Доброе утро',
                enabled: true,
                devices: [
                    {
                        device: 1,
                        state: { power: true, brightness: 100, color: '#ffffff' }
                    }
                ],
                icon: 'sun',
                color: '#f1c40f'
            }
        ];
    }

    // Запуск сканирования устройств
    startDeviceScan() {
        if (this.isScanning) return;
        this.isScanning = true;
        this.discoveredDevices = [];
        this.app.showNotification('Сканирование сети начато...', 'info');

        this.scanInterval = setInterval(() => {
            this.discoverMockDevices();
        }, 2000);

        setTimeout(() => {
            this.stopDeviceScan();
        }, 10000);
    }

    // Остановка сканирования
    stopDeviceScan() {
        if (!this.isScanning) return;
        clearInterval(this.scanInterval);
        this.isScanning = false;
        this.app.showNotification(`Сканирование завершено. Найдено устройств: ${this.discoveredDevices.length}`, 'success');
    }

    // Мокаем обнаружение устройств
    discoverMockDevices() {
        const mockDevices = [
            {
                id: Date.now(),
                name: 'Умная лампа спальня',
                type: 'light',
                manufacturer: 'Philips',
                model: 'Hue White',
                ip: `192.168.1.${Math.floor(Math.random() * 50) + 100}`,
                mac: `AA:BB:CC:DD:EE:${Math.floor(Math.random() * 90) + 10}`,
                status: 'discovered',
                room: 'bedroom',
                group: 'lighting',
                connection: 'zigbee',
                signal: Math.floor(Math.random() * 30) + 70
            },
            {
                id: Date.now() + 1,
                name: 'Датчик движения коридор',
                type: 'sensor',
                manufacturer: 'Aqara',
                model: 'Motion Sensor',
                ip: `192.168.1.${Math.floor(Math.random() * 50) + 150}`,
                mac: `AA:BB:CC:DD:EE:${Math.floor(Math.random() * 90) + 100}`,
                status: 'discovered',
                room: 'corridor',
                group: 'security',
                connection: 'zigbee',
                signal: Math.floor(Math.random() * 40) + 60
            }
        ];
        mockDevices.forEach(d => {
            if (!this.discoveredDevices.find(dev => dev.mac === d.mac)) {
                this.discoveredDevices.push(d);
            }
        });
    }

    // Добавление найденного устройства
    addDiscoveredDevice(deviceId) {
        const device = this.discoveredDevices.find(d => d.id === deviceId);
        if (device) {
            const newDevice = { ...device, id: Date.now(), status: 'online', lastSeen: new Date(), added: new Date() };
            this.devices.push(newDevice);
            this.saveDevices();
            this.discoveredDevices = this.discoveredDevices.filter(d => d.id !== deviceId);
            this.app.showNotification(`Устройство "${newDevice.name}" добавлено`, 'success');
            return newDevice;
        }
        throw new Error('Устройство не найдено в списке обнаруженных');
    }

    // Управление устройством
    controlDevice(deviceId, command, parameters = {}) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) throw new Error('Устройство не найдено');

        switch (command) {
            case 'turn_on':
                device.power = true;
                device.status = 'online';
                break;
            case 'turn_off':
                device.power = false;
                break;
            case 'set_brightness':
                if (device.type === 'light') {
                    device.brightness = parameters.brightness;
                }
                break;
            case 'set_color':
                if (device.type === 'light') {
                    device.color = parameters.color;
                }
                break;
        }
        device.lastSeen = new Date();
        this.saveDevices();
        this.logDeviceAction(device, command, parameters);
        return device;
    }

    logDeviceAction(device, command, parameters) {
        console.log(`Управление: ${device.name} -> ${command}`, parameters);
    }

    getDeviceInfo(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            return { ...device, uptime: this.calculateUptime(device.lastSeen) };
        }
        return null;
    }

    calculateUptime(lastSeen) {
        const now = new Date();
        const diff = now - new Date(lastSeen);
        return Math.floor(diff / 1000);
    }

    createGroup(groupData) {
        const newGroup = {
            id: Date.now(),
            name: groupData.name,
            displayName: groupData.displayName,
            devices: groupData.devices || [],
            icon: groupData.icon || 'devices',
            color: groupData.color || '#3498db'
        };
        this.groups.push(newGroup);
        this.saveGroups();
        return newGroup;
    }

    controlGroup(groupId, command, parameters = {}) {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) throw new Error('Группа не найдена');
        group.devices.forEach(deviceId => this.controlDevice(deviceId, command, parameters));
        this.app.showNotification(`Группа "${group.displayName}" управлена: ${command}`, 'success');
    }

    createAutomation(automationData) {
        const newAutomation = {
            id: Date.now(),
            name: automationData.name,
            enabled: automationData.enabled !== undefined ? automationData.enabled : true,
            trigger: automationData.trigger,
            conditions: automationData.conditions || [],
            actions: automationData.actions,
            created: new Date()
        };
        this.automations.push(newAutomation);
        this.saveAutomations();
        return newAutomation;
    }

    toggleAutomation(automationId, enabled) {
        const automation = this.automations.find(a => a.id === automationId);
        if (automation) {
            automation.enabled = enabled;
            this.saveAutomations();
            const statusStr = enabled ? 'включена' : 'выключена';
            this.app.showNotification(`Автоматизация "${automation.name}" ${statusStr}`, 'info');
        }
    }

    createScene(sceneData) {
        const newScene = {
            id: Date.now(),
            name: sceneData.name,
            displayName: sceneData.displayName,
            enabled: sceneData.enabled !== undefined ? sceneData.enabled : true,
            devices: sceneData.devices || [],
            icon: sceneData.icon || 'palette',
            color: sceneData.color || '#9b59b6'
        };
        this.scenes.push(newScene);
        this.saveScenes();
        return newScene;
    }

    activateScene(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (scene && scene.enabled) {
            scene.devices.forEach(dev => {
                const device = this.devices.find(d => d.id === dev.device);
                if (device) this.controlDevice(device.id, 'turn_on', dev.state);
            });
            this.app.showNotification(`Сцена "${scene.displayName}" активирована`, 'success');
        }
    }

    updateDeviceStatuses() {
        this.devices.forEach(device => {
            if (Math.random() > 0.95) {
                device.status = device.status === 'online' ? 'offline' : 'online';
            }
            if (device.status === 'online') {
                device.lastSeen = new Date();
            }
        });
        this.saveDevices();
    }

    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateDeviceStatuses();
            this.updateEnergyConsumption();
        }, 5000);
    }

    updateEnergyConsumption() {
        let total = 0, today = 0, monthly = 0;
        this.devices.forEach(device => {
            if (device.power && device.energyUsage) {
                total += device.energyUsage;
                today += device.energyUsage * 0.1; // упрощенно
            }
        });
        this.energyConsumption = {
            total: parseFloat(total.toFixed(2)),
            today: parseFloat(today.toFixed(2)),
            monthly: parseFloat((total * 0.3).toFixed(2))
        };
    }

    getRoomStatistics() {
        const rooms = {};
        this.devices.forEach(device => {
            if (!rooms[device.room]) {
                rooms[device.room] = { name: device.room, deviceCount: 0, onlineCount: 0, energyUsage: 0 };
            }
            rooms[device.room].deviceCount++;
            if (device.status === 'online') rooms[device.room].onlineCount++;
            if (device.energyUsage) rooms[device.room].energyUsage += device.energyUsage;
        });
        return Object.values(rooms);
    }

    getDevicesByType(type) {
        return this.devices.filter(d => d.type === type);
    }

    getDevicesByRoom(room) {
        return this.devices.filter(d => d.room === room);
    }

    getDevicesByGroup(groupName) {
        const group = this.groups.find(g => g.name === groupName);
        if (group) {
            return this.devices.filter(d => group.devices.includes(d.id));
        }
        return [];
    }

    removeDevice(deviceId) {
        const index = this.devices.findIndex(d => d.id === deviceId);
        if (index !== -1) {
            const device = this.devices[index];
            this.devices.splice(index, 1);
            this.saveDevices();
            this.groups.forEach(g => { g.devices = g.devices.filter(id => id !== deviceId); });
            this.app.showNotification(`Устройство "${device.name}" удалено`, 'success');
        }
    }

    renameDevice(deviceId, newName) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            const oldName = device.name;
            device.name = newName;
            this.saveDevices();
            this.app.showNotification(`Устройство переименовано: "${oldName}" -> "${newName}"`, 'success');
        }
    }

    updateFirmware(deviceId, newFirmware) {
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            device.firmware = newFirmware;
            device.lastSeen = new Date();
            this.saveDevices();
            this.app.showNotification(`Прошивка устройства "${device.name}" обновлена`, 'success');
        }
    }

    getIoTInfo() {
        return {
            totalDevices: this.devices.length,
            onlineDevices: this.devices.filter(d => d.status === 'online').length,
            groups: this.groups.length,
            automations: this.automations.length,
            scenes: this.scenes.length,
            energyConsumption: this.energyConsumption
        };
    }

    exportIoTConfig() {
        const data = {
            devices: this.devices,
            groups: this.groups,
            automations: this.automations,
            scenes: this.scenes,
            exportTime: new Date(),
            version: '1.0.0'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-iot-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Конфигурация IoT успешно экспортирована', 'success');
    }

    importIoTConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.devices) {
                        this.devices = data.devices;
                        this.saveDevices();
                    }
                    if (data.groups) {
                        this.groups = data.groups;
                        this.saveGroups();
                    }
                    if (data.automations) {
                        this.automations = data.automations;
                        this.saveAutomations();
                    }
                    if (data.scenes) {
                        this.scenes = data.scenes;
                        this.saveScenes();
                    }
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    resetIoT() {
        this.devices = this.getDefaultDevices();
        this.groups = this.getDefaultGroups();
        this.automations = this.getDefaultAutomations();
        this.scenes = this.getDefaultScenes();
        this.saveDevices();
        this.saveGroups();
        this.saveAutomations();
        this.saveScenes();
        this.app.showNotification('Все настройки IoT сброшены к значениям по умолчанию', 'success');
    }
}

// Создаем глобальный экземпляр
window.sfidIoT = new SFIDIoTManager();

// Экспорт по умолчанию
export default SFIDIoTManager;
