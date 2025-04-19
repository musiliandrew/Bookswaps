import React from 'react';
import { MessageCircle, Lock, Book } from 'lucide-react';

export default function WhyBookSwapSection() {
  return (
    <section className="py-16 bg-beige-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brown-800 mb-4">Why BookSwap?</h2>
          <p className="text-lg text-brown-600 max-w-2xl mx-auto">
            Join our community of book lovers to exchange, discuss, and discover new reads.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Social Column */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="bg-teal-100 p-4 rounded-full">
                <MessageCircle size={32} className="text-teal-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-brown-800 mb-3">Social</h3>
            <p className="text-brown-600 mb-4">
              Connect with fellow readers, join book clubs, and share your literary journey with a community that shares your passion.
            </p>
          </div>
          
          {/* Secure Column */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="bg-teal-100 p-4 rounded-full">
                <Lock size={32} className="text-teal-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-brown-800 mb-3">Secure</h3>
            <p className="text-brown-600 mb-4">
              Our trusted platform ensures safe exchanges with verified members and transparent rating systems for peace of mind.
            </p>
          </div>
          
          {/* Simple Column */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-6">
              <div className="bg-teal-100 p-4 rounded-full">
                <Book size={32} className="text-teal-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-brown-800 mb-3">Simple</h3>
            <p className="text-brown-600 mb-4">
              Easy-to-use interface makes finding, exchanging, and tracking your books effortless, so you can focus on reading.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/signup" 
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
          >
            Get Started
            <svg 
              className="ml-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}