
import time
import psutil
import socket
import requests
import subprocess
import re
import os
from collections import deque
from datetime import datetime

from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.align import Align
from rich.console import Console
from rich.progress import Progress, BarColumn, TextColumn

# ===========================
# НАСТРОЙКИ И КОНСТАНТЫ
# ===========================
HISTORY_LIMIT = 60
REFRESH_RATE = 1.0  # Сек

# Буферы для графиков
down_history = deque([0]*HISTORY_LIMIT, maxlen=HISTORY_LIMIT)
up_history = deque([0]*HISTORY_LIMIT, maxlen=HISTORY_LIMIT)

console = Console()

# ===========================
# ФУНКЦИИ СБОРА ДАННЫХ
# ===========================

def get_public_data():
    """Получает внешние данные один раз при запуске."""
    try:
        response = requests.get('http://ip-api.com/json/?fields=status,query,isp,city,countryCode', timeout=3)
        data = response.json()
        if data['status'] == 'success':
            return data
    except:
        pass
    return {'query': 'Offline', 'isp': 'Unknown', 'city': '-', 'countryCode': '-'}

def get_gateway_info():
    """Определяет IP шлюза по умолчанию."""
    try:
        # Linux specific parsing
        with os.popen("ip route show default") as f:
            line = f.read()
            match = re.search(r"default via (\d+\.\d+\.\d+\.\d+)", line)
            if match:
                return match.group(1)
    except:
        pass
    return None

def ping_host(host):
    """Быстрый пинг хоста (без sudo, использует системный ping)."""
    if not host: return "N/A"
    try:
        # -c 1 (1 пакет), -W 1 (таймаут 1 сек)
        output = subprocess.check_output(['ping', '-c', '1', '-W', '1', host], stderr=subprocess.STDOUT)
        match = re.search(r'time=([\d\.]+)', output.decode('utf-8'))
        if match:
            return float(match.group(1))
    except:
        return None
    return None

def check_dns():
    """Проверка разрешения имен."""
    try:
        socket.gethostbyname("google.com")
        return True
    except:
        return False

def get_wifi_stats():
    """
    Читает /proc/net/wireless для получения уровня сигнала без iwconfig/nmcli.
    Безопасно и быстро.
    """
    wifi_data = {"quality": 0, "level": 0, "active": False}
    try:
        with open('/proc/net/wireless', 'r') as f:
            lines = f.readlines()
            for line in lines:
                if ':' in line: # Это строка интерфейса
                    parts = line.split()
                    # Формат обычно: interface: status link level noise ...
                    # link - качество (часто 0-70), level - уровень сигнала (dBm)
                    try:
                        # Удаляем двоеточие из имени интерфейса
                        wifi_data["level"] = float(parts[3].replace('.', ''))
                        wifi_data["quality"] = float(parts[2].replace('.', ''))
                        wifi_data["active"] = True
                        # Обычно level отрицательный (dBm), quality положительный
                    except: pass
    except FileNotFoundError:
        pass
    return wifi_data

def get_active_process_name(pid):
    try:
        return psutil.Process(pid).name()
    except:
        return "Unknown"

# ===========================
# ВИЗУАЛИЗАЦИЯ (RICH)
# ===========================

def make_sparkline(data, color="green"):
    """Рисует мини-график текстом."""
    chars = " ▂▃▄▅▆▇█"
    if not data: return ""
    m = max(data) if max(data) > 0 else 1
    line = "".join(chars[min(int(d / m * 7), 7)] for d in data)
    return f"[{color}]{line}[/{color}]"

def create_layout():
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=6),
        Layout(name="middle", size=10),
        Layout(name="bottom")
    )
    layout["middle"].split_row(
        Layout(name="interfaces", ratio=2),
        Layout(name="wifi_box", ratio=1)
    )
    return layout

# ===========================
# MAIN LOOP
# ===========================

# Инициализация статики
public_info = get_public_data()
gateway_ip = get_gateway_info()
start_io = psutil.net_io_counters()

last_io = psutil.net_io_counters()
last_time = time.time()

layout = create_layout()

print("[bold yellow]Инициализация мониторинга...[/bold yellow]")

