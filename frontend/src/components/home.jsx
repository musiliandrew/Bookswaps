import React from 'react';
import HeaderNav from './home_components/HeaderNav';
import HeroBanner from './home_components/HeroBanner';
import BookShowcase from './home_components/BookShowcase';
import EditorsChoice from './home_components/EditorsChoice';
import CommunitySpotlight from './home_components/CommunitySpotlight';
import DiscussionCard from './home_components/DiscussionCard';
import SocietyCard from './home_components/SocietyCard';
import WhyBookSwapSection from './home_components/WhyBookSwapSection';
import FinalCallToActionBanner from './home_components/FinalCallToActionBanner';
import Footer from './home_components/Footer';

const Home = () => {
  const dummyPost = {
    id: 1,
    title: "Why React is like a Relationship",
    content: "Sometimes it’s great. Sometimes it breaks unexpectedly.",
    author: { username: "devBatman" },
    upvotes: 42,
    commentCount: 7,
    createdAt: new Date(),
    postType: "question",
  };
  const mySociety = {
    id: 1,
    name: "Tech Innovators",
    description: "A society of people who break stuff and fix it better.",
    memberCount: 123,
    imageUrl: "https://placehold.co/600x200", // or any real image
    category: "Technology",
    isJoined: false,
    upcomingEvents: 3,
    activityLevel: "high",
  };
  



  return (
    <>
      <HeaderNav />
      <HeroBanner />
      <BookShowcase />
      <EditorsChoice />
      <CommunitySpotlight />
      <DiscussionCard postData={dummyPost} isAuthenticated={true}/>
      <SocietyCard societyData={mySociety} isAuthenticated={true} />
      <WhyBookSwapSection />
      <FinalCallToActionBanner />
      <Footer />
    </>
  );
};

export default Home;
