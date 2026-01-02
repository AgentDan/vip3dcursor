# Настройка SSH для GitHub

## Шаг 1: Создание SSH ключа

Выполните в терминале:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Нажмите Enter для всех вопросов (или укажите свой пароль для ключа).

## Шаг 2: Запуск ssh-agent

```bash
# Запустить ssh-agent
Start-Service ssh-agent

# Или в Git Bash:
eval "$(ssh-agent -s)"
```

## Шаг 3: Добавить ключ в ssh-agent

```bash
# Для Windows PowerShell
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Или для Git Bash
ssh-add ~/.ssh/id_ed25519
```

## Шаг 4: Скопировать публичный ключ

```bash
# Показать публичный ключ
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub

# Или
cat ~/.ssh/id_ed25519.pub
```

## Шаг 5: Добавить ключ в GitHub

1. Скопируйте весь вывод команды выше (начинается с `ssh-ed25519...`)
2. Перейдите на: https://github.com/settings/keys
3. Нажмите "New SSH key"
4. Вставьте ключ
5. Сохраните

## Шаг 6: Проверить подключение

```bash
ssh -T git@github.com
```

Должно появиться: "Hi AgentDan! You've successfully authenticated..."

## Шаг 7: Отправить код

```bash
git push -u origin main
```

