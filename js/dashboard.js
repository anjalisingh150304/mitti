/* ===================== UI CONTROLS ===================== */

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
}

function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector(".theme-toggle i");

    if (body.classList.contains("dark")) {
        body.classList.replace("dark", "light");
        icon.className = "fa-solid fa-moon";
        localStorage.setItem("theme", "light");
    } else {
        body.classList.replace("light", "dark");
        icon.className = "fa-solid fa-sun";
        localStorage.setItem("theme", "dark");
    }
}

/* Load saved theme */
window.onload = () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.add(savedTheme);

    const icon = document.querySelector(".theme-toggle i");
    icon.className = savedTheme === "dark"
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";
};

/* ===================== DUMMY DATA ===================== */

function getDummySoilAnalysis() {
    return {
        soil: {
            N: 42,
            P: 28,
            K: 30,
            ph: 6.6,
            temperature: 26,
            humidity: 58
        },
        recommendations: [
            { crop: "rice", confidence: 0.78 },
            { crop: "maize", confidence: 0.66 },
            { crop: "wheat", confidence: 0.54 },
            { crop: "cotton", confidence: 0.42 }
        ]
    };
}

function getDummyFertilizerAdvice(crop) {
    const data = {
        rice: [
            "Apply nitrogen-rich fertilizer during early growth stage",
            "Maintain shallow water level during vegetative phase",
            "Apply zinc supplement if yellowing appears"
        ],
        maize: [
            "Apply NPK fertilizer in 2 split doses",
            "Side-dress nitrogen at 30–35 days",
            "Ensure well-drained soil conditions"
        ],
        wheat: [
            "Apply nitrogen at tillering and heading stage",
            "Ensure proper irrigation schedule",
            "Apply potassium for lodging resistance"
        ],
        cotton: [
            "Avoid excess nitrogen during flowering",
            "Apply phosphorus for root strengthening",
            "Monitor magnesium deficiency symptoms"
        ]
    };

    return data[crop] || [
        "Apply balanced NPK fertilizer based on soil test",
        "Ensure adequate irrigation",
        "Monitor micronutrient deficiencies"
    ];
}

/* ===================== MAIN LOGIC ===================== */

function checkSoil() {
    const btn = document.getElementById("checkSoilBtn");
    const loader = document.getElementById("loader");
    const result = document.getElementById("resultArea");
    const tableBody = document.getElementById("cropTableBody");
    const detailsBox = document.getElementById("cropDetails");

    btn.disabled = true;
    loader.classList.remove("hidden");
    result.classList.add("hidden");
    detailsBox.classList.add("hidden");
    tableBody.innerHTML = "";

    /* Simulated soil data (sensor placeholder) */
    const sensorData = {
        N: 40,
        P: 30,
        K: 25,
        temperature: 25,
        humidity: 55,
        ph: 6.5,
        rainfall: 100
    };

    /* Simulated AI processing delay */
    setTimeout(() => {
        const data = getDummySoilAnalysis();
        const soil = data.soil;

        document.getElementById("soilN").textContent = soil.N;
        document.getElementById("soilP").textContent = soil.P;
        document.getElementById("soilK").textContent = soil.K;
        document.getElementById("soilPH").textContent = soil.ph;
        document.getElementById("soilTemp").textContent = soil.temperature;
        document.getElementById("soilMoisture").textContent = soil.humidity;

        data.recommendations.forEach(crop => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${capitalize(crop.crop)}</td>
                <td>Suitable</td>
                <td>Seasonal</td>
                <td>${scoreToLabel(crop.confidence)}</td>
            `;

            row.onclick = () => showCropDetails(crop.crop);
            tableBody.appendChild(row);
        });

        loader.classList.add("hidden");
        result.classList.remove("hidden");
        btn.disabled = false;
    }, 1200); // fake analysis time
}

function showCropDetails(cropName) {
    const list = document.getElementById("detailList");
    const box = document.getElementById("cropDetails");

    list.innerHTML = "";

    const advice = getDummyFertilizerAdvice(cropName);
    advice.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });
}

/* ===================== UTILITIES ===================== */

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function scoreToLabel(score) {
    if (score >= 0.7) return "High";
    if (score >= 0.5) return "Medium";
    return "Low";
}

function changeLanguage() {
    const lang = document.getElementById("languageSelect").value;
    localStorage.setItem("lang", lang);
    refreshCurrentView();
}

function refreshCurrentView() {
    const path = window.location.pathname;

    if (path.includes("/recommend/crop")) {
        checkSoil();
    } 
    else if (path.includes("/full/check")) {
        console.log("Full check simulation (dummy mode)");
    } 
    else if (path.includes("/detect/disease")) {
        console.log("Disease detection running in live mode");
    }
}

function getLanguage() {
    return localStorage.getItem("lang") || "en";
}
