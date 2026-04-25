# Astro Site Plan

> GitHub Pages portfolio + algorithm showcase + blog
> Stack: Astro (TypeScript), Cloudflare Workers, Docker dev environment

---

## Site Purpose

This site serves three roles from a single Astro project:

1. **GitHub Portfolio** — landing page + project gallery, auto-populated from GitHub API at build time, with handwritten MDX deep-dives for featured projects
2. **Algorithm Showcase** — interactive demos using the hybrid approach: simplified client-side mock for instant interaction, full-fidelity results via Cloudflare Worker API (proprietary algorithm stays server-side)
3. **Blog** — mixed professional/personal, single blog with tag-based filtering, MDX-enabled so posts can embed live demo components

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│  GitHub Pages (free)                │
│  Astro static output                │
│  ┌───────────┐ ┌──────────────────┐ │
│  │ Portfolio  │ │ Blog (MD/MDX)    │ │
│  │ /projects/ │ │ /blog/           │ │
│  └───────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────┐│
│  │ /demos/                         ││
│  │  → iframe embeds external demos ││
│  │  → each demo lives in own repo  ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Route Structure

```
/                   → Hero + highlights (pinned projects, latest post, demo teaser)
/projects/          → Portfolio gallery (GitHub repos + curated entries)
/projects/[slug]/   → Deep-dive write-up (MDX)
/demos/             → Algorithm demo listing
/demos/[slug]/      → Individual interactive demo
/blog/              → All posts, filterable by tag and category
/blog/[slug]/       → Individual post (MDX, can embed demo components)
/blog/tags/[tag]/   → Posts filtered by tag
/blog/category/[cat]/ → Posts filtered by category
/about/             → Bio, contact, resume/CV link
/rss.xml            → Auto-generated RSS feed
```

---

## Tech Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict) | Type-safe content schemas, typed API responses |
| UI framework | None (vanilla TS + Astro `<script>`) | No framework to learn; Astro handles static, vanilla TS handles interactivity |
| Demo interactivity | Rust WASM | Algorithm demos run as compiled WASM modules in the browser |
| Styling | Tailwind + @tailwindcss/typography | Utility classes for layout, typography plugin for prose/markdown |
| Content | Astro Content Collections (MD/MDX) | Type-safe frontmatter, file-based, git-friendly |
| Hosting | GitHub Pages via Actions | Free, auto-deploys on push to main |
| Demos | Iframe embedding | Each demo lives in its own repo; Astro just frames the deployed URL |
| Dev env | Docker Compose | Reproducible, no local Node/npm required |

---

## Blog: Tags & Categories

### Philosophy

- **Tags** are the source of truth — stored in post frontmatter, manually authored
- **Categories** are a presentation layer — defined in a separate config, computed from tags at build time
- Posts can appear in multiple categories
- You can rename, split, merge, or add categories without touching any posts

### Tags (per-post frontmatter)

Every post has a `tags` array. Tags come from a controlled vocabulary defined in a tag dictionary file. Astro validates tags at build time via content collection schemas.

```yaml
# src/data/tag-dictionary.yml
- slug: ml
  label: "Machine Learning"
- slug: rust
  label: "Rust"
- slug: wasm
  label: "WebAssembly"
- slug: travel
  label: "Travel"
- slug: algorithms
  label: "Algorithms"
```

### Categories (build-time config)

Categories are defined in a config file that maps tag sets to categories. A build script computes which posts belong to which categories via tag intersection.

```yaml
# src/data/categories.yml
data-science:
  label: "Data Science"
  description: "ML, data engineering, and analytics"
  tags: ["ml", "pandas", "sklearn", "data-viz", "statistics"]

systems:
  label: "Systems & Low-Level"
  description: "Rust, WASM, performance"
  tags: ["rust", "wasm", "algorithms", "performance"]

personal:
  label: "Personal"
  description: "Travel, books, life"
  tags: ["travel", "life", "books", "food"]
```

### Build flow

