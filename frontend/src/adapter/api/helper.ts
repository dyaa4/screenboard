export const getApiUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_SERVER_API || '';
  return `${baseUrl}${path}`;
};
