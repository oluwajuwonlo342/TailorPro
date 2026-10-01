import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
// REMOVED: Instagram, Twitter, Facebook from lucide-react imports
import { Users, Scissors, ShoppingBag, CreditCard, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <div className="overflow-hidden bg-brand-bg font-sans relative w-full selection:bg-primary/20 selection:text-primary">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse duration-10000" />
        
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-7 text-center lg:text-left pt-8 sm:pt-0">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-primary/20 text-primary rounded-full text-xs sm:text-sm font-bold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Platform for Modern Fashion Houses</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-brand-dark tracking-tight mb-6 leading-[1.15] sm:leading-[1.1]">
              Manage Your Fashion Business. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary inline-block mt-2 sm:mt-0">
                Not Your Paperwork.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0 font-medium">
              TailorPro helps forward-thinking tailors and designers effortlessly track customers, body measurements, clothing orders, and payments from one unified dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black text-base hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-primary/30 flex items-center justify-center group">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-dark border border-gray-200 rounded-2xl font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center">
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider">
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Free forever plan</div>
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> 14-day Pro trial</div>
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> No credit card required</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5 relative mt-8 lg:mt-0 px-4 sm:px-0">
            <div className="relative mx-auto max-w-[340px] sm:max-w-md lg:max-w-none bg-white p-2.5 sm:p-4 rounded-[2rem] shadow-2xl border border-gray-100 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80" 
                alt="Fashion tailoring studio workflow" 
                className="rounded-3xl object-cover h-[300px] sm:h-[420px] w-full"
              />
              <div className="absolute -bottom-8 -left-4 sm:-bottom-6 sm:-left-8 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center space-x-4 animate-bounce-slow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0">₦</div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Monthly Revenue</p>
                  <p className="text-lg sm:text-xl font-black text-brand-dark">₦485,000</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-brand-dark text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-center relative z-10">
          <div>
            <h3 className="text-4xl sm:text-5xl font-black text-primary mb-2">20k+</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Measurements</p>
          </div>
          <div>
            <h3 className="text-4xl sm:text-5xl font-black text-primary mb-2">99%</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Reliability</p>
          </div>
          <div>
            <h3 className="text-4xl sm:text-5xl font-black text-primary mb-2">₦50M+</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Payments Tracked</p>
          </div>
          <div>
            <h3 className="text-4xl sm:text-5xl font-black text-primary mb-2">4.9/5</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Satisfaction</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark mb-5 tracking-tight">Built specifically for fashion houses</h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">Everything you need to move away from messy notebooks and run a professional, highly profitable tailoring brand.</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Users, title: 'Customer CRM', desc: 'Keep track of client phone numbers, addresses, birthdays, and complete order history.' },
              { icon: Scissors, title: 'Precise Measurements', desc: 'Store standard and custom measurement fields with instant history comparison.' },
              { icon: ShoppingBag, title: 'Order & Delivery', desc: 'Monitor outfit progress from Pending to Ready with automated status badges.' },
              { icon: CreditCard, title: 'Payment Tracking', desc: 'Calculate deposits and remaining balances automatically with zero manual errors.' }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm border border-gray-100 group-hover:border-primary">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3 text-brand-dark">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 sm:py-32 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark mb-5 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-base sm:text-lg text-gray-500 font-medium">Start for free, upgrade when your fashion brand scales.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* Free Plan */}
            <motion.div variants={fadeInUp} className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-gray-200">
              <h3 className="text-2xl font-black text-brand-dark mb-2">Free Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-black text-brand-dark">₦0</span>
                <span className="text-gray-500 font-bold ml-2">/forever</span>
              </div>
              <p className="text-gray-500 mb-8 pb-8 border-b border-gray-100 font-medium leading-relaxed">Ideal for new fashion designers and independent tailors just starting out.</p>
              
              <ul className="space-y-5 mb-10 font-bold text-gray-700">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0"/> Up to 20 customers</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0"/> Up to 30 orders/month</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0"/> Basic dashboard metrics</li>
              </ul>
              
              <Link to="/register" className="block w-full py-4 bg-gray-100 text-brand-dark text-center font-black rounded-2xl hover:bg-gray-200 transition-colors">
                Start Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeInUp} className="bg-brand-dark p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative md:-translate-y-6 border border-gray-800 text-white">
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">Most Popular</span>
              </div>
              
              <h3 className="text-2xl font-black mb-2 mt-4">Pro Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-black">₦3,500</span>
                <span className="text-gray-400 font-bold ml-2">/month</span>
              </div>
              <p className="text-gray-400 mb-8 pb-8 border-b border-gray-800 font-medium leading-relaxed">For established fashion houses requiring unlimited capacity and advanced client tools.</p>
              
              <ul className="space-y-5 mb-10 font-bold text-gray-200">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0"/> <strong>Unlimited</strong> customers & orders</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0"/> Secure public measurement links</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0"/> PDF Invoices & digital receipts</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0"/> Automated WhatsApp reminders</li>
              </ul>
              
              <Link to="/register" className="block w-full py-4 bg-primary text-white text-center font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                Start 14-Day Free Trial
              </Link>
            </motion.div>
            
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Scissors className="w-6 h-6 text-primary" />
              <span className="text-xl font-black text-brand-dark tracking-tight">TailorPro</span>
            </div>
            <p className="text-sm font-medium text-gray-500">© 2026 TailorPro. All rights reserved.</p>
          </div>
          
          {/* Replaced broken lucide imports with standard inline SVGs */}
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-brand-dark transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-dark transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-dark transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
