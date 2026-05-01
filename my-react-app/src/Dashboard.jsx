import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const BASE = "https://firstcry-backend1.onrender.com";

function PieChart({ orders }) {
  const delivered = orders.filter(o => o.orderStatus === "Delivered").length;
  const placed = orders.filter(o => o.orderStatus === "Placed").length;
  const cancelled = orders.filter(o => o.orderStatus === "Cancelled").length;
  const total = delivered + placed + cancelled || 1;
  const segments = [
    { label: "Delivered", val: delivered, color: "#1D9E75" },
    { label: "Placed", val: placed, color: "#EF9F27" },
    { label: "Cancelled", val: cancelled, color: "#E24B4A" },
  ];
  let angle = -Math.PI / 2;
  const paths = segments
    .filter(s => s.val > 0)
    .map(s => {
      const sweep = (s.val / total) * 2 * Math.PI;
      const x1 = 50 + 40 * Math.cos(angle);
      const y1 = 50 + 40 * Math.sin(angle);
      angle += sweep;
      const x2 = 50 + 40 * Math.cos(angle);
      const y2 = 50 + 40 * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      return (
        <path
          key={s.label}
          d={`M50,50 L${x1.toFixed(1)},${y1.toFixed(1)} A40,40 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
          fill={s.color}
          opacity={0.9}
        />
      );
    });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, flexShrink: 0 }}>
        {paths.length ? paths : <circle cx="50" cy="50" r="40" fill="#ddd" />}
      </svg>
      <div style={{ fontSize: 12 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--color-text-secondary)" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
            {s.label}: <strong>{s.val}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueBars({ orders }) {
  const last7 = [...orders].slice(0, 7).reverse();
  const max = Math.max(...last7.map(o => o.total || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
      {last7.map((o, i) => {
        const h = Math.round(((o.total || 0) / max) * 100);
        const lbl = o.orderDate
          ? new Date(o.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : "—";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <div
              title={`₹${o.total || 0}`}
              style={{ width: "100%", height: h, borderRadius: "3px 3px 0 0", background: "#e91e63", opacity: 0.85, minHeight: 4 }}
            />
            <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{lbl}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ orders }) {
  const last7 = [...orders].slice(0, 7).reverse();
  if (last7.length < 2) return null;
  const maxVal = Math.max(...last7.map(o => o.total || 0), 1);
  const pts = last7.map((o, i) => {
    const x = Math.round((i / (last7.length - 1)) * 480 + 10);
    const y = Math.round(80 - ((o.total || 0) / maxVal) * 70);
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ width: "100%", height: 120 }}>
      <polyline points={pts.join(" ")} fill="none" stroke="#e91e63" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",");
        return <circle key={i} cx={x} cy={y} r="3" fill="#e91e63" />;
      })}
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE}/admin/stats`);
      setStats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE}/admin/recent-orders`);
      setOrders(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
    const interval = setInterval(() => { fetchStats(); fetchOrders(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusClass = (s) => {
    if (s === "Delivered") return "s-delivered";
    if (s === "Placed") return "s-placed";
    return "s-cancelled";
  };

  return (
    <div className="dash">
      <div className="sidebar">
        <div className="sidebar-logo">FirstCry Admin</div>
        <div className="nav-item active">■ Dashboard</div>
        <div className="nav-item" onClick={() => navigate("/Addproducts")}>+ Add Product</div>
        <div className="nav-item" onClick={() => navigate("/Manageproducts")}>◈ Manage Products</div>
        <div className="nav-item" onClick={() => navigate("/Manageorder")}>◷ Manage Orders</div>
        <div className="nav-item" onClick={() => navigate("/Users")}>◉ Users</div>
      </div>

      <div className="dash-main">
        <div className="topbar">
          <h2>Dashboard</h2>
          <span className="badge">{time}</span>
        </div>

        <div className="stat-cards">
          <div className="card card-accent">
            <div className="card-label">Total Products</div>
            <div className="card-value">{stats.totalProducts ?? "—"}</div>
            <div className="card-sub">in catalogue</div>
          </div>
          <div className="card">
            <div className="card-label">Total Orders</div>
            <div className="card-value">{stats.totalOrders ?? "—"}</div>
            <div className="card-sub">all time</div>
          </div>
          <div className="card">
            <div className="card-label">Users</div>
            <div className="card-value">{stats.totalUsers ?? "—"}</div>
            <div className="card-sub">registered</div>
          </div>
          <div className="card">
            <div className="card-label">Revenue</div>
            <div className="card-value">
              {stats.totalRevenue != null ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "—"}
            </div>
            <div className="card-sub">total earnings</div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-box">
            <div className="chart-title">Revenue — last 7 orders</div>
            <RevenueBars orders={orders} />
          </div>
          <div className="chart-box">
            <div className="chart-title">Order status</div>
            <PieChart orders={orders} />
          </div>
        </div>

        <div className="chart-box" style={{ marginBottom: "1.5rem" }}>
          <div className="chart-title">Orders trend — last 7</div>
          <LineChart orders={orders} />
        </div>

        <div className="orders-table">
          <div className="tbl-section-title">Recent orders</div>
          <div className="tbl-head">
            <span>Order ID</span><span>Customer</span><span>Amount</span><span>Status</span>
          </div>
          <div>
            {orders.length === 0 && (
              <div className="tbl-row" style={{ gridTemplateColumns: "1fr", color: "var(--color-text-tertiary)" }}>
                No orders yet
              </div>
            )}
            {orders.slice(0, 10).map(o => (
              <div className="tbl-row" key={o._id}>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>#{String(o._id).slice(-6).toUpperCase()}</span>
                <span>{o.name || o.customerName || "—"}</span>
                <span>₹{Number(o.total || 0).toLocaleString("en-IN")}</span>
                <span><span className={`status-pill ${statusClass(o.orderStatus)}`}>{o.orderStatus || "—"}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
