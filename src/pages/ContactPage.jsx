import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios'; 

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('https://tailorprobackend.onrender.com/api/contact', formData);
      
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-bg py-12 sm:py-16 md:py-20 min-h-[calc(100vh-80px)] font-sans w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark mb-3 sm:mb-4 tracking-tight"
          >
            We'd love to hear from you
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto px-2 sm:px-0"
          >
            Have questions about the Pro plan, need technical support, or want to share feedback? Send us a message below.
          </motion.p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Contact Details Panel */}
          {/* Adjusted padding: p-6 on mobile, sm:p-8 on tablet, md:p-12 on desktop */}
          <div className="bg-brand-dark text-white p-6 sm:p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Contact Information</h3>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light mt-1 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-400 text-xs sm:text-sm">Email Us</p>
                    <a href="mailto:oluwajuwonloadedayo69@gmail.com" className="text-sm sm:text-base lg:text-lg font-semibold hover:text-primary-light transition-colors break-all">
                      oluwajuwonloadedayo69@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-400 text-xs sm:text-sm">Call Us</p>
                    <a href="tel:+2348028655278" className="text-sm sm:text-base lg:text-lg font-semibold hover:text-primary-light transition-colors">
                      +234 802 865 5278
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-400 text-xs sm:text-sm">Headquarters</p>
                    <p className="text-sm sm:text-base lg:text-lg font-semibold">Oyo State, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 relative z-10 pt-6 sm:pt-8 border-t border-gray-800">
              <p className="text-[10px] sm:text-xs text-gray-400">Support Hours: Monday – Friday, 9am – 5pm WAT</p>
            </div>
          </div>

          {/* Contact Form */}
          {/* Adjusted padding: p-6 on mobile, sm:p-8 on tablet, md:p-12 on desktop */}
          <div className="p-6 sm:p-8 md:p-12 md:w-3/5">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-2">Message Sent Successfully!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4 sm:px-0">Thank you for reaching out. Our support team will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                
                {/* Error Message Display */}
                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 sm:gap-3 text-red-600 text-xs sm:text-sm font-bold">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Amina Bello"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="amina@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Message</label>
                  <textarea 
                    rows="4" 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 bg-primary text-white font-bold rounded-xl sm:rounded-2xl hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0 text-sm sm:text-base"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                  {!loading && <Send className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
