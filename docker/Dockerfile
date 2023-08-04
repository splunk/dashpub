FROM node:14-alpine
RUN npm i -g https://github.com/livehybrid/dashpub/tarball/ws-july23 --unsafe-perm
RUN apk add git
RUN git config --global user.email "dashpub@yourdomain.com"
RUN git config --global user.name "Splunk DashPub"
# Download node modules
RUN cd /usr/local/lib/node_modules/@splunk/dashpub/template && yarn install
#RUN mkdir -p /usr/local/lib/node_modules/@splunk/dashpub/template/cache
#ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
#COPY init.js /usr/local/lib/node_modules/@splunk/dashpub/cli/init.js
COPY entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY config /usr/local/bin/config
#ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

