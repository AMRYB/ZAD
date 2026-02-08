let count = 0;
let rounds = 0;
const maxCount = 33;
const beadCount = 7; // Number of visible beads
let activeBeads = [];

const counterEl = document.getElementById('counter');
const roundsEl = document.getElementById('rounds');
const container = document.getElementById('beads-container');
const themeBtn = document.getElementById('theme-btn');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');

// Initialize beads
function initBeads() {
    container.innerHTML = '';
    activeBeads = [];
    // Create a pool of beads, most on the left (uncounted), some on the right (already counted)
    // But to keep it simple and infinite-feeling, we'll keep the current approach but improve the path
    for (let i = 0; i < beadCount; i++) {
        const bead = document.createElement('div');
        bead.className = 'bead';
        container.appendChild(bead);
        activeBeads.push(bead);
    }
    updatePositions(false);
}

function handleCount() {
    count++;
    if (count > maxCount) {
        count = 1;
        rounds++;
    }

    counterEl.textContent = count;
    roundsEl.textContent = `Rounds: ${rounds}`;

    // Animate the "current" bead moving from left to right along the slanted line
    const beadToMove = activeBeads[0];

    // Calculate end position (off screen to the right, following the -5deg slant)
    const angle = -5 * (Math.PI / 180);
    const distance = window.innerWidth;
    const deltaX = distance;
    const deltaY = distance * Math.tan(angle);

    beadToMove.style.transition = 'transform 1.0s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.0s';
    beadToMove.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    beadToMove.style.opacity = '0';

    // After animation, move the bead back to the left start
    setTimeout(() => {
        beadToMove.remove();
        activeBeads.shift();

        const newBead = document.createElement('div');
        newBead.className = 'bead';
        // Start way off to the left
        const startX = -100;
        newBead.style.left = `${startX}px`;
        newBead.style.top = '50%';
        newBead.style.opacity = '0';
        container.appendChild(newBead);
        activeBeads.push(newBead);

        updatePositions(true);
    }, 1000);

    if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }
}

function updatePositions(withAnimation = true) {
    const angle = -5 * (Math.PI / 180); // Match CSS rotate(-5deg)
    const spacing = 60;
    const startX = 20;

    activeBeads.forEach((bead, index) => {
        if (withAnimation) {
            bead.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
        } else {
            bead.style.transition = 'none';
        }

        const x = startX + (index * spacing);
        // Calculate y based on the -5deg angle. 
        // Since container is relative, top: 50% is center.
        // y = x * tan(angle).
        // But x here is relative to container left. Let's adjust to be relative to center.
        const centerX = window.innerWidth / 2;
        const relativeX = x - centerX;
        const relativeY = relativeX * Math.tan(angle);

        bead.style.left = `${x}px`;
        bead.style.top = `calc(50% + ${relativeY}px)`;
        bead.style.opacity = '1';
        bead.style.transform = 'translate(0, 0)';
    });
}

// Click interaction
document.body.addEventListener('click', (e) => {
    if (e.target.closest('#theme-btn') || e.target.closest('#theme-menu') || e.target.closest('header') || e.target.closest('.fixed')) return;
    handleCount();
});

// Theme switching
themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
});

themeOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const primary = opt.dataset.primary;
        const secondary = opt.dataset.secondary;
        document.documentElement.style.setProperty('--bead-primary', primary);
        document.documentElement.style.setProperty('--bead-secondary', secondary);

        themeOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        themeMenu.classList.add('hidden');
    });
});

document.getElementById('reset-all').addEventListener('click', () => {
    count = 0;
    rounds = 0;
    counterEl.textContent = '0';
    roundsEl.textContent = 'Rounds: 0';
    initBeads();
});

// Close theme menu on outside click
document.addEventListener('click', () => {
    themeMenu.classList.add('hidden');
});

initBeads();
