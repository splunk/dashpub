FROM node:20-alpine
COPY . /build
RUN npm i -g /build --unsafe-perm
RUN apk add git vips-dev
#RUN apt-get update && apt-get install -y  git libvips libvips-dev
RUN cd /build && yarn add sharp --ignore-engines && yarn install && cd /

RUN git config --global user.email "dashpub@yourdomain.com"
RUN git config --global user.name "Splunk DashPub"

# Download node modules
RUN cd /usr/local/lib/node_modules/@splunk/dashpub/template && yarn install

COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY docker/config /usr/local/bin/config
#ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

