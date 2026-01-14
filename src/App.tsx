import { Rocket, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Major!</CardTitle>
          <CardDescription>
            Build powerful applications with our resource clients and modern tooling.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
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
