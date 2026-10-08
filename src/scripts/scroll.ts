/**
 * Scene engine: each [data-scene] is a tall container with a sticky stage.
 * It computes each scene's scroll progress (0 → 1), exposes it as `--p`,
 * turns texts on ([data-beat="from to"]) at their moment and updates
 * the page's color theme and year according to the active scene.
 * Scenes more than a screen away get `.is-far`, which skips their rendering.
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
	top: number;
	height: number;
	far?: boolean;
}

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** Local progress of `p` within the range [from, to], from 0 to 1 */
export const segment = (p: number, from: number, to: number) => clamp((p - from) / (to - from));

const scenes: Scene[] = $$('[data-scene]').map((el) => ({
	el,
	beats: $$('[data-beat]', el).map((beat) => {
		const [from, to = 1.01] = (beat.dataset.beat ?? '0').split(' ').map(Number);
		return { el: beat, from, to };
	}),
	listeners: [],
	p: -1,
	top: 0,
	height: 0,
}));

// Scene heights only depend on the viewport, so their positions are measured once per resize
// instead of reading the layout on every frame
function measure() {
	for (const scene of scenes) {
		scene.top = scene.el.offsetTop;
		scene.height = scene.el.offsetHeight;
	}
}

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
	const y = window.scrollY;
	let active: Scene | undefined;

	for (const scene of scenes) {
		const top = scene.top - y;
		const bottom = top + scene.height;
		if (top <= vh / 2 && bottom > vh / 2) active = scene;

		const far = bottom < -vh || top > vh * 2;
		if (far !== scene.far) {
			scene.far = far;
			scene.el.classList.toggle('is-far', far);
		}
		if (far) continue;

		const span = scene.height - vh;
		const p = span > 0 ? clamp(-top / span) : top <= 0 ? 1 : 0;
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

/** The theme and year are set by the last text that has already started, or by the scene itself */
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
	measure();
	for (const scene of scenes) scene.p = -1;
	queue();
});
measure();
frame();
root.classList.add('scenes-ready');
