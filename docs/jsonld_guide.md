# JSON-LD & metadata guide

How structured data and OpenGraph meta tags are wired on paulxie.com, and what to do when adding new content.

## What this site emits

| Page type | OpenGraph `og:type` | JSON-LD types | Source |
|---|---|---|---|
| Home (`/`) | `website` | `WebSite`, `Person` | [src/pages/index.astro](../src/pages/index.astro) |
| About (`/about/`) | `website` | `AboutPage` (with `Person` as `mainEntity`) | [src/pages/about.astro](../src/pages/about.astro) |
| Blog post (`/blog/<slug>/`) | `article` | `BlogPosting` | [src/layouts/BlogPost.astro](../src/layouts/BlogPost.astro) |
| Project (`/projects/<slug>/`) | `website` | `SoftwareSourceCode` if `repo` is set, else `CreativeWork` | [src/layouts/ProjectPage.astro](../src/layouts/ProjectPage.astro) |
| Other static pages | `website` | none | individual page files |

All meta tags are rendered by [src/components/BaseHead.astro](../src/components/BaseHead.astro). It accepts `title`, `description`, optional `image`, `ogType`, `publishedTime`, `modifiedTime`, and `jsonLd` (single object or array).

## The Person identity

The canonical "Paul" entity lives in [src/lib/schema.ts](../src/lib/schema.ts) as `personSchema`. It carries:

- `name`, `alternateName` ("Paul Xie", "Paul X")
- `url` → `https://paulxie.com`
- `jobTitle`
- `sameAs` → LinkedIn + GitHub URLs

Every page that references Paul as author uses the shared `@id` (`https://paulxie.com/#person`) so search engines treat all references as the same entity.

**To add a new social profile** (e.g., a new X handle, Mastodon, personal podcast page): add the URL to the `sameAs` array in `personSchema`. Every blog post, project, and the home page picks it up automatically.

## Adding new content

### New blog post

Create `src/content/blog/<slug>.md` (or `.mdx`).

```yaml
---
title: 'Your post title'
description: 'One-sentence summary used in og:description and JSON-LD.'
pubDate: 2026-05-06
# Optional but recommended:
updatedDate: 2026-05-10
heroImage: ./hero.jpg   # relative path; must be importable Astro asset
tags: ['ai', 'rag']
featured: false
draft: false
---
```

Frontmatter → JSON-LD mapping:

| Frontmatter | OpenGraph | `BlogPosting` field |
|---|---|---|
| `title` | `og:title`, `<title>` | `headline` |
| `description` | `og:description`, `meta description` | `description` |
| `pubDate` | `article:published_time` | `datePublished` |
| `updatedDate` | `article:modified_time` | `dateModified` |
| `heroImage` | `og:image` | `image` |
| `tags` | – | `keywords` |

Author is filled from the shared `Person`. Nothing else to touch.

### New internal project (`projects` collection)

The `projects` collection is loaded from GitHub via `githubProjectsLoader` ([src/content.config.ts](../src/content.config.ts)). Schema fields: `title`, `description`, optional `repo` (URL), `demo`, `release` (URL), `tags`, `featured`, `sortOrder`.

If `repo` is set, the layout emits `SoftwareSourceCode` with `codeRepository`; otherwise `CreativeWork`.

### New external project (`externalProjects` collection)

Create `src/content/external-projects/<slug>.md`:

```yaml
---
title: 'Project name'
description: 'One-line description.'
demoUrl: https://example.com/demo
# Optional:
heroImage: ./cover.jpg
tags: ['demo']
featured: true
sortOrder: 2
---
```

Emits `CreativeWork` with `url=demoUrl`, `image=heroImage` if present, and `keywords=tags`.

### New static page

```astro
---
import BaseHead from '../components/BaseHead.astro';
---
<BaseHead title="Page title" description="..." />
```

If the page is identity-relevant (e.g., a `/cv` or `/now` page), import the Person schema:

```astro
---
import { personSchema } from '../lib/schema';
---
<BaseHead title="..." description="..." jsonLd={personSchema} />
```

## Verification

After adding content:

1. Build: `docker compose run --rm astro build`
2. Serve locally and open the new page; view-source.
3. Confirm:
   - `<title>`, `<meta name="description">`, `<link rel="canonical">` all present.
   - `og:title`, `og:description`, `og:image`, `og:type` correct (article for blog posts, website otherwise).
   - For blog posts: `article:published_time` (and `article:modified_time` if `updatedDate` set).
   - `<script type="application/ld+json">` block present with the expected `@type`.
4. Paste the deployed URL into:
   - [Rich Results Test](https://search.google.com/test/rich-results) — expect "Article" eligibility for blog posts.
   - [Schema Markup Validator](https://validator.schema.org/) — should validate cleanly with no errors.

## When to edit layouts vs. frontmatter

| You're adding... | Touch |
|---|---|
| A blog post, project, or external project of an existing collection | Frontmatter only |
| A new social profile for Paul | `src/lib/schema.ts` `personSchema.sameAs` |
| A new collection (e.g., `talks`, `papers`) | New layout + new schema factory in `src/lib/schema.ts` |
| A new schema field on an existing collection | The corresponding layout and the factory in `src/lib/schema.ts` |

## Pitfalls

- **Don't hand-write JSON-LD in MDX bodies.** It bypasses the canonical `Person` reference and risks duplicate or conflicting blocks. Add fields to `src/lib/schema.ts` instead.
- **`heroImage` must be an importable Astro asset**, not a raw URL. The schema in [content.config.ts](../src/content.config.ts) uses `image()` which resolves the path at build time. If you have only a remote URL, leave `heroImage` empty and the page falls back to the generic preview.
- **`pubDate` is required on blog posts.** Without it the `BlogPosting.datePublished` is missing and the post becomes ineligible for Article rich results.
- **`og:type` defaults to `website`.** If you ever add another article-like content type, pass `ogType="article"` from that layout to `BaseHead`.
