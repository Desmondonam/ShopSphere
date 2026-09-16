import { Component } from 'react'
import type { ErrorInfo, PropsWithChildren } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="mb-4 size-12 text-amber-500" />
          <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            An unexpected error occurred. Try reloading the page, and if the problem persists, contact support.
          </p>
          <Button className="mt-6" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
