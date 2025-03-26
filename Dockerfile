# Create our build image
# Must be node-18, ref https://github.com/docker/build-push-action/issues/1071
FROM node:18-alpine AS BUILD_IMAGE

# Add git and curl
RUN apk update && apk add --no-cache git curl

# Create kcapp source directory
WORKDIR /usr/src/kcapp

# Install app dependencies
COPY package.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

# Write version info into version.json
RUN node scripts/write-version.js

# Create actual image
FROM node:22-alpine

WORKDIR /usr/src/kcapp

# Copy required files from build image
COPY --from=BUILD_IMAGE /usr/src/kcapp /usr/src/kcapp

EXPOSE 3000
CMD [ "npm", "run", "docker" ]