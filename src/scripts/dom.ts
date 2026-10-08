/** Shortcuts for document.querySelector / querySelectorAll. `$$` returns an array. */
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
	root.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(selector));
