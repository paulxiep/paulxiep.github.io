import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const SITE_URL = 'https://paulxie.com';
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personSchema = {
	'@context': 'https://schema.org',
	'@type': 'Person',
	'@id': PERSON_ID,
	name: 'Paul Rachapong Chirarattananon',
	alternateName: ['Paul Xie', 'Paul X'],
	url: SITE_URL,
	jobTitle: 'AIEngineer, Forward Deployed Engineer',
	sameAs: [
		'https://www.linkedin.com/in/paulxiep/',
		'https://github.com/paulxiep',
	],
};

export const websiteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'@id': WEBSITE_ID,
	name: SITE_TITLE,
	description: SITE_DESCRIPTION,
	url: SITE_URL,
	author: { '@id': PERSON_ID },
};

export const authorRef = { '@id': PERSON_ID };

export function blogPostingSchema(opts: {
	url: URL | string;
	title: string;
	description: string;
	datePublished: Date;
	dateModified?: Date;
	image?: URL | string;
	keywords?: string[];
}) {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: opts.title,
		description: opts.description,
		datePublished: opts.datePublished.toISOString(),
		author: authorRef,
		mainEntityOfPage: { '@type': 'WebPage', '@id': String(opts.url) },
	};
	if (opts.dateModified) schema.dateModified = opts.dateModified.toISOString();
	if (opts.image) schema.image = String(opts.image);
	if (opts.keywords && opts.keywords.length > 0) schema.keywords = opts.keywords;
	return schema;
}

export function projectSchema(opts: {
	url: URL | string;
	title: string;
	description: string;
	repo?: string;
	demoUrl?: string;
	image?: URL | string;
	keywords?: string[];
}) {
	const isCode = Boolean(opts.repo);
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': isCode ? 'SoftwareSourceCode' : 'CreativeWork',
		name: opts.title,
		description: opts.description,
		url: String(opts.url),
		author: authorRef,
		creator: authorRef,
	};
	if (opts.repo) schema.codeRepository = opts.repo;
	if (opts.demoUrl) schema.sameAs = [opts.demoUrl];
	if (opts.image) schema.image = String(opts.image);
	if (opts.keywords && opts.keywords.length > 0) schema.keywords = opts.keywords;
	return schema;
}
