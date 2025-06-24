# Barakat - Система управления бетонным заводом

Это комплексная система управления бетонным заводом, состоящая из трех основных компонентов:

## 🏗️ Архитектура проекта

### 1. Backend API (`concrete_app_backend-main/`)
- **Технологии**: Python 3.9, FastAPI, SQLAlchemy, Alembic
- **База данных**: PostgreSQL
- **Контейнеризация**: Docker & Docker Compose
- **Функционал**: 
  - Управление пользователями и ролями
  - Управление компаниями и объектами
  - Управление материалами и транспортом
  - Система взвешивания и отчетности
  - WebSocket уведомления
  - API для интеграции с весами

### 2. Frontend (`concrete_app_frontend-main/`)
- **Технологии**: React, TypeScript, SCSS
- **Контейнеризация**: Docker & Docker Compose
- **Функционал**:
  - Административная панель
  - Управление заявками и планами
  - Система отчетов
  - Управление справочниками
  - Мониторинг взвешивания

### 3. Утилита взвешивания (`concrete_app_weighing_utility-test/`)
- **Технологии**: Python, PySerial, WebSockets
- **Функционал**:
  - Интеграция с весовым оборудованием
  - Обработка данных с COM-портов
  - Отправка данных в основную систему

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Python 3.9+ (для разработки)
- Node.js 16+ (для разработки frontend)

### Запуск через Docker

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/dimashsrbl/barakat.git
cd barakat
```

2. **Запустите backend:**
```bash
cd concrete_app_backend-main
docker-compose up -d
```

3. **Запустите frontend:**
```bash
cd concrete_app_frontend-main
docker-compose up -d
```

4. **Откройте приложение:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs

## 📁 Структура проекта

```
barakat/
├── concrete_app_backend-main/     # Backend API
│   ├── api/                      # API endpoints
│   ├── models/                   # SQLAlchemy модели
│   ├── services/                 # Бизнес-логика
│   ├── repositories/             # Слой доступа к данным
│   ├── schemas/                  # Pydantic схемы
│   └── docker-compose.yml        # Docker конфигурация
├── concrete_app_frontend-main/   # React frontend
│   ├── src/
│   │   ├── pages/               # Страницы приложения
│   │   ├── components/          # React компоненты
│   │   ├── store/               # Redux store
│   │   └── api/                 # API клиент
│   └── docker-compose.yml       # Docker конфигурация
└── concrete_app_weighing_utility-test/  # Утилита взвешивания
    ├── indicators/              # Драйверы для весов
    └── main.py                  # Основной файл
```

## 🔧 Разработка

### Backend разработка
```bash
cd concrete_app_backend-main
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend разработка
```bash
cd concrete_app_frontend-main
npm install
npm start
```

## 📊 Основные функции

- **Управление заявками**: Создание, редактирование и отслеживание заявок на бетон
- **Система взвешивания**: Автоматическое получение данных с весов
- **Отчетность**: Генерация различных отчетов по производству
- **Управление пользователями**: Система ролей и разрешений
- **Мониторинг**: Real-time уведомления через WebSocket
- **Интеграция**: API для внешних систем

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Контакты

- Автор: dimashsrbl
- GitHub: [https://github.com/dimashsrbl](https://github.com/dimashsrbl) 