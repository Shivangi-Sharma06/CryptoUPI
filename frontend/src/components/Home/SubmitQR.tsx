import { useState, useEffect } from "react";
import Navigation from "../Navbar/Navigation";
import { Button } from "../button";
import { formatUnits } from "ethers";
import { useActiveAccount } from "thirdweb/react";

interface Token {
  name: string;
  symbol: string;
  contract: string;
  decimals: number;
  balance: string;
  inrPrice?: number | null;
  inrValue?: string | null; //no value then null
}

const SubmitQR: React.FC = () => {
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [extractedUpi, setExtractedUpi] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nativeBalance, setNativeBalance] = useState<string>("");

  const account = useActiveAccount();
  const walletAddress = account?.address || "";
  const isConnected = !!account;

  // mapping of token coingecko
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

  // Function to fetch inr prices from cg
  const fetchInrPrices = async (symbols: string[]) => {
    const coinIds = symbols
      .map((s) => symbolToId[s.toLowerCase()])
      .filter(Boolean);

    if (coinIds.length === 0) return {};

    const resp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=inr`
    );
    const priceData = await resp.json();
    return priceData; 
  };

  useEffect(() => {
    if (walletAddress) {
      fetchMoralisAssets(walletAddress);
    }
  }, [walletAddress]);

  // fetch token and native balances merged
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

      //fetch karta h inr
      const priceData = await fetchInrPrices(
        formattedTokens.map((t) => t.symbol)
      );

      // inr value merge to token
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
      }
    } catch (err) {
      console.error("Error fetching Moralis assets:", err);
      setTokens([]);
      setNativeBalance("");
    }
  };

  // qr checks
  const submitQrCode = async () => {
    if (!qrImage) {
      alert("Please upload your QR code image.");
      return;
    }
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("walletAddress", walletAddress);
      formData.append("qrImage", qrImage);

      const response = await fetch("http://localhost:3000/upload-qr", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("QR Code image submitted successfully!");
        setQrImage(null);
        setExtractedUpi(data.upiId || "");
      } else {
        alert("Failed to submit QR Code image.");
        setExtractedUpi("");
      }
    } catch (error) {
      alert("Error submitting QR Code image.");
      setExtractedUpi("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-glow">Get Your QR Code</h1>
          <p className="text-muted-foreground text-lg">
            Connect your wallet with thirdweb and submit your GPay QR Code.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Wallet Connection Card */}
          <div className="card-glow p-8 rounded-lg border border-border">
            <div className="flex items-center mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  isConnected ? "bg-green-500" : "bg-secondary"
                }`}
              >
                <span className="text-sm font-bold">1</span>
              </div>
              <h2 className="text-2xl font-semibold text-glow">
                Connect Your Wallet
              </h2>
            </div>

            {!isConnected ? (
              <p className="text-muted-foreground">
                Please connect your wallet ConnectButton in the Navbar.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-green-400 font-medium">
                  Wallet Connected Successfully
                </p>
                <div className="bg-secondary/50 p-4 rounded border">
                  <p className="text-sm text-muted-foreground mb-1">
                    Connected Address:
                  </p>
                  <code className="font-mono text-sm text-primary">
                    {walletAddress}
                  </code>
                </div>

                {/* Display native balance */}
                {nativeBalance && (
                  <div className="mt-2 p-2 bg-secondary rounded border border-primary">
                    <p className="text-sm font-medium text-primary">
                      Native Balance:
                    </p>
                    <p className="text-glow">{nativeBalance} ETH</p>
                  </div>
                )}

                {/* Display token balances */}
                {tokens.length > 0 && (
                  <div className="mt-2 p-2 bg-secondary rounded border border-primary">
                    <p className="text-sm font-medium text-primary mb-1">
                      Token Balances:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {tokens.map((t: Token) => (
                        <div
                          key={t.contract + t.symbol}
                          className="p-3 bg-background/50 rounded border border-border shadow-sm"
                        >
                          <p className="font-semibold text-primary">
                            {t.name} ({t.symbol})
                          </p>
                          <p className="text-glow">
                            {t.balance} {t.symbol}
                          </p>
                          {t.inrValue && (
                            <p className="text-sm text-muted-foreground">
                              ≈ ₹{t.inrValue} (₹{t.inrPrice}/token)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Code Submission Card */}
          {isConnected && (
            <div className="card-glow p-8 rounded-lg border border-border mt-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-primary">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-glow">
                  Put Your QR Code
                </h2>
              </div>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="w-full p-3 border rounded bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setQrImage(e.target.files ? e.target.files[0] : null)
                  }
                  disabled={isSubmitting}
                />
                {qrImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(qrImage)}
                      alt="QR Preview"
                      className="max-h-40 rounded border"
                    />
                  </div>
                )}
                <Button
                  onClick={submitQrCode}
                  className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit QR Code"}
                </Button>
                {extractedUpi && (
                  <div className="mt-6 p-4 bg-secondary rounded border border-primary">
                    <p className="font-semibold text-primary mb-1">
                      Extracted UPI ID:
                    </p>
                    <code className="text-lg text-glow">{extractedUpi}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubmitQR;
