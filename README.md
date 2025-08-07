# Astro Starter Kit: Minimal
# Kunke Consulting Website

This is the official website for Kunke Consulting, built with Astro. The site showcases consulting services, client testimonials, team information, blog articles, and contact options.

## 🌱 About Kunke Consulting

Kunke Consulting provides expert business and AI consulting services, workshops, and training. The website is designed to present offerings, share client success stories, and enable easy contact for new clients.

## ✨ Features

- Home page with service overview
- Team and experience section
- Blog with articles and tips
- Workshop and training information
- Contact form for inquiries
- Client testimonials with ratings

## 🛠️ Tech Stack

- [Astro](https://astro.build/) (static site generator)
- TypeScript
- Global CSS and component-scoped styles (primary stylesheet at `public/styles/global.css`)
- Responsive design

---
```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
