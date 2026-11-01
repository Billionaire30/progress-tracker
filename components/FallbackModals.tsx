"use client";

export function FallbackModals() {
  return (
    <>
      <div id="fallback-notifications-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Notifications</h2>
          <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
          <button onClick={() => { const el = document.getElementById('fallback-notifications-modal'); if (el) el.style.display = 'none'; }} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <div id="fallback-settings-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Settings</h2>
          <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
          <button onClick={() => { const el = document.getElementById('fallback-settings-modal'); if (el) el.style.display = 'none'; }} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <div id="fallback-shortcuts-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Keyboard Shortcuts</h2>
          <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
          <button onClick={() => { const el = document.getElementById('fallback-shortcuts-modal'); if (el) el.style.display = 'none'; }} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <div id="fallback-voice-modal" style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Voice Assistant</h2>
          <p style={{ color: '#666' }}>React is not loading. Please refresh the page.</p>
          <button onClick={() => { const el = document.getElementById('fallback-voice-modal'); if (el) el.style.display = 'none'; }} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.addEventListener('click', function(e) {
                const button = e.target.closest('[data-fallback-modal]');
                if (!button) return;
                const modalId = button.getAttribute('data-fallback-modal');
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'flex';
              }, true);
            })();
          `,
        }}
      />
    </>
  );
}
