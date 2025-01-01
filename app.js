const express = require('express');
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// Konfiguration för Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));

// Route för att ladda upp bilder
app.post('/upload', upload.single('image'), (req, res) => {
  res.send('Bilden har laddats upp!');
});

// Route för att redigera bilder
app.post('/edit', async (req, res) => {
  const { imagePath, text, x, y } = req.body;

  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
  ctx.font = '30px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText(text, x, y);

  const editedImagePath = `uploads/edited-${Date.now()}.png`;
  const out = fs.createWriteStream(editedImagePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  out.on('finish', () => {
    res.send({ editedImagePath });
  });
});

app.listen(port, () => {
  console.log(`Servern körs på http://localhost:${port}`);
});