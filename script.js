// Load pharmacies per day from JSON and populate list
document.addEventListener('DOMContentLoaded', () => {
    const pharmacyList = document.getElementById('pharmacy-list');
    const searchInput = document.getElementById('search-input');
    const visitedCountEl = document.getElementById('visited-count');
    const totalCountEl = document.getElementById('total-count');
    const tabButtons = document.querySelectorAll('.tab-btn');

    let rutero = {}; // { dia1: [...], dia2: [...] }
    let currentDay = 'dia1'; // default
    let filtered = []; // indices of rutero[currentDay] after search
    let visitedPerDay = {}; // { dia1: [indices], ... }

    // Load data
    fetch('rutero.json')
        .then(response => response.json())
        .then(data => {
            rutero = data;
            currentDay = Object.keys(rutero)[0]; // first day
            // Initialize visitedPerDay from localStorage
            for (const day in rutero) {
                visitedPerDay[day] = JSON.parse(localStorage.getItem(`visited_${day}`) || '[]');
            }
            // Set UI
            updateTabButtons();
            totalCountEl.textContent = rutero[currentDay].length;
            renderList();
            updateVisitedCount();
        })
        .catch(err => {
            pharmacyList.innerHTML = '<li>Error loading data</li>';
            console.error(err);
        });

    function updateTabButtons() {
        tabButtons.forEach(btn => {
            const day = btn.dataset.day;
            if (day === currentDay) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function renderList() {
        pharmacyList.innerHTML = '';
        const list = rutero[currentDay];
        filtered.forEach((index) => {
            const pharmacy = list[index];
            const li = document.createElement('li');
            const isVisited = visitedPerDay[currentDay].includes(index);
            li.innerHTML = `
                <input type="checkbox" data-index="${index}" ${isVisited ? 'checked' : ''}>
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

    function toggleVisited(index) {
        const day = currentDay;
        const visited = visitedPerDay[day] || [];
        const idx = visited.indexOf(index);
        if (idx > -1) {
            visited.splice(idx, 1);
        } else {
            visited.push(index);
        }
        visitedPerDay[day] = visited;
        localStorage.setItem(`visited_${day}`, JSON.stringify(visited));
    }

    function updateVisitedCount() {
        const count = visitedPerDay[currentDay] ? visitedPerDay[currentDay].length : 0;
        visitedCountEl.textContent = count;
        totalCountEl.textContent = rutero[currentDay] ? rutero[currentDay].length : 0;
    }

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.dataset.day;
            if (day !== currentDay) {
                currentDay = day;
                updateTabButtons();
                // Load visited for this day from storage (already in visitedPerDay)
                // Reset filtered to all items
                filtered = [...Array.from({length: rutero[currentDay].length}, (_, i) => i)];
                renderList();
                updateVisitedCount();
            }
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const list = rutero[currentDay];
        if (term === '') {
            filtered = [...Array.from({length: list.length}, (_, i) => i)];
        } else {
            filtered = [];
            list.forEach((pharmacy, index) => {
                if (pharmacy.toLowerCase().includes(term)) {
                    filtered.push(index);
                }
            });
        }
        renderList();
        // Reapply visited state after render (checkboxes already set via data-index)
        // No need to do anything else because renderList creates checkboxes with correct checked state from visitedPerDay
        updateVisitedCount();
    });

    // Initialize filtered to all items of first day after data loaded (done in .then)
});