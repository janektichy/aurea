document.addEventListener('DOMContentLoaded', () => {
  // --- Countdown Timer Logic ---
  const countDownDate = new Date('2025-05-24T09:30:00+02:00').getTime();

  // Update the countdown every 1 second
  const x = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const d = document.getElementById('d');
    const h = document.getElementById('h');
    const m = document.getElementById('m');
    const s = document.getElementById('s');
    const countdownElement = document.getElementById('countdown');

    if (!d || !h || !m || !s || !countdownElement) {
      return;
    }

    if (distance < 0) {
      clearInterval(x);
      countdownElement.innerHTML = "EXPIRED";
      return;
    }

    d.textContent = String(days).padStart(2, '0');
    h.textContent = String(hours).padStart(2, '0');
    m.textContent = String(minutes).padStart(2, '0');
    s.textContent = String(seconds).padStart(2, '0');
  }, 1000);
}); 