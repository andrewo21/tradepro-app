"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  setFromQuery: boolean;
  password:     string;
}

export default function AdminPreviewClient({ setFromQuery, password }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (setFromQuery) {
      // Set the bypass cookie then redirect to home
      document.cookie = `tp_preview_access=${password}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
    // Redirect to home — maintenance middleware will now allow through
    router.replace("/");
  }, [setFromQuery, password, router]);

  return (
    <div style={{
      minHeight: "100vh", background: "#000", display: "flex",
      alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: "sans-serif", fontSize: 18
    }}>
      Unlocking preview…
    </div>
  );
}
