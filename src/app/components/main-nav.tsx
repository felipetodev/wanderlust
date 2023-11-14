import Link from 'next/link'
import { cn } from '../lib/utils'
import { GithubIcon } from 'lucide-react'

function MainNav ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="border-b">
      <div className="flex h-14 items-center px-8">
        <nav
          className={cn('flex items-center space-x-2 lg:space-x-2', className)}
          {...props}
        >
          <Link
            className="text-lg font-semibold transition-colors mr-2"
            href="/"
          >
            Colab-AI
          </Link>
        </nav>
        <a
          target='_blank'
          href='https://github.com/felipetodev/wanderlust'
          className='ml-auto'
          rel="noreferrer"
        >
          <GithubIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}

export default MainNav
