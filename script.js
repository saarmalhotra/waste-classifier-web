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
  initializeUploadHandler();
  initializeTabButtons();
});

// Load Teachable Machine model from local folder
async function loadModel() {
  try {
    // Load the model from model.json
    // Replace with your Teachable Machine export URL if using hosted model
    model = await tf.loadLayersModel(MODEL_URL);
    console.log('Model loaded successfully!');
    updateStatus('Model loaded! Ready for classification', true);
  } catch (error) {
    console.warn('Local model not found, using demo mode:', error.message);
    updateStatus('Model not loaded. Using demo predictions.', false);
    // Model remains null, will use simulation mode
  }
}

// Initialize upload handler
function initializeUploadHandler() {
  const uploadInput = document.getElementById('upload');
  if (uploadInput) {
    uploadInput.addEventListener('change', handleFileUpload);
    console.log('Upload handler initialized');
  } else {
    console.warn('Upload input element not found');
  }
}

// Handle file upload
function handleFileUpload(e) {
  console.log('File upload triggered');
  const file = e.target.files[0];
  if (file) {
    console.log('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('File loaded into reader');
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded, starting prediction');
        predictImage(img);
      };
      img.onerror = () => {
        console.error('Image failed to load');
        updateStatus('Failed to load image', false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      console.error('FileReader error');
      updateStatus('Failed to read file', false);
    };
    reader.readAsDataURL(file);
  } else {
    console.log('No file selected');
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
    updateStatus('Camera active', true);
    startAutoClassification();
  } catch (error) {
    console.error('Camera error:', error);
    updateStatus('Camera access denied', false);
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
    updateStatus('Ready for input', true);
  }
}

// Predict from image element
async function predictImage(imgElement) {
  try {
    if (!model) {
      // Simulate prediction if model not loaded
      console.log('Using simulated classification');
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
    updateStatus('Error making prediction', false);
  }
}

// Simulate classification for demo (when model not loaded)
function simulateClassification() {
  const predictions = [
    Math.random() * 0.3 + 0.2, // Organic
    Math.random() * 0.2 + 0.1, // Plastic
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
  
  console.log(`Prediction: ${topClass} with confidence ${confidence}%`);
  
  // Display classification result
  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = `
    <div class="result-content">
      <h3 class="result-title">Classification Result</h3>
      <div class="result-display">
        <p class="result-class">${topClass}</p>
        <p class="result-confidence">Confidence: ${confidence}%</p>
      </div>
    </div>
  `;
  
  // Display confidence chart
  displayChart(predictions);
  
  // Update status
  updateStatus(`Classified as ${topClass}`, true);
}

// Display confidence bar chart
function displayChart(predictions) {
  const chartDiv = document.getElementById('confidence');
  chartDiv.classList.remove('hidden');
  let chartHTML = '<h3 class="chart-title">Confidence Levels</h3><div class="chart-container">';
  
  classes.forEach((className, index) => {
    const percentage = (predictions[index] * 100).toFixed(1);
    chartHTML += `
      <div class="bar">
        <span>${className}</span>
        <div style="width: ${percentage}%; background: linear-gradient(90deg, var(--accent-blue), #0052a3); height: 24px; border-radius: 4px;"></div>
      </div>
    `;
  });
  
  chartHTML += '</div>';
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

// Initialize tab buttons
function initializeTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = index === 0 ? 'camera' : 'upload';
      switchTab(tabName);
    });
  });
  console.log('Tab buttons initialized');
}

// Tab switching function
function switchTab(tab) {
  console.log('Switching to tab:', tab);
  
  // Hide all tabs
  document.getElementById('camera-tab').classList.remove('active');
  document.getElementById('upload-tab').classList.remove('active');
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab
  if (tab === 'camera') {
    document.getElementById('camera-tab').classList.add('active');
    document.querySelectorAll('.tab-button')[0].classList.add('active');
    console.log('Camera tab activated');
  } else if (tab === 'upload') {
    document.getElementById('upload-tab').classList.add('active');
    document.querySelectorAll('.tab-button')[1].classList.add('active');
    console.log('Upload tab activated');
  }
}

// Update status function
function updateStatus(message, isSuccess = true) {
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  if (statusText) {
    statusText.textContent = message;
  }
  if (statusDot) {
    statusDot.style.background = isSuccess ? '#10b981' : '#f59e0b';
  }
  console.log('Status updated:', message, isSuccess ? '✓' : '✗');
}

console.log('Script loaded successfully!');
console.log('Classes:', classes);
console.log('Model URL:', MODEL_URL);
console.log('Upload handler and tab buttons will be initialized on DOM load');
