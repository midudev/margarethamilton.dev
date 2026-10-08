export const languages = { es: 'Español', en: 'English' } as const;

export type Lang = keyof typeof languages;

/** Language of the current page, from its path (/ or /en/) */
export const getLang = (astro: { currentLocale?: string }): Lang => (astro.currentLocale === 'en' ? 'en' : 'es');

export const homePath = (lang: Lang) => (lang === 'en' ? '/en/' : '/');

/** Picks the text in the current language: t({ es: '…', en: '…' }) */
export const translator =
	(lang: Lang) =>
	<T,>(copy: Record<Lang, T>): T =>
		copy[lang];
