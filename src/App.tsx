import { WeekView } from "@/components/WeekView"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-6">
        <h1 className="text-xl font-semibold">Vet Clinic — Book an Appointment</h1>
      </header>
      <main className="py-6">
        <WeekView />
      </main>
    </div>
  )
}

export default App
