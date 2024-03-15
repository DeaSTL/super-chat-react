FROM node:alpine

WORKDIR /app

COPY . .


EXPOSE 5173

RUN npm install

RUN npm run build


ENTRYPOINT npm start
