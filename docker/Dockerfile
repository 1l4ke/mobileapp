FROM nginx:alpine

# Копируем ВСЁ в root
COPY public/ /usr/share/nginx/html/public/
COPY src/ /usr/share/nginx/html/src/
COPY manifest.json /usr/share/nginx/html/manifest.json

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]