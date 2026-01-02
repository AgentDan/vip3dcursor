# Архитектура проекта ARH3D (C4 Model)

## Level 1: System Context (Контекст системы)

```
┌─────────────┐
│   Пользователь   │
└──────┬──────┘
       │
       │ Использует
       │
┌──────▼──────────────────────────────────────┐
│         ARH3D System                         │
│                                              │
│  ┌──────────────┐      ┌──────────────┐     │
│  │   Web App    │◄────►│   API Server │     │
│  │  (React)     │ HTTP │  (Express)   │     │
│  └──────────────┘      └──────┬───────┘     │
│                               │             │
│                               │ Читает/Записывает
│                               │             │
│                        ┌──────▼───────┐     │
│                        │   MongoDB    │     │
│                        │   Database   │     │
│                        └──────────────┘     │
└─────────────────────────────────────────────┘
```

**Описание:**
- **Пользователь** взаимодействует с системой через веб-браузер
- **Web App (React)** предоставляет пользовательский интерфейс
- **API Server (Express)** обрабатывает бизнес-логику и запросы
- **MongoDB Database** хранит данные пользователей

**Внешние зависимости:**
- MongoDB (база данных)
- Браузер пользователя

---

## Level 2: Container (Контейнеры)

```
┌─────────────────────────────────────────────────────────┐
│                    ARH3D System                        │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  Web Application (React + Vite)               │    │
│  │  - Single Page Application                    │    │
│  │  - Рендеринг на клиенте                       │    │
│  │  - Хранение JWT в localStorage                │    │
│  └──────────────┬─────────────────────────────────┘    │
│                 │                                        │
│                 │ HTTP/REST API                          │
│                 │                                        │
│  ┌──────────────▼─────────────────────────────────┐    │
│  │  API Server (Node.js + Express)                │    │
│  │  - Обработка HTTP запросов                     │    │
│  │  - Бизнес-логика аутентификации                │    │
│  │  - Генерация JWT токенов                       │    │
│  └──────────────┬─────────────────────────────────┘    │
│                 │                                        │
│                 │ Mongoose ODM                           │
│                 │                                        │
│  ┌──────────────▼─────────────────────────────────┐    │
│  │  MongoDB Database                              │    │
│  │  - Хранение пользователей                      │    │
│  │  - Хешированные пароли                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Контейнеры системы:

1. **Web Application (React + Vite)**
   - **Технологии:** React, Vite, React Router, Tailwind CSS
   - **Ответственность:**
     - Отображение UI (страницы Login/Register)
     - Управление состоянием форм
     - Валидация на клиенте
     - Хранение JWT токена в localStorage
   - **Порт:** 5173 (dev)

2. **API Server (Node.js + Express)**
   - **Технологии:** Express, Mongoose, bcrypt, jsonwebtoken
   - **Ответственность:**
     - Обработка HTTP запросов
     - Валидация входных данных
     - Бизнес-логика аутентификации
     - Хеширование паролей
     - Генерация JWT токенов
     - Административные функции
   - **Порт:** 3000
   - **API Endpoints:**
     - `POST /api/auth/register` - Регистрация
     - `POST /api/auth/login` - Авторизация
     - `GET /api/admin/users` - Список пользователей (только для админов)

3. **MongoDB Database**
   - **Технологии:** MongoDB, Mongoose
   - **Ответственность:**
     - Хранение данных пользователей
     - Индексация по email (уникальность)
   - **Схема:** User (email, passwordHash, isAdmin, createdAt)

---

## Level 3: Component (Компоненты)

### API Server - Модули

```
┌─────────────────────────────────────────────────────┐
│           API Server Container                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         Auth Module                          │  │
│  │                                               │  │
│  │  ┌──────────────┐                            │  │
│  │  │ auth.routes  │  HTTP маршрутизация         │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │auth.controller│  Обработка запросов       │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │ auth.service │  Бизнес-логика             │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │auth.repository│  Доступ к данным          │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │  auth.model  │  Схема данных              │  │
│  │  └──────────────┘                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         Admin Module                          │  │
│  │                                               │  │
│  │  ┌──────────────┐                            │  │
│  │  │ admin.routes │  HTTP маршрутизация         │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │auth.middleware│  Проверка токена/прав     │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │admin.controller│ Обработка запросов      │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │ admin.service│  Бизнес-логика             │  │
│  │  └──────┬───────┘                            │  │
│  │         │                                      │  │
│  │  ┌──────▼───────┐                            │  │
│  │  │auth.repository│  Доступ к данным          │  │
│  │  └──────────────┘                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Компоненты модуля Auth:

