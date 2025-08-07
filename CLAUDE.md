# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a business consulting website for ^Kunke Consulting built with Astro. The site provides information about AI and Excel training services, workshops, team members, and includes a blog with consulting articles.

## Branding Note

The caret (`^`) that prefixes the company name in expressions like "^Kunke Consulting" or the shorthand "^KC" is an intentional part of the brand identity. It is not a syntax error or stray character and should be preserved in all code, documentation, and user-facing content.

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
- **Security-focused configuration** with CSP headers and origin checking enabled

### Security Configuration
The project implements robust security measures:
- Content Security Policy (CSP) headers configured in `BaseLayout.astro`
- Origin checking enabled in `astro.config.mjs`
- Security headers including X-Frame-Options, X-Content-Type-Options
- Nonce-based inline style protection
- Formspree integration for secure form handling

### Key Directories

- `src/pages/` - Route-based pages (index, blog, team, privacy-policy)
- `src/components/` - Reusable Astro components (ContactForm, AiPackages, Excel, etc.)
- `src/content/blog/` - Markdown blog posts with frontmatter
- `public/images/` - Static assets including team photos and service images
- `public/styles/global.css` - Global styling

### Content Management

Blog posts are managed through Astro Content Collections with schema defined in `src/content/config.ts`:
- Required fields: `title`, `description`, `date`
- Optional fields: `tags` (array of strings)
- Posts are written in Markdown with frontmatter
- Automatic routing via `[slug].astro` dynamic route
- Content validation using Zod schemas ensures type safety

### Component Architecture

The site uses a component-based structure with specialized components:
- `BaseLayout.astro` - Main layout with SEO meta tags, security headers, and styling
- `ContactForm.astro` - Contact form functionality with Formspree integration
- `AiPackages.astro` - AI service offerings display
- `Excel.astro` - Excel training packages presentation
- `TeamMember.astro` - Team member profiles with photos and links
- `WorkshopSection.astro` - Workshop information and CTA
- `testimonials.astro` - Client testimonials with ratings
- `ExperienceSection.astro` - Company experience showcase
- `OMnie.astro` - About section component

### Layout Pattern
All pages use the `BaseLayout.astro` component which provides:
- Consistent HTML structure and meta tags
- Security headers and CSP configuration
- Google Fonts integration (Inter font family)
- Favicon and manifest references
- Open Graph and Twitter Card support

### Multi-language Support

The site includes both Polish and English content with dedicated team pages (`team.astro` and `zespol.astro`).

## Development Notes

- The site is primarily in Polish with some English elements
- Uses Inter font family from Google Fonts
- Includes comprehensive SEO meta tags and Open Graph/Twitter Card support
- Footer includes contact information and social media links (LinkedIn, Facebook, YouTube)
- Contact form integrates with Formspree for secure form handling
- Images are stored in `public/images/` including team photos and service graphics
- No testing framework is currently configured

## Key Implementation Details

### Styling Approach
- Global CSS file at `public/styles/global.css` with responsive design
- Component-specific styles defined within individual `.astro` files
- Card-based layout pattern for service offerings
- Responsive design with mobile-first approach

### Content Structure
- Homepage (`src/pages/index.astro`) serves as main landing page with all key sections
- Blog system uses dynamic routing with `[slug].astro` for individual posts
- Team pages separated by language: `/team` (English) and `/zespol` (Polish)
- Privacy policy page at `/privacy-policy`

### Performance Considerations
- Static site generation via Astro for optimal performance
- Image optimization should use appropriate formats and sizes
- Google Fonts loaded with preconnect for faster loading