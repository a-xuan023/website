// Projects page
(() => {
    const panel = document.getElementById('project-panel');
    if (!panel) return;
    const body = panel.querySelector('.panel-inner');
    const pond = () => window.KoiPond; // the pond's controls, from pond.js

    const open = (id, fromX, fromY) => {
        const details = document.getElementById('details-' + id);
        if (!details) return;

        // Fill the panel with this project's details
        body.replaceChildren(details.content.cloneNode(true));

        // Ripple first, then the panel appears a moment later
        if (pond()) pond().splash(fromX, fromY);
        setTimeout(() => {
            panel.showModal();
            panel.scrollTop = 0;
            if (pond()) pond().gather(panel.getBoundingClientRect());
        }, 400);

        // Put the project in the address bar, so the link can be shared
        history.replaceState(null, '', '#' + id);
    };

    const close = () => panel.close();

    // When the panel closes (button, Esc key, or clicking outside), let the koi go
    panel.addEventListener('close', () => {
        if (pond()) pond().release();
        history.replaceState(null, '', location.pathname);
    });

    panel.querySelector('.panel-close').addEventListener('click', close);

    // Clicking the dim area outside the panel closes it
    panel.addEventListener('click', (e) => {
        if (e.target === panel) close();
    });

    // Each card opens its own project
    for (const card of document.querySelectorAll('.card')) {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            open(card.id, e.clientX, e.clientY);
        });
    }

    // Arriving from a link like projects.html#project-1 opens that project
    const fromLink = location.hash.slice(1);
    if (fromLink) {
        const card = document.getElementById(fromLink);
        if (card) {
            const r = card.getBoundingClientRect();
            open(fromLink, r.left + r.width / 2, r.top + r.height / 2);
        }
    }
})();