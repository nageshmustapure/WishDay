// ====================
// DAILY ACTIVITIES
// Interactive mini-games for countdown mode
// ====================

const DAILY_ACTIVITIES = {
    // Fortune Cookie
    fortuneCookie: {
        name: 'Fortune Cookie',
        icon: '🥠',
        init: (container, message, daysLeft) => {
            container.innerHTML = `
                <div class="activity-fortune-cookie">
                    <p class="activity-intro">Tap the fortune cookie to reveal today's message!</p>
                    <div class="fortune-cookie" id="fortune-cookie">
                        <div class="cookie-left">🥠</div>
                        <div class="cookie-right">🥠</div>
                        <div class="fortune-paper hidden">
                            <p class="fortune-message">${message}</p>
                            <p class="fortune-days">${daysLeft} days to go!</p>
                        </div>
                    </div>
                </div>
            `;

            const cookie = container.querySelector('#fortune-cookie');
            cookie.addEventListener('click', () => {
                if (cookie.classList.contains('opened')) return;
                cookie.classList.add('opened');
                if (window.audioManager) window.audioManager.playPop();
                setTimeout(() => {
                    cookie.querySelector('.fortune-paper').classList.remove('hidden');
                    if (window.audioManager) window.audioManager.playSparkle();
                }, 400);
            });
        }
    },

    // Scratch Card
    scratchCard: {
        name: 'Scratch Card',
        icon: '🎰',
        init: (container, message, daysLeft) => {
            container.innerHTML = `
                <div class="activity-scratch-card">
                    <p class="activity-intro">Scratch to reveal your message! ✨</p>
                    <div class="scratch-card" id="scratch-card">
                        <canvas id="scratch-canvas"></canvas>
                        <div class="scratch-message">
                            <p class="revealed-message">${message}</p>
                            <p class="days-text">${daysLeft} days until magic! 🎂</p>
                        </div>
                    </div>
                </div>
            `;

            const canvas = container.querySelector('#scratch-canvas');
            const ctx = canvas.getContext('2d');
            const card = container.querySelector('#scratch-card');

            // Set canvas size
            canvas.width = 320;
            canvas.height = 180;

            // Fill with scratch surface
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#a855f7');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add shimmer pattern
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < 50; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Add text
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✨ Scratch Here! ✨', canvas.width / 2, canvas.height / 2);

            let isDrawing = false;
            let scratchedPixels = 0;
            const totalPixels = canvas.width * canvas.height;

            const scratch = (e) => {
                if (!isDrawing) return;
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - rect.left;
                const y = (e.clientY || e.touches[0].clientY) - rect.top;

                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x * (canvas.width / rect.width), y * (canvas.height / rect.height), 25, 0, Math.PI * 2);
                ctx.fill();

                scratchedPixels += 100;
                if (scratchedPixels > totalPixels * 0.4) {
                    canvas.style.opacity = '0';
                    card.classList.add('revealed');
                    if (window.audioManager) window.audioManager.playReveal();
                }
            };

            canvas.addEventListener('mousedown', () => isDrawing = true);
            canvas.addEventListener('mouseup', () => isDrawing = false);
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('touchstart', () => isDrawing = true);
            canvas.addEventListener('touchend', () => isDrawing = false);
            canvas.addEventListener('touchmove', scratch);
        }
    },

    // Magic 8 Ball
    magic8Ball: {
        name: 'Magic 8-Ball',
        icon: '🎱',
        init: (container, message, daysLeft) => {
            container.innerHTML = `
                <div class="activity-magic8ball">
                    <p class="activity-intro">Shake the magic ball for a birthday fortune!</p>
                    <div class="magic8ball" id="magic8ball">
                        <div class="ball-outer">
                            <div class="ball-window">
                                <div class="ball-triangle">
                                    <span class="ball-message">8</span>
                                </div>
                            </div>
                        </div>
                        <p class="shake-hint">👆 Tap me!</p>
                    </div>
                    <div class="fortune-result hidden" id="fortune-result">
                        <p class="result-message">${message}</p>
                        <p class="result-days">${daysLeft} days until your special day! 🌟</p>
                    </div>
                </div>
            `;

            const ball = container.querySelector('#magic8ball');
            const result = container.querySelector('#fortune-result');
            let shaken = false;

            ball.addEventListener('click', () => {
                if (shaken) return;
                shaken = true;

                ball.classList.add('shaking');
                if (window.audioManager) window.audioManager.playWoosh();

                setTimeout(() => {
                    ball.classList.remove('shaking');
                    ball.classList.add('revealed');
                    const triangle = ball.querySelector('.ball-triangle');
                    triangle.querySelector('.ball-message').textContent = '✨';
                    result.classList.remove('hidden');
                    if (window.audioManager) window.audioManager.playSparkle();
                }, 1500);
            });
        }
    },

    // Pop the Bubble
    bubblePop: {
        name: 'Mystery Bubble',
        icon: '🫧',
        init: (container, message, daysLeft) => {
            container.innerHTML = `
                <div class="activity-bubble-pop">
                    <p class="activity-intro">Pop the magical bubble! 🫧</p>
                    <div class="mystery-bubble" id="mystery-bubble">
                        <span class="bubble-text">?</span>
                    </div>
                    <div class="bubble-message hidden" id="bubble-message">
                        <p class="message-text">${message}</p>
                        <p class="days-remaining">${daysLeft} days left! 🎈</p>
                    </div>
                </div>
            `;

            const bubble = container.querySelector('#mystery-bubble');
            const msg = container.querySelector('#bubble-message');

            bubble.addEventListener('click', () => {
                if (bubble.classList.contains('popped')) return;
                bubble.classList.add('popped');

                if (window.audioManager) window.audioManager.playPop();
                if (window.effectsManager) {
                    const rect = bubble.getBoundingClientRect();
                    window.effectsManager.confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
                }

                setTimeout(() => {
                    msg.classList.remove('hidden');
                    if (window.audioManager) window.audioManager.playReveal();
                }, 500);
            });
        }
    },

    // Star Catcher
    starCatcher: {
        name: 'Catch the Stars',
        icon: '⭐',
        init: (container, message, daysLeft) => {
            let starsCollected = 0;
            const starsNeeded = 5;

            container.innerHTML = `
                <div class="activity-star-catcher">
                    <p class="activity-intro">Catch ${starsNeeded} falling stars! ⭐</p>
                    <div class="star-progress">
                        <span id="star-count">0</span> / ${starsNeeded} ⭐
                    </div>
                    <div class="star-field" id="star-field"></div>
                    <div class="star-message hidden" id="star-message">
                        <p class="message-text">${message}</p>
                        <p class="days-remaining">${daysLeft} days to your celebration! 🎉</p>
                    </div>
                </div>
            `;

            const field = container.querySelector('#star-field');
            const counter = container.querySelector('#star-count');
            const msg = container.querySelector('#star-message');

            const createStar = () => {
                if (starsCollected >= starsNeeded) return;

                const star = document.createElement('div');
                star.className = 'falling-star';
                star.textContent = '⭐';
                star.style.left = `${10 + Math.random() * 80}%`;
                star.style.animationDuration = `${2 + Math.random() * 2}s`;
                field.appendChild(star);

                star.addEventListener('click', () => {
                    if (star.classList.contains('caught')) return;
                    star.classList.add('caught');
                    starsCollected++;
                    counter.textContent = starsCollected;

                    if (window.audioManager) window.audioManager.playSparkle();
                    if (window.effectsManager) {
                        const rect = star.getBoundingClientRect();
                        window.effectsManager.confettiBurst(rect.left, rect.top, 10);
                    }

                    if (starsCollected >= starsNeeded) {
                        field.innerHTML = '<p class="complete-text">✨ Amazing! ✨</p>';
                        msg.classList.remove('hidden');
                        if (window.audioManager) window.audioManager.playReveal();
                    }
                });

                // Remove star after animation
                star.addEventListener('animationend', () => {
                    if (!star.classList.contains('caught')) {
                        star.remove();
                    }
                });
            };

            // Spawn stars
            const starInterval = setInterval(() => {
                if (starsCollected >= starsNeeded) {
                    clearInterval(starInterval);
                    return;
                }
                createStar();
            }, 800);
        }
    },

    // Gift Shake
    giftShake: {
        name: 'Mystery Gift',
        icon: '🎁',
        init: (container, message, daysLeft) => {
            let shakeCount = 0;
            const shakesNeeded = 5;

            container.innerHTML = `
                <div class="activity-gift-shake">
                    <p class="activity-intro">Shake the gift ${shakesNeeded} times! 🎁</p>
                    <div class="shake-progress">
                        <div class="shake-bar">
                            <div class="shake-fill" id="shake-fill" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="mystery-gift" id="mystery-gift">🎁</div>
                    <div class="gift-message hidden" id="gift-message">
                        <p class="message-text">${message}</p>
                        <p class="days-remaining">${daysLeft} days until unwrapping! 🎊</p>
                    </div>
                </div>
            `;

            const gift = container.querySelector('#mystery-gift');
            const fill = container.querySelector('#shake-fill');
            const msg = container.querySelector('#gift-message');

            gift.addEventListener('click', () => {
                if (shakeCount >= shakesNeeded) return;
                shakeCount++;
                fill.style.width = `${(shakeCount / shakesNeeded) * 100}%`;

                gift.classList.add('shaking');
                if (window.audioManager) window.audioManager.playPop();

                setTimeout(() => gift.classList.remove('shaking'), 300);

                if (shakeCount >= shakesNeeded) {
                    setTimeout(() => {
                        gift.style.transform = 'scale(1.5)';
                        gift.textContent = '✨';
                        msg.classList.remove('hidden');
                        if (window.audioManager) window.audioManager.playReveal();
                        if (window.effectsManager) {
                            const rect = gift.getBoundingClientRect();
                            window.effectsManager.confettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
                        }
                    }, 500);
                }
            });
        }
    },

    // Candle Wish
    candleWish: {
        name: 'Make a Wish',
        icon: '🕯️',
        init: (container, message, daysLeft) => {
            container.innerHTML = `
                <div class="activity-candle-wish">
                    <p class="activity-intro">Blow out the candle to make a wish! 🕯️</p>
                    <div class="wish-candle" id="wish-candle">
                        <div class="candle-flame" id="candle-flame">🔥</div>
                        <div class="candle-body">🕯️</div>
                    </div>
                    <p class="blow-hint" id="blow-hint">👆 Tap to blow!</p>
                    <div class="wish-message hidden" id="wish-message">
                        <p class="message-text">${message}</p>
                        <p class="days-remaining">${daysLeft} days until wishes come true! ✨</p>
                    </div>
                </div>
            `;

            const candle = container.querySelector('#wish-candle');
            const flame = container.querySelector('#candle-flame');
            const hint = container.querySelector('#blow-hint');
            const msg = container.querySelector('#wish-message');

            candle.addEventListener('click', () => {
                if (flame.classList.contains('blown')) return;
                flame.classList.add('blown');
                hint.textContent = '💨 Whoosh!';

                if (window.audioManager) window.audioManager.playWoosh();

                setTimeout(() => {
                    flame.textContent = '💫';
                    msg.classList.remove('hidden');
                    if (window.audioManager) window.audioManager.playSparkle();
                }, 600);
            });
        }
    }
};

