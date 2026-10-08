// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://margarethamilton.dev',
	// A single page: inlining the CSS saves the round trip that blocks the first paint
	build: { inlineStylesheets: 'always' },
	i18n: {
		locales: ['es', 'en'],
		defaultLocale: 'es',
		routing: { prefixDefaultLocale: false },
	},
	fonts: [
		{
			// A Futura revival: the typeface on the plaque Apollo 11 left on the Moon
			provider: fontProviders.google(),
			name: 'Jost',
			cssVariable: '--font-jost',
			weights: ['300 700'],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			fallbacks: ['Futura', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-plex-mono',
			weights: [400, 500],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
});
