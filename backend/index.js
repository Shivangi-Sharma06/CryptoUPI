import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { extractUpiId } from "./models/qrExtractor.js";
import QRData from "./models/QRData.js";
import axios from "axios";
import dotenv from "dotenv";
import Moralis from "moralis";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
if (!MORALIS_API_KEY) {
  throw new Error("MORALIS_API_KEY is not set in environment variables.");
}

Moralis.start({
  apiKey: MORALIS_API_KEY,
})
  .then(() => {
    console.log("Moralis started");
  })
  .catch((e) => {
    console.error("Moralis failed to start:", e);
  });

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:8080" }));

// MongoDB connect ka code
mongoose
  .connect("mongodb://localhost:27017/qrupi")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route to handle QR upload dynamically
app.post("/upload-qr", upload.single("qrImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { walletAddress } = req.body;

    // req.file.path has the file location in /uploads
    const upiId = await extractUpiId(req.file.path);

    // Save into MongoDB
    const qrData = new QRData({
      walletAddress,
      upiId,
      qrImagePath: req.file.path,
    });
    await qrData.save();

    res.json({
      message: "UPI extracted and saved",
      walletAddress,
      upiId,
      filePath: req.file.path,
    });
  } catch (err) {
    console.error("Error in /upload-qr:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// New route to fetch all UPI IDs
app.get("/upi-list", async (req, res) => {
  try {
    const allData = await QRData.find({}, "walletAddress upiId");
    res.json(allData);
  } catch (err) {
    console.error("Error in /upi-list:", err);
    res.status(500).json({ error: err.toString() });
  }
});

async function getTokenBalances(address, chain = "sepolia") {
  if (!address) throw new Error("Address is required");
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: "0xaa36a7",
      address: address,
    });
    console.log(`Tokens: ${response.raw[0].balance}`);
    console.log(response.raw[0].name);
    return response.raw;
  } catch (e) {
    console.error(e);
  }
  return response.data; // array of token objects
}

async function getNativeBalance(address, chain = "sepolia") {
  if (!address) throw new Error("Address is required");
  const url = `https://deep-index.moralis.io/api/v2/${address}/balance?chain=${chain}`;
  const response = await axios.get(url, {
    headers: {
      accept: "application/json",
      "X-API-Key": MORALIS_API_KEY,
    },
    timeout: 15000,
  });
  console.log("Native balance response:", response.data);
  return response.data;
}

//erc20 wala code
app.get("/api/token-balances", async (req, res) => {
  try {
    const { address, chain } = req.query;
    if (!address) return res.status(400).json({ error: "address is required" });
    const balances = await getTokenBalances(address, chain || "sepolia");
    res.json(balances);
  } catch (err) {
    console.error(
      "Error in /api/token-balances (query):",
      err?.response?.data || err.message
    );
    res.status(500).json({ error: err.toString() });
  }
});

// fetch native balance
app.get("/api/native-balance", async (req, res) => {
  try {
    const { address, chain } = req.query;
    if (!address) return res.status(400).json({ error: "address is required" });

    const balance = await getNativeBalance(address, chain || "sepolia");
    res.json(balance);
  } catch (err) {
    console.error(
      "Error in /api/native-balance:",
      err?.response?.data || err.message
    );
    res.status(500).json({ error: err.toString() });
  }
});

// check the upi id exist
// app.post("/check-upi", async (req, res) => {
//   try {
//     const { upiId } = req.body;
//     if (!upiId) {
//       return res.status(400).json({ error: "UPI ID is required" });
//     }

//     const existing = await QRData.findOne({ upiId: upiId.trim() });

//     if (existing) {
//       return res.json({ exists: true });
//     } else {
//       return res.json({ exists: false });
//     }
//   } catch (err) {
//     console.error("Error in /check-upi:", err);
//     res.status(500).json({ error: err.toString() });
//   }
// });


app.listen(3000, async () => {
  console.log("Server running on port 3000");
});