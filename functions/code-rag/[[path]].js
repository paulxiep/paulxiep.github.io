import { proxyTo } from '../_proxy.js';

// Serve paulxie.com/code-rag/* by proxying to the GitHub Pages project repo.
export const onRequest = proxyTo('https://paulxiep.github.io');
