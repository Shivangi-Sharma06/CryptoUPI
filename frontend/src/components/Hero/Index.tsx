import Navigation from "../Navbar/Navigation";
import Hero from "./Hero";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Index;