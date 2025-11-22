# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package.json ./

RUN npm install

# Copy the rest of the source code
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
