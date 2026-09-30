import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Scissors, ShoppingBag, CreditCard, CheckCircle2, ArrowRight, Star, ShieldCheck, Sparkles, Smartphone, Clock } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
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
    <div className="overflow-hidden bg-brand-bg font-sans relative w-full">
      
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Adjusted Background Blur for Mobile */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] sm:h-[600px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-7 text-center lg:text-left pt-8 sm:pt-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>The #1 Platform for Modern Fashion Houses</span>
            </div>
            
            {/* Scaled Typography for smaller screens */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-brand-dark tracking-tight mb-6 leading-[1.15] sm:leading-[1.1]">
              Manage Your Fashion Business. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light inline-block mt-2 sm:mt-0">
                Not Your Paperwork.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
              TailorPro helps tailors and fashion designers effortlessly track customers, precise body measurements, clothing orders, and payments from one unified dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-primary/30 flex items-center justify-center">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-dark border border-gray-200 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center">
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:space-x-6 text-xs sm:text-sm text-gray-500 font-medium">
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-status-success mr-1.5" /> Free forever plan</div>
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-status-success mr-1.5" /> 14-day Pro trial</div>
            </div>
          </motion.div>

          {/* Right Hero Visual Mockup */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="lg:col-span-5 relative mt-8 lg:mt-0 px-2 sm:px-0">
            <div className="relative mx-auto max-w-[340px] sm:max-w-md lg:max-w-none bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80" 
                alt="Fashion tailoring studio workflow" 
                className="rounded-2xl object-cover h-[280px] sm:h-[380px] w-full"
              />
              {/* Centered badge on mobile to prevent horizontal overflow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:-translate-x-0 sm:-left-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center space-x-3 w-[85%] sm:w-auto whitespace-nowrap">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-status-success/10 text-status-success rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0">₦</div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Monthly Revenue</p>
                  <p className="text-base sm:text-lg font-extrabold text-brand-dark">₦485,000</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-brand-dark text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-light mb-1">20,000+</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Measurements</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-light mb-1">99.9%</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Reliability</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-light mb-1">₦50M+</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Payments Tracked</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-light mb-1">4.9/5</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Satisfaction</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-16 sm:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark mb-4">Built specifically for fashion houses</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to move away from messy notebooks and run a professional tailoring brand.</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Users, title: 'Customer CRM', desc: 'Keep track of client phone numbers, addresses, birthdays, and complete order history.' },
              { icon: Scissors, title: 'Precise Measurements', desc: 'Store standard and custom measurement fields with instant history comparison.' },
              { icon: ShoppingBag, title: 'Order & Delivery', desc: 'Monitor outfit progress from Pending to Ready with automated status badges.' },
              { icon: CreditCard, title: 'Payment Tracking', desc: 'Calculate deposits and remaining balances automatically with zero errors.' }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="p-6 sm:p-8 bg-brand-bg rounded-3xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-brand-dark">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-16 sm:py-28 bg-brand-bg scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark mb-4">Simple, transparent pricing</h2>
            <p className="text-base sm:text-lg text-gray-600">Start free, upgrade when your fashion brand scales.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div variants={fadeInUp} className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-2">Free Plan</h3>
                <div className="flex items-baseline mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold">₦0</span>
                  <span className="text-gray-500 ml-2 text-sm sm:text-base">/forever</span>
                </div>
                <p className="text-gray-600 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100 text-sm sm:text-base">Ideal for new fashion designers and independent tailors starting out.</p>
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-sm sm:text-base">
                  <li className="flex items-center text-gray-700"><CheckCircle2 className="w-5 h-5 text-status-success mr-3 flex-shrink-0"/> Up to 20 customers</li>
                  <li className="flex items-center text-gray-700"><CheckCircle2 className="w-5 h-5 text-status-success mr-3 flex-shrink-0"/> Up to 30 orders/month</li>
                  <li className="flex items-center text-gray-700"><CheckCircle2 className="w-5 h-5 text-status-success mr-3 flex-shrink-0"/> Basic dashboard metrics</li>
                </ul>
              </div>
              <Link to="/register" className="block w-full py-3 sm:py-4 px-4 bg-gray-50 text-brand-dark border border-gray-200 text-center font-bold rounded-2xl hover:bg-gray-100 transition-colors">
                Start Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeInUp} className="bg-brand-dark p-6 sm:p-10 rounded-3xl shadow-2xl relative flex flex-col justify-between transform md:-translate-y-4 border border-gray-800 text-white mt-4 md:mt-0">
              <div className="absolute top-0 right-6 sm:right-8 bg-gradient-to-r from-primary to-primary-light text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-b-xl shadow-lg">RECOMMENDED</div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Pro Plan</h3>
                <div className="flex items-baseline mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold">₦3,500</span>
                  <span className="text-gray-400 ml-2 text-sm sm:text-base">/month</span>
                </div>
                <p className="text-gray-300 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-800 text-sm sm:text-base">For established fashion houses requiring unlimited capacity and advanced tools.</p>
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-sm sm:text-base">
                  <li className="flex items-center text-gray-200"><CheckCircle2 className="w-5 h-5 text-primary-light mr-3 flex-shrink-0"/> <strong>Unlimited</strong> customers & orders</li>
                  <li className="flex items-center text-gray-200"><CheckCircle2 className="w-5 h-5 text-primary-light mr-3 flex-shrink-0"/> Measurement history & comparison</li>
                  <li className="flex items-center text-gray-200"><CheckCircle2 className="w-5 h-5 text-primary-light mr-3 flex-shrink-0"/> PDF Invoices & Receipts</li>
                  <li className="flex items-center text-gray-200"><CheckCircle2 className="w-5 h-5 text-primary-light mr-3 flex-shrink-0"/> WhatsApp automated tools</li>
                </ul>
              </div>
              <Link to="/register" className="block w-full py-3 sm:py-4 px-4 bg-primary text-white text-center font-bold rounded-2xl hover:bg-primary-light transition-all shadow-lg shadow-primary/30">
                Start 14-Day Free Trial
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
