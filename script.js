// =====================================
// WASTE CLASSIFICATION MODEL - Integrated
// =====================================

let model = null;
let webcam = null;
let videoStream = null;
let classificationInterval = null;

// Classes from your Teachable Machine model
const classes = ['Organic', 'Reusable', 'Plastic', 'Trash'];

// Model URL - Points to your model folder
const MODEL_URL = 'model/model.json';

// =====================================
// INITIALIZATION
// =====================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded. Initializing WasteClassify...');
  loadModel();
  initializeUploadHandler();
  initializeTabButtons();
  console.log('✓ All systems initialized');
});

// =====================================
// MODEL LOADING (Teachable Machine)
// =====================================

async function loadModel() {
  try {
    updateStatus('Loading AI model...', true);
    console.log('📦 Loading model from:', MODEL_URL);
    
    // Load the Teachable Machine model
    model = await tf.loadLayersModel(MODEL_URL);
    
    console.log('✓ Model loaded successfully!');
    console.log('Model summary:');
    model.summary();
    
    updateStatus('✓ Model ready! You can start classifying.', true);
  } catch (error) {
    console.error('❌ Model loading failed:', error);
    console.warn('Using DEMO MODE - predictions will be simulated');
    updateStatus('⚠ Demo mode (model not loaded, using simulations)', false);
  }
}

// =====================================
// FILE UPLOAD HANDLER
// =====================================

function initializeUploadHandler() {
  const uploadInput = document.getElementById('upload');
  const uploadArea = document.getElementById('uploadArea');
  
  if (!uploadInput) {
    console.error('❌ Upload input element not found');
    return;
  }
  
  // File input change event
  uploadInput.addEventListener('change', (e) => {
    console.log('📁 File selected from picker');
    const file = e.target.files[0];
    if (file) processFile(file);
  });
  
  if (uploadArea) {
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadInput.click();
    });
    
    // Drag and drop support
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.opacity = '0.7';
      uploadArea.style.borderColor = '#10b981';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.opacity = '1';
      uploadArea.style.borderColor = '#0066cc';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.style.opacity = '1';
      uploadArea.style.borderColor = '#0066cc';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        console.log('📥 File dropped:', file.name);
        processFile(file);
      }
    });
    
    console.log('✓ Upload handlers initialized');
  }
}

// Process uploaded file
function processFile(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    updateStatus('❌ Please select an image (JPG, PNG)', false);
    return;
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    updateStatus('❌ File must be under 5MB', false);
    return;
  }
  
  console.log(`📸 Processing image: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  updateStatus('🔄 Analyzing image...', true);
  
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✓ Image loaded: ${img.width}x${img.height}px`);
      predictImage(img);
    };
    
    img.onerror = () => {
      updateStatus('❌ Failed to load image', false);
    };
    
    img.src = event.target.result;
  };
  
  reader.readAsDataURL(file);
}

// =====================================
// CAMERA FUNCTIONS
// =====================================

async function startCamera() {
  try {
    updateStatus('📹 Starting camera...', true);
    
    const video = document.getElementById('video');
    
    // Request camera with optimized constraints
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
      console.log('✓ Camera started');
      updateStatus('📹 Camera active - analyzing...', true);
      startAutoClassification();
    };
    
    // Update button states
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    
  } catch (error) {
    console.error('❌ Camera error:', error);
    if (error.name === 'NotAllowedError') {
      updateStatus('❌ Camera permission denied. Enable it in browser settings.', false);
    } else if (error.name === 'NotFoundError') {
      updateStatus('❌ No camera found on this device', false);
    } else {
      updateStatus(`❌ Camera error: ${error.message}`, false);
    }
  }
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    document.getElementById('video').srcObject = null;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    
    if (classificationInterval) {
      clearInterval(classificationInterval);
      classificationInterval = null;
    }
    
    console.log('✓ Camera stopped');
    updateStatus('Ready for input', true);
  }
}

// =====================================
// PREDICTION & CLASSIFICATION
// =====================================

// Predict from uploaded image
async function predictImage(imgElement) {
  try {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw image to canvas (224x224 for Teachable Machine)
    ctx.drawImage(imgElement, 0, 0, 224, 224);
    
    if (!model) {
      console.log('ℹ️ Model not loaded, using simulated classification');
      simulateClassification();
      return;
    }
    
    // Prepare tensor
    const imageTensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255))
      .expandDims(0);
    
    console.log('🧠 Running inference...');
    
    // Get predictions
    const predictions = await model.predict(imageTensor);
    const predData = await predictions.data();
    
    displayResults(Array.from(predData));
    
    // Cleanup
    imageTensor.dispose();
    predictions.dispose();
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    updateStatus('❌ Prediction failed', false);
  }
}

