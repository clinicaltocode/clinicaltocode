export async function POST(request) {
  const { email } = await request.json()
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }
  
  try {
    // TODO: Integrate with your email service
    // Options: ConvertKit, Mailchimp, SendGrid, etc.
    
    // For now, save to a JSON file (replace with real service)
    const subscribersPath = path.join(process.cwd(), 'subscribers.json')
    let subscribers = []
    
    if (fs.existsSync(subscribersPath)) {
      const data = fs.readFileSync(subscribersPath, 'utf8')
      subscribers = JSON.parse(data)
    }
    
    // Check if already subscribed
    if (subscribers.some(sub => sub.email === email)) {
      return Response.json({ message: 'Already subscribed!' }, { status: 200 })
    }
    
    // Add new subscriber
    subscribers.push({
      email,
      date: new Date().toISOString(),
      source: 'website'
    })
    
    fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2))
    
    return Response.json({ message: 'Successfully subscribed!' }, { status: 200 })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
