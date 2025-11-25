"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [title, setTitle] = useState<"Dr." | "Dra.">("Dr.");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("Consultório 1");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Preencha o nome do profissional.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("doctorTitle", title);
      localStorage.setItem("doctorName", trimmedName);
      localStorage.setItem("doctorRoom", room);
    }

    router.push("/painel");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Login do Profissional
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
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

          {/* Nome */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Nome do profissional
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ex.: Eduardo Souza"
            />
          </div>

          {/* Consultório */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Consultório
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
