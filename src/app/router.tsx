import { CalculatorPage } from "features/Calculator/CalculatorPage";
import { LandingPage } from "features/Landing/LandingPage";
import { LandingCreators } from "features/Landing/sections/LandingCreators";
import { LandingQML } from "features/Landing/sections/LandingQML";
import { LandingVideo } from "features/Landing/sections/LandingVideo";
import { Navbar } from "features/Navbar/Navbar";
import { useLayoutEffect, useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

export const SPLASH = "/";
export const CALCULATOR = "/calculator";
export const TUTORIAL = "/tutorial";
export const GALLERY = "/gallery";
export const TOUR = "/tour";
export const ABOUT = "/about";

export const AppRouter = () => {
  return (
    <HashRouter>
      <Navbar />
      <ScrollMonitor />
      <Routes>
        <Route path={SPLASH} element={<LandingPage />} />
        <Route path={ABOUT} element={<LandingCreators />} />
        <Route path={GALLERY} element={<LandingVideo />} />
        <Route path={CALCULATOR} element={<CalculatorPage />} />
        <Route path="/demo/:id" element={<CalculatorPage />} />
        <Route path="/qml" element={<LandingQML />} />
        <Route path={TUTORIAL} element={<CalculatorPage />} />
        <Route path={TOUR} element={<CalculatorPage />} />
        <Route path="*" element={<Navigate to={SPLASH} />} />
      </Routes>
    </HashRouter>
  );
};

const ScrollMonitor = () => {
  const location = useLocation();

  const getBody = () => document.getElementById("body");

  useLayoutEffect(() => {
    const body = getBody();
    if (!body) return;
    const savedPosition = localStorage.getItem("scroll-" + location.pathname);
    const top = savedPosition ? parseInt(savedPosition, 10) : null;
    body.scrollTo({ top: top ?? 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    const body = getBody();
    if (!body) return;
    const handleScroll = () => {
      localStorage.setItem(
        "scroll-" + location.pathname,
        body.scrollTop.toString()
      );
    };
    body.addEventListener("scroll", handleScroll);
    return () => {
      body.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  return null;
};
