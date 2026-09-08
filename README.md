# mld-webstickynotes

Sticky Notes is a free, open-source, browser-only note-taking app. No accounts, no servers — everything is stored locally in your browser via `localStorage`. Pop any note out into a floating Picture-in-Picture window so it stays visible while you work in other tabs or apps.

## Features

- 📝 Create, edit, and delete sticky notes
- 🎨 Six color options per note
- 📌 Pop any note into a floating Picture-in-Picture window that stays on top while you switch tabs or apps
- 🔄 Two-way sync between the main note and its PiP window
- 💾 Everything saves automatically to your browser's `localStorage` — no sign-up, no backend, no accounts
- ⚡ Zero build step — just static HTML, CSS, and JavaScript

## Live Demo

[Add your deployed link here once it's live]

## Getting Started

### Run it locally

No build tools or dependencies required.

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/mld-webstickynotes.git
   cd mld-webstickynotes
   ```
2. Open `index.html` directly in your browser, or serve the folder with any static server, e.g.:
   ```bash
   npx serve .
   ```

### Deploy it yourself

Since this is a static site, it deploys for free on any static host:

- **GitHub Pages** — enable it under repo **Settings → Pages**
- **Netlify Drop** — drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
- **Cloudflare Pages** — connect the repo and deploy

> **Note:** Picture-in-Picture requires a secure context (HTTPS or `localhost`). It won't work over plain HTTP.

## How It Works

- Notes are stored as JSON in the browser's `localStorage` — nothing is sent to a server.
- Because storage is per-browser, **notes stay only on the device and browser you created them in.** Switching browsers, devices, or clearing site data will not carry your notes over.
- Popping a note into Picture-in-Picture uses the [`documentPictureInPicture`](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API) API, currently supported in Chromium-based browsers (Chrome/Edge v116+).

## Browser Support

| Feature | Supported In |
|---|---|
| Core note-taking | Any modern browser |
| Picture-in-Picture pop-out | Chrome / Edge 116+ |

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)
