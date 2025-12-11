class SFIDNetworkManager {
    constructor(app) {
        this.app = app;
        this.networkDevices = [];
        this.wifiNetworks = [];
        this.connections = [];
        this.firewallRules = [];
        this.vpnConnections = [];
        this.networkInterfaces = [];
        this.currentConnection = null;
        this.networkStatus = {
            online: false,
            type: 'unknown',
            speed: 0,
            latency: 0
        };
        this.networkStats = {
            upload: 0,
            download: 0,
            packetsSent: 0,
            packetsReceived: 0
        };
        this.init();
    }

    init() {
        console.log('🌐 Инициализация сетевого менеджера...');
        this.loadNetworkData();
        this.loadWiFiNetworks();
        this.loadFirewallRules();
        this.loadVPNConnections();
        this.startNetworkMonitoring();
        this.startPeriodicUpdates();
    }

    loadNetworkData() {
        const savedDevices = localStorage.getItem('sfid_network_devices');
        if (savedDevices) {
            this.networkDevices = JSON.parse(savedDevices);
        } else {
            this.networkDevices = this.getDefaultNetworkDevices();
            this.saveNetworkData();
        }
        if (this.networkDevices.length > 0) {
            this.currentConnection = this.networkDevices[0];
        }
    }

    loadWiFiNetworks() {
        const savedNetworks = localStorage.getItem('sfid_wifi_networks');
        if (savedNetworks) {
            this.wifiNetworks = JSON.parse(savedNetworks);
        } else {
            this.wifiNetworks = this.getDefaultWiFiNetworks();
            this.saveWiFiNetworks();
        }
    }

    loadFirewallRules() {
        const savedRules = localStorage.getItem('sfid_firewall_rules');
        if (savedRules) {
            this.firewallRules = JSON.parse(savedRules);
        } else {
            this.firewallRules = this.getDefaultFirewallRules();
            this.saveFirewallRules();
        }
    }

    loadVPNConnections() {
        const savedVPN = localStorage.getItem('sfid_vpn_connections');
        if (savedVPN) {
            this.vpnConnections = JSON.parse(savedVPN);
        } else {
            this.vpnConnections = this.getDefaultVPNConnections();
            this.saveVPNConnections();
        }
    }

    saveNetworkData() {
        localStorage.setItem('sfid_network_devices', JSON.stringify(this.networkDevices));
    }

    saveWiFiNetworks() {
        localStorage.setItem('sfid_wifi_networks', JSON.stringify(this.wifiNetworks));
    }

    saveFirewallRules() {
        localStorage.setItem('sfid_firewall_rules', JSON.stringify(this.firewallRules));
    }

    saveVPNConnections() {
        localStorage.setItem('sfid_vpn_connections', JSON.stringify(this.vpnConnections));
    }

    getDefaultNetworkDevices() {
        return [
            {
                id: 1,
                name: 'Основной роутер',
                type: 'router',
                manufacturer: 'TP-Link',
                model: 'Archer C7',
                ip: '192.168.1.1',
                mac: 'AA:BB:CC:DD:EE:FF',
                status: 'online',
                connection: {
                    type: 'wifi',
                    ssid: 'HomeNetwork',
                    security: 'WPA2',
                    signal: 85,
                    frequency: 2.4,
                    channel: 6
                },
                clients: [
                    {
                        id: 101,
                        name: 'Мой компьютер',
                        type: 'desktop',
                        ip: '192.168.1.100',
                        mac: '11:22:33:44:55:66',
                        hostname: 'DESKTOP-PC',
                        connectionType: 'wifi',
                        signal: 75,
                        dataUsage: {
                            upload: 125000000,
                            download: 980000000
                        },
                        online: true
                    },
                    {
                        id: 102,
                        name: 'Смартфон',
                        type: 'mobile',
                        ip: '192.168.1.101',
                        mac: '22:33:44:55:66:77',
                        hostname: 'Android-Phone',
                        connectionType: 'wifi',
                        signal: 60,
                        dataUsage: {
                            upload: 45000000,
                            download: 320000000
                        },
                        online: true
                    }
                ],
                services: ['dhcp', 'dns', 'nat', 'firewall'],
                uptime: 86400,
                firmware: '1.2.3'
            },
            {
                id: 2,
                name: 'Точка доступа',
                type: 'access_point',
                manufacturer: 'Ubiquiti',
                model: 'UAP-AC-Lite',
                ip: '192.168.1.2',
                mac: 'BB:CC:DD:EE:FF:AA',
                status: 'online',
                connection: {
                    type: 'ethernet',
                    speed: 1000
                },
                clients: [],
                services: ['wifi'],
                uptime: 43200,
                firmware: '4.3.20'
            },
            {
                id: 3,
                name: 'Коммутатор',
                type: 'switch',
                manufacturer: 'Netgear',
                model: 'GS308',
                ip: null,
                mac: 'CC:DD:EE:FF:AA:BB',
                status: 'offline',
                connection: null,
                clients: [],
                services: [],
                uptime: 0,
                firmware: null
            }
        ];
    }

    getDefaultWiFiNetworks() {
        return [
            {
                id: 1,
                ssid: 'HomeNetwork',
                bssid: 'AA:BB:CC:DD:EE:FF',
                security: 'WPA2',
                signal: 85,
                frequency: 2.4,
                channel: 6,
                connected: true,
                saved: true
            },
            {
                id: 2,
                ssid: 'HomeNetwork-5G',
                bssid: 'AA:BB:CC:DD:EE:00',
                security: 'WPA2',
                signal: 90,
                frequency: 5,
                channel: 36,
                connected: false,
                saved: true
            },
            {
                id: 3,
                ssid: 'NeighborWiFi',
                bssid: 'BB:CC:DD:EE:FF:11',
                security: 'WPA2',
                signal: 45,
                frequency: 2.4,
                channel: 11,
                connected: false,
                saved: false
            },
            {
                id: 4,
                ssid: 'PublicWiFi',
                bssid: 'CC:DD:EE:FF:AA:22',
                security: 'Open',
                signal: 30,
                frequency: 2.4,
                channel: 1,
                connected: false,
                saved: false
            }
        ];
    }

    getDefaultFirewallRules() {
        return [
            {
                id: 1,
                name: 'Разрешить HTTP',
                action: 'allow',
                protocol: 'tcp',
                source: 'any',
                destination: '192.168.1.100',
                port: 80,
                direction: 'in',
                enabled: true
            },
            {
                id: 2,
                name: 'Разрешить HTTPS',
                action: 'allow',
                protocol: 'tcp',
                source: 'any',
                destination: '192.168.1.100',
                port: 443,
                direction: 'in',
                enabled: true
            },
            {
                id: 3,
                name: 'Блокировать P2P',
                action: 'deny',
                protocol: 'tcp',
                source: 'any',
                destination: 'any',
                port: '6881-6889',
                direction: 'in',
                enabled: true
            },
            {
                id: 4,
                name: 'Запретить удаленный доступ',
                action: 'deny',
                protocol: 'tcp',
                source: 'any',
                destination: '192.168.1.1',
                port: 22,
                direction: 'in',
                enabled: true
            }
        ];
    }

    getDefaultVPNConnections() {
        return [
            {
                id: 1,
                name: 'Рабочий VPN',
                type: 'openvpn',
                server: 'vpn.company.com',
                status: 'disconnected',
                connectedSince: null
            },
            {
                id: 2,
                name: 'Персональный VPN',
                type: 'wireguard',
                server: 'personal.vpn.com',
                status: 'disconnected',
                connectedSince: null
            }
        ];
    }

    // Имитация сканирования сети
    scanNetwork() {
        console.log('🔍 Сканирование сети...');
        const mockDevices = [
            {
                id: 104,
                name: 'Умный телевизор',
                type: 'tv',
                ip: '192.168.1.105',
                mac: '33:44:55:66:77:88',
                hostname: 'SmartTV-LG',
                connectionType: 'wifi',
                signal: 70,
                dataUsage: {
                    upload: 5000000,
                    download: 45000000
                },
                online: true
            },
            {
                id: 105,
                name: 'Игровая консоль',
                type: 'console',
                ip: '192.168.1.106',
                mac: '44:55:66:77:88:99',
                hostname: 'PlayStation-5',
                connectionType: 'ethernet',
                signal: null,
                dataUsage: {
                    upload: 150000000,
                    download: 780000000
                },
                online: true
            }
        ];
        // Добавляем новые устройства, если их еще нет
        mockDevices.forEach(device => {
            if (!this.networkDevices.some(d => d.mac === device.mac))
                this.networkDevices.push(device);
        });
        this.saveNetworkData();
        return mockDevices;
    }

    // Имитация сканирования Wi-Fi сетей
    scanWiFi() {
        console.log('📶 Сканирование Wi-Fi сетей...');
        const mockNetworks = [
            {
                id: 5,
                ssid: 'Новая сеть',
                bssid: 'DD:EE:FF:AA:BB:CC',
                security: 'WPA3',
                signal: 65,
                frequency: 5,
                channel: 44,
                connected: false,
                saved: false
            }
        ];
        // Добавляем новые сети
        mockNetworks.forEach(network => {
            if (!this.wifiNetworks.some(n => n.bssid === network.bssid))
                this.wifiNetworks.push(network);
        });
        this.saveWiFiNetworks();
        return mockNetworks;
    }

    connectToWiFi(networkId, password = null) {
        const network = this.wifiNetworks.find(n => n.id === networkId);
        if (network) {
            // Отключаем все остальные
            this.wifiNetworks.forEach(n => n.connected = false);
            network.connected = true;
            network.saved = true;
            this.saveWiFiNetworks();
            this.app.showNotification(`Подключено к Wi-Fi: ${network.ssid}`, 'success');
            return network;
        }
        throw new Error('Wi-Fi сеть не найдена');
    }

    disconnectFromWiFi(networkId) {
        const network = this.wifiNetworks.find(n => n.id === networkId);
        if (network) {
            network.connected = false;
            this.saveWiFiNetworks();
            this.app.showNotification(`Отключено от Wi-Fi: ${network.ssid}`, 'info');
        }
    }

    createFirewallRule(ruleData) {
        const newRule = {
            id: Date.now(),
            name: ruleData.name,
            action: ruleData.action,
            protocol: ruleData.protocol,
            source: ruleData.source,
            destination: ruleData.destination,
            port: ruleData.port,
            direction: ruleData.direction,
            enabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
            created: new Date()
        };
        this.firewallRules.push(newRule);
        this.saveFirewallRules();
        return newRule;
    }

    deleteFirewallRule(ruleId) {
        const index = this.firewallRules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            const rule = this.firewallRules[index];
            this.firewallRules.splice(index, 1);
            this.saveFirewallRules();
            this.app.showNotification(`Правило фаервола "${rule.name}" удалено`, 'success');
        }
    }

    connectToVPN(vpnId, credentials = {}) {
        const vpn = this.vpnConnections.find(v => v.id === vpnId);
        if (vpn) {
            vpn.status = 'connecting';
            setTimeout(() => {
                vpn.status = 'connected';
                vpn.connectedSince = new Date();
                this.saveVPNConnections();
                this.app.showNotification(`Подключено к VPN: ${vpn.name}`, 'success');
            }, 3000);
            return vpn;
        }
        throw new Error('VPN не найден');
    }

    disconnectFromVPN(vpnId) {
        const vpn = this.vpnConnections.find(v => v.id === vpnId);
        if (vpn) {
            vpn.status = 'disconnected';
            vpn.connectedSince = null;
            this.saveVPNConnections();
            this.app.showNotification(`Отключено от VPN: ${vpn.name}`, 'info');
        }
    }

    getNetworkInfo() {
        return {
            online: this.networkStatus.online,
            type: this.networkStatus.type,
            speed: this.networkStatus.speed,
            latency: this.networkStatus.latency,
            publicIP: this.getPublicIP(),
            localIP: this.getLocalIP(),
            dns: this.getDNSInfo()
        };
    }

    getPublicIP() {
        return '89.208.123.45'; // имитация
    }

    getLocalIP() {
        return '192.168.1.100';
    }

    getDNSInfo() {
        return {
            primary: '8.8.8.8',
            secondary: '1.1.1.1'
        };
    }

    testConnectionSpeed() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    download: Math.floor(Math.random() * 500) + 50,
                    upload: Math.floor(Math.random() * 100) + 10
                });
            }, 5000);
        });
    }

    testPing(host = '8.8.8.8') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 50) + 10);
            }, 1000);
        });
    }

    runNetworkDiagnostics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ping: Math.floor(Math.random() * 50) + 10,
                    jitter: Math.floor(Math.random() * 10) + 1,
                    packetLoss: Math.random() * 2
                });
            }, 3000);
        });
    }

    getDataUsage(period = 'daily') {
        return {
            period,
            upload: Math.floor(Math.random() * 5e9) + 1e9,
            download: Math.floor(Math.random() * 20e9) + 5e9,
            topClients: [
                { name: 'Мой компьютер', usage: 45000000000 },
                { name: 'Смартфон', usage: 32000000000 },
                { name: 'Игровая консоль', usage: 28000000000 }
            ]
        };
    }

    configureQoS(qosConfig) {
        console.log('⚡ Настройка QoS:', qosConfig);
        return { success: true, message: 'QoS успешно настроен' };
    }

    configurePortForwarding(forwardingConfig) {
        const newForwarding = {
            id: Date.now(),
            name: forwardingConfig.name,
            protocol: forwardingConfig.protocol,
            externalPort: forwardingConfig.externalPort,
            internalPort: forwardingConfig.internalPort,
            internalIP: forwardingConfig.internalIP,
            enabled: forwardingConfig.enabled !== undefined ? forwardingConfig.enabled : true
        };
        return newForwarding;
    }

    getNetworkInterfaces() {
        return [
            {
                name: 'eth0',
                type: 'ethernet',
                status: 'up',
                speed: 1000,
                mac: 'AA:BB:CC:DD:EE:FF',
                ipv4: '192.168.1.100',
                ipv6: '2001:db8::1',
                tx: 1250000000,
                rx: 980000000
            },
            {
                name: 'wlan0',
                type: 'wireless',
                status: 'up',
                speed: 300,
                mac: '11:22:33:44:55:66',
                ipv4: null,
                ipv6: null
            }
        ];
    }

    rebootNetworkDevice(deviceId) {
        const device = this.networkDevices.find(d => d.id === deviceId);
        if (device) {
            device.status = 'rebooting';
            setTimeout(() => {
                device.status = 'online';
                device.uptime = 0;
                this.saveNetworkData();
                this.app.showNotification(`Сетевое устройство "${device.name}" перезагружено`, 'success');
            }, 10000);
            return { success: true, message: 'Перезагрузка начата' };
        }
        throw new Error('Устройство не найдено');
    }

    updateDeviceFirmware(deviceId, firmwareFile) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5;
                if (progress >= 100) {
                    clearInterval(interval);
                    const device = this.networkDevices.find(d => d.id === deviceId);
                    if (device) {
                        device.firmware = firmwareFile.version;
                        this.saveNetworkData();
                        resolve({ success: true, message: 'Прошивка обновлена' });
                    }
                }
            }, 1000);
        });
    }

    backupConfiguration(deviceId) {
        const device = this.networkDevices.find(d => d.id === deviceId);
        if (device) {
            const config = {
                device,
                backupTime: new Date(),
                version: '1.0.0'
            };
            const configStr = JSON.stringify(config, null, 2);
            const blob = new Blob([configStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sfid-network-config-${device.name}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.app.showNotification('Конфигурация сети сохранена', 'success');
            return config;
        }
        throw new Error('Устройство не найдено');
    }

    restoreConfiguration(deviceId, configFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    const device = this.networkDevices.find(d => d.id === deviceId);
                    if (device) {
                        Object.assign(device, config.device);
                        this.saveNetworkData();
                        resolve(config);
                    }
                } catch (err) {
                    reject(new Error('Ошибка чтения файла конфигурации'));
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(configFile);
        });
    }

    startNetworkMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateNetworkStatus();
            this.updateNetworkStats();
        }, 2000);
    }

    updateNetworkStatus() {
        this.networkStatus.online = navigator.onLine;
        this.networkStatus.type = this.detectConnectionType();
        this.networkStatus.speed = this.estimateConnectionSpeed();
        this.networkStatus.latency = this.estimateLatency();
    }

    updateNetworkStats() {
        this.networkStats.upload += Math.floor(Math.random() * 1e5);
        this.networkStats.download += Math.floor(Math.random() * 5e5);
        this.networkStats.packetsSent += Math.floor(Math.random() * 100);
        this.networkStats.packetsReceived += Math.floor(Math.random() * 150);
    }

    detectConnectionType() {
        if (navigator.connection) {
            return navigator.connection.effectiveType;
        }
        return 'unknown';
    }

    estimateConnectionSpeed() {
        if (navigator.connection && navigator.connection.downlink) {
            return navigator.connection.downlink * 1024 / 8; // Mbps
        }
        return Math.floor(Math.random() * 500) + 50;
    }

    estimateLatency() {
        if (navigator.connection && navigator.connection.rtt) {
            return navigator.connection.rtt;
        }
        return Math.floor(Math.random() * 50) + 10;
    }

    getNetworkSummary() {
        return {
            totalDevices: this.networkDevices.length,
            onlineDevices: this.networkDevices.filter(d => d.status === 'online').length,
            wifiNetworks: this.wifiNetworks.length,
            connectedWiFi: this.wifiNetworks.filter(n => n.connected).length,
            activeVPN: this.vpnConnections.filter(v => v.status === 'connected').length,
            firewallRules: this.firewallRules.length
        };
    }

    exportNetworkConfig() {
        const data = {
            networkDevices: this.networkDevices,
            wifiNetworks: this.wifiNetworks,
            firewallRules: this.firewallRules,
            vpnConnections: this.vpnConnections,
            exportTime: new Date(),
            version: '1.0.0'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-network-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Конфигурация сети экспортирована', 'success');
    }

    importNetworkConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.networkDevices) {
                        this.networkDevices = data.networkDevices;
                        this.saveNetworkData();
                    }
                    if (data.wifiNetworks) {
                        this.wifiNetworks = data.wifiNetworks;
                        this.saveWiFiNetworks();
                    }
                    if (data.firewallRules) {
                        this.firewallRules = data.firewallRules;
                        this.saveFirewallRules();
                    }
                    if (data.vpnConnections) {
                        this.vpnConnections = data.vpnConnections;
                        this.saveVPNConnections();
                    }
                    resolve(data);
                } catch (err) {
                    reject(new Error('Ошибка чтения файла'));
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    resetNetwork() {
        this.networkDevices = this.getDefaultNetworkDevices();
        this.wifiNetworks = this.getDefaultWiFiNetworks();
        this.firewallRules = this.getDefaultFirewallRules();
        this.vpnConnections = this.getDefaultVPNConnections();
        this.saveNetworkData();
        this.saveWiFiNetworks();
        this.saveFirewallRules();
        this.saveVPNConnections();
        this.app.showNotification('Все настройки сети сброшены к значениям по умолчанию', 'success');
    }

    // Деструктор
    destroy() {
        if (this.monitoringInterval) clearInterval(this.monitoringInterval);
        if (this.updateInterval) clearInterval(this.updateInterval);
    }
}

// Глобальный экземпляр
window.sfidNetwork = new SFIDNetworkManager();

// Экспорт
export default SFIDNetworkManager;
