const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        billId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
            required: true,
        },
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        orderInfo: {
            type: String,
            required: true,
        },
        method: {
            type: String,
            enum: ['vnpay', 'cash', 'bank_transfer'],
            default: 'vnpay',
        },
        transactionNo: {
            type: String,
            default: null,
        },
        bankCode: {
            type: String,
            default: null,
        },
        cardType: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'failed', 'cancelled'],
            default: 'pending',
        },
        evidenceImage: {
            type: String,
            default: null,
        },
        vnpayData: {
            type: Object,
            default: {},
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        confirmedAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

paymentSchema.index({ tenantId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ billId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
