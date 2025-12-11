class SFIDNASManager {
    constructor(app) {
        this.app = app;
        this.nasDevices = [];
        this.storagePools = [];
        this.shares = [];
        this.backupJobs = [];
        this.users = [];
        this.syncTasks = [];
        this.currentNAS = null;
        this.isConnected = false;
        this.storageStats = {
            total: 0,
            used: 0,
            free: 0,
            usagePercent: 0
        };
        this.init();
    }

    init() {
        console.log('💾 Инициализация NAS менеджера...');
        this.loadNASData();
        this.loadUsers();
        this.loadSyncTasks();
        this.checkConnection();
        this.startPeriodicUpdates();
    }

    loadNASData() {
        const savedNAS = localStorage.getItem('sfid_nas_devices');
        if (savedNAS) {
            this.nasDevices = JSON.parse(savedNAS);
        } else {
            this.nasDevices = this.getDefaultNASDevices();
            this.saveNASData();
        }
        if (this.nasDevices.length > 0) {
            this.currentNAS = this.nasDevices[0];
        }
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('sfid_nas_users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        } else {
            this.users = this.getDefaultUsers();
            this.saveUsers();
        }
    }

    loadSyncTasks() {
        const savedTasks = localStorage.getItem('sfid_nas_sync_tasks');
        if (savedTasks) {
            this.syncTasks = JSON.parse(savedTasks);
        } else {
            this.syncTasks = this.getDefaultSyncTasks();
            this.saveSyncTasks();
        }
    }

    saveNASData() {
        localStorage.setItem('sfid_nas_devices', JSON.stringify(this.nasDevices));
    }
    saveUsers() {
        localStorage.setItem('sfid_nas_users', JSON.stringify(this.users));
    }
    saveSyncTasks() {
        localStorage.setItem('sfid_nas_sync_tasks', JSON.stringify(this.syncTasks));
    }

    getDefaultNASDevices() {
        return [
            {
                id: 1,
                name: 'Основной NAS',
                manufacturer: 'Synology',
                model: 'DS920+',
                ip: '192.168.1.200',
                mac: 'AA:BB:CC:DD:EE:FF',
                status: 'online',
                firmware: 'DSM 7.2',
                serial: 'SYN0123456789',
                uptime: 86400,
                cpu: { usage: 15, temperature: 45 },
                memory: { total: 8192, used: 4096, free: 4096 },
                storage: { total: 16000000, used: 8000000, free: 8000000, usagePercent: 50 },
                network: {
                    interfaces: [{ name: 'eth0', speed: 1000, tx: 1250000, rx: 980000 }],
                    services: ['SMB', 'AFP', 'NFS', 'FTP', 'WebDAV'],
                    volumes: [{ id: 1, name: 'Volume1', status: 'normal', total: 8000000, used: 4000000, free: 4000000 }],
                    shares: [1, 2, 3],
                    users: [1, 2],
                    temperature: 35,
                    power: true
                }
            },
            {
                id: 2,
                name: 'Резервный NAS',
                manufacturer: 'QNAP',
                model: 'TS-453D',
                ip: '192.168.1.201',
                mac: 'BB:CC:DD:EE:FF:AA',
                status: 'offline',
                firmware: 'QTS 5.0',
                serial: 'QNAP9876543210',
                uptime: 0,
                cpu: { usage: 0, temperature: 25 },
                memory: { total: 4096, used: 0, free: 4096 },
                storage: { total: 8000000, used: 0, free: 8000000, usagePercent: 0 },
                network: {
                    interfaces: [{ name: 'eth0', speed: 1000, tx: 0, rx: 0 }],
                    services: [],
                    volumes: [],
                    shares: [],
                    users: [],
                    temperature: 25,
                    power: false
                }
            }
        ];
    }

    getDefaultUsers() {
        return [
            {
                id: 1,
                username: 'admin',
                displayName: 'Администратор',
                role: 'admin',
                email: 'admin@local.domain',
                enabled: true,
                lastLogin: new Date(),
                permissions: { read: true, write: true, execute: true }
            },
            {
                id: 2,
                username: 'user',
                displayName: 'Обычный пользователь',
                role: 'user',
                email: 'user@local.domain',
                enabled: true,
                lastLogin: new Date(),
                permissions: { read: true, write: false, execute: false }
            }
        ];
    }

    getDefaultSyncTasks() {
        return [
            {
                id: 1,
                name: 'Резервное копирование документов',
                source: '/shares/documents',
                destination: '/backup/documents',
                type: 'local',
                schedule: { type: 'daily', time: '02:00' },
                enabled: true,
                lastRun: new Date(),
                nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
                status: 'idle',
                filesSynced: 1245,
                dataTransferred: 1024000000
            },
            {
                id: 2,
                name: 'Синхронизация фото в облако',
                source: '/shares/photos',
                destination: 'cloud://yandex/photos',
                type: 'cloud',
                schedule: { type: 'weekly', day: 'sunday', time: '03:00' },
                enabled: true,
                lastRun: new Date(),
                nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'idle',
                filesSynced: 0,
                dataTransferred: 0
            }
        ];
    }

    // Методы для подключения, управления и обновлений
    scanForNAS() {
        console.log('🔍 Сканирование сети для поиска NAS...');
        const mockDevices = [
            {
                id: 3,
                name: 'Обнаруженный NAS',
                manufacturer: 'Asustor',
                model: 'AS6602T',
                ip: `192.168.1.${Math.floor(Math.random() * 50) + 150}`,
                mac: `CC:DD:EE:FF:AA:${Math.floor(Math.random() * 90) + 10}`,
                status: 'discovered',
                firmware: 'ADM 4.0',
                serial: 'ASU1234567890'
            }
        ];
        return mockDevices;
    }

    connectToNAS(nasId, credentials = {}) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (credentials.username === 'admin' && credentials.password === 'password') {
                        nasDevice.status = 'online';
                        nasDevice.lastSeen = new Date();
                        this.currentNAS = nasDevice;
                        this.isConnected = true;
                        this.updateNASStats(nasDevice);
                        this.saveNASData();
                        this.app.showNotification(`Успешно подключено к NAS: ${nasDevice.name}`, 'success');
                        resolve(nasDevice);
                    } else {
                        reject(new Error('Неверные учетные данные'));
                    }
                }, 2000);
            });
        }
        throw new Error('NAS устройство не найдено');
    }

    disconnectFromNAS(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            nasDevice.status = 'offline';
            this.isConnected = false;
            this.saveNASData();
            this.app.showNotification(`Отключено от NAS: ${nasDevice.name}`, 'info');
        }
    }

    updateNASStats(nasDevice) {
        if (nasDevice.status === 'online') {
            nasDevice.cpu.usage = Math.floor(Math.random() * 30) + 5;
            nasDevice.cpu.temperature = Math.floor(Math.random() * 20) + 35;
            nasDevice.memory.used = Math.floor(Math.random() * 2048) + 2048;
            nasDevice.memory.free = nasDevice.memory.total - nasDevice.memory.used;
            nasDevice.storage.used = Math.floor(Math.random() * 2000000) + 6000000;
            nasDevice.storage.free = nasDevice.storage.total - nasDevice.storage.used;
            nasDevice.storage.usagePercent = (nasDevice.storage.used / nasDevice.storage.total) * 100;
            nasDevice.uptime += 5;
        }
    }

    getStorageInfo(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            return {
                total: nasDevice.storage.total,
                used: nasDevice.storage.used,
                free: nasDevice.storage.free,
                usagePercent: nasDevice.storage.usagePercent,
                volumes: nasDevice.volumes || [],
                shares: nasDevice.shares || []
            };
        }
        return null;
    }

    createShare(shareData) {
        const newShare = {
            id: Date.now(),
            name: shareData.name,
            path: shareData.path,
            description: shareData.description || '',
            permissions: shareData.permissions || { read: true, write: true },
            enabled: shareData.enabled !== undefined ? shareData.enabled : true,
            quota: shareData.quota || null,
            encryption: shareData.encryption || false,
            protocols: shareData.protocols || ['SMB'],
            users: shareData.users || [],
            groups: shareData.groups || [],
            created: new Date()
        };
        this.shares.push(newShare);
        if (this.currentNAS) {
            this.currentNAS.shares.push(newShare.id);
            this.saveNASData();
        }
        return newShare;
    }

    deleteShare(shareId) {
        const index = this.shares.findIndex(s => s.id === shareId);
        if (index !== -1) {
            const share = this.shares[index];
            this.shares.splice(index, 1);
            if (this.currentNAS) {
                this.currentNAS.shares = this.currentNAS.shares.filter(id => id !== shareId);
                this.saveNASData();
            }
            this.app.showNotification(`Общий ресурс "${share.name}" удален`, 'success');
        }
    }

    createUser(userData) {
        const newUser = {
            id: Date.now(),
            username: userData.username,
            displayName: userData.displayName,
            role: userData.role || 'user',
            email: userData.email || '',
            enabled: userData.enabled !== undefined ? userData.enabled : true,
            permissions: userData.permissions || { read: true, write: false },
            created: new Date()
        };
        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    deleteUser(userId) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const user = this.users[index];
            this.users.splice(index, 1);
            this.saveUsers();
            this.app.showNotification(`Пользователь "${user.displayName}" удален`, 'success');
        }
    }

    createBackupJob(backupData) {
        const newBackupJob = {
            id: Date.now(),
            name: backupData.name,
            source: backupData.source,
            destination: backupData.destination,
            type: backupData.type || 'incremental',
            schedule: backupData.schedule || { type: 'daily', time: '23:00' },
            retention: backupData.retention || 30,
            compression: backupData.compression || true,
            encryption: backupData.encryption || false,
            enabled: backupData.enabled !== undefined ? backupData.enabled : true,
            lastRun: null,
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'idle'
        };
        this.backupJobs.push(newBackupJob);
        return newBackupJob;
    }

    runBackupJob(backupId) {
        const job = this.backupJobs.find(b => b.id === backupId);
        if (job) {
            job.status = 'running';
            job.lastRun = new Date();
            setTimeout(() => {
                job.status = 'completed';
                this.app.showNotification(`Резервное копирование "${job.name}" завершено`, 'success');
            }, 5000);
            return job;
        }
        throw new Error('Задача резервного копирования не найдена');
    }

    createSyncTask(syncData) {
        const newTask = {
            id: Date.now(),
            name: syncData.name,
            source: syncData.source,
            destination: syncData.destination,
            type: syncData.type || 'bidirectional',
            schedule: syncData.schedule || { type: 'real-time' },
            filters: syncData.filters || { include: '*', exclude: '' },
            enabled: syncData.enabled !== undefined ? syncData.enabled : true,
            lastSync: null,
            nextSync: new Date(),
            status: 'idle'
        };
        this.syncTasks.push(newTask);
        this.saveSyncTasks();
        return newTask;
    }

    runSyncTask(taskId) {
        const task = this.syncTasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'syncing';
            task.lastSync = new Date();
            setTimeout(() => {
                task.status = 'completed';
                task.filesSynced = Math.floor(Math.random() * 100) + 50;
                task.dataTransferred = Math.floor(Math.random() * 500e6) + 100e6;
                this.saveSyncTasks();
                this.app.showNotification(`Синхронизация "${task.name}" завершена`, 'success');
            }, 3000);
            return task;
        }
        throw new Error('Задача синхронизации не найдена');
    }

    getFileList(path = '/', page = 1, pageSize = 50) {
        const files = [
            { name: 'документы', path: '/документы', type: 'directory', size: 0, modified: new Date(), permissions: { read: true, write: true } },
            { name: 'фото', path: '/фото', type: 'directory', size: 0, modified: new Date() },
            { name: 'отчет.pdf', path: '/отчет.pdf', type: 'file', size: 2456789, modified: new Date() },
            { name: 'презентация.pptx', path: '/презентация.pptx', type: 'file', size: 15678900, modified: new Date() }
        ];
        return { files, total: files.length, page, pageSize };
    }

    createDirectory(path, name) {
        console.log(`Создание директории: ${path}/${name}`);
        return { success: true, message: 'Директория успешно создана', path: `${path}/${name}` };
    }

    uploadFile(file, destinationPath) {
        return new Promise((resolve) => {
            const progressInterval = setInterval(() => {
                const progress = Math.min(100, Math.floor(Math.random() * 20) + 80);
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    resolve({ success: true, message: 'Файл успешно загружен', file: file.name, path: `${destinationPath}/${file.name}` });
                }
            }, 500);
        });
    }

    downloadFile(filePath) {
        console.log(`Скачивание файла: ${filePath}`);
        return { success: true, message: 'Файл готов к скачиванию' };
    }

    deleteFile(filePath) {
        console.log(`Удаление: ${filePath}`);
        return { success: true, message: 'Файл успешно удален' };
    }

    renameFile(oldPath, newName) {
        const newPath = `${oldPath.substring(0, oldPath.lastIndexOf('/'))}/${newName}`;
        console.log(`Переименование: ${oldPath} -> ${newPath}`);
        return { success: true, oldPath, newPath };
    }

    getSystemInfo(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            return {
                manufacturer: nasDevice.manufacturer,
                model: nasDevice.model,
                firmware: nasDevice.firmware,
                serial: nasDevice.serial,
                uptime: nasDevice.uptime,
                temperature: nasDevice.temperature
            };
        }
        return null;
    }

    updateFirmware(nasId, firmwareFile) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5;
                if (progress >= 100) {
                    clearInterval(interval);
                    const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
                    if (nasDevice) {
                        nasDevice.firmware = firmwareFile.version;
                        this.saveNASData();
                        resolve({ success: true, message: 'Прошивка успешно обновлена', newVersion: firmwareFile.version });
                    }
                }
            }, 1000);
        });
    }

    rebootNAS(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            nasDevice.status = 'rebooting';
            this.saveNASData();
            setTimeout(() => {
                nasDevice.status = 'online';
                nasDevice.uptime = 0;
                this.saveNASData();
                this.app.showNotification(`NAS "${nasDevice.name}" перезагружен`, 'success');
            }, 10000);
            return { success: true, message: 'Перезагрузка начата' };
        }
        throw new Error('NAS устройство не найдено');
    }

    shutdownNAS(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            nasDevice.status = 'offline';
            nasDevice.power = false;
            this.saveNASData();
            this.app.showNotification(`NAS "${nasDevice.name}" выключен`, 'info');
        }
    }

    powerOnNAS(nasId) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            nasDevice.status = 'online';
            nasDevice.power = true;
            nasDevice.uptime = 0;
            this.saveNASData();
            this.app.showNotification(`NAS "${nasDevice.name}" включен`, 'success');
        }
    }

    getLogs(nasId, logType = 'system', limit = 100) {
        const logs = [
            { timestamp: new Date(), level: 'info', message: 'Система загружена', component: 'system' },
            { timestamp: new Date(Date.now() - 60000), level: 'warning', message: 'Высокая температура CPU', component: 'hardware' },
            { timestamp: new Date(Date.now() - 120000), level: 'error', message: 'Ошибка доступа к файлу', component: 'filesystem' }
        ];
        return logs;
    }

    getPerformanceMetrics(nasId, timeRange = '1h') {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            return {
                cpu: { usage: nasDevice.cpu.usage, temperature: nasDevice.cpu.temperature },
                memory: nasDevice.memory,
                network: nasDevice.network,
                storage: nasDevice.storage
            };
        }
        return null;
    }

    generateReport(nasId, reportType, parameters = {}) {
        const report = {
            id: Date.now(),
            type: reportType,
            generated: new Date(),
            data: {
                period: parameters.period || 'daily',
                filesAdded: Math.floor(Math.random() * 100),
                filesModified: Math.floor(Math.random() * 50),
                storageUsed: Math.floor(Math.random() * 500e6) + 100e6
            }
        };
        return report;
    }

    configureRAID(nasId, raidConfig) {
        console.log('Настройка RAID:', raidConfig);
        return { success: true, message: 'RAID успешно настроен', level: raidConfig.level, disks: raidConfig.disks };
    }

    getDiskStatus(nasId) {
        return [
            { id: 1, name: 'Disk 1', model: 'WD Red 4TB', serial: 'WD-WCC12345678', size: 4000000000, health: 'good', temperature: 32, smart: true },
            { id: 2, name: 'Disk 2', model: 'WD Red 4TB', serial: 'WD-WCC12345679', size: 4000000000, health: 'good', temperature: 31, smart: true }
        ];
    }

    manageServices(nasId, services) {
        const nasDevice = this.nasDevices.find(nas => nas.id === nasId);
        if (nasDevice) {
            nasDevice.services = services;
            this.saveNASData();
            return { success: true, message: 'Службы успешно обновлены' };
        }
    }

    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.currentNAS && this.currentNAS.status === 'online') {
                this.updateNASStats(this.currentNAS);
                this.saveNASData();
            }
        }, 5000);
    }

    checkConnection() {
        if (this.currentNAS) {
            this.isConnected = this.currentNAS.status === 'online';
        }
    }

    getNASSummary() {
        return {
            totalNAS: this.nasDevices.length,
            onlineNAS: this.nasDevices.filter(nas => nas.status === 'online').length,
            totalStorage: this.nasDevices.reduce((sum, nas) => sum + nas.storage.total, 0),
            usedStorage: this.nasDevices.reduce((sum, nas) => sum + nas.storage.used, 0),
            activeBackups: this.backupJobs.filter(job => job.status === 'running').length,
            totalUsers: this.users.length
        };
    }

    exportNASConfig() {
        const data = {
            nasDevices: this.nasDevices,
            users: this.users,
            shares: this.shares,
            backupJobs: this.backupJobs,
            syncTasks: this.syncTasks,
            exportTime: new Date(),
            version: '1.0.0'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sfid-nas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showNotification('Конфигурация NAS успешно экспортирована', 'success');
    }

    importNASConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.nasDevices) {
                        this.nasDevices = data.nasDevices;
                        this.saveNASData();
                    }
                    if (data.users) {
                        this.users = data.users;
                        this.saveUsers();
                    }
                    if (data.shares) {
                        this.shares = data.shares;
                    }
                    if (data.backupJobs) {
                        this.backupJobs = data.backupJobs;
                    }
                    if (data.syncTasks) {
                        this.syncTasks = data.syncTasks;
                        this.saveSyncTasks();
                    }
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    resetNAS() {
        this.nasDevices = this.getDefaultNASDevices();
        this.users = this.getDefaultUsers();
        this.syncTasks = this.getDefaultSyncTasks();
        this.saveNASData();
        this.saveUsers();
        this.saveSyncTasks();
        this.app.showNotification('Все настройки NAS сброшены к значениям по умолчанию', 'success');
    }

    destroy() {
        if (this.updateInterval) clearInterval(this.updateInterval);
    }
}

// Создаем глобальный экземпляр
window.sfidNAS = new SFIDNASManager();

// Экспорт для других модулей
export default SFIDNASManager;
