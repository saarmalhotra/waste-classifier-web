// WasteClassify - Teachable Machine Integration
let model = null;
let videoStream = null;
let classificationInterval = null;
const MODEL_URL = './model.json';
const classes = ['Organic', 'Reusable'];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadModel();
  setupEventListeners();
});

// Load Teachable Machine model
async function loadModel() {
  try {
    updateStatus('Loading AI Model...', true);
    model = await tf.loadLayersModel(MODEL_URL);
    updateStatus('✅ Ready to Classify!', true);
    console.log('✅ Model loaded successfully');
  } catch (error) {
    console.warn('Model load failed:', error.message);
    updateStatus('⚠️ Demo Mode (Model Simulation)', false);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // Camera buttons
  document.getElementById('startBtn').addEventListener('click', startCamera);
  document.getElementById('stopBtn').addEventListener('click', stopCamera);

  // File upload
  const fileInput = document.getElementById('fileInput');
  const uploadBox = document.getElementById('uploadBox');

  uploadBox.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  // Drag and drop
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#10b981';
    uploadBox.style.background = 'rgba(16, 185, 129, 0.1)';
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#3b82f6';
    uploadBox.style.background = 'transparent';
  });

  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#3b82f6';
    uploadBox.style.background = 'transparent';
    handleFile(e.dataTransfer.files[0]);
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  // Remove active class from buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');

  // Stop camera if switching away
  if (tabName !== 'camera') {
    stopCamera();
  }
}

// Start camera
async function startCamera() {
  try {
    updateStatus('📹 Starting camera...', true);
    const video = document.getElementById('video');

    videoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 640 }
      },
      audio: false
    });

    video.srcObject = videoStream;
    video.onloadedmetadata = () => {
      video.play();
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = false;
      updateStatus('📹 Camera Active - Classifying...', true);
      startAutoClassification();
    };
  } catch (error) {
    updateStatus('❌ Camera access denied', false);
    alert('Camera Error: ' + error.message);
  }
}

// Stop camera
function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    document.getElementById('video').srcObject = null;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    if (classificationInterval) clearInterval(classificationInterval);
    updateStatus('Ready for input', true);
  }
}

// Auto classify from camera every 2 seconds
function startAutoClassification() {
  if (classificationInterval) clearInterval(classificationInterval);

  classificationInterval = setInterval(() => {
    const video = document.getElementById('video');
    if (video.srcObject && video.readyState === video.HAVE_FUTURE_DATA) {
      predictFromVideo();
    }
  }, 2000);
}

// Predict from video frame
async function predictFromVideo() {
  try {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    ctx.drawImage(video, 0, 0, 224, 224);

    if (!model) {
      simulatePredict();
      return;
    }

    const tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255))
      .expandDims(0);

    const predictions = await model.predict(tensor);
    const data = await predictions.data();
    displayResults(Array.from(data));

    tensor.dispose();
    predictions.dispose();
  } catch (error) {
    console.error('Prediction error:', error);
  }
}

// Handle file upload
function handleFile(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    updateStatus('❌ Please select an image file', false);
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    updateStatus('❌ File too large (max 5MB)', false);
    return;
  }

  updateStatus('🔄 Analyzing image...', true);
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => predictFromImage(img);
    img.onerror = () => updateStatus('❌ Failed to load image', false);
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

// Predict from uploaded image
async function predictFromImage(img) {
  try {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 224, 224);

    if (!model) {
      simulatePredict();
      return;
    }

    const tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255))
      .expandDims(0);

    const predictions = await model.predict(tensor);
    const data = await predictions.data();
    displayResults(Array.from(data));

    tensor.dispose();
    predictions.dispose();
  } catch (error) {
    updateStatus('❌ Prediction failed', false);
    console.error(error);
  }
}

// Display results
function displayResults(predictions) {
  const maxIdx = predictions.indexOf(Math.max(...predictions));
  const className = classes[maxIdx];
  const confidence = (predictions[maxIdx] * 100).toFixed(1);

  console.log(`🎯 Result: ${className} - ${confidence}%`);

  // Show result card
  const resultCard = document.getElementById('resultCard');
  resultCard.classList.remove('hidden');
  document.getElementById('result').innerHTML = `
    <h3 class="result-class">${className}</h3>
    <p class="result-confidence">Confidence: ${confidence}%</p>
  `;

  // Show chart
  const chartCard = document.getElementById('chartCard');
  chartCard.classList.remove('hidden');
  const colors = ['#10b981', '#3b82f6'];
  
  const chartHTML = classes.map((cls, i) => {
    const pct = (predictions[i] * 100).toFixed(1);
    return `
      <div class="chart-bar">
        <span class="bar-label">${cls}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width: ${pct}%; background: ${colors[i]};"></div>
        </div>
        <span class="bar-value">${pct}%</span>
      </div>
    `;
  }).join('');
  
  document.getElementById('chart').innerHTML = chartHTML;

  updateStatus(`✅ Classified as ${className}`, true);
}

// Simulate prediction for demo mode
function simulatePredict() {
  const predictions = [
    Math.random() * 0.5 + 0.2,
    Math.random() * 0.5 + 0.2
  ];
  const sum = predictions.reduce((a, b) => a + b);
  displayResults(predictions.map(p => p / sum));
}

// Update status message
function updateStatus(msg, success = true) {
  const el = document.getElementById('status');
  if (el) {
    el.textContent = msg;
    el.style.color = success ? '#10b981' : '#f59e0b';
  }
}
