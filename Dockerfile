FROM node:16
WORKDIR /srv/product-highlights-extension
COPY package*.json ./
RUN npm install

COPY . .

# build bindings
RUN cd ./bindings
RUN npm run build
RUN cd ..

# build frontend
RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]
