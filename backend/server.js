// Location: backend/server.js
// Simple Express server for your home warehouse system

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend

// JSON database file
const DB_FILE = path.join(__dirname, 'packages.json');

// Load packages
function loadPackages() {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data || '[]');
}

// Save packages
function savePackages(packages) {
    fs.writeFileSync(DB_FILE, JSON.stringify(packages, null, 2));
}

// Routes

// Get all packages
app.get('/api/packages', (req, res) => {
    const packages = loadPackages();
    res.json(packages);
});

// Get single package by ID
app.get('/api/packages/:id', (req, res) => {
    const packages = loadPackages();
    const pkg = packages.find(p => p.id === req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
});

// Create new package
app.post('/api/packages', (req, res) => {
    const packages = loadPackages();
    const newPackage = {
        id: 'PKG-' + Date.now(), // Unique ID
        recipientName: req.body.recipientName || '',
        contact: req.body.contact || '',
        location: req.body.location || '',
        sender: req.body.sender || '',
        status: 'Waiting for check-in',
        shelf: null,
        timestamp: Date.now()
    };
    packages.push(newPackage);
    savePackages(packages);
    res.json(newPackage);
});

// Delete all packages
app.delete('/api/packages', (req, res) => {
    savePackages([]);
    res.json({ message: 'All package data deleted' });
});

// Update package (status, shelf, etc.)
app.put('/api/packages/:id', (req, res) => {
    const packages = loadPackages();
    const pkgIndex = packages.findIndex(p => p.id === req.params.id);
    if (pkgIndex === -1) return res.status(404).json({ error: 'Package not found' });
    packages[pkgIndex] = { ...packages[pkgIndex], ...req.body };
    savePackages(packages);
    res.json(packages[pkgIndex]);
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
