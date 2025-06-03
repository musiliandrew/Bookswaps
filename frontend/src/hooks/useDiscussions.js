import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useDiscussions() {
  const [posts, setPosts] = useState([]);
  const [postDetails, setPostDetails] = useState(null);
  const [notes, setNotes] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const createPost = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/discussions/posts/', data);
      toast.success('Post created!');
      getPosts();
      // WebSocket placeholder: Notify discussion group
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPosts = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.followed) params.append('followed', filters.followed);
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.type) params.append('type', filters.type);
      if (filters.tag) params.append('tag', filters.tag);
      const url = pageUrl || `/discussions/posts/list/?${params.toString()}`;
      const response = await api.get(url);
      setPosts(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch posts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPostDetails = async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/discussions/posts/${discussionId}/`);
      setPostDetails(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch post details';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/discussions/posts/${discussionId}/delete/`);
      toast.success('Post deleted!');
      getPosts();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete post';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (discussionId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/posts/${discussionId}/notes/`, data);
      toast.success('Note added!');
      getNotes(discussionId);
      // WebSocket placeholder: Notify discussion group
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add note';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getNotes = async (discussionId, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || `/discussions/posts/${discussionId}/notes/list/`;
      const response = await api.get(url);
      setNotes(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch notes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const likeNote = async (noteId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/discussions/notes/${noteId}/like/`);
      toast.success('Note liked/unliked!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to like note';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const upvotePost = async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/discussions/posts/${discussionId}/upvote/`);
      toast.success('Post upvoted/unupvoted!');
      getPosts();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to upvote post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reprintPost = async (discussionId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/posts/${discussionId}/reprint/`, data);
      toast.success('Post reprinted!');
      getPosts();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to reprint post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTopPosts = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.book_id) params.append('book_id', filters.book_id);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);
      const url = pageUrl || `/discussions/top-posts/?${params.toString()}`;
      const response = await api.get(url);
      setTopPosts(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch top posts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPost,
    getPosts,
    getPostDetails,
    deletePost,
    addNote,
    getNotes,
    likeNote,
    upvotePost,
    reprintPost,
    getTopPosts,
    posts,
    postDetails,
    notes,
    topPosts,
    isLoading,
    error,
    pagination,
  };
}