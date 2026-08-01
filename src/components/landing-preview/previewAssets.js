/** Shared static imagery for the visual-only home preview (`/preview/home`). */

const face = (id, size = 64) =>
  `https://images.unsplash.com/${id}?auto=format&fit=facearea&facepad=2.5&w=${size}&h=${size}&q=60`;

/** Small circular avatar photos used in overlapping clusters. */
export const AVATARS = [
  face('photo-1494790108377-be9c29b29330'),
  face('photo-1507003211169-0a1dd7228f2d'),
  face('photo-1438761681033-6461ffad8d80'),
  face('photo-1500648767791-00dcc994a43e'),
  face('photo-1534528741775-53994a69daeb'),
  face('photo-1506794778202-cad84cf45f1d'),
  face('photo-1517841905240-472988babdf9'),
  face('photo-1539571696357-5a69c17a67c6'),
];

/** Picks `count` avatars starting at `offset`, wrapping around the list. */
export const pickAvatars = (count, offset = 0) =>
  Array.from({ length: count }, (_, i) => AVATARS[(offset + i) % AVATARS.length]);

export const img = (id, w = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
