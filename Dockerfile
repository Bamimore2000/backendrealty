FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

# Copy your app code and set ownership to the Puppeteer user
COPY --chown=pptruser:pptruser . .

USER pptruser

# Install your npm dependencies
RUN npm install

# Run your app (change scrape.js to your main file like server.js)
CMD ["node", "server.js"]
