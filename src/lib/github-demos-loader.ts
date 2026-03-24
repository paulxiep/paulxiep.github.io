import type { Loader } from 'astro/loaders';
import { projectRepos, GITHUB_OWNER, type ProjectConfig } from '../data/project-config';
import { fetchRepo } from './github';

function formatRepoName(name: string): string {
	return name
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function githubDemosLoader(): Loader {
	return {
		name: 'github-demos',
		async load(context) {
			const { store, parseData, generateDigest, logger } = context;
			const token = import.meta.env.GITHUB_TOKEN as string | undefined;

			store.clear();

			for (const config of projectRepos) {
				let demoUrl: string | null | undefined;
				let description: string | undefined;

				if (config.private) {
					// Private repos: use local config only
					demoUrl = config.demoUrl;
					description = config.description;
				} else {
					// Public repos: check GitHub homepage, allow config override
					const repo = await fetchRepo(GITHUB_OWNER, config.repo, token);
					demoUrl = config.demoUrl ?? repo.homepage;
					description = config.description ?? repo.description ?? undefined;
				}

				if (!demoUrl) continue;

				const slug = config.demoSlug ?? config.repo;

				const data = await parseData({
					id: slug,
					data: {
						title: config.title ?? formatRepoName(config.repo),
						description,
						url: demoUrl,
					},
				});

				store.set({
					id: slug,
					data,
					digest: generateDigest({ name: config.repo }),
				});
			}

			logger.info(`Loaded ${store.keys().length} demos`);
		},
	};
}
