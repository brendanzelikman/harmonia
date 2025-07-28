import { CalculatorPage } from "features/Calculator/CalculatorPage";
import { LandingPage } from "features/Landing/LandingPage";
import { LandingCreators } from "features/Landing/sections/LandingCreators";
import { LandingVideo } from "features/Landing/sections/LandingVideo";
import { Navbar } from "features/Navbar/Navbar";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

export const SPLASH = "/";
export const CALCULATOR = "/calculator";
export const TUTORIAL = "/tutorial";
export const ABOUT = "/about";

export const AppRouter = () => (
  <HashRouter>
    <Navbar />
    <Routes>
      <Route path={SPLASH} element={<LandingPage />} />
      <Route path={ABOUT} element={<LandingCreators />} />
      <Route path="/gallery" element={<LandingVideo />} />
      <Route path={CALCULATOR} element={<CalculatorPage />} />
      <Route path="/demo/:id" element={<CalculatorPage />} />
      <Route path={TUTORIAL} element={<CalculatorPage />} />
      <Route path="*" element={<Navigate to={SPLASH} />} />
    </Routes>
  </HashRouter>
);
