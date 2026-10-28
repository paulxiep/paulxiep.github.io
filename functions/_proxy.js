/**
 * Shared reverse-proxy helper for Cloudflare Pages Functions.
 *
 * Serves a subtree of paulxie.com (e.g. /code-rag/*) by fetching the same
 * path from a GitHub Pages origin. Keeps the demo hosted on GitHub while
 * routing all traffic through Cloudflare (so it's tracked) and staying
 * same-origin under paulxie.com (so the demos' OAuth origins don't change).
 *
 * Files prefixed with "_" are treated as modules, not routes.
 */
export function proxyTo(originBase) {
	return async ({ request }) => {
		const url = new URL(request.url);
		const target = originBase + url.pathname + url.search;
		const headers = new Headers(request.headers);
		headers.delete('host'); // let fetch set Host to the github.io origin
		const init = { method: request.method, headers, redirect: 'follow' };
		if (!['GET', 'HEAD'].includes(request.method)) {
			init.body = request.body;
		}
		const resp = await fetch(target, init);
		return new Response(resp.body, resp);
	};
}
