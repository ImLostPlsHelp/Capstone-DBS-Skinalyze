// src/predict/predict.js
import * as tf from '@tensorflow/tfjs';

let model;

const TARGET_SIZE = 160;

export async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel('/model/model.json');
    console.log('Model loaded');
  }
  return model;
}

function getResizedTensor(imageElement, size = TARGET_SIZE) {
  // 1. Draw image to canvas and resize
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, size, size);

  // 2. Convert to tensor (shape: [size, size, 3])
  let imgArray = tf.browser.fromPixels(canvas).toFloat();

  // 3. Expand dims to make batch of 1 (shape: [1, size, size, 3])
  imgArray = imgArray.expandDims(0);

  return imgArray; // [1, 160, 160, 3]
}

export async function predictSkinType(imageElement) {
  const mdl = await loadModel();

  const inputTensor = getResizedTensor(imageElement);

  let result;
  if (mdl.predict) {
    result = mdl.predict(inputTensor);
  } else {
    const inputName = mdl.inputs[0].name;
    result = mdl.execute({ [inputName]: inputTensor });
  }

  if (Array.isArray(result)) result = result[0];

  const predictionData = await result.data();
  const predictedIndex = predictionData.indexOf(Math.max(...predictionData));

  console.log("Predicted index:", predictedIndex);
  console.log("Raw scores:", predictionData);

  return predictedIndex;
}