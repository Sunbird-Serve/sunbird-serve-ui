FROM node:18-alpine AS production
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm","start"]
