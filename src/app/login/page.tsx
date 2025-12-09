"use client";

import React, { useState } from "react";
import FaceScanner, { ScanResult } from "@/components/FaceScanner";

export default function LoginPage() {
  const [msg, setMsg] = useState<string>("Look at the camera and Scan.");
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  async function onScan(result: ScanResult) {
    try {
      setMsg("Authenticating...");
      const res = await fetch("/api/auth/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: result.descriptor }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUser(null);
        setMsg(`No match${data.distance ? ` (distance ${data.distance.toFixed(3)})` : ""}. Try again or enroll first.`);
        return;
      }
      setUser(data.user);
      setMsg("Authenticated.");
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Face Login</h1>
        <FaceScanner onScan={onScan} />
        {user ? (
          <div className="border rounded p-4">
            <div className="font-medium">Welcome, {user.name}</div>
            <div className="text-sm text-zinc-600">{user.email}</div>
          </div>
        ) : null}
        <p className="text-sm text-zinc-600">{msg}</p>
      </div>
    </div>
  );
}
