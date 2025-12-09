"use client";

import React, { useState } from "react";
import FaceScanner, { ScanResult } from "@/components/FaceScanner";

export default function EnrollPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string>("Fill details and scan to enroll.");

  async function onScan(result: ScanResult) {
    try {
      setMsg("Uploading enrollment...");
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, descriptor: result.descriptor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Enrollment saved. You can now login with face.");
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Enroll Face</h1>
        <div className="flex gap-4">
          <input className="border px-3 py-2 rounded w-1/2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border px-3 py-2 rounded w-1/2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <FaceScanner onScan={onScan} />
        <p className="text-sm text-zinc-600">{msg}</p>
      </div>
    </div>
  );
}
