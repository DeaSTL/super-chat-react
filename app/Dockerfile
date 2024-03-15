FROM golang:alpine

RUN apk update
RUN apk add nodejs npm

EXPOSE 8080

ENV SERVER_PORT=8080

WORKDIR /app

COPY . .

WORKDIR ./frontend

RUN npm run build


WORKDIR ../

ENTRYPOINT go run ./
