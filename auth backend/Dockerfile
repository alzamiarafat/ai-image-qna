FROM node:20.18.0 AS development

# Set working directory

WORKDIR /app

COPY package*.json ./

RUN yarn add glob rimraf

# Install project dependencies
RUN yarn install

# Expose container port
EXPOSE ${PORT}

# RUN npm install --only=development

# Copy project in the working directory
COPY . .

# Builds the project
# RUN yarn build

# Run the project
CMD ["yarn", "run", "start:prod"]
