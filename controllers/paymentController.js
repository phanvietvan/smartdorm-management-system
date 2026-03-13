const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
const { ROLES } = require("../config/roles");

const filterByUser = (req) => {
  const filter = {};
  if (req.user.role === ROLES.TENANT) filter.tenantId = req.user._id;
  return filter;
};

exports.getAll = async (req, res) => {
  try {
    const filter = filterByUser(req);
    const { status, billId } = req.query;
    if (status) filter.status = status;
    if (billId) filter.billId = billId;
    const payments = await Payment.find(filter)
      .populate("billId")
      .populate("tenantId", "fullName email")
      .populate("confirmedBy", "fullName")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("billId")
      .populate("tenantId", "fullName email phone")
      .populate("confirmedBy", "fullName");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (req.user.role === ROLES.TENANT && payment.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xem" });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { billId, amount, method, note } = req.body;
    if (!billId || !amount) return res.status(400).json({ message: "Thiếu billId hoặc amount" });
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (req.user.role === ROLES.TENANT && bill.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ có thể thanh toán hóa đơn của mình" });
    }
    const payment = new Payment({
      billId,
      tenantId: bill.tenantId,
      amount,
      method: method || "cash",
      note,
    });
    await payment.save();
    const populated = await Payment.findById(payment._id).populate("billId").populate("tenantId", "fullName");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    payment.status = "confirmed";
    payment.confirmedBy = req.user._id;
    payment.confirmedAt = new Date();
    await payment.save();
    await Bill.findByIdAndUpdate(payment.billId, { status: "paid" });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createVnpayUrl = async (req, res) => {
  try {
    const { amount, billId } = req.body;
    if (!amount || !billId) return res.status(400).json({ success: false, message: "Thiếu thông tin thanh toán" });

    // Mock url returning
    const mockUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amount * 100}&vnp_OrderInfo=${billId}&vnp_TxnRef=${Date.now()}`;
    res.json({ success: true, url: mockUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const { vnp_OrderInfo, vnp_ResponseCode } = req.query;
    
    // 00 is success code in VNPAY
    if (vnp_ResponseCode === '00') {
      const billId = vnp_OrderInfo; // We passed billId in OrderInfo

      // Confirm payment auto
      const bill = await Bill.findById(billId);
      if (bill) {
        bill.status = "paid";
        await bill.save();

        // Also create/update a payment record
        const payment = new Payment({
          billId,
          tenantId: bill.tenantId,
          amount: bill.totalAmount,
          method: "vnpay",
          status: "confirmed",
          confirmedAt: new Date()
        });
        await payment.save();
      }
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }
    
    res.status(200).json({ RspCode: '97', Message: 'Fail' });
  } catch (error) {
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};
