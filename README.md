# Shoplist Backend

Бэкенд приложения для отслеживания расходов и ведения семейного бюджета.

## Технологии

- **Framework**: NestJS
- **База данных**: MongoDB
- **Аутентификация**: JWT
- **Email**: NestJS Mailer
- **Документация API**: Swagger
- **File Storage**: Cloudinary
- **Мониторинг**: Sentry

## Основные модули

- Аутентификация и авторизация (JWT)
- Управление категориями расходов
- Отслеживание расходов
- Семейный бюджет
- Регулярные расходы (Cron)
- Источники платежей
- Отложенные расходы
- Управление пользователями
- Резервное копирование базы данных

## Установка

```bash
$ pnpm install
```

## Настройка окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```env
# MongoDB
MONGODB_URI=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
MAIL_HOST=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

# Sentry
SENTRY_DSN=
```

## Запуск приложения

```bash
# development
$ pnpm run dev

# production mode
$ pnpm run start:prod
```

## Тестирование

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## API Документация

После запуска приложения, Swagger документация доступна по адресу:
`http://localhost:3000/api/docs`

## Резервное копирование

Проект включает автоматическое резервное копирование базы данных. Подробности в `/src/app/database-backup/README.md`.

## Мониторинг ошибок (Sentry)

В проекте настроен мониторинг ошибок с использованием Sentry. При сборке проекта автоматически генерируются и загружаются source maps для корректного отображения стектрейсов.

Команда для загрузки source maps:
```bash
$ pnpm run sentry:sourcemaps
```

Для работы с Sentry необходимо:
1. Указать SENTRY_DSN в файле .env
2. После каждой сборки проекта запускается автоматическая загрузка source maps
3. В production режиме все ошибки автоматически отправляются в Sentry