1. You write a post with manual tags in frontmatter
2. Pre-build script reads category definitions + all posts' tags
3. Script computes tag→category mapping via set intersection, outputs `src/data/category-mapping.json`
4. Astro builds the site, consuming both frontmatter tags and category mapping as data
5. Templates render category pages, tag pages, and navigation from the computed data

### Future: Embedding-Based Auto-Tagging

When the blog has enough content to justify it, add an embedding pipeline:

1. Tag dictionary gains embedding vectors per tag
2. Categories gain centroid embeddings instead of (or in addition to) tag lists
3. Pre-build script runs an embedding model over post content
4. Auto-tags are appended to a generated data file (`src/data/auto-tags.json`), **not** written back into frontmatter (keeps git history clean)
5. Astro merges manual tags + auto-tags at build time
6. Category assignment uses semantic similarity instead of set intersection

This is additive — manual tags remain the baseline, auto-tags are a layer on top.

---

## Content Collection Schemas

### Blog (`src/content/blog/`)

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),         // validated against tag-dictionary.yml
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});
```

Note: no `category` field in frontmatter — categories are computed from tags at build time.

### Projects (`src/content/projects/`)

```typescript
const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repo: z.string().url().optional(),    // GitHub URL
    demo: z.string().optional(),          // link to /demos/slug if applicable
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(0),
  }),
});
```

---

## Demo Approach

Demos live in their own repos (e.g., Streamlit, Gradio, standalone frontends) and are embedded in the Astro site via iframe. The demos loader pulls URLs from project config or GitHub homepage fields. No Astro-side demo logic or Cloudflare Worker needed.

---

## Docker Dev Setup

All development happens inside Docker — no local Node/npm required.

### Scaffolding (one-time)

```bash
# Scaffold Astro project inside a throwaway container
docker run --rm -it -v "$(pwd):/app" -w /app node:22-alpine \
  sh -c "npm create astro@latest . -- --template blog --typescript strict --install --no-git"

# Add integrations
docker run --rm -it -v "$(pwd):/app" -w /app node:22-alpine \
  sh -c "npx astro add mdx tailwind -y"
```

### Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### docker-compose.yml

```yaml
services:
  astro:
    build: .
    ports:
      - "4321:4321"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true        # Required for Windows Docker hot reload
```

### Shell Scripts (`scripts/`)

```bash
# scripts/dev.sh — Start dev server
docker compose up

# scripts/build.sh — Production build
docker compose run --rm astro npm run build

# scripts/shell.sh — Shell into the container
docker compose exec astro sh
```

---

## GitHub Actions Deploy

File: `.github/workflows/deploy.yml`

Trigger: push to `main`
Steps: checkout → setup node → install → run category build script → `astro build` → deploy via `actions/deploy-pages@v4`

Remember to:
- Set repo Settings → Pages → Source → "GitHub Actions"
- Move `CNAME` to `public/CNAME` so it survives builds

---

## Astro Config

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://paulxie.com',
  // No base needed — this is a user site (paulxiep.github.io) with custom domain
  integrations: [mdx(), tailwind(), sitemap()],
  output: 'static',
});
```

---

## Rough Build Order

### Phase 1: Foundation + Content Pipeline
Infrastructure, content schemas, and basic layouts — enough to start writing blog posts and project pages immediately.

- [x] Scaffold Astro project inside Docker (blog template, TS strict)
- [x] Add integrations: mdx, tailwind (via Docker) *(mdx done; using custom CSS instead of Tailwind)*
- [x] Move `CNAME` to `public/CNAME`, delete old `index.html`
- [x] Create `Dockerfile` and `docker-compose.yml`
- [x] Create `scripts/` (dev.sh, build.sh, shell.sh)
- [x] Configure `astro.config.mjs` with `site: 'https://paulxie.com'`
- [x] Set up GitHub Actions deploy workflow
- [x] Define blog content collection schema (tags, no category field)
- [x] Define projects content collection schema
- [x] Create basic blog post layout (renders markdown with title/date/tags)
- [x] Create basic project page layout (renders markdown with title/description/repo link)
- [x] Create blog list page (`/blog/` — lists all posts)
- [x] Create projects list page (`/projects/` — lists all projects)
- [x] Create minimal landing page (`/` — links to blog and projects)
- [x] Create tag dictionary (`src/data/tag-dictionary.yml`) with initial tags
- [x] Verify: dev server works, can add .md files and see them rendered, deploys to GitHub Pages

