const Room = require("../models/Room");

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).send("Tin nhắn trống");

        const msg = message.toLowerCase();
        const rooms = await Room.find({ status: 'available' }).lean();
        let response = "";

        // --- BỘ NÃO QUY TRÌNH (LOGIC ENGINE) ---

        // 1. Nhóm Thuê Phòng & Tìm Kiếm
        if (msg.includes("phòng") || msg.includes("thuê") || msg.includes("ở")) {
            if (msg.includes("giá") || msg.includes("bao nhiêu")) {
                const prices = rooms.map(r => r.price);
                response = `💰 Giá phòng dao động từ ${Math.min(...prices).toLocaleString()}đ. Bạn hãy vào mục 'Phòng' ở Sidebar để xem danh sách chi tiết và hình ảnh nhé!`;
            } else if (rooms.length > 0) {
                response = `🏠 Hiện tại có ${rooms.length} phòng sẵn sàng. Hướng dẫn: Bạn vào mục 'Phòng', chọn phòng ưng ý, nhấn 'Thuê ngay' và điền thông tin là xong!`;
            } else {
                response = "🏢 Hiện tại SmartDorm đã hết phòng trống. Bạn có thể để lại thông tin liên hệ, chúng tôi sẽ báo ngay khi có phòng mới!";
            }
        }
        
        // 2. Nhóm Hóa Đơn & Thanh Toán
        else if (msg.includes("tiền") || msg.includes("hóa đơn") || msg.includes("đóng") || msg.includes("thanh toán")) {
            response = `💳 Quy trình thanh toán: 
            1. Bạn truy cập vào mục 'Hóa đơn' ở menu bên trái. 
            2. Chọn hóa đơn cần đóng (điện, nước, tiền nhà). 
            3. Nhấn vào nút 'Thanh toán' để thanh toán nhanh qua VNPAY một cách an toàn.`;
        }

        // 3. Nhóm Sửa Chữa & Bảo Trì
        else if (msg.includes("hỏng") || msg.includes("sửa") || msg.includes("bảo trì") || msg.includes("lỗi")) {
            response = `🛠 Hướng dẫn báo sửa chữa: 
            Nếu phòng có vấn đề (điện, nước, nội thất), bạn hãy vào mục 'Yêu cầu sửa chữa', nhấn nút 'Tạo yêu cầu mới', mô tả tình trạng và gửi đi. Admin sẽ cử người đến xử lý ngay!`;
        }

        // 4. Nhóm Tiện Ích (Xe, Wifi, An Ninh)
        else if (msg.includes("xe") || msg.includes("wifi") || msg.includes("mạng") || msg.includes("giặt") || msg.includes("an ninh") || msg.includes("camera")) {
            response = `🌟 Tiện ích tại SmartDorm: 
            - Bãi giữ xe: Có hầm để xe rộng rãi, an toàn cho cư dân.
            - Internet: Wifi tốc độ cao được phủ sóng toàn bộ các tầng.
            - An ninh: Camera giám sát 24/7 và khóa vân tay cửa chính.
            - Giặt giũ: Có khu vực máy giặt sấy chung tại tầng thượng.`;
        }

        // 5. Nhóm Thông Tin & Liên Hệ (Đổi số thứ tự)
        else if (msg.includes("liên hệ") || msg.includes("quản lý") || msg.includes("chủ trọ")) {
            response = "📞 Bạn có thể gọi trực tiếp Hotline: 090.111.2222 hoặc gửi tin nhắn vào mục 'Tin nhắn' để chat trực tiếp với Admin SmartDorm nhé!";
        }

        // 5. Chào hỏi & Các câu hỏi khác
        else if (msg.includes("chào") || msg.includes("hi") || msg.includes("hello")) {
            response = "👋 Chào bạn! Tôi là SmartBot. Tôi có thể chỉ bạn cách: Thuê phòng, Đóng tiền nhà, hoặc Báo sửa chữa thiết bị. Bạn cần tôi hỗ trợ mục nào?";
        }
        else {
            response = "💡 Tôi hiểu ý bạn. Để thuận tiện nhất, bạn có thể: \n- Vào 'Phòng' để xem phòng.\n- Vào 'Hóa đơn' để đóng tiền.\n- Hoặc nhắn 'Phòng trống' để tôi liệt kê cho bạn nhé!";
        }

        // --- STREAMING OUTPUT ---
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        const words = response.split(" ");
        for (const word of words) {
            res.write(word + " ");
            await new Promise(r => setTimeout(r, 25));
        }
        res.end();

    } catch (error) {
        console.error("🔥 Smart Logic Error:", error);
        res.status(500).send("SmartBot đang cập nhật dữ liệu, bạn thử lại sau nhé!");
    }
};
