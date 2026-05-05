import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(BASE_URL + "/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(BASE_URL + "/admin/recent-orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ── Bar chart data: count orders per day of week ──
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach((o) => {
    if (o.createdAt) {
      const d = new Date(o.createdAt).getDay();
      dayCounts[d]++;
    }
  });
  const maxCount = Math.max(...dayCounts, 1);

  // ── Pie chart: Delivered, Pending, Cancelled ──
  const delivered  = orders.filter(o => o.orderStatus === "Delivered").length;
  const pending    = orders.filter(o => o.orderStatus === "Placed").length;
  const cancelled  = orders.filter(o => o.orderStatus === "Cancelled").length;
  const pieTotal   = delivered + pending + cancelled || 1;

  // Build SVG pie slices
  function buildPie() {
    const cx = 80, cy = 80, r = 70;
    const slices = [
      { value: delivered, color: "#ffb6c1", label: delivered },   // pink
      { value: cancelled, color: "#6a0dad", label: cancelled },   // purple
      { value: pending,   color: "#0000cd", label: pending   },   // blue
    ];
    let startAngle = -Math.PI / 2;
    return slices.map((s, i) => {
      if (s.value === 0) return null;
      const sweep = (s.value / pieTotal) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      startAngle += sweep;
      const x2 = cx + r * Math.cos(startAngle);
      const y2 = cy + r * Math.sin(startAngle);
      const large = sweep > Math.PI ? 1 : 0;
      // label position
      const midAngle = startAngle - sweep / 2;
      const lx = cx + (r * 0.65) * Math.cos(midAngle);
      const ly = cy + (r * 0.65) * Math.sin(midAngle);
      return (
        <g key={i}>
          <path
            d={`M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
            fill={s.color}
          />
          <text x={lx.toFixed(1)} y={ly.toFixed(1)} fontSize="12" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
            {s.label}
          </text>
        </g>
      );
    });
  }

  return (
    <div className="dash-wrapper">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Admin</h2>
        <ul className="sidebar-menu">
          <li className="active">Dashboard</li>
          <li onClick={() => navigate("/Addproducts")}>Add Product</li>
          <li onClick={() => navigate("/Manageproducts")}>Products</li>
          <li onClick={() => navigate("/Users")}>Users</li>
          <li onClick={() => navigate("/Manageorder")}>Orders</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="dash-main">
        <h1 className="dash-heading">Dashboard</h1>

        {/* Stat Cards */}
        <div className="cards-row">
          <div className="card card-blue">
            <p className="card-label">Orders</p>
            <p className="card-value">{stats.totalOrders || 0}</p>
          </div>
          <div className="card card-teal">
            <p className="card-label">Revenue</p>
            <p className="card-value">₹{stats.totalRevenue || 0}</p>
          </div>
          <div className="card card-pink">
            <p className="card-label">Users</p>
            <p className="card-value">{stats.totalUsers || 0}</p>
          </div>
          <div className="card card-green">
            <p className="card-label">Products</p>
            <p className="card-value">{stats.totalProducts || 0}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">

          {/* Bar Chart */}
          <div className="chart-box">
            <h3>Weekly Orders</h3>
            <div className="bar-chart">
              {/* Y axis labels */}
              <div className="y-axis">
                {[...Array(maxCount + 1)].map((_, i) => (
                  <span key={i}>{maxCount - i}</span>
                )).slice(0, 5)}
              </div>
              {/* Bars */}
              <div className="bars">
                {days.map((day, i) => (
                  <div className="bar-col" key={i}>
                    <div
                      className="bar"
                      style={{ height: `${(dayCounts[i] / maxCount) * 150}px` }}
                    ></div>
                    <span className="bar-label">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="chart-box">
            <h3>Store Overview</h3>
            <svg viewBox="0 0 160 160" width="180" height="180">
              {buildPie()}
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
