"use client";

import { useState } from "react";

export default function PainelPage() {
  const [title, setTitle] = useState<"Dr." | "Dra.">("Dr.");
  const [professionalName, setProfessionalName] = useState("");
  const [room, setRoom] = useState("Consultório 1");
  const [patientName, setPatientName] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleCallPatient() {
    if (!patientName.trim()) {
      alert("Digite o nome do paciente.");
      return;
    }
    if (!professionalName.trim()) {
      alert("Digite o nome do profissional.");
      return;
    }

    const doctor = `${title} ${professionalName.trim()}`;
    const roomLabel = room;

    try {
      setIsSending(true);

      const res = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patientName.trim(),
          doctor: doctor,
          room: roomLabel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Erro ao chamar paciente:", data);
        alert("Erro ao chamar paciente. Tente novamente.");
        return;
      }

      // limpa só o nome do paciente após chamada
      setPatientName("");
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão ao chamar paciente.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          Painel do Profissional – Fila Inteligente
        </h1>

        {/* Dados do profissional */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <p className="text-sm mb-1">Título</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTitle("Dr.")}
                className={`flex-1 py-1 rounded-md text-sm border ${
                  title === "Dr."
                    ? "bg-indigo-500 border-indigo-400"
                    : "bg-slate-700 border-slate-600"
                }`}
              >
                Dr.
              </button>
              <button
                type="button"
                onClick={() => setTitle("Dra.")}
                className={`flex-1 py-1 rounded-md text-sm border ${
                  title === "Dra."
                    ? "bg-indigo-500 border-indigo-400"
                    : "bg-slate-700 border-slate-600"
                }`}
              >
                Dra.
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-1">
              Nome do profissional
            </label>
            <input
              type="text"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Amanda Souza"
            />
          </div>
        </div>

        {/* Consultório */}
        <div>
          <label className="block text-sm mb-1">Número do consultório</label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Consultório 1</option>
            <option>Consultório 2</option>
            <option>Consultório 3</option>
            <option>Consultório 4</option>
            <option>Consultório 5</option>
          </select>
        </div>

        {/* Paciente */}
        <div>
          <label className="block text-sm mb-1">Nome do paciente</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Digite o nome do paciente"
          />
        </div>

        <button
          type="button"
          onClick={handleCallPatient}
          disabled={isSending}
          className="w-full mt-4 py-2 rounded-md font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isSending ? "Chamando..." : "Chamar paciente"}
        </button>
      </div>
    </main>
  );
}
