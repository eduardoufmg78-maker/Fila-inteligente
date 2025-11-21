/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

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

export default function PublicoPage() {
  const [message, setMessage] = useState("Aguardando chamada...");
  const [subtitle, setSubtitle] = useState(
    "Por favor, aguarde ser chamado no painel."
  );
  const [videoId, setVideoId] = useState("");
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  // 🔵 1. Carrega última chamada e vídeo
  useEffect(() => {
    const savedCall = localStorage.getItem("publicCall");
    if (savedCall) {
      try {
        applyCall(JSON.parse(savedCall));
      } catch {}
    }

    const savedVideo = localStorage.getItem("videoId");
    if (savedVideo) setVideoId(savedVideo);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "publicCall" && event.newValue) {
        try {
          applyCall(JSON.parse(event.newValue));
        } catch {}
      }

      if (event.key === "videoId" && event.newValue) {
        setVideoId(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 🔵 2. Carregar API do YouTube e criar o player
  useEffect(() => {
    if (!videoId) return;

    const existing = document.getElementById("youtube-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "youtube-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      const player = new (window as any).YT.Player("player", {
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
            player.setVolume(100);
            setYtPlayer(player);
          },
        },
      });
    };
  }, [videoId]);

  // 🔵 3. Aplicar chamada + ducking
  const applyCall = (data: PublicCall) => {
    if (data.type === "CLEAR") {
      setMessage("Aguardando chamada...");
      setSubtitle("Por favor, aguarde ser chamado no painel.");

      const player = ytPlayer as any;
      if (player?.setVolume) player.setVolume(100);

      return;
    }

    setMessage(`Paciente ${data.name}`);
    setSubtitle(`Dirija-se ao consultório do(a) ${data.doctorName}.`);

    const player = ytPlayer as any;
    if (player?.setVolume) player.setVolume(20);

    setTimeout(() => {
      const p = ytPlayer as any;
      if (p?.setVolume) p.setVolume(100);
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex flex-col items-center justify-center p-6 relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 drop-shadow">
        Chamada de Pacientes
      </h1>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-4xl w-full text-center border border-white/20">
        <p className="text-4xl md:text-5xl font-bold mb-4">{message}</p>
        <p className="text-xl md:text-2xl text-slate-200">{subtitle}</p>
      </div>

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
