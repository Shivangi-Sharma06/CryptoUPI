import Jimp from "jimp";
import QrCode from "qrcode-reader";

export async function extractUpiId(imagePath) {
  const image = await Jimp.read(imagePath); // in newer versions, use Jimp.read
  const { data, width, height } = image.bitmap;

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err) return reject(err);
      if (!value) return reject("QR not detected");

      const qrText = value.result || "";
      if (!qrText.includes("upi://")) return reject("Not a UPI QR");

      const params = new URLSearchParams(qrText.split("?")[1] || "");
      const upiId = params.get("pa"); //pa is payee address
      if (!upiId) return reject("UPI ID not found");

      resolve(upiId);
    };

    qr.decode({ data, width, height });
  });
}
