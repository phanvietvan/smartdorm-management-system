const Room = require("../models/Room");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).send("Tin nhắn trống");

        const msg = message.toLowerCase();
        const rooms = await Room.find({ status: 'available' }).lean();
        let aiResponse = "";
        let usedGemini = false;

        // --- PHASE 1: TRY GEMINI AI ---
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY") {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Dùng gemini-1.5-flash cho tốc độ nhanh và tiết kiệm
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                const context = `
                Bạn là SmartBot, trợ lý ảo của hệ thống quản lý ký túc xá thông minh SmartDorm.
                Thông tin hiện tại của ký túc xá:
                - Số phòng trống: ${rooms.length}
                - Các tiện ích: Wifi tốc độ cao, Hầm để xe, Camera 24/7, Máy giặt sấy tầng thượng.
                - Quy trình: 
                    + Thuê phòng: Vào mục 'Phòng', chọn phòng và nhấn 'Thuê ngay'.
                    + Thanh toán: Vào mục 'Hóa đơn', chọn hóa đơn và thanh toán qua VNPAY.
                    + Sửa chữa: Vào mục 'Yêu cầu sửa chữa' để tạo yêu cầu mới.
                Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp.
                `;

                const result = await model.generateContent([context, message]);
                const response = await result.response;
                aiResponse = response.text();
                usedGemini = true;
            } catch (aiErr) {
                console.error("Gemini AI error, falling back to logic:", aiErr.message);
            }
        }

        // --- PHASE 2: RULE-BASED FALLBACK (Nếu AI lỗi hoặc không có key) ---
        if (!usedGemini) {
            // 1. Nhóm Thuê Phòng & Tìm Kiếm
            if (msg.includes("phòng") || msg.includes("thuê") || msg.includes("ở")) {
                if (msg.includes("giá") || msg.includes("bao nhiêu")) {
                    const prices = rooms.map(r => r.price);
                    aiResponse = `💰 Giá phòng dao động từ ${prices.length > 0 ? Math.min(...prices).toLocaleString() : '1.500.000'}đ. Bạn hãy vào mục 'Phòng' ở Sidebar để xem danh sách chi tiết và hình ảnh nhé!`;
                } else if (rooms.length > 0) {
                    aiResponse = `🏠 Hiện tại có ${rooms.length} phòng sẵn sàng. Hướng dẫn: Bạn vào mục 'Phòng', chọn phòng ưng ý, nhấn 'Thuê ngay' và điền thông tin là xong!`;
                } else {
                    aiResponse = "🏢 Hiện tại SmartDorm đã hết phòng trống. Bạn có thể để lại thông tin liên hệ, chúng tôi sẽ báo ngay khi có phòng mới!";
                }
            }
            // 2. Nhóm Hóa Đơn & Thanh Toán
            else if (msg.includes("tiền") || msg.includes("hóa đơn") || msg.includes("đóng") || msg.includes("thanh toán")) {
                aiResponse = `💳 Quy trình thanh toán: 
                1. Bạn truy cập vào mục 'Hóa đơn' ở menu bên trái. 
                2. Chọn hóa đơn cần đóng (điện, nước, tiền nhà). 
                3. Nhấn vào nút 'Thanh toán' để thanh toán nhanh qua VNPAY một cách an toàn.`;
            }
            // 3. Nhóm Sửa Chữa & Bảo Trì
            else if (msg.includes("hỏng") || msg.includes("sửa") || msg.includes("bảo trì") || msg.includes("lỗi")) {
                aiResponse = `🛠 Hướng dẫn báo sửa chữa: 
                Nếu phòng có vấn đề (điện, nước, nội thất), bạn hãy vào mục 'Yêu cầu sửa chữa', nhấn nút 'Tạo yêu cầu mới', mô tả tình trạng và gửi đi. Admin sẽ cử người đến xử lý ngay!`;
            }
            // 4. Nhóm Tiện Ích (Xe, Wifi, An Ninh)
            else if (msg.includes("xe") || msg.includes("wifi") || msg.includes("mạng") || msg.includes("giặt") || msg.includes("an ninh") || msg.includes("camera")) {
                aiResponse = `🌟 Tiện ích tại SmartDorm: 
                - Bãi giữ xe: Có hầm để xe rộng rãi, an toàn cho cư dân.
                - Internet: Wifi tốc độ cao được phủ sóng toàn bộ các tầng.
                - An ninh: Camera giám sát 24/7 và khóa vân tay cửa chính.
                - Giặt giũ: Có khu vực máy giặt sấy chung tại tầng thượng.`;
            }
            // 5. Nhóm Thông Tin & Liên Hệ
            else if (msg.includes("liên hệ") || msg.includes("quản lý") || msg.includes("chủ trọ")) {
                aiResponse = "📞 Bạn có thể gọi trực tiếp Hotline: 090.111.2222 hoặc gửi tin nhắn vào mục 'Tin nhắn' để chat trực tiếp với Admin SmartDorm nhé!";
            }
            // 6. Chào hỏi & Các câu hỏi khác
            else if (msg.includes("chào") || msg.includes("hi") || msg.includes("hello")) {
                aiResponse = "👋 Chào bạn! Tôi là SmartBot. Tôi có thể chỉ bạn cách: Thuê phòng, Đóng tiền nhà, hoặc Báo sửa chữa thiết bị. Bạn cần tôi hỗ trợ mục nào?";
            }
            else {
                aiResponse = "💡 Tôi hiểu ý bạn. Để thuận tiện nhất, bạn có thể: \n- Vào 'Phòng' để xem phòng.\n- Vào 'Hóa đơn' để đóng tiền.\n- Hoặc nhắn 'Phòng trống' để tôi liệt kê cho bạn nhé!";
            }
        }

        // --- STREAMING OUTPUT ---
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        const words = aiResponse.split(" ");
        for (const word of words) {
            res.write(word + " ");
            await new Promise(r => setTimeout(r, 10)); // Giảm delay cho cảm giác nhanh hơn
        }
        res.end();

    } catch (error) {
        console.error("🔥 Smart Logic Error:", error);
        res.status(500).send("SmartBot đang cập nhật dữ liệu, bạn thử lại sau nhé!");
    }
};
