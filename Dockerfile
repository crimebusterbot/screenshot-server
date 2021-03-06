FROM node:10.12.0-slim@sha256:d8c1b90eb0a34d13b3a4601c6c84612284bccc8de50fccd096e86e8eddffd74d

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD ["npm", "start"]