# Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["echo", "Este é um Dockerfile base para aplicações NestJS. Especifique o comando no docker-compose.yml"]
