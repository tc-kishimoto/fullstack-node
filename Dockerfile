FROM node:16.18

COPY . .

EXPOSE 3300

CMD node app.js