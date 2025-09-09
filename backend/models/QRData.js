import mongoose from "mongoose";

const QRDataSchema = new mongoose.Schema({
  upiId: { type: String, required: true },
  qrImagePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const QRData = mongoose.model("QRData", QRDataSchema);

export default QRData;
