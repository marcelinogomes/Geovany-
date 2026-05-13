/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Plans from './components/Plans';
import Results from './components/Results';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

function AppContent() {
  const [isDashboard, setIsDashboard] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setIsDashboard(window.location.hash === '#dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isDashboard) {
    return (
      <div className="bg-black min-h-screen text-white selection:bg-red-600 selection:text-white">
        <Navbar />
        <Dashboard />
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-red-600 selection:text-white font-sans antialiased overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Plans />
        <Results />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

