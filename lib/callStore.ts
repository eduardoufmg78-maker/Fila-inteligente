// lib/callStore.ts

export type CallData = {
  id: number;
  name: string;
  doctor: string;
  room: string;
  timestamp: number;
};

let currentCall: CallData | null = null;

export function setCurrentCall(call: CallData) {
  currentCall = call;
}

export function getCurrentCall(): CallData | null {
  return currentCall;
}
