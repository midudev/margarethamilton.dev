import { $, $$ } from './dom';

/**
 * Starry sky whose stars turn into letters.
 *
 * Scatters candidate stars across the photo's sky (without covering the Earth or dropping
 * below the horizon), assigns each letter its nearest star with an optimal
 * matching (so the paths don't cross) and paints the rest on a background canvas.
 */

interface Star {
	x: number;
	y: number;
	b: number;
	tint: string;
}

// Position of the Earth and the horizon in photo AS11-44-6550 (square), as fractions of its side
const EARTH = { cx: 0.504, cy: 0.355, r: 0.0735, horizon: 0.444 };
// object-position of the photo in the scenes: 50% 40%
const PHOTO_POSITION = { x: 0.5, y: 0.4 };
const TINTS = ['255 255 255', '255 255 255', '210 226 255', '255 240 218', '228 236 255'];

function random(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Hungarian algorithm: for each row (letter), the column (star) that minimizes the total cost */
function assign(cost: number[][]): number[] {
	const n = cost.length;
	const m = cost[0].length;
	const u = new Float64Array(n + 1);
	const v = new Float64Array(m + 1);
	const p = new Int32Array(m + 1);
	const way = new Int32Array(m + 1);

	for (let i = 1; i <= n; i++) {
		p[0] = i;
		let j0 = 0;
		const minv = new Float64Array(m + 1).fill(Infinity);
		const used = new Uint8Array(m + 1);
		do {
			used[j0] = 1;
			const i0 = p[j0];
			let delta = Infinity;
			let j1 = 0;
			for (let j = 1; j <= m; j++) {
				if (used[j]) continue;
				const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
				if (cur < minv[j]) {
					minv[j] = cur;
					way[j] = j0;
				}
				if (minv[j] < delta) {
					delta = minv[j];
					j1 = j;
				}
			}
			for (let j = 0; j <= m; j++) {
				if (used[j]) {
					u[p[j]] += delta;
					v[j] -= delta;
				} else {
					minv[j] -= delta;
				}
			}
			j0 = j1;
		} while (p[j0] !== 0);
		do {
			const j1 = way[j0];
			p[j0] = p[j1];
			j0 = j1;
		} while (j0);
	}

	const match = new Array<number>(n);
	for (let j = 1; j <= m; j++) if (p[j]) match[p[j] - 1] = j - 1;
	return match;
}

function draw(canvas: HTMLCanvasElement, width: number, height: number, stars: Star[]) {
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	const ctx = canvas.getContext('2d')!;
	ctx.scale(dpr, dpr);
	for (const { x, y, b, tint } of stars) {
		const r = 0.35 + b * 1.05;
		if (b > 0.7) {
			const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
			glow.addColorStop(0, `rgb(${tint} / ${0.35 * b})`);
			glow.addColorStop(1, `rgb(${tint} / 0)`);
			ctx.fillStyle = glow;
			ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
		}
		ctx.fillStyle = `rgb(${tint} / ${0.18 + b * 0.8})`;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}
}

/**
 * `region`: vertical band (0–1) where the stars that form letters can be.
 * `photo`: if the Earth-over-the-Moon photo is behind, the Earth and the lunar ground are avoided.
 */
export function starfield(stage: HTMLElement, { seed = 1969, region = [0.03, 0.45], photo = false } = {}) {
	const sky = $('[data-sky]', stage)!;
	const canvas = $<HTMLCanvasElement>('[data-starfield]', stage);
	const letters = $$('.l', sky);

	const place = () => {
		const rand = random(seed);
		const { width, height } = stage.getBoundingClientRect();
		const top = height * region[0];
		let bottom = height * region[1];
		let earth: { x: number; y: number; r: number } | undefined;

		if (photo) {
			// The photo is square and cropped with object-fit: cover
			const side = Math.max(width, height);
			const ox = (width - side) * PHOTO_POSITION.x;
			const oy = (height - side) * PHOTO_POSITION.y;
			const horizon = oy + EARTH.horizon * side;
			earth = { x: ox + EARTH.cx * side, y: oy + EARTH.cy * side, r: EARTH.r * side * 1.3 };
			bottom = Math.min(bottom, horizon - 14);
			stage.style.setProperty('--horizon', `${Math.round(horizon)}px`);
		}

		const visible = (x: number, y: number) => !earth || Math.hypot(x - earth.x, y - earth.y) > earth.r;
		const star = (x: number, y: number): Star => ({
			x,
			y,
			b: rand() ** 2.2,
			tint: TINTS[Math.floor(rand() * TINTS.length)],
		});

		// Candidates for the letters: three times as many as letters, scattered across the sky
		const candidates: Star[] = [];
		for (let tries = 0; candidates.length < letters.length * 3 && tries < 5000; tries++) {
			const x = width * (0.02 + rand() * 0.96);
			const y = top + rand() * (bottom - top);
			if (visible(x, y)) candidates.push(star(x, y));
		}

		const targets = letters.map((l) => ({ x: l.offsetLeft + l.offsetWidth / 2, y: l.offsetTop + l.offsetHeight * 0.55 }));
		const match = assign(targets.map((t) => candidates.map((c) => Math.hypot(c.x - t.x, c.y - t.y))));

		letters.forEach((letter, i) => {
			const c = candidates[match[i]];
			const dx = c.x - targets[i].x;
			const dy = c.y - targets[i].y;
			// A slight curve, always to the same side, so the paths don't cross
			const bend = 0.12;
			letter.style.setProperty('--dx', `${dx.toFixed(1)}px`);
			letter.style.setProperty('--dy', `${dy.toFixed(1)}px`);
			letter.style.setProperty('--ax', `${(-dy * bend).toFixed(1)}px`);
			letter.style.setProperty('--ay', `${(dx * bend).toFixed(1)}px`);
			letter.style.setProperty('--mag', (0.35 + 0.65 * c.b).toFixed(2));
			letter.style.setProperty('--tint', c.tint);
		});

		if (canvas) {
			const used = new Set(match);
			const field = candidates.filter((_, i) => !used.has(i));
			const dust = Math.round((width * height) / 2400);
			for (let i = 0; i < dust; i++) {
				const x = rand() * width;
				const y = rand() * height;
				if (visible(x, y)) field.push({ ...star(x, y), b: rand() ** 4 });
			}
			draw(canvas, width, height, field);
		}

		sky.classList.add('is-placed');
	};

	place();
	document.fonts?.ready.then(place);
	let resizeTimer = 0;
	window.addEventListener('resize', () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(place, 150);
	});
}
