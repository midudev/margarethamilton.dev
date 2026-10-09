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

/** Drives a DSKY rendered by src/components/Dsky.astro */
export function createDsky(root: HTMLElement) {
	// The registers are rewritten on every scroll frame: the cells are looked up once,
	// and only the digits that change touch the DOM
	const fields = new Map<Field, { sign: HTMLElement | null; cells: HTMLElement[] }>();
	$$('[data-field]', root).forEach((el) =>
		fields.set(el.dataset.field as Field, { sign: $('.sign', el), cells: $$('.d:not(.sign)', el) }),
	);
	const lamps = $$('[data-lamp]', root);
	const acty = $('[data-acty]', root);
	let actyTimer = 0;

	const write = (el: HTMLElement, key: 'd' | 's', value: string) => {
		if (el.dataset[key] !== value) el.dataset[key] = value;
	};

	function set(field: Field, value: string) {
		const target = fields.get(field);
		if (!target) return;
		const { sign, cells } = target;
		let digits = value;
		if (sign) {
			write(sign, 's', /^[+-]/.test(value) ? value[0] : '');
			digits = value.replace(/^[+-]/, '');
		}
		const padded = digits.padStart(cells.length, ' ').slice(-cells.length);
		cells.forEach((cell, i) => write(cell, 'd', padded[i]));
	}

	function show(state: DskyState) {
		for (const field of ['prog', 'verb', 'noun', 'r1', 'r2', 'r3'] as const) {
			if (state[field] !== undefined) set(field, state[field]);
		}
		if (state.lamps) {
			lamps.forEach((lamp) => lamp.classList.toggle('is-lit', state.lamps!.includes(lamp.dataset.lamp!)));
		}
	}

	// COMP ACTY only blinks while the DSKY is on screen: the scene leaves it "computing"
	// when the reader scrolls past it
	let working = false;
	let onScreen = false;
	const blink = () => {
		window.clearInterval(actyTimer);
		acty?.classList.remove('is-lit');
		if (!working || !onScreen || reducedMotion) return;
		actyTimer = window.setInterval(() => acty?.classList.toggle('is-lit', Math.random() > 0.45), 90);
	};
	new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting;
		blink();
	}).observe(root);

	/** COMP ACTY blinks while the computer is working */
	function computing(on: boolean) {
		working = on;
		blink();
	}

	/** Presses a sequence of keys, as the astronaut would */
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
