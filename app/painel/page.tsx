"use client";

import { useState } from "react";

type Patient = {
  id: number;
  name: string;
  status: "aguardando" | "chamado" | "atendido";
};

export default function PainelPage() {
  const [title, setTitle] = useState<"Dr." | "Dra.">("Dr.");
  const [professionalName, setProfessionalName] = useState("");
  const [room, setRoom] = useState("Consultório 1");
  const [patientInput, setPatientInput] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSending, setIsSending] = useState(false);

  const professionalLabel = professionalName
    ? `${title} ${professionalName.trim()}`
    : "";

  function handleAddPatient() {
    const name = patientInput.trim();
    if (!name) {
      alert("Digite o nome do paciente para adicionar à fila.");
      return;
    }

    const newPatient: Patient = {
      id: Date.now(),
      name,
      status: "aguardando",
    };

    setPatients((prev) => [...prev, newPatient]);
    setPatientInput("");
  }

  async function handleCallPatient(id: number) {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    if (!professionalLabel) {
      alert("Preencha o título e o nome do profissional.");
      return;
    }

    if (!room) {
      alert("Selecione o consultório.");
      return;
    }

    try {
      setIsSending(true);

      const res = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patient.name,
          doctor: professionalLabel,
          room: room,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Erro ao chamar paciente:", data);
        alert("Erro ao chamar paciente. Tente novamente.");
        return;
      }

      // marca como "chamado"
      setPatients((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "chamado" } : p
        )
      );
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão ao chamar paciente.");
    } finally {
      setIsSending(false);
    }
  }

  function handleConfirmEntry(id: number) {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "atendido" } : p
      )
    );
  }

  function handleDeletePatient(id: number) {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Painel do Profissional – Fila Inteligente
        </h1>

        {/* Dados do profissional */}
        <section className="bg-slate-900/40 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-1">Profissional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
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

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">
                Nome do profissional
              </label>
              <input
                type="text"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex.: Eduardo Souza"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">
                Consultório
              </label>
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

            <div className="md:col-span-2 flex items-end">
              <p className="text-sm text-slate-300">
                {professionalLabel && (
                  <>
                    Chamadas serão anunciadas como{" "}
                    <span className="font-semibold">
                      {professionalLabel}
                    </span>{" "}
                    no {room}.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Fila de pacientes */}
        <section className="bg-slate-900/40 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-1">
            Fila de pacientes
          </h2>

          {/* Adicionar paciente */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nome do paciente"
            />
            <button
              type="button"
              onClick={handleAddPatient}
              className="px-4 py-2 rounded-md font-semibold bg-emerald-500 hover:bg-emerald-600 transition"
            >
              Adicionar
            </button>
          </div>

          {/* Lista */}
          {patients.length === 0 ? (
            <p className="text-sm text-slate-300 mt-2">
              Nenhum paciente na fila.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-700">
                    <th className="py-2 pr-2">Paciente</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="py-2 pr-2">{p.name}</td>
                      <td className="py-2 pr-2">
                        {p.status === "aguardando" && "Aguardando"}
                        {p.status === "chamado" && "Chamado"}
                        {p.status === "atendido" && "Atendido"}
                      </td>
                      <td className="py-2 pr-2 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCallPatient(p.id)}
                          disabled={isSending}
                          className="px-3 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold"
                        >
                          Chamar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmEntry(p.id)}
                          className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold"
                        >
                          Confirmar entrada
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(p.id)}
                          className="px-3 py-1 rounded-md bg-rose-500 hover:bg-rose-600 text-xs font-semibold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
