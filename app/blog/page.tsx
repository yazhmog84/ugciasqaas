// app/blog/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function BlogPage() {
  const posts = [
    { title: "Comment l'IA révolutionne le marketing UGC", date: "12 Fév 2026", cat: "Trends" },
    { title: "Guide: Créer une publicité TikTok qui convertit", date: "10 Fév 2026", cat: "Guide" },
    { title: "Mise à jour v2.0 : Nouveaux avatars disponibles", date: "05 Fév 2026", cat: "Product" },
    { title: "Pourquoi le coût par lead explose en 2026", date: "01 Fév 2026", cat: "Ads" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h1 className="text-4xl font-bold mb-4">Le Blog</h1>
             <p className="text-slate-400">Dernières actualités, astuces marketing et mises à jour produit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <Link key={i} href="#" className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition">
                <div className="h-48 bg-slate-900 group-hover:scale-105 transition duration-500"></div>
                <div className="p-6">
                  <div className="text-xs text-purple-400 font-bold mb-2 uppercase">{post.cat}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition">{post.title}</h3>
                  <p className="text-slate-500 text-sm">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}