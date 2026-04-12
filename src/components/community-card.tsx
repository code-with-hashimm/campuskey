"use client";

import Lottie from "lottie-react";
import animationData from "../../lottieflow-social-networks-15-11-000000-easey.json";

export default function CommunityCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex-shrink-0">
            <Lottie animationData={animationData} loop={true} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            Join CampusKey Official WhatsApp Group
          </h3>
        </div>

        <ul className="space-y-3 mb-6">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-emerald-500">✅</span> 
            <span>Collaborate with other students</span>
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-emerald-500">❓</span> 
            <span>Ask doubts</span>
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-emerald-500">🤝</span> 
            <span>Find friends</span>
          </li>
        </ul>

        <p className="text-xs text-gray-500">💁‍♀️ Girls most welcome.</p>
      </div>

      <div className="mt-6">
        <a 
          href="https://chat.whatsapp.com/invite/placeholder" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm shadow-green-200"
        >
          Join the Group Now
        </a>
      </div>
    </div>
  );
}
