import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="HumiPay logo"
              className="h-10 w-10 rounded-xl shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
            <span className="font-bold text-xl text-humi-warm">
              HumiPay
            </span>
          </Link>
          <nav className="text-sm">
            <Link to="/admin" className="text-gray-700 hover:text-humi-deep">
              ¿Eres admin?
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
