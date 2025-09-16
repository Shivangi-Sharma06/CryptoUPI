import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./components/Hero/Index";
import Register from "./components/Home/Register";
import Gateway from "./components/Gateway/gateway";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";

const clientId = "c70fdd45e9e9be630203d1d6a8536cb4";

const client = createThirdwebClient({ clientId });

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThirdwebProvider>
        <ConnectButton client={client} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gateway" element={<Gateway />} />
          </Routes>
        </BrowserRouter>
      </ThirdwebProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
