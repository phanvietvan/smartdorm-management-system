const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
const { ROLES } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");
const vnpayService = require("../services/vnpayService");

const filterByRole = (req) => {
  const filter = {};
  if (req.user.role === ROLES.TENANT) filter.tenantId = req.user._id;
  return filter;
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = filterByRole(req);
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("billId")
      .populate("tenantId", "fullName email")
      .populate("confirmedBy", "fullName");

    const count = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("billId")
      .populate("tenantId", "fullName email phone")
      .populate("confirmedBy", "fullName");

    if (!payment) return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" });
    
    if (req.user.role === ROLES.TENANT && payment.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền xem" });
    }
    
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createVnpayUrl = async (req, res) => {
  try {
    const { amount, billId, language } = req.body;
    const userId = req.user._id;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });

    const orderId = `${billId}_${Date.now()}`;
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '127.0.0.1';

    const orderInfo = `Thanh toan hoa don thang ${bill.month}/${bill.year}: ${billId}`;

    // Lưu vào DB ở trạng thái pending
    await Payment.create({
        tenantId: userId,
        billId,
        orderId,
        amount,
        orderInfo,
        method: 'vnpay',
    });

    const paymentUrl = vnpayService.createPaymentUrl(
        orderId,
        amount,
        orderInfo,
        ipAddr,
        language
    );

    res.status(200).json({
        success: true,
        vnpUrl: paymentUrl,
        data: { orderId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isValid = vnpayService.verifySignature(vnp_Params);

    if (!isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (payment.amount !== (parseInt(vnp_Params.vnp_Amount) / 100)) {
        return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (payment.status === 'confirmed') {
        return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    const responseCode = vnp_Params.vnp_ResponseCode;
    payment.vnpayData = vnp_Params;
    payment.transactionNo = vnp_Params.vnp_TransactionNo;
    payment.bankCode = vnp_Params.vnp_BankCode;
    payment.cardType = vnp_Params.vnp_CardType;

    if (responseCode === '00') {
      payment.status = 'confirmed';
      await payment.save();

      // Cập nhật hóa đơn
      await Bill.findByIdAndUpdate(payment.billId, { status: 'paid' });

      // Thông báo
      if (payment.tenantId) {
        await notifyUser(payment.tenantId.toString(), "Thanh toán thành công", `Hóa đơn tháng ${payment.orderInfo.split('thang').pop().trim()} đã được thanh toán tự động qua VNPAY.`, "bill");
      }

      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      payment.status = 'failed';
      await payment.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success (Failed Recorded)' });
    }
  } catch (error) {
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const query = filterByRole(req);
    const { startDate, endDate } = req.query;

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);

    const total = await Payment.countDocuments(query);
    const successQuery = { ...query, status: 'confirmed' };
    const totalAmountRes = await Payment.aggregate([
        { $match: successQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats,
            total,
            totalConfirmedAmount: totalAmountRes[0]?.total || 0,
        },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmManual = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" });
    
    payment.status = "confirmed";
    payment.confirmedBy = req.user._id;
    payment.confirmedAt = new Date();
    await payment.save();
    
    await Bill.findByIdAndUpdate(payment.billId, { status: "paid" });
    
    if (payment.tenantId) {
      await notifyUser(payment.tenantId.toString(), "Thanh toán đã xác nhận", `Thanh toán cho hóa đơn hóa đơn đã được quản trị xác nhận.`, "bill");
    }
    
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createManual = async (req, res) => {
  try {
    const { billId, amount, method, evidenceImage } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: "Hóa đơn không tồn tại" });

    const payment = new Payment({
      billId,
      tenantId: bill.tenantId,
      amount,
      method: method || "cash",
      status: "pending",
      evidenceImage,
      orderId: `MANUAL_${billId}_${Date.now()}`,
      orderInfo: `Bao cao thanh toan thu cong hoa don thang ${bill.month}/${bill.year}`
    });

    await payment.save();
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
