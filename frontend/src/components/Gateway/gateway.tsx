import { useState, useEffect } from "react";
import Navigation from "../Navbar/Navigation";
import { formatUnits } from "ethers";
import { useActiveAccount } from "thirdweb/react";

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
  const [activeTab, setActiveTab] = useState<"request" | "pay">("pay");
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedUpi, setExtractedUpi] = useState<string>("");
  const [amount, setAmount] = useState("");

  const [tokens, setTokens] = useState<Token[]>([]);
  const [nativeBalance, setNativeBalance] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null); // selected token

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

  // QR submit backend logic done
  const handleQrSubmit = async () => {
    if (!qrImage) {
      alert("QR upload karo");
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
      } else {
        alert("UPI extract failed");
      }
    } catch (err) {
      console.error("QR error:", err);
      alert("QR submit me error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pay handler
  const handlePay = () => {
    if (!extractedUpi) {
      alert("UPI id upload karo");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      alert("Valid amount enter karo");
      return;
    }

    const tokenSymbol = selectedToken ? selectedToken.symbol : "ETH";
    alert(`Paying ₹${amount} using ${tokenSymbol} to ${extractedUpi}`);
  };

  // fetch INR prices
  const fetchInrPrices = async (symbols: string[]) => {
    const coinIds = symbols
      .map((s) => symbolToId[s.toLowerCase()])
      .filter(Boolean);

    if (coinIds.length === 0) return {};

    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(
        ","
      )}&vs_currencies=inr`
    );
    const priceData = await resp.json();
    return priceData;
  };

  useEffect(() => {
    if (walletAddress) {
      fetchMoralisAssets(walletAddress);
    }
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
      if (!nativeResp.ok) throw new Error("Native balance fetch failed");
      const nativeJson = await nativeResp.json();

      const formattedTokens: Token[] = tokenJson
        .filter((t: any) => t.balance && t.balance !== "0")
        .map((t: any) => ({
          name: t.name || "—",
          symbol: t.symbol || "—",
          contract: t.token_address,
          decimals: t.decimals || 18,
          balance: formatUnits(t.balance.toString(), t.decimals || 18),
        }));

      const priceData = await fetchInrPrices(
        formattedTokens.map((t) => t.symbol)
      );

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
        const formattedNative = formatUnits(
          nativeJson.balance.toString(),
          nativeJson.decimals || 18
        );
        setNativeBalance(formattedNative);

        // default selected token ETH
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
      console.error("Error fetching Moralis assets:", err);
      setTokens([]);
      setNativeBalance("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-glow">
          Gateway Verification
        </h1>

        {/* Horizontal scrollable tokens */}
        <div className="flex overflow-x-auto space-x-4 pb-6">
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
              className={`flex-none w-60 cursor-pointer rounded-2xl border p-4 shadow-md ${
                selectedToken?.symbol === "ETH"
                  ? "bg-primary text-black border-primary"
                  : "bg-secondary text-primary border-border"
              }`}
            >
              <img
                src={symbolToLogo["eth"]}
                alt="ETH"
                className="w-10 h-10 mb-3"
              />
              <p className="font-semibold">Ethereum (Native)</p>
              <p>{nativeBalance} ETH</p>
            </div>
          )}

          {tokens.map((t: Token) => (
            <div
              key={t.contract + t.symbol}
              onClick={() => setSelectedToken(t)}
              className={`flex-none w-60 cursor-pointer rounded-2xl border p-4 shadow-md ${
                selectedToken?.symbol === t.symbol
                  ? "bg-primary text-black border-primary"
                  : "bg-secondary text-primary border-border"
              }`}
            >
              <img
                src={symbolToLogo[t.symbol.toLowerCase()] || ""}
                alt={t.symbol}
                className="w-10 h-10 mb-3"
              />
              <p className="font-semibold">
                {t.name} ({t.symbol})
              </p>
              <p>
                {t.balance} {t.symbol}
              </p>
              {t.inrValue && (
                <p className="text-sm text-muted-foreground">
                  ≈ ₹{t.inrValue} <br />
                  (₹{t.inrPrice}/token)
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Payment Gateway Card */}
        <div className="bg-background border border-border rounded-5xl p-6 shadow-lg mt-14">
          <h2 className="text-2xl font-bold mb-6 text-glow">Payment Gateway</h2>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === "request"
                  ? "bg-primary text-black"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              Request
            </button>
            <button
              onClick={() => setActiveTab("pay")}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === "pay"
                  ? "bg-primary text-black"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              Pay
            </button>
          </div>

          {/* Request tab */}
          {activeTab === "request" && (
            <div className="text-muted-foreground">Request feature to be there</div>
          )}

          {/* Pay tab */}
          {activeTab === "pay" && (
            <div className="space-y-6">
              {/* Selected Token */}
              {selectedToken && (
                <div className="p-3 bg-secondary rounded border border-primary">
                  <p className="text-sm text-primary mb-1">Selected Token:</p>
                  <p className="text-lg font-semibold">
                    {selectedToken.name} ({selectedToken.symbol})
                  </p>
                  <p>
                    Balance: {selectedToken.balance} {selectedToken.symbol}
                  </p>
                  {selectedToken.inrValue && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ₹{selectedToken.inrValue}
                    </p>
                  )}
                </div>
              )}

              {/* Upload QR */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Receiver QR
                </label>
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
                <div className="p-3 bg-secondary rounded border border-primary">
                  <p className="text-sm text-primary mb-1">UPI ID:</p>
                  <code className="text-lg text-glow">{extractedUpi}</code>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount INR</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="w-full p-3 border rounded bg-background text-primary"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                className="w-full p-3 bg-green-500 rounded text-white hover:bg-green-600"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentGateway;