with Live(layout, refresh_per_second=1, screen=True) as live:
    while True:
        current_time = time.time()
        io_now = psutil.net_io_counters()
        
        # Расчет скоростей
        dt = current_time - last_time
        if dt <= 0: dt = 1
        
        sent_bytes = io_now.bytes_sent - last_io.bytes_sent
        recv_bytes = io_now.bytes_recv - last_io.bytes_recv
        
        upload_speed = (sent_bytes * 8) / 1_000_000 / dt # Mbps
        download_speed = (recv_bytes * 8) / 1_000_000 / dt # Mbps
        
        up_history.append(upload_speed)
        down_history.append(download_speed)
        
        last_io = io_now
        last_time = current_time

        # --- HEADER (ISP, IP, Ping, Totals) ---
        ping_gw = ping_host(gateway_ip)
        dns_ok = check_dns()
        
        # Общий трафик с момента загрузки
        total_gb_sent = io_now.bytes_sent / (1024**3)
        total_gb_recv = io_now.bytes_recv / (1024**3)

        grid = Table.grid(expand=True)
        grid.add_column(justify="left", ratio=1)
        grid.add_column(justify="right", ratio=1)
        
        # Левая часть хедера
        info_text = Text()
        info_text.append(f"🌍 ISP: {public_info['isp']}\n", style="bold white")
        info_text.append(f"📍 Location: {public_info['city']}, {public_info['countryCode']}\n", style="cyan")
        info_text.append(f"🆔 Public IP: {public_info['query']}", style="yellow")
        
        # Правая часть хедера (статусы)
        status_text = Text()
        gw_color = "green" if ping_gw else "red"
        gw_ping_str = f"{ping_gw:.1f}ms" if ping_gw else "TIMEOUT"
        
        status_text.append(f"Gateway ({gateway_ip}): ", style="white")
        status_text.append(f"{gw_ping_str}\n", style=f"bold {gw_color}")
        
        dns_color = "green" if dns_ok else "red"
        status_text.append(f"DNS Status: ", style="white")
        status_text.append(f"{'ONLINE' if dns_ok else 'FAIL'}\n", style=f"bold {dns_color}")
        
        status_text.append(f"Total Traffic: ⬇ {total_gb_recv:.2f} GB | ⬆ {total_gb_sent:.2f} GB", style="dim white")

        grid.add_row(info_text, status_text)
        layout["header"].update(Panel(grid, title=f"networkOS • {datetime.now().strftime('%H:%M:%S')}", border_style="blue"))

        # --- INTERFACES TABLE ---
        if_table = Table(expand=True, box=None)
        if_table.add_column("Interface", style="bold")
        if_table.add_column("IP Address", style="cyan")
        if_table.add_column("Speed (Curr)", justify="right")
        if_table.add_column("Packets (Err/Drop)", justify="right", style="red")

        if_addrs = psutil.net_if_addrs()
        if_stats = psutil.net_if_stats()
        per_nic = psutil.net_io_counters(pernic=True)

        for nic, addrs in if_addrs.items():
            # Фильтруем loopback для экономии места
            if nic == 'lo': continue
            
            ip = "No IP"
            for addr in addrs:
                if addr.family == socket.AF_INET:
                    ip = addr.address
            
            # Статистика интерфейса
            nic_io = per_nic.get(nic)
            errs = nic_io.errin + nic_io.errout if nic_io else 0
            drops = nic_io.dropin + nic_io.dropout if nic_io else 0
            
            # Статус Up/Down
            is_up = if_stats[nic].isup if nic in if_stats else False
            status_icon = "🟢" if is_up else "🔴"
            
            # Скорость текстом (упрощено для каждого интерфейса делить сложно без памяти, показываем общую активность)
            # В идеале нужно хранить историю для каждого NIC, здесь покажем ошибки
            if_table.add_row(
                f"{status_icon} {nic}", 
                ip, 
                f"⬇{make_sparkline(down_history, 'blue')} ⬆{make_sparkline(up_history, 'green')}",
                f"{errs} / {drops}"
            )

        layout["interfaces"].update(Panel(if_table, title="Local Interfaces", border_style="white"))

        # --- WIFI & LOAD BOX ---
        wifi_stats = get_wifi_stats()
        wifi_panel_content = Text()
        
        # Графики цифрами
        wifi_panel_content.append(f"\nDownload: {download_speed:.2f} Mbps\n", style="bold blue")
        wifi_panel_content.append(f"Upload:   {upload_speed:.2f} Mbps\n\n", style="bold green")

        if wifi_stats["active"]:
            # Симуляция прогресс бара для сигнала
            signal_level = wifi_stats["level"] # например -60
            # Конвертация dBm в проценты (приблизительно)
            # -50 dBm = 100%, -100 dBm = 0%
            quality_percent = max(0, min(100, 2 * (signal_level + 100)))
            
            bar_color = "green" if quality_percent > 70 else "yellow"
            if quality_percent < 40: bar_color = "red"
            
            blocks = int(quality_percent / 5)
            bar = "█" * blocks + "░" * (20 - blocks)
            
            wifi_panel_content.append(f"Wi-Fi Signal ({int(signal_level)} dBm)\n", style="bold")
            wifi_panel_content.append(f"[{bar}] {int(quality_percent)}%", style=bar_color)
        else:
            wifi_panel_content.append("Wi-Fi: Not active / Wired", style="dim")

        layout["wifi_box"].update(Panel(Align.center(wifi_panel_content), title="Network Load & Wireless", border_style="magenta"))

        # --- CONNECTIONS TABLE ---
        # Показываем топ соединений
        conns = psutil.net_connections(kind='inet')
        
        # Фильтрация
        active_conns = [c for c in conns if c.status == 'ESTABLISHED']
        listen_conns = [c for c in conns if c.status == 'LISTEN']
        
        conn_table = Table(expand=True, show_header=True, box=None)
        conn_table.add_column("Type", width=4)
        conn_table.add_column("Local", ratio=1)
        conn_table.add_column("Remote", ratio=1)
        conn_table.add_column("Status", style="bold")
        conn_table.add_column("PID/Process", style="dim")

        # Добавляем сначала LISTEN (важные порты)
        for c in listen_conns[:3]:
            conn_table.add_row(
                "TCP", 
                f":{c.laddr.port}", 
                "*", 
                "[cyan]LISTEN[/cyan]", 
                f"{c.pid} ({get_active_process_name(c.pid)})"
            )
        
        # Добавляем ESTABLISHED
        for c in reversed(active_conns[-7:]): # Последние активные
            raddr = f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else "*"
            conn_table.add_row(
                "TCP" if c.type == socket.SOCK_STREAM else "UDP",
                f":{c.laddr.port}",
                raddr,
                f"[green]{c.status}[/green]",
                f"{c.pid} ({get_active_process_name(c.pid)})"
            )

        layout["bottom"].update(Panel(conn_table, title=f"Connections Analysis (Total: {len(conns)})", border_style="green"))

        time.sleep(REFRESH_RATE)

