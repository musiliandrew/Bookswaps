// useDiscussions.js
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
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
  const { discussionData, isConnected: isDiscussionWsConnected, addNote, likeNote, upvotePost, reprintPost } =
    useWebSocket(null, 'discussion');

  const updatePagination = (data, key, page) => {
    setPagination((prev) => ({
      ...prev,
      [key]: {
        next: data.next,
        previous: data.previous,
        page,
        totalPages: Math.ceil(data.count / (data.results?.length || 1)),
      },
    }));
  };

  const createDiscussion = useCallback(
    async (data) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.CREATE_DISCUSSION, data),
        setIsLoading,
        setError,
        'Discussion created!',
        'Create discussion'
      );
      if (result) setPosts((prev) => [...prev, result]);
      return result;
    },
    []
  );

  const listPosts = useCallback(
    async (filters = {}, page = 1) => {
      const params = new URLSearchParams({ page });
      if (filters.type) params.append('type', filters.type);
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.followed) params.append('followed', filters.followed);

      const result = await handleApiCall(
        () => api.get(`${API_ENDPOINTS.LIST_POSTS}?${params.toString()}`),
        setIsLoading,
        setError,
        null,
        'Fetch posts'
      );

      if (result) {
        setPosts(result.results || []);
        updatePagination(result, 'posts', page);
      }
      return result;
    },
    []
  );

  const getPost = useCallback(
    async (discussionId) => {
      const result = await handleApiCall(
        () => api.get(API_ENDPOINTS.GET_POST(discussionId)),
        setIsLoading,
        setError,
        null,
        'Fetch post'
      );
      if (result) setPost(result);
      return result;
    },
    []
  );

  const deletePost = useCallback(
    async (discussionId) => {
      const result = await handleApiCallWithResult(
        () => api.delete(API_ENDPOINTS.DELETE_POST(discussionId)),
        setIsLoading,
        setError,
        'Post deleted!',
        'Delete post'
      );
      if (result) {
        setPosts((prev) => prev.filter((p) => p.id !== discussionId));
        if (post?.id === discussionId) setPost(null);
      }
      return result;
    },
    [post]
  );

  const addDiscussionNote = useCallback(
    async (discussionId, data) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.ADD_NOTE(discussionId), data),
        setIsLoading,
        setError,
        'Note added!',
        'Add note'
      );
      if (result) setNotes((prev) => [...prev, result]);
      return result;
    },
    []
  );

  const listNotes = useCallback(
    async (discussionId, page = 1) => {
      const result = await handleApiCall(
        () => api.get(`${API_ENDPOINTS.LIST_NOTES(discussionId)}?page=${page}`),
        setIsLoading,
        setError,
        null,
        'Fetch notes'
      );
      if (result) {
        setNotes(result.results || []);
        updatePagination(result, 'notes', page);
      }
      return result;
    },
    []
  );

  const likeDiscussionNote = useCallback(
    async (noteId) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.LIKE_NOTE(noteId)),
        setIsLoading,
        setError,
        'Note liked!',
        'Like note'
      );
      if (result) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, likes: result.likes } : n))
        );
      }
      return result;
    },
    []
  );

  const upvoteDiscussionPost = useCallback(
    async (discussionId) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.UPVOTE_POST(discussionId)),
        setIsLoading,
        setError,
        'Post upvoted!',
        'Upvote post'
      );
      if (result) {
        setPosts((prev) =>
          prev.map((p) => (p.id === discussionId ? { ...p, upvotes: result.upvotes } : p))
        );
        if (post?.id === discussionId) setPost((prev) => ({ ...prev, upvotes: result.upvotes }));
      }
      return result;
    },
    [post]
  );

  const downvoteDiscussionPost = useCallback(
    async (discussionId) => {
      const result = await handleApiCall(
        () => api.patch(API_ENDPOINTS.DOWNVOTE_POST(discussionId)),
        setIsLoading,
        setError,
        null,
        'Downvote post'
      );
      if (result) {
        setPosts((prev) =>
          prev.map((p) => (p.id === discussionId ? { ...p, downvotes: result.downvotes } : p))
        );
        if (post?.id === discussionId) setPost((prev) => ({ ...prev, downvotes: result.downvotes }));
      }
      return result;
    },
    [post]
  );

  const reprintDiscussionPost = useCallback(
    async (discussionId, data) => {
      return await handleApiCall(
        () => api.post(API_ENDPOINTS.REPRINT_POST(discussionId), data),
        setIsLoading,
        setError,
        'Post reprinted!',
        'Reprint post'
      );
    },
    []
  );

  const listTopPosts = useCallback(
    async (filters = {}, page = 1) => {
      const params = new URLSearchParams({ page });
      if (filters.time_range) params.append('time_range', filters.time_range);
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);

      const result = await handleApiCall(
        () => api.get(`${API_ENDPOINTS.LIST_TOP_POSTS}?${params.toString()}`),
        setIsLoading,
        setError,
        null,
        'Fetch top posts'
      );

      if (result) {
        setTopPosts(result.results || []);
        updatePagination(result, 'topPosts', page);
      }
      return result;
    },
    []
  );

  useEffect(() => {
    if (!isDiscussionWsConnected || !discussionData) return;

    if (discussionData.notes?.length) {
      setNotes((prev) => [
        ...prev,
        ...discussionData.notes.filter((n) => n.id && !prev.find((pn) => pn.id === n.id)),
      ]);
    }
    if (discussionData.likes?.length) {
      setNotes((prev) =>
        prev.map((n) =>
          discussionData.likes.find((l) => l?.note_id === n.id)
            ? { ...n, likes: (n.likes || 0) + 1 }
            : n
        )
      );
    }
    if (discussionData.upvotes?.length) {
      setPosts((prev) =>
        prev.map((p) =>
          discussionData.upvotes.find((u) => u?.discussion_id === p.id)
            ? { ...p, upvotes: (p.upvotes || 0) + 1 }
            : p
        )
      );
      if (post && discussionData.upvotes.find((u) => u?.discussion_id === post.id)) {
        setPost((prev) => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
      }
    }
    if (discussionData.reprints?.length) {
      setPosts((prev) =>
        prev.map((p) =>
          discussionData.reprints.find((r) => r?.discussion_id === p.id)
            ? { ...p, reprint_count: (p.reprint_count || 0) + 1 }
            : p
        )
      );
    }
  }, [discussionData, isDiscussionWsConnected, post]);

  useEffect(() => {
    if (!isNotificationsConnected || !notifications?.length) return;

    notifications.forEach(({ type, data }) => {
      if (type === 'discussion_created' && data?.id) {
        setPosts((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
        toast.info(`New discussion: ${data.title}`);
      } else if (type === 'note_added' && data?.note_id) {
        setNotes((prev) => [...prev, data]);
        toast.info(`New comment on ${data.discussion_title}`);
      } else if (type === 'note_liked' && data?.note_id) {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.note_id ? { ...n, likes: (n.likes || 0) + 1 } : n))
        );
        toast.info(`Your comment was liked`);
      } else if (type === 'discussion_upvoted' && data?.discussion_id) {
        setPosts((prev) =>
          prev.map((p) => (p.id === data.discussion_id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
        );
        if (post?.id === data.discussion_id) {
          setPost((prev) => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
        }
        toast.info(`Your discussion was upvoted`);
      } else if (type === 'discussion_reprinted' && data?.reprint_id) {
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
    downvoteDiscussionPost,
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