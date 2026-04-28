import { ModernBlueCoverLetter, TraditionalCoverLetter } from "./CoverLetterTemplates";

const SAMPLE_BLUE = {
  applicantName: "James Martinez",
  applicantEmail: "james.martinez@email.com",
  applicantPhone: "(555) 867-5309",
  applicantAddress: "1428 Elm Street",
  applicantCityStateZip: "Houston, TX 77001",
  date: "April 28, 2025",
  hiringManager: "Mr. Dave Thompson",
  companyName: "Thompson Industrial LLC",
  companyAddress: "900 Commerce Blvd",
  companyCityStateZip: "Houston, TX 77002",
  jobTitle: "Lead Electrician",
  letter: `Dear Mr. Thompson,\n\nWith over 12 years of hands-on experience in commercial and industrial electrical systems, I am confident in my ability to contribute immediately as your Lead Electrician. Throughout my career I have overseen panel installations, conduit runs, and full fit-outs on projects ranging from $500K to $4M, consistently delivering on time and within budget.\n\nI hold a Master Electrician license and OSHA 30 certification, and I take pride in building crews that operate safely and efficiently. My most recent role at Gulf Coast Electric saw me supervise a team of eight journeymen across three concurrent job sites while maintaining zero lost-time incidents over 18 months.\n\nI would welcome the opportunity to discuss how my background aligns with your needs.\n\nSincerely,\n\nJames Martinez`,
};

const SAMPLE_TRADITIONAL = {
  applicantName: "Sarah Chen",
  applicantEmail: "sarah.chen@email.com",
  applicantPhone: "(555) 234-5678",
  applicantAddress: "742 Pinecrest Drive",
  applicantCityStateZip: "Phoenix, AZ 85001",
  date: "April 28, 2025",
  hiringManager: "Ms. Linda Ortega",
  companyName: "Southwest Construction Group",
  companyAddress: "2200 N. Central Ave",
  companyCityStateZip: "Phoenix, AZ 85004",
  jobTitle: "Site Superintendent",
  letter: `Dear Ms. Ortega,\n\nI am writing to express my strong interest in the Site Superintendent position at Southwest Construction Group. With eight years of progressive experience managing ground-up commercial builds from foundation to certificate of occupancy, I bring the organizational rigor and field leadership your team requires.\n\nIn my current role I coordinate subcontractors, manage RFI and submittal logs, and ensure daily GC reporting is accurate and timely. My background in concrete, steel, and MEP coordination has prepared me to anticipate conflicts before they impact the schedule.\n\nThank you for your consideration. I look forward to speaking with you.\n\nSincerely,\n\nSarah Chen`,
};

export default function CoverLetterSamplePreview({ userId: _userId }: { userId: string }) {
  return (
    <div className="bg-neutral-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-2">Two Professional Styles</h2>
        <p className="text-neutral-500 text-center text-sm mb-10">
          Choose the look that fits your industry and personal style.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-neutral-600 mb-3 text-center uppercase tracking-wide">Modern Blue</p>
            <ModernBlueCoverLetter data={SAMPLE_BLUE} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-600 mb-3 text-center uppercase tracking-wide">Traditional Clean</p>
            <TraditionalCoverLetter data={SAMPLE_TRADITIONAL} />
          </div>
        </div>
      </div>
    </div>
  );
}
