/**
 * Script hỗ trợ cấu hình Google OAuth
 * Chạy: node setup-google.js
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('\n=== Cấu hình đăng nhập Google - SmartDorm ===\n');
  console.log('1. Mở trình duyệt: https://console.cloud.google.com/apis/credentials');
  console.log('2. Tạo OAuth 2.0 Client ID (Web application)');
  console.log('3. Thêm http://localhost:3000 vào Authorized JavaScript origins');
  console.log('4. Copy Client ID (dạng xxx-xxx.apps.googleusercontent.com)\n');

  const clientId = await question('Dán Client ID vào đây: ');
  const trimmed = clientId.trim();

  if (!trimmed || !trimmed.includes('.apps.googleusercontent.com')) {
    console.log('\n❌ Client ID không hợp lệ. Phải có dạng: xxx.apps.googleusercontent.com');
    rl.close();
    return;
  }

  // Frontend .env
  const feEnvPath = path.join(__dirname, '..', 'smartdorm-frontend', '.env');
  if (fs.existsSync(feEnvPath)) {
    let feContent = fs.readFileSync(feEnvPath, 'utf8');
    feContent = feContent.replace(/VITE_GOOGLE_CLIENT_ID=.*/g, `VITE_GOOGLE_CLIENT_ID=${trimmed}`);
    fs.writeFileSync(feEnvPath, feContent);
    console.log('\n✅ Đã cập nhật smartdorm-frontend/.env');
  } else {
    const feDir = path.dirname(feEnvPath);
    if (fs.existsSync(feDir)) {
      fs.writeFileSync(feEnvPath, `VITE_API_URL=http://localhost:5000\nVITE_GOOGLE_CLIENT_ID=${trimmed}\n`);
      console.log('\n✅ Đã tạo smartdorm-frontend/.env');
    }
  }

  // Backend .env
  const beEnvPath = path.join(__dirname, '.env');
  let beContent = '';
  if (fs.existsSync(beEnvPath)) {
    beContent = fs.readFileSync(beEnvPath, 'utf8');
    if (beContent.includes('GOOGLE_CLIENT_ID=')) {
      beContent = beContent.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${trimmed}`);
    } else {
      beContent += `\nGOOGLE_CLIENT_ID=${trimmed}\n`;
    }
  } else {
    beContent = `PORT=5000\nMONGODB_URI=mongodb://127.0.0.1:27017/smartdorm\nJWT_SECRET=your-secret-key\nGOOGLE_CLIENT_ID=${trimmed}\n`;
  }
  fs.writeFileSync(beEnvPath, beContent);
  console.log('✅ Đã cập nhật smartdorm-backend/.env');

  console.log('\n📌 Khởi động lại backend và frontend để áp dụng thay đổi.\n');
  rl.close();
}

main().catch(console.error);
