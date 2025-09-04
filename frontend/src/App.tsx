import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PastPayments from "./pages/PastPayment";
import GetYourQR from "./pages/GetYourQR";
import SubmitGPay from "./pages/SubmitGPay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/past-payments" element={<PastPayments />} />
          <Route path="/get-qr" element={<GetYourQR />} />
          <Route path="/submit-gpay" element={<SubmitGPay />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
