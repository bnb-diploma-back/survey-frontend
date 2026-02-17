# survey-frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Deploying to Heroku & Connecting to the Backend

### How the frontend gets the backend URL

- The app uses **`VITE_API_URL`** for the API base URL (see `src/api/survey.js`).
- Vite inlines env vars at **build time**. So the backend URL is fixed when you run `npm run build`; it is not read at runtime in the browser.

### Option A: Backend as a separate Heroku app (recommended)

1. Deploy your backend to its own Heroku app (e.g. `https://your-survey-api.herokuapp.com`).
2. For the **frontend** app, set a Heroku **Config Var** before or during deploy:
   - In Dashboard: **Settings → Config Vars** → Add:
     - **Key:** `VITE_API_URL`
     - **Value:** `https://your-survey-api.herokuapp.com` (no trailing slash)
   - Or via CLI:  
     `heroku config:set VITE_API_URL=https://your-survey-api.herokuapp.com -a your-frontend-app-name`
3. Redeploy the frontend (or trigger a build). The build step runs with `VITE_API_URL` set, so the built `dist/` will call your Heroku backend.
4. **CORS:** Your backend must allow the frontend origin (e.g. `https://your-frontend-app.herokuapp.com`) in `Access-Control-Allow-Origin`. Otherwise the browser will block API requests.

### Option B: Backend on the same Heroku app

If you serve both API and this Vue app from one Node/Heroku app (e.g. Express serves `/survey` and static files from `dist/`):

- Set **`VITE_API_URL`** to empty (or omit it) so the app uses the same origin: requests go to `/survey` on your app’s domain.
- Or set `VITE_API_URL=https://your-app.herokuapp.com` if you prefer an absolute URL.

### Local development

- Without any env file, the app uses `http://localhost:8070` as the API URL.
- To override locally, create a `.env` or `.env.local` in the project root:
  - `VITE_API_URL=http://localhost:8070`
- Restart `npm run dev` after changing env files.
