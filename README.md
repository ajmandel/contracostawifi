# Contra Costa WiFi website

Static marketing + member portal website.

## Preview locally

Run a local static server from the repo root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/members.html`

## Deploy to GitHub Pages

This repository now includes `.github/workflows/deploy-pages.yml` which deploys automatically when code is pushed to the `main` branch.

### One-time setup in GitHub

1. Go to **Settings → Pages** in your GitHub repo.
2. Set **Source** to **GitHub Actions**.
3. Push this branch to GitHub and merge to `main`.
4. After the workflow finishes, open the Pages URL shown in the deployment job output.

