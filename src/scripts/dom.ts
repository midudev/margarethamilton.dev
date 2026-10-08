/** Atajos para document.querySelector / querySelectorAll. `$$` devuelve un array. */
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
	root.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(selector));
