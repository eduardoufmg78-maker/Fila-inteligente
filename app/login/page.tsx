"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState<"Dr." | "Dra.">("Dr.");

  // Se já estiver logado, vai direto pro painel
  useEffect(() => {
    const storedName = localStorage.getItem("doctorName");
    const storedTitle = localStorage.getItem("doctorTitle");

    if (storedName && storedTitle) {
      window.location.href = "/painel";
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Salva no localStorage para o painel
    localStorage.setItem("doctorName", name.trim());
    localStorage.setItem("doctorTitle", title);

    // Vai para o painel
    window.location.href = "/painel";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800/90 px-8 py-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login do Profissional
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção Dr / Dra */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Título profissional
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="titulo"
                  value="Dr."
                  checked={title === "Dr."}
                  onChange={() => setTitle("Dr.")}
                  className="accent-blue-500"
                />
                <span>Dr.</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="titulo"
                  value="Dra."
                  checked={title === "Dra."}
                  onChange={() => setTitle("Dra.")}
                  className="accent-blue-500"
                />
                <span>Dra.</span>
              </label>
            </div>
          </div>

          {/* Nome do profissional */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome do profissional
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Amanda Souza"
              className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-900/60 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
          >
            Entrar no painel
          </button>
        </form>
      </div>
    </div>
  );
}
