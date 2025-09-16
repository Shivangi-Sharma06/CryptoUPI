import { useState, useEffect } from "react";
import Navigation from "../Navbar/Navigation";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../contractConfig";

interface Token {
  name: string;
  symbol: string;
  contract: string;
  decimals: number;
  balance: string;
  inrPrice?: number | null;
  inrValue?: string | null;
}

const PaymentGateway: React.FC = () => {
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedUpi, setExtractedUpi] = useState<string>("");
  const [amount, setAmount] = useState("");

  const [tokens, setTokens] = useState<Token[]>([]);
  const [nativeBalance, setNativeBalance] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const account = useActiveAccount();
  const walletAddress = account?.address || "";

  const symbolToId: Record<string, string> = {
    eth: "ethereum",
    usdt: "tether",
    usdc: "usd-coin",
    dai: "dai",
    matic: "matic-network",
    link: "chainlink",
    eurs: "stasis-eurs",
    eurc: "euro-coin",
    wbtc: "wrapped-bitcoin",
  };

  const symbolToLogo: Record<string, string> = {
    eth: "/eth.png",
    btc: "/btc.png",
    usdt: "/usdt.png",
    usdc: "/usdc.png",
    dai: "/dai.png",
    matic: "/matic.png",
    link: "/link.png",
    eurc: "/eurc.png",
    eurs: "/eurs.png",
    wbtc: "/wbtc.png",
  };

  // ---------------- QR Submit Backend ----------------
  const handleQrSubmit = async () => {
    if (!qrImage) {
      alert("Please upload QR");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("qrImage", qrImage);

      const resp = await fetch("http://localhost:3000/upload-qr", {
        method: "POST",
        body: formData,
      });

      if (resp.ok) {
        const data = await resp.json();
        setExtractedUpi(data.upiId || "");
        alert("UPI extracted: " + data.upiId);

        if (walletAddress && data.upiId) {
          await registerUPIOnChain(data.upiId);
        }
      } else {
        alert("QR submit failed");
      }
    } catch (err) {
      console.error(err);
      alert("QR submit error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerUPIOnChain = async (upi: string) => {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerUPI(upi);
      await tx.wait();

      alert("UPI registered on-chain successfully!");
    } catch (err: any) {
      console.error("Blockchain error:", err);
      alert("Failed to register UPI: " + (err?.message || err));
    }
  };

  // ------------------ Approve ------------------
  const handleApprove = async () => {
    if (!selectedToken) {
      alert("Select a token first");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      alert("Enter valid amount");
      return;
    }

    if (selectedToken.contract === "") {
      alert("ETH does not need approval!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      const erc20 = new ethers.Contract(
        selectedToken.contract,
        ["function approve(address spender, uint256 value) public returns (bool)"],
        signer
      );

      // APPROVE MAX to prevent allowance errors
      const tx = await erc20.approve(CONTRACT_ADDRESS, ethers.constants.MaxUint256);
      await tx.wait();

      alert(`Approved ${selectedToken.symbol} successfully!`);
    } catch (err: any) {
      console.error("Approval error:", err);
      alert("Approval failed: " + (err?.message || err));
    }
  };

  // ------------------ Pay ------------------
  const handlePay = async () => {
    if (!selectedToken) {
      alert("Select a token first");
      return;
    }
    if (!extractedUpi) {
      alert("Upload UPI QR first");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      alert("Enter valid amount");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const id = symbolToId[selectedToken.symbol.toLowerCase()];
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=inr`
      );
      const data = await resp.json();
      const inrPrice = data[id]?.inr;

      if (!inrPrice) {
        alert("Failed to fetch INR price");
        return;
      }

      const decimals = selectedToken.decimals || 18;
      const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);

      if (selectedToken.contract) {
        // ✅ FIXED: Call sendPayment on your registry contract, not ERC20
        const tx = await contract.sendPayment(selectedToken.contract, extractedUpi, parsedAmount);
        await tx.wait();
      } else {
        // ETH payment
        const tx = await contract.sendPaymentETH(extractedUpi, { value: parsedAmount });
        await tx.wait();
      }

      alert(`Paid ₹${amount} using ${selectedToken.symbol}!`);
    } catch (err: any) {
      console.error("Payment error:", err);
      alert("Payment failed: " + (err?.message || err));
    }
  };

  // ---------------- Fetch INR prices ----------------
  const fetchInrPrices = async (symbols: string[]) => {
    const coinIds = symbols.map((s) => symbolToId[s.toLowerCase()]).filter(Boolean);
    if (coinIds.length === 0) return {};
    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(
        ","
      )}&vs_currencies=inr`
    );
    return await resp.json();
  };

  useEffect(() => {
    if (walletAddress) fetchMoralisAssets(walletAddress);
  }, [walletAddress]);

  const fetchMoralisAssets = async (address: string) => {
    try {
      const tokenResp = await fetch(
        `http://localhost:3000/api/token-balances?address=${address}&chain=sepolia`
      );
      if (!tokenResp.ok) throw new Error("Token fetch failed");
      const tokenJson = await tokenResp.json();

      const nativeResp = await fetch(
        `http://localhost:3000/api/native-balance?address=${address}&chain=sepolia`
      );
      if (!nativeResp.ok) throw new Error("Native fetch failed");
      const nativeJson = await nativeResp.json();

      const formattedTokens: Token[] = tokenJson
        .filter((t: any) => t.balance && t.balance !== "0")
        .map((t: any) => ({
          name: t.name || "—",
          symbol: t.symbol || "—",
          contract: t.token_address,
          decimals: t.decimals || 18,
          balance: ethers.utils.formatUnits(t.balance.toString(), t.decimals || 18),
        }));

      const priceData = await fetchInrPrices(formattedTokens.map((t) => t.symbol));

      const tokensWithInr: Token[] = formattedTokens.map((t) => {
        const id = symbolToId[t.symbol.toLowerCase()];
        const inrPrice = id && priceData[id] ? priceData[id].inr : null;
        const inrValue =
          inrPrice && !isNaN(Number(t.balance))
            ? (Number(t.balance) * inrPrice).toFixed(2)
            : null;
        return { ...t, inrPrice, inrValue };
      });

      setTokens(tokensWithInr);

      if (nativeJson?.balance) {
        const formattedNative = ethers.utils.formatUnits(
          nativeJson.balance.toString(),
          nativeJson.decimals || 18
        );
        setNativeBalance(formattedNative);
        setSelectedToken({
          name: "Ethereum",
          symbol: "ETH",
          contract: "",
          decimals: 18,
          balance: formattedNative,
          inrPrice: null,
          inrValue: null,
        });
      }
    } catch (err) {
      console.error("Moralis fetch error:", err);
      setTokens([]);
      setNativeBalance("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-glow">Gateway Verification</h1>

        {/* ------------------ Horizontal Scroll Tokens ------------------ */}
        <div className="flex overflow-x-auto space-x-4 pb-6 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
          {nativeBalance && (
            <div
              onClick={() =>
                setSelectedToken({
                  name: "Ethereum",
                  symbol: "ETH",
                  contract: "",
                  decimals: 18,
                  balance: nativeBalance,
                  inrPrice: null,
                  inrValue: null,
                })
              }
              className={`flex-none w-52 cursor-pointer rounded-2xl border p-4 shadow-md ${
                selectedToken?.symbol === "ETH"
                  ? "bg-primary text-black border-primary"
                  : "bg-secondary text-primary border-border"
              }`}
            >
              <img src={symbolToLogo["eth"]} alt="ETH" className="w-10 h-10 mb-2" />
              <p className="font-semibold">Ethereum (Native)</p>
              <p>{nativeBalance} ETH</p>
            </div>
          )}

          {tokens.map((t) => (
            <div
              key={t.contract + t.symbol}
              onClick={() => setSelectedToken(t)}
              className={`flex-none w-52 cursor-pointer rounded-2xl border p-4 shadow-md ${
                selectedToken?.symbol === t.symbol
                  ? "bg-primary text-black border-primary"
                  : "bg-secondary text-primary border-border"
              }`}
            >
              <img
                src={symbolToLogo[t.symbol.toLowerCase()] || ""}
                alt={t.symbol}
                className="w-10 h-10 mb-2"
              />
              <p className="font-semibold">
                {t.name} ({t.symbol})
              </p>
              <p>
                {t.balance} {t.symbol}
              </p>
              {t.inrValue && (
                <p className="text-sm text-muted-foreground">≈ ₹{t.inrValue}</p>
              )}
            </div>
          ))}
        </div>

        {/* ------------------ Payment Gateway Card ------------------ */}
        <div className="bg-background border border-border rounded-5xl p-6 shadow-lg mt-8">
          <h2 className="text-2xl font-bold mb-6 text-glow">Payment Gateway</h2>

          {selectedToken && (
            <div className="mt-4 p-3 bg-secondary rounded border border-primary">
              <p className="text-sm text-primary mb-1">Selected Token:</p>
              <p className="font-bold text-lg">
                {selectedToken.name} ({selectedToken.symbol})
              </p>
            </div>
          )}

          {selectedToken && selectedToken.contract !== "" && (
            <button
              onClick={handleApprove}
              className="w-full p-3 bg-blue-500 rounded text-white hover:bg-blue-600 mt-4"
            >
              Approve {selectedToken.symbol}
            </button>
          )}

          {/* Upload QR */}
          <div>
            <label className="block text-sm font-medium mb-2">Receiver QR</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="w-full p-2 border rounded bg-background text-primary"
              onChange={(e) =>
                setQrImage(e.target.files ? e.target.files[0] : null)
              }
              disabled={isSubmitting}
            />
            {qrImage && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(qrImage)}
                  alt="QR Preview"
                  className="max-h-40 rounded border"
                />
              </div>
            )}
            <button
              onClick={handleQrSubmit}
              className="mt-3 px-4 py-2 rounded bg-primary text-black hover:bg-primary/80"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit QR"}
            </button>
          </div>

          {/* Extracted UPI */}
          {extractedUpi && (
            <div className="p-3 bg-secondary rounded border border-primary mt-4">
              <p className="text-sm text-primary mb-1">UPI ID:</p>
              <code className="text-lg text-glow">{extractedUpi}</code>
            </div>
          )}

          {/* Amount */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Amount INR</label>
            <input
              type="number"
              placeholder="e.g. 500"
              className="w-full p-3 border rounded bg-background text-primary"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handlePay}
              className="flex-1 p-3 bg-green-500 rounded text-white hover:bg-green-600"
            >
              Pay with {selectedToken?.symbol || ""}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentGateway;
