const Bill = require("../models/Bill");
const Service = require("../models/Service");
const Room = require("../models/Room");
const { ROLES } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");

const filterByUser = (req) => {
  const filter = {};
  if (req.user && req.user.role === ROLES.TENANT) {
    filter.tenantId = req.user._id;
  }
  return filter;
};

exports.getAll = async (req, res) => {
  try {
    console.log("GET ALL BILLS QUERY:", req.query);
    const filter = filterByUser(req);
    const { month, year, status, roomId } = req.query;
    
    if (month && !isNaN(parseInt(month))) filter.month = parseInt(month);
    if (year && !isNaN(parseInt(year))) filter.year = parseInt(year);
    if (status && status.trim() !== "") filter.status = status;
    if (roomId && roomId.trim() !== "" && roomId !== "undefined") filter.roomId = roomId;
    
    console.log("BILL FILTER APPLIED:", filter);

    const bills = await Bill.find(filter)
      .populate("roomId", "name floor")
      .populate("tenantId", "fullName email phone")
      .sort({ year: -1, month: -1, createdAt: -1 });
      
    res.json(bills || []);
  } catch (err) {
    console.error("CRITICAL BILL API ERROR:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách hóa đơn: " + err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("roomId", "name floor price")
      .populate("tenantId", "fullName email phone");
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (req.user.role === ROLES.TENANT && bill.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xem hóa đơn này" });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { roomId, tenantId, month, year, prevWater, currWater, prevElec, currElec, otherAmount, dueDate, note } = req.body;
    if (!roomId || !tenantId || !month || !year) {
      return res.status(400).json({ message: "Thiếu roomId, tenantId, month hoặc year" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    
    // Get service prices
    const elecService = await Service.findOne({ name: { $regex: /điện|dien/i } });
    const waterService = await Service.findOne({ name: { $regex: /nước|nuoc/i } });
    
    const elecPrice = elecService ? elecService.unitPrice : 3500;
    const waterPrice = waterService ? waterService.unitPrice : 20000;

    const electricityAmount = Math.max(0, (currElec || 0) - (prevElec || 0)) * elecPrice;
    const waterAmount = Math.max(0, (currWater || 0) - (prevWater || 0)) * waterPrice;
    const rentAmount = room.price || 0;
    
    const totalAmount = rentAmount + electricityAmount + waterAmount + (otherAmount || 0);
    
    const bill = new Bill({
      roomId,
      tenantId,
      month,
      year,
      rentAmount,
      prevWater: prevWater || 0,
      currWater: currWater || 0,
      waterAmount,
      prevElec: prevElec || 0,
      currElec: currElec || 0,
      electricityAmount,
      otherAmount: otherAmount || 0,
      totalAmount,
      dueDate: dueDate || new Date(year, month, 0),
      note,
    });
    await bill.save();
    const populated = await Bill.findById(bill._id).populate("roomId", "name").populate("tenantId", "fullName");
    // Gửi thông báo ngay cho tài khoản khách (tenant) khi vừa tạo hóa đơn
    const tenantIdForNotif = tenantId && typeof tenantId === "object" ? tenantId.toString() : tenantId;
    if (tenantIdForNotif) {
      await notifyUser(
        tenantIdForNotif,
        "Hóa đơn mới",
        `Bạn có hóa đơn tháng ${month}/${year}. Tổng: ${totalAmount.toLocaleString("vi-VN")}đ. Vui lòng thanh toán trước hạn.`,
        "bill",
        `/app/bills/${bill._id}`,
        { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl }
      );
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    const { prevWater, currWater, prevElec, currElec, otherAmount, status } = req.body;
    
    if (prevWater !== undefined) bill.prevWater = prevWater;
    if (currWater !== undefined) bill.currWater = currWater;
    if (prevElec !== undefined) bill.prevElec = prevElec;
    if (currElec !== undefined) bill.currElec = currElec;
    if (otherAmount !== undefined) bill.otherAmount = otherAmount;
    if (status) bill.status = status;

    // Recalculate if indices are updated
    if (prevWater !== undefined || currWater !== undefined || prevElec !== undefined || currElec !== undefined) {
      const elecService = await Service.findOne({ name: { $regex: /điện|dien/i } });
      const waterService = await Service.findOne({ name: { $regex: /nước|nuoc/i } });
      const elecPrice = elecService ? elecService.unitPrice : 3500;
      const waterPrice = waterService ? waterService.unitPrice : 20000;
      
      bill.electricityAmount = Math.max(0, bill.currElec - bill.prevElec) * elecPrice;
      bill.waterAmount = Math.max(0, bill.currWater - bill.prevWater) * waterPrice;
    }
    
    bill.totalAmount = bill.rentAmount + bill.electricityAmount + bill.waterAmount + bill.otherAmount;
    await bill.save();
    if (status === "paid") {
      const tenantId = bill.tenantId && bill.tenantId.toString ? bill.tenantId.toString() : bill.tenantId;
      if (tenantId) await notifyUser(
        tenantId, 
        "Hóa đơn đã thanh toán", 
        `Hóa đơn tháng ${bill.month}/${bill.year} đã được thanh toán.`, 
        "bill",
        `/app/bills/${bill._id}`,
        { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl }
      );
    }
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.dispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    if (bill.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ người thuê mới được khiếu nại hóa đơn của mình" });
    }
    bill.status = "disputed";
    bill.note = note || "Khách khiếu nại hóa đơn này";
    await bill.save();
    res.json({ success: true, message: "Đã gửi khiếu nại thành công", data: bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

