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
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          marginBottom: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>
            From ER Doctor to Epic Builder
          </h3>
          <p>How my emergency medicine background revolutionized our hospital's clinical decision support.</p>
          <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Read More →</a>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          marginBottom: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>
            The Hidden 47 Clicks
          </h3>
          <p>We shadowed clinicians for 100 hours and counted every click. The disconnect will shock you.</p>
          <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Read More →</a>
        </div>
      </main>

      <section style={{
        background: '#f8f9fa',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Get Clinical Insights Delivered</h2>
        <p style={{ marginBottom: '30px' }}>Join healthcare IT professionals getting weekly insights</p>
        <div>
          <input 
            type="email" 
            placeholder="Your email address" 
            style={{
              padding: '12px 20px',
              width: '300px',
              marginRight: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button style={{
            padding: '12px 30px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Subscribe
          </button>
        </div>
      </section>

      <footer style={{
        background: '#333',
        color: 'white',
        padding: '40px',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <p>© 2024 Clinical to Code. Where Healthcare Experience Meets IT Innovation</p>
      </footer>
    </div>
  )
}
