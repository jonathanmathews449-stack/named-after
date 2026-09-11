# Named After

Where AI companies got their names — a small static site of origin stories.

**Live:** https://jonathanmathews449-stack.github.io/named-after/

Claude comes from a mathematician who grew up in a Michigan town of 4,000.
Nvidia comes from the Latin word for envy, and was founded in a Denny's booth.
Grok comes from a word Robert Heinlein invented for a 1961 novel. Hugging Face
is named after an emoji, and in September 2026 Nvidia agreed to buy it for
about $13 billion.

Every claim on the page is sourced; the links are in the footer.

## Running it

Open `index.html` in a browser. There is no build step, no package manager,
and no dependency to install.

```
index.html          all markup
assets/style.css    all styling — every colour is a CSS custom property
assets/main.js      nav toggle, theme toggle, random-fact shuffle
```

The page works with JavaScript disabled: the cards are `<details>` elements and
the theme follows `prefers-color-scheme` on its own.

## Deploying

Pushing to `main` triggers `.github/workflows/pages.yml`, which uploads the repo
root to GitHub Pages.

One-time setup, done by hand: **Settings → Pages → Source → GitHub Actions**.

## Editing

- **Don't hardcode colours.** Add or change the tokens in `:root`. There are
  three theme blocks (light, `prefers-color-scheme: dark`, explicit
  `[data-theme]`) and a colour defined in only one of them will break the others.
- **Don't add a build step or a dependency** without a reason worth writing down.
  Loading instantly from static files is a deliberate property of this site.
- Keep it accessible: semantic elements, `aria-expanded` on the toggles, and the
  visible `:focus-visible` outline. Don't remove those for looks.
