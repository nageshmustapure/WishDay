// ====================
// MAIN APPLICATION
// ====================

// Utility Functions
const encode = (name, date) => {
    const raw = `${name}|${date}`;
    return btoa(encodeURIComponent(raw));
};

const decode = (str) => {
    try {
        const raw = decodeURIComponent(atob(str));
        const [name, date] = raw.split('|');
        return { name, date };
    } catch (e) {
        return null;
    }
};

// Message Bank
const MESSAGES = {
    past: [
        "✨ The best is yet to come! Get ready for the next round.",
        "🌟 Every day is a gift, but your next birthday will be the main event!",
        "🚀 Level up loading... Waiting for the next big day.",
        "🍷 You are like fine wine, getting better with every year.",
        "⏳ The countdown to greatness has begun!",
        "📅 Mark the calendar! The next celebration is going to be epic.",
        "🎯 Another year wiser, another year cooler. Can't wait for the next one!",
        "💫 Keep shining bright every single day until your big day.",
        "🎆 Your next birthday is going to be legendary.",
        "🎊 Saving up all the confetti for next year!"
    ],
    today: [
        // Use the special birthday poem for the celebration
        `🎂 <strong>Happy Birthday, Shining Star!</strong> 🎂<br><br>
        Today the world celebrates YOU,<br>
        A soul so kind, so brave, so true.<br>
        May laughter fill your every hour,<br>
        And joy rain down in a gentle shower.<br><br>
        The candles glow, the wishes soar,<br>
        May life give you and so much more.<br>
        Another year of dreams come true,<br>
        This special day is all for you! 🌟`
    ],
    future: [
        "🌟 Something wonderful is about to happen.",
        "⏰ The anticipation is part of the fun!",
        "💫 Good things come to those who wait.",
        "🎯 Your big day is approaching fast!",
        "✨ Get ready for a fantastic celebration.",
        "🚀 You are exactly where you need to be.",
        "🌈 The magic begins soon!",
        "💝 Counting down to celebrate YOU!",
        "🎊 Something special is coming your way...",
        "⭐ The universe is preparing something amazing for you!"
    ]
};

const getRandomMessage = (category) => {
    const arr = MESSAGES[category];
    return arr[Math.floor(Math.random() * arr.length)];
};

// State Management
let appState = {
    phase: 'init',
    recipientName: '',
    birthdayDate: null,
    isBirthday: false,
    balloonsPopped: 0,
    candlesBlown: 0,
    totalCandles: 5,
    giftOpened: false
};

// Balloon colors - will generate more dynamically based on name length
const BALLOON_COLOR_PALETTE = [
    'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
    'linear-gradient(135deg, #ffd93d, #ffe66d)',
    'linear-gradient(135deg, #6bff6b, #8eff8e)',
    'linear-gradient(135deg, #6b6bff, #8e8eff)',
    'linear-gradient(135deg, #ff6bff, #ff8eff)',
    'linear-gradient(135deg, #6bffff, #8effff)',
    'linear-gradient(135deg, #ffb86b, #ffc68e)',
    'linear-gradient(135deg, #b86bff, #c68eff)'
];

// Get balloon letters from recipient name
function getBalloonLetters(name) {
    // Clean name and get uppercase letters
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');

    // Use first 3-7 characters based on name length
    const maxLetters = Math.min(7, Math.max(3, cleanName.length));
    return cleanName.slice(0, maxLetters).split('');
}

// Get colors for balloons
function getBalloonColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(BALLOON_COLOR_PALETTE[i % BALLOON_COLOR_PALETTE.length]);
    }
    return colors;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('v');

    if (encodedData) {
        initViewerMode(encodedData);
    } else {
        initCreatorMode();
    }

    // Initialize audio on first interaction
    document.addEventListener('click', () => {
        if (window.audioManager) {
            window.audioManager.init();
        }
    }, { once: true });
});

// ====================
// CREATOR MODE
// ====================

function initCreatorMode() {
    const ui = document.getElementById('creator-ui');
    ui.classList.remove('hidden');

    const form = document.getElementById('create-form');
    const resultArea = document.getElementById('result-area');
    const shareInput = document.getElementById('share-link');
    const testBtn = document.getElementById('test-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const date = document.getElementById('date').value;

        if (!name || !date) return;

        const code = encode(name, date);
        const url = `${window.location.origin}${window.location.pathname}?v=${code}`;

        shareInput.value = url;
        resultArea.classList.remove('hidden');

        // Celebration effect
        if (window.effectsManager) {
            window.effectsManager.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 30);
        }
        if (window.audioManager) {
            window.audioManager.playReveal();
        }

        // Animate result - animate IN and stay visible
        resultArea.style.opacity = '1';
        resultArea.style.transform = 'translateY(0)';
        gsap.fromTo(resultArea,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        // Auto-select the link for easy copying
        setTimeout(() => {
            shareInput.focus();
            shareInput.select();
        }, 600);
    });

    // Test button - opens the link in a new tab
    testBtn.addEventListener('click', () => {
        const url = shareInput.value;
        if (url) {
            window.open(url, '_blank');
        }
    });
}

