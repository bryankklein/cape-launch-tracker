  export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Cape Launch Tracker
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Upcoming rocket launches from Cape Canaveral.
        </p>
      </main>
    );
  }