export default function Home() {
  return (
    <div>
      <header style={{
        background: 'white',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0066cc',
            textDecoration: 'none'
          }}>
            Clinical to Code
          </a>
          <div style={{ display: 'flex', gap: '30px' }}>
            <a href="#articles" style={{ color: '#333', textDecoration: 'none' }}>Articles</a>
            <a href="#about" style={{ color: '#333', textDecoration: 'none' }}>About</a>
            <a href="#contact" style={{ color: '#333', textDecoration: 'none' }}>Contact</a>
          </div>
        </nav>
      </header>

      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          From Bedside to Backend
        </h1>
        <p style={{ fontSize: '20px' }}>
          Bridging Clinical Wisdom with IT Innovation
        </p>
      </section>

      <main style={{
        maxWidth: '1200px',
        margin: '60px auto',
        padding: '0 20px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          marginBottom: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>
            Why Your EHR is Failing Nurses
          </h3>
          <p>After two decades at the bedside, here's what IT leaders need to understand about nursing workflows.</p>
          <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Read More →</a>
