// Location: frontend/scripts/frontdesk.js
// Handles package creation, QR code generation, and barcode display

// Include QRCode.js in your frontdesk.html head:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

async function generatePackage() {
    const recipientName = document.getElementById('recipientName').value;
    const contact = document.getElementById('contact').value;
    const location = document.getElementById('location').value;
    const sender = document.getElementById('sender').value;

    if (!recipientName || !contact) {
        alert('Recipient name and contact are required!');
        return;
    }

    const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName, contact, location, sender })
    });

    const pkg = await res.json();

    const trackURL = `${window.location.origin}/track.html?package_id=${pkg.id}`;

    document.getElementById('barcodeSection').innerHTML = `
        <p>Package ID: ${pkg.id}</p>
        <p>Barcode (for warehouse): ${pkg.id}</p>
        <div id="qrcode"></div>
    `;

    // Generate QR code
    new QRCode(document.getElementById("qrcode"), {
        text: trackURL,
        width: 128,
        height: 128
    });
}

// Form submit
document.getElementById('packageForm').addEventListener('submit', async e => {
    e.preventDefault();
    await generatePackage();
});

// Next button clears form and barcode
document.getElementById('nextPackage').addEventListener('click', () => {
    document.getElementById('packageForm').reset();
    document.getElementById('barcodeSection').innerHTML = '';
});
