let videoStream = null;
let captureInterval = null;

let videoDevices = [];
let currentCameraIndex = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const diseaseStatus = document.getElementById("diseaseStatus");
const cameraStatus = document.getElementById("cameraStatus");


/* ================== DUMMY DATA ================== */

const dummyCropRecommendations = [
    { crop: "rice", confidence: 0.78 },
    { crop: "maize", confidence: 0.66 },
    { crop: "wheat", confidence: 0.54 },
    { crop: "cotton", confidence: 0.45 }
];

const dummyFertilizerAdvice = {
    rice: [ "Apply nitrogen-rich fertilizer", "Maintain standing water", "Apply zinc if chlorosis appears" ],
    maize: [ "Apply NPK in split doses", "Side-dress nitrogen", "Ensure well-drained soil" ],
    wheat: [ "Nitrogen at tillering stage", "Maintain moderate irrigation", "Potassium for lodging resistance" ],
    cotton: [ "Avoid excess nitrogen", "Apply phosphorus for roots", "Monitor magnesium deficiency" ]
};

// ADDED: Pesticide & Dosage Data
const dummyDiseases = [
    { 
        label: "Healthy Leaf", 
        confidence: 0.92, 
        pesticide: "No action needed.", 
        dosage: "Maintain regular care." 
    },
    { 
        label: "Powdery Mildew", 
        confidence: 0.67, 
        pesticide: "Sulfur Fungicide", 
        dosage: "Mix 3g per liter. Spray weekly." 
    },
    { 
        label: "Leaf Rust", 
        confidence: 0.74, 
        pesticide: "Triazole Fungicides", 
        dosage: "Apply immediately. Repeat in 10 days." 
    },
    { 
        label: "Early Blight", 
        confidence: 0.61, 
        pesticide: "Copper-based Fungicide", 
        dosage: "Spray every 7-10 days." 
    }
];
/* ================== FULL CHECK FLOW ================== */

function startFullCheck() {
    const btn = document.getElementById("startFullCheckBtn");
    const loader = document.getElementById("fullLoader");
    const loaderText = document.getElementById("loaderText");
    const result = document.getElementById("fullResult");
    const cropTable = document.getElementById("fullCropTable");

    btn.disabled = true;
    loader.classList.remove("hidden");
    result.classList.add("hidden");
    cropTable.innerHTML = "";

    loaderText.textContent = "Reading soil sensors & recommending crops…";

    /* Simulate AI soil analysis delay */
    setTimeout(() => {
        dummyCropRecommendations.forEach(crop => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${capitalize(crop.crop)}</td>
                <td>${scoreToLabel(crop.confidence)}</td>
            `;
            row.style.cursor = "pointer";
            row.onclick = () => showFullCropDetails(crop.crop);
            cropTable.appendChild(row);
        });

        result.classList.remove("hidden");

        loaderText.textContent = "Starting camera for disease detection…";
        startCamera();

        loader.classList.add("hidden");
        btn.disabled = false;
    }, 1300);
}

/* ================== CAMERA HANDLING ================== */

async function loadVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(d => d.kind === "videoinput");

    const backIndex = videoDevices.findIndex(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("environment")
    );

    if (backIndex !== -1) currentCameraIndex = backIndex;

    // Show switch button ONLY if we have multiple cameras
    if (videoDevices.length > 1) {
        const switchBtn = document.getElementById("switchCamBtn");
        if(switchBtn) switchBtn.style.display = "inline-flex";
    }


    if (videoDevices.length > 1) {
        document.getElementById("switchCamBtn").style.display = "inline-flex";
    }
}

async function startCamera() {
    try {
        // 1. Ensure devices are loaded first
        if (videoDevices.length === 0) {
            await loadVideoDevices();
        }

        // ---------------------------------------------------------
        // UI UPDATE: Show "Switch" button ONLY if multiple cameras exist
        // ---------------------------------------------------------
        const switchBtn = document.getElementById("switchCamBtn");
        
        if (switchBtn) {
            if (videoDevices.length > 1) {
                // Show button (use 'inline-flex' to keep icon aligned)
                switchBtn.style.display = "inline-flex"; 
            } else {
                // Hide button completely if only 1 camera
                switchBtn.style.display = "none";        
            }
        }
        // ---------------------------------------------------------

        const deviceId = videoDevices[currentCameraIndex]?.deviceId;

        videoStream = await navigator.mediaDevices.getUserMedia({
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: "environment" }
        });

        video.srcObject = videoStream;
        cameraStatus.textContent = "📡 Camera active — scanning leaf…";

        video.onloadedmetadata = () => {
            video.play();
            startSendingFrames();
        };

    } catch (err) {
        console.error(err);
        cameraStatus.textContent = "Camera access denied";
    }
}

function switchCamera() {
    if (videoDevices.length < 2) return;
    stopCamera();
    currentCameraIndex = (currentCameraIndex + 1) % videoDevices.length;
    startCamera();
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
    clearInterval(captureInterval);
}


/* ================== DUMMY DISEASE + PESTICIDE ANALYSIS ================== */

let frameCounter = 0;
// We store the final decision so it doesn't flicker
let finalDiseaseDecision = null;

function simulateDiseaseDetection() {
    frameCounter++;

    if (frameCounter < 3) {
        return { status: "Scanning leaf surface…", data: null };
    }

    if (frameCounter < 6) {
        return { status: "Extracting visual features…", data: null };
    }

    // Pick a disease once and stick to it (prevents flickering)
    if (!finalDiseaseDecision) {
        finalDiseaseDecision = dummyDiseases[Math.floor(Math.random() * dummyDiseases.length)];
    }

    return {
        status: "Diagnosis complete",
        data: finalDiseaseDecision,
        confidence: finalDiseaseDecision.confidence
    };
}
/* ================== FRAME CAPTURE ================== */

function startSendingFrames() {
    const ctx = canvas.getContext("2d");

    captureInterval = setInterval(() => {
        if (!video.videoWidth) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const result = simulateDiseaseDetection();

        if (result.data) {
            // SHOW PESTICIDE INFO
            const d = result.data;
            diseaseStatus.innerHTML = `
                <strong>${d.label}</strong> (${Math.round(d.confidence * 100)}%)<br>
                <span style="font-size: 0.9em; color: #ffeb3b;">
                    💊 Recommend: ${d.pesticide} <br> 
                    💧 Dosage: ${d.dosage}
                </span>
            `;
            // Optional: Add border color based on health
            if (d.label === "Healthy Leaf") {
                diseaseStatus.style.borderLeft = "4px solid #4CAF50";
            } else {
                diseaseStatus.style.borderLeft = "4px solid #FF5252";
            }
        } else {
            // SHOW SCANNING STATUS
            diseaseStatus.textContent = result.status;
            diseaseStatus.style.borderLeft = "4px solid #2196F3";
        }

    }, 1500);
}

/* ================== CROP DETAILS ================== */

function showFullCropDetails(cropName) {
    const box = document.getElementById("fullCropDetails");
    const title = document.getElementById("fullDetailTitle");
    const list = document.getElementById("fullDetailList");

    title.textContent = `🌾 ${capitalize(cropName)} – Soil & Fertilizer Advice`;
    list.innerHTML = "";

    const advice =
        dummyFertilizerAdvice[cropName] ||
        ["Apply balanced fertilizer based on soil test"];

    advice.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });
}

/* ================== UTILITIES ================== */

function capitalize(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
}

function scoreToLabel(s) {
    if (s >= 0.7) return "High";
    if (s >= 0.5) return "Medium";
    return "Low";
}

function getLanguage() {
    return localStorage.getItem("lang") || "en";
}