1. **auth.routes.js**
   - Определяет HTTP маршруты
   - Привязывает маршруты к контроллерам
   - Эндпоинты: `/register`, `/login`

2. **auth.controller.js**
   - Обрабатывает HTTP запросы/ответы
   - Валидация входных данных
   - Обработка ошибок и формирование ответов

3. **auth.service.js**
   - Бизнес-логика аутентификации
   - Хеширование паролей (bcrypt)
   - Генерация JWT токенов
   - Проверка существования пользователя

4. **auth.repository.js**
   - Абстракция доступа к базе данных
   - Методы: `findByEmail()`, `create()`, `findById()`
   - Изоляция логики работы с БД

5. **auth.model.js**
   - Схема Mongoose для User
   - Валидация на уровне схемы
   - Индексы (unique email)
   - Поля: email, passwordHash, isAdmin, createdAt

### API Server - Модуль Admin

1. **admin.routes.js**
   - Определяет HTTP маршруты для админки
   - Защита через middleware (authenticate, isAdmin)
   - Эндпоинт: `/users`

2. **auth.middleware.js**
   - `authenticate` - проверка JWT токена
   - `isAdmin` - проверка админских прав
   - Извлечение данных пользователя из токена

3. **admin.controller.js**
   - Обрабатывает HTTP запросы/ответы
   - Обработка ошибок

4. **admin.service.js**
   - Бизнес-логика админки
   - Получение списка пользователей
   - Форматирование данных

5. **auth.repository.js** (расширен)
   - Методы: `findByEmail()`, `create()`, `findById()`, `findAll()`, `count()`
   - Используется как Auth, так и Admin модулями

### Web Application - Компоненты

```
┌─────────────────────────────────────────────────────┐
│         Web Application Container                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         App Component                        │  │
│  │  - React Router                              │  │
│  │  - Навигация                                 │  │
│  └───┬──────────┬──────────┬──────────┬─────────┘  │
│      │          │          │          │             │
│  ┌───▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐      │
│  │ Login │ │Register│ │  Home  │ │ Admin  │      │
│  │ Page  │ │  Page  │ │  Page  │ │  Page  │      │
│  └───┬───┘ └───┬────┘ └───┬────┘ └───┬────┘      │
│      │         │          │          │             │
│      └─────────┴──────────┴──────────┘             │
│                    │                                │
│      ┌─────────────┴─────────────┐                │
│      │                            │                │
│  ┌───▼────────┐          ┌────────▼────────┐       │
│  │auth.service│          │ admin.service  │       │
│  │            │          │                │       │
│  └────────────┘          └────────────────┘       │
│      │                            │                │
│      └────────────┬───────────────┘                │
│                   │                                 │
│          ┌────────▼─────────┐                       │
│          │   jwt.utils     │                       │
│          │ - decodeToken    │                       │
│          │ - isAdmin        │                       │
│          └──────────────────┘                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Компоненты Frontend:

1. **App.jsx**
   - Главный компонент приложения
   - Настройка React Router
   - Определение маршрутов: `/login`, `/register`, `/home`, `/admin`

2. **Login.jsx / Register.jsx**
   - Компоненты страниц аутентификации
   - Управление состоянием формы
   - Валидация на клиенте
   - Обработка ошибок
   - Перенаправление на `/home` после успешной аутентификации

3. **Home.jsx**
   - Главная страница после входа
   - Отображение кнопки "Go to Admin Panel" для админов
   - Кнопка Logout

4. **Admin.jsx**
   - Админская панель
   - Таблица со списком всех пользователей
   - Отображение email, роли, даты создания
   - Защита доступа (проверка прав через JWT)

5. **auth.service.js**
   - Сервис для взаимодействия с Auth API
   - Методы: `register()`, `login()`
   - Сохранение JWT в localStorage

6. **admin.service.js**
   - Сервис для взаимодействия с Admin API
   - Метод: `getUsers()`
   - Передача JWT токена в заголовках

7. **jwt.utils.js**
   - Утилиты для работы с JWT токенами
   - `decodeToken()` - декодирование токена
   - `isAdmin()` - проверка админских прав

---

## Потоки данных

### Поток регистрации пользователя

```
User → Login.jsx → auth.service.js → HTTP POST /api/auth/register
                                          ↓
                                    auth.routes.js
                                          ↓
                                    auth.controller.js
                                          ↓
                                    auth.service.js
                                          ↓ (bcrypt.hash)
                                    auth.repository.js
                                          ↓
                                    MongoDB (User.create)
                                          ↓
                                    JWT Token Generation
                                          ↓
                                    Response → localStorage
