interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const SkipLink = ({ href, children, className }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium
        focus:z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-all duration-200
        ${className || ''}
      `}
      onClick={(e) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          (target as HTMLElement).focus()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
    >
      {children}
    </a>
  )
}