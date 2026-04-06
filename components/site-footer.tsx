import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-20 pt-16 pb-8">
      <div className="mx-auto px-5 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="font-semibold text-lg">Clinical to Code</span>
            <p className="text-sm text-[#999999] mt-2">
              Bridging clinical expertise with healthcare IT.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-[#999999]">
              <li>
                <Link href="/articles" className="hover:text-white transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-white transition-colors">
                  Forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-[#999999]">
              <li>
                <Link href="/community-guidelines" className="hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#333333] pt-6">
          <p className="text-sm text-[#666666]">
            &copy; {new Date().getFullYear()} Clinical to Code. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
