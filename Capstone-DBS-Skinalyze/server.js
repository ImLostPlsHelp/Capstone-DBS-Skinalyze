// server.js
import express     from 'express';
import multer      from 'multer';
import * as tf     from '@tensorflow/tfjs-node';
import path        from 'path';

const app    = express();
const upload = multer();

// 1) Serve everything in ./public at the site root
app.use(express.static(path.join(__dirname, 'public')));

// 2) Load your TF-JS GraphModel once at startup
const MODEL_PATH = 'model/model.json';  
let model;
(async () => {
  model = await tf.loadGraphModel(MODEL_PATH);
  console.log('Model loaded.');
})();

// 3) Preprocessing helper (same as in your notebook)
function preprocess(buffer) {
  let img = tf.node.decodeImage(buffer, 3);
  img = tf.image.resizeBilinear(img, [160, 160]);
  img = img.expandDims(0);
  return img.div(127.5).sub(1);
}

// 4) Predict endpoint
app.post('/predict', upload.single('image'), async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'Model still loading. Try again in a moment.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    const inputTensor = preprocess(req.file.buffer);
    const logits      = model.predict(inputTensor); 
    const probs       = await logits.data();         // Float32Array

    // Return just the raw probabilities; client will pick the top index
    return res.json({ probs: Array.from(probs) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Inference failed.' });
  }
});

// 5) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on http://localhost:${PORT}`));