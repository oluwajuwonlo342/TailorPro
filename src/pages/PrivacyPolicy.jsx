import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 mb-12 font-medium">Last Updated: October 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed mb-4">We collect information in two main categories:</p>
          <ul className="list-disc pl-5 space-y-3 leading-relaxed">
            <li><strong>Account Data:</strong> Information you provide to create your TailorPro account (name, business name, email address, phone number, and subscription payment details).</li>
            <li><strong>Client Data:</strong> Information you input about your customers (names, phone numbers, body measurements, delivery addresses, and order histories).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="leading-relaxed mb-4">We use the collected information solely to provide and improve the TailorPro service:</p>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>To securely store and display your tailoring records, invoices, and measurements.</li>
            <li>To process your monthly Pro subscription payments.</li>
            <li>To send administrative emails (password resets, subscription updates).</li>
            <li>To facilitate automated features (like WhatsApp reminders or PDF generation) at your explicit request.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">3. Data Sharing and Third Parties</h2>
          <p className="leading-relaxed mb-4">
            <strong>We do not sell your data or your clients' data to advertisers.</strong> We only share data with trusted third-party service providers necessary to run the platform, such as:
          </p>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Secure cloud hosting providers (e.g., AWS, MongoDB Atlas).</li>
            <li>Payment processors (e.g., Paystack) to handle your subscription billing securely. We do not store your raw credit card numbers on our servers.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">4. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We use industry-standard security measures, including TLS/SSL encryption and hashed passwords, to protect your data. Because you store sensitive client body measurements and contact details, we prioritize database security. However, no internet transmission is 100% secure, and we cannot guarantee absolute security against unauthorized breaches.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">5. Your Data Rights</h2>
          <p className="leading-relaxed mb-4">
            You retain full control over your data. You may update, export, or permanently delete your client records at any time through your dashboard. If you wish to delete your entire TailorPro account and all associated data, you can do so by contacting support.
          </p>
        </section>

        <hr className="border-gray-200 my-10" />
        <p className="text-sm font-medium text-gray-500">
          If you have any questions regarding how we handle your privacy, please contact privacy@tailorpro.com.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
