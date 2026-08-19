import { ReactNode } from "react";

export default function InvestigationMasterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="investigation-premium-shell">
      <style>{`
        .investigation-premium-shell main {
          background: radial-gradient(circle at 8% 0%, rgba(11,99,206,.08), transparent 28%), radial-gradient(circle at 92% 8%, rgba(212,175,55,.08), transparent 24%), #f4f7fb !important;
          min-height: 100vh;
        }
        .investigation-premium-shell main > div { max-width: 1380px !important; }
        .investigation-premium-shell main > div > header {
          min-height: 78px; border-color: rgba(8,43,97,.10) !important; border-radius: 24px !important;
          background: rgba(255,255,255,.94) !important; box-shadow: 0 14px 38px rgba(8,43,97,.08) !important;
          backdrop-filter: blur(14px);
        }
        .investigation-premium-shell main > div > header h1 { font-size: 1.35rem; letter-spacing: -.025em; }
        .investigation-premium-shell main > div > header button { border-radius: 14px !important; box-shadow: 0 8px 20px rgba(8,43,97,.16) !important; }
        .investigation-premium-shell main > div > section { border-radius: 24px !important; }
        .investigation-premium-shell main > div > section:first-of-type {
          position: relative; overflow: hidden; min-height: 178px; padding: 32px 36px !important;
          box-shadow: 0 24px 60px rgba(8,43,97,.16) !important;
        }
        .investigation-premium-shell main > div > section:first-of-type:after {
          content: ""; position: absolute; width: 210px; height: 210px; right: -70px; top: -90px;
          border: 1px solid rgba(255,255,255,.16); border-radius: 50%;
          box-shadow: 0 0 0 28px rgba(255,255,255,.035), 0 0 0 58px rgba(255,255,255,.025); pointer-events: none;
        }
        .investigation-premium-shell main > div > section:nth-of-type(n+2) { box-shadow: 0 14px 38px rgba(8,43,97,.065) !important; }
        .investigation-premium-shell input, .investigation-premium-shell select {
          min-height: 46px; border-radius: 13px !important; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .investigation-premium-shell input:focus, .investigation-premium-shell select:focus { box-shadow: 0 0 0 3px rgba(11,99,206,.10); }
        .investigation-premium-shell table thead { background: #f7f9fc !important; }
        .investigation-premium-shell table tbody tr { transition: background .15s ease; }
        .investigation-premium-shell table tbody td { padding-top: 15px !important; padding-bottom: 15px !important; }
        .investigation-premium-shell table tbody tr:hover { background: #f8fbff !important; }
        @media (max-width:700px) {
          .investigation-premium-shell main { padding: 18px 14px !important; }
          .investigation-premium-shell main > div > section:first-of-type { padding: 24px !important; min-height: 160px; }
        }
      `}</style>
      {children}
    </div>
  );
}
