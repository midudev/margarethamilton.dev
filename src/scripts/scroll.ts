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
	/** Already rendered once, so coming near again only costs an update */
	warm?: boolean;
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

// Stages are 100lvh tall: on mobile, window.innerHeight changes while the browser toolbars
// hide or show, but this height doesn't, so the sticky travel and the progress stay put
const probe = document.createElement('div');
probe.style.cssText = 'position:fixed;top:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
document.body.append(probe);
let vh = 0;
let vw = 0;

/** Height of a stage: the viewport with the mobile toolbars hidden */
export const viewportHeight = () => vh;

// Scene heights only depend on the viewport, so their positions are measured once per resize
// instead of reading the layout on every frame
function measure() {
	vh = probe.offsetHeight;
	vw = window.innerWidth;
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
		scene.warm = true;

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
	for (const fn of frameListeners) fn(y);
}

const frameListeners: ((y: number) => void)[] = [];

/** Runs `fn` on every frame the page moves, with the scroll position read before any write */
export function onFrame(fn: (y: number) => void) {
	frameListeners.push(fn);
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

const resizeListeners: (() => void)[] = [];

/** Runs `fn` when the layout viewport really changes, not when the mobile toolbars hide or show */
export function onResize(fn: () => void) {
	resizeListeners.push(fn);
}

// The first time a scene renders, its whole subtree is styled and laid out from scratch: tens of
// milliseconds on a phone, all in the frame it comes within reach. Done ahead of time while the
// page is idle, one scene per idle period and the nearest first, it later only costs an update
let lastScroll = 0;
const idle = (fn: () => void) =>
	window.requestIdleCallback
		? window.requestIdleCallback(fn, { timeout: 4000 })
		: window.setTimeout(() => (performance.now() - lastScroll < 300 ? idle(fn) : fn()), 300);

function warm() {
	const y = window.scrollY;
	const cold = scenes.filter((scene) => !scene.warm);
	if (!cold.length) return;
	const scene = cold.reduce((a, b) => (Math.abs(b.top - y) < Math.abs(a.top - y) ? b : a));
	scene.warm = true;
	scene.el.classList.remove('is-far');
	scene.el.lastElementChild?.getBoundingClientRect();
	scene.el.classList.add('is-far');
	idle(warm);
}

window.addEventListener('scroll', () => ((lastScroll = performance.now()), queue()), { passive: true });
window.addEventListener('resize', () => {
	if (window.innerWidth === vw && probe.offsetHeight === vh) return;
	measure();
	for (const scene of scenes) scene.p = -1;
	queue();
	for (const fn of resizeListeners) fn();
});
measure();
frame();
root.classList.add('scenes-ready');
if (document.readyState === 'complete') idle(warm);
else window.addEventListener('load', () => idle(warm), { once: true });
