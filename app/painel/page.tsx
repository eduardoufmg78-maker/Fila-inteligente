"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Patient = {
  id: number;
  name: string;
  status: "aguardando" | "chamado" | "atendido";
};

export default function PainelPage() {
  const router = useRouter();

  const [title, setTitle] = useState<"Dr." | "Dra.">("Dr.");
  const [professionalName, setProfessionalName] = useState("");
  const [room, setRoom] = useState("Consultório 1");
  const [patientInput, setPatientInput] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSending, setIsSending] = useState(false);

  // vídeo do YouTube
  const [videoInput, setVideoInput] = useState("");
  const [videoStatus, setVideoStatus] = useState<"" | "ok" | "erro">("");

  const professionalLabel = professionalName
    ? `${title} ${professionalName.trim()}`
    : "";

  // Protege o painel: só entra se tiver login; carrega dados do login
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTitle = localStorage.getItem("doctorTitle");
    const storedName = localStorage.getItem("doctorName");
    const storedRoom = localStorage.getItem("doctorRoom");

    if (!storedName) {
      // não logado → manda para login
      router.push("/login");
      return;
    }

    if (storedTitle === "Dr." || storedTitle === "Dra.") {
      setTitle(storedTitle);
    }
    setProfessionalName(storedName);
    if (storedRoom) {
      setRoom(storedRoom);
    }
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("doctorTitle");
      localStorage.removeItem("doctorName");
      localStorage.removeItem("doctorRoom");
    }
    router.push("/login");
  }

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

  // envia o link do vídeo para o backend (/api/video)
  async function handleSendVideo() {
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoInput.trim(),
        }),
      });

      await res.json().catch(() => ({}));

      if (res.ok) {
        setVideoStatus("ok");
      } else {
        setVideoStatus("erro");
      }
    } catch (error) {
      console.error("Erro ao enviar vídeo:", error);
      setVideoStatus("erro");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
        <header className="border-b border-slate-200 pb-3 mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Painel do Profissional – Fila Inteligente
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {/* Dados do profissional */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Profissional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-sm text-slate-700 mb-1">Título</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTitle("Dr.")}
                  className={`flex-1 py-1 rounded-md text-sm border ${
                    title === "Dr."
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-slate-800 border-slate-300"
                  }`}
                >
                  Dr.
                </button>
                <button
                  type="button"
                  onClick={() => setTitle("Dra.")}
                  className={`flex-1 py-1 rounded-md text-sm border ${
                    title === "Dra."
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-slate-800 border-slate-300"
                  }`}
                >
                  Dra.
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">
                Nome do profissional
              </label>
              <input
                type="text"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ex.: Eduardo Souza"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-700 mb-1">
                Consultório
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Consultório 1</option>
                <option>Consultório 2</option>
                <option>Consultório 3</option>
                <option>Consultório 4</option>
                <option>Consultório 5</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <p className="text-sm text-slate-600">
                {professionalLabel && (
                  <>
                    Chamadas serão anunciadas como{" "}
                    <span className="font-semibold text-slate-900">
                      {professionalLabel}
                    </span>{" "}
                    no{" "}
                    <span className="font-semibold text-slate-900">
                      {room}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Vídeo do painel público */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Vídeo do painel público
          </h2>

          <p className="text-sm text-slate-600">
            Cole abaixo o link do YouTube que deve tocar na tela pública
            (recepção).
          </p>

          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSendVideo}
              className="px-4 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              Enviar vídeo
            </button>
          </div>

          {videoStatus === "ok" && (
            <p className="text-sm text-green-600">
              Vídeo atualizado com sucesso no painel público.
            </p>
          )}
          {videoStatus === "erro" && (
            <p className="text-sm text-red-600">
              Erro ao atualizar o vídeo. Tente novamente.
            </p>
          )}
        </section>

        {/* Fila de pacientes */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Fila de pacientes
          </h2>

          {/* Adicionar paciente */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Nome do paciente"
            />
            <button
              type="button"
              onClick={handleAddPatient}
              className="px-4 py-2 rounded-md font-semibold bg-green-500 hover:bg-green-600 text-white shadow-sm"
            >
              Adicionar
            </button>
          </div>

          {/* Lista */}
          {patients.length === 0 ? (
            <p className="text-sm text-slate-600 mt-2">
              Nenhum paciente na fila.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200 bg-white">
                    <th className="py-2 pr-2 text-slate-700">Paciente</th>
                    <th className="py-2 pr-2 text-slate-700">Status</th>
                    <th className="py-2 pr-2 text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2 pr-2 text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-2 pr-2">
                        {p.status === "aguardando" && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs">
                            Aguardando
                          </span>
                        )}
                        {p.status === "chamado" && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                            Chamado
                          </span>
                        )}
                        {p.status === "atendido" && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                            Atendido
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2 space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCallPatient(p.id)}
                          disabled={isSending}
                          className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Chamar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmEntry(p.id)}
                          className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-semibold"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(p.id)}
                          className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-semibold"
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
