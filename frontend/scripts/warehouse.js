// Location: frontend/scripts/warehouse.js
// Warehouse script: shows all shelves, all slots, and allows check-in, move, ready-for-delivery

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

// Function to update package via API
async function updatePackage(pkg) {
    await fetch('/api/packages/' + pkg.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg)
    });
}

// Display warehouse and tasks
async function displayWarehouse() {
    const packages = await loadPackages();
    const totalShelves = 5; // O1-O5
    const maxPerShelf = 3;

    // Assign shelves automatically if empty
    packages.forEach(pkg => {
        if (!pkg.shelf || pkg.shelf === 'TM') {
            let assigned = false;
            for (let s = 1; s <= totalShelves; s++) {
                const shelfName = 'O' + s;
                const count = packages.filter(p => p.shelf === shelfName).length;
                if (count < maxPerShelf) {
                    pkg.shelf = shelfName;
                    if (pkg.status === 'Temporary Overflow') pkg.status = 'Waiting for check-in';
                    assigned = true;
                    break;
                }
            }
            if (!assigned) pkg.shelf = 'TM'; // still overflow
        }
    });

    // Save updated packages
    for (const pkg of packages) await updatePackage(pkg);

    // Group by shelf
    const grouped = {};
    packages.forEach(pkg => {
        if (!grouped[pkg.shelf]) grouped[pkg.shelf] = [];
        grouped[pkg.shelf].push(pkg);
    });

    const shelfDiv = document.getElementById('shelves');
    shelfDiv.innerHTML = '';

    // Display all shelves and slots
    for (let s = 1; s <= totalShelves; s++) {
        const shelfName = 'O' + s;
        const shelfBlock = document.createElement('div');
        shelfBlock.innerHTML = `<h3>${shelfName}</h3>`;

        for (let slot = 0; slot < maxPerShelf; slot++) {
            const pkg = grouped[shelfName]?.[slot];
            const slotDiv = document.createElement('div');
            slotDiv.style.margin = '2px';
            slotDiv.style.padding = '4px';
            slotDiv.style.border = '1px solid #ccc';

            if (pkg) {
                slotDiv.innerText = `${pkg.id} (${pkg.status})`;
                slotDiv.style.backgroundColor = getColor(pkg.status);
                slotDiv.style.cursor = 'pointer';

                // Click to perform warehouse task
                slotDiv.onclick = async () => {
                    let action = prompt(
                        `Select task for ${pkg.id}:\n` +
                        `1 = Complete Check-in\n` +
                        `2 = Move to another shelf\n` +
                        `3 = Mark Ready for Delivery`
                    );
                    if (!action) return;

                    if (action === '1' && pkg.status === 'Waiting for check-in') {
                        pkg.status = 'Ready for delivery';
                        alert(`${pkg.id} check-in completed.`);
                    } else if (action === '2') {
                        let newShelf = prompt('Enter new shelf (O1-O5 or TM)');
                        if (!newShelf) return;
                        pkg.shelf = newShelf;
                        pkg.status = newShelf === 'TM' ? 'Temporary Overflow' : 'Preparing for Movement';
                        alert(`${pkg.id} moved to ${newShelf}.`);
                    } else if (action === '3') {
                        pkg.status = 'Ready for delivery';
                        alert(`${pkg.id} marked Ready for Delivery.`);
                    } else {
                        alert('Invalid action.');
                        return;
                    }

                    await updatePackage(pkg);
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

    // Task board
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

// Initial load + refresh every 5 seconds
displayWarehouse();
setInterval(displayWarehouse, 5000);
