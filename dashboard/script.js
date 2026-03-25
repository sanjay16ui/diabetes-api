// Form Submission & API Logic
const API_URL = "https://diabetes-api-production-e8c7.up.railway.app/predict";

// State
let appData = {
    glucose: [],
    bmi: [],
    age: [],
    scatterHealthy: [],
    scatterDiabetic: [],
    scatterNewObj: [], // User submitted ones
    outcomes: { 0: 0, 1: 0 }
};

let histogramChart, scatterChart, pieChart;
let sessionPredictionCount = 0;

// Load Data from CSV
document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('dataset.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            processData(results.data);
            initCharts();
        },
        error: function(err) {
            console.error("Error loading CSV:", err);
            initCharts();
        }
    });
});

function processData(data) {
    if (!data || data.length === 0) return;
    
    appData.glucose = [];
    appData.bmi = [];
    appData.age = [];
    appData.scatterHealthy = [];
    appData.scatterDiabetic = [];
    appData.scatterNewObj = [];
    appData.outcomes = { 0: 0, 1: 0 };
    
    data.forEach(row => {
        if (row.Glucose !== undefined && row.Glucose !== null) appData.glucose.push(row.Glucose);
        if (row.BMI !== undefined && row.BMI !== null) appData.bmi.push(row.BMI);
        if (row.Age !== undefined && row.Age !== null) appData.age.push(row.Age);
        
        if (row.Glucose !== undefined && row.BMI !== undefined) {
            if (row.Outcome === 1) {
                appData.scatterDiabetic.push({ x: row.Glucose, y: row.BMI });
                appData.outcomes[1]++;
            } else {
                appData.scatterHealthy.push({ x: row.Glucose, y: row.BMI });
                appData.outcomes[0]++;
            }
        }
    });
}

