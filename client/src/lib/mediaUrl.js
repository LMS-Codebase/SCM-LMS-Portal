const normalizeMediaUrl = (url) => {
  if (!url) return url;

  let normalized = url.replace("/api/v1/media/public-s3", "/api/v1/media/s3");

  try {
    const parsedUrl = new URL(normalized);
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/{2,}/g, "/");
    return parsedUrl.toString();
  } catch {
    return normalized.replace("//api/", "/api/");
  }
};

export const getPublicImageUrl = (url) => normalizeMediaUrl(url);

export const getFallbackImageUrl = (url) => normalizeMediaUrl(url);
