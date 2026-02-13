import React from 'react';
import { Header, Footer } from '../components/layout';
import { Hero, UrlShortener, Features, HowItWorks, Stats } from '../components/home';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Gradient Mesh Background */}
        <Hero />

        {/* URL Shortener Interactive Section */}
        <UrlShortener />

        {/* Features Grid */}
        <div id="features">
          <Features />
        </div>

        {/* How It Works - 3 Step Flow */}
        <HowItWorks />

        {/* Stats with Animated Counters */}
        <Stats />
      </main>

      <Footer />
    </div>
  );
};