function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // 1. Histogram (Line/Bar distribution)
    const ctxHist = document.getElementById('histogramChart').getContext('2d');
    const maxEntries = Math.min(50, appData.glucose.length);
    histogramChart = new Chart(ctxHist, {
        type: 'line',
        data: {
            labels: Array.from({length: maxEntries}, (_, i) => `Entry ${i + 1}`),
            datasets: [
                {
                    label: 'Glucose',
                    data: appData.glucose.slice(0, maxEntries),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'BMI',
                    data: appData.bmi.slice(0, maxEntries),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Age',
                    data: appData.age.slice(0, maxEntries),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            }
        }
    });

    // 2. Scatter Plot
    const ctxScatter = document.getElementById('scatterChart').getContext('2d');
    scatterChart = new Chart(ctxScatter, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Historical Diabetic (1)',
                    data: appData.scatterDiabetic,
                    backgroundColor: 'rgba(239, 68, 68, 0.4)',
                    borderColor: 'rgba(239, 68, 68, 0.6)',
                    pointRadius: 4
                },
                {
                    label: 'Historical Non-Diabetic (0)',
                    data: appData.scatterHealthy,
                    backgroundColor: 'rgba(16, 185, 129, 0.4)',
                    borderColor: 'rgba(16, 185, 129, 0.6)',
                    pointRadius: 4
                },
                {
                    label: 'Your Live Predictions',
                    data: appData.scatterNewObj,
                    backgroundColor: '#a855f7',
                    borderColor: '#ffffff',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    pointStyle: 'star'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 2) {
                                // Extract the injected outcome state for tooltips
                                const objOut = context.raw.outcome === 1 ? 'Diabetic' : 'Non-Diabetic';
                                return `Session Prediction: Glucose: ${context.raw.x}, BMI: ${context.raw.y} (${objOut})`;
                            }
                            return `Glucose: ${context.raw.x}, BMI: ${context.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Glucose Level', color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'BMI', color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });

    // 3. Pie Chart
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Non-Diabetic (0)', 'Diabetic (1)'],
            datasets: [{
                data: [appData.outcomes[0], appData.outcomes[1]],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` Total: ${context.raw} records`;
                        }
                    }
                }
            }
        }
    });
}

// Retry helper function
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error; 
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// Validation function
function validateInputs(data) {
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined || isNaN(value)) {
            return `Please provide a valid numeric value for ${key}.`;
        }
        if (value < 0) {
            return `${key} cannot be a negative value.`;
        }
    }
    return null; // No errors
}

document.getElementById('prediction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('predict-btn');
    const resultCard = document.getElementById('prediction-result');
    const badge = document.getElementById('result-badge');
    const msg = document.getElementById('result-message');
    
    // Reset state
    resultCard.classList.add('hidden');
    badge.className = 'badge';
    badge.textContent = '';
    msg.textContent = '';
    
    const formData = new FormData(e.target);
    const data = {
        Pregnancies: parseInt(formData.get('Pregnancies')),
        Glucose: parseFloat(formData.get('Glucose')),
        BloodPressure: parseFloat(formData.get('BloodPressure')),
        SkinThickness: parseFloat(formData.get('SkinThickness')),
        Insulin: parseFloat(formData.get('Insulin')),
        BMI: parseFloat(formData.get('BMI')),
        DiabetesPedigreeFunction: parseFloat(formData.get('DiabetesPedigreeFunction')),
        Age: parseInt(formData.get('Age'))
    };

    // Validation Check
    const validationError = validateInputs(data);
    if (validationError) {
        showError(validationError);
        return;
    }

    btn.textContent = 'Predicting (Checking AI Model)...';
    btn.disabled = true;

    try {
        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        
        let response;
        try {
            response = await fetchWithRetry(API_URL, fetchOptions, 3, 500);
        } catch (directError) {
            console.warn("Direct API call failed (possibly CORS or downtime). Attempting CORS proxy fallback...");
            const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(API_URL);
            response = await fetchWithRetry(proxyUrl, fetchOptions, 2, 1000);
        }
        
        const result = await response.json();
        const outcome = result.prediction; 
        
        displayResult(outcome);
        updateCharts(data, outcome);
        
    } catch (error) {
        console.error("Prediction error:", error);
        showError("An error occurred connecting to the prediction API. The server might be asleep or unreachable. Please try again in 30 seconds.");
    } finally {
        btn.textContent = 'Predict Diabetes Risk';
        btn.disabled = false;
    }
});

function showError(errorMessage) {
    const resultCard = document.getElementById('prediction-result');
    const badge = document.getElementById('result-badge');
    const msg = document.getElementById('result-message');
    
    resultCard.classList.remove('hidden');
    badge.className = 'badge';
    badge.textContent = 'Error';
    badge.style.background = 'rgba(245, 158, 11, 0.1)';
    badge.style.color = '#f59e0b';
    badge.style.borderColor = '#f59e0b';
    msg.innerHTML = `${errorMessage} <br><br> <button onclick="document.getElementById('predict-btn').click()" class="primary-btn" style="padding: 0.5rem 1rem; margin-top: 10px; font-size: 0.9rem;">Retry</button>`;
}

function displayResult(outcome) {
    const resultCard = document.getElementById('prediction-result');
    const badge = document.getElementById('result-badge');
    const msg = document.getElementById('result-message');
    
    badge.style = '';
    
    resultCard.classList.remove('hidden');
    badge.className = 'badge'; 
    
    if (outcome === 1) {
        badge.textContent = 'High Risk (Diabetic)';
        badge.classList.add('positive');
        msg.textContent = 'The model predicts a high likelihood of diabetes. Please consult a healthcare professional for a complete diagnosis.';
    } else {
        badge.textContent = 'Low Risk (Non-Diabetic)';
        badge.classList.add('negative');
        msg.textContent = 'The model predicts a low likelihood of diabetes based on the provided vitals.';
    }
}

function updateCharts(newData, outcome) {
    if(!histogramChart || !scatterChart || !pieChart) return;

    sessionPredictionCount++;

    // 1. Update Histogram (Line chart)
    histogramChart.data.labels.push(`Session Output ${sessionPredictionCount}`);
    histogramChart.data.datasets[0].data.push(newData.Glucose);
    histogramChart.data.datasets[1].data.push(newData.BMI);
    histogramChart.data.datasets[2].data.push(newData.Age);

    // Keep it clean logically - shift if over 60 entries to keep it readable
    if (histogramChart.data.labels.length > 60) {
        histogramChart.data.labels.shift();
        histogramChart.data.datasets.forEach(ds => ds.data.shift());
    }
    histogramChart.update();

    // 2. Update Scatter Chart (Dedicated New Predictions Array)
    const newPoint = { x: newData.Glucose, y: newData.BMI, outcome: outcome };
    scatterChart.data.datasets[2].data.push(newPoint);
    scatterChart.update();
    
    // 3. Update Pie Chart
    if (outcome === 1) {
        pieChart.data.datasets[0].data[1]++;
    } else {
        pieChart.data.datasets[0].data[0]++;
    }
    pieChart.update();
    
    // Pulse animation on the pie chart to indicate active change
    const pieCanvas = document.getElementById('pieChart');
    pieCanvas.style.transition = 'transform 0.3s ease';
    pieCanvas.style.transform = 'scale(1.05)';
    setTimeout(() => {
        pieCanvas.style.transform = 'scale(1)';
    }, 300);
}
