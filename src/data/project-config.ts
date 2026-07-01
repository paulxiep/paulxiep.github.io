export interface ProjectConfig {
	/** GitHub repo name (not full path, just the repo name under the owner) */
	repo: string;
	/** Sort order for the projects list (lower = first) */
	sortOrder?: number;
	/** Whether to feature this project on the homepage */
	featured?: boolean;
	/** Override the display title (defaults to formatted repo name) */
	title?: string;
	/** Override the description (defaults to GitHub description) */
	description?: string;
	/** Tags (defaults to GitHub topics) */
	tags?: string[];
	/**
	 * Private/closed-source repo — README & metadata are still fetched via the
	 * authenticated GITHUB_TOKEN, but the "View on GitHub" link is hidden and
	 * replaced with a closed-source notice on the project page.
	 */
	private?: boolean;
	/** Override the demo slug used in /demos/ URL */
	demoSlug?: string;
	/** Override the demo iframe URL (defaults to repo homepage) */
	demoUrl?: string;
	/**
	 * Link the demo directly (new tab) instead of embedding it in an iframe page.
	 * Use for apps that can't be framed (auth flows, X-Frame-Options, etc.).
	 */
	externalDemo?: boolean;
	/** Override the release URL (defaults to GitHub's latest release, if any) */
	releaseUrl?: string;
	/** Cross-domain canonical URL (when the project's canonical home lives elsewhere) */
	canonical?: string;
}

/**
 * List of GitHub repos to display as projects.
 * Only repos listed here will appear on the site.
 * Demo pages are auto-created for repos that have a GitHub "homepage" URL set.
 */
export const projectRepos: ProjectConfig[] = [
	{ repo: 'code-rag', sortOrder: 1, featured: true, title: 'Code RAG Chatbot',  demoUrl: 'https://paulxie.com/code-rag/' },
	{ repo: 'cioport', sortOrder: 2, featured: true, title: "CIOport", private: true, demoUrl: 'https://cioport.app', externalDemo: true },
	{ repo: 'pixie-space', sortOrder: 3, featured: true, title: "Pixie Space", private: true, demoUrl: 'https://space.pixiespace.app', externalDemo: true, canonical: 'https://pixiespace.app' },
	{ repo: 'caravan', sortOrder: 4, featured: true, canonical: 'https://paulxlab.com/caravan' },
	{ repo: 'daccord', sortOrder: 5, featured: false, title: "D'accord" },
	{ repo: 'concurrens', sortOrder: 6, featured: false, private: true },
	{ repo: 'cartodex', sortOrder: 7, featured: false },
	{ repo: 'invoice-parse', sortOrder: 8, featured: false, demoUrl: 'https://paulxie.com/invoice-parse/' },
	{ repo: 'quant-trading-gym', sortOrder: 9, featured: false },
	{ repo: 'portfolio', sortOrder: 10, featured: false, title: 'Old Portfolio (2023)' },
	// Add more repos here:
	// { repo: 'another-repo', sortOrder: 2 },
];

/** GitHub owner/org name */
export const GITHUB_OWNER = 'paulxiep';
