function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Welcome to Major!
      </h1>
      <p className="text-lg text-muted-foreground">
        Visit{' '}
        <a
          href="https://docs.major.build"
          className="font-medium text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          https://docs.major.build
        </a>{' '}
        to view our documentation and start building.
      </p>
    </div>
  )
}

export default App
