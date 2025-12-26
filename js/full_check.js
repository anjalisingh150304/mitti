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
    rice: [
        "Apply nitrogen-rich fertilizer during early growth stage",
        "Maintain standing water during vegetative phase",
        "Apply zinc if chlorosis appears"
    ],
    maize: [
        "Apply NPK in split doses",
        "Side-dress nitrogen after 30 days",
        "Ensure well-drained soil conditions"
    ],
    wheat: [
        "Nitrogen application at tillering stage",
        "Maintain moderate irrigation schedule",
        "Potassium application improves lodging resistance"
    ],
    cotton: [
        "Avoid excess nitrogen during flowering",
        "Apply phosphorus for root development",
        "Monitor magnesium deficiency"
    ]
};

const dummyDiseases = [
    { label: "Healthy Leaf", confidence: 0.92 },
    { label: "Powdery Mildew", confidence: 0.67 },
    { label: "Leaf Rust", confidence: 0.74 },
    { label: "Early Blight", confidence: 0.61 }
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

    if (videoDevices.length > 1) {
        document.getElementById("switchCamBtn").style.display = "inline-flex";
    }
}

async function startCamera() {
    try {
        if (videoDevices.length === 0) {
            await loadVideoDevices();
        }

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

/* ================== DUMMY DISEASE ANALYSIS ================== */

let frameCounter = 0;

function simulateDiseaseDetection() {
    frameCounter++;

    if (frameCounter < 3) {
        return { status: "Scanning leaf surface…" };
    }

    if (frameCounter < 6) {
        return { status: "Extracting visual features…" };
    }

    const disease =
        dummyDiseases[Math.floor(Math.random() * dummyDiseases.length)];

    return {
        status: "Diagnosis complete",
        label: disease.label,
        confidence: disease.confidence
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

        diseaseStatus.textContent =
            `${result.status} ${result.label ? "|| " + result.label : ""} ${
                result.confidence ? "|| " + Math.round(result.confidence * 100) + "%" : ""
            }`;

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
