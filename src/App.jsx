import { useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function App() {
  const [context, setContext] = useState('A: Hey!\nB: Hi, how are you?\nA: I\'m good, just finished work.')
  const [lastB, setLastB] = useState('Do you have any plans for tonight?')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const generate = async () => {
    setLoading(true)
    setReply('')
    try {
      const ctx = context.split('\n').filter(Boolean)
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx, last_message_from_b: lastB, max_new_tokens: 64, num_beams: 4 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')
      setReply(data.reply)
    } catch (e) {
      setReply(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const ping = async () => {
    try {
      const res = await fetch(`${API_BASE}/test`)
      const data = await res.json()
      setStatus(JSON.stringify(data))
    } catch (e) {
      setStatus('Backend not reachable')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.07),transparent_50%)]"></div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Offline Chat Reply Recommender</h1>
          <p className="text-blue-200 mt-3">Generate context-aware replies trained on two-person conversations.</p>
          <div className="mt-4 text-xs text-blue-300/80 break-all">Backend: {API_BASE || 'same origin'} <button onClick={ping} className="ml-3 px-2 py-1 text-xs rounded bg-blue-600/30 hover:bg-blue-600/40">Ping</button></div>
          {status && <div className="mt-2 text-xs text-blue-300/80">{status}</div>}
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Context (one turn per line)</h2>
            <textarea value={context} onChange={(e)=>setContext(e.target.value)} rows={10} className="w-full bg-slate-900/60 border border-slate-700 rounded p-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>

            <h3 className="font-semibold mt-4 mb-2">Last message from B</h3>
            <input value={lastB} onChange={(e)=>setLastB(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700 rounded p-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <button onClick={generate} disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition rounded py-2 font-medium">
              {loading ? 'Generating…' : 'Generate Reply'}
            </button>
          </div>

          <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Suggested reply</h2>
            <div className="min-h-[180px] bg-slate-900/60 border border-slate-700 rounded p-4 text-lg">
              {reply || <span className="text-blue-300/70">No output yet</span>}
            </div>

            <div className="mt-6 text-sm text-blue-300/80">
              Tip: Train your own model using the backend endpoint /api/train with JSONL files. Then set INFERENCE_MODEL_DIR to your saved folder and refresh.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
