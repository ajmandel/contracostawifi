# Contra Costa WiFi website

Static marketing + member portal website.

## Why this repo is flat

Some static hosting dashboards reject uploads that include nested directories (for example errors like `Unable to create the directory: .github` or `Unable to create the directory: assets`).

To stay compatible with those hosts, this repo keeps deploy files at the root:

- `index.html`, `members.html`, and other pages
- `styles.css`
- `app.js`

## Preview locally

Run a local static server from the repo root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/members.html`

## Deploy on restrictive static hosts

If your host refuses hidden/nested directories:

1. Upload only root files from this repository.
2. Set rewrite path to `/index.html` only if your host requires SPA-style fallback.
3. Leave subdomain path blank or `/` unless your provider requires a specific value.

