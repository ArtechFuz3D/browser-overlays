document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.open-overlay');
    const overlays = document.querySelectorAll('.overlay');
    const closeBtns = document.querySelectorAll('.close-overlay');

    function closeAllOverlays() {
        overlays.forEach(ov => ov.classList.remove('active'));
    }

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetOverlay = document.getElementById(targetId);
            if (targetOverlay) {
                closeAllOverlays();
                targetOverlay.classList.add('active');
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const overlay = btn.closest('.overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Close on click outside content for each overlay
    overlays.forEach(ov => {
        ov.addEventListener('click', (e) => {
            if (e.target === ov) {
                ov.classList.remove('active');
            }
        });
    });
});
