"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ReadAloud({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const start = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const chunks = text.match(/[^.!?]+[.!?]*/g)?.map((c) => c.trim()).filter(Boolean).slice(0, 500) ?? [text];
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c);
      u.rate = 1;
      if (i === chunks.length - 1) u.onend = () => setPlaying(false);
      synth.speak(u);
    });
    setPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  if (!supported || !text.trim()) return null;

  return (
    <Button variant="outline" size="sm" onClick={playing ? stop : start}>
      {playing ? "⏹ Stop" : "🔊 Listen"}
    </Button>
  );
}
