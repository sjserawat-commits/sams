"use client";

import { useEffect } from "react";

function DoctorDeskNavigationPatch() {
  useEffect(() => {
    const patch = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href="/consultation"]').forEach((el) => {
        const text = el.textContent?.trim().toLowerCase();
        if (text === "post consultation") el.remove();
      });
      document.querySelectorAll<HTMLAnchorElement>('a[href="/patients/profile/1/opd-slip"]').forEach((el) => {
        el.href = "/doctor-desk/slip-print";
      });
    };
    patch();
    const observer = new MutationObserver(patch);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}

export default function DoctorDeskLayout({ children }: { children: React.ReactNode }) {
  return <><DoctorDeskNavigationPatch />{children}</>;
}
