const mongoose = require('mongoose');

exports.validateCreatePayment = (req, res, next) => {
    const { amount, billId } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Số tiền thanh toán phải lớn hơn 0',
        });
    }

    if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
        return res.status(400).json({
            success: false,
            message: 'Mã hóa đơn không hợp lệ',
        });
    }

    next();
};
