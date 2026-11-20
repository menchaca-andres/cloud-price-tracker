FROM mcr.microsoft.com/playwright:v1.49.0-noble

COPY --from=oven/bun:latest /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

CMD ["bun", "run", "src/index.ts"]