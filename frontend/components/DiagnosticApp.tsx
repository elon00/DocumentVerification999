import React from 'react';

export const DiagnosticApp: React.FC = () => {
  console.log('🔍 DiagnosticApp is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #1e293b, #7c3aed)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🚀 Diagnostic App Loading
      </h1>
      <div style={{ marginBottom: '1rem' }}>
        <p>✅ React is working</p>
        <p>✅ Component is rendering</p>
        <p>✅ CSS is loading</p>
        <p>⏳ Testing wallet connection...</p>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <p><strong>Diagnostic Info:</strong></p>
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>URL: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent.slice(0, 50)}...</p>
      </div>
    </div>
  );
};
