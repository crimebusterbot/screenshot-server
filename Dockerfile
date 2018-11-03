FROM node:10.12.0-slim@sha256:d8c1b90eb0a34d13b3a4601c6c84612284bccc8de50fccd096e86e8eddffd74d
RUN apt-get update
RUN apt-get install -yq libgconf-2-4
RUN apt-get install -y wget --no-install-recommends
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-unstable --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV BUST 1
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app
ENV NODE_ENV production
ENV PORT 80
EXPOSE 8
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]