// ====================
// VIEWER MODE
// ====================

function initViewerMode(encodedStr) {
    const data = decode(encodedStr);
    if (!data) {
        alert("Invalid Link!");
        window.location.href = window.location.pathname;
        return;
    }

    appState.recipientName = data.name;
    appState.birthdayDate = data.date;

    const viewerUI = document.getElementById('viewer-ui');
    viewerUI.classList.remove('hidden');

    // Check if today is the birthday
    const today = new Date();
    const birthday = new Date(data.date);
    birthday.setFullYear(today.getFullYear());

    const isBirthday = today.getMonth() === birthday.getMonth() &&
        today.getDate() === birthday.getDate();

    appState.isBirthday = isBirthday;

    if (isBirthday) {
        // It's the birthday! Show full celebration
        startStarfieldIntro();
    } else {
        // Not birthday yet - show countdown mode with daily activity
        if (window.countdownActivities) {
            window.countdownActivities.init(data.name, data.date);
        } else {
            // Fallback if activities not loaded
            startStarfieldIntro();
        }
    }
}

function startStarfieldIntro() {
    const introEl = document.getElementById('starfield-intro');

    // Create starfield effect
    if (window.effectsManager) {
        window.effectsManager.createStarfield(introEl, () => {
            // After starfield, start balloon game
            introEl.classList.add('hidden');
            startBalloonGame();
        });
    } else {
        // Fallback if effects not loaded
        setTimeout(() => {
            gsap.to(introEl, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    introEl.classList.add('hidden');
                    startBalloonGame();
                }
            });
        }, 3000);
    }
}

// ====================
// BALLOON POP GAME
// ====================

function startBalloonGame() {
    appState.phase = 'balloon-game';

    // Get letters from recipient's name
    const letters = getBalloonLetters(appState.recipientName);
    const colors = getBalloonColors(letters.length);
    appState.totalBalloons = letters.length;
    appState.balloonsPopped = 0;

    const gameEl = document.getElementById('balloon-game');
    gameEl.classList.remove('hidden');

    const container = document.getElementById('balloon-container');
    container.innerHTML = '';

    // Clear revealed letters
    document.getElementById('revealed-letters').innerHTML = '';

    // Update instruction
    const instruction = document.querySelector('.instruction-text');
    if (instruction) {
        instruction.textContent = `Pop the balloons to reveal the magic!`;
    }

    // Create balloons with dynamic positions
    letters.forEach((letter, index) => {
        const balloon = createBalloon(letter, index, letters.length, colors[index]);
        container.appendChild(balloon);

        // Animate entrance with stagger
        gsap.from(balloon, {
            y: 200,
            opacity: 0,
            rotation: (Math.random() - 0.5) * 30,
            duration: 0.8,
            delay: index * 0.12,
            ease: "elastic.out(1, 0.5)"
        });
    });

    if (window.audioManager) {
        window.audioManager.playReveal();
    }
}

function createBalloon(letter, index, totalCount, color) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.dataset.letter = letter;
    balloon.dataset.index = index;

    // Calculate dynamic positions based on total count
    const spacing = 80 / (totalCount + 1);
    const left = 10 + spacing * (index + 1);
    const top = 15 + Math.sin(index * 1.2) * 20; // Wave pattern

    balloon.style.left = `${left}%`;
    balloon.style.top = `${top}%`;
    balloon.style.animationDelay = `${index * 0.2}s`;

    balloon.innerHTML = `
        <div class="balloon-body" style="background: ${color}">
            <span class="balloon-letter">${letter}</span>
        </div>
        <div class="balloon-knot" style="background: ${color}"></div>
        <div class="balloon-string"></div>
    `;

    balloon.addEventListener('click', () => popBalloon(balloon, letter, index));

    return balloon;
}