After Phase 1, you can start writing content by dropping `.md`/`.mdx` files into `src/content/blog/` and `src/content/projects/`.

### Phase 2: Blog Enhancements
- [x] Create category config (`src/data/categories.yml`)
- [x] Write category build script (tag→category mapping) *(pre-build Node script outputs `category-mapping.json`)*
- [x] Add tag filtering to blog list page *(category buttons + tag search with multi-select, OR filtering)*
- [x] Create tag pages (`/blog/tags/[tag]/`)
- [x] Create category pages (`/blog/category/[cat]/`)
- [x] Add RSS feed (`@astrojs/rss`)
- [x] Style prose with custom CSS *(polished headings, code blocks, blockquotes, lists, links — no Tailwind)*

### Phase 3: Portfolio Enhancements
- [x] Build GitHub API fetch in project list page (build-time auto-populate)
- [x] Create project card component (styled)
- [x] Build landing page with highlights from blog + projects
- [x] Create demo page(s) under `/demos/` *(iframe wrapper embedding external demo URLs)*

### Phase 4: Polish
- [ ] Dark mode toggle
- [x] SEO: meta tags, Open Graph, sitemap *(BaseHead.astro has OG tags, @astrojs/sitemap integrated)*
- [ ] 404 page
- [x] Navigation and mobile menu *(Header.astro has responsive nav, no hamburger menu yet)*
- [ ] Lighthouse audit (aim for 95+ across the board)
- [ ] README for the repo itself

### Future: Staged Categorization Roadmap

Embedding-based categorization is deferred. The original tag-centroid approach is also retired in favour of a stronger long-term target. Stages are gated by post count, not by date.

#### Stage 1 — Now (≤25 posts): Manual + hygiene
- [ ] Periodic tag-dictionary hygiene pass (singular/plural drift, orphan tags, re-run category build script when `categories.yml` changes)

No embeddings, no automation. Manual tagging is faster than any alternative at this scale.

#### Stage 2 — 10–25 posts: Write-time tag suggestions
- [ ] Helper script: given a draft post, suggest tags from the existing dictionary (LLM or local embedding lookup), human accepts/rejects
- [ ] Runs at write time, not build time — no runtime/build dependency

Helps maintain vocabulary consistency as the tag set grows.

#### Stage 3 — 25–50 posts: Hybrid categorization
- [ ] Each category gains a rich `description` field; embed each description once
- [ ] Pre-build script embeds each post body, assigns category by cosine similarity to category descriptions
- [ ] Drop the manual tag→category mapping in `categories.yml`
- [ ] Manual tags **remain** as the source of truth for `/blog/tags/[tag]/` browse pages

Categories become a semantic layer that re-flows when you re-phrase a description; tags stay precise, curated, and explainable. This is where content-direct embedding pays off — without sacrificing the tag browse surface.

#### Stage 4 — 50+ posts: Discovery features
- [ ] "Related posts" via post-embedding cosine similarity
- [ ] Semantic search over post bodies

Discovery is where embeddings genuinely shine. Categorization is a relatively weak use case for them.

---

## Useful Commands

```bash
# Dev (all via Docker, no local Node needed)
bash scripts/dev.sh                   # start dev server (localhost:4321)
bash scripts/build.sh                 # production build
bash scripts/shell.sh                 # shell into container

# Content
# Just create .md/.mdx files in src/content/blog/ or src/content/projects/
# Astro picks them up automatically
```

---

## Reference Links

- Astro docs: https://docs.astro.build
- Astro GitHub Pages guide: https://docs.astro.build/en/guides/deploy/github/
- Content Collections: https://docs.astro.build/en/guides/content-collections/
