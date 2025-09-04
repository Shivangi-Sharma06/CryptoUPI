import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import CurrencyTable from "../components/CurrencyTable";

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