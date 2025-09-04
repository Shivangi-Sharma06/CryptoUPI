import { useState, ChangeEvent } from "react";
import Navigation from "../components/Navigation";
import { Button } from "../components/button";

const SubmitGPay: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  const resetUpload = (): void => {
    setSelectedFile(null);
    setUploadSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-glow">Submit GPay Scanner</h1>
          <p className="text-muted-foreground text-lg">
            Upload your GPay QR code scanner to integrate with Web3 payments
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!uploadSuccess ? (
            <div className="card-glow p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-6 text-glow text-center">
                Upload Your GPay QR Scanner
              </h2>

              {/* Instructions */}
              <div className="bg-secondary/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-3 text-glow">Instructions:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Open Google Pay on your mobile device</li>
                  <li>2. Go to your profile and find your QR code</li>
                  <li>3. Take a screenshot or save the QR code image</li>
                  <li>4. Upload the image using the button below</li>
                </ol>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                {!selectedFile ? (
                  <div>
                    <div className="text-4xl mb-4">📱</div>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop your GPay QR code image here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button 
                        variant="outline"
                        className="btn-glow border-primary text-primary hover:bg-primary/10 cursor-pointer"
                        asChild
                      >
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl text-green-400">✓</div>
                    <p className="font-medium text-green-400">File Selected</p>
                    <div className="bg-secondary/50 p-4 rounded border">
                      <p className="text-sm text-muted-foreground mb-1">File:</p>
                      <p className="font-mono text-sm text-primary">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isUploading ? "Uploading..." : "Upload GPay Scanner"}
                      </Button>
                      <Button 
                        onClick={resetUpload}
                        variant="outline"
                        className="btn-glow border-border hover:bg-secondary/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="bg-secondary/50 rounded-full h-2 mb-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Processing your GPay scanner...
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Success State
            <div className="card-glow p-8 rounded-lg border border-border text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-4 text-glow">
                Upload Successful!
              </h2>
              <p className="text-muted-foreground mb-8">
                Your GPay scanner has been successfully uploaded and is now ready for Web3 integration.
              </p>
              
              <div className="bg-secondary/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-3 text-glow">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>✓ GPay scanner uploaded and verified</li>
                  <li>⏳ Setting up Web3 bridge (processing...)</li>
                  <li>⏳ Configuring payment routing</li>
                  <li>⏳ Testing payment flow</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={resetUpload}
                  variant="outline"
                  className="btn-glow border-primary text-primary hover:bg-primary/10"
                >
                  Upload Another
                </Button>
                <Button 
                  className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.location.href = "/get-qr"}
                >
                  Get Your QR Code
                </Button>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="card-glow p-6 rounded-lg border border-border mt-8">
            <h3 className="font-semibold mb-3 text-glow flex items-center">
              <span className="mr-2">🔒</span>
              Security & Privacy
            </h3>
            <p className="text-sm text-muted-foreground">
              Your GPay QR code is processed securely and encrypted. We never store or access 
              your personal payment information. The integration only creates a bridge for 
              Web3 payment processing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitGPay;