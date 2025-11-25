"use client";

import { useCallback, useEffect, useState } from "react";

type CallData = {
  id: number;
  name: string;
  doctor: string;
  room: string;
  timestamp: number;
};

// Extrai o ID do YouTube de vários formatos de URL
function getYouTubeId(url: string): string | null {
  if (!url) return null;

  try {
    const u = new URL(url);

    // https://www.youtube.com/watch?v=ID
    if (
      (u.hostname.includes("youtube.com") ||
        u.hostname.includes("youtube-nocookie.com")) &&
      u.searchParams.get("v")
    ) {
      return u.searchParams.get("v");
    }

    // https://youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }

    // https://www.youtube.com/embed/ID
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.replace("/embed/", "");
    }
  } catch {
    return null;
  }

  return null;
}

export default function PublicPage() {
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [lastAnnouncedId, setLastAnnouncedId] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>("");

  // =========================
  //   VOZ FEMININA (TTS)
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    function pickVoice() {
      const voices = synth.getVoices();
      console.log("VOZES DISPONÍVEIS:", voices);

      if (!voices || voices.length === 0) return;

      // 1. vozes pt-BR
      const ptBr = voices.filter((v) =>
        v.lang.toLowerCase().includes("pt-br")
      );

      // 2. tenta achar vozes femininas pelos nomes
      const femaleHints = [
        "female",
        "feminina",
        "mulher",
        "maria",
        "ana",
        "camila",
        "helena",
        "carla",
        "fernanda",
      ];

      const female = ptBr.filter((v) =>
        femaleHints.some((h) => v.name.toLowerCase().includes(h))
      );

      const chosen =
        female[0] ||
        ptBr[0] ||
        voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ||
        voices[0];

      setVoice(chosen || null);
      console.log("Voz escolhida:", chosen);
    }

    pickVoice();
    synth.onvoiceschanged = pickVoice;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!audioEnabled) return;
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
    },
    [audioEnabled, voice]
  );

  // =========================
  //   BUSCAR CHAMADA ATUAL
  // =========================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/current-call");
        if (!res.ok) return;

        const data = await res.json();
        const call: CallData | null = data.call;

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
  }, [lastAnnouncedId, speak]);

  // =========================
  //   BUSCAR VÍDEO ATUAL
  // =========================
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch("/api/video");
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.url === "string") {
          setVideoUrl(data.url);
        }
      } catch (error) {
        console.error("Erro ao buscar vídeo:", error);
      }
    };

    fetchVideo();
    const interval = setInterval(fetchVideo, 30000);
    return () => clearInterval(interval);
  }, []);

  const youTubeId = getYouTubeId(videoUrl);

  function handleEnableAudio() {
    setAudioEnabled(true);
    setTimeout(() => {
      speak("Sistema de chamadas ativado.");
    }, 300);
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8">
        {/* CARD PRINCIPAL DE CHAMADA */}
        <div className="w-full max-w-3xl bg-slate-800/90 rounded-3xl px-8 py-10 shadow-2xl text-center border border-slate-700">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-6">
            Chamada de Pacientes
          </h1>

          {!audioEnabled && (
            <div className="mb-6 bg-yellow-500/15 border border-yellow-400 rounded-lg p-3 text-sm text-yellow-100">
              <p className="mb-2">
                Para que a voz funcione, clique no botão abaixo neste
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
            <div className="space-y-4">
              <p className="text-lg text-slate-200">
                Chamando paciente:
              </p>
              <p className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
                {currentCall.name}
              </p>
              <p className="text-base md:text-lg text-slate-200 mt-4">
                Dirija-se ao{" "}
                <span className="font-semibold">
                  {currentCall.room}
                </span>
                .
              </p>
              {currentCall.doctor && (
                <p className="text-sm text-slate-400">
                  Profissional: {currentCall.doctor}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xl text-slate-300">
              Aguardando próxima chamada...
            </p>
          )}
        </div>

        {/* PLAYER DE YOUTUBE (QUANDO HOUVER VÍDEO) */}
        {youTubeId && (
          <div className="w-full max-w-4xl">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl"
                src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&loop=1&playlist=${youTubeId}`}
                title="Vídeo do painel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
