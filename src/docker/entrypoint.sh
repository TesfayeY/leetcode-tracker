#!/bin/sh

#Install Dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Start the application
npm run dev

#tail -f /dev/null

