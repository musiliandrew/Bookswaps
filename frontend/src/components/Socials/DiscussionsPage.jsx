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
    <div className="container mx-auto p-4">
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {(discussionsError || societiesError) && (
        <div className="text-red-500 mb-4">
          {discussionsError && <div>Discussions Error: {discussionsError}</div>}
          {societiesError && <div>Societies Error: {societiesError}</div>}
        </div>
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
      {activeTab === 'posts' && !postId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2">
            <PostCreationForm newPost={newPost} setNewPost={setNewPost} handleCreatePost={handleCreatePost} />
            <PostFilters postFilters={postFilters} setPostFilters={setPostFilters} />
            <PostFeed
              posts={posts}
              isDiscussionsLoading={isDiscussionsLoading}
              listPosts={listPosts}
              postFilters={postFilters}
              discussionsPagination={discussionsPagination}
            />
          </div>
          <TopPostsSidebar topPosts={topPosts} />
        </motion.div>
      )}
      {activeTab === 'societies' && !societyId && (
        <SocietyList
          societies={societies}
          isSocietiesLoading={isSocietiesLoading}
          joinSociety={joinSociety}
          leaveSociety={leaveSociety}
          listSocieties={listSocieties}
          societyFilters={societyFilters}
          setSocietyFilters={setSocietyFilters}
          societiesPagination={societiesPagination}
          societiesError={societiesError}
        />
      )}
    </div>
  );
};

export default DiscussionsPage;