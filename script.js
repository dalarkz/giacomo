document.addEventListener("DOMContentLoaded", () => {
    
    /* ----------------------------------------------------
       INITIALIZATION AND AUDIO CONTEXT
    ---------------------------------------------------- */
    const enterOverlay = document.getElementById('enter-overlay');
    const enterBtn = document.getElementById('enter-btn');
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    let droneOsc;

    function initAudio() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        // --- COSMIC DRONE (Continuous background hum) ---
        droneOsc = audioCtx.createOscillator();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(45, audioCtx.currentTime); 
        
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // very slow modulation
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(droneOsc.frequency);
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        const droneVolume = audioCtx.createGain();
        droneVolume.gain.value = 0.08; 
        
        droneOsc.connect(filter);
        filter.connect(droneVolume);
        droneVolume.connect(audioCtx.destination);
        
        droneOsc.start();
        lfo.start();
    }

    function playLaser() {
        if(!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    }

    function playBassDrop() {
        if(!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 2.0);
        
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
        
        const distortion = audioCtx.createWaveShaper();
        distortion.curve = makeDistortionCurve(400); 

        osc.connect(distortion);
        distortion.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 2.5);
    }

    function playCatnipDistortion() {
        if(!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1);
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
    }

    function makeDistortionCurve(amount) {
        let k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0, x;
        for ( ; i < n_samples; ++i ) {
            x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    }

    enterBtn.addEventListener('click', () => {
        initAudio();
        enterOverlay.style.opacity = '0';
        setTimeout(() => {
            enterOverlay.style.visibility = 'hidden';
            playBassDrop();
            document.body.classList.add('shake-active');
            setTimeout(() => document.body.classList.remove('shake-active'), 500);
        }, 1000);
    });

    /* ----------------------------------------------------
       CUSTOM LASER AND PARALLAX
    ---------------------------------------------------- */
    const laser = document.querySelector('.laser-pointer');
    const glow = document.querySelector('.cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let laserX = mouseX, laserY = mouseY;
    let velocity = 0;

    let parallaxElements = document.querySelectorAll('.parallax');

    document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;
        velocity = Math.sqrt(dx*dx + dy*dy);
        
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Randomly play laser on fast movement
        if(velocity > 80 && Math.random() > 0.7) {
            playLaser();
        }

        // Apply Parallax translation
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (mouseX - centerX);
        const offsetY = (mouseY - centerY);

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0;
            const tx = offsetX * speed * -1;
            const ty = offsetY * speed * -1;
            // Retain original transform or append
            el.style.transform = `translate(${tx}px, ${ty}px) translateZ(0)`;
        });
    });

    const updateCursor = () => {
        laserX += (mouseX - laserX) * 0.25;
        laserY += (mouseY - laserY) * 0.25;

        laser.style.left = `${laserX}px`;
        laser.style.top = `${laserY}px`;
        glow.style.left = `${mouseX}px`;
        glow.style.top = `${mouseY}px`;

        requestAnimationFrame(updateCursor);
    };
    updateCursor();

    /* ----------------------------------------------------
       3D TILT CARDS
    ---------------------------------------------------- */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top; 
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.zIndex = '50';
            
            // Generate some random laser sounds when inspecting
            if(Math.random() > 0.95) playLaser();
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.zIndex = '1';
        });
    });


    /* ----------------------------------------------------
       MATRIX DECODE TEXT SCRAMBLER
    ---------------------------------------------------- */
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}[]|:;<>,./?~`';
    const decodeTexts = document.querySelectorAll('.decode-text, .decode-text-scroll');
    
    const scrambleWord = (element) => {
        const originalText = element.innerText || element.textContent;
        element.setAttribute('data-original', originalText);
        let iterations = 0;
        
        const interval = setInterval(() => {
            element.innerText = originalText.split('').map((char, index) => {
                if(index < iterations) return originalText[index];
                if(char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            
            iterations += 1/3;
            if(iterations >= originalText.length) {
                clearInterval(interval);
                element.innerText = originalText;
            }
        }, 50);
    };

    /* ----------------------------------------------------
       INTERSECTION OBSERVERS (Scroll trigger)
    ---------------------------------------------------- */
    let statsAnimated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Decode text effect
                if(entry.target.classList.contains('decode-text-scroll')) {
                    scrambleWord(entry.target);
                    entry.target.classList.remove('decode-text-scroll'); // Only do it once
                }

                // Stats Counter
                if (entry.target.classList.contains('power-stats') && !statsAnimated) {
                    const statValues = entry.target.querySelectorAll('.stat-value');
                    statValues.forEach(stat => {
                        const targetStr = stat.getAttribute('data-target');
                        if(targetStr === '♾️') {
                            setTimeout(() => { stat.innerText = '♾️'; stat.style.color = '#fff'; }, 2000);
                            return;
                        }
                        const target = +targetStr;
                        const duration = 2500; 
                        const increment = target / (duration / 16); 
                        
                        let current = 0;
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                stat.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                stat.innerText = target;
                                stat.style.color = '#fff';
                                setTimeout(() => stat.style.color = 'var(--primary)', 500);
                            }
                        };
                        updateCounter();
                    });
                    statsAnimated = true;
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.power-stats, .decode-text-scroll').forEach(el => {
        observer.observe(el);
    });

    /* ----------------------------------------------------
       COSMIC CANVAS BACKGROUND PARTICLES
    ---------------------------------------------------- */
    const canvas = document.getElementById('cosmic-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    const resizeCanvas = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.7 + 0.2;
            const isGold = Math.random() > 0.4;
            this.color = isGold ? `rgba(255, 170, 0, ${this.opacity})` : `rgba(255, 69, 0, ${this.opacity})`;
            this.originalSize = this.size;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x > width) this.x = 0; if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0; if (this.y < 0) this.y = height;

            // React to mouse laser
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 150) {
                this.size = this.originalSize * 3;
                // Run away logic
                this.x -= dx * 0.05;
                this.y -= dy * 0.05;
            } else {
                this.size = this.originalSize;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    const initParticles = () => {
        particles = [];
        const count = Math.floor((width * height) / 8000);
        for(let i=0; i<count; i++) particles.push(new Particle());
    }

    const animateParticles = () => {
        ctx.clearRect(0,0,width,height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();

    /* ----------------------------------------------------
       BUTTON INTERACTIONS
    ---------------------------------------------------- */
    const worshipBtn = document.querySelector('.worship-btn');
    const tunaMsg = document.querySelector('.tuna-message');
    const msgs = [
        "TUNA ACCEPTED. YOU MAY LIVE ANOTHER DAY.",
        "MERE MORTAL, YOUR OFFERING PLEASES THE TABBY.",
        "*PURRS IN 4TH DIMENSIONAL FREQUENCIES*",
        "THE OMNIPRESENT ENTITY NODS IN APPROVAL."
    ];

    worshipBtn.addEventListener('click', () => {
        playBassDrop();
        document.body.classList.add('shake-active');
        worshipBtn.style.transform = 'scale(0.8)';
        setTimeout(() => worshipBtn.style.transform = 'scale(1)', 100);

        // Flash screen red/gold
        const flash = document.createElement('div');
        flash.setAttribute("style", "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#ffaa00;z-index:99999;opacity:0.8;pointer-events:none;transition:0.3s;mix-blend-mode:color-dodge;");
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            document.body.classList.remove('shake-active');
            setTimeout(() => { flash.remove(); }, 300);
            
            tunaMsg.innerText = msgs[Math.floor(Math.random() * msgs.length)];
            tunaMsg.style.opacity = '1';
            scrambleWord(tunaMsg);
            
            setTimeout(() => tunaMsg.style.opacity = '0', 4000);
        }, 150);
    });

    /* ----------------------------------------------------
       CATNIP MODE (Madness)
    ---------------------------------------------------- */
    const catnipBtn = document.getElementById('catnip-btn');
    let catnipActive = false;

    catnipBtn.addEventListener('click', () => {
        catnipActive = !catnipActive;
        if(catnipActive) {
            playCatnipDistortion();
            document.documentElement.classList.add('catnip-mode-active');
            catnipBtn.innerText = "🛑 STOP CATNIP OVERLOAD";
            catnipBtn.style.background = "#fff";
            document.body.classList.add('shake-active');
            
            // Random lasers
            window.catnipInterval = setInterval(() => {
                if(Math.random() > 0.5) playLaser();
            }, 300);

        } else {
            playCatnipDistortion();
            document.documentElement.classList.remove('catnip-mode-active');
            catnipBtn.innerText = "⚠️ INJECT CATNIP ⚠️";
            catnipBtn.style.background = "";
            document.body.classList.remove('shake-active');
            clearInterval(window.catnipInterval);
        }
    });

    // Scramble pre-title on load
    setTimeout(() => {
        document.querySelectorAll('.decode-text').forEach(el => scrambleWord(el));
    }, 1500);
});
