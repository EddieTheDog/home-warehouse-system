// Location: frontend/scripts/warehouse.js
// Displays all shelves/slots, color-codes packages, and allows task completion

async function loadPackages() {
    const res = await fetch('/api/packages');
    return await res.json();
}

function getColor(status) {
    switch (status) {
        case 'Waiting for check-in': return 'yellow';
        case 'Preparing for Movement': return 'orange';
        case 'Ready for delivery': return 'green';
        case 'Temporary Overflow': return 'red';
        case 'Out for Delivery': return 'blue';
        default: return 'gray';
    }
}

async function displayWarehouse() {
    const packages = await loadPackages();

    const totalShelves = 5; // Example: O1–O5
    const maxPerShelf = 3;

    // Group packages by shelf
    const grouped = {};
    packages.forEach(pkg => {
        if (!pkg.shelf) pkg.shelf = 'TM';
        if (!grouped[pkg.shelf]) grouped[pkg.shelf] = [];
        grouped[pkg.shelf].push(pkg);
    });

    const shelfDiv = document.getElementById('shelves');
    shelfDiv.innerHTML = '';

    // Show all shelves
    for (let s = 1; s <= totalShelves; s++) {
        const shelfName = 'O' + s;
        const shelfBlock = document.createElement('div');
        shelfBlock.innerHTML = `<h3>${shelfName}</h3>`;

        for (let slot = 0; slot < maxPerShelf; slot++) {
            const pkg = grouped[shelfName]?.[slot];
            const slotDiv = document.createElement('div');
            slotDiv.style.margin = '2px';
            slotDiv.style.padding = '4px';

            if (pkg) {
                slotDiv.innerText = `${pkg.id} (${pkg.status})`;
                slotDiv.style.backgroundColor = getColor(pkg.status);
                slotDiv.style.cursor = 'pointer';

                // Click to complete check-in task
                slotDiv.onclick = async () => {
                    if (pkg.status === 'Waiting for check-in') pkg.status = 'Ready for delivery';
                    await fetch('/api/packages/' + pkg.id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: pkg.status })
                    });
                    displayWarehouse();
                };
            } else {
                slotDiv.innerText = 'Empty';
                slotDiv.style.backgroundColor = '#eee';
            }

            shelfBlock.appendChild(slotDiv);
        }

        shelfDiv.appendChild(shelfBlock);
    }

    // Display task board
    const tasksDiv = document.getElementById('tasks');
    tasksDiv.innerHTML = '';
    packages.forEach(pkg => {
        if (pkg.status === 'Waiting for check-in' || pkg.status === 'Preparing for Movement') {
            const taskDiv = document.createElement('div');
            taskDiv.innerText = `${pkg.id}: ${pkg.status}`;
            tasksDiv.appendChild(taskDiv);
        }
    });
}

// Refresh every 5 seconds
displayWarehouse();
setInterval(displayWarehouse, 5000);
