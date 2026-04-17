export const buildImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  // In dev, /uploads is proxied. In prod, VITE_API_URL is prepended.
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
};