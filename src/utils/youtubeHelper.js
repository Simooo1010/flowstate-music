// YouTube Feed Fetcher & Shorts Filter

export function isShortsVideo(title, description = '') {
  if (!title) return false;
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  return (
    t.includes('#shorts') ||
    t.includes('#short') ||
    t.includes('/shorts/') ||
    d.includes('#shorts') ||
    d.includes('#short')
  );
}

// Proxied RSS fetcher to bypass CORS in browser
export async function fetchChannelVideos(channelId, creatorName, handle, genre = 'Music') {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(rssUrl)}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes('<entry>')) continue;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = xmlDoc.querySelectorAll('entry');
      const videos = [];

      entries.forEach((entry) => {
        const videoId = entry.querySelector('videoId')?.textContent || '';
        const title = entry.querySelector('title')?.textContent || '';
        const published = entry.querySelector('published')?.textContent || '';
        const desc = entry.querySelector('description')?.textContent || '';
        const thumb = entry.querySelector('thumbnail')?.getAttribute('url') || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        if (!videoId || !title || isShortsVideo(title, desc)) return;

        const isLongMix = /mix|set|hour|hours|1h|2h|3h|study|ambient|flow|album|session/i.test(title);

        videos.push({
          id: videoId,
          title,
          channelId,
          channelTitle: creatorName,
          channelHandle: handle,
          genre,
          published,
          thumbnail: thumb,
          isLongMix,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
        });
      });

      return videos;
    } catch (e) {
      console.warn('Proxy fetch failed:', proxyUrl, e);
    }
  }

  return [];
}
