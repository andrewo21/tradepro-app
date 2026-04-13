"use client";

import Link from "next/link";
import { useResumeStore } from "@/app/store/useResumeStore";

export default function PersonalPage() {
  const personalInfo = useResumeStore((s) => s.personalInfo);
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-10">
      {/* Step Label */}
      <p className="text-sm text-neutral-500 mb-2">
        Step 2 of 7 — Personal Information
      </p>

      <h1 className="text-2xl font-semibold mb-6">Personal Information</h1>

      {/* Form */}
      <div className="grid grid-cols-2 gap-6 mb-10">

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.firstName}
            onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.lastName}
            onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Trade Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.tradeTitle}
            onChange={(e) => updatePersonalInfo("tradeTitle", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            spellCheck={true}
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.city}
            onChange={(e) => updatePersonalInfo("city", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            type="text"
            spellCheck={true}
            value={personalInfo.state}
            onChange={(e) => updatePersonalInfo("state", e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <Link
          href="/resume/select"
          className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-md text-sm hover:bg-neutral-300"
        >
          Back to Step 1
        </Link>

        <Link
          href="/resume/experience"
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Continue to Step 3
        </Link>
      </div>
    </div>
  );
}
