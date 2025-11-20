#include <QApplication>
#include <QPushButton>
#include <QGridLayout>
#include <QMessageBox>
#include <QLabel>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QMenuBar>
#include <QAction>
#include <QDialog>
#include <QRadioButton>
#include <QGroupBox>
#include <QButtonGroup>
#include <QTimer>
#include <QScreen>
#include <QRandomGenerator>

// Окно настроек
class SettingsDialog : public QDialog {
    Q_OBJECT
public:
    explicit SettingsDialog(QWidget *parent = nullptr) : QDialog(parent) {
        setWindowTitle("Настройки игры");
        QVBoxLayout *layout = new QVBoxLayout(this);

        // Выбор первого игрока
        QGroupBox *firstPlayerBox = new QGroupBox("Кто ходит первым");
        QVBoxLayout *firstPlayerLayout = new QVBoxLayout;
        radioX = new QRadioButton("Первым X");
        radioO = new QRadioButton("Первым O");
        radioX->setChecked(true);
        firstPlayerLayout->addWidget(radioX);
        firstPlayerLayout->addWidget(radioO);
        firstPlayerBox->setLayout(firstPlayerLayout);
        layout->addWidget(firstPlayerBox);

        // Выбор режима игры
        QGroupBox *modeBox = new QGroupBox("Режим игры");
        QVBoxLayout *modeLayout = new QVBoxLayout;
        radioFriend = new QRadioButton("С другом");
        radioBot = new QRadioButton("С ботом");
        radioFriend->setChecked(true);
        modeLayout->addWidget(radioFriend);
        modeLayout->addWidget(radioBot);
        modeBox->setLayout(modeLayout);
        layout->addWidget(modeBox);

        // ОК и Отмена
        QHBoxLayout *buttonsLayout = new QHBoxLayout;
        QPushButton *okButton = new QPushButton("ОК");
        QPushButton *cancelButton = new QPushButton("Отмена");
        buttonsLayout->addWidget(okButton);
        buttonsLayout->addWidget(cancelButton);
        layout->addLayout(buttonsLayout);

        connect(okButton, &QPushButton::clicked, this, &SettingsDialog::accept);
        connect(cancelButton, &QPushButton::clicked, this, &SettingsDialog::reject);
    }

    bool isFirstX() const { return radioX->isChecked(); }
    bool isPlayingWithFriend() const { return radioFriend->isChecked(); }
    bool isPlayingWithBot() const { return radioBot->isChecked(); }

private:
    QRadioButton *radioX;
    QRadioButton *radioO;
    QRadioButton *radioFriend;
    QRadioButton *radioBot;
};

// Основной класс игры
class TicTacToe : public QWidget {
    Q_OBJECT

public:
    explicit TicTacToe(QWidget *parent = nullptr) : QWidget(parent) {
        setWindowTitle("Крестики-нолики");
        resize(800, 600);

        // Создаем меню
        QMenuBar *menuBar = new QMenuBar(this);
        QMenu *menu = new QMenu("Меню");
        QAction *settingsAction = new QAction("Настройки", this);
        QAction *aboutAction = new QAction("О мне", this);
        menu->addAction(settingsAction);
        menu->addAction(aboutAction);
        menuBar->addMenu(menu);

        // Основной макет
        QVBoxLayout *mainLayout = new QVBoxLayout(this);
        mainLayout->setMenuBar(menuBar);

        // Кнопка начать новую игру
        QPushButton *startButton = new QPushButton("Начать новую игру");
        mainLayout->addWidget(startButton);

        // Информационная метка
        infoLabel = new QLabel("Настройки не выбраны");
        infoLabel->setAlignment(Qt::AlignCenter);
        mainLayout->addWidget(infoLabel);

        // Игровая сетка
        gridLayout = new QGridLayout();
        mainLayout->addLayout(gridLayout);

        // Создаем кнопки
        for (int i=0; i<3; ++i) {
            for (int j=0; j<3; ++j) {
                buttons[i][j] = new QPushButton("");
                buttons[i][j]->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
                buttons[i][j]->setMinimumSize(50, 50);
                gridLayout->addWidget(buttons[i][j], i, j);
                connect(buttons[i][j], &QPushButton::clicked, [=]() { handleButtonClick(i, j); });
            }
        }

        // Связь с кнопкой "Начать новую игру"
        connect(startButton, &QPushButton::clicked, this, &TicTacToe::showSettings);

        // Связь меню
        connect(settingsAction, &QAction::triggered, this, &TicTacToe::showSettings);
        connect(aboutAction, &QAction::triggered, this, &TicTacToe::showAbout);

        // Изначально игра не запущена
        gameOver = true;

        // Значения по умолчанию
        playingWithFriend = true; // по умолчанию - играть с другом
        firstPlayerX = true; // по умолчанию - первым X
    }

private:
    QGridLayout *gridLayout;
    QLabel *infoLabel;
    QPushButton *buttons[3][3];

    bool gameOver;

    // Настройки
    bool playingWithFriend; // true - с другом, false - с ботом
    bool firstPlayerX;      // кто ходит первым (X или O)
    int currentPlayer;      // 1 или -1

    void showSettings() {
        SettingsDialog dlg(this);
        if (dlg.exec() == QDialog::Accepted) {
            // Получаем настройки
            firstPlayerX = dlg.isFirstX();
            playingWithFriend = dlg.isPlayingWithFriend();

            startGame();
        }
    }

