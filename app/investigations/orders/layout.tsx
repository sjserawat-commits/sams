export default function InvestigationOrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="investigation-orders-page">
      <style>{`
        .investigation-orders-page > main {
          background: #FDC823 !important;
          color: #082b61 !important;
        }
        .investigation-orders-page input::placeholder,
        .investigation-orders-page select,
        .investigation-orders-page option {
          color: #334155;
        }
      `}</style>
      {children}
    </div>
  );
}
