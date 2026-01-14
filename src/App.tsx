import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader className="items-center px-8 pt-8 pb-4">
          <CardTitle className="text-2xl">Major Starter Template</CardTitle>
          <CardDescription className="mt-2">
            Your starting point for building with Major.
            <br />
            See the docs to get going.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center px-8 pb-8">
          <Button asChild>
            <a href="https://docs.major.build" target="_blank" rel="noreferrer">
              View Documentation
              <ExternalLink />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
