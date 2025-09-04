import { useState } from "react";
import Navigation from "../components/Navigation";
import { Button } from "../components/button";

const GetYourQR: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  const connectWallet = async (): Promise<void> => {
    // Placeholder for Metamask connection
    if (typeof window.ethereum !== 'undefined') {
      try {
        // This would normally request account access
        setWalletAddress("0x1234567890abcdef1234567890abcdef12345678");
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install Metamask to continue");
    }
  };

  const generateQR = (): void => {
    // Placeholder for QR generation
    alert("QR Code generation functionality will be implemented with Web3 integration");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-glow">Get Your QR Code</h1>
          <p className="text-muted-foreground text-lg">
            Connect your Metamask wallet and generate your unique payment QR code
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Wallet Connection Step */}
          <div className="card-glow p-8 rounded-lg border border-border">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                isConnected ? 'bg-green-500' : 'bg-secondary'
              }`}>
                <span className="text-sm font-bold">1</span>
              </div>
              <h2 className="text-2xl font-semibold text-glow">Connect Your Wallet</h2>
            </div>
            
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  First, connect your Metamask wallet to link it with your UPI scanner.
                </p>
                <Button 
                  onClick={connectWallet}
                  className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Connect Metamask Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-400 font-medium">✓ Wallet Connected Successfully</p>
                <div className="bg-secondary/50 p-4 rounded border">
                  <p className="text-sm text-muted-foreground mb-1">Connected Address:</p>
                  <code className="font-mono text-sm text-primary">{walletAddress}</code>
                </div>
              </div>
            )}
          </div>

          {/* QR Generation Step */}
          <div className="card-glow p-8 rounded-lg border border-border">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                isConnected ? 'bg-primary' : 'bg-secondary'
              }`}>
                <span className="text-sm font-bold">2</span>
              </div>
              <h2 className="text-2xl font-semibold text-glow">Generate QR Code</h2>
            </div>
            
            {!isConnected ? (
              <p className="text-muted-foreground">
                Please connect your wallet first to proceed with QR code generation.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Generate your unique QR code that links your UPI scanner to your Web3 wallet.
                </p>
                <Button 
                  onClick={generateQR}
                  className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Generate My QR Code
                </Button>
              </div>
            )}
          </div>

          {/* QR Display Placeholder */}
          {isConnected && (
            <div className="card-glow p-8 rounded-lg border border-border text-center">
              <h3 className="text-xl font-semibold mb-4 text-glow">Your QR Code</h3>
              <div className="w-64 h-64 mx-auto bg-secondary/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">QR Code will appear here</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Share this QR code to receive Web3 UPI payments
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="card-glow p-6 rounded-lg border border-border max-w-md mx-auto">
            <h3 className="font-semibold mb-2 text-glow">How it works</h3>
            <p className="text-sm text-muted-foreground">
              Your QR code creates a bridge between traditional UPI and Web3 payments, 
              allowing anyone to pay you through GPay while receiving funds in your crypto wallet.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetYourQR;