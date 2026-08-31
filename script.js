// Load pharmacies from JSON and populate list
document.addEventListener('DOMContentLoaded', () => {
    const pharmacyList = document.getElementById('pharmacy-list');
    const searchInput = document.getElementById('search-input');
    const visitedCountEl = document.getElementById('visited-count');
    const totalCountEl = document.getElementById('total-count');

    let pharmacies = [];
    let filtered = [];

    // Load data
    fetch('pharmacies.json')
        .then(response => response.json())
        .then(data => {
            pharmacies = data;
            filtered = [...Array.from({length: data.length}, (_, i) => i+1)]; // not needed
            totalCountEl.textContent = pharmacies.length;
            renderList();
            // Load visited state from localStorage
            const visited = JSON.parse(localStorage.getItem('visitedPharmacies') || '[]');
            visited.forEach(id => {
                const cb = document.querySelector(`input[data-id="${id}"]`);
                if (cb) cb.checked = true;
            });
            updateVisitedCount();
        })
        .catch(err => {
            pharmacyList.innerHTML = '<li>Error loading data</li>';
            console.error(err);
        });

    function renderList() {
        pharmacyList.innerHTML = '';
        filtered.forEach((pharmacy, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" data-id="${index}" ${visitedState(index) ? 'checked' : ''}>
                <label>${pharmacy}</label>
            `;
            const cb = li.querySelector('input');
            cb.addEventListener('change', () => {
                toggleVisited(index);
                if (cb.checked) {
                    li.querySelector('label').classList.add('visited');
                } else {
                    li.querySelector('label').classList.remove('visited');
                }
                updateVisitedCount();
            });
            pharmacyList.appendChild(li);
        });
    }

    function visitedState(index) {
        const visited = JSON.parse(localStorage.getItem('visitedPharmacies') || '[]');
        return visited.includes(index);
    }

    function toggleVisited(index) {
        const visited = JSON.parse(localStorage.getItem('visitedPharmacies') || '[]');
        const idx = visited.indexOf(index);
        if (idx > -1) {
            visited.splice(idx, 1);
        } else {
            visited.push(index);
        }
        localStorage.setItem('visitedPharmacies', JSON.stringify(visited));
    }

    function updateVisitedCount() {
        const visited = JSON.parse(localStorage.getItem('visitedPharmacies') || '[]');
        visitedCountEl.textContent = visited.length;
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (term === '') {
            filtered = [...pharmacies];
        } else {
            filtered = pharmacies.filter(p => p.toLowerCase().includes(term));
        }
        renderList();
        // Reapply visited state after render
        const visited = JSON.parse(localStorage.getItem('visitedPharmacies') || '[]');
        visited.forEach(id => {
            const cb = document.querySelector(`input[data-id="${id}"]`);
            if (cb) cb.checked = true;
        });
        updateVisitedCount();
    });

    // Initialize with all pharmacies
    // (will be set after fetch)
});