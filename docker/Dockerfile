FROM nginx:alpine

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Копируем конфигурацию nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Создаём рабочую директорию
WORKDIR /usr/share/nginx/html

# Копируем все файлы приложения
COPY public/. ./
COPY src/. ./src/

# Устанавливаем правильные права
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]