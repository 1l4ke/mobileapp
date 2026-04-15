FROM nginx:alpine

# Копируем ВСЁ в root
COPY public/ /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY public/manifest.json /usr/share/nginx/html/manifest.json
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]