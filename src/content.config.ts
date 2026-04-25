import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { githubProjectsLoader } from './lib/github-projects-loader';
import { githubDemosLoader } from './lib/github-demos-loader';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
			heroImage: z.optional(image()),
		}),
});

const projects = defineCollection({
	loader: githubProjectsLoader(),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		repo: z.string().url().optional(),
		demo: z.string().optional(),
		release: z.string().url().optional(),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		sortOrder: z.number().default(0),
	}),
});

const demos = defineCollection({
	loader: githubDemosLoader(),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		url: z.string().url(),
		image: z.string().optional(),
	}),
});

const externalProjects = defineCollection({
	loader: glob({ base: './src/content/external-projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			demoUrl: z.string().url(),
			tags: z.array(z.string()).default([]),
			featured: z.boolean().default(false),
			sortOrder: z.number().default(0),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog, projects, demos, externalProjects };
