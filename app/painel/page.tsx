"use client";

import { useEffect, useState, useRef } from "react";

type Patient = {
  id: number;
  name: string;
};

export default function PainelMedico() {
  const [doctorName, setDoctorName] = useState("");
  const [doctorTitle, setDoctorTitle] = useState<"Dr." | "Dra.">("Dr.");
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentCallId, setCurrentCallId] = useState<number | null>(null);
  const [videoLink, setVideoLink] = useState("");

  const repeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const n = localStorage.getItem("doctorName");
    if (n) setDoctorName(n);

    const t = localStorage.getItem("doctorTitle");
    if (t === "Dr." || t === "Dra.") setDoctorTitle(t);

    const savedPatients = localStorage.getItem("patients");
    if (savedPatients) setPatients(JSON.parse(savedPatients));

    const savedVideo = localStorage.getItem("videoId");
    if (savedVideo) setVideoLink(savedVideo);
  }, []);

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    speechSynthesis.speak(utter);
  };

  const getPrefix = () => (doctorTitle === "Dra." ? "Doutora" : "Doutor");
  const getArticle = () => (doctorTitle === "Dra." ? "da" : "do");

  // 🔵 Chamar paciente
  const callPatient = (id: number) => {
    const patient = patients.find((p) => p.id === id);
    if (!patient) return;

    const prefix = getPrefix();
    const article = getArticle();

    const text = `Paciente ${patient.name}, dirija-se ao consultório ${article} ${prefix} ${doctorName}.`;
    speak(text);

    setCurrentCallId(id);

    // 🔥 ENVIA PARA O PAINEL PÚBLICO
    localStorage.setItem(
      "publicCall",
      JSON.stringify({
        type: "CALL",
        name: patient.name,
        doctorName: `${doctorTitle} ${doctorName}`,
        timestamp: Date.now(),
      })
    );

    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = setInterval(() => speak(text), 30000);
  };

  // 🟢 Confirmar entrada
  const confirmEntry = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    setCurrentCallId(null);

    localStorage.setItem(
      "publicCall",
      JSON.stringify({
        type: "CLEAR",
        timestamp: Date.now(),
      })
    );
  };

  // ➕ Adicionar paciente
  const addPatient = () => {
    if (!patientName.trim()) return;

    setPatients([...patients, { id: Date.now(), name: patientName.trim() }]);

    setPatientName("");
  };

  // 🚮 Excluir paciente
  const deletePatient = (id: number) => {
    setPatients(patients.filter((p) => p.id !== id));
  };

  // 🔵 Configurar vídeo
  const handleVideoChange = (url: string) => {
    const match = url.match(/v=([^&]+)/);
    if (match) {
      const id = match[1];
      setVideoLink(id);
      localStorage.setItem("videoId", id);

      // Forçar update no painel público
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "videoId",
          newValue: id,
        })
      );
    }
  };

  // 🔴 Logout
  const logout = () => {
    localStorage.removeItem("doctorName");
    localStorage.removeItem("doctorTitle");
    window.location.href = "/Login";
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

          <h2 className="text-xl font-semibold mb-3">Pacientes cadastrados</h2>

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
