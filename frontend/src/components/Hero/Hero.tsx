import { Button } from "../ui/button";
const Hero: React.FC = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="container mx-auto text-center max-w-7xl">
        <h5 className="text-2xl md:text-7xl font-bold mb-6 text-glow">
          KryptUPI - WEB3 UPI Payments Using Your GPay QR 
        </h5>
        
        <p className="text-x7 md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect your GPay scanner to Metamask wallet and enable seamless UPI payments 
          directly through Web3. The future of digital payments is here. The same QR is to be used for the seamless trasaction in cryptocurrency.
        </p>
      

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