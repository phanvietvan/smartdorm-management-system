const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-weights_manifest.json'
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function run() {
  const dirs = ['smartdorm-frontend/public/models-v3', 'smartdorm-door-app/models-v3'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  for (const f of files) {
    const url = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/' + f;
    console.log('Downloading: ' + f);
    await download(url, dirs[0] + '/' + f);
    fs.copyFileSync(dirs[0] + '/' + f, dirs[1] + '/' + f);
  }
  console.log('✅ ALL MODELS DOWNLOADED CLEANLY');
}
run();