// Auto-classify from camera feed (every 2 seconds)
function startAutoClassification() {
  if (classificationInterval) clearInterval(classificationInterval);
  
  classificationInterval = setInterval(() => {
    const video = document.getElementById('video');
    
    if (video.srcObject && video.readyState === video.HAVE_FUTURE_DATA) {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(video, 0, 0, 224, 224);
      
      if (!model) {
        simulateClassification();
        return;
      }
      
      try {
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
      } catch (error) {
        console.error('Camera prediction error:', error);
      }
    }
  }, 2000); // Update every 2 seconds
}

// Simulate classification for demo mode
function simulateClassification() {
  const predictions = [
    Math.random() * 0.3 + 0.1,   // Organic
    Math.random() * 0.25 + 0.1,  // Reusable
    Math.random() * 0.3 + 0.1,   // Plastic
    Math.random() * 0.25 + 0.1   // Trash
  ];
  
  // Normalize to sum to 1
  const sum = predictions.reduce((a, b) => a + b, 0);
  const normalized = predictions.map(p => p / sum);
  
  displayResults(normalized);
}

// =====================================
// DISPLAY RESULTS
// =====================================

function displayResults(predictions) {
  const topIndex = predictions.indexOf(Math.max(...predictions));
  const topClass = classes[topIndex];
  const confidence = (predictions[topIndex] * 100).toFixed(1);
  
  console.log(`🎯 Result: ${topClass} (${confidence}% confidence)`);
  
  // Show result card
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
  
  // Show confidence chart
  displayChart(predictions);
  
  // Update status
  updateStatus(`✓ Classified as ${topClass}`, true);
}

// Display confidence bar chart
function displayChart(predictions) {
  const chartDiv = document.getElementById('confidence');
  chartDiv.classList.remove('hidden');
  
  let chartHTML = '<h3 class="chart-title">Confidence Levels</h3><div class="chart-container">';
  
  classes.forEach((className, index) => {
    const percentage = (predictions[index] * 100).toFixed(1);
    const color = ['#10b981', '#0066cc', '#f59e0b', '#ef4444'][index];
    
    chartHTML += `
      <div class="bar">
        <span>${className}</span>
        <div style="width: ${percentage}%; background: ${color}; height: 24px; border-radius: 4px; transition: width 0.3s ease;"></div>
      </div>
    `;
  });
  
  chartHTML += '</div>';
  chartDiv.innerHTML = chartHTML;
}

// =====================================
// TAB SWITCHING
// =====================================

function initializeTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = index === 0 ? 'camera' : 'upload';
      switchTab(tabName);
    });
  });
  
  console.log('✓ Tab buttons initialized');
}

function switchTab(tab) {
  console.log(`📑 Switching to ${tab} tab`);
  
  // Hide all tabs
  document.getElementById('camera-tab')?.classList.remove('active');
  document.getElementById('upload-tab')?.classList.remove('active');
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  if (tab === 'camera') {
    document.getElementById('camera-tab')?.classList.add('active');
    document.querySelectorAll('.tab-button')[0]?.classList.add('active');
    
    // Auto-stop other operations
    const uploadInput = document.getElementById('upload');
    if (uploadInput) uploadInput.value = '';
    
  } else if (tab === 'upload') {
    document.getElementById('upload-tab')?.classList.add('active');
    document.querySelectorAll('.tab-button')[1]?.classList.add('active');
    
    // Stop camera if running
    stopCamera();
  }
}

// =====================================
// UTILITIES
// =====================================

function updateStatus(message, isSuccess = true) {
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  
  if (statusText) {
    statusText.textContent = message;
  }
  
  if (statusDot) {
    statusDot.style.background = isSuccess ? '#10b981' : '#f59e0b';
  }
  
  console.log(`[${isSuccess ? '✓' : '⚠'}] ${message}`);
}

// =====================================
// STARTUP LOG
// =====================================

console.log(`
╔════════════════════════════════════╗
║   WASTECLASSIFY - INTEGRATED v1.0  ║
╚════════════════════════════════════╝
📊 Classes: ${classes.join(', ')}
📂 Model URL: ${MODEL_URL}
🧠 TensorFlow.js: ${tf?.version?.tfjs || 'Not loaded'}
🎯 Ready to classify waste!
`);
