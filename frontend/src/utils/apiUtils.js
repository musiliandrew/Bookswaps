import { toast } from 'react-toastify';

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
    const errorMessage = error.response?.data?.detail || `Failed to ${actionName.toLowerCase()}`;
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
    const errorMessage = error.response?.data?.detail || `Failed to ${actionName.toLowerCase()}`;
    setError(errorMessage);
    toast.error(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};