```

### Поток авторизации пользователя

```
User → Login.jsx → auth.service.js → HTTP POST /api/auth/login
                                            ↓
                                      auth.routes.js
                                            ↓
                                      auth.controller.js
                                            ↓
                                      auth.service.js
                                            ↓
                                      auth.repository.js
                                            ↓ (findByEmail)
                                      MongoDB (User.find)
                                            ↓ (bcrypt.compare)
                                      Password Validation
                                            ↓
                                      JWT Token Generation (с isAdmin)
                                            ↓
                                      Response → localStorage → /home
```

### Поток доступа к админке

```
Admin User → Home.jsx → jwt.utils.isAdmin() → true
                                            ↓
                                      Click "Admin Panel"
                                            ↓
                                      Navigate to /admin
                                            ↓
                                      Admin.jsx → admin.service.getUsers()
                                            ↓
                                      HTTP GET /api/admin/users
                                            ↓
                                      auth.middleware.authenticate()
                                            ↓
                                      auth.middleware.isAdmin()
                                            ↓
                                      admin.controller.getAllUsers()
                                            ↓
                                      admin.service.getAllUsers()
                                            ↓
                                      auth.repository.findAll()
                                            ↓
                                      MongoDB (User.find)
                                            ↓
                                      Response → Table Display
```

---

## Технологический стек

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Security:** bcrypt, jsonwebtoken
- **Config:** dotenv

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS v4
- **HTTP:** Fetch API

---

## Безопасность

1. **Аутентификация**
   - JWT токены (срок жизни: 24 часа)
   - Payload содержит: userId, email, isAdmin
   - Хеширование паролей (bcrypt, 10 раундов)
   - Secret ключ в переменных окружения
   - Middleware для проверки токена

2. **Авторизация (роли)**
   - Система ролей: User, Admin
   - Поле isAdmin в модели User
   - Middleware isAdmin для защиты админских роутов
   - Первый зарегистрированный пользователь автоматически становится админом

3. **Валидация**
   - Проверка на клиенте и сервере
   - Обработка дубликатов email
   - Валидация формата данных
   - Проверка прав доступа к админке

4. **Хранение данных**
   - Пароли не хранятся в открытом виде
   - JWT токены в localStorage (клиент)
   - Пароли исключены из ответов API (select('-passwordHash'))

---

## Переменные окружения

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/arh3d
JWT_SECRET=your-secret-key-here
```

---

## Запуск проекта

```bash
# Установка зависимостей
npm run install:all

# Запуск dev-серверов
npm run dev
```

**Endpoints:**
- Backend API: `http://localhost:3000`
- Frontend App: `http://localhost:5173`

---

## Принципы архитектуры

1. **Чистая архитектура** - разделение на слои (Model, Repository, Service, Controller)
2. **Separation of Concerns** - каждый компонент отвечает за свою область
3. **Dependency Inversion** - зависимости направлены внутрь (к бизнес-логике)
4. **Single Responsibility** - каждый модуль имеет одну ответственность
5. **Middleware Pattern** - переиспользуемые middleware для аутентификации и авторизации
6. **Role-Based Access Control (RBAC)** - система ролей для контроля доступа

## Структура файлов

### Backend
```
server/
├─ index.js
├─ middleware/
│  └─ auth.middleware.js
├─ modules/
│  ├─ auth/
│  │  ├─ auth.model.js
│  │  ├─ auth.repository.js
│  │  ├─ auth.service.js
│  │  ├─ auth.controller.js
│  │  └─ auth.routes.js
│  └─ admin/
│     ├─ admin.service.js
│     ├─ admin.controller.js
│     └─ admin.routes.js
└─ scripts/
   └─ makeAdmin.js
```

### Frontend
```
client/src/
├─ pages/
│  ├─ Login.jsx
│  ├─ Register.jsx
│  ├─ Home.jsx
│  └─ Admin.jsx
├─ services/
│  ├─ auth.service.js
│  └─ admin.service.js
├─ utils/
│  └─ jwt.utils.js
├─ App.jsx
└─ main.jsx
```