// Daily poems pool - each day reveals a unique verse
const COUNTDOWN_POEMS = [
    // Day 0 (mod 15) - Stars theme
    `Stars are aligning in the sky,<br>
    A special moment drawing nigh.<br>
    Hold your heart and make a wish,<br>
    Your day will be simply lavish! ✨`,

    // Day 1 - Sunrise theme
    `Each sunrise brings you closer still,<br>
    To a day of joy and thrill.<br>
    The universe has plans so bright,<br>
    For you, dear soul, its pure delight! 🌅`,

    // Day 2 - Magic theme
    `Magic brews in every hour,<br>
    Like a blossoming flower.<br>
    Something wonderful awaits,<br>
    Written in your destined fates! 🌸`,

    // Day 3 - Treasure theme
    `Like a treasure yet to find,<br>
    Your celebration, one of a kind.<br>
    Patience, dear one, hold on tight,<br>
    Your moment comes with pure delight! 💎`,

    // Day 4 - Moon theme
    `The moon counts down each night for you,<br>
    Whispering wishes, tried and true.<br>
    Soon the stars will dance and sing,<br>
    For the joy your day will bring! 🌙`,

    // Day 5 - Rainbow theme
    `Like rainbows after gentle rain,<br>
    Your happiness will bloom again.<br>
    Someone special loves you so,<br>
    And wants the whole wide world to know! 🌈`,

    // Day 6 - Garden theme
    `In the garden of life you grow,<br>
    With beauty only you can show.<br>
    A celebration blooms ahead,<br>
    With love and joy to be widespread! 🌻`,

    // Day 7 - Ocean theme
    `Like waves that kiss the sandy shore,<br>
    Your special day we so adore.<br>
    The ocean whispers just for you,<br>
    A celebration grand and true! 🌊`,

    // Day 8 - Butterfly theme
    `Like a butterfly you'll spread your wings,<br>
    And dance to what the future brings.<br>
    Your metamorphosis is near,<br>
    A brand new wonderful year! 🦋`,

    // Day 9 - Candle theme
    `A candle flickers, soft and bright,<br>
    Preparing for your special night.<br>
    Make a wish upon the flame,<br>
    Your life will never be the same! 🕯️`,

    // Day 10 - Music theme
    `The symphony of life plays on,<br>
    A melody of dusk and dawn.<br>
    Soon it crescendos just for you,<br>
    A birthday celebration true! 🎵`,

    // Day 11 - Dream theme
    `In dreams we often find our way,<br>
    To brighter hopes and better days.<br>
    Keep dreaming, dear, your time is near,<br>
    The best day of your whole year! 💭`,

    // Day 12 - Heart theme
    `A heart that beats with love so true,<br>
    Is sending warmest thoughts to you.<br>
    They're counting moments, just like me,<br>
    For your day of jubilee! 💝`,

    // Day 13 - Adventure theme
    `An adventure waits around the bend,<br>
    A celebration without end.<br>
    Pack your heart with joy and cheer,<br>
    Your magical day is almost here! 🗺️`,

    // Day 14 - Firework theme
    `Like fireworks that light the sky,<br>
    Your spirit soars, forever high.<br>
    Soon the world will celebrate,<br>
    The soul that makes this life so great! 🎆`
];

