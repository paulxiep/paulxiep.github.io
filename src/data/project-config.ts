export interface ProjectConfig {
	/** GitHub repo name (not full path, just the repo name under the owner) */
	repo: string;
	/** Sort order for the projects list (lower = first) */
	sortOrder?: number;
	/** Whether to feature this project on the homepage */
	featured?: boolean;
	/** Override the display title (defaults to formatted repo name) */
	title?: string;
	/** Override the description (required for private repos) */
	description?: string;
	/** Tags (required for private repos, otherwise pulled from GitHub topics) */
	tags?: string[];
	/** Private repo — skips GitHub API, hides repo link, uses local metadata only */
	private?: boolean;
	/** Override the demo slug used in /demos/ URL */
	demoSlug?: string;
	/** Override the demo iframe URL (defaults to repo homepage) */
	demoUrl?: string;
	/** Override the release URL (defaults to GitHub's latest release, if any) */
	releaseUrl?: string;
}

/**
 * List of GitHub repos to display as projects.
 * Only repos listed here will appear on the site.
 * Demo pages are auto-created for repos that have a GitHub "homepage" URL set.
 */
export const projectRepos: ProjectConfig[] = [
	{ repo: 'code-rag', sortOrder: 1, featured: true, title: 'Code RAG Chatbot',  demoUrl: 'https://paulxie.com/code-rag/' },
	{ repo: 'quant-trading-gym', sortOrder: 2, featured: true },
	{ repo: 'invoice-parse', sortOrder: 3, featured: false, demoUrl: 'https://paulxie.com/invoice-parse/' },
	{ repo: 'portfolio', sortOrder: 4, featured: false, title: 'Old Portfolio (2023)' },
	// Add more repos here:
	// { repo: 'another-repo', sortOrder: 2 },
];

/** GitHub owner/org name */
export const GITHUB_OWNER = 'paulxiep';
