const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";
const files = [
    "tiny_face_detector_model-shard1",
    "tiny_face_detector_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_recognition_model-weights_manifest.json"
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function main() {
    const dirs = [
        path.join(__dirname, 'smartdorm-frontend', 'public', 'models'),
        path.join(__dirname, 'smartdorm-door-app', 'models')
    ];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`--- Đang tải vào danh mục: ${dir} ---`);
        for (const fileName of files) {
            const url = baseUrl + fileName;
            const dest = path.join(dir, fileName);
            console.log(`Đang tải: ${fileName}...`);
            try {
                await download(url, dest);
                console.log(`✅ Thành công: ${fileName}`);
            } catch (err) {
                console.error(`❌ Lỗi tải ${fileName}:`, err.message);
            }
        }
    }
    console.log("\n✨ HOÀN TẤT: Tất cả Model đã được tải lại chuẩn xác!");
}

main();
