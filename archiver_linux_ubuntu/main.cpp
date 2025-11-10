#include <iostream>
#include <string>
#include <limits>
#include <cstdlib> // для getenv
#include <filesystem>

// Функция для получения пути с возможностью по умолчанию
std::string getInputWithDefault(const std::string& prompt, const std::string& defaultPath) {
    std::cout << prompt;
    std::string input;
    std::getline(std::cin, input);

    if (input.empty()) {
        std::cout << "⚠️ Вы ничего не ввели. По умолчанию будет использована домашняя директория: " << defaultPath << "\n";
        return defaultPath;
    }
    return input;
}

// Функция отображения помощи
void showHelp() {
    std::cout << "📖 Доступные команды:\n";
    std::cout << "help  - показать это сообщение\n";
    std::cout << "zip   - создать ZIP-архив\n";
    std::cout << "unzip - распаковать архив\n";
    std::cout << "exit  - выйти из программы\n";
    std::cout << "🔧 Используйте команды, чтобы управлять архивами.\n\n";
}

// Основное меню
void showMenu() {
    std::cout << "🚀 Добро пожаловать в OPEnarchiverP!\n";
    std::cout << "Выберите действие:\n";
    std::cout << "🔹 help  - показать помощь\n";
    std::cout << "🔹 zip   - создать ZIP-архив\n";
    std::cout << "🔹 unzip - распаковать архив\n";
    std::cout << "🔹 exit  - выйти\n";
    std::cout << "Введите команду: ";
}

int main() {
    // Получаем домашнюю директорию
    std::string homePath;
    #ifdef _WIN32
        homePath = std::getenv("USERPROFILE");
    #else
        homePath = std::getenv("HOME");
    #endif

    std::string command;

    while (true) {
        showMenu();
        std::getline(std::cin, command);

        if (command == "help") {
            showHelp();
        } else if (command == "zip") {
            std::cout << "🗜️ Создание архива...\n";
            // Запрашиваем путь к папке или файлу
            std::string path = getInputWithDefault("Введите путь к папке или файлу для архивации (нажмите Enter для домашней директории): ", homePath);
            // Запрашиваем имя архива
            std::cout << "Введите имя архива (например, archive.zip): ";
            std::string archiveName;
            std::getline(std::cin, archiveName);
            if (archiveName.empty()) {
                std::cout << "⚠️ Имя архива не указано. Используем 'archive.zip'.\n";
                archiveName = "archive.zip";
            }
            // Тут можно вызвать функцию архивации
            std::cout << "📦 Архив создан: " << archiveName << " из " << path << "\n";
        } else if (command == "unzip") {
            std::cout << "📂 Распаковка архива...\n";
            // Запрашиваем путь к архиву
            std::string archivePath = getInputWithDefault("Введите путь к архиву (нажмите Enter для домашней директории): ", homePath);
            // Запрашиваем папку для распаковки
            std::string outputFolder = getInputWithDefault("Введите папку для распаковки (нажмите Enter для домашней директории): ", homePath);
            // Тут можно вызвать функцию распаковки
            std::cout << "✅ Архив " << archivePath << " распакован в " << outputFolder << "\n";
        } else if (command == "exit") {
            std::cout << "👋 До свидания!\n";
            break;
        } else {
            std::cout << "❓ Неизвестная команда. Введите 'help' для списка команд.\n";
        }
    }

    return 0;
}
