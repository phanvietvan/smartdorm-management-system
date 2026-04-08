const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key:", apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        // Chúng ta sẽ thử liệt kê model thông qua một phương thức đơn giản
        // Nếu không liệt kê được, ta sẽ thử dùng curl trực tiếp
        console.log("Đang gọi Google để hỏi danh sách model...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("✅ Các model bạn CÓ QUYỀN dùng là:");
            data.models.forEach(m => console.log("- " + m.name));
        } else {
            console.log("❌ Google không trả về danh sách model nào. Có thể API chưa được bật cho Key này.");
            console.log("Chi tiết phản hồi:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("❌ Lỗi khi kiểm tra:", err.message);
    }
}

checkModels();
