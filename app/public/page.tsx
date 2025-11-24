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

  // Função para falar no navegador da RECEPÇÃO
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
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
  }, [lastAnnouncedId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-3xl bg-slate-800/80 rounded-2xl p-10 shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold mb-6">Chamada de Pacientes</h1>

        {currentCall ? (
          <>
            <p className="text-xl mb-2">Chamando paciente:</p>
            <p className="text-5xl font-bold mb-4">{currentCall.name}</p>
            <p className="text-lg">
              Dirija-se ao <span className="font-semibold">{currentCall.room}</span>.
            </p>
          </>
        ) : (
          <p className="text-xl text-slate-300">
            Aguardando próxima chamada...
          </p>
        )}
      </div>
    </main>
  );
}
