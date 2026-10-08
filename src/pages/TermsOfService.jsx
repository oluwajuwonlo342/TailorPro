import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-700 selection:bg-primary/20 selection:text-primary">
      {/* Simple Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          <span className="text-xl font-black text-gray-900 tracking-tight">TailorPro</span>
        </Link>
        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Back to Home</Link>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12 sm:py-20">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 mb-12 font-medium">Last Updated: October 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">1. Introduction</h2>
          <p className="leading-relaxed mb-4">
            Welcome to TailorPro. By registering for an account or using our platform, you agree to be bound by these Terms of Service. TailorPro provides a digital management system (CRM) specifically designed for fashion houses, tailors, and designers to track measurements, orders, and payments.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">2. Account Registration and Subscriptions</h2>
          <ul className="list-disc pl-5 space-y-3 leading-relaxed">
            <li><strong>Free Tier:</strong> We offer a free plan with limited capacity (e.g., up to 20 customers and 30 orders/month). We reserve the right to modify the limits of the free tier at any time.</li>
            <li><strong>Pro Plan:</strong> Our premium tier is billed at ₦1,500 per month (or as otherwise stated). Payments are processed securely via third-party gateways. Subscriptions automatically renew unless canceled before the billing date.</li>
            <li><strong>Account Security:</strong> You are responsible for safeguarding your password and account data. TailorPro cannot be held liable for unauthorized access resulting from your failure to secure your credentials.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">3. Data Ownership and Responsibilities</h2>
          <p className="leading-relaxed mb-4">
            <strong>You own your data.</strong> All customer details, body measurements, and financial records you input into TailorPro remain your property. We merely act as a data processor providing the software to manage it. 
          </p>
          <p className="leading-relaxed mb-4">
            You are strictly responsible for obtaining the necessary consent from your clients before storing their personal data (such as phone numbers and physical measurements) on our platform.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">4. Limitation of Liability</h2>
          <p className="leading-relaxed mb-4">
            TailorPro provides software "as is." We are not responsible for any direct, indirect, or consequential business losses. Specifically, TailorPro is not liable for:
          </p>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Errors in data entry leading to incorrect tailoring measurements.</li>
            <li>Ruined fabrics, missed deadlines, or customer disputes.</li>
            <li>Temporary downtime or service interruptions due to maintenance or server issues.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">5. Termination</h2>
          <p className="leading-relaxed mb-4">
            We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent activities, or fail to pay subscription fees. Upon termination, your right to use the service will immediately cease, and your data may be permanently deleted after a standard retention period.
          </p>
        </section>

        <hr className="border-gray-200 my-10" />
        <p className="text-sm font-medium text-gray-500">
          If you have any questions about these Terms, please contact us at support@tailorpro.com.
        </p>
      </main>
    </div>
  );
};

export default TermsOfService;