    void showAbout() {
        QMessageBox::information(this, "О проекте", "По сейщайте проектэ kion85");
    }

    void startGame() {
        gameOver = false;

        // Определяем кто первый
        currentPlayer = firstPlayerX ? 1 : -1;
        QString firstPlayerText = (currentPlayer == 1) ? "Первым ходит: X" : "Первым ходит: O";
        infoLabel->setText(firstPlayerText);

        // Очищаем все слоты
        for (int i=0; i<3; ++i) {
            for (int j=0; j<3; ++j) {
                buttons[i][j]->setText("");
            }
        }

        // Если бот ходит первым
        if (!playingWithFriend && currentPlayer == -1) {
            QTimer::singleShot(500, this, &TicTacToe::botMove);
        }
    }

    void handleButtonClick(int i, int j) {
        if (gameOver || buttons[i][j]->text() != "")
            return;

        // В режиме "с другом" просто ходит игрок
        if (playingWithFriend) {
            buttons[i][j]->setText(currentPlayer == 1 ? "X" : "O");
            if (checkWin()) {
                QMessageBox::information(this, "Конец игры", (currentPlayer == 1 ? "X" : "O") + QString(" победил!"));
                resetGame();
                return;
            }
            if (isDraw()) {
                QMessageBox::information(this, "Конец игры", "Ничья!");
                resetGame();
                return;
            }
            // Передача хода
            currentPlayer = -currentPlayer;
            QString nextPlayerText = (currentPlayer == 1) ? "Ходит: X" : "Ходит: O";
            infoLabel->setText(nextPlayerText);
        }
        // В режиме "с ботом" — только если это ход игрока
        else {
            if ((currentPlayer == 1 && buttons[i][j]->text() == "") || (currentPlayer == -1 && buttons[i][j]->text() == "")) {
                buttons[i][j]->setText(currentPlayer == 1 ? "X" : "O");
                if (checkWin()) {
                    QMessageBox::information(this, "Конец игры", (currentPlayer == 1 ? "X" : "O") + QString(" победил!"));
                    resetGame();
                    return;
                }
                if (isDraw()) {
                    QMessageBox::information(this, "Конец игры", "Ничья!");
                    resetGame();
                    return;
                }
                // Передача хода боту, если он ходит
                currentPlayer = -currentPlayer;
                QString nextPlayerText = (currentPlayer == 1) ? "Ходит: X" : "Ходит: O";
                infoLabel->setText(nextPlayerText);
                if (currentPlayer == -1) {
                    QTimer::singleShot(500, this, &TicTacToe::botMove);
                }
            }
        }
    }

    void botMove() {
        if (gameOver) return;
        QList<QPushButton*> freeButtons;
        for (int i=0; i<3; ++i)
            for (int j=0; j<3; ++j)
                if (buttons[i][j]->text() == "")
                    freeButtons.append(buttons[i][j]);

        if (freeButtons.isEmpty()) return;

        int index = QRandomGenerator::global()->bounded(freeButtons.size());
        QPushButton *btn = freeButtons[index];

        // Ход бота
        btn->setText(currentPlayer == 1 ? "X" : "O");
        if (checkWin()) {
            QMessageBox::information(this, "Конец игры", (currentPlayer == 1 ? "X" : "O") + QString(" победил!"));
            resetGame();
            return;
        }
        if (isDraw()) {
            QMessageBox::information(this, "Конец игры", "Ничья!");
            resetGame();
            return;
        }

        // Передача хода
        currentPlayer = -currentPlayer;
        QString nextPlayerText = (currentPlayer == 1) ? "Ходит: X" : "Ходит: O";
        infoLabel->setText(nextPlayerText);
    }

    bool checkWin() {
        // Проверка линий
        for (int i=0; i<3; ++i) {
            if (buttons[i][0]->text() != "" &&
                buttons[i][0]->text() == buttons[i][1]->text() &&
                buttons[i][1]->text() == buttons[i][2]->text()) return true;

            if (buttons[0][i]->text() != "" &&
                buttons[0][i]->text() == buttons[1][i]->text() &&
                buttons[1][i]->text() == buttons[2][i]->text()) return true;
        }

        if (buttons[0][0]->text() != "" &&
            buttons[0][0]->text() == buttons[1][1]->text() &&
            buttons[1][1]->text() == buttons[2][2]->text()) return true;

        if (buttons[0][2]->text() != "" &&
            buttons[0][2]->text() == buttons[1][1]->text() &&
            buttons[1][1]->text() == buttons[2][0]->text()) return true;

        return false;
    }

    bool isDraw() {
        for (int i=0; i<3; ++i)
            for (int j=0; j<3; ++j)
                if (buttons[i][j]->text() == "") return false;
        return true;
    }

    void resetGame() {
        startGame();
    }
};

#include "main.moc"

int main(int argc, char *argv[]) {
    QApplication a(argc, argv);

    // Получим размеры экрана
    QScreen *screen = QGuiApplication::primaryScreen();
    QSize size = screen->size();

    // Создаем главное окно с размерами экрана
    TicTacToe w;
    w.resize(size.width() * 0.8, size.height() * 0.8); // 80% размера экрана
    w.show();

    return a.exec();
}
