document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ambient bubbles ---------- */

  const bubblesEl = document.getElementById('bubbles');
  const BUBBLE_COUNT = 16;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 3 + Math.random() * 6;
    b.style.setProperty('--size', `${size}px`);
    b.style.setProperty('--x', `${Math.random() * 100}%`);
    b.style.setProperty('--dur', `${9 + Math.random() * 10}s`);
    b.style.setProperty('--delay', `${Math.random() * 12}s`);
    b.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
    bubblesEl.appendChild(b);
  }

  /* ---------- screen flow ---------- */

  const screens = Array.from(document.querySelectorAll('.screen'));
  const dots = Array.from(document.querySelectorAll('.progress .dot'));
  const order = ['invite', 'slider', 'dates', 'confirm'];

  function goTo(name) {
    screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
    const idx = order.indexOf(name);
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      d.classList.toggle('is-done', i < idx);
    });
  }

  /* ---------- screen 1: the dodging "No" ---------- */

  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const noHint = document.getElementById('noHint');

  const dodgeLines = [
    "That button doesn't compile.",
    "404 — decline not found.",
    "Nice try. Still no path there.",
    "That's a merge conflict waiting to happen.",
    "Access denied: insufficient charm to click that.",
    "Refactor your answer and try again.",
    "This button is allergic to the word no.",
    "Permission denied (as expected).",
  ];

  let dodgeActive = false;

  function dodgeNoButton() {
    const rect = noBtn.getBoundingClientRect();
    if (!dodgeActive) {
      noBtn.style.position = 'fixed';
      noBtn.style.left = `${rect.left}px`;
      noBtn.style.top = `${rect.top}px`;
      noBtn.style.margin = '0';
      dodgeActive = true;
      // force reflow so the transition applies to the very first move too
      // eslint-disable-next-line no-unused-expressions
      noBtn.offsetWidth;
    }
    const margin = 20;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;
    const newX = margin + Math.random() * Math.max(0, maxX - margin);
    const newY = margin + Math.random() * Math.max(0, maxY - margin);
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;

    noHint.textContent = dodgeLines[Math.floor(Math.random() * dodgeLines.length)];
    noHint.hidden = false;
  }

  document.addEventListener('mousemove', (e) => {
    const inviteScreen = document.querySelector('[data-screen="invite"]');
    if (!inviteScreen.classList.contains('is-active')) return;
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 85) dodgeNoButton();
  });

  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton();
  }, { passive: false });

  noBtn.addEventListener('click', (e) => {
    // it should never actually be clickable, but just in case a keyboard user tabs to it
    e.preventDefault();
    dodgeNoButton();
  });

  yesBtn.addEventListener('click', () => goTo('slider'));

  /* ---------- screen 2: the rigged slider ---------- */

  const funSlider = document.getElementById('funSlider');
  const funReadout = document.getElementById('funReadout');
  const funMsg = document.getElementById('funMsg');
  const toDatesBtn = document.getElementById('toDatesBtn');

  funSlider.addEventListener('input', () => {
    funReadout.textContent = funSlider.value;
  });

  function resetSlider() {
    funSlider.value = 0;
    funReadout.textContent = '0';
    funMsg.hidden = false;
  }

  funSlider.addEventListener('change', resetSlider);
  funSlider.addEventListener('touchend', resetSlider);

  toDatesBtn.addEventListener('click', () => goTo('dates'));

  /* ---------- screen 3: pick a date ---------- */

  const dateGrid = document.getElementById('dateGrid');
  const dateCards = Array.from(document.querySelectorAll('.date-card'));
  const dateStatus = document.getElementById('dateStatus');
  const confirmHeading = document.getElementById('confirmHeading');
  const confirmSub = document.getElementById('confirmSub');

  dateCards.forEach(card => {
    card.addEventListener('click', () => {
      const chosen = card.dataset.date;

      dateCards.forEach(c => { c.disabled = true; c.classList.remove('is-picked'); });
      card.classList.add('is-picked');

      dateStatus.hidden = false;
      dateStatus.textContent = 'pushing to calendar...';

      sendReservation(chosen)
        .then(() => {
          confirmHeading.textContent = 'Reserved.';
          confirmSub.textContent = `${chosen}, after 20:00. Wear something that survives a red wine spill.`;
          goTo('confirm');
        })
        .catch(() => {
          confirmHeading.textContent = 'Reserved anyway.';
          confirmSub.textContent = `${chosen}, after 20:00. The email server flaked — I didn't.`;
          goTo('confirm');
        });
    });
  });

});
