import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls
 * @param {Function} apiFunction - API function to call
 * @returns {Object} - API state and functions
 */
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Execute API call
   * @param {...any} args - Arguments to pass to API function
   * @returns {Promise<any>} - API response
   */
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFunction(...args);
        setData(response.data);
        
        return response.data;
      } catch (error) {
        setError(error.message || 'An error occurred');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );
  
  /**
   * Reset API state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);
  
  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

export default useApi;

