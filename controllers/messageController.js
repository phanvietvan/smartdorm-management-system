const Message = require("../models/Message");
const User = require("../models/User");

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    })
      .populate("senderId", "fullName")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.send = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: "Thiếu receiverId hoặc content" });
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content,
    });
    await message.save();
    const populated = await Message.findById(message._id).populate("senderId", "fullName").populate("receiverId", "fullName");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Message.updateMany(
      { receiverId: req.user._id, senderId: req.params.userId },
      { read: true, readAt: new Date() }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChatList = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", req.user._id] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $limit: 50 },
    ]);
    const userIds = [...new Set(messages.flatMap((m) => [m.senderId, m.receiverId]).filter((id) => id.toString() !== req.user._id.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select("fullName");
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const list = messages.map((m) => {
      const otherId = m.senderId.toString() === req.user._id.toString() ? m.receiverId : m.senderId;
      return {
        userId: otherId,
        fullName: userMap[otherId.toString()]?.fullName || "Unknown",
        lastMessage: m.content,
        createdAt: m.createdAt,
        read: m.receiverId.toString() === req.user._id.toString() ? m.read : true,
      };
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
