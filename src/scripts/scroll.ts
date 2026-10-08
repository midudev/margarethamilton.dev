/**
 * Motor de escenas: cada [data-scene] es un contenedor alto con un escenario sticky.
 * Calcula el progreso del scroll (0 → 1) de cada escena, lo expone como `--p`,
 * enciende los textos ([data-beat="desde hasta"]) en su momento y actualiza
 * el tema de color y el año de la página según la escena activa.
 */

import { $, $$ } from './dom';

type Listener = (p: number) => void;

interface Beat {
	el: HTMLElement;
	from: number;
	to: number;
}

interface Scene {
	el: HTMLElement;
	beats: Beat[];
	listeners: Listener[];
	p: number;
}

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** Progreso local de `p` dentro del tramo [from, to], de 0 a 1 */
export const segment = (p: number, from: number, to: number) => clamp((p - from) / (to - from));

const scenes: Scene[] = $$('[data-scene]').map((el) => ({
	el,
	beats: $$('[data-beat]', el).map((beat) => {
		const [from, to = 1.01] = (beat.dataset.beat ?? '0').split(' ').map(Number);
		return { el: beat, from, to };
	}),
	listeners: [],
	p: -1,
}));

const root = document.documentElement;
const yearEl = $('[data-year-display]');
let shownYear = Number(yearEl?.textContent) || 1936;
let targetYear = shownYear;
let yearRaf = 0;
let scheduled = false;

export function onProgress(sceneEl: HTMLElement, fn: Listener) {
	const scene = scenes.find((s) => s.el === sceneEl);
	if (!scene) return;
	scene.listeners.push(fn);
	scene.p = -1;
	queue();
}

function queue() {
	if (scheduled) return;
	scheduled = true;
	requestAnimationFrame(frame);
}

function frame() {
	scheduled = false;
	const vh = window.innerHeight;
	let active: Scene | undefined;

	for (const scene of scenes) {
		const r = scene.el.getBoundingClientRect();
		if (r.top <= vh / 2 && r.bottom > vh / 2) active = scene;
		if (r.bottom < -vh || r.top > vh * 2) continue;

		const span = r.height - vh;
		const p = span > 0 ? clamp(-r.top / span) : r.top <= 0 ? 1 : 0;
		if (p === scene.p) continue;
		scene.p = p;

		scene.el.style.setProperty('--p', p.toFixed(4));
		for (const beat of scene.beats) {
			beat.el.classList.toggle('is-on', p >= beat.from && p < beat.to);
		}
		for (const fn of scene.listeners) fn(p);
	}

	if (active) applyChrome(active);
}

/** El tema y el año los marca el último texto que ya ha empezado, o la propia escena */
function applyChrome(scene: Scene) {
	let theme = scene.el.dataset.theme;
	let year = scene.el.dataset.year;
	for (const beat of scene.beats) {
		if (scene.p < beat.from) continue;
		theme = beat.el.dataset.theme ?? theme;
		year = beat.el.dataset.year ?? year;
	}
	if (theme && root.dataset.theme !== theme) root.dataset.theme = theme;
	if (year) setYear(Number(year));
}

function setYear(year: number) {
	if (!yearEl || year === targetYear) return;
	targetYear = year;
	if (reducedMotion) {
		shownYear = year;
		yearEl.textContent = String(year);
		return;
	}
	cancelAnimationFrame(yearRaf);
	const step = () => {
		const diff = targetYear - shownYear;
		if (diff === 0) return;
		shownYear += Math.sign(diff) * Math.max(1, Math.round(Math.abs(diff) / 6));
		yearEl.textContent = String(shownYear);
		yearRaf = requestAnimationFrame(step);
	};
	step();
}

window.addEventListener('scroll', queue, { passive: true });
window.addEventListener('resize', () => {
	for (const scene of scenes) scene.p = -1;
	queue();
});
queue();
