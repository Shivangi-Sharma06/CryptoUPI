import Navigation from "../Navbar/Navigation";

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
  type: "Received" | "Sent";
  from?: string;
  to?: string;
  status: "Completed" | "Pending" | "Failed";
}

const PastPayments: React.FC = () => {
  // Placeholder transaction data
  const transactions: Transaction[] = [
    {
      id: "tx_001",
      date: "2024-01-15",
      time: "14:32",
      amount: "₹2,500",
      type: "Received",
      from: "0x1234...5678",
      status: "Completed"
    },
    {
      id: "tx_002", 
      date: "2024-01-14",
      time: "09:15",
      amount: "₹1,200",
      type: "Sent",
      to: "0x9abc...def0",
      status: "Completed"
    },
    {
      id: "tx_003",
      date: "2024-01-13",
      time: "16:47",
      amount: "₹750",
      type: "Received", 
      from: "0x4567...89ab",
      status: "Pending"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-glow">Past Payments</h1>
          <p className="text-muted-foreground text-lg">
            View your complete Web3 UPI transaction history
          </p>
        </div>

        {/* Transaction Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-glow p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2 text-glow">Total Transactions</h3>
            <p className="text-3xl font-bold text-primary">127</p>
          </div>
          <div className="card-glow p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2 text-glow">This Month</h3>
            <p className="text-3xl font-bold text-primary">₹45,650</p>
          </div>
          <div className="card-glow p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2 text-glow">Success Rate</h3>
            <p className="text-3xl font-bold text-primary">98.5%</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card-glow rounded-lg border border-border overflow-hidden">
          <div className="bg-secondary/50 p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-glow">Recent Transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/20">
                <tr>
                  <th className="text-left p-4 font-semibold text-glow">Date & Time</th>
                  <th className="text-left p-4 font-semibold text-glow">Transaction ID</th>
                  <th className="text-left p-4 font-semibold text-glow">Type</th>
                  <th className="text-left p-4 font-semibold text-glow">Address</th>
                  <th className="text-right p-4 font-semibold text-glow">Amount</th>
                  <th className="text-center p-4 font-semibold text-glow">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr 
                    key={tx.id}
                    className="border-b border-border hover:bg-secondary/20 transition-all duration-200"
                  >
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{tx.date}</div>
                        <div className="text-muted-foreground">{tx.time}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm font-mono text-primary bg-secondary/50 px-2 py-1 rounded">
                        {tx.id}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        tx.type === 'Received' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-sm font-mono text-muted-foreground">
                        {tx.from || tx.to}
                      </code>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {tx.amount}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        tx.status === 'Completed'
                          ? 'bg-green-500/20 text-green-400'
                          : tx.status === 'Pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            * This is sample data. Connect your wallet to see real transactions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PastPayments;