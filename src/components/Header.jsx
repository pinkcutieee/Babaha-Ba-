import React, { useState, useEffect } from 'react';

const Header = ({ theme, onBack }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch readings when drawer opens
  const fetchReadings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/Babaha-Ba-/get_all_readings.php');
      const data = await response.json();
      setReadings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      fetchReadings();
      // Auto-refresh every 5 seconds while drawer is open
      const interval = setInterval(fetchReadings, 5000);
      return () => clearInterval(interval);
    }
  }, [isDrawerOpen]);

  // Accordion width
  const drawerWidth = "700px"; 

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: theme.header,
          padding: "20px 22px 16px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1 }}>
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              ← Bumalik
            </button>
          )}
        </div>

<div style={{ textAlign: "center" }}>
  <h1
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 900,
      fontSize: "32px",
      letterSpacing: "0.04em",
      color: theme.accentSoft,
      textShadow: `0 1px 3px ${theme.accent}`,
      margin: 0,
      lineHeight: 1.1,
    }}
  >
    Babaha ba?
  </h1>
</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <button className="back-btn" onClick={toggleDrawer}>
            Tignan ang history ng baha
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isDrawerOpen ? 0 : `-${drawerWidth}`,
          width: drawerWidth,
          height: '100vh',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1000,
          padding: '24px',
          color: '#333'
        }}
      >
        {/* For clean X button */}
        <button 
          onClick={toggleDrawer} 
          style={{ 
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',      
            outline: 'none',     
            background: '#f3f4f6',  
            cursor: 'pointer',
            fontSize: '16px',
            color: '#666',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.color = '#333'; }}
          onMouseLeave={(e) => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#666'; }}
        >
          ✕
        </button>
        
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #e0e0e0',
          color: '#2c3e50'
        }}>
           Reading History
        </h2>
        <div className="log-content" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <span style={{ fontSize: '24px' }}>⏳</span>
              <p style={{ marginTop: '10px' }}>Loading readings...</p>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: theme.header, color: '#fff', position: 'sticky', top: 0 }}>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>Date/Time</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', letterSpacing: '0.5px' }}>Water Level</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading, index) => {
                // Determine status color
                const getStatusStyle = (status) => {
                  const s = (status || '').toLowerCase();
                  if (s.includes('danger') || s.includes('critical')) {
                    return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' };
                  } else if (s.includes('warning') || s.includes('alert')) {
                    return { background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d' };
                  } else if (s.includes('safe') || s.includes('normal')) {
                    return { background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' };
                  }
                  return { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' };
                };
                const statusStyle = getStatusStyle(reading.alert_status);
                
                return (
                  <tr 
                    key={reading.id} 
                    style={{ 
                      background: index % 2 === 0 ? '#fff' : '#f9fafb',
                      borderBottom: '1px solid #eee',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f9fafb'}
                  >
                    <td style={{ padding: '12px', fontSize: '12px', color: '#555' }}>
                      {reading.date_detected}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#1e40af',
                        background: '#dbeafe',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {reading.distance_cm} cm
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        ...statusStyle
                      }}>
                        {reading.alert_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && readings.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', opacity: 0.3 }}>📭</span>
              <p style={{ color: '#999', marginTop: '10px' }}>No readings yet</p>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div 
          onClick={toggleDrawer}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default Header;