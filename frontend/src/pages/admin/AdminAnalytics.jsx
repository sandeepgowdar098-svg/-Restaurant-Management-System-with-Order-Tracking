import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiBarChart2 } from 'react-icons/fi';

const COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#00B894', '#A29BFE', '#81ECEC'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    API.get('/orders/analytics').then(res => setAnalytics(res.data)).catch(() => {});
  }, []);

  if (!analytics) return (
    <div className="pulse" style={{ padding: 100, textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>Crunching Revenue Numbers...</p>
    </div>
  );

  const pieData = analytics.popularItems?.slice(0, 6).map(i => ({ name: i._id, value: i.totalOrdered })) || [];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 32 }}>
        <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Financial Insights</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Deep dive into your restaurant's performance metrics.</p>
      </div>

      <div className="dashboard-grid">
        {/* Revenue Growth Area Chart */}
        <div className="premium-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(108,92,231,0.1)', color: 'var(--primary)', marginBottom: 0 }}>
              <FiTrendingUp />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Revenue Growth (Daily)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyRevenue}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="_id" stroke="#6C6C80" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6C6C80" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                itemStyle={{ color: '#A29BFE' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6C5CE7" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popularity Distribution Pie */}
        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(0,206,201,0.1)', color: 'var(--accent)', marginBottom: 0 }}>
              <FiPieChart />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order Mix</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="premium-card" style={{ gridColumn: 'span 3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(253,203,110,0.1)', color: 'var(--warning)', marginBottom: 0 }}>
              <FiBarChart2 />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Monthly Performance Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="_id" stroke="#6C6C80" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6C6C80" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
