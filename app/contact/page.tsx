"use client";

import { useState } from "react";
import Link from "next/link";

import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const COMPANY_EMAIL = "andrew@tradeprotech.ai";

  const generateMailtoLink = () => {
    const subject = encodeURIComponent("TradePro Support Request");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    return `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">

      

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto px-4 py-16">

          <h1 className="text-3xl font-semibold mb-6 text-center">
            Contact Us
          </h1>

          <p className="text-neutral-700 text-center mb-10 max-w-lg mx-auto">
            Have a question, need support, or want to leave feedback?  
            Fill out the form below and we’ll get back to you as soon as possible.
          </p>

          {/* FORM */}
          <div className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 space-y-6">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm h-32"
                placeholder="How can we help?"
              />
            </div>

            {/* SEND BUTTON */}
            <div className="text-center">
              <a
                href={generateMailtoLink()}
                className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-neutral-800"
              >
                Send Email
              </a>
            </div>

          </div>
        </div>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />

    </div>
  );
}
