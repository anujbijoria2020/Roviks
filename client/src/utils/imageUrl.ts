export const getImageUrl = (url: string): string => {
  if (!url) return '';

  const baseUrl = import.meta.env.VITE_API_URL?.trim()?.replace(/\/+$/, '')?.replace(/\/api$/, '') || '';
  const normalizedUrl = url.trim();

  if (normalizedUrl.startsWith('http')) {
    try {
      const parsed = new URL(normalizedUrl);
      if (parsed.pathname.includes('/uploads/')) {
        return `${baseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return normalizedUrl;
    }

    return normalizedUrl;
  }

  if (normalizedUrl.startsWith('/')) {
    return `${baseUrl}${normalizedUrl}`;
  }

  return `${baseUrl}/${normalizedUrl}`;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  e.currentTarget.src = 'https://placehold.co/400x400/1a1a1a/F5A623?text=ROVIKS';
};
