# Event App

React/Vite frontend in `client/` and Express/MongoDB API in `server/`.

## Deploy

Deploy the frontend and API as separate services, or serve both from one origin.

- **API service:** set the root directory to `server`, install with `npm ci`, and start with `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS` in the hosting provider's environment settings. The service listens on the provider's `PORT` and exposes `/api/health` for health checks.
- **Frontend service:** set the root directory to `client`, install with `npm ci`, and build with `npm run build`. Publish the `dist/` directory. Set `VITE_API_URL` to the API's full URL ending in `/api` (for example, `https://api.example.com/api`). If both services share an origin, omit it and the frontend will use `/api`.
- Configure the frontend host to serve `index.html` for client-side routes. For a cross-origin API, allow the frontend origin in the API's CORS configuration if you restrict origins at the host or proxy.

Uploaded event images are stored under `server/uploads`. Hosts with an ephemeral filesystem will discard those files on restart or redeploy; attach persistent storage at that path or use an external object storage service for production uploads.

For local development, copy `server/.env.example` to `server/.env`, set real credentials, install dependencies in both `server/` and `client/`, and run `npm run dev` in each directory. The API uses port `5002` locally; Vite proxies `/api` and `/uploads` to it.
