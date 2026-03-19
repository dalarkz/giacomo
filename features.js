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


    /* ====================================================
       HOROSCOPE DE GIACOMO
    ==================================================== */
    const SIGNS = [
        { name:'BÉLIER',    emoji:'♈', date:'21 Mar – 19 Avr', el:'Feu',  planet:'Chaos' },
        { name:'TAUREAU',   emoji:'♉', date:'20 Avr – 20 Mai', el:'Terre', planet:'Tuna' },
        { name:'GÉMEAUX',   emoji:'♊', date:'21 Mai – 20 Jun', el:'Air',   planet:'Laser' },
        { name:'CANCER',    emoji:'♋', date:'21 Jun – 22 Jul', el:'Eau',  planet:'Boîte' },
        { name:'LION',      emoji:'♌', date:'23 Jul – 22 Aoû', el:'Feu',  planet:'Soleil' },
        { name:'VIERGE',    emoji:'♍', date:'23 Aoû – 22 Sep', el:'Terre', planet:'Litière' },
        { name:'BALANCE',   emoji:'♎', date:'23 Sep – 22 Oct', el:'Air',   planet:'Bol' },
        { name:'SCORPION',  emoji:'♏', date:'23 Oct – 21 Nov', el:'Eau',  planet:'Ombre' },
        { name:'SAGITTAIRE',emoji:'♐', date:'22 Nov – 21 Déc', el:'Feu',  planet:'Comète' },
        { name:'CAPRICORNE',emoji:'♑', date:'22 Déc – 19 Jan', el:'Terre', planet:'Griffes' },
        { name:'VERSEAU',   emoji:'♒', date:'20 Jan – 18 Fév', el:'Air',   planet:'Vide' },
        { name:'POISSONS',  emoji:'♓', date:'19 Fév – 20 Mar', el:'Eau',  planet:'Thon' },
    ];

    const HORO_TEXTS = [
        "Les astres s'alignent en votre faveur. Giacomo a daigné tourner la tête dans votre direction. Profitez de cette rareté cosmique avant qu'il ne se rendorme.",
        "Mercure est rétrograde. Giacomo est catrograde, ce qui est pire. Évitez les décisions importantes, les chiens, et tout ce qui grince.",
        "Une opportunité se présente. Giacomo l'a déjà évaluée et jugée insuffisamment tunaesque. Mais vous, allez-y, faites ce qu'il faut.",
        "Votre énergie est en hausse. Malheureusement, Giacomo dort sur la prise de courant de l'univers. Attendez qu'il bouge.",
        "Les forces du vide vous observent. C'est Giacomo. Il juge votre posture. Redressez-vous.",
        "Une période de transformation s'amorce. Giacomo appelle ça 'changer de canapé'. Les effets sont cosmiquement équivalents.",
        "La lune de Giacomo est en phase de grattage de dossier. Vos projets créatifs avanceront si vous offrez du thon premium.",
        "Les étoiles forment la forme d'un bol vide. C'est un avertissement direct. Remplissez-le avant la tombée de la nuit.",
        "Votre charme est au maximum. Giacomo l'ignore, mais les autres mortels le perçoivent. C'est déjà bien.",
        "Un voyage inattendu vous attend. Giacomo y sera déjà, invisible, à juger la qualité de vos bagages.",
        "La sagesse ancienne dit : restez calme. Giacomo, lui, dit rien. Il pousse votre verre du bord. Message reçu.",
        "Une rencontre importante approche. Elle sera moins importante que Giacomo, mais plus importante que tout le reste.",
        "L'univers conspire en votre faveur. Giacomo n'est pas impliqué. Il conspirait mais il s'est endormi à mi-chemin.",
        "Vos intuitions sont fiables aujourd'hui. Giacomo aussi l'a senti — il a fait demi-tour à la porte sans raison. C'est un signe.",
        "Le chaos est votre allié ce jour. Giacomo approuve. Le chaos constructif est la seule philosophie valide.",
    ];

    const LUCKY_ITEMS = ['Thon', 'Laser rouge', '3h du matin', 'Griffes aiguisées', 'Sieste cosmique', 'Ronronnement', 'Boîte en carton', 'Fenêtre ouverte', 'Couverture chaude', 'Chaos organisé'];
    const LUCKY_COLORS = ['Noir profond', 'Or cosmique', 'Pourpre astral', 'Rouge feu', 'Vert vide', 'Blanc stellaire', 'Ambre félin'];
    const LUCKY_NUMS   = [3, 7, 9, 13, 42, 99, 666, 1337, 9999];

    function seededRand(seed, max) {
        const x = Math.sin(seed + 1) * 10000;
        return Math.floor((x - Math.floor(x)) * max);
    }

    function getStars(seed) {
        const n = (seededRand(seed, 3) + 3); // 3 to 5
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function showHoroscope(signIdx) {
        const sign = SIGNS[signIdx];
        const today = new Date();
        // Seed = sign + day of year, so each sign gets different text each day
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const seed = signIdx * 31 + dayOfYear;

        const text  = HORO_TEXTS[seededRand(seed, HORO_TEXTS.length)];
        const item  = LUCKY_ITEMS[seededRand(seed + 1, LUCKY_ITEMS.length)];
        const color = LUCKY_COLORS[seededRand(seed + 2, LUCKY_COLORS.length)];
        const num   = LUCKY_NUMS[seededRand(seed + 3, LUCKY_NUMS.length)];
        const stars = getStars(seed);

        document.querySelectorAll('.horoscope-sign-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.horoscope-sign-btn')[signIdx].classList.add('active');

        const resultEl = document.getElementById('horoscope-result');
        resultEl.style.display = 'none';
        requestAnimationFrame(() => {
            document.getElementById('horoscope-result-sign').textContent = sign.emoji;
            document.getElementById('horoscope-result-name').textContent = sign.name + ' — ' + sign.date;
            document.getElementById('horoscope-stars').innerHTML =
                `<span style="color:var(--primary)">${stars}</span>`;
            document.getElementById('horoscope-text').textContent = `"${text}"`;
            document.getElementById('horoscope-lucky').innerHTML = `
                <div class="horo-lucky-item"><span class="horo-lucky-label">🍀 CHANCEUX</span><span class="horo-lucky-val">${item}</span></div>
                <div class="horo-lucky-item"><span class="horo-lucky-label">🎨 COULEUR</span><span class="horo-lucky-val">${color}</span></div>
                <div class="horo-lucky-item"><span class="horo-lucky-label">🔢 NOMBRE</span><span class="horo-lucky-val">${num}</span></div>
                <div class="horo-lucky-item"><span class="horo-lucky-label">🪐 PLANÈTE</span><span class="horo-lucky-val">${sign.planet}</span></div>
            `;
            resultEl.style.display = 'block';
        });
    }

    // Build sign buttons
    const signsContainer = document.getElementById('horoscope-signs');
    if (signsContainer) {
        SIGNS.forEach((sign, i) => {
            const btn = document.createElement('button');
            btn.className = 'horoscope-sign-btn';
            btn.innerHTML = `<span class="sign-emoji">${sign.emoji}</span><span>${sign.name}</span>`;
            btn.addEventListener('click', () => showHoroscope(i));
            signsContainer.appendChild(btn);
        });
        // Auto-show today's matching sign (roughly based on current date)
        const m = new Date().getMonth() + 1;
        const d = new Date().getDate();
        const autoIdx = [
            [3,21],[4,20],[5,21],[6,21],[7,23],[8,23],
            [9,23],[10,23],[11,22],[12,22],[1,20],[2,19]
        ].findIndex(([mo, day]) => m === mo && d >= day || (m === mo + 1 && d < day));
        showHoroscope(autoIdx >= 0 ? autoIdx : 0);
    }


    /* ====================================================
       YEUX GÉANTS DE GIACOMO
       Apparaît au hover des sections testimonials/timeline
    ==================================================== */
    (function() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'giant-eyes-overlay';
        overlay.innerHTML = `
            <div class="giant-eye" id="eye-left">
                <div class="eye-white">
                    <div class="eye-iris"></div>
                    <div class="eye-pupil" id="pupil-left"></div>
                </div>
            </div>
            <div class="giant-eye" id="eye-right">
                <div class="eye-white">
                    <div class="eye-iris"></div>
                    <div class="eye-pupil" id="pupil-right"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const pupilL = document.getElementById('pupil-left');
        const pupilR = document.getElementById('pupil-right');

        let eyeTimeout = null;
        let eyesShowing = false;

        // Track mouse to move pupils
        document.addEventListener('mousemove', (e) => {
            if (!eyesShowing) return;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / window.innerWidth;
            const dy = (e.clientY - cy) / window.innerHeight;
            const move = 'translate(' + (dx * 12) + 'px,' + (dy * 8) + 'px)';
            pupilL.style.transform = move;
            pupilR.style.transform = move;
        });

        function showEyes(duration = 3500) {
            clearTimeout(eyeTimeout);
            overlay.classList.add('eyes-visible');
            eyesShowing = true;
            eyeTimeout = setTimeout(() => {
                overlay.classList.remove('eyes-visible');
                eyesShowing = false;
                pupilL.style.transform = '';
                pupilR.style.transform = '';
            }, duration);
        }

        // Trigger zones: testimonials + timeline sections
        const triggerSelectors = [
            '.testimonials-section',
            '.timeline-section',
            '.domains',
        ];
        triggerSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (!el) return;
            el.addEventListener('mouseenter', () => showEyes(4000));
        });

        // Also trigger randomly during oracle consultations
        const oracleBox = document.querySelector('.oracle-box');
        if (oracleBox) {
            oracleBox.addEventListener('mouseenter', () => {
                if (Math.random() > 0.5) showEyes(2500);
            });
        }
    })();


    /* ====================================================
       MODE NUIT DES TEMPS
       Déclenché par : triple-clic sur le copyright du footer
    ==================================================== */
    (function() {
        const footerSecret = document.getElementById('footer-secret');
        if (!footerSecret) return;

        let clickCount = 0;
        let clickTimer = null;
        let nuitActive = false;
        let symbolIntervals = [];

        // Create overlay + toast
        const nuitOverlay = document.createElement('div');
        nuitOverlay.id = 'nuit-overlay';
        document.body.appendChild(nuitOverlay);

        const toast = document.createElement('div');
        toast.id = 'nuit-toast';
        document.body.appendChild(toast);

        const ANCIENT_SYMBOLS = ['𖤐','𓂀','𓇽','☽','✦','⊕','⌘','𓆏','⋆','❋','҉','⁂','𝌆','☿','♆'];

        function showToast(msg, duration = 3000) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }

        function spawnSymbol() {
            const el = document.createElement('div');
            el.className = 'nuit-symbol';
            el.textContent = ANCIENT_SYMBOLS[Math.floor(Math.random() * ANCIENT_SYMBOLS.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (8 + Math.random() * 12) + 's';
            el.style.animationDelay = (Math.random() * 4) + 's';
            el.style.fontSize = (1 + Math.random() * 2.5) + 'rem';
            document.body.appendChild(el);
            return el;
        }

        function activateNuit() {
            nuitActive = true;
            document.body.classList.add('nuit-des-temps');
            nuitOverlay.classList.add('active');

            // Spawn floating symbols
            for (let i = 0; i < 18; i++) {
                const sym = spawnSymbol();
                symbolIntervals.push(sym);
            }
            // Continuously spawn more
            const spawnInterval = setInterval(() => {
                if (!nuitActive) { clearInterval(spawnInterval); return; }
                const sym = spawnSymbol();
                symbolIntervals.push(sym);
                // Clean old ones
                symbolIntervals = symbolIntervals.filter(s => {
                    if (!document.body.contains(s)) return false;
                    return true;
                });
            }, 2500);
            symbolIntervals.push({ remove: () => clearInterval(spawnInterval) });

            showToast('🌙 MODE NUIT DES TEMPS ACTIVÉ — L\'ancienne obscurité vous enveloppe.', 4000);
        }

        function deactivateNuit() {
            nuitActive = false;
            document.body.classList.remove('nuit-des-temps');
            nuitOverlay.classList.remove('active');

            // Remove symbols
            document.querySelectorAll('.nuit-symbol').forEach(s => {
                s.style.opacity = '0';
                setTimeout(() => s.remove(), 600);
            });
            symbolIntervals = [];

            showToast('🌅 Retour au présent. Giacomo referme l\'éternité.', 3000);
        }

        footerSecret.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);

            if (clickCount === 1) {
                // First click — subtle color hint
                footerSecret.style.color = 'rgba(155,127,255,0.3)';
                setTimeout(() => footerSecret.style.color = '', 300);
            } else if (clickCount === 2) {
                footerSecret.style.color = 'rgba(155,127,255,0.6)';
                setTimeout(() => footerSecret.style.color = '', 300);
            }

            if (clickCount >= 3) {
                clickCount = 0;
                if (!nuitActive) activateNuit();
                else deactivateNuit();
                return;
            }

            clickTimer = setTimeout(() => {
                clickCount = 0;
                footerSecret.style.color = '';
            }, 800);
        });
    })();

})();
