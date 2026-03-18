/**
 * GIACOMO'S SECRET BONGO CAT GAME
 * Triggered by clicking the portrait 5 times.
 * Uses canvas to draw Giacomo as a Bongo Cat.
 */
(function () {
    "use strict";

    /* ------------------------------------------------
       SECRET UNLOCK LOGIC
    ------------------------------------------------ */
    const portrait = document.getElementById("portrait-trigger");
    const secretCounter = document.getElementById("secret-counter");
    const bongoOverlay = document.getElementById("bongo-overlay");
    const bongoClose   = document.getElementById("bongo-close");

    const CLICKS_NEEDED = 5;
    let secretClicks = 0;
    let secretTimeout;

    portrait.addEventListener("click", (e) => {
        e.stopPropagation();
        secretClicks++;
        secretCounter.textContent = `${secretClicks}/${CLICKS_NEEDED}`;
        secretCounter.classList.add("show");

        clearTimeout(secretTimeout);

        if (secretClicks >= CLICKS_NEEDED) {
            secretClicks = 0;
            secretCounter.classList.remove("show");
            openBongo();
        } else {
            secretTimeout = setTimeout(() => {
                secretClicks = 0;
                secretCounter.classList.remove("show");
            }, 3000);
        }
    });

    function openBongo() {
        bongoOverlay.classList.add("visible");
        resetBongo();
        renderLoop();
    }

    bongoClose.addEventListener("click", () => {
        bongoOverlay.classList.remove("visible");
        cancelAnimationFrame(rafId);
        rafId = null;
    });

    bongoOverlay.addEventListener("click", (e) => {
        if (e.target === bongoOverlay) {
            bongoOverlay.classList.remove("visible");
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    });

    /* ------------------------------------------------
       BONGO STATE
    ------------------------------------------------ */
    let totalClicks  = 0;
    let clicksInWindow = [];
    let leftHit  = false;
    let rightHit = false;
    let lastWhichSide = null; // 'left' or 'right'

    const MILESTONES = {
        10:    "🔥 WARMING UP!",
        50:    "😼 GIACOMO IS FEELING IT",
        100:   "💥 CENTURY OF BONGOS!",
        250:   "🌀 THE PAWS BLUR!",
        500:   "⚡ LEGENDARY TABBY!",
        1000:  "🌌 COSMIC BONGO ENTITY!",
        5000:  "👑 BONGO ASCENSION"
    };

    const RANKS = [
        { min: 0,    rank: "E",  cls: "rank-E" },
        { min: 10,   rank: "D",  cls: "rank-D" },
        { min: 40,   rank: "C",  cls: "rank-C" },
        { min: 80,   rank: "B",  cls: "rank-B" },
        { min: 150,  rank: "A",  cls: "rank-A" },
        { min: 300,  rank: "S",  cls: "rank-S" },
        { min: 600,  rank: "SS", cls: "rank-SS" },
    ];

    const totalEl     = document.getElementById("bongo-total");
    const bpmEl       = document.getElementById("bongo-bpm");
    const rankEl      = document.getElementById("bongo-rank");
    const milestoneEl = document.getElementById("bongo-milestone");
    const bongoCanvas = document.getElementById("bongo-canvas");
    const leftBtn     = document.getElementById("bongo-left");
    const rightBtn    = document.getElementById("bongo-right");

    let rafId = null;

    function resetBongo() {
        totalClicks = 0;
        clicksInWindow = [];
        leftHit = false;
        rightHit = false;
        updateUI();
    }

    /* ------------------------------------------------
       INPUT (buttons + keyboard)
    ------------------------------------------------ */
    leftBtn.addEventListener("click",  () => hit("left"));
    rightBtn.addEventListener("click", () => hit("right"));

    document.addEventListener("keydown", (e) => {
        if (!bongoOverlay.classList.contains("visible")) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") hit("left");
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") hit("right");
        if (e.key === "Escape") {
            bongoOverlay.classList.remove("visible");
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    });

    function hit(side) {
        totalClicks++;
        clicksInWindow.push(Date.now());
        lastWhichSide = side;

        if (side === "left") {
            leftHit = true;
            flashBtn(leftBtn);
            setTimeout(() => { leftHit = false; }, 120);
        } else {
            rightHit = true;
            flashBtn(rightBtn);
            setTimeout(() => { rightHit = false; }, 120);
        }

        // Canvas flash
        bongoCanvas.classList.add("bongo-flash");
        setTimeout(() => bongoCanvas.classList.remove("bongo-flash"), 100);

        // Milestone
        if (MILESTONES[totalClicks]) {
            showMilestone(MILESTONES[totalClicks]);
        }

        updateUI();
    }

    function flashBtn(btn) {
        btn.classList.add("hitting");
        setTimeout(() => btn.classList.remove("hitting"), 130);
    }

    function calcBPS() {
        const now = Date.now();
        clicksInWindow = clicksInWindow.filter(t => now - t < 1000);
        return clicksInWindow.length;
    }

    function getrank(bps) {
        let r = RANKS[0];
        for (const entry of RANKS) {
            if (bps >= entry.min) r = entry;
        }
        return r;
    }

    function updateUI() {
        // Total
        totalEl.textContent = totalClicks;
        totalEl.classList.remove("pop");
        void totalEl.offsetWidth;
        totalEl.classList.add("pop");

        // BPS
        const bps = calcBPS();
        bpmEl.textContent = bps;

        // Rank
        const rankData = getrank(bps);
        rankEl.textContent = rankData.rank;
        rankEl.className = "bongo-stat-value " + rankData.cls;
    }

    function showMilestone(text) {
        milestoneEl.textContent = text;
        milestoneEl.classList.add("show");
        clearTimeout(showMilestone._t);
        showMilestone._t = setTimeout(() => milestoneEl.classList.remove("show"), 3000);
    }

    /* ------------------------------------------------
       CANVAS DRAWING — GIACOMO BONGO CAT
    ------------------------------------------------ */
    const ctx = bongoCanvas.getContext("2d");
    const CW  = bongoCanvas.width;   // 600
    const CH  = bongoCanvas.height;  // 380

    // Animation timing
    let frame = 0;

    function renderLoop() {
        if (!bongoOverlay.classList.contains("visible")) return;
        ctx.clearRect(0, 0, CW, CH);

        drawBackground();
        drawBongos();
        drawCat();
        drawNoteParticles();

        frame++;
        rafId = requestAnimationFrame(renderLoop);
    }

    /* --- Background --- */
    function drawBackground() {
        const grad = ctx.createRadialGradient(CW / 2, CH / 2, 50, CW / 2, CH / 2, 350);
        grad.addColorStop(0, "#0d0d20");
        grad.addColorStop(1, "#050508");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CW, CH);

        // Subtle grid lines
        ctx.strokeStyle = "rgba(255,170,0,0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < CW; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
        }
        for (let y = 0; y < CH; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
        }
    }

    /* --- Bongos (two drums) --- */
    const DRUM_L = { x: 170, y: 270, rx: 70, ry: 30 };
    const DRUM_R = { x: 430, y: 270, rx: 70, ry: 30 };

    function drawDrum(cx, cy, rx, ry, hit) {
        const glow = hit ? 0.9 : 0.0;

        // Drum body
        ctx.beginPath();
        ctx.ellipse(cx, cy + 40, rx, ry + 8, 0, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(cx, cy + 40, 5, cx, cy + 40, rx);
        bodyGrad.addColorStop(0, "#5a3010");
        bodyGrad.addColorStop(1, "#2a1008");
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Drum wood ring
        ctx.beginPath();
        ctx.ellipse(cx, cy + 40, rx, ry + 8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Drum head (top ellipse)
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        const headGrad = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, 2, cx, cy, rx);
        headGrad.addColorStop(0, hit ? "#ffe580" : "#e8d8b0");
        headGrad.addColorStop(1, hit ? "#c8a020" : "#a89060");
        ctx.fillStyle = headGrad;
        ctx.fill();
        ctx.strokeStyle = hit ? "#ffaa00" : "#aaa";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Hit glow
        if (glow > 0) {
            ctx.save();
            ctx.globalAlpha = glow;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx + 10, ry + 5, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 200, 50, 0.35)";
            ctx.fill();
            ctx.restore();
        }

        // Drum bolts (screws around edge)
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const bx = cx + Math.cos(a) * (rx - 4);
            const by = cy + Math.sin(a) * (ry - 2);
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#888";
            ctx.fill();
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function drawBongos() {
        drawDrum(DRUM_L.x, DRUM_L.y, DRUM_L.rx, DRUM_L.ry, leftHit);
        drawDrum(DRUM_R.x, DRUM_R.y, DRUM_R.rx, DRUM_R.ry, rightHit);

        // Connecting bar between drums
        ctx.beginPath();
        ctx.moveTo(DRUM_L.x + DRUM_L.rx - 5, DRUM_L.y + 35);
        ctx.lineTo(DRUM_R.x - DRUM_R.rx + 5, DRUM_R.y + 35);
        ctx.strokeStyle = "#4a2808";
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.strokeStyle = "#7a4020";
        ctx.lineWidth = 6;
        ctx.stroke();
    }

    /* --- Tabby Cat (Giacomo) --- */
    function drawCat() {
        const cx = CW / 2;
        const bodyY = 220;

        // Body
        ctx.beginPath();
        ctx.ellipse(cx, bodyY, 70, 75, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c87832";
        ctx.fill();

        // Tabby stripes on body
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(90, 40, 0, 0.5)";
        ctx.lineWidth = 6;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 15 - 10, bodyY - 80);
            ctx.lineTo(cx + i * 15 + 10, bodyY + 80);
            ctx.stroke();
        }
        ctx.restore();

        // Belly
        ctx.beginPath();
        ctx.ellipse(cx, bodyY + 20, 40, 50, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f0c880";
        ctx.fill();

        // Head
        const headY = bodyY - 80;
        ctx.beginPath();
        ctx.arc(cx, headY, 60, 0, Math.PI * 2);
        ctx.fillStyle = "#d08038";
        ctx.fill();

        // Head tabby stripes
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, headY, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = "rgba(90, 40, 0, 0.4)";
        ctx.lineWidth = 5;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 18, headY - 65);
            ctx.lineTo(cx + i * 14, headY + 10);
            ctx.stroke();
        }
        ctx.restore();

        // Ears (two triangles)
        ["left", "right"].forEach((side, idx) => {
            const ex = cx + (idx === 0 ? -42 : 42);
            ctx.beginPath();
            ctx.moveTo(ex, headY - 45);
            ctx.lineTo(ex + (idx === 0 ? -28 : 28), headY - 90);
            ctx.lineTo(ex + (idx === 0 ? 20 : -20), headY - 30);
            ctx.closePath();
            ctx.fillStyle = "#d08038";
            ctx.fill();
            // Inner ear pink
            ctx.beginPath();
            ctx.moveTo(ex, headY - 47);
            ctx.lineTo(ex + (idx === 0 ? -18 : 18), headY - 78);
            ctx.lineTo(ex + (idx === 0 ? 12 : -12), headY - 36);
            ctx.closePath();
            ctx.fillStyle = "#f4a0a0";
            ctx.fill();
        });

        // Eyes
        [-1, 1].forEach(side => {
            const ex = cx + side * 20;
            const ey = headY - 5;
            ctx.beginPath();
            ctx.arc(ex, ey, 14, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();

            // Iris — glow when hit
            const irisColor = (leftHit || rightHit) ? "#ff8800" : "#f0c040";
            ctx.beginPath();
            ctx.arc(ex, ey, 9, 0, Math.PI * 2);
            ctx.fillStyle = irisColor;
            ctx.fill();

            // Pupil (vertical slit)
            ctx.beginPath();
            ctx.ellipse(ex, ey, 3, 8, 0, 0, Math.PI * 2);
            ctx.fillStyle = "#111";
            ctx.fill();

            // Eye shine
            ctx.beginPath();
            ctx.arc(ex - 3, ey - 4, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fill();
        });

        // Nose
        ctx.beginPath();
        ctx.moveTo(cx, headY + 18);
        ctx.lineTo(cx - 6, headY + 12);
        ctx.lineTo(cx + 6, headY + 12);
        ctx.closePath();
        ctx.fillStyle = "#f48080";
        ctx.fill();

        // Mouth
        ctx.strokeStyle = "#a05040";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, headY + 18);
        ctx.quadraticCurveTo(cx - 12, headY + 28, cx - 18, headY + 24);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, headY + 18);
        ctx.quadraticCurveTo(cx + 12, headY + 28, cx + 18, headY + 24);
        ctx.stroke();

        // Whiskers
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        [-1, 1].forEach(side => {
            for (let w = 0; w < 3; w++) {
                const wy = headY + 14 + w * 8 - 8;
                ctx.beginPath();
                ctx.moveTo(cx + side * 5, wy);
                ctx.lineTo(cx + side * (5 + 55), wy + side * (w - 1) * 3);
                ctx.stroke();
            }
        });

        // Arms / Paws
        drawArms(cx, bodyY);
    }

    function drawArms(cx, bodyY) {
        // Left arm → hitting left drum
        const leftSwung = leftHit;
        const rightSwung = rightHit;

        // Left arm
        const LAX1 = cx - 58, LAY1 = bodyY - 30;
        const LAX2 = DRUM_L.x + 20, LAY2 = DRUM_L.y - (leftSwung ? 0 : 30);
        const LAX3 = DRUM_L.x + 5, LAY3 = DRUM_L.y - (leftSwung ? -5 : 35);

        ctx.save();
        ctx.strokeStyle = "#b06c28";
        ctx.lineWidth = 22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(LAX1, LAY1);
        ctx.quadraticCurveTo(LAX2 - 30, LAY2 - 20, LAX2, LAY2);
        ctx.stroke();

        // Left paw
        ctx.beginPath();
        ctx.arc(LAX3, LAY3, 18, 0, Math.PI * 2);
        ctx.fillStyle = "#c87832";
        ctx.fill();
        ctx.strokeStyle = "#905020";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Paw pads
        ctx.fillStyle = "#f4a0a0";
        ctx.beginPath(); ctx.ellipse(LAX3, LAY3 + 4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(LAX3 - 8, LAY3 - 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(LAX3, LAY3 - 7, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(LAX3 + 8, LAY3 - 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Right arm
        const RAX1 = cx + 58, RAY1 = bodyY - 30;
        const RAX2 = DRUM_R.x - 20, RAY2 = DRUM_R.y - (rightSwung ? 0 : 30);
        const RAX3 = DRUM_R.x - 5, RAY3 = DRUM_R.y - (rightSwung ? -5 : 35);

        ctx.save();
        ctx.strokeStyle = "#b06c28";
        ctx.lineWidth = 22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(RAX1, RAY1);
        ctx.quadraticCurveTo(RAX2 + 30, RAY2 - 20, RAX2, RAY2);
        ctx.stroke();

        // Right paw
        ctx.beginPath();
        ctx.arc(RAX3, RAY3, 18, 0, Math.PI * 2);
        ctx.fillStyle = "#c87832";
        ctx.fill();
        ctx.strokeStyle = "#905020";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Paw pads
        ctx.fillStyle = "#f4a0a0";
        ctx.beginPath(); ctx.ellipse(RAX3, RAY3 + 4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(RAX3 - 8, RAY3 - 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(RAX3, RAY3 - 7, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(RAX3 + 8, RAY3 - 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    /* --- Floating Music Notes --- */
    let noteParticles = [];

    function spawnNote(side) {
        const notes = ["♩", "♪", "♫", "♬", "🎵", "🎶"];
        const x = side === "left" ? DRUM_L.x + (Math.random() - 0.5) * 80
                                  : DRUM_R.x + (Math.random() - 0.5) * 80;
        noteParticles.push({
            x, y: DRUM_L.y - 20,
            vx: (Math.random() - 0.5) * 3,
            vy: -(2 + Math.random() * 3),
            alpha: 1,
            char: notes[Math.floor(Math.random() * notes.length)],
            size: 18 + Math.random() * 14,
            color: `hsl(${40 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)`
        });
    }

    // Hook: spawn note on hit
    const origHit = hit;
    window._bongoHit = function(side) {
        origHit(side);
        for (let i = 0; i < 2; i++) spawnNote(side);
    };
    leftBtn.removeEventListener("click", leftBtn._handler);
    rightBtn.removeEventListener("click", rightBtn._handler);
    // re-bind properly
    leftBtn.onclick  = () => { hit("left");  for(let i=0;i<2;i++) spawnNote("left"); };
    rightBtn.onclick = () => { hit("right"); for(let i=0;i<2;i++) spawnNote("right"); };

    document.addEventListener("keydown", (e) => {
        if (!bongoOverlay.classList.contains("visible")) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { hit("left"); spawnNote("left"); }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { hit("right"); spawnNote("right"); }
    }, { capture: true });

    function drawNoteParticles() {
        noteParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.font = `${p.size}px serif`;
            ctx.fillStyle = p.color;
            ctx.fillText(p.char, p.x, p.y);
        });
        ctx.globalAlpha = 1;
        noteParticles = noteParticles.filter(p => p.alpha > 0);
    }

    /* --- Hint text on canvas --- */
    function drawHint() {
        ctx.fillStyle = "rgba(255,170,0,0.25)";
        ctx.font = "13px 'Space Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("[ A / ← ]  LEFT    RIGHT  [ D / → ]", CW / 2, CH - 10);
        ctx.textAlign = "left";
    }

    // Wrap render to add hint
    const _origRender = renderLoop;
    function renderLoop() {
        if (!bongoOverlay.classList.contains("visible")) return;
        ctx.clearRect(0, 0, CW, CH);
        drawBackground();
        drawBongos();
        drawCat();
        drawNoteParticles();
        drawHint();
        frame++;
        rafId = requestAnimationFrame(renderLoop);
    }

})();
