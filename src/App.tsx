import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 md:gap-4 group">
            <img
              src="/logo.png"
              alt="HumiPay logo"
              className="h-14 w-14 md:h-20 md:w-20 rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 bg-orange-50 p-1"
              loading="eager"
              decoding="async"
            />
            <span className="font-extrabold text-2xl md:text-3xl text-humi-warm leading-none">
              HumiPay
            </span>
          </Link>
          <nav className="text-sm md:text-base">
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

