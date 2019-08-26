FROM node:latest

WORKDIR /app

COPY package.json .

RUN npm install

COPY main.js .

CMD [ "npm", "start"]
