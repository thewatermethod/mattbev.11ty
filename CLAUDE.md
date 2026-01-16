# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Matt Bevilacqua (mattbev.com) built with Eleventy v3. Deployed to Netlify.

## Commands

- `npm run build` - Build the site (outputs to `_site/`)
- `npm run serve` or `npm start` - Build and serve locally with hot reload
- `npm run dev` - Run with Netlify Dev (includes serverless functions)
- `npm run maker "Post Title"` - Create a new blog post in `posts/`
- `npm run refresh-books` - Scrape StoryGraph for books read and create markdown files for new ones

## Architecture

### Eleventy Configuration (`.eleventy.js`)

- Uses Nunjucks as the template engine for markdown and HTML
- Custom collections: `posts`, `booksByYear`, `currentlyReading`, `currentProjects`, `tagList`
- Custom filters: `readableDate`, `htmlDateString`, `year`, `head`, `min`, `filterTagList`
- Plugins: RSS feed, YouTube embed
- Image shortcode using `@11ty/eleventy-img`

### Content Structure

- `posts/` - Blog posts (markdown with frontmatter)
- `books/` - Book entries scraped from StoryGraph
- `projects/` - Project pages
- `songs/` - Month of songs content
- `delicious/` - Legacy bookmarks imported from Delicious

### Data Flow

- `_data/metadata.json` - Site metadata (title, author, URLs)
- `_data/posts.js` - Custom posts data file
- `_data/currentlyReading.js` - Fetches currently reading books

### External Integrations

- **StoryGraph**: `lib/storyGraph.js` uses Playwright to scrape book data (currently reading + books read)
- **Netlify Functions**: Located in `netlify/functions/` (includes Mastodon integration)

### Build Notes

- Netlify build uses `xvfb-run` wrapper for Playwright headless browser support
- Node 22 required (see `netlify.toml`)
- Playwright browsers install on `postinstall`
