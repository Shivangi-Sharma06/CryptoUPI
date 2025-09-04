const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const fs = require("fs");

async function extractUpiId(imagePath) {
  const image = await Jimp.read(imagePath);
  const { data, width, height } = image.bitmap;

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err) return reject(err);
      if (!value) return reject("QR not detected");

      const qrText = value.result;

      const params = new URLSearchParams(qrText.split("?")[1]);
      const upiId = params.get("pa");
      resolve(upiId);
    };

    qr.decode({ data, width, height });
  });
}

extractUpiId("qr.jpeg")
  .then(upiId => console.log("Extracted UPI ID:", upiId))
  .catch(console.error);
