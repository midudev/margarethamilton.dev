// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://margarethamilton.dev',
	i18n: {
		locales: ['es', 'en'],
		defaultLocale: 'es',
		routing: { prefixDefaultLocale: false },
	},
	fonts: [
		{
			// Revival de Futura: la tipografía de la placa que el Apollo 11 dejó en la Luna
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
