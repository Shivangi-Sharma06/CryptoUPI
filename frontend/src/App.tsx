import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./components/Hero/Index";
import PastPayments from "./components/PastPayments/PastPayment";
import SubmitQR from "./components/Home/SubmitQR";
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
            <Route path="/past-payments" element={<PastPayments />} />
            <Route path="/submitqr" element={<SubmitQR/>} />
          </Routes>
        </BrowserRouter>
      </ThirdwebProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
