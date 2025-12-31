# Smart Waste Classifier - Setup Guide

## Quick Start (Works without model!)

1. Clone: `git clone https://github.com/saarmalhotra/waste-classifier-web.git`
2. Server: `python -m http.server 8000`
3. Open: http://localhost:8000
4. Test: Upload image or click camera button

## Add Real ML Model

### Step 1: Train on Teachable Machine
- Go to: https://teachablemachine.withgoogle.com
- New Project > Image
- Create 4 classes: Organic, Plastic, Recyclable, Trash
- Upload images (100+ per class recommended)
- Train the model

### Step 2: Export as TensorFlow.js
- Click Export Model
- Select TensorFlow.js
- Download the model files

### Step 3: Add Files to This Repo
- Extract: model.json and group1-shard*.bin files
- Go to model/ folder on GitHub
- Upload all files
- Commit changes

### Step 4: Test
- Refresh the app
- Check console (F12) for \"Model loaded successfully!\"
- Upload test image
- Should see real predictions!

## Troubleshooting

- **\"Model not loaded\"**: Check model.json exists in model/ folder
- **Wrong predictions**: Model needs more training data (200+ images)
- **Camera error**: Allow camera permission in browser
- **Slow**: Close other tabs, check internet speed

## File Structure

```
model/
├── model.json (required - metadata)
├── group1-shard1of3.bin (required - weights)
├── group1-shard2of3.bin (required - weights) 
├── group1-shard3of3.bin (required - weights)
└── .gitkeep
```

## Resources

- [Teachable Machine](https://teachablemachine.withgoogle.com)
- [Kaggle Waste Dataset](https://www.kaggle.com/datasets/mostafaabla/waste-classification-data)
- [TensorFlow.js Docs](https://www.tensorflow.org/js)

---

Made by Saar Malhotra | Questions? Open an issue!
