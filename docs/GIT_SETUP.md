# Настройка Git репозитория

## Проверка текущего состояния

```bash
# Проверить статус
git status

# Проверить подключенные удаленные репозитории
git remote -v
```

## Подключение к удаленному репозиторию

### Вариант 1: Подключение к существующему репозиторию на GitHub

1. **Создайте репозиторий на GitHub** (если еще не создан):
   - Перейдите на https://github.com/new
   - Создайте новый репозиторий (например, `arh3d`)

2. **Подключите удаленный репозиторий:**

```bash
# Добавить удаленный репозиторий (HTTPS)
git remote add origin https://github.com/ваш-username/arh3d.git

# Или через SSH (если настроен SSH ключ)
git remote add origin git@github.com:ваш-username/arh3d.git
```

3. **Проверить подключение:**

```bash
git remote -v
```

### Вариант 2: Если репозиторий уже подключен, но нужно изменить URL

```bash
# Изменить URL существующего remote
git remote set-url origin https://github.com/ваш-username/arh3d.git

# Или через SSH
git remote set-url origin git@github.com:ваш-username/arh3d.git
```

## Первый коммит и отправка

```bash
# Добавить все файлы
git add .

# Создать коммит
git commit -m "Initial commit: Auth system with admin panel"

# Отправить в удаленный репозиторий
git push -u origin main
```

## Работа с ветками

```bash
# Создать новую ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main

# Отправить ветку в удаленный репозиторий
git push -u origin feature/new-feature
```

## Полезные команды

```bash
# Посмотреть историю коммитов
git log --oneline

# Посмотреть изменения
git diff

# Отменить изменения в файле
git checkout -- <file>

# Обновить локальный репозиторий
git pull origin main
```

## Настройка .gitignore

Файл `.gitignore` уже создан и включает:
- `node_modules/`
- `.env` файлы
- `dist/`, `build/`
- Логи и временные файлы

## Важно

⚠️ **Не коммитьте:**
- Файлы `.env` с секретами
- `node_modules/`
- Собранные файлы (`dist/`, `build/`)
- Логи и кэш

✅ **Коммитьте:**
- Исходный код
- `package.json` и `package-lock.json`
- Конфигурационные файлы
- Документацию

