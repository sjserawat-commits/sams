"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Master = {
  code: string;
  category: string;
  specimen: string | null;
  unit: string | null;
  referenceRange: string | null;
  method?: string | null;
  criticalValue?: string | null;
};

type Order = {
  id: number;
  investigation: string;
  status: string;
  specimen: string | null;
  accessionNumber: string | null;
  reportText: string | null;
  criticalFlag: boolean;
  master: Master | null;
  opdVisit: {
    id: number;
    tokenNumber: number;
    visitType: string;
    patient: {
      patientId: string;
      firstName: string;
      lastName: string;
      gender: string | null;
    };
  };
  workflow: {
    paymentStatus: string;
    outstandingAmount: number;
  };
};

type Queue = {
  key: string;
  patient: Order["opdVisit"]["patient"];
  visitId: number;
  token: number;
  orders: Order[];
};

type SummaryKey =
  | "patients"
  | "investigations"
  | "awaiting"
  | "accepted"
  | "collected"
  | "processing"
  | "ready"
  | "verified"
  | "published";

const stages = [
  "ORDERED",
  "APPROVED_FOR_SAMPLING",
  "ACCEPTED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "COMPLETED",
  "VERIFIED",
  "PUBLISHED",
];

const statusLabel = (status: string) =>
  ({
    ORDERED: "Order Placed",
    APPROVED_FOR_SAMPLING: "Approved for Sampling",
    ACCEPTED: "Order Accepted",
    SAMPLE_COLLECTED: "Sample Collected",
    PROCESSING: "In Processing",
    COMPLETED: "Result Ready",
    VERIFIED: "Report Verified",
    PUBLISHED: "Report Published",
  })[status] || status.replaceAll("_", " ");

