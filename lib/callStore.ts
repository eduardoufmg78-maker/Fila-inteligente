// lib/callStore.ts

export type CallData = {
  id: number;
  name: string;
  doctor: string;
  room: string;
  timestamp: number;
};

// chamada atual
let currentCall: CallData | null = null;

// link atual do vídeo do YouTube
let currentVideoUrl: string | null = null;

// --------- CHAMADA DE PACIENTE ---------

export function setCurrentCall(call: CallData) {
  currentCall = call;
}

export function getCurrentCall(): CallData | null {
  return currentCall;
}

// --------- VÍDEO DO YOUTUBE ---------

export function setVideoUrl(url: string | null) {
  currentVideoUrl = url;
}

export function getVideoUrl(): string | null {
  return currentVideoUrl;
}
