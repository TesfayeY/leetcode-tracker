# Dockerfile
FROM node:20-slim

# "For Windows
# Map host system's user id and group to user in container
# So that when we bind mount our files into the container
# there are not any permission issues
ARG UID
ARG GID
# Update UNAME and UGROUP to whatever you like 
ARG UNAME='leetcode-tracker'
ARG UGROUP='leetcode-tracker'


RUN apt-get update && apt-get install -y openssl && apt-get -y install git && apt-get -y install vim

# For Windows
RUN echo UID=${UID} UNAME=${UNAME}
RUN echo GID=${GID} UGROUP=${UGROUP}
# Create our user
RUN groupadd -g ${GID} -o ${UGROUP}
RUN useradd -ms /bin/bash -u ${UID} -g ${UGROUP} ${UNAME}

# Create app directory
WORKDIR /app

# For Windows
COPY --chown=${UNAME}:${UGROUP} . .

# Copy the entrypoint script
COPY docker/entrypoint.sh /app/docker/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/docker/entrypoint.sh

# Install app dependencies
COPY package.json package-lock.json ./

# Expose the port Nuxt will run on
EXPOSE ${APP_PORT}

# Use custom entrypoint script
ENTRYPOINT ["./docker/entrypoint.sh"]

# For Windows
USER ${UNAME}


