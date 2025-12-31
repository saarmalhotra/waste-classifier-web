# 🗑️ Smart Waste Classifier - Web Edition

A browser-based real-time waste classification system using **Google Teachable Machine** and **TensorFlow.js**. Classify waste instantly using your device's camera or upload images!

## 🚀 Features

✅ **Real-time Camera Classification** - Use your device camera for instant waste detection  
✅ **Image Upload** - Upload images from your device for classification  
✅ **Four Waste Categories** - Organic, Plastic, Recyclable, Trash  
✅ **Confidence Levels** - See prediction accuracy with visual bar charts  
✅ **Mobile Friendly** - Fully responsive design, works on all devices  
✅ **No Backend Required** - Runs entirely in the browser (TensorFlow.js)  
✅ **Fast & Lightweight** - Model runs locally, no server dependency  

## 📋 Project Structure

```
waste-classifier-web/
├── index.html       # Main HTML structure
├── style.css        # Modern responsive styling
├── script.js        # TensorFlow.js logic & classification
├── model/           # Google Teachable Machine model files
│   ├── model.json
│   └── group1-shard*.bin
└── README.md        # This file
```

## ⚙️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **ML Framework**: TensorFlow.js 4.20.0
- **Model**: Google Teachable Machine (custom-trained)
- **Deployment**: GitHub Pages (static hosting)

## 🎯 How to Use

### Option 1: Use the Live Demo
Visit the hosted version on GitHub Pages: [Click Here](https://saarmalhotra.github.io/waste-classifier-web/)

### Option 2: Run Locally
1. Clone the repository
   ```bash
   git clone https://github.com/saarmalhotra/waste-classifier-web.git
   cd waste-classifier-web
   ```

2. Start a local server
   ```bash
   python -m http.server 8000
   # or
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

### Option 3: Use with VS Code Live Server
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

## 📸 Usage Instructions

### Camera Classification
1. Click "Start Camera" button
2. Allow camera permission when prompted
3. Point camera at waste items
4. System auto-classifies every 2 seconds
5. View results and confidence levels

### Image Upload
1. Click "Upload Image" button
2. Select an image from your device
3. Classification happens automatically
4. Results display with confidence chart

## 🔄 Training Your Own Model

1. Visit [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Create a new "Image Project"
3. Add 4 classes: Organic, Plastic, Recyclable, Trash
4. Upload 50-100 images per class (source: [Kaggle Waste Classification](https://www.kaggle.com/datasets/mostafaabla/waste-classification-data))
5. Train the model
6. Export as **TensorFlow.js**
7. Replace the files in the `model/` folder
8. Update the model URL in `script.js`

## 📁 Model Integration

To use your custom Teachable Machine model:

1. Download model from Teachable Machine as TensorFlow.js format
2. Extract files to a `model/` folder
3. Update `script.js` line 13:
   ```javascript
   // Replace with your model URL
   const MODEL_URL = 'model/model.json';
   model = await tf.loadLayersModel(MODEL_URL);
   ```

## 🎨 UI Preview

- **Purple gradient background** (modern, professional look)
- **White card container** with shadow effects
- **Real-time video feed** with rounded corners
- **Interactive buttons** with hover effects
- **Dynamic confidence bar chart** showing prediction scores
- **Responsive layout** - adapts to mobile, tablet, desktop

## 📊 Classification Output

```
Result: Plastic
Confidence: 92.5%

Confidence Levels:
├── Plastic:      ████████████████████ 92.5%
├── Organic:      █░░░░░░ 4.2%
├── Recyclable:   ██░░░░░ 2.1%
└── Trash:        █░░░░░░ 1.2%
```

## 🚀 Deployment

### Deploy to GitHub Pages
1. Go to repository settings
2. Find "Pages" section
3. Set source to "Deploy from a branch" → main branch
4. Save
5. Your site will be live at: `https://yourusername.github.io/waste-classifier-web/`

### Deploy to Other Platforms
- **Netlify**: Drag and drop `index.html`, `style.css`, `script.js`, `model/` folder
- **Vercel**: Connect GitHub repo, auto-deploys on push
- **Render**: Create static site with this repo

## 💡 Performance Tips

- Model size: ~5MB (downloads on first load)
- Prediction time: ~100-200ms per image
- Uses WebGL acceleration (GPU) if available
- Memory efficient - disposes tensors after use

## 🐛 Troubleshooting

### Camera not working?
- Check browser camera permissions
- Ensure HTTPS (some browsers require this)
- Try a different browser

### Model not loading?
- Check browser console (F12) for errors
- Ensure model files are in correct path
- Verify model.json and .bin files are present

### Slow performance?
- Close other browser tabs
- Check device storage space
- Ensure good lighting for camera

## 📈 Accuracy

Expected accuracy with good training data:
- **Organic waste**: 85-90%
- **Plastic**: 88-93%
- **Recyclable**: 82-87%
- **Trash**: 80-85%

## 🔐 Privacy

✅ **100% Client-Side Processing** - No data sent to servers  
✅ **No Tracking** - No analytics or cookies  
✅ **Camera Feed Private** - Only processed locally  

## 📚 Learning Resources

- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [Google Teachable Machine Guide](https://teachablemachine.withgoogle.com/)
- [Web ML Best Practices](https://github.com/tensorflow/tfjs)
- [Waste Classification Dataset](https://www.kaggle.com/datasets/mostafaabla/waste-classification-data)

## 🤝 Contributing

Feel free to contribute! You can:
- Report bugs
- Suggest features
- Submit pull requests
- Share your trained models

## 📝 License

MIT License - Feel free to use for personal and commercial projects

## 🙏 Credits

- Built with [TensorFlow.js](https://www.tensorflow.org/js)
- Models trained with [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
- Dataset from [Kaggle](https://www.kaggle.com/)

## 📞 Contact & Support

- 🐙 GitHub: [@saarmalhotra](https://github.com/saarmalhotra)
- 💼 LinkedIn: [Saar Malhotra](https://linkedin.com/in/saarmalhotra)
- 📧 Email: Open an issue on GitHub

---

**Made with ❤️ by Saar Malhotra**  
*First-year B.Tech CS Student @ KIET, Ghaziabad*  
*Interested in ML, Web Dev, and AI Applications*

⭐ If you find this helpful, please star the repository!
