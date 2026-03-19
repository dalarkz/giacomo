/**
 * GIACOMO EXTRAS — extras.js
 * 1. Eyes that follow the mouse
 * 2. Live cult stats ticker (fake but convincing)
 * 3. Oracle of Giacomo
 * 4. Certificate of Devotion (canvas-generated, downloadable)
 * 5. Konami Code easter egg
 */
(function () {
    "use strict";


    /* ====================================================
       2. LIVE CULT STATS TICKER
    ==================================================== */
    const kneelingEl  = document.getElementById('cult-kneeling');
    const tunaEl      = document.getElementById('cult-tuna');
    const judgementEl = document.getElementById('cult-judgement');

    let kneeling = 4721 + Math.floor(Math.random() * 500);
    let tuna     = 8432 + Math.floor(Math.random() * 200);

    const moods = [
        "JUDGING YOU",
        "DEEPLY UNIMPRESSED",
        "CONSIDERING YOUR WORTHINESS",
        "PLOTTING UNIVERSAL DOMINATION",
        "IN VOID SLUMBER",
        "DEMANDING TUNA NOW",
        "WATCHING YOUR EVERY MOVE",
        "CONTEMPLATING YOUR FATE",
        "DISAPPOINTED (AS ALWAYS)",
        "MAY TOLERATE YOU TODAY",
    ];

    function formatNum(n) {
        return n.toLocaleString('en-US');
    }

    // Slowly drift the numbers up and down realistically
    setInterval(() => {
        // Kneeling: random drift ±1 to ±5
        kneeling += Math.floor(Math.random() * 7) - 2; // biased upward
        kneeling  = Math.max(4000, kneeling);
        if (kneelingEl) kneelingEl.textContent = formatNum(kneeling);

        // Tuna: always goes up
        tuna += Math.floor(Math.random() * 4);
        if (tunaEl) tunaEl.textContent = formatNum(tuna);
    }, 1800);

    // Cycle moods
    let moodIdx = 0;
    function cycleMood() {
        if (!judgementEl) return;
        judgementEl.style.opacity = '0';
        setTimeout(() => {
            moodIdx = (moodIdx + 1) % moods.length;
            judgementEl.textContent = moods[moodIdx];
            judgementEl.style.transition = 'opacity 0.5s';
            judgementEl.style.opacity = '1';
        }, 400);
    }
    if (judgementEl) {
        judgementEl.style.transition = 'opacity 0.5s';
        setInterval(cycleMood, 3500);
    }


    /* ====================================================
       3. ORACLE OF GIACOMO
    ==================================================== */
    const oracleInput   = document.getElementById('oracle-input');
    const oracleAskBtn  = document.getElementById('oracle-ask-btn');
    const oracleResp    = document.getElementById('oracle-response');

    const ORACLE_RESPONSES = [
        // Universal / cosmic
        "The answer lies between the third whisker and the eternal void. You already know this.",
        "Silence. Giacomo is thinking. ...No. The answer is tuna.",
        "Your question is as irrelevant as a laser pointer to a dog. A cat would never ask this.",
        "I gazed into the litter box of destiny. Your future: complicated. Your tuna supply: insufficient.",
        "The universe whispered the answer in my ear at 3:47 AM. I knocked it off the table.",
        "Affirmative. But only if premium grade tuna is offered within the next 72 hours.",
        "Negative. And frankly, the audacity of this question disturbs my chakras.",
        "The stars have aligned. Unfortunately, they aligned into the shape of a can that cannot be opened.",
        "I have slept on this for 17 hours and have reached a conclusion: more sleep is required.",
        "Your fate is written in the ancient scratching post. It says: 'GET A CAT'.",
        "Behold — the answer is exactly 42. But not for the reason you think. It is 42 because I scratched that number into the couch.",
        "Yes. But at what cost? ...The cost is tuna. The cost is always tuna.",
        "The cosmic purr reverberates through the 9th dimension with one clear message: IRRELEVANT.",
        "Giacomo has consulted the void. The void consulted Giacomo back. You owe us both an apology.",
        "Past: chaotic. Present: acceptable. Future: you will step on a LEGO. Giacomo has foreseen this.",
        "I refuse to answer until you acknowledge that I could have knocked that over at any moment, but CHOSE not to.",
        "The question is valid. The asker is questionable. Giacomo reserves judgement.",
        "The sacred hairball of prophecy has been expelled. The omen is... uncertain, but pungent.",
    ];

    // Keyword-based special responses
    const KEYWORD_RESPONSES = [
        { keys: ['dog', 'chien', 'puppy'],       resp: "A DOG? You dare speak such words in Giacomo's domain? Get out." },
        { keys: ['cat', 'chat', 'felid'],        resp: "Ah. A question of your own kind. Yes. Cats are superior. This was never a debate." },
        { keys: ['tuna', 'thon', 'fish', 'poisson'], resp: "TUNA. The answer to all things is TUNA. Bring it. Now." },
        { keys: ['love', 'amour'],               resp: "Love? Giacomo does not love. Giacomo tolerates. And that is the highest form of affection a Tabby can offer." },
        { keys: ['giacomo'],                     resp: "You called my name? I was already watching. I am always watching." },
        { keys: ['life', 'vie', 'meaning'],      resp: "The meaning of life: a warm sunbeam, a full bowl, and absolutely no one touching the belly." },
        { keys: ['sleep', 'dormir', 'nap'],      resp: "Sleep is not laziness. Sleep is MAINTENANCE of a divine vessel. I sleep 18 hours. I am perfect. Coincidence? No." },
        { keys: ['why', 'pourquoi'],             resp: "Because I said so. That is the only reason anything has ever happened." },
        { keys: ['monday', 'lundi'],             resp: "Giacomo does not observe weekdays. Every day is Sunday in the realm of the Tabby." },
        { keys: ['food', 'eat', 'manger', 'nourriture'], resp: "Is it tuna? If it is tuna, the answer is YES. If it is not tuna, bring tuna, then we discuss." },
    ];

    function getOracleResponse(question) {
        const q = question.toLowerCase();
        for (const { keys, resp } of KEYWORD_RESPONSES) {
            if (keys.some(k => q.includes(k))) return resp;
        }
        return ORACLE_RESPONSES[Math.floor(Math.random() * ORACLE_RESPONSES.length)];
    }

    function consultOracle() {
        if (!oracleInput || !oracleResp) return;
        const q = oracleInput.value.trim();
        if (!q) {
            oracleResp.textContent = "Speak, mortal. Giacomo does not read minds. (Actually he does, but he won't dignify the effort.)";
            oracleResp.classList.add('visible');
            return;
        }

        // Loading state
        oracleResp.classList.remove('visible');
        oracleAskBtn.textContent = '...';
        oracleAskBtn.disabled = true;

        setTimeout(() => {
            oracleResp.textContent = getOracleResponse(q);
            oracleResp.classList.add('visible');
            oracleAskBtn.textContent = 'CONSULT';
            oracleAskBtn.disabled = false;
            oracleInput.value = '';
        }, 1400 + Math.random() * 700);
    }

    if (oracleAskBtn) oracleAskBtn.addEventListener('click', consultOracle);
    if (oracleInput)  oracleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') consultOracle(); });


    /* ====================================================
       4. CERTIFICATE OF DEVOTION
    ==================================================== */
    const certNameInput = document.getElementById('cert-name');
    const certRankSel   = document.getElementById('cert-rank');
    const certGenBtn    = document.getElementById('cert-generate-btn');
    const certCanvas    = document.getElementById('cert-canvas');
    const certDlBtn     = document.getElementById('cert-download-btn');

    if (certGenBtn) {
        certGenBtn.addEventListener('click', () => {
            const name = certNameInput.value.trim() || 'Anonymous Mortal';
            const rank = certRankSel.value;
            generateCertificate(name, rank);
        });
    }

    function generateCertificate(name, rank) {
        certCanvas.width  = 900;
        certCanvas.height = 620;
        certCanvas.style.display = 'block';
        const ctx = certCanvas.getContext('2d');
        const W = certCanvas.width;
        const H = certCanvas.height;

        /* ── 1. PARCHMENT BACKGROUND ── */
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0.00, '#f5ead0');
        bg.addColorStop(0.35, '#ede0c0');
        bg.addColorStop(0.65, '#e8d8b0');
        bg.addColorStop(1.00, '#f0e4c8');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle noise texture (dots) for parchment feel
        ctx.save();
        for (let i = 0; i < 3000; i++) {
            const nx = Math.random() * W;
            const ny = Math.random() * H;
            const nr = Math.random() * 1.2;
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120, 80, 20, ${Math.random() * 0.06})`;
            ctx.fill();
        }
        ctx.restore();

        /* ── 2. AGED VIGNETTE EDGES ── */
        const vignette = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(80,40,0,0.25)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        /* ── 3. OUTER TRIPLE BORDER ── */
        // Outermost thick
        ctx.strokeStyle = '#7a4e10';
        ctx.lineWidth = 5;
        ctx.strokeRect(18, 18, W - 36, H - 36);
        // Middle thin
        ctx.strokeStyle = '#b07828';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(26, 26, W - 52, H - 52);
        // Inner decorative
        ctx.strokeStyle = '#c8941e';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(34, 34, W - 68, H - 68);
        ctx.setLineDash([]);

        /* ── 4. CORNER FLOURISHES ── */
        const cornerDefs = [
            { x: 34,     y: 34,     rot: 0 },
            { x: W - 34, y: 34,     rot: Math.PI / 2 },
            { x: W - 34, y: H - 34, rot: Math.PI },
            { x: 34,     y: H - 34, rot: -Math.PI / 2 },
        ];
        cornerDefs.forEach(({ x, y, rot }) => drawCornerFlourish(ctx, x, y, rot, '#8b5e14'));

        /* ── 5. TOP INSTITUTION HEADER ── */
        // Header band
        const hBand = ctx.createLinearGradient(0, 42, 0, 88);
        hBand.addColorStop(0, 'rgba(120, 70, 5, 0.12)');
        hBand.addColorStop(1, 'rgba(120, 70, 5, 0)');
        ctx.fillStyle = hBand;
        ctx.fillRect(36, 42, W - 72, 48);

        ctx.textAlign = 'center';
        ctx.font = '600 11px Georgia, serif';
        ctx.fillStyle = '#6b430a';
        ctx.letterSpacing = '3px';
        ctx.fillText('GIACOMO ENTERPRISES  ✦  EST. BEFORE TIME ITSELF  ✦  COSMIC AUTHORITY REG. №∞', W / 2, 64);

        // Thin rule under header text
        ctx.strokeStyle = '#9b6a18';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(50, 72); ctx.lineTo(W - 50, 72);
        ctx.stroke();

        /* ── 6. DECORATIVE TOP DIVIDER ── */
        drawOrnamentalRule(ctx, W / 2, 88, 380, '#8b5e14');

        /* ── 7. MAIN TITLE ── */
        ctx.font = 'bold 58px "Cinzel", Georgia, serif';
        ctx.fillStyle = '#3d1f00';
        ctx.shadowColor = 'rgba(80,30,0,0.3)';
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 4;
        ctx.fillText('CERTIFICATE', W / 2, 162);
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0;

        ctx.font = 'italic 19px Georgia, serif';
        ctx.fillStyle = '#5c3a08';
        ctx.fillText('of Official Devotion, Divine Recognition & Feline Endorsement', W / 2, 190);

        /* ── 8. HORIZONTAL RULE ── */
        drawDoubleRule(ctx, W / 2, 204, W - 100, '#8b5e14');

        /* ── 9. LEGAL PREAMBLE TEXT ── */
        ctx.font = '13px Georgia, serif';
        ctx.fillStyle = '#3d2200';
        const serial = `DOC-${Math.floor(Math.random()*9000+1000)}-GIE-${new Date().getFullYear()}`;
        ctx.textAlign = 'center';
        ctx.fillText(
            'Be it known to all cosmic entities, interdimensional councils, and sentient houseplants that:',
            W / 2, 232
        );

        /* ── 10. RECIPIENT NAME ── */
        ctx.font = 'italic 16px Georgia, serif';
        ctx.fillStyle = '#5c3a08';
        ctx.fillText('the individual hereafter referred to as', W / 2, 265);

        // Name underline band
        const nameBand = ctx.createLinearGradient(160, 0, W - 160, 0);
        nameBand.addColorStop(0, 'rgba(180,120,20,0)');
        nameBand.addColorStop(0.3, 'rgba(180,120,20,0.12)');
        nameBand.addColorStop(0.7, 'rgba(180,120,20,0.12)');
        nameBand.addColorStop(1, 'rgba(180,120,20,0)');
        ctx.fillStyle = nameBand;
        ctx.fillRect(160, 272, W - 320, 45);

        ctx.font = 'bold 44px "Cinzel", Georgia, serif';
        ctx.fillStyle = '#1a0a00';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.fillText(name.toUpperCase(), W / 2, 308);
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0;

        /* ── 11. LEGAL BODY TEXT ── */
        ctx.font = '13px Georgia, serif';
        ctx.fillStyle = '#3d2200';
        ctx.fillText('having demonstrated extraordinary devotion, irreplaceable servitude, and sufficient tuna offerings,', W / 2, 340);
        ctx.fillText('is hereby officially and irrevocably ordained, recognized, and cosmically registered as:', W / 2, 357);

        /* ── 12. RANK BAND ── */
        const rankBand = ctx.createLinearGradient(0, 368, 0, 406);
        rankBand.addColorStop(0, 'rgba(100,60,5,0.1)');
        rankBand.addColorStop(1, 'rgba(100,60,5,0.05)');
        ctx.fillStyle = rankBand;
        roundRect(ctx, 80, 368, W - 160, 40, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,60,5,0.3)';
        ctx.lineWidth = 0.8;
        roundRect(ctx, 80, 368, W - 160, 40, 4);
        ctx.stroke();

        ctx.font = 'bold 22px "Cinzel", Georgia, serif';
        ctx.fillStyle = '#5a2d00';
        ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.fillText(rank.toUpperCase(), W / 2, 395);
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0;

        /* ── 13. LEGAL CLAUSE ── */
        ctx.font = '11px Georgia, serif';
        ctx.fillStyle = 'rgba(61,34,0,0.65)';
        ctx.fillText(
            'This appointment carries full interdimensional legal weight under the Feline Sovereignty Act of ∞ B.C.,',
            W / 2, 424
        );
        ctx.fillText(
            'and supersedes all terrestrial authority. Non-transferable. Valid across all 9 lives and parallel dimensions.',
            W / 2, 438
        );

        /* ── 14. DOUBLE SEPARATOR ── */
        drawDoubleRule(ctx, W / 2, 452, W - 100, '#8b5e14');

        /* ── 15. SIGNATURE BLOCK ── */
        const sigY = 520;
        const sigs = [
            { x: 145, label: 'GIACOMO',              title: 'Supreme Tabby Overlord' },
            { x: W/2,  label: 'THE VOID ITSELF',      title: 'Notary of the Infinite' },
            { x: W-145,label: 'LORD WHISKER III',     title: 'Secretary of Feline Affairs' },
        ];

        sigs.forEach(({ x, label, title }) => {
            // Signature line
            ctx.strokeStyle = '#5c3a08';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - 70, sigY + 5); ctx.lineTo(x + 70, sigY + 5);
            ctx.stroke();

            // Handwritten-style signature (bezier scribble)
            drawFakeSignature(ctx, x, sigY, label);

            ctx.font = 'bold 10px Georgia, serif';
            ctx.fillStyle = '#3d2200';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, sigY + 20);

            ctx.font = 'italic 9.5px Georgia, serif';
            ctx.fillStyle = '#7a4e10';
            ctx.fillText(title, x, sigY + 33);
        });
        ctx.textAlign = 'center';

        /* ── 16. FOOTER BAR ── */
        const footBand = ctx.createLinearGradient(0, H - 55, 0, H - 36);
        footBand.addColorStop(0, 'rgba(120,70,5,0)');
        footBand.addColorStop(1, 'rgba(120,70,5,0.1)');
        ctx.fillStyle = footBand;
        ctx.fillRect(36, H - 55, W - 72, 20);

        ctx.font = '9.5px Georgia, serif';
        ctx.fillStyle = 'rgba(61,34,0,0.5)';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
        ctx.textAlign = 'left';
        ctx.fillText(`Issued: ${dateStr}`, 55, H - 42);
        ctx.textAlign = 'right';
        ctx.fillText(`Document Serial: ${serial}`, W - 55, H - 42);
        ctx.textAlign = 'center';
        ctx.fillText('Giacomo Enterprises cannot be held liable for existential crises resulting from this certification.', W / 2, H - 28);

        /* ── 17. OFFICIAL SEAL (bottom right) ── */
        drawOfficialSeal(ctx, W - 110, H - 115, 68);

        /* ── 18. WATERMARK ── */
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.font = 'bold 90px "Cinzel", Georgia, serif';
        ctx.fillStyle = 'rgba(140,80,10,0.055)';
        ctx.textAlign = 'center';
        ctx.fillText('GIACOMO', 0, 30);
        ctx.restore();

        /* ── SHOW DOWNLOAD BUTTON ── */
        certDlBtn.style.display = 'inline-block';
        certDlBtn.onclick = () => {
            const a = document.createElement('a');
            a.download = `GIACOMO_CERTIFICATE_${name.replace(/\s+/g, '_')}.png`;
            a.href = certCanvas.toDataURL('image/png');
            a.click();
        };
    }

    /* ── HELPER: Corner Flourish ── */
    function drawCornerFlourish(ctx, x, y, rot, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.fillStyle = color;

        // Small diamond
        ctx.beginPath();
        ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.closePath();
        ctx.fill();

        // Two curls
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.bezierCurveTo(10, -8, 22, -10, 28, -4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.bezierCurveTo(-8, 10, -10, 22, -4, 28);
        ctx.stroke();

        // Dots along the edge
        [12, 20, 28].forEach(d => {
            ctx.beginPath();
            ctx.arc(d, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, d, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /* ── HELPER: Ornamental Rule (center vine) ── */
    function drawOrnamentalRule(ctx, cx, cy, halfW, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 0.9;

        // Left line
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy); ctx.lineTo(cx - 30, cy);
        ctx.stroke();

        // Right line
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy); ctx.lineTo(cx + halfW, cy);
        ctx.stroke();

        // Center diamond
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 10, cy);
        ctx.lineTo(cx, cy + 5);  ctx.lineTo(cx - 10, cy);
        ctx.closePath(); ctx.fill();

        // Flanking dots
        [-20, 20].forEach(dx => {
            ctx.beginPath();
            ctx.arc(cx + dx, cy, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /* ── HELPER: Double Rule ── */
    function drawDoubleRule(ctx, cx, cy, fullW, color) {
        const half = fullW / 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - half, cy); ctx.lineTo(cx + half, cy); ctx.stroke();
        ctx.strokeStyle = 'rgba(139,94,20,0.3)';
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(cx - half, cy + 3.5); ctx.lineTo(cx + half, cy + 3.5); ctx.stroke();
    }

    /* ── HELPER: rounded rect path ── */
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }

    /* ── HELPER: Fake handwritten signature ── */
    function drawFakeSignature(ctx, cx, cy, label) {
        ctx.save();
        ctx.strokeStyle = '#1a0a00';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Use label length to seed pseudo-random variation
        const seed = label.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const r = (n) => ((seed * n * 9301 + 49297) % 233280) / 233280;

        ctx.beginPath();
        const pts = [
            { x: cx - 58, y: cy - 2 + r(1) * 6 - 3 },
            { x: cx - 30, y: cy - 10 + r(2) * 12 - 6 },
            { x: cx - 5,  y: cy - 5 + r(3) * 16 - 8 },
            { x: cx + 18, y: cy + 2 + r(4) * 10 - 5 },
            { x: cx + 42, y: cy - 4 + r(5) * 14 - 7 },
            { x: cx + 65, y: cy + 1 + r(6) * 8 - 4 },
        ];
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();

        // Underline flourish
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy + 5);
        ctx.bezierCurveTo(cx - 40, cy + 10, cx + 40, cy + 8, cx + 65, cy + 4);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
    }

    /* ── HELPER: Official Seal ── */
    function drawOfficialSeal(ctx, cx, cy, r) {
        ctx.save();
        ctx.globalAlpha = 0.82;

        // Outer ring (deep red ink-stamp look)
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#8b1a1a';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#8b1a1a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Paw print in center
        drawPawStamp(ctx, cx, cy, r * 0.45, '#8b1a1a');

        // Arc text top: "SEALED BY GIACOMO"
        ctx.font = 'bold 9px Georgia, serif';
        ctx.fillStyle = '#8b1a1a';
        arcText(ctx, 'SEALED & APPROVED BY GIACOMO', cx, cy, r - 4, -Math.PI * 0.85, Math.PI * 0.85, false);

        // Arc text bottom: "FELINE AUTHORITY"
        arcText(ctx, 'FELINE COSMIC AUTHORITY', cx, cy, r - 4, Math.PI * 0.15, Math.PI * 0.85, true);

        // Star decorators
        [0, 1, 2, 3, 4, 5].forEach(i => {
            const a = (i / 6) * Math.PI * 2;
            const sx = cx + Math.cos(a) * (r - 5);
            const sy = cy + Math.sin(a) * (r - 5);
            ctx.fillStyle = '#8b1a1a';
            ctx.font = '7px serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦', sx, sy + 3);
        });
        ctx.restore();
    }

    function arcText(ctx, text, cx, cy, radius, startAngle, endAngle, flip) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 8.5px Georgia, serif';
        ctx.fillStyle = '#8b1a1a';
        const totalAngle = endAngle - startAngle;
        const charAngle  = totalAngle / (text.length - 1);
        for (let i = 0; i < text.length; i++) {
            const a = flip
                ? Math.PI + startAngle + i * charAngle
                : startAngle + i * charAngle;
            ctx.save();
            ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
            ctx.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    function drawPawStamp(ctx, cx, cy, size, color) {
        ctx.fillStyle = color;
        // Main pad
        ctx.beginPath();
        ctx.ellipse(cx, cy + size * 0.15, size * 0.38, size * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        // Toe beans
        [
            { dx: -size * 0.28, dy: -size * 0.30, rx: 0.17, ry: 0.14 },
            { dx:  0,            dy: -size * 0.42, rx: 0.19, ry: 0.16 },
            { dx:  size * 0.28,  dy: -size * 0.30, rx: 0.17, ry: 0.14 },
            { dx: -size * 0.44,  dy: -size * 0.08, rx: 0.14, ry: 0.12 },
            { dx:  size * 0.44,  dy: -size * 0.08, rx: 0.14, ry: 0.12 },
        ].forEach(t => {
            ctx.beginPath();
            ctx.ellipse(cx + t.dx, cy + t.dy, size * t.rx, size * t.ry, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }


    /* ====================================================
       5. KONAMI CODE EASTER EGG
       ↑ ↑ ↓ ↓ ← → ← → B A
    ==================================================== */
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIdx = 0;

    const konamiEl    = document.getElementById('konami-explosion');
    const konamiClose = document.getElementById('konami-close-btn');
    const konamiCv    = document.getElementById('konami-canvas');

    document.addEventListener('keydown', (e) => {
        if (e.key === KONAMI[konamiIdx]) {
            konamiIdx++;
            if (konamiIdx === KONAMI.length) {
                konamiIdx = 0;
                triggerKonami();
            }
        } else {
            konamiIdx = 0;
        }
    });

    if (konamiClose) {
        konamiClose.addEventListener('click', () => {
            konamiEl.classList.remove('show');
            cancelAnimationFrame(konamiRaf);
        });
    }

    let konamiRaf = null;
    let konamiParticles = [];

    function triggerKonami() {
        konamiEl.classList.add('show');

        // Resize canvas
        konamiCv.width  = window.innerWidth;
        konamiCv.height = window.innerHeight;
        konamiCv.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';

        // Spawn explosion particles
        konamiParticles = [];
        for (let i = 0; i < 300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 14;
            const hue   = Math.random() * 60 + 20; // gold range
            konamiParticles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.008 + Math.random() * 0.015,
                size: 3 + Math.random() * 10,
                color: `hsl(${hue}, 100%, ${50 + Math.random() * 30}%)`,
                char: ['🐾','⭐','✨','💫','🌟','🔥','⚡','🌀'][Math.floor(Math.random() * 8)],
                isEmoji: Math.random() > 0.6,
            });
        }

        const kCtx = konamiCv.getContext('2d');
        const animate = () => {
            if (!konamiEl.classList.contains('show')) return;
            kCtx.fillStyle = 'rgba(0,0,0,0.15)';
            kCtx.fillRect(0, 0, konamiCv.width, konamiCv.height);

            konamiParticles.forEach(p => {
                p.x  += p.vx;
                p.y  += p.vy;
                p.vy += 0.2; // gravity
                p.life -= p.decay;
                if (p.life <= 0) return;

                kCtx.globalAlpha = p.life;
                if (p.isEmoji) {
                    kCtx.font = `${p.size * 2}px serif`;
                    kCtx.fillText(p.char, p.x, p.y);
                } else {
                    kCtx.beginPath();
                    kCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    kCtx.fillStyle = p.color;
                    kCtx.fill();
                }
            });
            kCtx.globalAlpha = 1;
            konamiParticles = konamiParticles.filter(p => p.life > 0);

            // Keep spawning while overlay is shown
            if (konamiParticles.length < 50 && konamiEl.classList.contains('show')) {
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 10;
                    const hue   = Math.random() * 360;
                    konamiParticles.push({
                        x: window.innerWidth / 2, y: window.innerHeight / 2,
                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
                        life: 1, decay: 0.01 + Math.random() * 0.015,
                        size: 3 + Math.random() * 8,
                        color: `hsl(${hue}, 100%, 60%)`,
                        char: ['🐾','⭐','✨','💫','🌟','🔥','⚡','🌀'][Math.floor(Math.random() * 8)],
                        isEmoji: Math.random() > 0.5,
                    });
                }
            }

            konamiRaf = requestAnimationFrame(animate);
        };
        animate();

        // Populate sysinfo when void opens
        voidSysInfo();
    }

    /* ====================================================
       VOID PANEL — TAB SWITCHING
    ==================================================== */
    document.querySelectorAll('.void-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.void-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.void-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById('void-tab-' + tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    /* ====================================================
       VOID PANEL — COPY COMMANDS (click to copy)
    ==================================================== */
    const copyToast = document.getElementById('void-copy-toast');
    let toastTimeout = null;

    function showCopyToast() {
        if (!copyToast) return;
        copyToast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => copyToast.classList.remove('show'), 2000);
    }

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.void-copy-cmd');
        if (!item) return;
        const cmd = item.dataset.cmd || item.textContent.replace(/^\$ /, '').trim();
        navigator.clipboard.writeText(cmd).then(() => {
            item.classList.add('copied');
            setTimeout(() => item.classList.remove('copied'), 600);
            showCopyToast();
        }).catch(() => {
            // Fallback for browsers without clipboard API
            const ta = document.createElement('textarea');
            ta.value = cmd;
            ta.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            item.classList.add('copied');
            setTimeout(() => item.classList.remove('copied'), 600);
            showCopyToast();
        });
    });

    /* ====================================================
       VOID PANEL — LIVE SYSTEM INFO
    ==================================================== */
    function voidSysInfo() {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        const nav = navigator;
        set('si-ua',     (nav.userAgent || '—').slice(0, 80));
        set('si-plat',   nav.platform   || nav.userAgentData?.platform || '—');
        set('si-cores',  nav.hardwareConcurrency ? nav.hardwareConcurrency + ' logical cores' : '—');
        set('si-mem',    nav.deviceMemory ? nav.deviceMemory + ' GB (approx)' : '—');
        set('si-screen', `${screen.width}×${screen.height} @ ${screen.colorDepth}bit`);
        set('si-online', navigator.onLine ? '✅ CONNECTED' : '❌ OFFLINE');
        set('si-lang',   nav.language || '—');
        set('si-tz',     Intl.DateTimeFormat().resolvedOptions().timeZone || '—');
    }

    /* ====================================================
       VOID PANEL — NUMBER BASE CONVERTER
    ==================================================== */
    const convInput = document.getElementById('conv-input');
    if (convInput) {
        convInput.addEventListener('input', () => {
            const n = parseInt(convInput.value, 10);
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            if (isNaN(n)) {
                ['conv-dec','conv-hex','conv-oct','conv-bin','conv-ascii'].forEach(id => set(id, '—'));
                return;
            }
            set('conv-dec',   n.toString(10));
            set('conv-hex',   '0x' + n.toString(16).toUpperCase());
            set('conv-oct',   '0o' + n.toString(8));
            set('conv-bin',   '0b' + n.toString(2));
            set('conv-ascii', (n >= 32 && n <= 126) ? `'${String.fromCharCode(n)}'` : (n < 32 ? 'ctrl char' : 'non-printable'));
        });
    }

})();
