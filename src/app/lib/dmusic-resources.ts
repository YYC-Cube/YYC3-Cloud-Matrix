/**
 * @file: dmusic-resources.ts
 * @description: dmusic-resources.ts description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-07
 * @updated: 2026-04-07
 * @status: active
 * @tags: [type]
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  videoUrl?: string;
  emotion: 'happy' | 'sad' | 'energetic' | 'calm' | 'love' | 'neutral';
  genre: string;
  year?: number;
  lyrics?: string[];
}

export interface Album {
  id: string;
  name: string;
  coverUrl?: string;
  tracks: MusicTrack[];
  description?: string;
}

export interface ArtistProfile {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  albums: Album[];
}

export const DMUSIC_LOGOS: string[] = [
  '/D-Music/D-logo/D-logo-20.png',
  '/D-Music/D-logo/D-logo-21.png',
  '/D-Music/D-logo/D-logo-22.png',
  '/D-Music/D-logo/D-logo-23.png',
  '/D-Music/D-logo/D-logo-24.png',
  '/D-Music/D-logo/D-logo-25.png',
  '/D-Music/D-logo/D-logo-26.png',
  '/D-Music/D-logo/D-logo-27.png',
  '/D-Music/D-logo/D-logo-28.png',
  '/D-Music/D-logo/D-logo-29.png',
  '/D-Music/D-logo/D-logo-31.png',
  '/D-Music/D-logo/D-logo-32.png',
  '/D-Music/D-logo/D-logo-33.png',
  '/D-Music/D-logo/D-logo-34.png',
  '/D-Music/D-logo/D-logo-35.png',
  '/D-Music/D-logo/D-logo-36.png',
  '/D-Music/D-logo/D-logo-37.png',
  '/D-Music/D-logo/D-logo-38.png',
  '/D-Music/D-logo/D-logo-39.png',
  '/D-Music/D-logo/D-logo-49.png',
  '/D-Music/D-logo/D-logo-50.png',
  '/D-Music/D-logo/D-logo-51.png',
  '/D-Music/D-logo/D-logo-52.png',
  '/D-Music/D-logo/D-logo-53.png',
  '/D-Music/D-logo/D-logo-54.png',
  '/D-Music/D-logo/D-logo-55.png',
  '/D-Music/D-logo/D-logo-56.png',
  '/D-Music/D-logo/D-logo-57.png',
  '/D-Music/D-logo/D-logo-58.png',
  '/D-Music/D-logo/D-logo-59.png',
];

export const DMUSIC_PHOTOS: string[] = [
  '/D-Music/D-98/Music-1978.jpg',
  '/D-Music/D-98/Music-1979.jpg',
  '/D-Music/D-98/Music-1980.jpg',
  '/D-Music/D-98/Music-1981.jpg',
  '/D-Music/D-98/Music-1982.jpg',
  '/D-Music/D-98/Music-1983.jpg',
  '/D-Music/D-98/Music-1990.jpg',
  '/D-Music/D-98/Music-1991.jpg',
  '/D-Music/D-98/Music-1992.jpg',
  '/D-Music/D-98/Music-1993.jpg',
  '/D-Music/D-98/Music-1994.jpg',
  '/D-Music/D-98/Music-1995.jpg',
  '/D-Music/D-98/Music-1996.jpg',
  '/D-Music/D-98/Music-1997.jpg',
];

export const DMUSIC_VIDEOS: string[] = [
  '/D-Music/D-98-Mp4/Music-1989.mp4',
  '/D-Music/D-98-Mp4/Music-1990.mp4',
  '/D-Music/D-98-Mp4/Music-1991.mp4',
  '/D-Music/D-98-Mp4/Music-1992.mp4',
  '/D-Music/D-98-Mp4/Music-1993.mp4',
  '/D-Music/D-98-Mp4/Music-1994.mp4',
  '/D-Music/D-98-Mp4/Music-1995.mp4',
];

export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'music-a-01',
    title: '往事如风',
    artist: '沫言',
    album: 'Music-A',
    duration: 240,
    audioUrl: '/Music-Mp3/Music-A/沫言-往事如风.mp3',
    coverUrl: '/D-Music/D-98/Music-1978.jpg',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-a-02',
    title: '昨日的酒',
    artist: '沫言',
    album: 'Music-A',
    duration: 220,
    audioUrl: '/Music-Mp3/Music-A/沫言-昨日的酒.mp3',
    coverUrl: '/D-Music/D-98/Music-1979.jpg',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-a-03',
    title: '不必完美',
    artist: '沫言',
    album: 'Music-A',
    duration: 200,
    audioUrl: '/Music-Mp3/Music-A/沫言-不必完美.mp3',
    coverUrl: '/D-Music/D-98/Music-1980.jpg',
    emotion: 'calm',
    genre: '抒情',
    year: 2025,
  },
  {
    id: 'music-a-04',
    title: '永远宝贝',
    artist: '沫言',
    album: 'Music-A',
    duration: 230,
    audioUrl: '/Music-Mp3/Music-A/沫言-永远宝贝.mp3',
    coverUrl: '/D-Music/D-98/Music-1981.jpg',
    emotion: 'love',
    genre: '抒情',
    year: 2025,
  },
  {
    id: 'music-a-05',
    title: '渡船也是过客',
    artist: '沫言',
    album: 'Music-A',
    duration: 215,
    audioUrl: '/Music-Mp3/Music-A/沫言-渡船也是过客.mp3',
    coverUrl: '/D-Music/D-98/Music-1982.jpg',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-a-06',
    title: '你为何如此疲惫',
    artist: '沫言',
    album: 'Music-A',
    duration: 225,
    audioUrl: '/Music-Mp3/Music-A/沫言-你为何如此疲惫.mp3',
    coverUrl: '/D-Music/D-98/Music-1983.jpg',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-a-07',
    title: 'AI Family',
    artist: '沫言',
    album: 'Music-A',
    duration: 260,
    audioUrl: '/Music-Mp3/Music-A/沫言-AI Family.mp3',
    coverUrl: '/D-Music/D-98/Music-1990.jpg',
    emotion: 'happy',
    genre: '电子',
    year: 2025,
  },
  {
    id: 'music-b-01',
    title: '浮生如渡',
    artist: '沫语',
    album: 'Music-B',
    duration: 220,
    audioUrl: '/Music-Mp3/Music-B/沫语-浮生如渡.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-20.png',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-b-02',
    title: '半生清醒',
    artist: '沫语',
    album: 'Music-B',
    duration: 210,
    audioUrl: '/Music-Mp3/Music-B/沫语-半生清醒.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-21.png',
    emotion: 'calm',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-b-03',
    title: '半世浮生',
    artist: '沫语',
    album: 'Music-B',
    duration: 230,
    audioUrl: '/Music-Mp3/Music-B/沫语-半世浮生.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-22.png',
    emotion: 'sad',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-b-04',
    title: '不负流年',
    artist: '沫语',
    album: 'Music-B',
    duration: 240,
    audioUrl: '/Music-Mp3/Music-B/沫语-不负流年.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-23.png',
    emotion: 'energetic',
    genre: '励志',
    year: 2025,
  },
  {
    id: 'music-b-05',
    title: '半生风雨',
    artist: '沫语',
    album: 'Music-B',
    duration: 215,
    audioUrl: '/Music-Mp3/Music-B/沫语-半生风雨.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-24.png',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-b-06',
    title: '浮生似梦',
    artist: '沫语',
    album: 'Music-B',
    duration: 225,
    audioUrl: '/Music-Mp3/Music-B/沫语-浮生似梦.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-25.png',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-b-07',
    title: '半生云烟',
    artist: '沫语',
    album: 'Music-B',
    duration: 235,
    audioUrl: '/Music-Mp3/Music-B/沫语-半生云烟.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-26.png',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-c-01',
    title: '过客',
    artist: '董小姐',
    album: 'Music-C',
    duration: 240,
    audioUrl: '/Music-Mp3/Music-C/董小姐-过客.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-33.png',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-c-02',
    title: '歌岁月',
    artist: '董小姐',
    album: 'Music-C',
    duration: 220,
    audioUrl: '/Music-Mp3/Music-C/董小姐-歌岁月.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-34.png',
    emotion: 'calm',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-c-03',
    title: '忘了曾经',
    artist: '董小姐',
    album: 'Music-C',
    duration: 215,
    audioUrl: '/Music-Mp3/Music-C/董小姐-忘了曾经.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-35.png',
    emotion: 'sad',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-c-04',
    title: '我的宝贝',
    artist: '董小姐',
    album: 'Music-C',
    duration: 230,
    audioUrl: '/Music-Mp3/Music-C/董小姐-我的宝贝.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-36.png',
    emotion: 'love',
    genre: '抒情',
    year: 2025,
  },
  {
    id: 'music-c-05',
    title: '秋风不问梧桐意',
    artist: '董小姐',
    album: 'Music-C',
    duration: 245,
    audioUrl: '/Music-Mp3/Music-C/董小姐-秋风不问梧桐意.mp3',
    coverUrl: '/D-Music/D-logo/D-logo-37.png',
    emotion: 'sad',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-d-01',
    title: '奉陪',
    artist: '董小姐、沫言',
    album: 'Music-D',
    duration: 240,
    audioUrl: '/Music-Mp3/Music-D/董小姐-沫言-奉陪.mp3',
    coverUrl: '/D-Music/D-98/Music-1990.jpg',
    emotion: 'energetic',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-d-02',
    title: '时光',
    artist: '董小姐、沫言',
    album: 'Music-D',
    duration: 220,
    audioUrl: '/Music-Mp3/Music-D/董小姐-沫言-时光.mp3',
    coverUrl: '/D-Music/D-98/Music-1991.jpg',
    emotion: 'calm',
    genre: '抒情',
    year: 2025,
  },
  {
    id: 'music-d-03',
    title: '浮生如渡',
    artist: '董小姐、沫言',
    album: 'Music-D',
    duration: 230,
    audioUrl: '/Music-Mp3/Music-D/董小姐-沫言-浮生如渡.mp3',
    coverUrl: '/D-Music/D-98/Music-1992.jpg',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'music-d-04',
    title: '岁月如歌',
    artist: '董小姐、沫言',
    album: 'Music-D',
    duration: 235,
    audioUrl: '/Music-Mp3/Music-D/董小姐-沫言-岁月如歌.mp3',
    coverUrl: '/D-Music/D-98/Music-1993.jpg',
    emotion: 'calm',
    genre: '流行',
    year: 2025,
  },
  {
    id: 'music-d-05',
    title: '渡心·时序',
    artist: '董小姐、沫言',
    album: 'Music-D',
    duration: 250,
    audioUrl: '/Music-Mp3/Music-D/董小姐-沫言-渡心·时序.mp3',
    coverUrl: '/D-Music/D-98/Music-1994.jpg',
    emotion: 'calm',
    genre: '古风',
    year: 2025,
  },
  {
    id: 'family-ai-01',
    title: 'AI-Family',
    artist: '沫言',
    album: 'FAmily-AI',
    duration: 260,
    audioUrl: '/Music-Mp3/FAmily-AI/沫言-AI-Family.mp3',
    coverUrl: '/D-Music/D-98/Music-1995.jpg',
    emotion: 'happy',
    genre: '电子',
    year: 2025,
  },
  {
    id: 'family-ai-02',
    title: 'Family-AI',
    artist: '沫言',
    album: 'FAmily-AI',
    duration: 240,
    audioUrl: '/Music-Mp3/FAmily-AI/沫言-Family-AI.mp3',
    coverUrl: '/D-Music/D-98/Music-1996.jpg',
    emotion: 'energetic',
    genre: '电子',
    year: 2025,
  },
  {
    id: 'family-ai-03',
    title: 'Family-AI-智慧工坊',
    artist: '沫言',
    album: 'FAmily-AI',
    duration: 280,
    audioUrl: '/Music-Mp3/FAmily-AI/沫言-Family-AI-智慧工坊.mp3',
    coverUrl: '/D-Music/D-98/Music-1997.jpg',
    emotion: 'happy',
    genre: '电子',
    year: 2025,
  },
];

export const ALBUMS: Album[] = [
  {
    id: 'album-a',
    name: 'Music-A',
    coverUrl: '/D-Music/D-98/Music-1978.jpg',
    description: '沫言原创音乐专辑 A',
    tracks: MUSIC_LIBRARY.filter(t => t.album === 'Music-A'),
  },
  {
    id: 'album-b',
    name: 'Music-B',
    coverUrl: '/D-Music/D-logo/D-logo-20.png',
    description: '沫语原创音乐专辑 B',
    tracks: MUSIC_LIBRARY.filter(t => t.album === 'Music-B'),
  },
  {
    id: 'album-c',
    name: 'Music-C',
    coverUrl: '/D-Music/D-logo/D-logo-33.png',
    description: '董小姐原创音乐专辑 C',
    tracks: MUSIC_LIBRARY.filter(t => t.album === 'Music-C'),
  },
  {
    id: 'album-d',
    name: 'Music-D',
    coverUrl: '/D-Music/D-98/Music-1990.jpg',
    description: '董小姐·沫言合作专辑 D',
    tracks: MUSIC_LIBRARY.filter(t => t.album === 'Music-D'),
  },
  {
    id: 'album-family-ai',
    name: 'FAmily-AI',
    coverUrl: '/D-Music/D-98/Music-1995.jpg',
    description: 'AI Family 主题曲',
    tracks: MUSIC_LIBRARY.filter(t => t.album === 'FAmily-AI'),
  },
];

export const ARTIST_PROFILE: ArtistProfile = {
  id: 'artist-dong',
  name: '董小姐',
  avatarUrl: '/D-Music/D-logo/D-logo-20.png',
  bio: '独立音乐人，原创歌手',
  albums: ALBUMS,
};

export function getRandomLogo(): string {
  return DMUSIC_LOGOS[Math.floor(Math.random() * DMUSIC_LOGOS.length)];
}

export function getRandomPhoto(): string {
  return DMUSIC_PHOTOS[Math.floor(Math.random() * DMUSIC_PHOTOS.length)];
}

export function getTracksByEmotion(emotion: MusicTrack['emotion']): MusicTrack[] {
  return MUSIC_LIBRARY.filter(t => t.emotion === emotion);
}

export function getTracksByAlbum(album: string): MusicTrack[] {
  return MUSIC_LIBRARY.filter(t => t.album === album);
}

export function searchTracks(query: string): MusicTrack[] {
  const q = query.toLowerCase();
  return MUSIC_LIBRARY.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    t.album.toLowerCase().includes(q) ||
    t.genre.toLowerCase().includes(q)
  );
}
