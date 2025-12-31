# WasteClassify - AI-Powered Waste Classification System

A professional browser-based real-time waste classification system using **Google Teachable Machine** and **TensorFlow.js**. Classify waste instantly using your device's camera or upload images directly in the browser!

## Features

- **Real-time Camera Classification** - Use your device camera for instant waste detection
- **Image Upload** - Upload images from your device for classification
- **Four Waste Categories** - Organic, Plastic, Recyclable, Trash
- **Confidence Visualization** - See prediction accuracy with visual bar charts
- **Professional UI** - Enterprise-grade dark theme interface with smooth interactions
- **Mobile Friendly** - Fully responsive design, works on all devices
- **No Backend Required** - Runs entirely in the browser (TensorFlow.js)
- **Fast & Lightweight** - Model runs locally, no server dependency

## Live Demo

Visit the hosted version: [https://saarmalhotra.github.io/waste-classifier-web/](https://saarmalhotra.github.io/waste-classifier-web/)

## Project Structure

```
waste-classifier-web/
├── index.html       # Main HTML structure with professional layout
├── style.css        # Modern dark theme responsive styling
├── script.js        # TensorFlow.js logic & classification engine
├── model/           # Google Teachable Machine model files
│   ├── model.json
│   └── group1-shard*.bin
├── README.md        # This file
└── SETUP.md         # Setup and integration guide
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **ML Framework**: TensorFlow.js 4.20.0
- **Model**: Google Teachable Machine (custom-trained)
- **Deployment**: GitHub Pages (static hosting)

## How to Use

### Option 1: Use the Live Demo

Simply visit [https://saarmalhotra.github.io/waste-classifier-web/](https://saarmalhotra.github.io/waste-classifier-web/) in your browser and start classifying waste!

### Option 2: Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/saarmalhotra/waste-classifier-web.git
   cd waste-classifier-web
   ```

2. Open `index.html` in your web browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

3. Navigate to `http://localhost:8000` and start classifying!

## Adding Your Trained Model

To use your own trained model from Google Teachable Machine:

1. Train your model on [https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/)
2. Export the model in TensorFlow.js format
3. Extract and place the model files in the `model/` folder:
   - `model.json`
   - `group1-shard*.bin` files
4. Update the `MODEL_URL` in `script.js` if needed
5. Refresh the application

## Supported Waste Categories

- **Organic**: Food waste, leaves, biodegradable materials
- **Plastic**: Bottles, bags, plastic containers
- **Recyclable**: Paper, cardboard, metal, glass
- **Trash**: Non-recyclable waste

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Android Chrome)

## Performance Notes

- First load takes 2-3 seconds to initialize TensorFlow.js
- Model inference runs in ~100-300ms depending on device
- Works best on modern devices with adequate RAM
- Camera access requires HTTPS or localhost

## File Size & Optimization

- Model size: ~20-50MB (depends on Teachable Machine export)
- Optimized for production deployment
- Gzip compression recommended for faster loading

## Troubleshooting

**Camera access denied**: Check browser permissions and ensure you're on HTTPS or localhost

**Model loading issues**: Verify model files are in the correct `model/` folder

**Slow predictions**: Close other tabs, clear browser cache, or try a different device

## Future Enhancements

- Batch processing for multiple images
- Export classification history
- Advanced model management
- Custom confidence thresholds
- Multi-language support

## License

MIT License - Feel free to use this project for educational and commercial purposes.

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Built with** TensorFlow.js, Google Teachable Machine, and Vanilla JavaScript
**Deployed on** GitHub Pages
