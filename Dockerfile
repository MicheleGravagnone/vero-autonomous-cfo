# ---- sample data (optional) ----
# Empty by default. For the self-contained demo, pass the official sample data:
#   docker build --build-arg VITE_MOCK=1 --build-context samples=../data/samples -t cfo-frontend .
FROM scratch AS samples

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY --from=samples / /samples/
ENV SAMPLES_DIR=/samples
# VITE_MOCK=1 builds a self-contained demo (no backend needed)
ARG VITE_MOCK=0
ENV VITE_MOCK=$VITE_MOCK
RUN npm run build

# ---- serve ----
# nginx-unprivileged: runs as non-root on port 8080, as OpenShift requires
FROM nginxinc/nginx-unprivileged:1.27-alpine
# Backend service URL inside the cluster; override with -e / env in the Deployment
ENV BACKEND_URL=http://backend:8000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
