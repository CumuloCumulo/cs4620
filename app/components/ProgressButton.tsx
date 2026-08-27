"use client";

import { useEffect, useState } from "react";

export function ProgressButton({ lessonId }: { lessonId: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDone(window.localStorage.getItem(`cs4620:${lessonId}`) === "done"));
    return () => window.cancelAnimationFrame(frame);
  }, [lessonId]);
  const toggle = () => {
    const next = !done;
    setDone(next);
    if (next) window.localStorage.setItem(`cs4620:${lessonId}`, "done");
    else window.localStorage.removeItem(`cs4620:${lessonId}`);
  };
  return <button className={`progress-button ${done ? "done" : ""}`} type="button" onClick={toggle}>{done ? "✓ 已完成" : "标记本节已完成"}</button>;
}
