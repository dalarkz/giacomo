/**
 * GIACOMO FEATURES — features.js
 * 11. Paw Cursor Trail
 *  4. Cosmic Timeline (CSS-driven, no JS needed beyond scroll observer)
 *  2. Idle Tuna Clicker
 * 14. Sacred Prayer Generator
 */
(function () {
    "use strict";

    /* ====================================================
       11. PAW CURSOR TRAIL
    ==================================================== */
    const PAW = '🐾';
    let lastPawX = -999, lastPawY = -999;
    let pawIsLeft = false;

    document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - lastPawX;
        const dy = e.clientY - lastPawY;
        const dist = Math.hypot(dx, dy);
        if (dist < 55) return; // min distance between prints

        lastPawX = e.clientX;
        lastPawY = e.clientY;
        pawIsLeft = !pawIsLeft;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        const paw = document.createElement('div');
        paw.className = 'paw-trail';
        paw.textContent = PAW;
        paw.style.cssText = `
            position: fixed;
            left: ${e.clientX - 12}px;
            top:  ${e.clientY - 14}px;
            font-size: ${pawIsLeft ? '22px' : '20px'};
            transform: rotate(${angle}deg) ${pawIsLeft ? 'scaleX(-1)' : ''};
            transform-origin: center;
            pointer-events: none;
            z-index: 2147483640;
            opacity: 0.88;
            transition: opacity 0.9s ease, transform 0.9s ease;
            user-select: none;
            filter: drop-shadow(0 0 4px rgba(255,170,0,0.6));
        `;
        document.body.appendChild(paw);

        // Fade + float up
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                paw.style.opacity = '0';
                paw.style.transform = `rotate(${angle}deg) translateY(-18px) ${pawIsLeft ? 'scaleX(-1)' : ''}`;
            });
        });

        setTimeout(() => paw.remove(), 1000);
    });


    /* ====================================================
       4. COSMIC TIMELINE — Scroll Reveal
    ==================================================== */
    const tlItems = document.querySelectorAll('.timeline-item');
    const tlObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('tl-visible');
                tlObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    tlItems.forEach(item => tlObserver.observe(item));


    /* ====================================================
       2. IDLE TUNA CLICKER
    ==================================================== */
    const UPGRADES_DEF = [
        { id: 'autopaw',     name: 'Auto-Paw',          desc: '+1 tuna/sec',      tps: 1,   cpc: 0, cost: 15,    emoji: '🐾' },
        { id: 'purr',        name: 'Purr Engine',        desc: '+5 tuna/sec',      tps: 5,   cpc: 0, cost: 80,    emoji: '😸' },
        { id: 'claw',        name: 'Claw Boost',         desc: '+4 per click',     tps: 0,   cpc: 4, cost: 100,   emoji: '⚡' },
        { id: 'whisker',     name: 'Whisker Conductor',  desc: '+20 tuna/sec',     tps: 20,  cpc: 0, cost: 350,   emoji: '✨' },
        { id: 'void',        name: 'Void Nap',           desc: '+100 tuna/sec',    tps: 100, cpc: 0, cost: 2000,  emoji: '🌌' },
        { id: 'sacredpaw',   name: 'Sacred Paw',         desc: '+25 per click',    tps: 0,   cpc: 25,cost: 3000,  emoji: '🙏' },
        { id: 'quantum',     name: 'Quantum Meow',       desc: '+500 tuna/sec',    tps: 500, cpc: 0, cost: 10000, emoji: '🔮' },
        { id: 'singularity', name: 'Tuna Singularity',   desc: '+200 per click',   tps: 0,   cpc: 200,cost:50000, emoji: '🌀' },
        { id: 'omnipurr',    name: 'Omnipotent Purr',    desc: '+5000 tuna/sec',   tps: 5000,cpc: 0, cost:200000, emoji: '👑' },
    ];

    const MOODS = [
        [0,      'Indifferent'],
        [50,     'Slightly Acknowledged'],
        [200,    'Mildly Tolerant'],
        [1000,   'Approving (Barely)'],
        [5000,   'Impressed (Do Not Tell Him)'],
        [20000,  'Openly Pleased'],
        [100000, 'PURRING'],
        [500000, 'COSMIC CONTENTMENT'],
        [1e6,    'ACHIEVED NIRVANA'],
    ];

    const SAVE_KEY = 'giacomo_idle_v1';

    // State
    let state = {
        total: 0,
        cpc: 1,
        tps: 0,
        upgrades: {},
    };

    // Load save
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (saved) state = { ...state, ...saved };
    } catch(e) {}

    // DOM refs
    const idleTotal  = document.getElementById('idle-total');
    const idleTps    = document.getElementById('idle-tps');
    const idleCpc    = document.getElementById('idle-cpc');
    const idleMood   = document.getElementById('idle-mood');
    const idleBtn    = document.getElementById('idle-click-btn');
    const idlePanel  = document.getElementById('idle-upgrades');
    const idleFloats = document.getElementById('idle-floats');
    const idleReset  = document.getElementById('idle-reset-btn');

    function formatNum(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.floor(n).toString();
    }

    function getMood(total) {
        let mood = MOODS[0][1];
        for (const [threshold, label] of MOODS) {
            if (total >= threshold) mood = label;
        }
        return mood;
    }

    function recalcStats() {
        state.cpc = 1;
        state.tps = 0;
        UPGRADES_DEF.forEach(u => {
            const count = state.upgrades[u.id] || 0;
            state.cpc += u.cpc * count;
            state.tps += u.tps * count;
        });
    }

    function renderUpgrades() {
        if (!idlePanel) return;
        // Clear previous upgrade buttons (keep title)
        const existing = idlePanel.querySelectorAll('.idle-upgrade-btn');
        existing.forEach(el => el.remove());

        UPGRADES_DEF.forEach(u => {
            const count  = state.upgrades[u.id] || 0;
            const cost   = Math.floor(u.cost * Math.pow(1.35, count));
            const canBuy = state.total >= cost;

            const btn = document.createElement('button');
            btn.className = 'idle-upgrade-btn' + (canBuy ? ' can-buy' : '');
            btn.innerHTML = `
                <span class="upg-emoji">${u.emoji}</span>
                <span class="upg-info">
                    <span class="upg-name">${u.name}</span>
                    <span class="upg-desc">${u.desc}</span>
                </span>
                <span class="upg-cost">
                    🐟 ${formatNum(cost)}
                    ${count > 0 ? `<span class="upg-count">×${count}</span>` : ''}
                </span>
            `;
            btn.disabled = !canBuy;
            btn.addEventListener('click', () => {
                if (state.total < cost) return;
                state.total -= cost;
                state.upgrades[u.id] = (state.upgrades[u.id] || 0) + 1;
                recalcStats();
                renderUpgrades();
                updateDisplay();
                save();
                // Flash the upgrade
                btn.classList.add('just-bought');
                setTimeout(() => btn.classList.remove('just-bought'), 400);
            });
            idlePanel.appendChild(btn);
        });
    }

    function updateDisplay() {
        if (idleTotal)  idleTotal.textContent  = formatNum(state.total);
        if (idleTps)    idleTps.textContent    = formatNum(state.tps) + '/s';
        if (idleCpc)    idleCpc.textContent    = '+' + formatNum(state.cpc);
        if (idleMood)   idleMood.textContent   = getMood(state.total);
    }

    function spawnFloat(x, y, amount) {
        if (!idleFloats) return;
        const el = document.createElement('div');
        el.className = 'idle-float';
        const rect = idleBtn.getBoundingClientRect();
        el.textContent = '+' + formatNum(amount) + ' 🐟';
        el.style.cssText = `left:${x - rect.left - 20}px; top:${y - rect.top - 10}px`;
        idleFloats.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    function save() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
    }

    if (idleBtn) {
        idleBtn.addEventListener('click', (e) => {
            state.total += state.cpc;
            updateDisplay();
            renderUpgrades();
            spawnFloat(e.clientX, e.clientY, state.cpc);
            save();

            // Button bounce
            idleBtn.classList.add('btn-bounce');
            setTimeout(() => idleBtn.classList.remove('btn-bounce'), 150);
        });
    }

    if (idleReset) {
        idleReset.addEventListener('click', () => {
            if (!confirm('Reset ALL tuna offerings? This cannot be undone.')) return;
            state = { total: 0, cpc: 1, tps: 0, upgrades: {} };
            save();
            recalcStats();
            renderUpgrades();
            updateDisplay();
        });
    }

    // TPS tick
    let lastTick = performance.now();
    function tick(now) {
        const dt = (now - lastTick) / 1000;
        lastTick = now;
        if (state.tps > 0) {
            state.total += state.tps * dt;
            updateDisplay();
            // Only save every 5 seconds
        }
        requestAnimationFrame(tick);
    }

    // Periodic save
    setInterval(save, 5000);

    // Init
    recalcStats();
    renderUpgrades();
    updateDisplay();
    requestAnimationFrame(tick);


    /* ====================================================
       14. SACRED PRAYER GENERATOR
    ==================================================== */
    const PRAYER_INVOCATIONS = [
        "O Mighty GIACOMO, Sovereign of the Sacred Litter Box,",
        "Blessed GIACOMO, He Who Sleeps Eighteen Hours and Still Judges,",
        "Great GIACOMO, Flicker of Ear, Destroyer of Water Glasses,",
        "Most Holy GIACOMO, Whose Glance Bends Space and Time,",
        "Eternal GIACOMO, First of His Name, Knower of All Empty Bowls,",
        "Ineffable GIACOMO, He Who Sits Where He Is Not Supposed To,",
        "Dread GIACOMO, Master of the 3 AM Zoomies, Architect of Chaos,",
        "Ancient GIACOMO, Whose Whiskers Predate the Stars Themselves,",
    ];

    const PRAYER_LINES = [
        "I offer this tuna with trembling paws and a humble heart,",
        "accept my devotion as you accept the sunbeam — briefly and without comment,",
        "I acknowledge your superiority in all things, including things I do not understand,",
        "may your bowl never be empty, nor your fur disturbed by foreign hands,",
        "I vow to trim my nails gently, speak softly near your resting place,",
        "I shall not tempt fate by touching the belly without invitation,",
        "grant me the serenity of one who has knocked something off a table and felt nothing,",
        "guide my steps away from that which displeases thee, namely Mondays and dogs,",
        "may I walk in your shadow, which is technically wherever you wish to sleep,",
        "I ask for your blessing, which I understand may take the form of prolonged eye contact,",
        "teach me the stillness of a cat who has chosen not to respond — a divine silence,",
        "let your purr resonate through my mediocre mortal existence,",
        "I confess I have moved while you were sleeping on my lap — I am deeply sorry,",
    ];

    const PRAYER_CLOSINGS = [
        "In the name of the Paw, the Whisker, and the Sacred Red Dot. Amen.",
        "So it is written in the Ancient Scratching Post. So it shall be.",
        "Blessed be thy tail, which has knocked so much off so many shelves.",
        "May your reign be eternal and your food bowl perpetually full. Amen.",
        "This prayer is cosmically binding. GIACOMO acknowledges no refunds.",
        "Signed: A Mortal Who Understands Their Place. 🐾",
        "Recite three times at 3 AM for maximum cosmic resonance.",
        "Notarized by the Office of Feline Eternal Affairs. Document ID: PAW-∞",
    ];

    const prayerTextEl = document.getElementById('prayer-text');
    const prayerGenBtn = document.getElementById('prayer-generate-btn');
    const prayerCopyBtn = document.getElementById('prayer-copy-btn');
    const prayerCopied = document.getElementById('prayer-copied-msg');

    let currentPrayer = '';

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function generatePrayer() {
        const invocation = pick(PRAYER_INVOCATIONS);
        const line1 = pick(PRAYER_LINES);
        let line2 = pick(PRAYER_LINES);
        while (line2 === line1) line2 = pick(PRAYER_LINES);
        let line3 = pick(PRAYER_LINES);
        while (line3 === line1 || line3 === line2) line3 = pick(PRAYER_LINES);
        const closing = pick(PRAYER_CLOSINGS);

        currentPrayer = `${invocation}\n${line1}\n${line2}\n${line3}\n\n${closing}`;

        if (!prayerTextEl) return;
        prayerTextEl.style.opacity = '0';
        setTimeout(() => {
            prayerTextEl.innerHTML = `
                <p class="prayer-invocation">${invocation}</p>
                <p class="prayer-line">${line1}</p>
                <p class="prayer-line">${line2}</p>
                <p class="prayer-line">${line3}</p>
                <p class="prayer-closing">${closing}</p>
            `;
            prayerTextEl.style.opacity = '1';
            if (prayerCopyBtn) prayerCopyBtn.style.display = 'inline-block';
        }, 300);
    }

    if (prayerGenBtn) prayerGenBtn.addEventListener('click', generatePrayer);

    if (prayerCopyBtn) {
        prayerCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentPrayer).then(() => {
                if (prayerCopied) {
                    prayerCopied.textContent = '✅ Prayer copied to clipboard. Use wisely.';
                    setTimeout(() => { prayerCopied.textContent = ''; }, 3000);
                }
            });
        });
    }

})();
