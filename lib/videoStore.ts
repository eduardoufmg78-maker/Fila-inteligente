// lib/videoStore.ts

let currentVideoUrl: string = "";

export function setCurrentVideoUrl(url: string) {
  currentVideoUrl = url;
}

export function getCurrentVideoUrl(): string {
  return currentVideoUrl;
}
