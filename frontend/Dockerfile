# frontend/Dockerfile
FROM node:20

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the frontend files into the container
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Start the frontend application using Vite
CMD ["npm", "run", "dev"]
