ARG NODE_VERSION=18-alpine 
FROM node:$NODE_VERSION as BUILD_IMAGE
WORKDIR /frontend
COPY package*.json ./
RUN npm i
COPY ./ ./
RUN npm run build
FROM nginx:latest
RUN rm -rf /usr/share/nginx/html/*
COPY --from=BUILD_IMAGE /frontend/dist /usr/share/nginx/html
COPY --from=BUILD_IMAGE /frontend/deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]