FROM node:16.18

RUN apt-get update && apt-get install -y tzdata
ENV TZ Asia/Tokyo

COPY . .

EXPOSE 3300

CMD node app.js