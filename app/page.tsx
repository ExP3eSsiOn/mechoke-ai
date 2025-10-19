export default function Home() {
    return (
      <main style={{padding: 24}}>
        <h1>MECHOKE AI Chat • Dev</h1>
        <p>Next.js รันสำเร็จแล้วครับ ✅</p>
        <ul>
          <li>API Webhook: <code>/api/line/webhook</code> (POST)</li>
          <li>Healthcheck: <code>/api/health</code> (GET)</li>
        </ul>
      </main>
    );
  }