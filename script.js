(function () {
  'use strict';

  const targetDate = new Date('2025-10-20T00:00:00');

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const celebration = document.getElementById('celebration');
  const shareBtn = document.getElementById('shareBtn');
  const friendNameInput = document.getElementById('friendName');
  const senderNameInput = document.getElementById('senderName');
  const toast = document.getElementById('toast');
  const greetingOverlay = document.getElementById('greetingOverlay');
  const greetTitle = document.getElementById('greetTitle');
  const greetText = document.getElementById('greetText');
  const closeGreet = document.getElementById('closeGreet');
  const shareCard = document.querySelector('.share-card');

  const SOUND_ENABLED = true;
  let fireAudio = null;
  const FIRECRACKER_SRC = 'firecracker.mp3';
  function ensureFireAudio() {
    if (!SOUND_ENABLED) return null;
    if (fireAudio) return fireAudio;
    try {
      fireAudio = document.createElement('audio');
      fireAudio.id = 'firecrackerSound';
      fireAudio.src = FIRECRACKER_SRC;
      fireAudio.preload = 'auto';
      fireAudio.loop = true;
      fireAudio.volume = 1;
      fireAudio.style.display = 'none';
      document.body.appendChild(fireAudio);
    } catch (e) {
      fireAudio = null;
    }
    return fireAudio;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const now = new Date();
    let diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    if (targetDate - now <= 0) {
      clearInterval(timer);
      triggerCelebration();
    }
  }

  function triggerCelebration() {
    celebration.setAttribute('aria-hidden', 'false');

    for (let i = 0; i < 6; i++) {
      setTimeout(() => createFireworkBurst(), i * 500);
    }

    for (let i = 0; i < 8; i++) {
      setTimeout(() => createSparkColumn(), i * 300);
    }

    setTimeout(() => {
      celebration.innerHTML = '';
      celebration.setAttribute('aria-hidden', 'true');
    }, 8000);
  }

  function createFireworkBurst() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.6) + 50;
    const colors = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f72585', '#fb5607'];
    const count = 24 + Math.floor(Math.random() * 24);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'firework';
      const color = colors[Math.floor(Math.random() * colors.length)];
      el.style.background = color;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const angle = (Math.PI * 2 * i) / count;
      const dist = 80 + Math.random() * 140;
      const dx = Math.cos(angle) * dist + 'px';
      const dy = Math.sin(angle) * dist + 'px';
      el.style.setProperty('--dx', dx);
      el.style.setProperty('--dy', dy);
      el.style.opacity = '1';

      el.style.transition = 'transform 900ms cubic-bezier(.2,.8,.2,1), opacity 900ms linear';
      el.style.transform = 'translate(-50%,-50%) scale(1)';

      celebration.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${dx}), calc(-50% + ${dy})) scale(0.6)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1100 + Math.random() * 400);
    }
  }

  function createSparkColumn() {
    const x = Math.random() * window.innerWidth;
    const startY = window.innerHeight - 80;
    const sparks = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < sparks; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = x + (Math.random() * 40 - 20) + 'px';
      s.style.top = startY + 'px';
      s.style.opacity = '1';
      celebration.appendChild(s);
      setTimeout(() => s.remove(), 1200 + Math.random() * 600);
    }
  }

  update();
  const timer = setInterval(update, 1000);

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 2200);
  }

  function buildShareUrl(name) {
    const base = location.origin + location.pathname;
    const params = new URLSearchParams();
    if (name) params.set('to', name);
    const sender = (senderNameInput && senderNameInput.value.trim()) || '';
    if (sender) params.set('from', sender);
    return base + '?' + params.toString();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); document.body.removeChild(ta); return true; } catch (err) { document.body.removeChild(ta); return false; }
    }
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const name = (friendNameInput && friendNameInput.value.trim()) || '';
      const sender = (senderNameInput && senderNameInput.value.trim()) || '';
      if (!name) {
        showToast('Please enter a friend\'s name');
        return;
      }
      const url = buildShareUrl(name);
      const ok = await copyToClipboard(url);
      if (ok) showToast('Link copied to clipboard'); else showToast('Copy failed — select & copy');
    });
  }

  function parseParams() { return new URLSearchParams(location.search); }
  function openGreeting(name, fromName) {
    if (!greetingOverlay) return;
    const wishes = [
      `May lights fill your life with joy, ${name}! ✨`,
      `Wishing you a Diwali full of sweet moments, ${name}. 🍬❤`,
      `May this Diwali bring you success and happiness, ${name}! 🪔🌟`,
      `Bright Diwali wishes to you, ${name} — celebrate with love! ❤️`,
      `Wishing you and your family a Diwali filled with love, laughter, and cherished memories, ${name}. 💖`,
      `To one of my dearest friends, ${name}, wishing you a Diwali full of joy, warmth, and happiness. 💕`,
      `Hope your Diwali sparkles with love and laughter, ${name}. ✨🎉`,
      `Sending you warm light and big hugs this Diwali, ${name}. 🫶🪔`,
      `May your life glow with lights and your heart glow with love, ${name}. ❤️🪔`
    ];
    const wish = wishes[Math.floor(Math.random() * wishes.length)];
    greetTitle.textContent = `Happy Diwali, ${name}!`;
    greetingOverlay.setAttribute('aria-hidden', 'false');
    // type the wish into the greetText element for a friendlier feel
    (async () => {
      await typeText(greetText, fromName ? `${wish} — from ${fromName} 💌` : `${wish}`);
    })();
    bigCelebration();
    if (shareCard) {
      shareCard.classList.add('highlight');
      setTimeout(() => shareCard.classList.remove('highlight'), 7000);
    }
  }

  // typing helper: types text into an element with a blinking caret
  async function typeText(el, text, speed = 36) {
    if (!el) return;
    el.classList.add('typing');
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      // small jitter in speed for natural feel
      const jitter = Math.random() * (speed * 0.4);
      await new Promise(r => setTimeout(r, speed + jitter));
    }
    el.classList.remove('typing');
  }

  if (closeGreet) closeGreet.addEventListener('click', () => {
    greetingOverlay.setAttribute('aria-hidden', 'true');
  });

  (function checkSharedLink() {
    const params = parseParams();
    const to = params.get('to');
    if (to) {
      const name = decodeURIComponent(to).replace(/[^\w\-\.\'\u00C0-\u017F ]/g, '').slice(0, 32);
      const from = params.get('from');
      const sender = from ? decodeURIComponent(from).replace(/[^\w\-\.\'\u00C0-\u017F ]/g, '').slice(0, 32) : '';
      if (name) {
        setTimeout(() => {
          openGreeting(name, sender);
          try {
            const cleanUrl = location.origin + location.pathname + location.hash;
            history.replaceState(null, '', cleanUrl);
          } catch (e) {
          }
        }, 300);
      }
    }
  })();

  function bigCelebration() {
    startFireAudio();

    for (let i = 0; i < 12; i++) {
      setTimeout(() => createFireworkBurst(), i * 200);
    }
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'firework';
        p.style.width = p.style.height = (4 + Math.random() * 8) + 'px';
        p.style.left = Math.random() * window.innerWidth + 'px';
        p.style.top = Math.random() * window.innerHeight * 0.6 + 40 + 'px';
        p.style.background = ['#ffd166','#ef476f','#06d6a0','#118ab2','#f72585'][Math.floor(Math.random()*5)];
        p.style.opacity = '1';
        celebration.appendChild(p);
        requestAnimationFrame(() => { p.style.transform = `translate(calc(-50% + ${Math.random()*400-200}px), calc(-50% + ${Math.random()*400-200}px)) scale(0.6)`; p.style.opacity = '0'; });
        setTimeout(() => p.remove(), 1600 + Math.random()*800);
      }, i * 60);
    }
    setTimeout(() => { celebration.innerHTML = ''; celebration.setAttribute('aria-hidden','true'); stopFireAudio(); }, 9000);
  }

  async function startFireAudio() {
    const a = ensureFireAudio();
    if (!a) return;
    if (!a.paused) return;
    try {
      const playPromise = a.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise;
      }
    } catch (e) {
    }
  }

  function stopFireAudio() {
    if (!fireAudio) return;
    try {
      fireAudio.pause();
      fireAudio.currentTime = 0;
    } catch (e) {
    }
  }

})();
