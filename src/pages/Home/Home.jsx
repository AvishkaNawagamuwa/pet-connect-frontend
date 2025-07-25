import React from 'react';

import HeroBanner from './HeroBanner';
import AdoptSection from './AdoptSection';
import LatestPosts from './LatestPosts';
import CommunitySection from './CommunitySection';
import NewsletterSignup from './NewsletterSignup';
import Navigation from '../../components/Navigation'; // Adjust path if Navbar.tsx is not directly in components
import Footer from '../../components/Footer'; // Adjust path if Footer.jsx is not directly in components

export default function Home({ username }) {
  return (
    <>
      <Navigation />
      <HeroBanner username={username} />
      <AdoptSection />
      <LatestPosts />
      <CommunitySection />
      <NewsletterSignup />
      <Footer />
    </>
  );
}
