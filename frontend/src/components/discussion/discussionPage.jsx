// discussionPage.jsx

import React from 'react';
import CreatePostForm from './comps/CreatePostForm';
import BookSearchDropdown from './comps/BookSearchDropdown';
import FeedFilter from './comps/FeedFilter';
import GenreFilter from './comps/GenreFilter';
import SortDropdown from './comps/SortDropdown';
import DiscussionFeed from './comps/DiscussionFeed';
import HeaderWithSwapsActive from '../swap/comps/header';

const DiscussionPage = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 py-6 px-4 md:px-12 lg:px-24">
      <header className="mb-6 border-b pb-4">
        <HeaderWithSwapsActive/>
      </header>

      <section className="mb-8">
        <CreatePostForm />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <BookSearchDropdown />
        <GenreFilter />
        <SortDropdown />
        <FeedFilter />
      </section>

      <section>
        <DiscussionFeed />
      </section>
    </div>
  );
};

export default DiscussionPage;
