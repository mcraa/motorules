FROM balenalib/raspberrypi3-node

WORKDIR /usr/src/app

COPY ./dist ./dist
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./ui/build ./ui/build

#for sqlite3 to rebuild from source
RUN apt-get update
RUN apt-get install build-essential
RUN apt-get install python

RUN npm ci

EXPOSE 80

CMD ["node", "dist/index.js"]
