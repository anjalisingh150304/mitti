let videoStream = null;
let captureInterval = null;

let videoDevices = [];
let currentCameraIndex = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultBox = document.getElementById("diseaseResult");
const resultText = document.getElementById("resultText");

/* ===================== UI HELPERS ===================== */

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
}

/* ===================== CAMERA LOGIC ===================== */

async function loadVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(d => d.kind === "videoinput");

    // Prefer back camera if available
    const backIndex = videoDevices.findIndex(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("environment")
    );

    if (backIndex !== -1) {
        currentCameraIndex = backIndex;
    }

    // Hide switch button if only one camera
    if (videoDevices.length < 2) {
        document.getElementById("switchCamBtn").style.display = "none";
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

        document.getElementById("startCamBtn").disabled = true;
        document.getElementById("stopCamBtn").disabled = false;

        video.onloadedmetadata = () => {
            video.play();
            startSendingFrames();
        };

    } catch (err) {
        alert("Camera access denied");
        console.error(err);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    clearInterval(captureInterval);

    document.getElementById("startCamBtn").disabled = false;
    document.getElementById("stopCamBtn").disabled = true;
}

function switchCamera() {
    if (videoDevices.length < 2) return;

    stopCamera();
    currentCameraIndex =
        (currentCameraIndex + 1) % videoDevices.length;

    startCamera();
}

/* ===================== DUMMY AI ENGINE ===================== */

/* ===================== DUMMY AI ENGINE ===================== */

// 1. Expanded Data: Added Pesticide & Dosage info
const dummyDiseases = [
    { 
        name: "Healthy Leaf", 
        severity: "None", 
        pesticide: "No action needed.", 
        dosage: "Keep maintaining water levels." 
    },
    { 
        name: "Powdery Mildew", 
        severity: "Medium", 
        pesticide: "Sulfur Fungicide", 
        dosage: "Mix 3g per liter of water. Spray weekly." 
    },
    { 
        name: "Leaf Rust", 
        severity: "High", 
        pesticide: "Triazole Fungicides", 
        dosage: "Apply immediately. Repeat every 10 days." 
    },
    { 
        name: "Early Blight", 
        severity: "Medium", 
        pesticide: "Copper-based Fungicide", 
        dosage: "Spray every 7-10 days during humid weather." 
    },
    { 
        name: "Leaf Spot", 
        severity: "Low", 
        pesticide: "Neem Oil", 
        dosage: "Dilute 5ml in 1L water. Spray in the evening." 
    }
];

let frameCounter = 0;

// 2. The Disease Detection Engine
function runDummyDiseaseAnalysis() {
    frameCounter++;

    // Phase 1: Scanning
    if (frameCounter < 3) {
        return { type: "scanning", msg: "Scanning leaf surface..." };
    }

    // Phase 2: Processing
    if (frameCounter < 6) {
        return { type: "processing", msg: "Extracting visual features..." };
    }

    // Phase 3: Result (Pick a random disease)
    const disease = dummyDiseases[Math.floor(Math.random() * dummyDiseases.length)];
    return { type: "result", data: disease };
}

// 3. The New Pesticide Engine (Takes the disease data and formats a plan)
function runPesticideEngine(diseaseData) {
    if (diseaseData.name === "Healthy Leaf") {
        return ` Status: Healthy\n Advice: ${diseaseData.dosage}`;
    }

    return ` Detected: ${diseaseData.name} (Severity: ${diseaseData.severity})
 Recommend: ${diseaseData.pesticide}
 Dosage: ${diseaseData.dosage}`;
}

/* ===================== FRAME CAPTURE + ANALYSIS ===================== */

function startSendingFrames() {
    const ctx = canvas.getContext("2d");

    captureInterval = setInterval(() => {
        if (!video.videoWidth) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Simulate AI inference
        const detectionResult = runDummyDiseaseAnalysis();

        resultBox.classList.remove("hidden");

        if (detectionResult.type === "result") {
            // 2. Run Pesticide Engine only if we have a result
            const finalOutput = runPesticideEngine(detectionResult.data);
            
            // Use innerText to preserve line breaks (\n)
            resultText.innerText = finalOutput; 
            
            // Optional: Change color based on health
            if (detectionResult.data.name === "Healthy Leaf") {
                resultBox.style.borderLeft = "5px solid #4CAF50"; // Green
            } else {
                resultBox.style.borderLeft = "5px solid #FF5252"; // Red
            }

        } else {
            // Still scanning or processing
            resultText.innerText = detectionResult.msg;
            resultBox.style.borderLeft = "5px solid #d2721eff"; 
        }

    }, 1500);
}
