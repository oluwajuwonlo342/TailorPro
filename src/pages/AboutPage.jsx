import { motion } from 'framer-motion';
import { Target, Heart, Zap, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white font-sans w-full overflow-hidden">
      
      {/* Hero Header */}
      <section className="py-16 sm:py-20 md:py-28 bg-brand-bg border-b border-gray-100 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Our Story & Mission</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark mb-4 sm:mb-6 tracking-tight leading-tight"
          >
            Empowering fashion creators to <br className="block sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">scale globally.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2 sm:px-0"
          >
            TailorPro was born out of a simple vision: to eliminate administrative headaches so tailors and designers can focus purely on craftsmanship and artistry.
          </motion.p>
        </div>
      </section>

      {/* Visual Grid Section */}
      <section className="py-16 sm:py-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4 sm:mb-6">Why We Built TailorPro</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            The African fashion and bespoke tailoring industry is extraordinarily vibrant. Yet, master tailors lose countless hours searching through physical measurement notebooks and reconciling mismatched WhatsApp orders.
          </p>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            We built a lightning-fast, mobile-friendly platform that organizes every single client interaction into a seamless digital workflow.
          </p>
          <div className="space-y-3 sm:space-y-4">
            {['Bank-grade data security', 'Built for mobile & desktop', 'Designed with non-technical users in mind'].map((item, idx) => (
              <div key={idx} className="flex items-center text-sm sm:text-base text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-status-success mr-3 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative mt-8 md:mt-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" 
            alt="Fashion design creative studio" 
            className="rounded-3xl shadow-2xl object-cover h-[300px] sm:h-[400px] md:h-[450px] w-full"
          />
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 md:py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">The principles that drive every feature we engineer.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Zap, title: "Extreme Simplicity", desc: "Software should be invisible. We design interfaces so clean that anyone can use them without training." },
              { icon: Target, title: "Tailor-First", desc: "Every button and field is inspired by real conversations with professional fashion designers." },
              { icon: Heart, title: "Reliable Trust", desc: "Your client measurements and financial records are your livelihood. We keep them secure and backed up." },
              { icon: Award, title: "Uncompromising Quality", desc: "We believe professional tools empower you to command premium prices for your garments." }
            ].map((value, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700 p-6 sm:p-8 rounded-3xl hover:border-primary transition-colors">
                <value.icon className="w-7 h-7 sm:w-8 h-8 text-primary-light mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
