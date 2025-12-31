// =====================================
// WASTE CLASSIFICATION - Teachable Machine Integration
// Saar Malhotra | 2025
// =====================================

let model = null;
let videoStream = null;
let classificationInterval = null;
const MODEL_URL = './model.json'; // From ROOT directory

// Classes from YOUR Teachable Machine
const classes = ['Organic', 'Reusable'];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 WasteClassify Loading...');
  loadModel();
  setupEventListeners();
});

// ===== LOAD TEACHABLE MACHINE MODEL =====
async function loadModel() {
  try {
    updateStatus('Loading AI Model...', true);
    console.log('📦 Loading from:', MODEL_URL);
    
    model = await tf.loadLayersModel(MODEL_URL);
    console.log('✅ Model Loaded!');
    updateStatus('✅ Ready to Classify!', true);
  } catch (error) {
    console.warn('Model load failed (demo mode):', error.message);
    updateStatus('⚠️ Demo Mode - Using Simulations', false);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
    btn.addEventListener('click', () => switchTab(idx === 0 ? 'camera' : 'upload'));
  });

  // Camera buttons
  document.getElementById('startBtn')?.addEventListener('click', startCamera);
  document.getElementById('stopBtn')?.addEventListener('click', stopCamera);

  // Upload handling
  const uploadInput = document.getElementById('fileInput');
  const uploadBox = document.getElementById('uploadBox');

  uploadBox?.addEventListener('click', () => uploadInput?.click());
  uploadBox?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#10b981';
    uploadBox.style.background = 'rgba(16, 185, 129, 0.1)';
  });
  uploadBox?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#3b82f6';
    uploadBox.style.background = 'transparent';
  });
  uploadBox?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#3b82f6';
    uploadBox.style.background = 'transparent';
    handleFile(e.dataTransfer.files[0]);
  });

  uploadInput?.addEventListener('change', (e) => handleFile(e.target.files[0]));
}

// ===== CAMERA FUNCTIONS =====
async function startCamera() {
  try {
    updateStatus('📹 Starting Camera...', true);
    const video = document.getElementById('video');

    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 224, height: 224 }
    });

    video.srcObject = videoStream;
    video.onloadedmetadata = () => {
      video.play();
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = false;
      updateStatus('📹 Camera Active', true);
      startAutoClassify();
    };
  } catch (error) {
    updateStatus('❌ Camera access denied', false);
    alert('Camera not available: ' + error.message);
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    document.getElementById('video').srcObject = null;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    if (classificationInterval) clearInterval(classificationInterval);
    updateStatus('Ready', true);
  }
}

// ===== AUTO CLASSIFICATION FROM CAMERA =====
function startAutoClassify() {
  if (classificationInterval) clearInterval(classificationInterval);

  classificationInterval = setInterval(() => {
    const video = document.getElementById('video');
    if (video.srcObject && video.readyState === video.HAVE_FUTURE_DATA) {
      predictFromVideo();
    }
  }, 2000);
}

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

// ===== UPLOAD & FILE HANDLING =====
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    updateStatus('❌ Please select an image', false);
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    updateStatus('❌ File too large (max 5MB)', false);
    return;
  }

  updateStatus('🔄 Analyzing Image...', true);
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => predictFromImage(img);
    img.onerror = () => updateStatus('❌ Failed to load image', false);
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

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

// ===== DISPLAY RESULTS =====
function displayResults(predictions) {
  const maxIdx = predictions.indexOf(Math.max(...predictions));
  const className = classes[maxIdx];
  const confidence = (predictions[maxIdx] * 100).toFixed(1);

  console.log(`🎯 ${className} - ${confidence}%`);

  // Show result
  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = `
    <h3>${className}</h3>
    <p>${confidence}% Confidence</p>
  `;

  // Show chart
  const chartDiv = document.getElementById('chart');
  chartDiv.classList.remove('hidden');
  chartDiv.innerHTML = classes.map((cls, i) => {
    const pct = (predictions[i] * 100).toFixed(1);
    const colors = ['#10b981', '#3b82f6'];
    return `
      <div class="chart-bar">
        <span>${cls}</span>
        <div class="bar-bg">
          <div class="bar-fill" style="width: ${pct}%; background: ${colors[i]};"></div>
        </div>
        <span>${pct}%</span>
      </div>
    `;
  }).join('');

  updateStatus(`✅ Classified as ${className}`, true);
}

// ===== SIMULATE PREDICTION (DEMO MODE) =====
function simulatePredict() {
  const predictions = [
    Math.random() * 0.5 + 0.2,
    Math.random() * 0.5 + 0.2
  ];
  const sum = predictions.reduce((a, b) => a + b);
  displayResults(predictions.map(p => p / sum));
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  if (tab === 'camera') {
    document.getElementById('cameraTab').classList.remove('hidden');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
  } else {
    document.getElementById('uploadTab').classList.remove('hidden');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    stopCamera();
  }
}

// ===== UTILITIES =====
function updateStatus(msg, success = true) {
  const el = document.getElementById('status');
  if (el) {
    el.textContent = msg;
    el.style.color = success ? '#10b981' : '#f59e0b';
  }
  console.log(`[${success ? '✓' : '⚠'}] ${msg}`);
}

