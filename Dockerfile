FROM node:alpine

RUN mkdir -p /usr/src/app/dist
WORKDIR /usr/src/app/

COPY package*.json /usr/src/app/

RUN npm install

ENV DB_CONN_STRING="mongodb://root:MongoDB2019!@mongo:27017/"
ENV DB_NAME="payment"
ENV PACIENTE_COLLECTION_NAME="payment"
ENV URL="http://localhost:8000"
ENV MQ_CONN_STRING="amqp://guest:guest@localhost:5672"
ENV AWS_REGION="region"
ENV COGNITO_USER_POOL_ID="user_pool"
ENV AWS_ACCESS_KEY_ID="access"
ENV AWS_SECRET_ACCESS_KEY="secret"
ENV TOKEN="token"

COPY ./dist/ /usr/src/app/dist
COPY .env /usr/src/app

EXPOSE 5000

CMD ["npm", "start"]