function popBalloon(balloon, letter, index) {
    if (balloon.classList.contains('popped')) return;

    balloon.classList.add('popped');
    appState.balloonsPopped++;

    // Play sound
    if (window.audioManager) {
        window.audioManager.playPop();
    }

    // Create particle burst at balloon position
    const rect = balloon.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (window.effectsManager) {
        window.effectsManager.confettiBurst(x, y, 25);
    }

    // Add revealed letter
    const lettersContainer = document.getElementById('revealed-letters');
    const revealedLetter = document.createElement('span');
    revealedLetter.className = 'revealed-letter';
    revealedLetter.textContent = letter;
    revealedLetter.style.animationDelay = '0.2s';
    lettersContainer.appendChild(revealedLetter);

    if (window.audioManager) {
        setTimeout(() => window.audioManager.playSparkle(), 200);
    }

    // Check if all balloons popped
    if (appState.balloonsPopped >= appState.totalBalloons) {
        setTimeout(endBalloonGame, 800);
    }
}

function endBalloonGame() {
    if (window.audioManager) {
        window.audioManager.playFanfare();
    }

    const gameEl = document.getElementById('balloon-game');

    gsap.to(gameEl, {
        opacity: 0,
        scale: 1.1,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => {
            gameEl.classList.add('hidden');
            showMainReveal();
        }
    });
}

// ====================
// MAIN REVEAL
// ====================

function showMainReveal() {
    appState.phase = 'reveal';

    const revealContainer = document.getElementById('content-reveal');
    revealContainer.classList.remove('hidden');

    // Set recipient name with typing effect
    const nameEl = document.getElementById('recipient-name');
    typeText(nameEl, appState.recipientName, 100);

    // Determine if birthday
    const targetDate = new Date(appState.birthdayDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    appState.isBirthday = startOfTarget.getTime() === startOfToday.getTime();

    const birthdayHeader = document.getElementById('birthday-header');
    const candleSection = document.getElementById('candle-section');
    const countdownContainer = document.getElementById('countdown-container');

    if (appState.isBirthday) {
        // IT'S THEIR BIRTHDAY!
        birthdayHeader.style.display = 'block';

        // Show 3D cake
        if (window.birthday3D) {
            window.birthday3D.showBirthdayCake();
        }

        // Launch fireworks
        if (window.effectsManager) {
            setTimeout(() => {
                window.effectsManager.startFireworksShow(4000);
            }, 500);
        }

        // Show candle section after a delay
        setTimeout(() => {
            candleSection.classList.remove('hidden');
            initCandleBlowing();
        }, 2000);

    } else {
        // NOT BIRTHDAY - Show countdown
        birthdayHeader.style.display = 'none';

        // Calculate next birthday
        let nextBirthday = new Date(now.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        if (nextBirthday <= startOfToday) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        countdownContainer.classList.remove('hidden');
        startCountdown(nextBirthday);
        showMessage(startOfTarget < startOfToday ? 'past' : 'future');

        // Subtle effects
        if (window.effectsManager) {
            window.effectsManager.confettiBurst(window.innerWidth / 2, 100, 20);
        }
    }
}

function typeText(element, text, speed) {
    element.textContent = '';
    let i = 0;

    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };

    type();
}

// ====================
// CANDLE BLOWING
// ====================

function initCandleBlowing() {
    const container = document.getElementById('candle-container');
    container.innerHTML = '';

    for (let i = 0; i < appState.totalCandles; i++) {
        const candle = createCandle(i);
        container.appendChild(candle);

        gsap.from(candle, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            delay: i * 0.1,
            ease: "back.out(1.7)"
        });
    }
}

function createCandle(index) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.dataset.index = index;

    candle.innerHTML = `
        <div class="candle-flame"></div>
        <div class="candle-smoke"></div>
        <div class="candle-wick"></div>
        <div class="candle-body"></div>
    `;

    candle.addEventListener('click', () => blowCandle(candle, index));

    return candle;
}

function blowCandle(candle, index) {
    if (candle.classList.contains('blown')) return;

    candle.classList.add('blown');
    appState.candlesBlown++;

    if (window.audioManager) {
        window.audioManager.playWoosh();
    }

    // Check if all candles blown
    if (appState.candlesBlown >= appState.totalCandles) {
        setTimeout(showWishPrompt, 500);
    }
}

function showWishPrompt() {
    const wishPrompt = document.getElementById('wish-prompt');
    wishPrompt.classList.remove('hidden');

    gsap.from(wishPrompt, {
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
    });

    const wishBtn = document.getElementById('make-wish-btn');
    wishBtn.addEventListener('click', makeWish);
}

