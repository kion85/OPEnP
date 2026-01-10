#!/bin/bash

# --- 1. ПРОВЕРКА ОС И УСТАНОВКА ВСЕХ ПАКЕТОВ ---
clear
echo -e "\e[1;34m[*] Анализ системы и подготовка окружения...\e[0m"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$NAME
    OS_ID=$ID
fi

install_pkg() {
    echo -e "Система: \e[1;32m$OS_NAME\e[0m. Установка пакетов (arp-scan, bc, curl, jq, mtr)..."
    case "$OS_ID" in
        ubuntu|debian|linuxmint|zorin|kali)
            sudo apt update && sudo apt install -y arp-scan bc curl jq mtr iputils-ping nmcli ;;
        fedora|nobara)
            sudo dnf install -y arp-scan bc curl jq mtr iputils nmcli ;;
        arch|manjaro|endeavouros)
            sudo pacman -Sy --needed --noconfirm arp-scan bc curl jq mtr iputils nmcli ;;
        opensuse*|suse)
            sudo zypper install -y arp-scan bc curl jq mtr iputils nmcli ;;
        *)
            echo "Попытка установки через универсальный менеджер..."
            sudo apt install -y arp-scan bc curl jq mtr || sudo pacman -S arp-scan bc curl jq mtr || sudo dnf install arp-scan bc curl jq mtr ;;
    esac
}

install_pkg > /dev/null 2>&1

clear
echo -e "\e[1;35m======================================================"
echo -e "          MEGA NETWORK TOOL v5.0 EXTREME"
echo -e "======================================================\e[0m"

# --- 2. ПОДРОБНЕЙШИЙ ВЫВОД ПРОВАЙДЕРА ---
echo -e "\e[1;34m[1/6] ПОЛНОЕ ДОСЬЕ НА ПОДКЛЮЧЕНИЕ:\e[0m"
# Используем резервный сервис, если основной выдал ошибку
DATA=$(curl -s ipinfo.io)

if [[ "$DATA" == *"org"* ]]; then
    echo "$DATA" | jq .
else
    echo -e "\e[1;31m[!] Ошибка API. Вывожу данные напрямую:\e[0m"
    curl -s ifconfig.me && echo ""
    curl -s ipapi.co
fi

echo -e "\n\e[1;36m[+] ТВОИ ЛОКАЛЬНЫЕ IP (ip a):\e[0m"
ip -4 addr show | grep -E 'inet' | awk '{print "  -> " $2 " (" $NF ")"}'

# --- 3. СКАНЕР ЛОКАЛЬНОЙ СЕТИ ---
echo -e "\n\e[1;34m[2/6] СКАНЕР СОСЕДЕЙ ПО РОУТЕРУ:\e[0m"
IFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)
sudo arp-scan --interface=$IFACE --localnet --quiet | grep -E '([0-9a-fA-F]{2}:){5}'

# --- 4. ДИСКЛЕЙМЕР ---
echo -e "\n\e[1;31m!!! ВНИМАНИЕ !!!\e[0m"
echo -e "Автор не несет ответственности за любые сбои."
echo -e "Пинг 10-64 пакета и запуск MTR могут занять до 2-3 минут."
echo -e "Программа может казаться зависшей — НЕ ВЫКЛЮЧАЙТЕ."
echo -e "------------------------------------------------------"
echo -e "\e[1;33mНачать глубокое тестирование (Пинг, Скорость, MTR)? (y/n)\e[0m"
read -n 1 -r user_choice
echo -e "\n"

if [[ ! $user_choice =~ ^[Yy]$ ]]; then
    echo "Выход."; exit 0
fi

# --- 5. РАСШИРЕННЫЙ ПИНГ-ТЕСТ (10-64 пакета) ---
SITES=(
    "Google|8.8.8.8"
    "GitHub|github.com"
    "YouTube|youtube.com"
    "Twitch|twitch.tv"
    "VK|vk.com"
    "Telegram|t.me"
)

echo -e "\e[1;34m[3/6] ТЕСТ ЗАДЕРЖКИ (Ping 10-64):\e[0m"
for item in "${SITES[@]}"; do
    NAME=$(echo $item | cut -d'|' -f1)
    URL=$(echo $item | cut -d'|' -f2)
    P_COUNT=$((10 + RANDOM % 55))
    
    echo -n -e "--> \e[1;36m$NAME\e[0m ($P_COUNT пак.): "
    RAW=$(ping -c $P_COUNT -q -W 2 $URL 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "\e[1;31mУЗЕЛ НЕДОСТУПЕН\e[0m"
    else
        AVG=$(echo "$RAW" | tail -1 | awk '{print $4}' | cut -d '/' -f 2)
        LOSS=$(echo "$RAW" | grep -oP '\d+(?=% packet loss)')
        COLOR="\e[1;32m"
        (( $(echo "$AVG > 64.0" | bc -l) )) && COLOR="\e[1;33m"
        echo -e "${COLOR}${AVG} ms\e[0m (Потери: ${LOSS}%)"
    fi
done

# --- 6. ТЕСТ СКОРОСТИ ---
echo -e "\n\e[1;34m[4/6] ЗАМЕР СКОРОСТИ (Загрузка 10MB):\e[0m"
SPEED=$(curl -L -s -w "%{speed_download}" -o /dev/null speedtest.tele2.net --connect-timeout 15)
MBITS=$(echo "scale=2; $SPEED * 8 / 1024 / 1024" | bc)
echo -e "\e[1;32mИТОГ: $MBITS Мбит/с\e[0m"

# --- 7. ГЛУБОКАЯ ДИАГНОСТИКА MTR (Твой новый пункт 6) ---
echo -e "\n\e[1;34m[5/6] ДИАГНОСТИКА МАРШРУТА (MTR - My Traceroute):\e[0m"
echo "Анализируем путь до Google DNS (8.8.8.8)..."
# Выполняем 10 циклов MTR в режиме отчета
mtr -r -c 10 8.8.8.8

echo -e "\n\e[1;34m[6/6] ПИНГ ПРЯМЫХ IP-АДРЕСОВ (Проверка DNS-независимости):\e[0m"
IPS=("1.1.1.1" "77.8.8.8" "95.161.202.1") # Cloudflare, Yandex, Global
for ipaddr in "${IPS[@]}"; do
    echo -n "Проверка $ipaddr: "
    ping -c 5 -W 1 $ipaddr | tail -1 | awk '{print $4}' | cut -d '/' -f 2 | xargs -I{} echo -e "\e[1;32m{} ms\e[0m"
done

echo -e "\n\e[1;35m======================================================"
echo -e "ДИАГНОСТИКА ЗАВЕРШЕНА. ТЕПЕРЬ ТЫ ЗНАЕШЬ О СЕТИ ВСЁ!"
echo -e "======================================================\e[0m"

