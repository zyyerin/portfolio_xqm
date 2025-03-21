import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';

// 获取基础路径配置 - 与vite.config.ts中的base配置保持一致
const base = import.meta.env.BASE_URL;

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition>
            <About />
          </PageTransition>
        } />
        <Route path="/projects" element={
          <PageTransition>
            <Projects />
          </PageTransition>
        } />
        <Route path="/projects/:id" element={
          <PageTransition>
            <ProjectDetail />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router basename={base}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;