export default function LabRoomPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState<SummaryKey | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filter !== "ALL") params.set("status", filter);
      const response = await fetch(`/api/investigation-room?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 180);
    return () => clearTimeout(timer);
  }, [query, filter]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "CANCELLED"),
    [orders],
  );

  const queues = useMemo<Queue[]>(() => {
    const map = new Map<string, Queue>();
    for (const order of activeOrders) {
      const patient = order.opdVisit.patient;
      const key = `${patient.patientId}-${order.opdVisit.id}`;
      const current = map.get(key);
      if (current) {
        current.orders.push(order);
      } else {
        map.set(key, {
          key,
          patient,
          visitId: order.opdVisit.id,
          token: order.opdVisit.tokenNumber,
          orders: [order],
        });
      }
    }
    return [...map.values()];
  }, [activeOrders]);

  const summary = useMemo(
    () => ({
      patients: queues.length,
      investigations: activeOrders.length,
      awaiting: activeOrders.filter(
        (o) => o.status === "ORDERED" || o.status === "APPROVED_FOR_SAMPLING",
      ).length,
      accepted: activeOrders.filter((o) => o.status === "ACCEPTED").length,
      collected: activeOrders.filter((o) => o.status === "SAMPLE_COLLECTED").length,
      processing: activeOrders.filter((o) => o.status === "PROCESSING").length,
      ready: activeOrders.filter((o) => o.status === "COMPLETED").length,
      verified: activeOrders.filter((o) => o.status === "VERIFIED").length,
      published: activeOrders.filter((o) => o.status === "PUBLISHED").length,
    }),
    [activeOrders, queues],
  );

  const summaryCards: Array<{
    key: SummaryKey;
    label: string;
    value: number;
    sub: string;
    tone: string;
  }> = [
    { key: "patients", label: "Total Patients", value: summary.patients, sub: "Active lab patients", tone: "navy" },
    { key: "investigations", label: "Total Investigations", value: summary.investigations, sub: "All active orders", tone: "gold" },
    { key: "awaiting", label: "Awaiting Sampling", value: summary.awaiting, sub: "Order / approval stage", tone: "amber" },
    { key: "accepted", label: "Order Accepted", value: summary.accepted, sub: "Accepted by laboratory", tone: "blue" },
    { key: "collected", label: "Sample Collected", value: summary.collected, sub: "Ready for processing", tone: "violet" },
    { key: "processing", label: "In Processing", value: summary.processing, sub: "Laboratory work in progress", tone: "purple" },
    { key: "ready", label: "Result Ready", value: summary.ready, sub: "Awaiting verification", tone: "green" },
    { key: "verified", label: "Report Verified", value: summary.verified, sub: "Ready for publication", tone: "teal" },
    { key: "published", label: "Report Published", value: summary.published, sub: "Final laboratory reports", tone: "dark" },
  ];

  function summaryOrders(key: SummaryKey) {
    if (key === "patients" || key === "investigations") return activeOrders;
    if (key === "awaiting") return activeOrders.filter((o) => o.status === "ORDERED" || o.status === "APPROVED_FOR_SAMPLING");
    if (key === "accepted") return activeOrders.filter((o) => o.status === "ACCEPTED");
    if (key === "collected") return activeOrders.filter((o) => o.status === "SAMPLE_COLLECTED");
    if (key === "processing") return activeOrders.filter((o) => o.status === "PROCESSING");
    if (key === "ready") return activeOrders.filter((o) => o.status === "COMPLETED");
    if (key === "verified") return activeOrders.filter((o) => o.status === "VERIFIED");
    return activeOrders.filter((o) => o.status === "PUBLISHED");
  }

  function patientKey(order: Order) {
    const patient = order.opdVisit.patient;
    return `${patient.patientId}-${order.opdVisit.id}`;
  }

  async function advance(order: Order, nextStatus: string, extra: Record<string, unknown> = {}) {
    setBusy(order.id);
    try {
      const response = await fetch("/api/investigation-room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: nextStatus, ...extra }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || "Unable to update laboratory workflow");
        return;
      }
      setEditId(null);
      setDraft("");
      await load();
    } finally {
      setBusy(null);
    }
  }

  function actionFor(order: Order) {
    const paid = order.workflow.outstandingAmount <= 0 || order.workflow.paymentStatus === "PAID";
    if (order.status === "ORDERED" && !paid) {
      return <button className="action amber" disabled={busy === order.id} onClick={() => void advance(order, "APPROVED_FOR_SAMPLING")}>Approve Sampling</button>;
    }
    if (order.status === "ORDERED" || order.status === "APPROVED_FOR_SAMPLING") {
      return <button className="action blue" disabled={busy === order.id} onClick={() => void advance(order, "ACCEPTED")}>Accept Order</button>;
    }
    if (order.status === "ACCEPTED") {
      return <button className="action blue" disabled={busy === order.id} onClick={() => void advance(order, "SAMPLE_COLLECTED", { specimen: order.specimen || order.master?.specimen || "Sample", sampleCollectedBy: "Laboratory" })}>Collect Sample</button>;
    }
    if (order.status === "SAMPLE_COLLECTED") {
      return <button className="action blue" disabled={busy === order.id} onClick={() => void advance(order, "PROCESSING")}>Start Processing</button>;
    }
    if (order.status === "PROCESSING") {
      return <button className="action ghost" onClick={() => { setEditId(order.id); setDraft(order.reportText || ""); }}>Manual Result</button>;
    }
    if (order.status === "COMPLETED") {
      return <button className="action green" disabled={busy === order.id} onClick={() => void advance(order, "VERIFIED", { verifiedBy: "Authorized Laboratory User" })}>Verify Report</button>;
    }
    if (order.status === "VERIFIED") {
      return <button className="action gold" disabled={busy === order.id} onClick={() => void advance(order, "PUBLISHED")}>Publish Report</button>;
    }
    return null;
  }

  const selectedQueue = queues.find((queue) => queue.key === selected) || null;
  const detail = summaryOpen ? summaryOrders(summaryOpen) : [];

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brandRow">
            <Link href="/investigations" className="action nav">← Investigation Dashboard</Link>
            <div className="logoBox"><img src="/serawat-logo.png" alt="Serawat logo" /></div>
            <div><p className="eyebrow">SAMS · Laboratory</p><p className="brandName">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p><h1>Lab Room</h1></div>
          </div>
          <button className="action refresh" onClick={() => void load()}>↻ Refresh</button>
        </header>

        {selectedQueue ? (
          <section className="profile">
            <header className="profileHead">
              <div>
                <button className="action nav" onClick={() => setSelected(null)}>← Queue</button>
                <p className="eyebrow">Patient Lab Profile</p>
                <h2>{selectedQueue.patient.firstName} {selectedQueue.patient.lastName}</h2>
                <p>{selectedQueue.patient.patientId} · Visit #{selectedQueue.visitId} · Token {selectedQueue.token}</p>
              </div>
              <div className="statDark"><b>{selectedQueue.orders.length}</b><span>Total Investigations</span></div>
            </header>
            <div className="profileBody">
              <div className="patientStats">
                <div><span>Patient ID</span><b>{selectedQueue.patient.patientId}</b></div>
                <div><span>Gender</span><b>{selectedQueue.patient.gender || "—"}</b></div>
                <div><span>Visit / Token</span><b>#{selectedQueue.visitId} / {selectedQueue.token}</b></div>
              </div>
              <h3>Investigation List</h3>
              <div className="orderList">
                {selectedQueue.orders.map((order) => {
                  const index = stages.indexOf(order.status);
                  return (
                    <article className="orderCard" key={order.id}>
                      <div className="orderTop">
                        <div>
                          <span className="pillDark">LAB #{order.id}</span>
                          <span className="status">{statusLabel(order.status)}</span>
                          <h4>{order.investigation}</h4>
                          <p className="muted">{order.master?.category || "Laboratory"} · Specimen: {order.specimen || order.master?.specimen || "—"} · Accession: {order.accessionNumber || "Pending"}</p>
                          <div className="bioGrid">
                            <div><span>Reference Value</span><b>{order.master?.referenceRange || "Not configured"}</b></div>
                            <div><span>Unit</span><b>{order.master?.unit || "—"}</b></div>
                            <div><span>Method / Critical</span><b>{order.master?.method || order.master?.criticalValue || "—"}</b></div>
                          </div>
                        </div>
                        <div className="actions">{actionFor(order)}{(order.status === "VERIFIED" || order.status === "PUBLISHED") && <Link className="action ghost" href={`/investigation-reports/${order.id}`}>View / Print</Link>}</div>
                      </div>
                      <div className="progress">{stages.map((stage, i) => <span key={stage} className={i <= index ? "on" : ""} />)}</div>
                      {editId === order.id && <div className="editor"><p className="label">Manual Result Entry</p><textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder="Enter laboratory result / findings…" /><div className="actions"><button className="action green" disabled={!draft.trim() || busy === order.id} onClick={() => void advance(order, "COMPLETED", { reportText: draft })}>Save &amp; Finalize Result</button><button className="action ghost" onClick={() => setEditId(null)}>Cancel</button></div></div>}
                      {order.reportText && <div className="result"><span>Current Result</span><p>{order.reportText}</p></div>}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <div className="layout">
            <section>
              <div className="hero"><p className="eyebrow">Laboratory Command Centre</p><h2>Patient Queue</h2><p>Cancelled investigations are excluded. Current laboratory status is shown directly on each patient profile.</p></div>
              <div className="filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient ID, name or laboratory investigation…" /><select value={filter} onChange={(e) => setFilter(e.target.value)}>{["ALL", ...stages, "CANCELLED"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <section className="queueGrid">
                {loading ? <div className="empty">Loading…</div> : queues.length === 0 ? <div className="empty">No active laboratory patients.</div> : queues.map((queue, index) => <button className="queue" key={queue.key} onClick={() => setSelected(queue.key)}><div className="queueTop"><div className="avatar">{queue.patient.firstName.charAt(0)}</div><span className="pillDark">QUEUE #{index + 1}</span></div><h3>{queue.patient.firstName} {queue.patient.lastName}</h3><p className="muted">{queue.patient.patientId} · Visit #{queue.visitId}</p><div className="miniGrid"><div><span>Queue No.</span><b>#{index + 1}</b></div><div><span>Total Investigations</span><b>{queue.orders.length}</b></div></div><span className="label">Current Status</span><div className="statusRow">{[...new Set(queue.orders.map((o) => o.status))].map((status) => <span className="status" key={status}>{statusLabel(status)}</span>)}</div><strong>Open Profile →</strong></button>)}
              </section>
            </section>

            <aside className="summaryPanel">
              <div className="summaryHeader"><div><p className="eyebrowDark">Live Laboratory Overview</p><h2>Lab Summary</h2><p>Click any card to open its detailed live report.</p></div><span className="live">LIVE</span></div>
              <div className="summaryGrid">{summaryCards.map((card) => <button key={card.key} className={`summaryCard ${card.tone}`} onClick={() => setSummaryOpen(card.key)}><span>{card.label}</span><b>{card.value}</b><small>{card.sub}</small><em>View detailed report →</em></button>)}</div>
            </aside>
          </div>
        )}
      </div>

      {summaryOpen && <div className="modalBackdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSummaryOpen(null); }}><section className="modal"><header><div><p className="eyebrow">Detailed Laboratory Report</p><h2>{summaryCards.find((c) => c.key === summaryOpen)?.label}</h2><p>Live records for this laboratory workflow category.</p></div><div className="actions"><span className="reportCount">{detail.length} records</span><button className="action close" onClick={() => setSummaryOpen(null)}>✕ Close</button></div></header><div className="reportStats"><div><span>Patients</span><b>{new Set(detail.map(patientKey)).size}</b></div><div><span>Investigations</span><b>{detail.length}</b></div><div><span>Paid / Cleared</span><b>{detail.filter((o) => o.workflow.paymentStatus === "PAID" || o.workflow.outstandingAmount <= 0).length}</b></div><div><span>Outstanding</span><b>₹{detail.reduce((sum, o) => sum + Number(o.workflow.outstandingAmount || 0), 0).toFixed(2)}</b></div></div><div className="tableWrap"><table><thead><tr><th>Patient</th><th>Visit / Token</th><th>Investigation</th><th>Status</th><th>Specimen / Accession</th><th>Payment</th><th>Result / Reference</th><th>Action</th></tr></thead><tbody>{detail.length === 0 ? <tr><td colSpan={8} className="emptyCell">No records in this category.</td></tr> : detail.map((order) => <tr key={order.id}><td><b>{order.opdVisit.patient.firstName} {order.opdVisit.patient.lastName}</b><small>{order.opdVisit.patient.patientId}</small></td><td>#{order.opdVisit.id}<small>Token {order.opdVisit.tokenNumber}</small></td><td><b>{order.investigation}</b><small>{order.master?.category || "Laboratory"}</small></td><td><span className="status">{statusLabel(order.status)}</span>{order.criticalFlag && <span className="critical">CRITICAL</span>}</td><td>{order.specimen || order.master?.specimen || "—"}<small>{order.accessionNumber || "No accession"}</small></td><td><b>{order.workflow.paymentStatus || "—"}</b><small>Outstanding ₹{Number(order.workflow.outstandingAmount || 0).toFixed(2)}</small></td><td><b>{order.reportText || "Result not entered"}</b><small>Ref: {order.master?.referenceRange || "Not configured"}</small></td><td><button className="action miniAction" onClick={() => { setSummaryOpen(null); setSelected(patientKey(order)); }}>Open Patient</button></td></tr>)}</tbody></table></div></section></div>}

      <style jsx>{`
        .page{min-height:100vh;background:#FDC823;color:#061a38;padding:20px 16px}.shell{max-width:1500px;margin:auto}.topbar,.hero,.profileHead{background:#031a38;color:#fff;border-radius:28px;box-shadow:0 18px 45px #3d2b0028}.topbar{padding:20px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brandRow{display:flex;align-items:center;gap:12px;min-width:0}.brandRow h1{margin:2px 0 0;font-size:22px;font-weight:900}.brandName{margin:0;font-size:13px;font-weight:900}.logoBox{width:46px;height:46px;border-radius:12px;background:#fff;padding:4px;flex:none}.logoBox img{width:100%;height:100%;object-fit:contain}.eyebrow,.eyebrowDark{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.23em}.eyebrow{color:#FDC823;margin:0 0 5px}.eyebrowDark{color:#8a6a00}.action{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border:0;border-radius:11px;padding:9px 13px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap}.action:disabled{opacity:.45;cursor:not-allowed}.nav{background:#061a38;color:#FDC823;border:1px solid #FDC823}.refresh,.close{background:#FDC823;color:#061a38}.layout{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:20px;align-items:start;margin-top:20px}.hero{padding:28px;margin-bottom:20px}.hero h2{font-size:32px;margin:0;font-weight:900}.hero p:last-child{margin:7px 0 0;color:#dbeafe;font-size:13px}.filters{display:flex;gap:10px;padding:14px;background:#fff8df;border:1px solid #d8b43e;border-radius:18px;margin-bottom:16px}.filters input,.filters select{border:1px solid #d6c27a;background:#fff;border-radius:11px;padding:12px;font-size:13px;font-weight:700;outline:none}.filters input{flex:1}.summaryPanel{background:#fff8df;border:1px solid #d8b43e;border-radius:28px;padding:18px;position:sticky;top:18px;box-shadow:0 14px 35px #3d2b0028}.summaryHeader{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.summaryHeader h2{margin:3px 0;font-size:25px;font-weight:900}.summaryHeader p:last-child{margin:0;color:#64748b;font-size:10px;font-weight:700}.live{background:#047857;color:#fff;border-radius:999px;padding:7px 10px;font-size:8px;font-weight:900;letter-spacing:.15em}.summaryGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.summaryCard{min-height:145px;text-align:left;border:1px solid #d8b43e;border-radius:18px;padding:13px;cursor:pointer;transition:.15s}.summaryCard:hover{transform:translateY(-2px);border-color:#061a38}.summaryCard span{display:block;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.summaryCard b{display:block;font-size:30px;margin-top:7px}.summaryCard small{display:block;color:#64748b;font-size:8px;font-weight:700}.summaryCard em{display:block;margin-top:10px;font-size:8px;font-style:normal;font-weight:900}.navy{background:#e9f0f9}.gold{background:#fff8df}.amber{background:#fff4cf}.blue{background:#eaf3ff}.violet{background:#f1edff}.purple{background:#f5ecff}.green{background:#e9f9f1}.teal{background:#e8faf7}.dark{background:#edf0f3}.queueGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.queue{border:1px solid #d8b43e;background:#fff8df;border-radius:22px;padding:18px;text-align:left;box-shadow:0 12px 30px #3d2b0020;cursor:pointer}.queue:hover{border-color:#061a38}.queue h3{margin:14px 0 2px;font-size:19px}.queue strong{display:block;text-align:right;margin-top:14px}.queueTop{display:flex;justify-content:space-between;align-items:center}.avatar{height:52px;width:52px;display:grid;place-items:center;border-radius:14px;background:#061a38;color:#FDC823;font-size:20px;font-weight:900}.pillDark,.status{display:inline-flex;border-radius:999px;padding:6px 9px;font-size:8px;font-weight:900}.pillDark{background:#061a38;color:#FDC823}.status{background:#fff;border:1px solid #b8a45d;color:#061a38}.muted{color:#64748b;font-size:9px;font-weight:700}.label{display:block;margin-top:12px;color:#64748b;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.miniGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.miniGrid div,.patientStats>div,.bioGrid>div,.reportStats>div{background:#fff;border:1px solid #eadb9d;border-radius:12px;padding:10px}.miniGrid span,.patientStats span,.bioGrid span,.reportStats span,.result>span{display:block;color:#64748b;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.miniGrid b,.patientStats b,.bioGrid b,.reportStats b{display:block;margin-top:3px}.statusRow{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.empty{background:#fff8df;border:1px solid #d8b43e;border-radius:18px;padding:30px;font-weight:800}.profile{margin-top:20px;background:#fff8df;border:1px solid #d8b43e;border-radius:28px;overflow:hidden}.profileHead{padding:20px;display:flex;justify-content:space-between;gap:15px}.profileHead h2{font-size:26px;margin:8px 0 2px}.profileHead p:last-child{font-size:10px;color:#dbeafe}.statDark{background:#ffffff18;border-radius:12px;padding:9px 14px;text-align:center;height:max-content}.statDark b{display:block;font-size:20px}.statDark span{font-size:7px;font-weight:900;text-transform:uppercase}.profileBody{padding:20px}.patientStats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.profileBody h3{font-size:18px;margin:0 0 10px}.orderList{display:grid;gap:12px}.orderCard{background:#fff;border:1px solid #eadb9d;border-radius:18px;padding:15px}.orderTop{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:15px}.orderTop h4{font-size:18px;margin:9px 0 2px}.actions{display:flex;flex-wrap:wrap;gap:7px;align-items:flex-start}.amber{background:#fff0b0;color:#5a4200;border:1px solid #d6a72f}.blue{background:#061a38;color:#fff}.green{background:#047857;color:#fff}.gold{background:#d6a443;color:#07111c}.ghost{background:#fff;border:1px solid #b8a45d;color:#061a38}.bioGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:13px}.progress{display:flex;gap:3px;margin-top:13px}.progress span{height:6px;flex:1;border-radius:99px;background:#d7c98d}.progress span.on{background:#061a38}.editor{margin-top:12px;padding:12px;border:1px solid #d8b43e;border-radius:14px;background:#fffdf3}.editor textarea{width:100%;border:1px solid #d6c27a;border-radius:10px;padding:10px;margin:7px 0;outline:none}.result{margin-top:10px;padding:10px;border:1px solid #eadb9d;border-radius:12px;background:#fffdf3}.result p{white-space:pre-wrap;margin:4px 0 0;font-size:12px}.modalBackdrop{position:fixed;inset:0;z-index:50;background:#031a38cc;display:flex;align-items:center;justify-content:center;padding:16px}.modal{width:100%;max-width:1400px;max-height:92vh;background:#fffdf3;border-radius:24px;overflow:hidden;display:flex;flex-direction:column}.modal>header{background:#031a38;color:#fff;padding:18px;display:flex;justify-content:space-between;gap:12px}.modal h2{margin:2px 0;font-size:24px}.modal header p:last-child{margin:0;color:#dbeafe;font-size:9px}.reportCount{background:#fff8df;color:#061a38;border:1px solid #d8b43e;border-radius:999px;padding:7px 9px;font-size:9px;font-weight:900}.reportStats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px;background:#fff8df}.tableWrap{overflow:auto;padding:14px}.tableWrap table{width:100%;min-width:1050px;border-collapse:collapse;background:#fff}.tableWrap th{background:#061a38;color:#fff;padding:11px;text-align:left;font-size:9px}.tableWrap td{padding:11px;border-bottom:1px solid #eee4c2;vertical-align:top;font-size:10px}.tableWrap td small{display:block;color:#64748b;font-size:8px;margin-top:3px}.critical{display:inline-flex;margin-left:4px;background:#991b1b;color:#fff;border-radius:999px;padding:4px 5px;font-size:7px;font-weight:900}.miniAction{background:#061a38;color:#fff;min-height:32px;padding:7px 9px}.emptyCell{text-align:center;padding:35px!important;color:#64748b;font-weight:800}
        @media (max-width:1100px){.layout{grid-template-columns:minmax(0,1fr) 340px}.queueGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.summaryGrid{grid-template-columns:1fr 1fr}}
        @media (max-width:800px){.layout{grid-template-columns:1fr}.summaryPanel{position:static}.queueGrid{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column}.filters{flex-direction:column}.orderTop{grid-template-columns:1fr}.patientStats,.bioGrid,.reportStats{grid-template-columns:1fr 1fr}}
        @media (max-width:520px){.summaryGrid,.patientStats,.bioGrid,.reportStats{grid-template-columns:1fr}.brandName{font-size:10px}.topbar{padding:14px}.hero h2{font-size:26px}}
      `}</style>
    </main>
  );
}
