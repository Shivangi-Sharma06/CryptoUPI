import { useState } from "react";
import Navigation from "../Navbar/Navigation";
import { Button } from "../ui/button";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [extractedUpi, setExtractedUpi] = useState<string>("");

  const account = useActiveAccount();
  const walletAddress = account?.address || "";
  const isConnected = !!account;

  const navigate = useNavigate();

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

//   const verifyUpi = () => {
//   if (!extractedUpi || !walletAddress) {
//     alert("UPI ID or Wallet Address missing!");
//     return;
//   }

//   const verifyUpi = /^\d{10}@[a-zA-Z0-9]+$/;

//   if (!verifyUpi.test(extractedUpi.trim())) {
//     alert("Invalid format!");
//     return;
//   }
//   alert("UPI ID format is valid. Proceeding to verification...");
//   navigate("/verification");
// };

  const verifyUpi = () => {
  if (!extractedUpi || !walletAddress) {
    alert("UPI ID or Wallet Address missing!");
    return;
  }
  // /@ is the only constraint
  const hasAtSymbol = /@/.test(extractedUpi);

  if (!( hasAtSymbol)) {
    alert("Invalid format! It should contain a 10-digit number and '@'.");
    return;
  }
  alert("format is valid.");
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
          {/* Wallet Connection */}
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
                Please connect your wallet using the ConnectButton in the Navbar.
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
              </div>
            )}
          </div>

          {/* QR Code Upload */}
          {isConnected && (
            <div className="card-glow p-8 rounded-lg border border-border mt-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-primary">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-glow">
                  Upload Your QR Code
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

          {/* Verify and Link */}
          {isConnected && extractedUpi && (
            <div className="card-glow p-8 rounded-lg border border-border mt-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-primary">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h2 className="text-2xl font-semibold text-glow">
                  Verify & Link QR
                </h2>
              </div>
              <Button
                onClick={verifyUpi}
                className="btn-glow bg-green-600 text-black hover:bg-green-700"
              >
                  Go to Verification
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;



