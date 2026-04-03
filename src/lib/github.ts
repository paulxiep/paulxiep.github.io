export interface GitHubRepo {
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	topics: string[];
	default_branch: string;
	pushed_at: string;
}

const repoCache = new Map<string, GitHubRepo>();

function headers(token?: string): HeadersInit {
	const h: HeadersInit = { Accept: 'application/vnd.github+json' };
	if (token) h.Authorization = `Bearer ${token}`;
	return h;
}

export async function fetchRepo(
	owner: string,
	repo: string,
	token?: string,
): Promise<GitHubRepo> {
	const key = `${owner}/${repo}`;
	if (repoCache.has(key)) return repoCache.get(key)!;

	const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
		headers: headers(token),
	});
	if (!res.ok) {
		console.warn(`GitHub API error for ${key}: ${res.status} ${res.statusText}, using fallback`);
		const fallback: GitHubRepo = { name: repo, full_name: key, description: null, html_url: `https://github.com/${key}`, homepage: null, topics: [], default_branch: 'main', pushed_at: '' };
		repoCache.set(key, fallback);
		return fallback;
	}

	const data = (await res.json()) as GitHubRepo;
	repoCache.set(key, data);
	return data;
}

export async function fetchRepos(
	owner: string,
	repoNames: string[],
	token?: string,
): Promise<GitHubRepo[]> {
	return Promise.all(repoNames.map((name) => fetchRepo(owner, name, token)));
}

export async function fetchReadme(
	owner: string,
	repo: string,
	token?: string,
): Promise<string | null> {
	const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
		headers: { ...headers(token), Accept: 'application/vnd.github.raw+json' },
	});
	if (res.status === 404) return null;
	if (!res.ok) {
		console.warn(`GitHub API error fetching README for ${owner}/${repo}: ${res.status}, skipping`);
		return null;
	}

	const markdown = await res.text();
	return rewriteImageUrls(markdown, owner, repo);
}

async function getDefaultBranch(owner: string, repo: string, token?: string): Promise<string> {
	const repoData = await fetchRepo(owner, repo, token);
	return repoData.default_branch;
}

function rewriteImageUrls(markdown: string, owner: string, repo: string): string {
	// Rewrite relative image paths to absolute raw.githubusercontent.com URLs
	// Matches ![alt](path) where path is relative (not starting with http/https//)
	return markdown.replace(
		/!\[([^\]]*)\]\((?!https?:\/\/)(?!\/\/)([^)]+)\)/g,
		(_, alt, path) => {
			const cleanPath = path.replace(/^\.\//, '');
			return `![${alt}](https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${cleanPath})`;
		},
	);
}
