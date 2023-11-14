import Link from 'next/link'
import { AuthButtonServer } from './auth-button-server'
import { cn } from '../lib/utils'

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

          {/* <Link href='/' className={cn(buttonVariants({ size: 'sm' }), 'h-7 px-2')}>
            <HomeIcon className='w-4 h-4' />
          </Link> */}

        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <AuthButtonServer />
        </div>
      </div>
    </div>
  )
}

export default MainNav
