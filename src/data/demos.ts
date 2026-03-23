export interface Demo {
	slug: string;
	title: string;
	description?: string;
	image?: string;
	url?: string;
}

export const demos: Demo[] = [
	{
		slug: "invoice-parse",
		title: "Invoice Parser",
		description: "Upload an invoice (PDF or image). OCR runs in your browser via PaddleOCR, then Gemini extracts structured data. Download the result as Excel.",
	},
	// url defaults to https://paulxiep.github.io/<slug>
	// override with: { slug: "other", title: "Other", url: "https://custom.url" }
];

export function getDemoUrl(demo: Demo): string {
	return demo.url ?? `https://paulxiep.github.io/${demo.slug}`;
}
