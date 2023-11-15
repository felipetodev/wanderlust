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
          <a
            className="text-lg font-semibold transition-colors mr-2 hover:text-gray-500"
            href="https://www.colab-ai.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Colab-AI
          </a>
        </nav>
        <a
          className="ml-auto flex max-w-fit items-center justify-center space-x-2 font-semibold rounded-full border border-gray-300 px-3 py-1.5 text-xs sm:text-sm transition-colors hover:bg-gray-100 hover:text-gray-500"
          href="https://github.com/felipetodev/wanderlust"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon className='w-5 h-5' />
          <p>Star on GitHub</p>
        </a>
      </div>
    </div>
  )
}

export default MainNav
