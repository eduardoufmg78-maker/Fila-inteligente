"use client";

import { useEffect, useState, useRef } from "react";

type PublicCall =
  | {
      type: "CALL";
      name: string;
      doctorName: string;
      timestamp: number;
    }
  | {
      type: "CLEAR";
      timestamp: number;
    };

// Tipagem global para evitar erros no build
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function PublicoPage() {
  const [message, setMessage] = useState("Aguardando chamada...");
  const [subtitle, setSubtitle] = useState(
    "Por favor, aguarde ser chamado no painel."
  );
  const [videoId, setVideoId] = useState("");

  // Guardamos a referência real do player
  const playerRef = useRef<any>(null);

  // ----- 1️⃣ APLICAR CHAMADA -----
  const applyCall = (data: PublicCall) => {
    if (data.type === "CLEAR") {
      setMessage("Aguardando chamada...");
      setSubtitle("Por favor, aguarde ser chamado no painel.");

      // restaura volume
      if (playerRef.current?.setVolume) playerRef.current.setVolume(100);
      return;
    }

    setMessage(`Paciente ${data.name}`);
    setSubtitle(`Dirija-se ao consultório do(a) ${data.doctorName}.`);

    // ducking
    if (playerRef.current?.setVolume) playerRef.current.setVolume(20);

    setTimeout(() => {
      if (playerRef.current?.setVolume) playerRef.current.setVolume(100);
    }, 10_000);
  };

  // ----- 2️⃣ CARREGAR ÚLTIMO ESTADO + OUVIR STORAGE -----
  useEffect(() => {
    if (typeof window === "undefined") return;

    // carregar última chamada
    const savedCall = localStorage.getItem("publicCall");
    if (savedCall) {
      try {
        applyCall(JSON.parse(savedCall));
      } catch {}
    }

    const savedVideo = localStorage.getItem("videoId");
    if (savedVideo) setVideoId(savedVideo);

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === "publicCall" && ev.newValue) {
        try {
          applyCall(JSON.parse(ev.newValue));
        } catch {}
      }

      if (ev.key === "videoId" && ev.newValue) {
        setVideoId(ev.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applyCall]);

  // ----- 3️⃣ CARREGAR API DO YOUTUBE + CRIAR PLAYER -----
  useEffect(() => {
    if (!videoId) return;

    // Criar script da API apenas uma vez
    const existingScript = document.getElementById("youtube-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }

      playerRef.current = new window.YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: () => {
            playerRef.current.setVolume(100);
          },
        },
      });
    };
  }, [videoId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex flex-col items-center justify-center p-6 relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 drop-shadow">
        Chamada de Pacientes
      </h1>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-4xl w-full text-center border border-white/20">
        <p className="text-4xl md:text-5xl font-bold mb-4">{message}</p>
        <p className="text-xl md:text-2xl text-slate-200">{subtitle}</p>
      </div>

      {/* Player de vídeo */}
      <div className="absolute bottom-4 right-4 w-72 md:w-96 h-40 md:h-56 bg-black/70 rounded-xl overflow-hidden border border-white/30 p-2">
        <p className="text-xs text-slate-300 mb-1">Música ambiente</p>

        {videoId ? (
          <div id="player" className="w-full h-full rounded-md" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm text-center">
            Configure um vídeo no painel do profissional.
          </div>
        )}
      </div>
    </div>
  );
}
