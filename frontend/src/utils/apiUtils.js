import { toast } from 'react-toastify';

// Helper function to extract meaningful error messages
const extractErrorMessage = (error, actionName) => {
  if (!error.response) {
    return `Network error - please check your connection`;
  }

  const { data, status } = error.response;

  // Handle specific error formats
  if (data?.error) {
    return data.error;
  }

  if (data?.details) {
    // Handle validation errors with details
    if (typeof data.details === 'object') {
      // Extract field-specific errors
      const fieldErrors = Object.entries(data.details)
        .map(([field, messages]) => {
          const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
          return `${field}: ${messageText}`;
        })
        .join('; ');
      return fieldErrors || data.error || `Validation failed`;
    }
    return data.details;
  }

  if (data?.detail) {
    return data.detail;
  }

  // Handle specific status codes
  switch (status) {
    case 409:
      return data?.message || 'This item already exists';
    case 400:
      return data?.message || 'Invalid request data';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested item was not found';
    case 500:
      return 'Server error - please try again later';
    default:
      return `Failed to ${actionName.toLowerCase()}`;
  }
};

export const handleApiCall = async (
  apiCall,
  setIsLoading,
  setError,
  successMessage,
  actionName
) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apiCall();
    if (successMessage) {
      toast.success(successMessage);
    }
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, actionName);
    setError(errorMessage);
    toast.error(errorMessage);
    return null;
  } finally {
    setIsLoading(false);
  }
};

export const handleApiCallWithResult = async (
  apiCall,
  setIsLoading,
  setError,
  successMessage,
  actionName
) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apiCall();
    if (successMessage) {
      toast.success(successMessage);
    }
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, actionName);
    setError(errorMessage);
    toast.error(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};