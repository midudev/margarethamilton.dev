import { $, $$ } from './dom';
import { reducedMotion } from './scroll';

type Field = 'prog' | 'verb' | 'noun' | 'r1' | 'r2' | 'r3';

export interface DskyState {
	prog?: string;
	verb?: string;
	noun?: string;
	r1?: string;
	r2?: string;
	r3?: string;
	lamps?: string[];
}

/** Controla un DSKY renderizado por src/components/Dsky.astro */
export function createDsky(root: HTMLElement) {
	const fields = new Map<Field, HTMLElement>();
	$$('[data-field]', root).forEach((el) => fields.set(el.dataset.field as Field, el));
	const lamps = $$('[data-lamp]', root);
	const acty = $('[data-acty]', root);
	let actyTimer = 0;

	function set(field: Field, value: string) {
		const el = fields.get(field);
		if (!el) return;
		const sign = $('.sign', el);
		let digits = value;
		if (sign) {
			sign.dataset.s = /^[+-]/.test(value) ? value[0] : '';
			digits = value.replace(/^[+-]/, '');
		}
		const cells = $$('.d:not(.sign)', el);
		const padded = digits.padStart(cells.length, ' ').slice(-cells.length);
		cells.forEach((cell, i) => (cell.dataset.d = padded[i]));
	}

	function show(state: DskyState) {
		for (const field of ['prog', 'verb', 'noun', 'r1', 'r2', 'r3'] as const) {
			if (state[field] !== undefined) set(field, state[field]);
		}
		if (state.lamps) {
			lamps.forEach((lamp) => lamp.classList.toggle('is-lit', state.lamps!.includes(lamp.dataset.lamp!)));
		}
	}

	/** COMP ACTY parpadea mientras el ordenador trabaja */
	function computing(on: boolean) {
		window.clearInterval(actyTimer);
		acty?.classList.remove('is-lit');
		if (!on || reducedMotion) return;
		actyTimer = window.setInterval(() => acty?.classList.toggle('is-lit', Math.random() > 0.45), 90);
	}

	/** Pulsa una secuencia de teclas, como haría el astronauta */
	async function press(sequence: string[], delay = 170) {
		if (reducedMotion) return;
		for (const k of sequence) {
			const key = $(`[data-key="${k}"]`, root);
			key?.classList.add('is-pressed');
			await new Promise((r) => setTimeout(r, delay * 0.6));
			key?.classList.remove('is-pressed');
			await new Promise((r) => setTimeout(r, delay * 0.4));
		}
	}

	return { set, show, computing, press };
}
