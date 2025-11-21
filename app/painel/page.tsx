"use client";

import { useEffect, useState, useRef } from "react";

type DoctorTitle = "Dr." | "Dra.";

type Patient = {
  id: number;
  name: string;
};

type PublicCall =
  | { type: "CALL"; name: string; doctorName: string; timestamp: number }
  | { type: "CLEAR"; timestamp: number };

const STORAGE_KEYS = {
  doctorName: "doctorName",
  doctorTitle: "doctorTitle",
  patients: "patients",
  publicCall: "publicCall",
  videoId: "videoId",
} as const;

const getPrefix = (title: DoctorTitle) =>
  title === "Dra." ? "Doutora" : "Doutor";

const getArticle = (title: DoctorTitle) =>
  title === "Dra." ? "da" : "do";

export default function PainelMedico() {
  const [doctorName, setDoctorName] = useState("");
  const [doctorTitle, setDoctorTitle] = useState<DoctorTitle>("Dr.");
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentCallId, setCurrentCallId] = useState<number | null>(null);

  // em browser, setInterval retorna number, não NodeJS.Timeout
  const repeatRef = useRef<number | null>(null);

  // 🔹 Carrega dados salvos
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = localStorage.getItem(STORAGE_KEYS.doctorName);
    const storedTitle = localStorage.getItem(
      STORAGE_KEYS.doctorTitle
    ) as DoctorTitle | null;
    const savedPatients = localStorage.getItem(STORAGE_KEYS.patients);

    if (storedName) setDoctorName(storedName);
    if (storedTitle === "Dr." || storedTitle === "Dra.") {
      setDoctorTitle(storedTitle);
    }

    if (savedPatients) {
      try {
        setPatients(JSON.parse(savedPatients) as Patient[]);
      } catch {
        setPatients([]);
      }
    }
  }, []);

  // 🔹 Salva lista de pacientes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(patients));
  }, [patients]);

  // 🔊 Fala em voz alta
  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    window.speechSynthesis.speak(utter);
  };

  const sendPublicCall = (payload: PublicCall) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.publicCall, JSON.stringify(payload));
  };

  const startRepeat = (text: string) => {
    if (typeof window === "undefined") return;

    if (repeatRef.current !== null) {
      window.clearInterval(repeatRef.current);
    }
    repeatRef.current = window.setInterval(() => speak(text), 30_000);
  };

  const stopRepeat = () => {
    if (typeof window === "undefined") return;

    if (repeatRef.current !== null) {
      window.clearInterval(repeatRef.current);
      repeatRef.current = null;
    }
  };

  // 🔵 Chamar paciente
  const callPatient = (id: number) => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    const prefix = getPrefix(doctorTitle);
    const article = getArticle(doctorTitle);

    const text = `Paciente ${patient.name}, dirija-se ao consultório ${article} ${prefix} ${doctorName}.`;

    speak(text);
    startRepeat(text);
    setCurrentCallId(id);

    sendPublicCall({
      type: "CALL",
      name: patient.name,
      doctorName: `${doctorTitle} ${doctorName}`,
      timestamp: Date.now(),
    });
  };

  // 🟢 Confirmar entrada
  const confirmEntry = () => {
    stopRepeat();
    setCurrentCallId(null);

    sendPublicCall({
      type: "CLEAR",
      timestamp: Date.now(),
    });
  };

  // ➕ Adicionar paciente
  const addPatient = () => {
    const trimmed = patientName.trim();
    if (!trimmed) return;

    setPatients((prev) => [...prev, { id: Date.now(), name: trimmed }]);
    setPatientName("");
  };

  // 🚮 Excluir paciente
  const deletePatient = (id: number) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));

    if (currentCallId === id) {
      confirmEntry();
    }
  };

  // 🔵 Configurar vídeo (só salva o ID no localStorage)
  const handleVideoChange = (url: string) => {
    if (typeof window === "undefined") return;

    // aceita link normal e youtu.be
    const match =
      url.match(/v=([^&]+)/) ?? url.match(/youtu\.be\/([^?]+)/);

    if (!match) return;

    const id = match[1];
    localStorage.setItem(STORAGE_KEYS.videoId, id);
  };

  // 🔴 Logout
  const logout = () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEYS.doctorName);
    localStorage.removeItem(STORAGE_KEYS.doctorTitle);

    // rota em minúsculo
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel do Profissional</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Profissional logado */}
      <div className="mb-6">
        <p className="text-lg font-semibold">Profissional logado:</p>
        <p className="text-xl">
          {doctorTitle} {doctorName}
        </p>
      </div>

      {/* Configurar vídeo */}
      <div className="mb-6 bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Configurar vídeo</h2>

        <input
          type="text"
          placeholder="Cole aqui o link do YouTube"
          className="w-full border px-3 py-2 rounded mb-3"
          onBlur={(e) => handleVideoChange(e.target.value)}
        />

        <p className="text-sm text-gray-600">
          O vídeo será atualizado automaticamente no painel público.
        </p>
      </div>

      {/* Painel em 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cadastro */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Cadastrar paciente</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nome do paciente"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={addPatient}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Adicionar
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-3">
            Pacientes cadastrados
          </h2>

          <ul className="space-y-3">
            {patients.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between p-3 border rounded ${
                  currentCallId === p.id ? "bg-yellow-200" : "bg-gray-50"
                }`}
              >
                <span>{p.name}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => callPatient(p.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Chamar
                  </button>

                  <button
                    onClick={() => deletePatient(p.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chamada ativa */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Chamada ativa</h2>

          {currentCallId ? (
            <div className="p-4 border rounded bg-green-50">
              <p className="text-lg">
                Chamando:{" "}
                <strong>
                  {patients.find((p) => p.id === currentCallId)?.name}
                </strong>
              </p>

              <button
                onClick={confirmEntry}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirmar entrada
              </button>
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhum paciente está sendo chamado no momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
