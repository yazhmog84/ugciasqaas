import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-300">
      <Navbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4">
        {children}
      </main>
      <Footer />
    </div>
  )
}