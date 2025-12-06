// Location: frontend/scripts/track.js
// Reads package_id from URL and displays status

async function loadPackageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('package_id');
    if (!id) return;

    const res = await fetch('/api/packages/' + id);
    if (!res.ok) {
        document.getElementById('status').innerText = 'Package not found.';
        return;
    }
    const pkg = await res.json();
    document.getElementById('status').innerHTML = `
        <p>Package ID: ${pkg.id}</p>
        <p>Recipient: ${pkg.recipientName}</p>
        <p>Status: ${pkg.status}</p>
        <p>Location: ${pkg.location || 'Not specified'}</p>
    `;
}

// Run on page load
loadPackageFromURL();
