import { Link } from "react-router-dom";
import { Button } from "./button";

const Hero: React.FC = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="container mx-auto text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
          Web3 UPI Payments
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect your GPay scanner to Metamask wallet and enable seamless UPI payments 
          directly through Web3. The future of digital payments is here.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/get-qr">
            <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
              Get Your QR Code
            </Button>
          </Link>
          
          <Link to="/submit-gpay">
            <Button 
              className="btn-glow border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
            >
              Submit GPay Scanner
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card-glow p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2 text-glow">Connect Wallet</h3>
            <p className="text-muted-foreground">
              Link your Metamask wallet to your GPay scanner seamlessly
            </p>
          </div>

          <div className="card-glow p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-glow">Instant Payments</h3>
            <p className="text-muted-foreground">
              Process UPI payments instantly through Web3 technology
            </p>
          </div>

          <div className="card-glow p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 text-glow">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your transactions are secured by blockchain technology
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;