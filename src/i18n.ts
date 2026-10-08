export const languages = { es: 'Español', en: 'English' } as const;

export type Lang = keyof typeof languages;

/** Idioma de la página actual, a partir de la ruta (/ o /en/) */
export const getLang = (astro: { currentLocale?: string }): Lang => (astro.currentLocale === 'en' ? 'en' : 'es');

export const homePath = (lang: Lang) => (lang === 'en' ? '/en/' : '/');

/** Elige el texto del idioma actual: t({ es: '…', en: '…' }) */
export const translator =
	(lang: Lang) =>
	<T,>(copy: Record<Lang, T>): T =>
		copy[lang];
