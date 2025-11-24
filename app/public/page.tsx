"use client";

import { useEffect, useState } from "react";

type CallData = {
  id: number;
  name: string;
  doctor: string;
  room: string;
  timestamp: number;
};

export default function PublicPage() {
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [lastAnnouncedId, setLastAnnouncedId] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Carrega lista de vozes e tenta escolher uma voz feminina em pt-BR
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    function pickVoice() {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Prioriza vozes em português
      const ptVoices = voices.filter((v) =>
        v.lang.toLowerCase().startsWith("pt")
      );

      // Tenta achar alguma que pareça feminina (heurística pelo nome)
      const femaleCandidates = ptVoices.filter((v) =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("feminina") ||
        v.name.toLowerCase().includes("brasil") ||
        v.name.toLowerCase().includes("br") ||
        v.name.toLowerCase().includes("maria")
      );

      const chosen: SpeechSynthesisVoice | null =
        femaleCandidates[0] || ptVoices[0] || voices[0] || null;

      setVoice(chosen);
    }

    // Algumas vezes getVoices retorna vazio na primeira chamada
    pickVoice();
    synth.onvoiceschanged = pickVoice;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string) => {
    if (!audioEnabled) return; // só fala se o usuário tiver habilitado
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    const utter = new SpeechSynthesisUtterance(text);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = "pt-BR";
    }
    utter.rate = 1;
    utter.pitch = 1;

    synth.cancel();
    synth.speak(utter);
  };

  // Buscar a chamada a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/current-call");
        if (!res.ok) return;

        const data = await res.json();
        const call: CallData | null = data.call;

        // Só anuncia se for chamada nova
        if (call && call.id !== lastAnnouncedId) {
          setCurrentCall(call);
          setLastAnnouncedId(call.id);

          const frase = `Paciente ${call.name}, dirija-se ao ${call.room}.`;
          speak(frase);
        }
      } catch (error) {
        console.error("Erro ao buscar chamada:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastAnnouncedId, audioEnabled, voice, speak]);

  function handleEnableAudio() {
    setAudioEnabled(true);
    // Frase de teste para "desbloquear" o áudio
    setTimeout(() => {
      speak("Sistema de chamadas ativado.");
    }, 300);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-3xl bg-slate-800/80 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <h1 className="text-3xl font-extrabold">Chamada de Pacientes</h1>

        {!audioEnabled && (
          <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 text-sm">
            <p className="mb-2">
              Para que a voz funcione, é preciso habilitar o áudio neste
              computador.
            </p>
            <button
              type="button"
              onClick={handleEnableAudio}
              className="px-4 py-2 rounded-md font-semibold bg-emerald-500 hover:bg-emerald-600"
            >
              Ativar voz da chamada
            </button>
          </div>
        )}

        {currentCall ? (
          <div className="space-y-3">
            <p className="text-xl">Chamando paciente:</p>
            <p className="text-5xl font-bold">{currentCall.name}</p>
            <p className="text-lg">
              Dirija-se ao{" "}
              <span className="font-semibold">{currentCall.room}</span>.
            </p>
          </div>
        ) : (
          <p className="text-xl text-slate-300">
            Aguardando próxima chamada...
          </p>
        )}
      </div>
    </main>
  );
}
