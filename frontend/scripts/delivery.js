// Location: frontend/scripts/delivery.js
// Delivery interface for drivers: claim packages, check barcode, mark delivered

async function loadPackages() {
    const res = await fetch('/api/packages');
    return await res.json();
}

function getColor(status) {
    switch(status) {
        case 'Ready for delivery': return 'green';
        case 'Preparing for Delivery': return 'orange';
        case 'Out for Delivery': return 'blue';
        case 'Delivered': return 'gray';
        default: return 'red';
    }
}

async function updatePackage(pkg) {
    await fetch('/api/packages/' + pkg.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg)
    });
}

async function claimPackage() {
    const input = document.getElementById('deliveryScan').value.trim();
    if (!input) return alert('Please scan or type a package ID');

    const packages = await loadPackages();
    const pkg = packages.find(p => p.id === input);

    if (!pkg) return alert('Package not found');
    if (pkg.status !== 'Ready for delivery') return alert('Package not ready for delivery');

    // Claim package
    pkg.status = 'Preparing for Delivery';
    await updatePackage(pkg);
    alert(`${pkg.id} claimed. Proceed with delivery checklist.`);

    document.getElementById('deliveryScan').value = '';
    displayDelivery();
}

async function markDelivered(id) {
    const packages = await loadPackages();
    const pkg = packages.find(p => p.id === id);

    if (!pkg) return alert('Package not found');
    pkg.status = 'Delivered';
    await updatePackage(pkg);
    displayDelivery();
}

async function displayDelivery() {
    const packages = await loadPackages();
    const dockDiv = document.getElementById('shippingDock');
    dockDiv.innerHTML = '';

    packages
        .filter(p => p.status === 'Ready for delivery' || p.status === 'Preparing for Delivery')
        .forEach(pkg => {
            const pkgDiv = document.createElement('div');
            pkgDiv.innerText = `${pkg.id} (${pkg.status})`;
            pkgDiv.style.padding = '4px';
            pkgDiv.style.margin = '2px 0';
            pkgDiv.style.border = '1px solid #bbb';
            pkgDiv.style.borderRadius = '6px';
            pkgDiv.style.backgroundColor = getColor(pkg.status);

            if (pkg.status === 'Preparing for Delivery') {
                const deliverBtn = document.createElement('button');
                deliverBtn.innerText = 'Mark Delivered';
                deliverBtn.onclick = () => markDelivered(pkg.id);
                deliverBtn.style.marginLeft = '8px';
                pkgDiv.appendChild(deliverBtn);
            }

            dockDiv.appendChild(pkgDiv);
        });
}

// Event listener for claiming packages
document.getElementById('claimButton').addEventListener('click', claimPackage);

// Initial load and refresh every 5s
displayDelivery();
setInterval(displayDelivery, 5000);
