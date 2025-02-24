import { useState, useEffect } from 'react';

export function getDirectImageUrl(url: string): string {
  // Google Drive
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
}

export function useImageUrl(url: string): string {
  const [directUrl, setDirectUrl] = useState(url);

  useEffect(() => {
    setDirectUrl(getDirectImageUrl(url));
  }, [url]);

  return directUrl;
}