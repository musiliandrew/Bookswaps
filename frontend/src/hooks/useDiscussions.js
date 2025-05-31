import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useDiscussions() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/discussions/');
      setPosts(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch discussions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPost = async (discussionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/discussions/${discussionId}/`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch discussion';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reactToPost = async (postId, reaction) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/discussions/reactions/`, { post_id: postId, reaction });
      toast.success('Reaction added!');
      getPosts();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add reaction';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reactToComment = async (commentId, reaction) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/comments/${commentId}/reactions/`, { reaction });
      toast.success('Reaction added to comment!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add comment reaction';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/discussions/', data);
      toast.success('Discussion created!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create discussion';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (discussionId, content) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/discussions/${discussionId}/comments/`, { content });
      toast.success('Comment added!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add comment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getPosts,
    getPost,
    reactToPost,
    reactToComment,
    createPost,
    addComment,
    posts,
    isLoading,
    error,
  };
}