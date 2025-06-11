import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useNotifications } from './useNotifications';
import { useWebSocket } from './useWebSocket';

export function useDiscussions() {
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [notes, setNotes] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    posts: { next: null, previous: null, page: 1, totalPages: 1 },
    notes: { next: null, previous: null, page: 1, totalPages: 1 },
    topPosts: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected: isNotificationsConnected } = useNotifications();
  const { discussionData, isConnected: isDiscussionWsConnected, addNote, likeNote, upvotePost, reprintPost } = useWebSocket(null, 'discussion');

  const createDiscussion = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/discussions/posts/', data);
      setPosts((prev) => [...prev, response.data]);
      toast.success('Discussion created!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to create discussion';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listPosts = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.type) params.append('type', filters.type);
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.followed) params.append('followed', filters.followed);
      const response = await api.get(`/discussions/posts/list/?${params.toString()}`);
      setPosts(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        posts: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch posts';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPost = useCallback(async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/discussions/posts/${discussionId}/`);
      setPost(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/discussions/posts/${discussionId}/delete/`);
      setPosts((prev) => prev.filter((p) => p.id !== discussionId));
      if (post?.id === discussionId) setPost(null);
      toast.success('Post deleted!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete post';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  const addDiscussionNote = useCallback(async (discussionId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/posts/${discussionId}/notes/`, data);
      setNotes((prev) => [...prev, response.data]);
      toast.success('Note added!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to add note';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listNotes = useCallback(async (discussionId, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/discussions/posts/${discussionId}/notes/list/?page=${page}`);
      setNotes(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        notes: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch notes';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likeDiscussionNote = useCallback(async (noteId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/notes/${noteId}/like/`);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, likes: response.data.likes } : n))
      );
      toast.success('Note liked!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to like note';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upvoteDiscussionPost = useCallback(async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/posts/${discussionId}/upvote/`);
      setPosts((prev) =>
        prev.map((p) => (p.id === discussionId ? { ...p, upvotes: response.data.upvotes } : p))
      );
      if (post?.id === discussionId) setPost((prev) => ({ ...prev, upvotes: response.data.upvotes }));
      toast.success('Post upvoted!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to upvote post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  const reprintDiscussionPost = useCallback(async (discussionId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/posts/${discussionId}/reprint/`, data);
      toast.success('Post reprinted!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to reprint post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listTopPosts = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.time_range) params.append('time_range', filters.time_range);
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);
      const response = await api.get(`/discussions/top-posts/?${params.toString()}`);
      setTopPosts(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        topPosts: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch top posts';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle WebSocket discussion data
  useEffect(() => {
    if (!isDiscussionWsConnected || !discussionData) return;

    if (discussionData.notes?.length) {
      setNotes((prev) => [
        ...prev,
        ...discussionData.notes.filter((n) => !prev.find((pn) => pn.id === n.id)),
      ]);
    }
    if (discussionData.likes?.length) {
      setNotes((prev) =>
        prev.map((n) =>
          discussionData.likes.find((l) => l.note_id === n.id)
            ? { ...n, likes: (n.likes || 0) + 1 }
            : n
        )
      );
    }
    if (discussionData.upvotes?.length) {
      setPosts((prev) =>
        prev.map((p) =>
          discussionData.upvotes.find((u) => u.discussion_id === p.id)
            ? { ...p, upvotes: (p.upvotes || 0) + 1 }
            : p
        )
      );
      if (post && discussionData.upvotes.find((u) => u.discussion_id === post.id)) {
        setPost((prev) => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
      }
    }
    if (discussionData.reprints?.length) {
      setPosts((prev) =>
        prev.map((p) =>
          discussionData.reprints.find((r) => r.discussion_id === p.id)
            ? { ...p, reprint_count: (p.reprint_count || 0) + 1 }
            : p
        )
      );
    }
  }, [discussionData, isDiscussionWsConnected, post]);

  // Handle notifications for discussions
  useEffect(() => {
    if (!isNotificationsConnected || !notifications?.length) return;

    notifications.forEach(({ type, data }) => {
      if (type === 'discussion_created') {
        setPosts((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
        toast.info(`New discussion: ${data.title}`);
      } else if (type === 'note_added' && data.note_id) {
        setNotes((prev) => [...prev, data]);
        toast.info(`New comment on ${data.discussion_title}`);
      } else if (type === 'note_liked' && data.note_id) {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.note_id ? { ...n, likes: (n.likes || 0) + 1 } : n))
        );
        toast.info(`Your comment was liked`);
      } else if (type === 'discussion_upvoted' && data.discussion_id) {
        setPosts((prev) =>
          prev.map((p) => (p.id === data.discussion_id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
        );
        if (post?.id === data.discussion_id) {
          setPost((prev) => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
        }
        toast.info(`Your discussion was upvoted`);
      } else if (type === 'discussion_reprinted' && data.reprint_id) {
        setPosts((prev) =>
          prev.map((p) => (p.id === data.discussion_id ? { ...p, reprint_count: (p.reprint_count || 0) + 1 } : p))
        );
        toast.info(`Your discussion was reposted`);
      }
    });
  }, [notifications, isNotificationsConnected, post]);

  return {
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
    isLoading,
    error,
    pagination,
    isDiscussionWsConnected,
    addNote,
    likeNote,
    upvotePost,
    reprintPost,
  };
}
