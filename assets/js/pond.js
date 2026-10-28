// koi pond
// the following code is a built-on from https://github.com/stackedlol/ascii-sharks
(() => {
    const PX = 3; // how many screen pixels make one "pixel" of the pond

    const rand = (a, b) => a + Math.random() * (b - a);
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)); // keeps an angle between -PI and PI
    const hexToRgb = (hex) => {
        const n = parseInt(hex.trim().slice(1), 16);
        return [n >> 16, (n >> 8) & 255, n & 255];
    };


    // ---------- Koi colours ----------
    const WHITE = [246, 242, 234];
    const RED = [214, 48, 40];
    const BLACK = [30, 29, 33];
    const BLUE = [92, 124, 152];
    const NET = [168, 190, 206];
    const PALE = [206, 218, 226];
    const ORANGE = [224, 98, 50];
    const GREY = [140, 156, 170];
    const GREY_NET = [176, 188, 198];
    const BROWN = [176, 108, 56];

    // A patch is an oval on the koi's body. u runs from head (0) to tail (1), v from one side (-1) to the other (1).
    const patch = (u, v, du, dv) => ({ u, v, du, dv });
    const inside = (list, u, v) => list.some((p) => ((u - p.u) / p.du) ** 2 + ((v - p.v) / p.dv) ** 2 < 1);
    const backPatches = (n) =>
        Array.from({ length: n }, () => patch(rand(0.25, 0.72), rand(-0.3, 0.3), rand(0.1, 0.18), rand(0.5, 0.9)));

    // Scales drawn as a net of lighter lines, for Asagi and Ochiba
    const isNet = (along, across) => {
        const a = Math.floor(along);
        const c = Math.floor(across) + Math.floor(a / 3) * 2;
        return a % 3 === 0 || ((c % 4) + 4) % 4 === 0;
    };


    // ---------- The kinds of koi ----------
    // weight: how often each one turns up in the pond
    const VARIETIES = {
        kohaku: {
            name: 'Kohaku',
            weight: 4,
            fin: WHITE,
            make: (k) => {
                k.red = [patch(rand(0.04, 0.1), rand(-0.15, 0.15), rand(0.07, 0.1), rand(0.6, 0.9)), ...backPatches(Math.floor(rand(1, 4)))];
            },
            colour: (k, u, v) => (u < 0.85 && inside(k.red, u, v) ? RED : WHITE),
        },

        sanke: {
            name: 'Sanke',
            weight: 3,
            fin: WHITE,
            make: (k) => {
                k.red = [patch(rand(0.04, 0.1), rand(-0.15, 0.15), rand(0.07, 0.1), rand(0.6, 0.9)), ...backPatches(Math.floor(rand(1, 3)))];
                k.sumi = Array.from({ length: Math.floor(rand(3, 6)) }, () =>
                    patch(rand(0.3, 0.8), rand(-0.5, 0.5), rand(0.03, 0.05), rand(0.25, 0.35)));
            },
            // The black never goes on the head
            colour: (k, u, v) => {
                if (u > 0.22 && inside(k.sumi, u, v)) return BLACK;
                if (u < 0.85 && inside(k.red, u, v)) return RED;
                return WHITE;
            },
        },

        showa: {
            name: 'Showa',
            weight: 3,
            fin: [44, 42, 46],
            make: (k) => {
                k.red = [patch(0.08, rand(-0.2, 0.2), 0.1, 0.9), ...backPatches(2)];
                k.white = Array.from({ length: 2 }, () => patch(rand(0.3, 0.8), rand(-0.6, 0.6), rand(0.08, 0.12), rand(0.5, 0.7)));
                k.zig = rand(0, 6);
            },
            // Black base that reaches onto the head, with red and white on top
            colour: (k, u, v) => {
                if (u < 0.2 && Math.abs(v - Math.sin(u * 40 + k.zig) * 0.4) < 0.18) return BLACK;
                if (inside(k.white, u, v)) return WHITE;
                if (inside(k.red, u, v)) return RED;
                return BLACK;
            },
        },

        tancho: {
            name: 'Tancho',
            weight: 2,
            fin: WHITE,
            // One red circle on the head, nothing else
            colour: (k, u, v) => (inside([patch(0.1, 0, 0.085, 0.48)], u, v) ? RED : WHITE),
        },

        asagi: {
            name: 'Asagi',
            weight: 1,
            fin: ORANGE,
            colour: (k, u, v, along, across) => {
                if (u < 0.12) return PALE;
                if (Math.abs(v) > 0.7) return ORANGE;
                return isNet(along, across) ? NET : BLUE;
            },
        },

        kumonryu: {
            name: 'Kumonryu',
            weight: 1,
            fin: [44, 42, 46],
            make: (k) => {
                k.s1 = rand(0, 6);
                k.s2 = rand(0, 6);
            },
            // Black and white swirls, like clouds
            colour: (k, u, v, along, across) => {
                const swirl = Math.sin(along * 0.45 + k.s1) + Math.sin(across * 0.9 + along * 0.15 + k.s2);
                return swirl > (u < 0.12 ? 1.2 : 0.4) ? BLACK : WHITE;
            },
        },

        ochiba: {
            name: 'Ochiba',
            weight: 1,
            fin: GREY_NET,
            make: (k) => {
                k.leaves = Array.from({ length: Math.floor(rand(2, 4)) }, () =>
                    patch(rand(0.2, 0.75), rand(-0.4, 0.4), rand(0.1, 0.16), rand(0.6, 1)));
            },
            // Blue-grey with brown patches, like leaves on water
            colour: (k, u, v, along, across) => {
                if (inside(k.leaves, u, v)) return BROWN;
                if (u < 0.12) return GREY_NET;
                return isNet(along, across) ? GREY_NET : GREY;
            },
        },
    };

    const pickVariety = () => {
        const names = Object.keys(VARIETIES);
        let roll = Math.random() * names.reduce((sum, n) => sum + VARIETIES[n].weight, 0);
        return names.find((n) => (roll -= VARIETIES[n].weight) < 0);
    };


    // ---------- Koi ----------
    const SEGMENTS = 10;
    const WIDTH = [0.72, 0.95, 1, 1, 0.92, 0.8, 0.62, 0.45, 0.32, 0.22]; // body width from head to tail

    class Koi {
        constructor(w, h, variety = pickVariety()) {
            this.variety = VARIETIES[variety];
            this.len = rand(30, 38);
            this.radius = this.len * 0.17;
            this.spacing = this.len / (SEGMENTS - 1);
            this.angle = rand(-Math.PI, Math.PI);
            this.turn = 0;
            this.speed = rand(8, 12);
            this.baseSpeed = this.speed;
            this.phase = rand(0, 10);
            if (this.variety.make) this.variety.make(this);

            const x = rand(0, w);
            const y = rand(0, h);
            this.pts = Array.from({ length: SEGMENTS }, (_, i) => ({
                x: x - Math.cos(this.angle) * this.spacing * i,
                y: y - Math.sin(this.angle) * this.spacing * i,
            }));
        }

        steer(target, strength, dt) {
            const diff = wrap(target - this.angle);
            this.angle += Math.max(-1, Math.min(1, diff)) * strength * dt;
        }

        step(dt, world) {
            const head = this.pts[0];

            // Wander
            this.turn += rand(-1, 1) * dt * 2;
            this.turn *= 0.98;
            this.angle += this.turn * dt;
            let wantSpeed = this.baseSpeed;

            // Stay inside the pond
            const margin = Math.min(world.w, world.h) * 0.08;
            if (head.x < margin || head.x > world.w - margin || head.y < margin || head.y > world.h - margin) {
                this.steer(Math.atan2(world.h / 2 - head.y, world.w / 2 - head.x), 2.2, dt);
            }

            // Swim around the text, when there's room to
            const box = world.avoid;
            if (box && head.x > box.left - 12 && head.x < box.right + 12 && head.y > box.top - 12 && head.y < box.bottom + 12) {
                const midX = (box.left + box.right) / 2;
                this.steer(head.x < midX ? Math.PI : 0, 2.5, dt);
            }

            // Chase the nearest food
            const food = world.nearestFood(head);
            if (food && food.dist < 140) {
                this.steer(Math.atan2(food.p.y - head.y, food.p.x - head.x), 3.5, dt);
                wantSpeed = this.baseSpeed * 2;
                if (food.dist < 3.5) world.eat(food.p);
            }

            // Swim away from the mouse
            const m = world.pointer;
            if (m.active) {
                const d = Math.hypot(head.x - m.x, head.y - m.y);
                if (d < 36) {
                    this.steer(Math.atan2(head.y - m.y, head.x - m.x), 5, dt);
                    wantSpeed = this.baseSpeed * 2.6;
                }
            }

            this.speed += (wantSpeed - this.speed) * Math.min(1, dt * 2);
            this.phase += this.speed * dt * 0.7;

            // Move the head, with a little side-to-side swish
            const swish = this.angle + Math.sin(this.phase) * 0.3;
            head.x += Math.cos(swish) * this.speed * dt;
            head.y += Math.sin(swish) * this.speed * dt;

            // The rest of the body follows the head
            for (let i = 1; i < SEGMENTS; i++) {
                const a = this.pts[i - 1];
                const b = this.pts[i];
                const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                b.x = a.x + ((b.x - a.x) / d) * this.spacing;
                b.y = a.y + ((b.y - a.y) / d) * this.spacing;
            }
        }

        // Work out which pixels this koi covers, and their colours
        pixels() {
            const out = [];
            const R = WIDTH.map((w) => w * this.radius);
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const p of this.pts) {
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
            }
            const pad = this.radius + 1;

            for (let py = Math.floor(minY - pad); py <= Math.ceil(maxY + pad); py++) {
                for (let px = Math.floor(minX - pad); px <= Math.ceil(maxX + pad); px++) {
                    const cx = px + 0.5;
                    const cy = py + 0.5;
                    let best = Infinity, u = 0, v = 0, along = 0, across = 0;

                    for (let i = 0; i < SEGMENTS - 1; i++) {
                        const a = this.pts[i];
                        const b = this.pts[i + 1];
                        const abx = b.x - a.x;
                        const aby = b.y - a.y;
                        const s = Math.max(0, Math.min(1, ((cx - a.x) * abx + (cy - a.y) * aby) / (abx * abx + aby * aby || 1)));
                        const qx = a.x + abx * s;
                        const qy = a.y + aby * s;
                        const d = Math.hypot(cx - qx, cy - qy);
                        const r = R[i] + (R[i + 1] - R[i]) * s;
                        if (d - r < best) {
                            best = d - r;
                            u = (i + s) / (SEGMENTS - 1);
                            across = Math.sign(abx * (cy - a.y) - aby * (cx - a.x)) * d;
                            v = across / r;
                            along = (i + s) * this.spacing;
                        }
                    }

                    if (best <= 0) {
                        let [r, g, b] = this.variety.colour(this, u, v, along, across + this.radius);
                        // Darker towards the sides, so the body looks round
                        if (Math.abs(v) > 0.78) {
                            r *= 0.8; g *= 0.8; b *= 0.8;
                        }
                        out.push([px, py, `rgb(${r | 0}, ${g | 0}, ${b | 0})`]);
                    }
                }
            }
            return out;
        }

        // Fins, tail and eyes, as small groups of pixels
        extras() {
            const fins = [];
            const eyes = [];
            const [h, n] = [this.pts[0], this.pts[1]];
            const dir = Math.atan2(h.y - n.y, h.x - n.x);
            const flap = Math.sin(this.phase * 1.3) * 0.5;

            // Side fins
            const f = this.pts[2];
            for (const side of [-1, 1]) {
                const a = dir + side * (2.1 + flap * side);
                const fx = f.x + Math.cos(a) * (this.radius + 1.5);
                const fy = f.y + Math.sin(a) * (this.radius + 1.5);
                for (let y = -1; y <= 1; y++) {
                    for (let x = -1; x <= 1; x++) {
                        if (x * x + y * y <= 2) fins.push([Math.floor(fx + x), Math.floor(fy + y)]);
                    }
                }
            }

            // Tail: lines fanning out from the end of the body
            const t = this.pts[SEGMENTS - 1];
            const t2 = this.pts[SEGMENTS - 2];
            const back = Math.atan2(t.y - t2.y, t.x - t2.x) + Math.sin(this.phase) * 0.35;
            for (const spread of [-0.45, -0.2, 0.2, 0.45]) {
                const a = back + spread;
                for (let i = 0; i <= 6; i++) {
                    fins.push([Math.floor(t.x + Math.cos(a) * i), Math.floor(t.y + Math.sin(a) * i)]);
                }
            }

            // Eyes
            for (const side of [-1, 1]) {
                const a = dir + side * 1.0;
                eyes.push([Math.floor(h.x + Math.cos(a) * this.radius * 0.6), Math.floor(h.y + Math.sin(a) * this.radius * 0.6)]);
            }
            return { fins, eyes };
        }
    }


    // ---------- Drawing one koi ----------
    const fillPixels = (ctx, list, colour, dx = 0, dy = 0) => {
        ctx.fillStyle = colour;
        for (const [x, y] of list) ctx.fillRect(x + dx, y + dy, 1, 1);
    };

    const drawKoi = (ctx, k, light) => {
        const body = k.pixels();
        const { fins, eyes } = k.extras();

        // Shadow under the koi
        const shadow = light ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0.45)';
        fillPixels(ctx, body, shadow, 2, 3);
        fillPixels(ctx, fins, shadow, 2, 3);

        // A faint light edge on the dark theme, so dark koi don't disappear
        if (!light) {
            for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                fillPixels(ctx, body, 'rgba(255, 255, 255, 0.16)', dx, dy);
            }
        }

        fillPixels(ctx, fins, `rgba(${k.variety.fin}, 0.75)`);

        // Body, grouped by colour so the canvas changes colour less often
        const byColour = {};
        for (const [x, y, c] of body) (byColour[c] ||= []).push([x, y]);
        for (const c in byColour) fillPixels(ctx, byColour[c], c);

        fillPixels(ctx, eyes, '#111');
    };

    // Draws one koi of a given kind, head up, onto a small canvas (used on the koi page)
    const drawPreview = (canvas, variety) => {
        const k = new Koi(0, 0, variety);
        k.len = 34;
        k.radius = k.len * 0.17;
        k.spacing = k.len / (SEGMENTS - 1);
        k.phase = 0;
        canvas.width = 26;
        canvas.height = 46;
        k.pts = Array.from({ length: SEGMENTS }, (_, i) => ({ x: 12, y: 4 + i * k.spacing }));
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawKoi(ctx, k, document.body.classList.contains('light-theme'));
    };

    window.KoiArt = { VARIETIES, drawPreview };


    // ---------- The pond ----------
    const canvas = document.createElement('canvas');
    canvas.className = 'pond';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const content = document.querySelector('.page');

    const world = {
        w: 0,
        h: 0,
        koi: [],
        food: [],
        ripples: [],
        avoid: null,
        pointer: { x: 0, y: 0, active: false },

        nearestFood(p) {
            let best = null;
            for (const f of this.food) {
                const dist = Math.hypot(f.x - p.x, f.y - p.y);
                if (!best || dist < best.dist) best = { p: f, dist };
            }
            return best;
        },

        eat(f) {
            this.food = this.food.filter((x) => x !== f);
            this.ripples.push({ x: f.x, y: f.y, age: 0, life: 0.7 });
        },

        feed(x, y) {
            for (let i = 0; i < 3; i++) this.food.push({ x: x + rand(-4, 4), y: y + rand(-4, 4), age: 0 });
            this.ripples.push({ x, y, age: 0, life: 1.4 });
        },

        step(dt) {
            for (const k of this.koi) k.step(dt, this);
            for (const f of this.food) f.age += dt;
            this.food = this.food.filter((f) => f.age < 25);
            for (const r of this.ripples) r.age += dt;
            this.ripples = this.ripples.filter((r) => r.age < r.life);
        },
    };

    // ---------- Lily pads, moon and sun ----------
    // Pads float in the open water left and right of the text.
    // x and y are fractions of the screen, so they stay put when the window resizes.
    const PADS = Array.from({ length: 6 }, (_, i) => ({
        x: i % 2 ? rand(0.82, 0.96) : rand(0.04, 0.18),
        y: rand(0.1, 0.9),
        r: rand(6, 10),               // size
        notch: rand(0, Math.PI * 2),  // where the cut-out wedge points
        spin: rand(-0.05, 0.05),      // slow turning
        bob: rand(0, 10),             // so they don't all drift together
        flower: i < 2,                // the first two get a flower
    }));

    const drawPads = (ctx, w, h, light, t) => {
        const leaf = light ? 'rgb(96, 150, 96)' : 'rgb(46, 88, 60)';
        const rimColour = light ? 'rgb(70, 120, 74)' : 'rgb(32, 64, 44)';
        const veinColour = light ? 'rgb(120, 172, 112)' : 'rgb(62, 108, 74)';
        const shadowColour = light ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.4)';

        for (const p of PADS) {
            // A gentle drift back and forth
            const cx = p.x * w + Math.sin(t * 0.3 + p.bob) * 1.5;
            const cy = p.y * h + Math.cos(t * 0.25 + p.bob);
            const notch = p.notch + t * p.spin;
            const body = [], rim = [], veins = [];
            const R = Math.ceil(p.r);

            for (let py = Math.floor(cy) - R; py <= Math.floor(cy) + R; py++) {
                for (let px = Math.floor(cx) - R; px <= Math.floor(cx) + R; px++) {
                    const dx = px + 0.5 - cx;
                    const dy = py + 0.5 - cy;
                    const d = Math.hypot(dx, dy);
                    if (d > p.r) continue;
                    const a = Math.atan2(dy, dx);
                    if (d > 1 && Math.abs(wrap(a - notch)) < 0.3) continue; // the wedge cut-out
                    if (d > p.r - 1.2) rim.push([px, py]);
                    else if (d > 1.5 && Math.abs(Math.sin((a - notch) * 3)) < 0.15) veins.push([px, py]);
                    else body.push([px, py]);
                }
            }

            fillPixels(ctx, [...body, ...rim, ...veins], shadowColour, 2, 3);
            fillPixels(ctx, body, leaf);
            fillPixels(ctx, veins, veinColour);
            fillPixels(ctx, rim, rimColour);

            // A small water lily, sitting opposite the cut-out
            if (p.flower) {
                const fx = Math.floor(cx + Math.cos(notch + Math.PI) * p.r * 0.4);
                const fy = Math.floor(cy + Math.sin(notch + Math.PI) * p.r * 0.4);
                fillPixels(ctx, [[1, -1], [-1, -1], [1, 1], [-1, 1]].map(([x, y]) => [fx + x, fy + y]), 'rgb(250, 214, 224)');
                fillPixels(ctx, [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([x, y]) => [fx + x, fy + y]), 'rgb(236, 150, 176)');
                fillPixels(ctx, [[fx, fy]], 'rgb(244, 204, 96)');
            }
        }
    };

    // A pixel moon (dark theme only)
    const drawMoon = (ctx, w, h) => {
        const cx = Math.floor(w * 0.88);   // across: 0 is left, 1 is right
        const cy = Math.floor(h * 0.16);   // down: 0 is top, 1 is bottom
        const R = 8;                       // size

        // Soft glow around it
        ctx.fillStyle = 'rgba(255, 214, 120, 0.06)';
        for (let y = -R * 2; y <= R * 2; y++) {
            for (let x = -R * 2; x <= R * 2; x++) {
                if (x * x + y * y < R * R * 4) ctx.fillRect(cx + x, cy + y, 1, 1);
            }
        }

        // The moon
        ctx.fillStyle = 'rgb(255, 224, 140)';
        for (let y = -R; y <= R; y++) {
            for (let x = -R; x <= R; x++) {
                if (x * x + y * y <= R * R) ctx.fillRect(cx + x, cy + y, 1, 1);
            }
        }

        // A few craters
        const craters = [[-3, -2], [-2, -2], [-3, -1], [2, 3], [3, 3], [1, -4]];
        fillPixels(ctx, craters.map(([x, y]) => [cx + x, cy + y]), 'rgb(232, 196, 110)');
    };

    // Where the text is, in pond pixels
    let textBox = null;
    const measureText = () => {
        if (!content) return;
        const r = content.getBoundingClientRect();
        textBox = {
            left: r.left / PX,
            top: Math.max(0, r.top / PX),
            right: r.right / PX,
            bottom: Math.min(world.h, r.bottom / PX),
        };
        // Only steer around the text when it leaves enough open water (not on phones)
        const share = ((textBox.right - textBox.left) * (textBox.bottom - textBox.top)) / (world.w * world.h);
        world.avoid = share < 0.45 ? textBox : null;
    };

    // A pixel sun (light theme only), with slowly turning rays
    const drawSun = (ctx, w, h, t) => {
        const cx = Math.floor(w * 0.88);   // same spot as the moon
        const cy = Math.floor(h * 0.16);
        const R = 6;                       // size

        // Rays
        ctx.fillStyle = 'rgb(250, 196, 90)';
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + t * 0.2;
            for (let d = R + 2; d <= R + 4; d++) {
                ctx.fillRect(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 1, 1);
            }
        }

        // The sun
        ctx.fillStyle = 'rgb(250, 180, 60)';
        for (let y = -R; y <= R; y++) {
            for (let x = -R; x <= R; x++) {
                if (x * x + y * y < R * R) ctx.fillRect(cx + x, cy + y, 1, 1);
            }
        }

        // Reflection: glints on the water below the sun, swaying and fading
        for (let row = 0; row < 10; row++) {
            const y = cy + R + 6 + row * 2;          // starts just below the rays
            const half = R - row * 0.4;              // narrower further down
            const sway = Math.sin(t * 1.5 + row * 0.8) * 1.5;
            const alpha = 0.55 - row * 0.05;         // fainter further down
            ctx.fillStyle = `rgba(250, 180, 60, ${alpha})`;
            for (let x = -Math.ceil(half); x <= Math.ceil(half); x++) {
                if (Math.sin(x * 0.9 + row * 1.7 + t * 2.2) > 0.4) continue; // shimmering gaps
                ctx.fillRect(Math.round(cx + x + sway), y, 1, 1);
            }
        }
    };

    const resize = () => {
        const w = Math.ceil(window.innerWidth / PX);
        const h = Math.ceil(window.innerHeight / PX);
        canvas.width = w;
        canvas.height = h;
        world.w = w;
        world.h = h;

        // More koi on bigger screens
        const count = Math.max(3, Math.min(7, Math.round((window.innerWidth * window.innerHeight) / 80000)));
        while (world.koi.length < count) world.koi.push(new Koi(w, h));
        world.koi.length = count;

        // Bring back any koi left outside after the window shrank
        for (const k of world.koi) {
            if (k.pts[0].x > w || k.pts[0].y > h) k.pts = new Koi(w, h).pts;
        }
        measureText();
        if (still.matches) drawStill();
    };

    const draw = () => {
        const bg = hexToRgb(getComputedStyle(document.body).getPropertyValue('--bg'));
        const light = document.body.classList.contains('light-theme');

        ctx.fillStyle = `rgb(${bg})`;
        ctx.fillRect(0, 0, world.w, world.h);

        // Food
        for (const f of world.food) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(Math.floor(f.x) + 1, Math.floor(f.y) + 1, 1, 1);
            ctx.fillStyle = '#e9c27a';
            ctx.fillRect(Math.floor(f.x), Math.floor(f.y), 1, 1);
        }

        // Sun in light mode, moon in dark mode
        if (light) drawSun(ctx, world.w, world.h, performance.now() / 1000);
        else drawMoon(ctx, world.w, world.h);

        for (const k of world.koi) drawKoi(ctx, k, light);

        // Lily pads on top, so the koi swim under them
        const t = performance.now() / 1000;
        drawPads(ctx, world.w, world.h, light, t);

        // Ripples where food lands or gets eaten
        for (const r of world.ripples) {
            const radius = 1 + r.age * 14;
            const alpha = (1 - r.age / r.life) * 0.5;
            ctx.fillStyle = light ? `rgba(0, 0, 0, ${alpha * 0.5})` : `rgba(255, 250, 240, ${alpha})`;
            const steps = Math.ceil(radius * 6.3);
            for (let i = 0; i < steps; i++) {
                const a = (i / steps) * Math.PI * 2;
                ctx.fillRect(Math.round(r.x + Math.cos(a) * radius), Math.round(r.y + Math.sin(a) * radius), 1, 1);
            }
        }

        // Koi passing under the text fade out, so the words stay easy to read
        if (textBox) {
            ctx.fillStyle = `rgba(${bg}, 0.85)`;
            ctx.fillRect(
                Math.floor(textBox.left),
                Math.floor(textBox.top),
                Math.ceil(textBox.right - textBox.left),
                Math.ceil(textBox.bottom - textBox.top)
            );
        }
    };


    // ---------- Running it ----------
    let last = performance.now();
    let raf = 0;

    const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        measureText();
        world.step(dt);
        draw();
        raf = requestAnimationFrame(frame);
    };

    // For people who turn off animations: let the koi spread out, then show one still picture
    const drawStill = () => {
        for (let i = 0; i < 120; i++) world.step(1 / 30);
        measureText();
        draw();
    };

    const start = () => {
        cancelAnimationFrame(raf);
        if (still.matches) {
            drawStill();
            return;
        }
        if (document.hidden) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    still.addEventListener('change', start);

    // Redraw the still picture when the theme changes or the page scrolls
    window.addEventListener('scroll', () => { if (still.matches) { measureText(); draw(); } }, { passive: true });
    document.addEventListener('click', () => { if (still.matches) setTimeout(draw); });

    // Mouse position, in pond pixels
    window.addEventListener('pointermove', (e) => {
        world.pointer.x = e.clientX / PX;
        world.pointer.y = e.clientY / PX;
        world.pointer.active = e.pointerType !== 'touch';
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
        world.pointer.active = false;
    });

    // Clicking an empty spot drops food. Links, buttons and selected text are left alone.
    window.addEventListener('click', (e) => {
        if (still.matches) return;
        if (e.composedPath().some((n) => n instanceof Element && n.matches('a, button, input'))) return;
        if (window.getSelection().toString()) return;
        world.feed(e.clientX / PX, e.clientY / PX);
    });

    resize();
    start();
})();