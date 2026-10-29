/* =========================
   1. MOBILE MENU
========================= */
const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "✕" : "☰";
}

menuButton.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));


/* =========================
   2. SCROLL REVEAL
========================= */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: "0px 0px 30px 0px" });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));


/* =========================
   3. FLOATING WISH BUTTON
   (hides while the wishing sky is on screen)
========================= */
const wishSection = document.getElementById("wish");
const wishFab = document.getElementById("wishFab");

new IntersectionObserver(([entry]) => {
    wishFab.classList.toggle("hidden", entry.isIntersecting);
}, { threshold: 0.25 }).observe(wishSection);


/* =========================
   4. TWINKLING STARFIELD + SHOOTING STARS
========================= */
const canvas = document.getElementById("skyCanvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let stars = [];
let shooters = [];
let width = 0;
let height = 0;

function resizeSky() {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.round((width * height) / 5500);
    stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.006
    }));
}

function addShootingStar(startX, startY) {
    shooters.push({
        x: startX ?? Math.random() * width * 0.8,
        y: startY ?? Math.random() * height * 0.4,
        vx: 7 + Math.random() * 4,
        vy: 3 + Math.random() * 2,
        life: 1
    });
}

function drawSky() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(s => {
        s.phase += s.speed;
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 236, 214, ${alpha})`;
        ctx.fill();
    });

    shooters = shooters.filter(sh => sh.life > 0);
    shooters.forEach(sh => {
        const tailX = sh.x - sh.vx * 9;
        const tailY = sh.y - sh.vy * 9;
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 230, 190, ${sh.life})`);
        grad.addColorStop(1, "rgba(255, 230, 190, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.014;
    });

    if (!reduceMotion) {
        if (Math.random() < 0.004) addShootingStar();
        requestAnimationFrame(drawSky);
    }
}

resizeSky();
drawSky();
window.addEventListener("resize", () => {
    resizeSky();
    if (reduceMotion) drawSky();
});


/* =========================
   5. SEND A WISH TO THE SKY
========================= */
const wishForm = document.getElementById("wishForm");
const wishInput = document.getElementById("wishInput");
const wishButton = document.getElementById("wishButton");
const wishField = document.getElementById("wishField");
const wishEmpty = document.getElementById("wishEmpty");
const wishCount = document.getElementById("wishCount");
const wishReader = document.getElementById("wishReader");
const toast = document.getElementById("toast");

const STORAGE_KEY = "joong-wishes";
const MAX_WISHES = 40;
let wishes = [];
let toastTimer;

function loadWishes() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function saveWishes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (error) {
        /* storage unavailable: wishes simply won't persist */
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function updateCount() {
    wishCount.textContent = wishes.length;
    wishEmpty.style.display = wishes.length ? "none" : "grid";
}

function placeStar(wish) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "wish-star";
    star.textContent = "✦";
    star.style.left = wish.x + "%";
    star.style.top = wish.y + "%";
    star.style.setProperty("--d", (Math.random() * 3).toFixed(2) + "s");
    star.setAttribute("aria-label", "Wish: " + wish.text);
    star.addEventListener("click", () => { wishReader.textContent = "“" + wish.text + "”"; });
    wishField.appendChild(star);
    return star;
}

function burstAt(x, y) {
    if (reduceMotion) return;
    const symbols = ["✦", "✧", "♡", "✦"];
    for (let i = 0; i < 14; i++) {
        const spark = document.createElement("span");
        spark.className = "spark";
        spark.textContent = symbols[i % symbols.length];
        spark.style.left = x + "px";
        spark.style.top = y + "px";
        spark.style.fontSize = 10 + Math.random() * 12 + "px";
        document.body.appendChild(spark);

        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const distance = 50 + Math.random() * 70;
        const move = spark.animate([
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0.2)`, opacity: 0 }
        ], { duration: 900 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)" });
        move.onfinish = () => spark.remove();
    }
}

function sendWish(text) {
    const clean = text.trim().slice(0, 80);
    if (!clean) return;

    const buttonBox = wishButton.getBoundingClientRect();
    burstAt(buttonBox.left + buttonBox.width / 2, buttonBox.top + buttonBox.height / 2);

    const wish = {
        text: clean,
        x: Math.round(8 + Math.random() * 84),
        y: Math.round(10 + Math.random() * 70)
    };

    wishes.push(wish);
    if (wishes.length > MAX_WISHES) {
        wishes.shift();
        const oldest = wishField.querySelector(".wish-star");
        if (oldest) oldest.remove();
    }
    saveWishes();

    // a bright spark rises from the bottom of the sky to its final spot
    const fieldBox = wishField.getBoundingClientRect();
    const rising = document.createElement("span");
    rising.className = "rising";
    rising.textContent = "✦";
    rising.style.left = "50%";
    rising.style.top = fieldBox.height + "px";
    wishField.appendChild(rising);

    const targetX = (wish.x / 100) * fieldBox.width - fieldBox.width / 2;
    const targetY = (wish.y / 100) * fieldBox.height - fieldBox.height;
    const duration = reduceMotion ? 1 : 1600;

    const flight = rising.animate([
        { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
        { transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1.3)`, opacity: 1 }
    ], { duration, easing: "cubic-bezier(.3,.1,.2,1)", fill: "forwards" });

    flight.onfinish = () => {
        rising.remove();
        placeStar(wish);
        updateCount();
        wishReader.textContent = "“" + wish.text + "”";
        if (!reduceMotion) {
            const skyBox = canvas.getBoundingClientRect();
            const targetTop = (wish.y / 100) * fieldBox.height + fieldBox.top - skyBox.top;
            const targetLeft = (wish.x / 100) * fieldBox.width + fieldBox.left - skyBox.left;
            addShootingStar(Math.max(0, targetLeft - 160), Math.max(0, targetTop - 70));
        }
        showToast("Your wish is now a star in the sky ✦");
    };

    updateCount();
    wishInput.value = "";
}

wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendWish(wishInput.value);
});

document.querySelectorAll("#wishChips button").forEach(chip => {
    chip.addEventListener("click", () => {
        wishInput.value = chip.dataset.wish;
        wishInput.focus();
    });
});

wishes = loadWishes();
wishes.forEach(placeStar);
updateCount();
