import time
import psutil
import socket
import urllib.request
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.columns import Columns

# Настройки истории для графика
HISTORY_LIMIT = 40
download_history = [0] * HISTORY_LIMIT

def get_external_ip():
    try:
        # Быстрый запрос внешнего IP через icanhazip.com
        return urllib.request.urlopen('https://icanhazip.com', timeout=1).read().decode('utf-8').strip()
    except:
        return "Offline"

def get_snmp_stats():
    """Получает статистику TCP/UDP напрямую из системы Linux"""
    stats = {'tcp': 0, 'udp': 0}
    try:
        with open('/proc/net/snmp', 'r') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if line.startswith('Tcp:'):
                    # Берем данные из второй строки после заголовка
                    values = lines[i+1].split()
                    stats['tcp'] = values[10] # InSegs
                if line.startswith('Udp:'):
                    values = lines[i+1].split()
                    stats['udp'] = values[1] # InDatagrams
    except: pass
    return stats

def make_sparkline(data):
    chars = " ▂▃▄▅▆▇█"
    if not data: return ""
    m = max(data) if max(data) > 0 else 1
    return "".join(chars[min(int(d / m * 7), 7)] for d in data)

def create_layout():
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=4),
        Layout(name="info", size=8),
        Layout(name="main")
    )
    return layout

# Инициализация
layout = create_layout()
last_b = psutil.net_io_counters().bytes_recv
last_t = time.time()
ext_ip = get_external_ip()

with Live(layout, refresh_per_second=2, screen=True):
    while True:
        now = time.time()
        dt = now - last_t
        all_stats = psutil.net_io_counters()
        speed = (all_stats.bytes_recv - last_b) / dt / (1024 * 1024) * 8
        last_b = all_stats.bytes_recv
        last_t = now

        download_history.pop(0)
        download_history.append(speed)

        # 1. ЗАГОЛОВОК С ГРАФИКОМ
        spark = make_sparkline(download_history)
        header_text = Text.assemble(
            ("NETWORK OVERVIEW ", "bold cyan"),
            (f"| Ext IP: {ext_ip} ", "bold yellow"),
            (f"| Load: {spark} {speed:.2f} Mbps", "bold green")
        )
        layout["header"].update(Panel(header_text, subtitle="Press Ctrl+C to Exit"))

        # 2. ДЕТАЛИ ИНТЕРФЕЙСОВ (MAC, IP, MTU)
        if_table = Table(expand=True, title="Network Interfaces & Hardware")
        if_table.add_column("Interface", style="bold")
        if_table.add_column("MAC Address", style="magenta")
        if_table.add_column("IPv4", style="blue")
        if_table.add_column("Status")
        if_table.add_column("MTU")

        addrs = psutil.net_if_addrs()
        stats = psutil.net_if_stats()
        
        for name, addr_list in addrs.items():
            mac = next((a.address for a in addr_list if a.family == psutil.AF_LINK), "N/A")
            ip = next((a.address for a in addr_list if a.family == socket.AF_INET), "N/A")
            status = "UP" if stats[name].isup else "DOWN"
            mtu = stats[name].mtu
            if_table.add_row(name, mac, ip, status, str(mtu))
        
        layout["info"].update(if_table)

        # 3. ГЛУБОКИЙ МОНИТОРИНГ СОЕДИНЕНИЙ И ПРОТОКОЛОВ
        snmp = get_snmp_stats()
        conn_table = Table(expand=True, title=f"Active Connections (TCP Segs: {snmp['tcp']} | UDP Pkts: {snmp['udp']})")
        conn_table.add_column("PID", width=7)
        conn_table.add_column("Program", style="green")
        conn_table.add_column("Local Address")
        conn_table.add_column("Remote Address", style="yellow")
        conn_table.add_column("Status")

        for c in psutil.net_connections(kind='inet')[:12]:
            try:
                p_name = psutil.Process(c.pid).name() if c.pid else "System"
                laddr = f"{c.laddr.ip}:{c.laddr.port}"
                raddr = f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else "---"
                conn_table.add_row(str(c.pid or ""), p_name, laddr, raddr, c.status)
            except: continue

        layout["main"].update(conn_table)
        time.sleep(0.5)

