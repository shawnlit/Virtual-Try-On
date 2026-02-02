// State
let isLoggedIn = false;
let currentShirt = 'shirt1.jpeg';
let isScanning = false;
let scanInterval = null;

// Elements
const uploadCard = document.getElementById('upload-card');
const loginModal = document.getElementById('loginModal');
const cameraView = document.getElementById('cameraView');
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const ctx = canvasElement.getContext('2d');

// Constants
const SERVER_URL = 'http://localhost:8000'; // Adjust if backend runs elsewhere

// Card Interaction
uploadCard.addEventListener('click', () => {
    if (!isLoggedIn) {
        // Force Login
        loginModal.style.display = 'flex';
    } else {
        // If already logged in, go straight to camera
        startCamera();
    }
});

// Select Shirt
function selectShirt(shirtName) {
    currentShirt = shirtName;
    console.log(`Selected ${currentShirt}`);
    // If camera is open, we could provide visual feedback or just update state
    if (isScanning) {
        // Maybe toast notification?
    }
}

// Open Login Manually
function openLogin() {
    loginModal.style.display = 'flex';
}

// Simulate Login Action
function simulateLogin() {
    isLoggedIn = true;
    loginModal.style.display = 'none';
    // Slight delay to make it feel like a system process
    setTimeout(() => {
        startCamera();
    }, 500);
}

// Open Try On Demo
function openTryOn() {
    if (!isLoggedIn) {
        document.getElementById('loginModal').style.display = 'flex';
    } else {
        startCamera();
    }
}

// VIEW NAVIGATION
function switchView(viewName) {
    // Hide all views
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-collections').classList.add('hidden');
    document.getElementById('view-history').classList.add('hidden');

    // Show selected
    document.getElementById(`view-${viewName}`).classList.remove('hidden');

    // Update Sidebar Active State
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.innerText.toLowerCase().includes(viewName) || (viewName === 'dashboard' && item.innerText === 'Dashboard')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (viewName === 'collections') {
        loadCollections();
    }
}

async function loadCollections() {
    const grid = document.getElementById('collections-grid');
    grid.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`${SERVER_URL}/clothes`);
        const data = await response.json();

        grid.innerHTML = '';
        if (data.clothes && data.clothes.length > 0) {
            data.clothes.forEach(shirt => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => {
                    selectShirt(shirt);
                    openTryOn(); // Auto start try-on
                }

                card.innerHTML = `
                    <div style="height: 150px; background: url('${shirt}') center/contain no-repeat; margin-bottom: 20px;"></div>
                    <h3>${shirt}</h3>
                    <p style="font-size: 0.9rem;">Click to try on</p>
                `;

                // Add hover effect logic
                card.addEventListener('mousemove', e => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                });

                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<p>No items found.</p>';
        }

    } catch (e) {
        grid.innerHTML = '<p>Error loading collections. Is backend running?</p>';
        console.error(e);
    }
}

// Camera Logic
async function startCamera() {
    cameraView.style.display = 'flex';
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoElement.srcObject = stream;

        // Wait for video to load metadata to set canvas size
        videoElement.onloadedmetadata = () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            isScanning = true;
            startPoseDetection();
        };

    } catch (err) {
        alert("Error accessing camera: " + err.message + "\n(Note: Some browsers block camera access if the file is not hosted on a server/localhost)");
        cameraView.style.display = 'none';
    }
}

function closeCamera() {
    cameraView.style.display = 'none';
    isScanning = false;

    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }

    const stream = videoElement.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    videoElement.srcObject = null;

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

function startPoseDetection() {
    if (scanInterval) clearInterval(scanInterval);

    // Capture every 200ms
    scanInterval = setInterval(async () => {
        if (!isScanning) return;

        await processFrame();

    }, 200);
}

const shirtImages = {};

function getShirtImage(src) {
    if (!shirtImages[src]) {
        const img = new Image();
        img.src = src; // Served statically
        shirtImages[src] = img;
    }
    return shirtImages[src];
}

async function processFrame() {
    // 1. Draw video frame to a temp canvas to convert to base64
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(videoElement, 0, 0);

    // 2. Get Data URL
    const start = Date.now();
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8); 

    // 3. Send to backend
    try {
        const response = await fetch(`${SERVER_URL}/pose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl })
        });

        const data = await response.json();

        // 4. Render result
        renderOverlay(data);

    } catch (e) {
        console.error("Pose detection error:", e);
    }
}

function renderOverlay(poseData) {
    // Clear previous drawing
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (!poseData.detected) return;

    const { torso, width_shoulder } = poseData;

    // Get shirt image
    const img = getShirtImage(SERVER_URL + '/' + currentShirt);

    if (!img.complete) return; // Wait for load

    const shirtWidth = width_shoulder * 2.8;

    // Aspect ratio of the shirt image
    const aspectRatio = img.height / img.width;
    const shirtHeight = shirtWidth * aspectRatio;

    ctx.save();

    const centerX = torso.center[0];
    const centerY = torso.center[1];

    // Translate to center
    ctx.translate(centerX, centerY);

    ctx.rotate((torso.angle * Math.PI) / 180);

    // Draw image centered at (0,0)
    ctx.drawImage(img, -shirtWidth / 2, -shirtHeight / 2, shirtWidth, shirtHeight);

    ctx.restore();
}

// Mouse Hover Effect
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
