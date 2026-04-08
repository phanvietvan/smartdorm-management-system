const { GoogleGenerativeAI } = require("@google/generative-ai");
const Room = require("../models/Room");
require("dotenv").config();

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

exports.chat = async (req, res) => {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ message: "Vui lòng cấu hình API Key!" });
    }

    try {
        // 1. Lấy dữ liệu phòng trống thực tế từ Database
        const availableRooms = await Room.find({ status: 'available' }).select('name price amenities floor');
        
        // Tạo chuỗi văn bản mô tả danh sách phòng để AI đọc
        const roomsInfo = availableRooms.length > 0 
            ? availableRooms.map(r => `- Phòng ${r.name}: Tầng ${r.floor}, Giá ${r.price.toLocaleString()}đ, Tiện ích: ${r.amenities}`).join("\n")
            : "Hiện tại tất cả các phòng đều đã được thuê hết.";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-flash-latest",
            systemInstruction: {
                parts: [{ text: `Bạn là SmartAssistant của hệ thống SmartDorm.
                    DỮ LIỆU PHÒNG TRỐNG THỜI GIAN THỰC:
                    ${roomsInfo}
                    
                    NHIỆM VỤ:
                    - Sử dụng dữ liệu trên để trả lời chính xác về các phòng còn trống và giá cả.
                    - KHÔNG ĐƯỢC tự bịa ra số phòng hoặc giá phòng khác với danh sách trên.
                    - Nếu khách hỏi về phòng không có trong danh sách, hãy thông tin rằng phòng đó hiện không trống.
                    - Luôn khuyến khích khách đặt lịch xem phòng nếu thấy ưng ý.` }]
            }
        });

        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                const chatSession = model.startChat({
                    history: history || [],
                });

                const result = await chatSession.sendMessage(message);
                const response = await result.response;
                const text = response.text();

                return res.json({ message: text });
            } catch (err) {
                attempts++;
                if (err.message.includes("503") || err.message.includes("429")) {
                    await sleep(2000);
                    continue;
                }
                throw err;
            }
        }
    } catch (err) {
        console.error("❌ AI Error:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống AI: " + err.message });
    }
};
