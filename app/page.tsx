export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Home Health Automation MVP</h1>
        <p className="text-lg mb-8">
          Built with Next.js, PostgreSQL, n8n, and open-source tools
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Patient Management</li>
              <li>Document Processing (OCR)</li>
              <li>E-signature Integration</li>
              <li>EHR & EVV Adapters</li>
              <li>Workflow Automation (n8n)</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Quick Start</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Set up .env file</li>
              <li>Run database migrations</li>
              <li>Seed test data</li>
              <li>Start development server</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

