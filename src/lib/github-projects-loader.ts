import type { Loader } from 'astro/loaders';
import { projectRepos, GITHUB_OWNER, type ProjectConfig } from '../data/project-config';
import { fetchRepo, fetchReadme } from './github';

function formatRepoName(name: string): string {
	return name
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function githubProjectsLoader(): Loader {
	return {
		name: 'github-projects',
		async load(context) {
			const { store, parseData, generateDigest, logger } = context;
			const token = import.meta.env.GITHUB_TOKEN as string | undefined;

			if (projectRepos.length === 0) {
				logger.info('No repos configured in project-config.ts');
				store.clear();
				return;
			}

			store.clear();

			const publicRepos = projectRepos.filter((p) => !p.private);
			const privateRepos = projectRepos.filter((p) => p.private);

			logger.info(`Fetching ${publicRepos.length} public repos from GitHub...`);

			// Load public repos from GitHub API
			for (const config of publicRepos) {
				const repo = await fetchRepo(GITHUB_OWNER, config.repo, token);
				const readme = await fetchReadme(GITHUB_OWNER, config.repo, token);

				const data = await parseData({
					id: repo.name,
					data: {
						title: config.title ?? formatRepoName(repo.name),
						description: config.description ?? repo.description ?? '',
						repo: repo.html_url,
						demo: config.demoUrl ?? (repo.homepage || undefined),
						tags: config.tags ?? repo.topics,
						featured: config.featured ?? false,
						sortOrder: config.sortOrder ?? 999,
					},
				});

				store.set({
					id: repo.name,
					data,
					body: readme ?? '',
					rendered: readme
						? await context.renderMarkdown(readme)
						: undefined,
					digest: generateDigest({ pushed_at: repo.pushed_at }),
				});
			}

			// Load private repos from local config only (no API calls, no repo link)
			for (const config of privateRepos) {
				const data = await parseData({
					id: config.repo,
					data: {
						title: config.title ?? formatRepoName(config.repo),
						description: config.description ?? '',
						// No repo link for private repos
						demo: config.demoUrl || undefined,
						tags: config.tags ?? [],
						featured: config.featured ?? false,
						sortOrder: config.sortOrder ?? 999,
					},
				});

				store.set({
					id: config.repo,
					data,
					body: '',
					digest: generateDigest({ name: config.repo, private: true }),
				});
			}

			logger.info(`Loaded ${projectRepos.length} projects (${privateRepos.length} private)`);
		},
	};
}
