/**
 * Lazy loader for the maintained SheetJS-compatible package.
 * Keeps the initial bundle light until Excel import/export is requested.
 */
export const getXLSX = async () => {
  return await import("@e965/xlsx");
};
