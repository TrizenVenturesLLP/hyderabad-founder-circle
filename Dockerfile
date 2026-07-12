# CapRover / production image for TanStack Start (Nitro node-server)
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Bake API URL at build time (set in CapRover as build arg / env)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 80

CMD ["node", ".output/server/index.mjs"]
