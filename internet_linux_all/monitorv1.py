import time
import psutil
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.console import Console

console = Console()

def get_network_stats():
    # Статистика по интерфейсам
    return psutil.net_io_counters(pernic=True)

def get_connections():
    # Список соединений (требует sudo для имен процессов)
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        try:
            process = psutil.Process(conn.pid) if conn.pid else None
            name = process.name() if process else "N/A"
            connections.append({
                "fd": conn.fd,
                "laddr": f"{conn.laddr.ip}:{conn.laddr.port}",
                "raddr": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "LISTEN",
                "status": conn.status,
                "pid": conn.pid,
                "name": name
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return connections

def make_layout():
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="main", size=10),
        Layout(name="footer", size=15)
    )
    return layout

def generate_table():
    # Таблица интерфейсов
    stats_table = Table(expand=True)
    stats_table.add_column("Interface")
    stats_table.add_column("Sent (MB)", justify="right")
    stats_table.add_column("Recv (MB)", justify="right")
    stats_table.add_column("Packets Sent", justify="right")
    stats_table.add_column("Packets Recv", justify="right")
    stats_table.add_column("Errors (In/Out)", justify="right")

    for nic, stats in get_network_stats().items():
        stats_table.add_row(
            nic,
            f"{stats.bytes_sent / (1024*1024):.2f}",
            f"{stats.bytes_recv / (1024*1024):.2f}",
            str(stats.packets_sent),
            str(stats.packets_recv),
            f"{stats.errin}/{stats.errout}"
        )

    # Таблица активных процессов
    conn_table = Table(title="Active Connections & Processes", expand=True)
    conn_table.add_column("PID", style="cyan")
    conn_table.add_column("Process", style="green")
    conn_table.add_column("Local Address")
    conn_table.add_column("Remote Address")
    conn_table.add_column("Status")

    for c in get_connections()[:10]: # Топ 10 для компактности
        conn_table.add_row(
            str(c['pid']), c['name'], c['laddr'], c['raddr'], c['status']
        )
    
    return stats_table, conn_table

layout = make_layout()
header_text = Text("Linux Network Monitor v1.0", justify="center", style="bold white on blue")
layout["header"].update(Panel(header_text))

with Live(layout, refresh_per_second=1, screen=True):
    try:
        while True:
            stats, conns = generate_table()
            layout["main"].update(Panel(stats, title="[bold]Interface Stats[/bold]"))
            layout["footer"].update(Panel(conns, title="[bold]Network Processes[/bold]"))
            time.sleep(1)
    except KeyboardInterrupt:
        pass

