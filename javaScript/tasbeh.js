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
            for (let i = 0; i < beadCount; i++) {
                const bead = document.createElement('div');
                bead.className = 'bead';
                // Beads start on the left and spread out
                const offset = i * 60;
                bead.style.left = `${10 - offset}px`;
                bead.style.top = `${50 + (i * 2)}%`;
                container.appendChild(bead);
                activeBeads.push(bead);
            }
        }

        function handleCount() {
            count++;
            if (count > maxCount) {
                count = 1;
                rounds++;
            }

            counterEl.textContent = count;
            roundsEl.textContent = `Rounds: ${rounds}`;

            // Animate beads
            // The first bead moves off screen to the right
            // The others shift right
            // A new bead enters from the left

            // 1. Move the current bead far right
            const beadToMove = activeBeads[0];
            beadToMove.style.transform = `translateX(${window.innerWidth}px)`;
            beadToMove.style.opacity = '0';

            // 2. Remove old bead and add new one
            setTimeout(() => {
                beadToMove.remove();
                activeBeads.shift();

                // Add new bead at the end (left side)
                const newBead = document.createElement('div');
                newBead.className = 'bead';
                const lastBeadLeft = activeBeads.length > 0 ? parseInt(activeBeads[activeBeads.length - 1].style.left) : 10;
                newBead.style.left = `${lastBeadLeft - 60}px`;
                newBead.style.top = '50%';
                newBead.style.opacity = '0';
                container.appendChild(newBead);
                activeBeads.push(newBead);

                // Animate all beads to their next position
                updatePositions();
            }, 50);

            // Vibration feedback
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }

        function updatePositions() {
            activeBeads.forEach((bead, index) => {
                const targetLeft = 10 + (index * 60);
                bead.style.left = `${targetLeft}px`;
                bead.style.opacity = '1';
                // Slight curve for realism
                const curve = Math.sin(index / beadCount * Math.PI) * 20;
                bead.style.top = `${50 + curve}%`;
            });
        }

        // Click interaction
        document.body.addEventListener('click', (e) => {
            // Don't count if clicking controls
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
            updatePositions();
        });

        // Close theme menu on outside click
        document.addEventListener('click', () => {
            themeMenu.classList.add('hidden');
        });

        initBeads();
        setTimeout(updatePositions, 100);