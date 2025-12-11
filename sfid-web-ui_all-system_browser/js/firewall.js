class SFIDFirewall {
    constructor(app) {
        this.app = app;
        this.rules = [];
        this.profiles = [];
        this.isEnabled = true;
        this.currentProfile = 'default';
        this.logs = [];
        this.statistics = {
            blocked: 0,
            allowed: 0,
            total: 0
        };

        this.init();
    }

    // Инициализация фаервола
    init() {
        console.log('🛡️ Инициализация межсетевого экрана...');
        this.loadRules();
        this.loadProfiles();
        this.startMonitoring();
    }

    // Загрузка правил из localStorage
    loadRules() {
        const savedRules = localStorage.getItem('sfid_firewall_rules');
        if (savedRules) {
            this.rules = JSON.parse(savedRules);
        } else {
            this.rules = this.getDefaultRules();
            this.saveRules();
        }
    }

    // Загрузка профилей
    loadProfiles() {
        const savedProfiles = localStorage.getItem('sfid_firewall_profiles');
        if (savedProfiles) {
            this.profiles = JSON.parse(savedProfiles);
        } else {
            this.profiles = this.getDefaultProfiles();
            this.saveProfiles();
        }
    }

    // Сохранение правил
    saveRules() {
        localStorage.setItem('sfid_firewall_rules', JSON.stringify(this.rules));
    }

    // Сохранение профилей
    saveProfiles() {
        localStorage.setItem('sfid_firewall_profiles', JSON.stringify(this.profiles));
    }

    // Правила по умолчанию
    getDefaultRules() {
        return [
            {
                id: 1,
                name: 'Блокировка входящих SSH',
                description: 'Блокировка SSH подключений извне',
                enabled: true,
                action: 'block',
                direction: 'inbound',
                protocol: 'tcp',
                port: '22',
                source: 'any',
                destination: 'local',
                priority: 1,
                created: new Date()
            },
            {
                id: 2,
                name: 'Разрешение HTTP/HTTPS',
                description: 'Разрешение веб-трафика',
                enabled: true,
                action: 'allow',
                direction: 'inbound',
                protocol: 'tcp',
                port: '80,443',
                source: 'any',
                destination: 'local',
                priority: 2,
                created: new Date()
            },
            {
                id: 3,
                name: 'Блокировка подозрительных IP',
                description: 'Блокировка известных вредоносных IP',
                enabled: true,
                action: 'block',
                direction: 'both',
                protocol: 'any',
                port: 'any',
                source: 'malicious',
                destination: 'any',
                priority: 1,
                created: new Date()
            }
        ];
    }

    // Профили по умолчанию
    getDefaultProfiles() {
        return [
            {
                name: 'default',
                displayName: 'Стандартный',
                rules: [1, 2, 3],
                isDefault: true
            },
            {
                name: 'strict',
                displayName: 'Строгий',
                rules: [1, 2, 3, 4, 5],
                isDefault: false
            },
            {
                name: 'permissive',
                displayName: 'Разрешающий',
                rules: [2],
                isDefault: false
            }
        ];
    }

    // Включение/выключение фаервола
    toggleFirewall(enabled) {
        this.isEnabled = enabled;
        if (enabled) {
            this.app.showNotification('Межсетевой экран включен', 'success');
        } else {
            this.app.showNotification('Межсетевой экран выключен', 'warning');
        }
        this.updateFirewallStatus();
    }

    // Обновление статуса
    updateFirewallStatus() {
        const statusElement = document.getElementById('firewall-status');
        if (statusElement) {
            statusElement.textContent = this.isEnabled ? 'Включен' : 'Выключен';
            statusElement.className = this.isEnabled ? 'status-enabled' : 'status-disabled';
        }
    }

    // Добавление нового правила
    addRule(ruleData) {
        const newRule = {
            id: Date.now(),
            name: ruleData.name || 'Новое правило',
            description: ruleData.description || '',
            enabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
            action: ruleData.action || 'block',
            direction: ruleData.direction || 'inbound',
            protocol: ruleData.protocol || 'any',
            port: ruleData.port || 'any',
            source: ruleData.source || 'any',
            destination: ruleData.destination || 'any',
            priority: ruleData.priority || 5,
            created: new Date()
        };
        this.rules.push(newRule);
        this.saveRules();
        this.app.showNotification('Правило успешно добавлено', 'success');
        return newRule;
    }

    // Редактировать правило
    editRule(ruleId, updates) {
        const index = this.rules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            this.rules[index] = { ...this.rules[index], ...updates };
            this.saveRules();
            this.app.showNotification('Правило успешно обновлено', 'success');
            return this.rules[index];
        }
        throw new Error('Правило не найдено');
    }

    // Удалить правило
    deleteRule(ruleId) {
        const index = this.rules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            this.rules.splice(index, 1);
            this.saveRules();
            this.app.showNotification('Правило успешно удалено', 'success');
        } else {
            throw new Error('Правило не найдено');
        }
    }

    // Включить/выключить правило
    toggleRule(ruleId, enabled) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = enabled;
            this.saveRules();
            const actionStr = enabled ? 'включено' : 'выключено';
            this.app.showNotification(`Правило "${rule.name}" ${actionStr}`, 'info');
        }
    }

    // Применение профиля
    applyProfile(profileName) {
        const profile = this.profiles.find(p => p.name === profileName);
        if (profile) {
            this.currentProfile = profileName;
            // Активировать правила из профиля
            this.rules.forEach(rule => {
                rule.enabled = profile.rules.includes(rule.id);
            });
            this.saveRules();
            this.app.showNotification(`Применен профиль: ${profile.displayName}`, 'success');
        }
    }

    // Создать профиль
    createProfile(profileData) {
        const newProfile = {
            name: profileData.name,
            displayName: profileData.displayName,
            rules: profileData.rules || [],
            isDefault: false
        };
        this.profiles.push(newProfile);
        this.saveProfiles();
        return newProfile;
    }

    // Обработка пакета
    checkPacket(packet) {
        if (!this.isEnabled) {
            this.logEvent(packet, 'allowed', 'firewall_disabled');
            return 'allowed';
        }
        const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);
        for (const rule of sortedRules) {
            if (rule.enabled && this.matchesRule(rule, packet)) {
                this.logEvent(packet, rule.action, rule.id);
                this.updateStatistics(rule.action);
                return rule.action;
            }
        }
        this.logEvent(packet, 'block', 'default');
        this.updateStatistics('block');
        return 'block';
    }

    // Проверка совпадения пакета и правила
    matchesRule(rule, packet) {
        if (rule.direction !== 'both' && rule.direction !== packet.direction) return false;
        if (rule.protocol !== 'any' && rule.protocol !== packet.protocol) return false;
        if (!this.checkPortMatch(rule.port, packet.port)) return false;
        if (!this.checkAddressMatch(rule.source, packet.source)) return false;
        if (!this.checkAddressMatch(rule.destination, packet.destination)) return false;
        return true;
    }

    checkPortMatch(rulePort, packetPort) {
        if (rulePort === 'any') return true;
        const ports = rulePort.split(',').map(p => p.trim());
        return ports.some(p => {
            if (p.includes('-')) {
                const [start, end] = p.split('-').map(Number);
                return packetPort >= start && packetPort <= end;
            }
            return Number(p) === packetPort;
        });
    }

    checkAddressMatch(ruleAddress, packetAddress) {
        if (ruleAddress === 'any') return true;
        if (ruleAddress === 'local') return this.isLocalAddress(packetAddress);
        if (ruleAddress === 'malicious') return this.isMaliciousAddress(packetAddress);
        return ruleAddress === packetAddress;
    }

    isLocalAddress(address) {
        const patterns = [/^192\.168\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^127\./];
        return patterns.some(p => p.test(address));
    }

    isMaliciousAddress(address) {
        const maliciousIPs = ['192.0.2.1', '203.0.113.1', '198.51.100.1'];
        return maliciousIPs.includes(address);
    }

    logEvent(packet, action, ruleId) {
        const logEntry = { timestamp: new Date(), packet, action, ruleId };
        this.logs.unshift(logEntry);
        if (this.logs.length > 1000) this.logs = this.logs.slice(0, 1000);
        this.saveLogs();
    }

    saveLogs() {
        localStorage.setItem('sfid_firewall_logs', JSON.stringify(this.logs));
    }

    updateStatistics(action) {
        this.statistics.total++;
        if (action === 'block') this.statistics.blocked++;
        if (action === 'allow') this.statistics.allowed++;
    }

    getStatistics() {
        return {
            ...this.statistics,
            blockRate: this.statistics.total > 0 ? (this.statistics.blocked / this.statistics.total * 100).toFixed(2) : 0
        };
    }

    clearLogs() {
        this.logs = [];
        this.saveLogs();
        this.app.showNotification('Логи очищены', 'success');
    }

    resetStatistics() {
        this.statistics = { blocked: 0, allowed: 0, total: 0 };
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            if (this.isEnabled) this.generateMockTraffic();
        }, 3000);
    }

    stopMonitoring() {
        clearInterval(this.monitoringInterval);
    }

    generateMockTraffic() {
        const packets = [
            { direction: 'inbound', protocol: 'tcp', port: 80, source: '8.8.8.8', destination: '192.168.1.100' },
            { direction: 'inbound', protocol: 'tcp', port: 22, source: '203.0.113.5', destination: '192.168.1.100' },
            { direction: 'outbound', protocol: 'udp', port: 53, source: '192.168.1.100', destination: '8.8.8.8' },
            { direction: 'inbound', protocol: 'tcp', port: 443, source: '192.0.2.1', destination: '192.168.1.100' }
        ];
        packets.forEach(packet => this.checkPacket(packet));
    }

    getAllRules() {
        return this.rules.sort((a, b) => a.priority - b.priority);
    }

    getActiveRules() {
        return this.rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
    }

    getLogs(limit = 50) {
        return this.logs.slice(0, limit);
    }

    getRuleById(id) {
        return this.rules.find(r => r.id === id);
    }

    validateRule(ruleData) {
        const errors = [];
        if (!ruleData.name || ruleData.name.trim().length < 3) errors.push('Название правила должно содержать минимум 3 символа');
        if (!['allow', 'block'].includes(ruleData.action)) errors.push('Некорректное действие');
        if (!['inbound', 'outbound', 'both'].includes(ruleData.direction)) errors.push('Некорректное направление');
        if (!['tcp', 'udp', 'icmp', 'any'].includes(ruleData.protocol)) errors.push('Некорректный протокол');
        return errors;
    }

    importRules(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.rules && Array.isArray(data.rules)) {
                        this.rules = data.rules;
                        this.saveRules();
                        resolve(data);
                    } else {
                        reject(new Error('Некорректный формат файла'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    exportRules() {
        const data = { rules: this.rules, exportTime: new Date(), version: '1.0.0' };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-firewall-rules-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Правила успешно экспортированы', 'success');
    }

    getFirewallInfo() {
        return {
            isEnabled: this.isEnabled,
            currentProfile: this.currentProfile,
            totalRules: this.rules.length,
            activeRules: this.rules.filter(r => r.enabled).length,
            statistics: this.getStatistics()
        };
    }

    blockIP(ip, name = 'Блокировка IP') {
        return this.addRule({
            name,
            description: `Блокировка IP ${ip}`,
            action: 'block',
            direction: 'both',
            protocol: 'any',
            port: 'any',
            source: ip,
            destination: 'any',
            priority: 1
        });
    }

    unblockIP(ip) {
        const rulesToRemove = this.rules.filter(r => r.source === ip && r.action === 'block' && r.protocol === 'any');
        rulesToRemove.forEach(r => this.deleteRule(r.id));
    }

    getBlockedIPs() {
        return this.rules.filter(r => r.action === 'block' && r.enabled).map(r => r.source).filter(ip => ip !== 'any' && ip !== 'local' && ip !== 'malicious');
    }

    deleteRule(ruleId) {
        const index = this.rules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            this.rules.splice(index, 1);
            this.saveRules();
            this.app.showNotification('Правило удалено', 'success');
        }
    }
}

// Создаём глобальный экземпляр
window.sfidFirewall = new SFIDFirewall();

// Экспорт по умолчанию
export default SFIDFirewall;
