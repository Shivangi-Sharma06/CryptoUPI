import Navigation from "../Navbar/Navigation";
import Hero from "./Hero";
import CurrencyTable from "../CurrencyTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <CurrencyTable />
      </main>
    </div>
  );
};

export default Index;