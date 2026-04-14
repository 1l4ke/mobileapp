FROM nginx:alpine

# Копируем ВСЁ в root
COPY public/ /usr/share/nginx/html/public/
COPY src/ /usr/share/nginx/html/src/
COPY public/manifest.json /usr/share/nginx/html/manifest.json
# ПЕРЕВОДИМ КОНФИГ В conf.d/default.conf, чтобы Nginx реально его юзал
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN ls -la /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]