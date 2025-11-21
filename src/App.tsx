import './App.css'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center font-sans">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Welcome to Major!
      </h1>
      <p className="text-lg text-gray-600">
        Visit{' '}
        <a 
          href="https://docs.major.build" 
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
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