// Special birthday poem - shown on the actual day
const BIRTHDAY_POEM = `
    🎂 Happy Birthday, Shining Star! 🎂
    
    Today the world celebrates YOU,<br>
    A soul so kind, so brave, so true.<br>
    May laughter fill your every hour,<br>
    And joy rain down in a gentle shower.<br><br>
    
    The candles glow, the wishes soar,<br>
    May life give you and so much more.<br>
    Another year of dreams come true,<br>
    This special day is all for you! 🌟
`;

// Get poem for a specific day
function getDailyPoem(daysRemaining) {
    const index = daysRemaining % COUNTDOWN_POEMS.length;
    return COUNTDOWN_POEMS[index];
}

// Export birthday poem for use elsewhere
window.BIRTHDAY_POEM = BIRTHDAY_POEM;

// Get activity for a specific day
function getDailyActivity(daysRemaining) {
    const activities = Object.keys(DAILY_ACTIVITIES);
    // Use day number to select activity (cycles through)
    const index = daysRemaining % activities.length;
    return DAILY_ACTIVITIES[activities[index]];
}

// Get message for a specific day
function getDailyMessage(daysRemaining) {
    const index = daysRemaining % COUNTDOWN_POEMS.length;
    return COUNTDOWN_POEMS[index];
}

