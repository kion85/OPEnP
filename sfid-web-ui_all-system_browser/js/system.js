class SFIDSystemManager {
    constructor(app) {
        this.app = app;
        this.systemInfo = {};
        this.hardwareInfo = {};
        this.processes = [];
        this.services = [];
        this.performance = {};
        this.systemLogs = [];
        this.startupApps = [];
        this.scheduledTasks = [];
        this.systemEvents = [];
        this.resourceUsage = {};
        this.temperature = {};
        this.updateInterval = null;
        this.monitoringEnabled = false;

        this.init();
    }

    // Инициализация системного менеджера
    init() {
        console.log('💻 Инициализация системного менеджера...');
        this.loadSystemData();
        this.loadSystemInfo();
        this.loadHardwareInfo();
        this.loadProcesses();
        this.loadServices();
        this.loadSystemLogs();
        this.startMonitoring();
        this.app.showNotification('Системный мониторинг запущен', 'info');
    }

    // Загрузка данных о настройках
    loadSystemData() {
        const savedData = localStorage.getItem('sfid_system_settings');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.monitoringEnabled = data.monitoringEnabled || false;
        }
    }

    // Загрузка системной информации
    loadSystemInfo() {
        this.systemInfo = {
            os: {
                name: 'Windows 11 Pro',
                version: '22H2',
                build: '22621.1992',
                architecture: 'x64',
                edition: 'Pro',
                installDate: new Date('2023-01-15')
            },
            system: {
                hostname: 'SFID-WORKSTATION',
                domain: 'HOME',
                manufacturer: 'Custom Build',
                model: 'Gaming PC',
                bootTime: new Date(Date.now() - 86400000), // 24 часа назад
                uptime: 86400, // секунд
                timezone: 'Europe/Moscow',
                language: 'ru-RU'
            },
            bios: {
                vendor: 'American Megatrends',
                version: 'F5',
                date: '2022-08-15',
                uefi: true
            },
            security: {
                antivirus: 'Windows Defender',
                firewall: 'Enabled',
                secureBoot: true,
                bitlocker: false,
                tpm: true
            }
        };
    }

    // Загрузка информации об оборудовании
    loadHardwareInfo() {
        this.hardwareInfo = {
            cpu: {
                manufacturer: 'AMD',
                brand: 'Ryzen 9 5950X',
                cores: 16,
                threads: 32,
                speed: 3.4,
                maxSpeed: 4.9,
                architecture: 'Zen 3',
                cache: {
                    l1: 1024,
                    l2: 8192,
                    l3: 65536
                },
                virtualization: true
            },
            memory: {
                total: 32768, // MB
                slots: 4,
                modules: [
                    {
                        size: 8192,
                        type: 'DDR4',
                        speed: 3200,
                        manufacturer: 'Corsair',
                        partNumber: 'CMK16GX4M2B3200C16'
                    },
                    {
                        size: 8192,
                        type: 'DDR4',
                        speed: 3200,
                        manufacturer: 'Corsair',
                        partNumber: 'CMK16GX4M2B3200C16'
                    },
                    {
                        size: 8192,
                        type: 'DDR4',
                        speed: 3200,
                        manufacturer: 'Corsair',
                        partNumber: 'CMK16GX4M2B3200C16'
                    },
                    {
                        size: 8192,
                        type: 'DDR4',
                        speed: 3200,
                        manufacturer: 'Corsair',
                        partNumber: 'CMK16GX4M2B3200C16'
                    }
                ]
            },
            storage: [
                {
                    name: 'Samsung 970 EVO Plus',
                    type: 'NVMe SSD',
                    size: 1000, // GB
                    used: 650,
                    interface: 'PCIe 3.0 x4',
                    health: 95,
                    temperature: 42
                },
                {
                    name: 'Seagate Barracuda',
                    type: 'HDD',
                    size: 4000, // GB
                    used: 3200,
                    interface: 'SATA III',
                    health: 87,
                    temperature: 35
                }
            ],
            gpu: {
                manufacturer: 'NVIDIA',
                model: 'RTX 3080',
                memory: 10240, // MB
                driver: '528.49',
                temperature: 68,
                utilization: 45
            },
            motherboard: {
                manufacturer: 'ASUS',
                model: 'ROG Strix X570-E',
                chipset: 'AMD X570',
                biosVersion: '4403'
            },
            network: [
                {
                    name: 'Ethernet Controller',
                    manufacturer: 'Intel',
                    model: 'I225-V',
                    speed: 2500 // Mbps
                },
                {
                    name: 'Wi-Fi 6',
                    manufacturer: 'Intel',
                    model: 'AX200',
                    speed: 2400 // Mbps
                }
            ],
            peripherals: [
                {
                    type: 'keyboard',
                    name: 'Corsair K95 RGB',
                    connected: true
                },
                {
                    type: 'mouse',
                    name: 'Logitech G Pro',
                    connected: true
                },
                {
                    type: 'monitor',
                    name: 'LG UltraGear',
                    resolution: '2560x1440',
                    refreshRate: 144
                }
            ],
            power: {
                supply: 'SeaSonic PRIME TX-850',
                wattage: 850,
                efficiency: '80+ Titanium'
            }
        };
    }

    // Загрузка процессов
    loadProcesses() {
        this.processes = [
            {
                pid: 1001,
                name: 'System',
                cpu: 0.5,
                memory: 120,
                status: 'running',
                user: 'SYSTEM',
                priority: 'high',
                threads: 12,
                startupTime: new Date(Date.now() - 86400000),
                path: 'C:\\Windows\\System32\\ntoskrnl.exe'
            },
            {
                pid: 1002,
                name: 'explorer.exe',
                cpu: 2.3,
                memory: 85,
                status: 'running',
                user: 'User',
                priority: 'normal',
                threads: 8,
                startupTime: new Date(Date.now() - 3600000),
                path: 'C:\\Windows\\explorer.exe'
            },
            {
                pid: 1003,
                name: 'chrome.exe',
                cpu: 15.7,
                memory: 450,
                status: 'running',
                user: 'User',
                priority: 'normal',
                threads: 25,
                startupTime: new Date(Date.now() - 1800000),
                path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            },
            {
                pid: 1004,
                name: 'code.exe',
                cpu: 8.2,
                memory: 320,
                status: 'running',
                user: 'User',
                priority: 'normal',
                threads: 18,
                startupTime: new Date(Date.now() - 7200000),
                path: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'
            },
            {
                pid: 1005,
                name: 'steam.exe',
                cpu: 3.1,
                memory: 180,
                status: 'running',
                user: 'User',
                priority: 'low',
                threads: 14,
                startupTime: new Date(Date.now() - 14400000),
                path: 'C:\\Program Files (x86)\\Steam\\steam.exe'
            }
        ];
    }

    // Загрузка сервисов
    loadServices() {
        this.services = [
            {
                id: 1,
                name: 'Windows Update',
                displayName: 'Центр обновления Windows',
                description: 'Обнаружение, скачивание и установка обновлений Windows.',
                status: 'running',
                startupType: 'automatic',
                pid: 1044,
                path: 'C:\\Windows\\system32\\svchost.exe',
                dependencies: ['RPCSS', 'EventLog']
            },
            {
                id: 2,
                name: 'Windows Defender',
                displayName: 'Защитник Windows',
                description: 'Защищает от вирусов, шпионского ПО и др.',
                status: 'running',
                startupType: 'automatic',
                pid: 1088,
                path: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.2205.7-0\\MsMpEng.exe'
            },
            {
                id: 3,
                name: 'Print Spooler',
                displayName: 'Диспетчер печати',
                description: 'Загружает файлы для печати.',
                status: 'stopped',
                startupType: 'automatic',
                pid: null,
                path: 'C:\\Windows\\System32\\spoolsv.exe'
            },
            {
                id: 4,
                name: 'SSDP Discovery',
                displayName: 'Обнаружение SSDP',
                description: 'Обнаруживает устройства UPnP в сети.',
                status: 'running',
                startupType: 'manual',
                pid: 1122,
                path: 'C:\\Windows\\system32\\svchost.exe'
            },
            {
                id: 5,
                name: 'Windows Audio',
                displayName: 'Windows Audio',
                description: 'Управление звуком в Windows.',
                status: 'running',
                startupType: 'automatic',
                pid: 1166,
                path: 'C:\\Windows\\System32\\svchost.exe'
            }
        ];
    }

    // Логи системы
    loadSystemLogs() {
        this.systemLogs = [
            {
                id: 1,
                timestamp: new Date(Date.now() - 3600000),
                type: 'info',
                source: 'System',
                message: 'Система запущена успешно',
                details: 'Все службы запущены'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 1800000),
                type: 'warning',
                source: 'Windows Update',
                message: 'Обновления доступны',
                details: 'Доступны обновления для Windows Defender'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 900000),
                type: 'error',
                source: 'Application Error',
                message: 'Crash Chrome',
                details: 'chrome.exe вызвало сбой'
            },
            {
                id: 4,
                timestamp: new Date(Date.now() - 300000),
                type: 'info',
                source: 'Security',
                message: 'Вирусная угроза нейтрализована',
                details: 'Удален Trojan'
            },
            {
                id: 5,
                timestamp: new Date(Date.now() - 60000),
                type: 'info',
                source: 'Network',
                message: 'Подключение установлено',
                details: 'Ethernet подключен'
            }
        ];
    }

    // Запуск мониторинга
    startMonitoring() {
        this.monitoringEnabled = true;
        this.updateInterval = setInterval(() => {
            this.updateSystemMetrics();
            this.checkSystemHealth();
            this.collectSystemEvents();
        }, 2000);
    }

    // Остановка мониторинга
    stopMonitoring() {
        this.monitoringEnabled = false;
        if (this.updateInterval) clearInterval(this.updateInterval);
    }

    // Обновление метрик системы
    updateSystemMetrics() {
        this.performance = {
            cpu: {
                usage: Math.floor(Math.random() * 30) + 15, // 15-45%
                temperature: Math.floor(Math.random() * 20) + 60, // 60-80°C
                frequency: Math.floor(Math.random() * 500) + 3400, // 3400-3900 MHz
                power: Math.floor(Math.random() * 50) + 80 // Ватты
            },
            memory: {
                usage: Math.floor(Math.random() * 30) + 50, // 50-80%
                available: 32768 - Math.floor(Math.random() * 16384) - 8192,
                cached: Math.floor(Math.random() * 4000) + 2000,
                swap: Math.floor(Math.random() * 20) + 10
            },
            gpu: {
                usage: Math.floor(Math.random() * 40) + 30,
                temperature: Math.floor(Math.random() * 20) + 60,
                memoryUsed: Math.floor(Math.random() * 4000) + 2000,
                fanSpeed: Math.floor(Math.random() * 30) + 40
            },
            storage: [
                {
                    name: 'C:',
                    usage: Math.floor(Math.random() * 10) + 65,
                    readSpeed: Math.floor(Math.random() * 200) + 800,
                    writeSpeed: Math.floor(Math.random() * 100) + 400,
                    iops: Math.floor(Math.random() * 50000) + 50000
                },
                {
                    name: 'D:',
                    usage: Math.floor(Math.random() * 5) + 80,
                    readSpeed: Math.floor(Math.random() * 100) + 150,
                    writeSpeed: Math.floor(Math.random() * 50) + 100,
                    iops: Math.floor(Math.random() * 1000) + 500
                }
            ],
            network: {
                upload: Math.floor(Math.random() * 100000) + 50000,
                download: Math.floor(Math.random() * 500000) + 200000,
                connections: Math.floor(Math.random() * 50) + 100,
                latency: Math.floor(Math.random() * 30) + 10
            },
            power: {
                wattage: Math.floor(Math.random() * 200) + 300,
                voltage: (12 + Math.random() * 0.5).toFixed(2),
                efficiency: (90 + Math.random() * 5).toFixed(0)
            }
        };
        // температуры компонентов
        this.temperature = {
            cpu: this.performance.cpu.temperature,
            gpu: this.performance.gpu.temperature,
            motherboard: Math.floor(Math.random() * 10) + 40,
            storage: Math.floor(Math.random() * 10) + 35,
            ambient: Math.floor(Math.random() * 5) + 25
        };
        // ресурсы
        this.resourceUsage = {
            cpu: this.performance.cpu.usage,
            memory: this.performance.memory.usage,
            gpu: this.performance.gpu.usage,
            network: this.performance.network.upload + this.performance.network.download,
            disk: this.performance.storage[0].usage
        };
    }

    // Проверка здоровья системы
    checkSystemHealth() {
        const health = {
            cpu: this.performance.cpu.temperature < 85,
            memory: this.performance.memory.usage < 90,
            gpu: this.performance.gpu.temperature < 85,
            storage: this.performance.storage.every(s => s.usage < 95),
            network: this.performance.network.latency < 100,
            power: this.performance.power.wattage < 750
        };
        if (this.performance.cpu.temperature > 90) {
            this.addSystemLog('warning', 'Temperature', 'Критическая температура CPU');
        }
        if (this.performance.memory.usage > 95) {
            this.addSystemLog('error', 'Memory', 'Критическая загрузка памяти');
        }
        return health;
    }

    // Добавление логов
    addSystemLog(type, source, message, details = '') {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date(),
            type,
            source,
            message,
            details
        };
        this.systemLogs.unshift(logEntry);
        if (this.systemLogs.length > 1000) this.systemLogs = this.systemLogs.slice(0, 1000);
        this.saveSystemLogs();

        if (type === 'error') {
            this.app.showNotification(`Ошибка системы: ${message}`, 'error');
        }
        return logEntry;
    }

    // Сохранение логов
    saveSystemLogs() {
        localStorage.setItem('sfid_system_logs', JSON.stringify(this.systemLogs));
    }

    // Получение информации
    getSystemInfo() {
        return {
            ...this.systemInfo,
            performance: this.performance,
            temperature: this.temperature,
            resourceUsage: this.resourceUsage,
            health: this.checkSystemHealth()
        };
    }

    getHardwareInfo() {
        return this.hardwareInfo;
    }

    getProcesses() {
        return this.processes;
    }

    getProcessInfo(pid) {
        return this.processes.find(p => p.pid === pid);
    }

    terminateProcess(pid) {
        const index = this.processes.findIndex(p => p.pid === pid);
        if (index !== -1) {
            const name = this.processes[index].name;
            this.processes.splice(index, 1);
            this.addSystemLog('info', 'Process Manager', `Процесс ${name} (PID: ${pid}) завершен`);
            this.app.showNotification(`Процесс ${name} завершен`, 'success');
            return true;
        }
        return false;
    }

    setProcessPriority(pid, priority) {
        const process = this.getProcessInfo(pid);
        if (process) {
            process.priority = priority;
            this.addSystemLog('info', 'Process Manager', `Приоритет процесса ${process.name} изменен на ${priority}`);
            return true;
        }
        return false;
    }

    getServices() {
        return this.services;
    }

    getServiceInfo(name) {
        return this.services.find(s => s.name === name);
    }

    startService(name) {
        const service = this.getServiceInfo(name);
        if (service) {
            service.status = 'running';
            service.pid = Math.floor(Math.random() * 5000) + 1000;
            this.addSystemLog('info', 'Service Manager', `Сервис ${service.displayName} запущен`);
            this.app.showNotification(`Сервис ${service.displayName} запущен`, 'success');
            return true;
        }
        return false;
    }

    stopService(name) {
        const service = this.getServiceInfo(name);
        if (service) {
            service.status = 'stopped';
            service.pid = null;
            this.addSystemLog('info', 'Service Manager', `Сервис ${service.displayName} остановлен`);
            this.app.showNotification(`Сервис ${service.displayName} остановлен`, 'success');
            return true;
        }
        return false;
    }

    setServiceStartupType(name, startupType) {
        const service = this.getServiceInfo(name);
        if (service) {
            service.startupType = startupType;
            this.addSystemLog('info', 'Service Manager', `Тип запуска сервиса ${service.displayName} изменен на ${startupType}`);
            return true;
        }
        return false;
    }

    getSystemLogs(limit = 50, type = 'all') {
        let logs = this.systemLogs;
        if (type !== 'all') {
            logs = logs.filter(log => log.type === type);
        }
        return logs.slice(0, limit);
    }

    getLogsBySource(source, limit = 50) {
        return this.systemLogs.filter(log => log.source === source).slice(0, limit);
    }

    clearSystemLogs() {
        this.systemLogs = [];
        this.saveSystemLogs();
        this.app.showNotification('Логи системы очищены', 'info');
    }

    getPerformanceMetrics() {
        return this.performance;
    }

    getTemperatureInfo() {
        return this.temperature;
    }

    getResourceUsage() {
        return this.resourceUsage;
    }

    getRunningApplications() {
        return this.processes.filter(p => p.user !== 'SYSTEM' && !p.name.includes('.exe')).map(p => ({
            name: p.name,
            pid: p.pid,
            cpu: p.cpu,
            memory: p.memory,
            status: p.status
        }));
    }

    getStartupInfo() {
        return {
            bootTime: this.systemInfo.system.bootTime,
            uptime: this.systemInfo.system.uptime,
            lastBoot: this.calculateLastBootTime()
        };
    }

    calculateLastBootTime() {
        const bootTime = this.systemInfo.system.bootTime;
        const now = new Date();
        const diff = now - bootTime;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    }

    getNetworkInfo() {
        return {
            interfaces: this.hardwareInfo.network,
            performance: this.performance.network,
            connections: this.getNetworkConnections()
        };
    }

    getNetworkConnections() {
        // Имитация подключений
        return [
            {
                protocol: 'TCP',
                localAddress: '192.168.1.100:54321',
                remoteAddress: '173.194.222.113:443',
                state: 'ESTABLISHED',
                pid: 1003,
                process: 'chrome.exe'
            },
            {
                protocol: 'UDP',
                localAddress: '192.168.1.100:1900',
                remoteAddress: '239.255.255.250:1900',
                state: 'LISTENING',
                pid: 1122,
                process: 'svchost.exe'
            },
            {
                protocol: 'TCP',
                localAddress: '192.168.1.100:3389',
                remoteAddress: '0.0.0.0:0',
                state: 'LISTENING',
                pid: 1001,
                process: 'System'
            }
        ];
    }

    getStorageInfo() {
        return {
            drives: this.hardwareInfo.storage,
            performance: this.performance.storage
        };
    }

    getPowerInfo() {
        return {
            supply: this.hardwareInfo.power,
            performance: this.performance.power
        };
    }

    getInstalledPrograms() {
        return [
            { name: 'Google Chrome', version: '112.0.5615.138', publisher: 'Google LLC', installDate: new Date('2023-03-15'), size: 350, installLocation: 'C:\\Program Files\\Google\\Chrome' },
            { name: 'Visual Studio Code', version: '1.77.3', publisher: 'Microsoft', installDate: new Date('2023-04-01'), size: 280, installLocation: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code' },
            { name: 'Steam', version: '2.10.91.91', publisher: 'Valve', installDate: new Date('2023-02-20'), size: 420, installLocation: 'C:\\Program Files (x86)\\Steam' },
            { name: 'Discord', version: '1.0.9003', publisher: 'Discord Inc.', installDate: new Date('2023-05-10'), size: 150, installLocation: 'C:\\Users\\User\\AppData\\Local\\Discord' },
            { name: '7-Zip', version: '22.01', publisher: 'Igor Pavlov', installDate: new Date('2023-01-25'), size: 45, installLocation: 'C:\\Program Files\\7-Zip' }
        ];
    }

    uninstallProgram(name) {
        // Имитация удаления
        this.addSystemLog('info', 'Program Manager', `Программа ${name} удалена`);
        this.app.showNotification(`Программа ${name} удалена`, 'success');
        return true;
    }

    getUpdateInfo() {
        return {
            lastChecked: new Date(Date.now() - 86400000),
            availableUpdates: [
                { name: 'KB5026372', description: 'Обновление Windows 11', size: 285, priority: 'important', installDate: null },
                { name: 'Security Intelligence Update', description: 'Обновление определений Defender', size: 15, priority: 'important', installDate: null }
            ],
            updateHistory: [
                { name: 'KB5025305', description: 'Обновление Windows 11', installDate: new Date('2023-05-15') },
                { name: 'KB5023778', description: 'Обновление Windows 11', installDate: new Date('2023-04-11') }
            ]
        };
    }

    checkForUpdates() {
        this.addSystemLog('info', 'Windows Update', 'Проверка обновлений...');
        setTimeout(() => {
            this.addSystemLog('info', 'Windows Update', 'Обновления доступны для загрузки');
            this.app.showNotification('Доступны новые обновления', 'info');
        }, 3000);
        return true;
    }

    installUpdates() {
        this.addSystemLog('info', 'Windows Update', 'Начало установки обновлений...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.addSystemLog('info', 'Windows Update', 'Обновления успешно установлены');
                this.app.showNotification('Обновления установлены', 'success');
                resolve(true);
            }, 5000);
        });
    }

    getSecurityInfo() {
        return {
            ...this.systemInfo.security,
            threats: this.getSecurityThreats(),
            protectionStatus: 'protected',
            lastScan: new Date(Date.now() - 172800000),
            realTimeProtection: true,
            firewallRules: this.getFirewallRules()
        };
    }

    getSecurityThreats() {
        return [
            { name: 'Trojan:Win32/Wacatac.B!ml', severity: 'high', status: 'quarantined', detectionDate: new Date(Date.now() - 86400000) },
            { name: 'PUA:Win32/Puamson.A!rfn', severity: 'medium', status: 'removed', detectionDate: new Date(Date.now() - 259200000) }
        ];
    }

    getFirewallRules() {
        return [
            { name: 'Google Chrome', protocol: 'TCP', direction: 'outbound', port: '443', action: 'allow', enabled: true },
            { name: 'Steam', protocol: 'UDP', direction: 'inbound', port: '27015', action: 'allow', enabled: true },
            { name: 'Remote Desktop', protocol: 'TCP', direction: 'inbound', port: '3389', action: 'block', enabled: true }
        ];
    }

    getSystemEvents() {
        return this.systemEvents;
    }

    collectSystemEvents() {
        const events = [
            { id: Date.now(), timestamp: new Date(), type: 'info', source: 'System', message: 'Система работает стабильно' },
            { id: Date.now() + 1, timestamp: new Date(), type: 'warning', source: 'Memory', message: 'Высокое использование памяти' }
        ];
        this.systemEvents.unshift(...events);
        if (this.systemEvents.length > 1000) this.systemEvents = this.systemEvents.slice(0, 1000);
    }

    getScheduledTasks() {
        return [
            { name: 'Windows Defender Cache Maintenance', description: 'Очистка кэша Defender', status: 'ready', lastRun: new Date(Date.now() - 43200000), nextRun: new Date(Date.now() + 43200000), trigger: 'daily' },
            { name: 'Windows Update Scheduled Scan', description: 'Плановая проверка обновлений', status: 'running', lastRun: new Date(), nextRun: new Date(Date.now() + 86400000), trigger: 'weekly' },
            { name: 'System Restore Point Creation', description: 'Создание точки восстановления', status: 'ready', lastRun: new Date(Date.now() - 172800000), nextRun: new Date(Date.now() + 86400000) }
        ];
    }

    getEnvironmentVariables() {
        return {
            system: [
                { name: 'PATH', value: 'C:\\Windows\\system32;C:\\Windows;...' },
                { name: 'TEMP', value: 'C:\\Windows\\Temp' },
                { name: 'WINDIR', value: 'C:\\Windows' }
            ],
            user: [
                { name: 'USERPROFILE', value: 'C:\\Users\\User' },
                { name: 'APPDATA', value: 'C:\\Users\\User\\AppData\\Roaming' },
                { name: 'LOCALAPPDATA', value: 'C:\\Users\\User\\AppData\\Local' }
            ]
        };
    }

    getSystemDrivers() {
        return [
            { name: 'nvlddmkm.sys', description: 'NVIDIA Driver', version: '31.0.15.2849', date: '2023-04-15', status: 'running', manufacturer: 'NVIDIA' },
            { name: 'e1i65x64.sys', description: 'Intel Driver', version: '12.19.1.37', date: '2022-11-20', status: 'running', manufacturer: 'Intel' },
            { name: 'amdppm.sys', description: 'AMD Driver', version: '1.0.0.15', date: '2023-01-10', status: 'running', manufacturer: 'AMD' }
        ];
    }

    optimizeSystem() {
        this.addSystemLog('info', 'System Optimizer', 'Запуск оптимизации...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.performance.memory.usage -= 5;
                this.performance.cpu.usage -= 3;
                this.addSystemLog('info', 'System Optimizer', 'Оптимизация завершена');
                this.app.showNotification('Система оптимизирована', 'success');
                resolve(true);
            }, 3000);
        });
    }

    cleanTempFiles() {
        this.addSystemLog('info', 'Disk Cleaner', 'Очистка временных файлов...');
        return new Promise((resolve) => {
            setTimeout(() => {
                const freedSpace = Math.floor(Math.random() * 2000) + 500; // MB
                this.addSystemLog('info', 'Disk Cleaner', `Освобождено ${freedSpace} МБ`);
                this.app.showNotification(`Освобождено ${freedSpace} МБ`, 'success');
                resolve(freedSpace);
            }, 2000);
        });
    }

    defragmentDisk(driveLetter) {
        this.addSystemLog('info', 'Disk Defragmenter', `Дефрагментация диска ${driveLetter}...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                this.addSystemLog('info', 'Disk Defragmenter', 'Дефрагментация завершена');
                this.app.showNotification('Дефрагментация завершена', 'success');
                resolve(true);
            }, 5000);
        });
    }

    checkSystemFileIntegrity() {
        this.addSystemLog('info', 'System File Checker', 'Проверка системных файлов...');
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = {
                    scannedFiles: Math.floor(Math.random() * 5000) + 10000,
                    corruptedFiles: Math.floor(Math.random() * 5)
                };
                this.addSystemLog('info', 'System File Checker', `Обнаружено поврежденных файлов: ${result.corruptedFiles}`);
                this.app.showNotification('Проверка завершена', 'success');
                resolve(result);
            }, 4000);
        });
    }

    createRestorePoint(description = 'Создано SFID System Manager') {
        this.addSystemLog('info', 'System Restore', 'Создание точки восстановления...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.addSystemLog('info', 'System Restore', 'Точка восстановления создана');
                this.app.showNotification('Точка восстановления создана', 'success');
                resolve(true);
            }, 3000);
        });
    }

    getRealTimeSystemInfo() {
        return {
            timestamp: new Date(),
            performance: this.performance,
            temperature: this.temperature,
            resourceUsage: this.resourceUsage,
            health: this.checkSystemHealth()
        };
    }

    // Сохранение/сброс настроек
    saveSystemSettings() {
        localStorage.setItem('sfid_system_settings', JSON.stringify({ monitoringEnabled: this.monitoringEnabled, lastUpdate: new Date() }));
    }

    resetSystemSettings() {
        this.monitoringEnabled = false;
        this.systemLogs = [];
        this.performance = {};
        this.temperature = {};
        this.resourceUsage = {};
        localStorage.removeItem('sfid_system_settings');
        localStorage.removeItem('sfid_system_logs');
        this.app.showNotification('Настройки сброшены', 'success');
    }

    exportSystemInfo() {
        const data = {
            systemInfo: this.systemInfo,
            hardwareInfo: this.hardwareInfo,
            performance: this.performance,
            temperature: this.temperature,
            exportTime: new Date()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-system-info-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Информация о системе экспортирована', 'success');
    }

    // Внутренние методы
    addSystemLog(type, source, message, details = '') {
        const log = { id: Date.now(), timestamp: new Date(), type, source, message, details };
        this.systemLogs.unshift(log);
        if (this.systemLogs.length > 1000) this.systemLogs = this.systemLogs.slice(0, 1000);
        this.saveSystemLogs();
        if (type === 'error') this.app.showNotification(`Ошибка: ${message}`, 'error');
        return log;
    }

    saveSystemLogs() {
        localStorage.setItem('sfid_system_logs', JSON.stringify(this.systemLogs));
    }
}

// Создаем глобальный экземпляр
window.sfidSystem = new SFIDSystemManager();

// Экспорт для использования
export default SFIDSystemManager;
