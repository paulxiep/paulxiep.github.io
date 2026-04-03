import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const ROOT = resolve(import.meta.dirname, '..');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const CATEGORIES_FILE = join(ROOT, 'src', 'data', 'categories.yml');
const OUTPUT_FILE = join(ROOT, 'src', 'data', 'category-mapping.json');

// --- Read config ---

const config = yaml.load(readFileSync(CATEGORIES_FILE, 'utf-8'));
const categories = config.categories || [];
const labelOverrides = config.tagLabels || {};

// Auto-generate label: use override, or capitalize the slug
function tagLabel(slug) {
  if (labelOverrides[slug]) return labelOverrides[slug];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Build tag→category lookup and collect all known tags
const tagToCategory = {};
const allKnownTags = new Set();

for (const cat of categories) {
  for (const tag of cat.tags) {
    allKnownTags.add(tag);
    if (tagToCategory[tag]) {
      console.warn(`⚠ Tag "${tag}" appears in multiple categories: "${tagToCategory[tag]}" and "${cat.slug}"`);
    }
    tagToCategory[tag] = cat.slug;
  }
}

// --- Scan blog posts for frontmatter tags ---

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return yaml.load(match[1]);
}

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (/\.(md|mdx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const blogFiles = collectFiles(BLOG_DIR);
const allUsedTags = new Set();

for (const file of blogFiles) {
  const content = readFileSync(file, 'utf-8');
  const fm = extractFrontmatter(content);
  if (!fm || !fm.tags) continue;

  for (const tag of fm.tags) {
    allUsedTags.add(tag);
  }
}

// Check for categories with zero posts
for (const cat of categories) {
  const hasPosts = cat.tags.some((t) => allUsedTags.has(t));
  if (!hasPosts) {
    console.warn(`⚠ Category "${cat.slug}" has no posts matching its tags`);
  }
}

// Build tag labels for all tags (from categories + used in posts)
const tagLabels = {};
for (const tag of new Set([...allKnownTags, ...allUsedTags])) {
  tagLabels[tag] = tagLabel(tag);
}

// --- Write output ---

const output = {
  categories: categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    tags: c.tags,
  })),
  tagToCategory,
  tagLabels,
};

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`✓ Category mapping written to ${OUTPUT_FILE}`);
console.log(`  ${categories.length} categories, ${Object.keys(tagLabels).length} tags, ${blogFiles.length} posts scanned`);