// Initialize countdown mode
function initCountdownMode(name, birthdayDate) {
    const now = new Date();
    const birthday = new Date(birthdayDate);
    // Set birthday to current year
    birthday.setFullYear(now.getFullYear());
    if (birthday < now) {
        birthday.setFullYear(now.getFullYear() + 1);
    }

    const timeDiff = birthday.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Show countdown mode
    document.getElementById('countdown-mode').classList.remove('hidden');
    document.getElementById('countdown-name').textContent = name;

    // Get today's activity and message
    const activity = getDailyActivity(daysRemaining);
    const message = getDailyMessage(daysRemaining);

    // Initialize the daily activity
    const activityContainer = document.getElementById('daily-activity');
    activity.init(activityContainer, message, daysRemaining);

    // Start countdown timer
    updateCountdownTimer(birthday);
    setInterval(() => updateCountdownTimer(birthday), 1000);
}

// Update countdown timer display
function updateCountdownTimer(targetDate) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
        // Birthday reached! Reload to trigger celebration
        window.location.reload();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('timer-days').textContent = String(days).padStart(2, '0');
    document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('timer-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timer-seconds').textContent = String(seconds).padStart(2, '0');
}

// Export for use in main script
window.countdownActivities = {
    init: initCountdownMode,
    getDailyActivity,
    getDailyMessage
};
