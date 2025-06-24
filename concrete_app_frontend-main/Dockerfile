# Используем образ с Node.js для сборки проекта
FROM node:14 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Выполняем сборку проекта
RUN npm run build

# Используем образ с Nginx для production
FROM nginx:alpine

# Копируем собранные файлы из предыдущего образа
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Копируем наш кастомный nginx.conf файл
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, на котором будет работать приложение
EXPOSE 80

# Nginx будет запущен автоматически при запуске контейнера
