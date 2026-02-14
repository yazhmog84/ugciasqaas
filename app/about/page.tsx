// app/about/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Notre Mission</h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Démocratiser la création de contenu vidéo pour les entreprises de toutes tailles grâce à l'intelligence artificielle générative.
          </p>
        </div>

        <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
          <p>
            VideoUGC.ai est né d'un constat simple : produire du contenu UGC (User Generated Content) est lent, coûteux et imprévisible. Entre l'envoi des produits, le casting des créateurs et le montage, une seule vidéo peut prendre 3 semaines.
          </p>
          <p>
            Nous avons construit une technologie propriétaire capable de générer des acteurs virtuels indiscernables de la réalité, permettant aux marques de créer des milliers de variations de publicités en quelques minutes.
          </p>
          
          <h3 className="text-white mt-12 mb-6 text-2xl font-bold">L'équipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 not-prose">
             {[1, 2, 3].map((i) => (
               <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                 <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4"></div>
                 <div className="font-bold">Membre {i}</div>
                 <div className="text-sm text-slate-400">Co-founder</div>
               </div>
             ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}