import { CalculatorPage } from "features/Calculator/CalculatorPage";
import { LandingPage } from "features/Landing/LandingPage";
import { Navbar } from "features/Navbar/Navbar";
import { HashRouter, Route, Routes } from "react-router-dom";

export const SPLASH = "/";
export const CALCULATOR = "/calculator";

export const AppRouter = () => (
  <HashRouter>
    <Navbar />
    <Routes>
      <Route path={SPLASH} element={<LandingPage />} />
      <Route path={CALCULATOR} element={<CalculatorPage />} />
      <Route path="/demo/:id" element={<CalculatorPage />} />
      <Route path="/tutorial" element={<CalculatorPage />} />
    </Routes>
  </HashRouter>
);
