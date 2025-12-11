class SFIDQoSManager {
    constructor(app) {
        this.app = app;
        this.qosEnabled = false;
        this.qosProfiles = [];
        this.activeRules = [];
        this.trafficClasses = [];
        this.bandwidthLimits = {};
        this.priorityRules = [];
        this.applicationRules = [];
        this.deviceRules = [];
        this.trafficStats = {
            totalUpload: 0,
            totalDownload: 0,
            classifiedTraffic: 0,
            realTimeTraffic: 0
        };
        this.currentProfile = null;
        this.trafficMonitoring = null;
        this.updateInterval = null;

        this.init();
    }

    init() {
        console.log('⚡ Инициализация QoS менеджера...');
        this.loadQoSData();
        this.loadQoSProfiles();
        this.loadPriorityRules();
        this.loadTrafficStats();
        this.startTrafficMonitoring();
        this.startPeriodicUpdates();
        this.app.showNotification('QoS менеджер запущен', 'info');
    }

    loadQoSData() {
        const savedQoS = localStorage.getItem('sfid_qos_settings');
        if (savedQoS) {
            const data = JSON.parse(savedQoS);
            this.qosEnabled = data.enabled;
            this.currentProfile = data.currentProfile;
            this.bandwidthLimits = data.bandwidthLimits;
        } else {
            this.setDefaultQoSSettings();
            this.saveQoSData();
        }
    }

    loadQoSProfiles() {
        const savedProfiles = localStorage.getItem('sfid_qos_profiles');
        if (savedProfiles) {
            this.qosProfiles = JSON.parse(savedProfiles);
        } else {
            this.qosProfiles = this.getDefaultQoSProfiles();
            this.saveQoSProfiles();
        }
    }

    loadPriorityRules() {
        const savedRules = localStorage.getItem('sfid_qos_rules');
        if (savedRules) {
            this.priorityRules = JSON.parse(savedRules);
        } else {
            this.priorityRules = this.getDefaultPriorityRules();
            this.savePriorityRules();
        }
    }

    loadTrafficStats() {
        const savedStats = localStorage.getItem('sfid_qos_stats');
        if (savedStats) {
            this.trafficStats = JSON.parse(savedStats);
        }
    }

    saveQoSData() {
        localStorage.setItem('sfid_qos_settings', JSON.stringify({
            enabled: this.qosEnabled,
            currentProfile: this.currentProfile,
            bandwidthLimits: this.bandwidthLimits
        }));
    }

    saveQoSProfiles() {
        localStorage.setItem('sfid_qos_profiles', JSON.stringify(this.qosProfiles));
    }

    savePriorityRules() {
        localStorage.setItem('sfid_qos_rules', JSON.stringify(this.priorityRules));
    }

    saveTrafficStats() {
        localStorage.setItem('sfid_qos_stats', JSON.stringify(this.trafficStats));
    }

    setDefaultQoSSettings() {
        this.qosEnabled = false;
        this.currentProfile = null;
        this.bandwidthLimits = { upload: 100000, download: 1000000 }; // 100Mbps / 1Gbps
    }

    getDefaultQoSProfiles() {
        return [
            {
                id: 1,
                name: 'Игры и стриминг',
                description: 'Приоритет для игр и потокового видео',
                enabled: true,
                rules: [1, 2, 3],
                bandwidth: { upload: 80000, download: 800000 },
                trafficClasses: [
                    {
                        id: 1,
                        name: 'Игровой трафик',
                        priority: 'highest',
                        applications: ['steam', 'battlenet', 'origin'],
                        devices: [],
                        ports: [27015, 25565, 7777],
                        protocols: ['udp', 'tcp']
                    }
                ]
            },
            {
                id: 2,
                name: 'Рабочий профиль',
                description: 'Приоритет для рабочих приложений',
                enabled: false,
                rules: [4, 5],
                bandwidth: { upload: 50000, download: 500000 },
                trafficClasses: [
                    {
                        id: 2,
                        name: 'Видеоконференции',
                        priority: 'high',
                        applications: ['zoom', 'teams', 'skype'],
                        devices: [],
                        ports: [3478, 5222, 5060],
                        protocols: ['tcp', 'udp']
                    }
                ]
            },
            {
                id: 3,
                name: 'Семейный',
                description: 'Сбалансированное распределение для всех',
                enabled: false,
                rules: [6, 7],
                bandwidth: { upload: 30000, download: 300000 },
                trafficClasses: [
                    {
                        id: 3,
                        name: 'Общий трафик',
                        priority: 'medium',
                        applications: [],
                        devices: [],
                        ports: [],
                        protocols: []
                    }
                ]
            }
        ];
    }

    getDefaultPriorityRules() {
        return [
            {
                id: 1,
                name: 'Игровой трафик - высший приоритет',
                type: 'application',
                target: 'games',
                priority: 'highest',
                bandwidth: { min: 20000, max: 50000 },
                conditions: { ports: [27015, 25565, 7777], protocols: ['udp', 'tcp'], dscp: 46 }
            },
            {
                id: 2,
                name: 'VoIP и видео-звонки',
                type: 'application',
                target: 'voip',
                priority: 'high',
                bandwidth: { min: 10000, max: 20000 },
                conditions: { ports: [5060, 3478, 5222], protocols: ['udp', 'tcp'], dscp: 34 }
            },
            {
                id: 3,
                name: 'Потоковое видео',
                type: 'application',
                target: 'streaming',
                priority: 'medium',
                bandwidth: { min: 5000, max: 15000 },
                conditions: { ports: [80, 443, 1935], protocols: ['tcp'], dscp: 26 }
            },
            {
                id: 4,
                name: 'Веб-браузинг',
                type: 'application',
                target: 'web',
                priority: 'low',
                bandwidth: { min: 1000, max: 5000 },
                conditions: { ports: [80, 443], protocols: ['tcp'], dscp: 18 }
            },
            {
                id: 5,
                name: 'Файлообмен',
                type: 'application',
                target: 'p2p',
                priority: 'lowest',
                bandwidth: { min: 500, max: 2000 },
                conditions: { ports: [6881, 6889], protocols: ['tcp'], dscp: 10 }
            }
        ];
    }

    toggleQoS(enabled) {
        this.qosEnabled = enabled;
        this.saveQoSData();
        this.app.showNotification(`QoS ${enabled ? 'включен' : 'выключен'}`, 'success');
        return enabled;
    }

    createQoSProfile(profileData) {
        const newProfile = {
            id: Date.now(),
            name: profileData.name,
            description: profileData.description || '',
            enabled: profileData.enabled !== undefined ? profileData.enabled : true,
            rules: profileData.rules || [],
            bandwidth: profileData.bandwidth || { upload: this.bandwidthLimits.upload * 0.8, download: this.bandwidthLimits.download * 0.8 },
            trafficClasses: profileData.trafficClasses || [],
            created: new Date(),
            modified: new Date()
        };
        this.qosProfiles.push(newProfile);
        this.saveQoSProfiles();
        return newProfile;
    }

    activateQoSProfile(profileId) {
        const profile = this.qosProfiles.find(p => p.id === profileId);
        if (profile) {
            this.currentProfile = profile;
            this.qosEnabled = true;
            this.saveQoSData();
            this.app.showNotification(`Активирован профиль: ${profile.name}`, 'success');
        }
    }

    createPriorityRule(ruleData) {
        const newRule = {
            id: Date.now(),
            name: ruleData.name,
            type: ruleData.type,
            target: ruleData.target,
            priority: ruleData.priority,
            bandwidth: ruleData.bandwidth || { min: 1000, max: 5000 },
            conditions: ruleData.conditions || { ports: [], protocols: [], dscp: null },
            enabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
            created: new Date()
        };
        this.priorityRules.push(newRule);
        this.savePriorityRules();
        return newRule;
    }

    deletePriorityRule(ruleId) {
        const index = this.priorityRules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            const name = this.priorityRules[index].name;
            this.priorityRules.splice(index, 1);
            this.savePriorityRules();
            this.app.showNotification(`Правило "${name}" удалено`, 'success');
        }
    }

    setBandwidthLimit(direction, limitMbps) {
        this.bandwidthLimits[direction] = limitMbps;
        this.saveQoSData();
        this.app.showNotification(`Ограничение ${direction} установлено: ${limitMbps} Mbps`, 'success');
    }

    classifyTraffic(packet) {
        // Имитация классификации по портам
        let classification = { type: 'unknown', priority: 'medium', allowed: true };
        if (packet.destinationPort && this.isGamingPort(packet.destinationPort)) {
            classification.type = 'gaming';
            classification.priority = 'highest';
        } else if (packet.destinationPort && this.isVoIPPort(packet.destinationPort)) {
            classification.type = 'voip';
            classification.priority = 'high';
        } else if (packet.destinationPort && this.isStreamingPort(packet.destinationPort)) {
            classification.type = 'streaming';
            classification.priority = 'medium';
        }
        return classification;
    }

    isGamingPort(port) {
        const gamingPorts = [27015, 25565, 7777, 3074, 3724];
        return gamingPorts.includes(port);
    }

    isVoIPPort(port) {
        const voipPorts = [5060, 3478, 5222, 5004, 5005];
        return voipPorts.includes(port);
    }

    isStreamingPort(port) {
        const streamingPorts = [80, 443, 1935, 554, 7070];
        return streamingPorts.includes(port);
    }

    applyQoSPolicies(packet) {
        if (!this.qosEnabled) return { allowed: true, priority: 'medium' };
        const classification = this.classifyTraffic(packet);
        if (this.isBandwidthExceeded(classification.type)) {
            return { allowed: false, reason: 'bandwidth_limit' };
        }
        return classification;
    }

    isBandwidthExceeded(trafficType) {
        const currentUsage = this.getCurrentBandwidthUsage();
        const limit = this.getBandwidthLimitForType(trafficType);
        return currentUsage >= limit;
    }

    getCurrentBandwidthUsage() {
        // Имитация использования
        return Math.floor(Math.random() * 100000) + 50000;
    }

    getBandwidthLimitForType(trafficType) {
        const limits = {
            gaming: 50000,
            voip: 20000,
            streaming: 15000,
            web: 5000,
            p2p: 2000
        };
        return limits[trafficType] || 10000;
    }

    startTrafficMonitoring() {
        this.trafficMonitoring = setInterval(() => {
            this.updateTrafficStats();
            this.detectTrafficPatterns();
        }, 1000);
    }

    updateTrafficStats() {
        this.trafficStats.totalUpload += Math.floor(Math.random() * 100000);
        this.trafficStats.totalDownload += Math.floor(Math.random() * 500000);
        this.trafficStats.classifiedTraffic = Math.floor((this.trafficStats.totalUpload + this.trafficStats.totalDownload) * 0.8);
        this.saveTrafficStats();
    }

    detectTrafficPatterns() {
        // Имитация анализа
        const patterns = {
            gaming: Math.floor(Math.random() * 20) + 10,
            voip: Math.floor(Math.random() * 10) + 5,
            streaming: Math.floor(Math.random() * 30) + 15
        };
        return patterns;
    }

    analyzeNetworkQuality() {
        return {
            latency: Math.floor(Math.random() * 50) + 10,
            jitter: Math.floor(Math.random() * 10) + 1,
            packetLoss: Math.random() * 2,
            mos: (4.0 + Math.random() * 0.5).toFixed(1)
        };
    }

    optimizeForApplication(appName, priority) {
        const existingRule = this.priorityRules.find(r => r.target === appName && r.type === 'application');
        if (existingRule) {
            existingRule.priority = priority;
        } else {
            this.createPriorityRule({
                name: `Оптимизация для ${appName}`,
                type: 'application',
                target: appName,
                priority: priority
            });
        }
        this.savePriorityRules();
        this.app.showNotification(`Оптимизировано для приложения: ${appName}`, 'success');
    }

    optimizeForDevice(deviceId, priority) {
        const existingRule = this.priorityRules.find(r => r.target === deviceId && r.type === 'device');
        if (existingRule) {
            existingRule.priority = priority;
            this.savePriorityRules();
        }
    }

    autoConfigureQoS() {
        const usage = this.getCurrentBandwidthUsage();
        const totalLimit = this.bandwidthLimits.upload + this.bandwidthLimits.download;
        if (usage > totalLimit * 0.8) {
            this.enableAggressiveQoS();
        } else if (usage > totalLimit * 0.6) {
            this.enableBalancedQoS();
        } else {
            this.enableBasicQoS();
        }
        this.app.showNotification('Автоматическая настройка QoS завершена', 'success');
    }

    enableAggressiveQoS() {
        this.qosEnabled = true;
        this.priorityRules.push(
            {
                name: 'Агрессивный игровой трафик',
                type: 'application',
                target: 'games',
                priority: 'highest',
                bandwidth: { min: 30000, max: 60000 }
            },
            {
                name: 'Агрессивный VoIP',
                type: 'application',
                target: 'voip',
                priority: 'high',
                bandwidth: { min: 15000, max: 25000 }
            }
        );
        this.savePriorityRules();
        this.saveQoSData();
    }

    enableBalancedQoS() {
        this.qosEnabled = true;
        this.priorityRules.push(
            {
                name: 'Сбалансированный игровой трафик',
                type: 'application',
                target: 'games',
                priority: 'high',
                bandwidth: { min: 20000, max: 40000 }
            },
            {
                name: 'Сбалансированный VoIP',
                type: 'application',
                target: 'voip',
                priority: 'medium',
                bandwidth: { min: 10000, max: 20000 }
            }
        );
        this.savePriorityRules();
        this.saveQoSData();
    }

    enableBasicQoS() {
        this.qosEnabled = true;
        this.priorityRules.push(
            {
                name: 'Базовый игровой трафик',
                type: 'application',
                target: 'games',
                priority: 'medium',
                bandwidth: { min: 10000, max: 20000 }
            }
        );
        this.savePriorityRules();
        this.saveQoSData();
    }

    getPerformanceReports() {
        return [
            {
                id: 1,
                period: 'daily',
                generated: new Date(),
                metrics: {
                    latency: Math.floor(Math.random() * 30) + 10,
                    jitter: Math.floor(Math.random() * 5) + 1,
                    packetLoss: (Math.random() * 1).toFixed(2),
                    bandwidthUtilization: Math.floor(Math.random() * 30) + 50
                }
            }
        ];
    }

    resetQoS() {
        this.qosEnabled = false;
        this.currentProfile = null;
        this.priorityRules = this.getDefaultPriorityRules();
        this.trafficStats = {
            totalUpload: 0,
            totalDownload: 0,
            classifiedTraffic: 0,
            realTimeTraffic: 0
        };
        this.saveQoSData();
        this.savePriorityRules();
        this.saveTrafficStats();
        this.app.showNotification('Настройки QoS сброшены', 'success');
    }

    exportQoSConfig() {
        const data = {
            qosSettings: {
                enabled: this.qosEnabled,
                currentProfile: this.currentProfile,
                bandwidthLimits: this.bandwidthLimits
            },
            qosProfiles: this.qosProfiles,
            priorityRules: this.priorityRules,
            trafficStats: this.trafficStats,
            exportTime: new Date(),
            version: '1.0.0'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-qos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Конфигурация QoS экспортирована', 'success');
    }

    importQoSConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.qosSettings) {
                        this.qosEnabled = data.qosSettings.enabled;
                        this.currentProfile = data.qosSettings.currentProfile;
                        this.bandwidthLimits = data.qosSettings.bandwidthLimits;
                        this.saveQoSData();
                    }
                    if (data.qosProfiles) {
                        this.qosProfiles = data.qosProfiles;
                        this.saveQoSProfiles();
                    }
                    if (data.priorityRules) {
                        this.priorityRules = data.priorityRules;
                        this.savePriorityRules();
                    }
                    if (data.trafficStats) {
                        this.trafficStats = data.trafficStats;
                        this.saveTrafficStats();
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.qosEnabled) {
                this.updateQoSPerformance();
            }
        }, 5000);
    }

    updateQoSPerformance() {
        // Имитация обновления метрик
        console.log('📊 Обновление метрик QoS...');
    }

    destroy() {
        if (this.trafficMonitoring) clearInterval(this.trafficMonitoring);
        if (this.updateInterval) clearInterval(this.updateInterval);
    }
}

// Создаем глобальный экземпляр
window.sfidQoS = new SFIDQoSManager();

// Экспорт
export default SFIDQoSManager;
