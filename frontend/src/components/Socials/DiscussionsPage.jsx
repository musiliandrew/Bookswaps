import React, { useState, useEffect } from 'react';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useSocieties } from '../../hooks/useSocieties';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import NavigationTabs from '../Socials/Discussions/NavigationTabs';
import PostDetail from '../Socials/Discussions/PostDetail';
import SocietyDetail from '../Socials/Discussions/SocietyDetail';
import PostCreationForm from '../Socials/Discussions/PostCreationForm';
import PostFilters from '../Socials/Discussions/PostFilters';
import PostFeed from '../Socials/Discussions/PostFeed';
import TopPostsSidebar from '../Socials/Discussions/TopPostsSidebar';
import SocietyList from '../Socials/Discussions/SocietyList';

const DiscussionsPage = () => {
  const { postId, societyId } = useParams();
  const navigate = useNavigate();
  const {
    createDiscussion,
    listPosts,
    getPost,
    deletePost,
    addDiscussionNote,
    listNotes,
    likeDiscussionNote,
    upvoteDiscussionPost,
    reprintDiscussionPost,
    listTopPosts,
    posts,
    post,
    notes,
    topPosts,
    isLoading: isDiscussionsLoading,
    error: discussionsError,
    pagination: discussionsPagination,
  } = useDiscussions();
  const {
    listSocieties,
    createSociety,
    joinSociety,
    leaveSociety,
    createSocietyEvent,
    listSocietyEvents,
    getSocietyMessages,
    sendSocietyMessage,
    societies,
    societyEvents,
    societyMessages,
    isLoading: isSocietiesLoading,
    error: societiesError,
    pagination: societiesPagination,
    isSocietyWsConnected, // Add for SocietyDetail
  } = useSocieties();

  const [postFilters, setPostFilters] = useState({ type: '', book_id: '', tag: '' });
  const [societyFilters, setSocietyFilters] = useState({ focus_type: '', focus_id: '', my_societies: false });
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'Article', book_id: '', tags: '', media_urls: '', spoiler: false });
  const [newNote, setNewNote] = useState('');
  const [newSocietyEvent, setNewSocietyEvent] = useState({ title: '', description: '', book_id: '', date: '', location: '' });
  const [newSocietyMessage, setNewSocietyMessage] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [showSpoiler, setShowSpoiler] = useState(false);

  useEffect(() => {
    if (activeTab === 'posts' && !postId) {
      listPosts(postFilters, discussionsPagination.posts.page);
      listTopPosts({}, discussionsPagination.topPosts.page);
    } else if (activeTab === 'societies' && !societyId) {
      listSocieties(societyFilters, societiesPagination.societies.page);
    } else if (postId) {
      getPost(postId);
      listNotes(postId, discussionsPagination.notes.page);
    } else if (societyId) {
      listSocietyEvents(societyId, societiesPagination.events.page);
      getSocietyMessages(societyId, societiesPagination.messages.page);
    }
  }, [
    activeTab,
    postId,
    societyId,
    postFilters,
    societyFilters,
    discussionsPagination.posts.page,
    discussionsPagination.topPosts.page,
    discussionsPagination.notes.page,
    societiesPagination.societies.page,
    societiesPagination.events.page,
    societiesPagination.messages.page,
    listPosts,
    listTopPosts,
    getPost,
    listNotes,
    listSocieties,
    listSocietyEvents,
    getSocietyMessages,
  ]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const data = {
      ...newPost,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      media_urls: newPost.media_urls.split(',').map(url => url.trim()).filter(url => url),
    };
    const response = await createDiscussion(data);
    if (response) {
      setNewPost({ title: '', content: '', type: 'Article', book_id: '', tags: '', media_urls: '', spoiler: false });
      // Instead of navigating, just refresh the posts list and show success
      toast.success('Discussion created successfully!');
      listPosts(postFilters, 1); // Refresh the posts list
    }
  };

  const handleAddNote = async (e, parentNoteId = null) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const data = { content: newNote, parent_note: parentNoteId };
    const response = await addDiscussionNote(postId, data);
    if (response) setNewNote('');
  };

  const handleCreateSocietyEvent = async (e) => {
    e.preventDefault();
    const response = await createSocietyEvent(societyId, newSocietyEvent);
    if (response) {
      setNewSocietyEvent({ title: '', description: '', book_id: '', date: '', location: '' });
    }
  };

  const handleSendSocietyMessage = async (e) => {
    e.preventDefault();
    if (!newSocietyMessage.trim()) return;
    const response = await sendSocietyMessage(societyId, newSocietyMessage);
    if (response) setNewSocietyMessage('');
  };

  return (
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            💬 Discussions
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Join vibrant discussions, share your thoughts, and connect with fellow book lovers
          </motion.p>
        </motion.div>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>

        {/* Enhanced Error Display */}
        {(discussionsError || societiesError) && (
          <motion.div
            className="mb-8 p-6 bookish-glass rounded-2xl border border-red-300/20 bg-red-50/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3 text-red-600">
              <div className="text-2xl">⚠️</div>
              <div>
                {discussionsError && <div className="font-medium">Discussions Error: {discussionsError}</div>}
                {societiesError && <div className="font-medium">Societies Error: {societiesError}</div>}
              </div>
            </div>
          </motion.div>
        )}
      {postId && post && (
        <PostDetail
          postId={postId}
          post={post}
          showSpoiler={showSpoiler}
          setShowSpoiler={setShowSpoiler}
          upvoteDiscussionPost={upvoteDiscussionPost}
          reprintDiscussionPost={reprintDiscussionPost}
          deletePost={deletePost}
          navigate={navigate}
          isDiscussionsLoading={isDiscussionsLoading}
          notes={notes}
          handleAddNote={handleAddNote}
          newNote={newNote}
          setNewNote={setNewNote}
          likeDiscussionNote={likeDiscussionNote}
        />
      )}
      {societyId && (
        <SocietyDetail
          societyId={societyId}
          societies={societies}
          joinSociety={joinSociety}
          leaveSociety={leaveSociety}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          societyMessages={societyMessages}
          newSocietyMessage={newSocietyMessage}
          setNewSocietyMessage={setNewSocietyMessage}
          handleSendSocietyMessage={handleSendSocietyMessage}
          societyEvents={societyEvents}
          newSocietyEvent={newSocietyEvent}
          setNewSocietyEvent={setNewSocietyEvent}
          handleCreateSocietyEvent={handleCreateSocietyEvent}
          isSocietyWsConnected={isSocietyWsConnected}
        />
      )}
        {/* Enhanced Posts Section */}
        {activeTab === 'posts' && !postId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <PostCreationForm newPost={newPost} setNewPost={setNewPost} handleCreatePost={handleCreatePost} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <PostFilters postFilters={postFilters} setPostFilters={setPostFilters} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <PostFeed
                  posts={posts}
                  isDiscussionsLoading={isDiscussionsLoading}
                  listPosts={listPosts}
                  postFilters={postFilters}
                  discussionsPagination={discussionsPagination}
                />
              </motion.div>
            </div>

            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <TopPostsSidebar topPosts={topPosts} />
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Societies Section */}
        {activeTab === 'societies' && !societyId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <SocietyList
              societies={societies}
              isSocietiesLoading={isSocietiesLoading}
              createSociety={createSociety}
              joinSociety={joinSociety}
              leaveSociety={leaveSociety}
              listSocieties={listSocieties}
              societyFilters={societyFilters}
              setSocietyFilters={setSocietyFilters}
              societiesPagination={societiesPagination}
              societiesError={societiesError}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscussionsPage;