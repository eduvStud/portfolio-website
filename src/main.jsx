import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import BlogPage from "./pages/blog";
import ContactPage from "./pages/contact";
import HomePage from "./pages/homepage";
import AboutPage from "./pages/about";
import PartnersPage from "./pages/partners";
import ProjectsPage from "./pages/projects";
import RouteTransitionOverlay from "./transition";
import { routeTransitionConfig } from "./transition.content";
import { ContentProvider } from "./content-store";
import PostPage from "./pages/post";
import ProjectPage from "./pages/project";
import AdminPage from "./pages/admin";
import LoginPage from "./pages/login";

const AnimatedRoutes = () => {
  const location = useLocation();
  const overlayRef = useRef(null);
  const pendingLocationRef = useRef(location);
  const displayedPathRef = useRef(location.pathname);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const [displayedLocation, setDisplayedLocation] = useState(location);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ SCROLL TO TOP AFTER PAGE TRANSITION
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [displayedLocation]);

  const runTransition = useCallback(async () => {
    if (runningRef.current) return;
    if (pendingLocationRef.current.pathname === displayedPathRef.current) return;

    if (!overlayRef.current?.play) {
      if (!mountedRef.current) return;
      displayedPathRef.current = pendingLocationRef.current.pathname;
      setDisplayedLocation(pendingLocationRef.current);
      return;
    }

    runningRef.current = true;
    await overlayRef.current.play(async () => {
      if (!mountedRef.current) return;
      displayedPathRef.current = pendingLocationRef.current.pathname;
      setDisplayedLocation(pendingLocationRef.current);
    });
    runningRef.current = false;

    if (mountedRef.current && pendingLocationRef.current.pathname !== displayedPathRef.current) {
      runTransition();
    }
  }, []);

  useEffect(() => {
    pendingLocationRef.current = location;
    runTransition();
  }, [location, runTransition]);

  return (
    <>
      <Routes location={displayedLocation} key={displayedLocation.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RouteTransitionOverlay ref={overlayRef} {...routeTransitionConfig} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContentProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ContentProvider>
  </React.StrictMode>
);