export default function Home() {
  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
        Clinical to Code
      </h1>
      
      <p style={{ fontSize: '20px', marginBottom: '40px' }}>
        From Bedside to Backend: Bridging Clinical Wisdom with IT Innovation
      </p>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Latest Articles</h2>
        <ul>
          <li>Why Your EHR is Failing Nurses</li>
          <li>From ER Doctor to Epic Builder</li>
          <li>The Hidden 47 Clicks</li>
        </ul>
      </div>
      
      <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <p>© 2024 Clinical to Code</p>
      </footer>
    </main>
  )
}
