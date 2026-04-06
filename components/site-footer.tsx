import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e0dcd5] mt-24 pt-12 pb-8 bg-[#faf9f7]">
      <div className="mx-auto px-6 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <span className="font-serif text-xl font-bold text-[#1a1a1a]">Clinical to Code</span>
            <p className="text-sm text-[#6b6b6b] mt-2 leading-relaxed">
              Real perspectives from clinicians navigating healthcare technology.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/articles" className="text-[#1a1a1a] hover:text-primary transition-colors">Articles</Link></li>
              <li><Link href="/forum" className="text-[#1a1a1a] hover:text-primary transition-colors">Forum</Link></li>
              <li><Link href="/feed.xml" className="text-[#1a1a1a] hover:text-primary transition-colors">RSS Feed</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/community-guidelines" className="text-[#1a1a1a] hover:text-primary transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#e0dcd5] pt-6">
          <p className="text-xs text-[#6b6b6b]">
            &copy; {new Date().getFullYear()} Clinical to Code. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
