# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a business consulting website for Kunke Consulting built with Astro. The site provides information about AI and Excel training services, workshops, team members, and includes a blog with consulting articles.

## Development Commands

All commands should be run from the root directory:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro [command]
```

## Architecture & Structure

### Tech Stack
- **Astro 5.12.3** - Static site generator with component-based architecture
- **TypeScript** with strict configuration extending `astro/tsconfigs/strict`
- **Content Collections** for blog posts with Zod schema validation
- **Global CSS** with responsive design

### Key Directories

- `src/pages/` - Route-based pages (index, blog, team, privacy-policy)
- `src/components/` - Reusable Astro components (ContactForm, AiPackages, Excel, etc.)
- `src/content/blog/` - Markdown blog posts with frontmatter
- `public/images/` - Static assets including team photos and service images
- `public/styles/global.css` - Global styling

### Content Management

Blog posts are managed through Astro Content Collections with schema defined in `src/content/config.ts`:
- Required fields: `title`, `description`, `date`
- Posts are written in Markdown with frontmatter
- Automatic routing via `[slug].astro` dynamic route

### Component Architecture

The site uses a component-based structure with specialized components:
- `ContactForm.astro` - Contact form functionality
- `AiPackages.astro` - AI service offerings
- `Excel.astro` - Excel training packages
- `TeamMember.astro` - Team member profiles
- `WorkshopSection.astro` - Workshop information
- `testimonials.astro` - Client testimonials

### Multi-language Support

The site includes both Polish and English content with dedicated team pages (`team.astro` and `zespol.astro`).

## Development Notes

- The site is primarily in Polish with some English elements
- Uses Inter font family from Google Fonts
- Includes SEO meta tags and Open Graph/Twitter Card support
- Footer includes contact information and social media links
- No testing framework is currently configured