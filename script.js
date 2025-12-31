// Waste Classification Model
let model = null;
let webcam = null;
let videoStream = null;
const classes = ['Organic', 'Plastic', 'Recyclable', 'Trash'];
const MODEL_URL = 'model/model.json'; // Update with your Teachable Machine model URL

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Attempting to load model...');
    loadModel();
});

// Load Teachable Machine model from local folder
async function loadModel() {
    try {
        // Load the model from model.json
        // Replace with your Teachable Machine export URL if using hosted model
        model = await tf.loadLayersModel(MODEL_URL);
        console.log('Model loaded successfully!');
        document.getElementById('result').innerHTML = '<p style="color:#667eea; font-weight: bold;">✅ Model loaded! Ready for classification</p>';
    } catch (error) {
        console.warn('Local model not found, using demo mode:', error.message);
        document.getElementById('result').innerHTML = '<p style="color:#ff6b6b;">⚠️ Model not loaded. Using demo predictions.</p>';
        // Model remains null, will use simulation mode
    }
}

// Start camera stream
async function startCamera() {
    try {
        const video = document.getElementById('video');
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 224, height: 224 },
            audio: false
        });
        video.srcObject = videoStream;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        console.log('Camera started');
        startAutoClassification();
    } catch (error) {
        console.error('Camera error:', error);
        alert('Camera access denied or unavailable: ' + error.message);
    }
}

// Stop camera stream
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        document.getElementById('video').srcObject = null;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        console.log('Camera stopped');
    }
}

// Handle image upload
document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        predictImage(img);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Predict from image element
async function predictImage(imgElement) {
    try {
        if (!model) {
            // Simulate prediction if model not loaded
            simulateClassification();
            return;
        }
        
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, 224, 224);
        
        const imageTensor = tf.browser.fromPixels(canvas)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .div(tf.scalar(255))
            .expandDims(0); // Add batch dimension
        
        const predictions = await model.predict(imageTensor);
        const predData = await predictions.data();
        
        displayResults(Array.from(predData));
        
        // Cleanup
        imageTensor.dispose();
        predictions.dispose();
    } catch (error) {
        console.error('Prediction error:', error);
        document.getElementById('result').innerHTML = '<p style="color:#ff6b6b;">Error making prediction</p>';
    }
}

// Simulate classification for demo (when model not loaded)
function simulateClassification() {
    const predictions = [
        Math.random() * 0.3 + 0.2,  // Organic
        Math.random() * 0.2 + 0.1,  // Plastic
        Math.random() * 0.25 + 0.1, // Recyclable
        Math.random() * 0.35 + 0.15 // Trash
    ];
    
    // Normalize
    const sum = predictions.reduce((a, b) => a + b, 0);
    const normalized = predictions.map(p => p / sum);
    displayResults(normalized);
}

// Display results
function displayResults(predictions) {
    const topIndex = predictions.indexOf(Math.max(...predictions));
    const topClass = classes[topIndex];
    const confidence = (predictions[topIndex] * 100).toFixed(1);
    
    // Display classification result
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2>${topClass} ♻️</h2>
        <p>Confidence: ${confidence}%</p>
    `;
    
    // Display confidence chart
    displayChart(predictions);
}

// Display confidence bar chart
function displayChart(predictions) {
    const chartDiv = document.getElementById('confidence');
    let chartHTML = '<h3 style="margin-bottom: 15px; color: #333;">Confidence Levels</h3>';
    
    classes.forEach((className, index) => {
        const percentage = (predictions[index] * 100).toFixed(1);
        chartHTML += `
            <div class="bar">
                <span>${className}</span>
                <div style="width: ${percentage}%"></div>
            </div>
        `;
    });
    
    chartDiv.innerHTML = chartHTML;
}

// Auto-classify from camera
let classificationInterval = null;

function startAutoClassification() {
    if (classificationInterval) clearInterval(classificationInterval);
    
    classificationInterval = setInterval(() => {
        const video = document.getElementById('video');
        if (video.srcObject && video.readyState === video.HAVE_FUTURE_DATA) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 224, 224);
            
            if (model) {
                const imageTensor = tf.browser.fromPixels(canvas)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .div(tf.scalar(255))
                    .expandDims(0);
                
                model.predict(imageTensor).then(predictions => {
                    predictions.data().then(data => {
                        displayResults(Array.from(data));
                    });
                    predictions.dispose();
                }).catch(err => console.error('Inference error:', err));
                
                imageTensor.dispose();
            } else {
                simulateClassification();
            }
        }
    }, 2000);
}

console.log('Script loaded successfully!');
console.log('Classes:', classes);
console.log('Model URL:', MODEL_URL);