function makeWish() {
    const wishPrompt = document.getElementById('wish-prompt');
    const candleSection = document.getElementById('candle-section');

    if (window.audioManager) {
        window.audioManager.playFanfare();
    }

    // Big celebration
    if (window.effectsManager) {
        window.effectsManager.startFireworksShow(3000);
        window.effectsManager.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
    }

    // Also trigger confetti library
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    // 3D confetti
    if (window.birthday3D) {
        window.birthday3D.createConfettiExplosion(200);
        setTimeout(() => window.birthday3D.createConfettiExplosion(150), 1000);
    }

    // Transition to gift
    gsap.to([wishPrompt, candleSection], {
        opacity: 0,
        y: -30,
        duration: 0.6,
        stagger: 0.1,
        onComplete: () => {
            candleSection.classList.add('hidden');
            showGiftSection();
        }
    });
}

// ====================
// GIFT UNWRAPPING
// ====================

function showGiftSection() {
    const giftSection = document.getElementById('gift-section');
    giftSection.classList.remove('hidden');

    gsap.from(giftSection, {
        scale: 0.3,
        opacity: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
    });

    const giftBox = document.getElementById('gift-box');
    giftBox.addEventListener('click', openGift);
}

function openGift() {
    if (appState.giftOpened) return;
    appState.giftOpened = true;

    const giftBox = document.getElementById('gift-box');
    giftBox.classList.add('opened');

    if (window.audioManager) {
        window.audioManager.playReveal();
    }

    // Particle burst from gift
    const rect = giftBox.getBoundingClientRect();
    if (window.effectsManager) {
        window.effectsManager.confettiBurst(
            rect.left + rect.width / 2,
            rect.top,
            50
        );
    }

    // Show message after animation
    setTimeout(() => {
        const giftSection = document.getElementById('gift-section');
        gsap.to(giftSection, {
            opacity: 0,
            y: -50,
            duration: 0.5,
            onComplete: () => {
                giftSection.classList.add('hidden');
                showMessage('today');
            }
        });
    }, 1000);
}

// ====================
// MESSAGE DISPLAY
// ====================

function showMessage(category) {
    const messageSection = document.getElementById('birthday-message');
    messageSection.classList.remove('hidden');

    const wishesEl = messageSection.querySelector('.wishes');
    const message = getRandomMessage(category);

    // For poems with HTML formatting, use innerHTML directly
    if (message.includes('<br>')) {
        wishesEl.innerHTML = message;
        wishesEl.style.opacity = '0';
        gsap.to(wishesEl, { opacity: 1, duration: 1.5, ease: "power2.inOut" });
    } else {
        // Type out simple messages
        typeText(wishesEl, message, 30);
    }

    gsap.from(messageSection, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    });

    // Continuous celebration for birthday
    if (category === 'today') {
        setInterval(() => {
            confetti({ particleCount: 15, spread: 60, origin: { y: 0.7 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
        }, 2500);
    }
}

// ====================
// COUNTDOWN TIMER
// ====================

function startCountdown(targetDate) {
    const updateTimer = () => {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            // Birthday started during countdown!
            location.reload();
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(d).padStart(2, '0');
        document.getElementById('hours').innerText = String(h).padStart(2, '0');
        document.getElementById('minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('seconds').innerText = String(s).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// ====================
// EASTER EGGS
// ====================

// Konami code for disco mode
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateDiscoMode();
    }
});

function activateDiscoMode() {
    document.body.classList.add('disco-mode');

    // Rainbow aurora
    const auroras = document.querySelectorAll('.aurora');
    auroras.forEach((a, i) => {
        a.style.animation = `disco-pulse ${0.5 + i * 0.2}s ease-in-out infinite alternate`;
    });

    // Fireworks
    if (window.effectsManager) {
        window.effectsManager.startFireworksShow(10000);
    }

    if (window.audioManager) {
        window.audioManager.playFanfare();
    }
}

// Triple-click name for rainbow mode
let clickCount = 0;
let clickTimer = null;

document.getElementById('recipient-name')?.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
        if (clickCount >= 3) {
            document.getElementById('recipient-name').classList.toggle('ultra-rainbow');
        }
        clickCount = 0;
    }, 300);
});

// Type "birthday" for fireworks
let typedChars = '';
document.addEventListener('keypress', (e) => {
    typedChars += e.key.toLowerCase();
    typedChars = typedChars.slice(-8);

    if (typedChars === 'birthday') {
        if (window.effectsManager) {
            window.effectsManager.startFireworksShow(5000);
        }
        if (window.audioManager) {
            window.audioManager.playFanfare();
        }
        typedChars = '';
    }
});
