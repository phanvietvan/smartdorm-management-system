const Room = require("../models/Room");
const User = require("../models/User");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const Visitor = require("../models/Visitor");

exports.getStats = async (req, res) => {
  try {
    const [totalRooms, availableRooms, totalUsers, totalBills, paidBills, totalRevenue, pendingMaintenance, todayVisitors] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: "available" }),
      User.countDocuments({ role: { $ne: "guest" } }),
      Bill.countDocuments(),
      Bill.countDocuments({ status: "paid" }),
      Payment.aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      MaintenanceRequest.countDocuments({ status: { $in: ["pending", "in_progress"] } }),
      Visitor.countDocuments({
        checkInAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        checkOutAt: null,
      }),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      rooms: { total: totalRooms, available: availableRooms, occupied: totalRooms - availableRooms },
      users: totalUsers,
      bills: { total: totalBills, paid: paidBills, pending: totalBills - paidBills },
      revenue,
      maintenance: { pending: pendingMaintenance },
      visitors: { today: todayVisitors },
      rentals: { pending: 0 }, // Trả về 0 để tránh crash Frontend cũ
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const payments = await Payment.aggregate([
      { $match: { status: "confirmed", createdAt: { $gte: new Date(targetYear, 0, 1), $lt: new Date(targetYear + 1, 0, 1) } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: payments.find((p) => p._id === i + 1)?.total || 0,
      count: payments.find((p) => p._id === i + 1)?.count || 0,
    }));
    const total = byMonth.reduce((sum, m) => sum + m.total, 0);
    res.json({ year: targetYear, byMonth, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
