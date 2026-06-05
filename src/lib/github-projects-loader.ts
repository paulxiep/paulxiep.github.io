import type { Loader } from 'astro/loaders';
import { projectRepos, GITHUB_OWNER, type ProjectConfig } from '../data/project-config';
import { fetchRepo, fetchReadme, fetchLatestRelease } from './github';

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

			const privateCount = projectRepos.filter((p) => p.private).length;
			logger.info(`Fetching ${projectRepos.length} repos from GitHub (${privateCount} private)...`);

			// Fetch README + metadata for every repo. Private repos are fetched the
			// same way (requires an authenticated token), but hide the repo link and
			// flag closedSource so the page shows a closed-source notice instead.
			for (const config of projectRepos) {
				const repo = await fetchRepo(GITHUB_OWNER, config.repo, token);
				const readme = await fetchReadme(GITHUB_OWNER, config.repo, token);
				const latestRelease = await fetchLatestRelease(GITHUB_OWNER, config.repo, token);

				const data = await parseData({
					id: repo.name,
					data: {
						title: config.title ?? formatRepoName(repo.name),
						description: config.description ?? repo.description ?? '',
						repo: config.private ? undefined : repo.html_url,
						demo: config.demoUrl ?? (repo.homepage || undefined),
						release: config.releaseUrl ?? latestRelease?.html_url,
						tags: config.tags ?? repo.topics,
						featured: config.featured ?? false,
						sortOrder: config.sortOrder ?? 999,
						canonical: config.canonical,
						closedSource: config.private ?? false,
					},
				});

				store.set({
					id: repo.name,
					data,
					body: readme ?? '',
					rendered: readme
						? await context.renderMarkdown(readme)
						: undefined,
					digest: generateDigest({ pushed_at: repo.pushed_at, private: config.private ?? false }),
				});
			}

			logger.info(`Loaded ${projectRepos.length} projects (${privateCount} private)`);
		},
	};
}
