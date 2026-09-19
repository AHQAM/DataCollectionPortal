/**
 * Lazy loader for XLSX library.
 * Keeps initial bundle size light (~430KB saved) until user needs Excel import/export.
 */
export const getXLSX = async () => {
  return await import('xlsx');
};
