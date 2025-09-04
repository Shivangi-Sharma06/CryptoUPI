interface Currency {
  symbol: string;
  name: string;
  rate: string;
  change: string;
}

const CurrencyTable: React.FC = () => {
  const currencies: Currency[] = [
    { symbol: "BTC", name: "Bitcoin", rate: "₹35,62,847", change: "+2.34%" },
    { symbol: "ETH", name: "Ethereum", rate: "₹1,85,432", change: "+1.87%" },
    { symbol: "BNB", name: "Binance Coin", rate: "₹24,567", change: "-0.45%" },
    { symbol: "ADA", name: "Cardano", rate: "₹42.89", change: "+3.21%" },
    { symbol: "DOT", name: "Polkadot", rate: "₹687.34", change: "+0.98%" },
    { symbol: "MATIC", name: "Polygon", rate: "₹78.56", change: "+4.12%" }
  ];

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-glow">
            Live Currency Rates
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time cryptocurrency rates in INR
          </p>
        </div>

        <div className="card-glow rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="bg-secondary/50">
                  <th className="text-left p-4 font-semibold text-glow">Currency</th>
                  <th className="text-left p-4 font-semibold text-glow">Name</th>
                  <th className="text-right p-4 font-semibold text-glow">Rate (INR)</th>
                  <th className="text-right p-4 font-semibold text-glow">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency) => (
                  <tr 
                    key={currency.symbol}
                    className="border-b border-border hover:bg-secondary/20 transition-all duration-200"
                  >
                    <td className="p-4">
                      <div className="font-mono font-bold text-primary">
                        {currency.symbol}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {currency.name}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold">
                      {currency.rate}
                    </td>
                    <td className="p-4 text-right">
                      <span 
                        className={`font-semibold ${
                          currency.change.startsWith('+') 
                            ? 'text-green-400' 
                            : currency.change.startsWith('-')
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {currency.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            * Rates are for display purposes. Live API integration coming soon.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CurrencyTable;