// lib/ats/roles/us_roles.ts
// Top 50 US job roles for ATS benchmarking.
// Trades & blue collar first, then healthcare/technical, then general.

interface RoleData { skills: string[]; tools: string[]; responsibilities: string[]; }

export const usRoleLibrary: Record<string, RoleData> = {

  // ── TRADES & BLUE COLLAR ─────────────────────────────────────────────────────

  "Electrician": {
    skills: ["electrical installation","blueprint reading","NEC code compliance","conduit bending","troubleshooting","OSHA 10/30","licensed electrician"],
    tools:  ["multimeter","wire stripper","conduit bender","voltage tester","AutoCAD","hand tools"],
    responsibilities: ["install electrical systems","troubleshoot wiring","read blueprints","ensure code compliance","run conduit","wire panels"],
  },
  "Plumber": {
    skills: ["pipe fitting","blueprint reading","plumbing codes","soldering","drain systems","backflow prevention","licensed plumber"],
    tools:  ["pipe wrench","pipe cutter","soldering torch","drain snake","pressure tester","hand tools"],
    responsibilities: ["install plumbing systems","repair leaks","read blueprints","inspect systems","troubleshoot drainage","comply with codes"],
  },
  "HVAC Technician": {
    skills: ["EPA 608 certification","refrigeration","installation","preventive maintenance","troubleshooting","sheet metal","load calculations"],
    tools:  ["refrigerant gauges","multimeter","vacuum pump","torch kit","sheet metal tools","HVAC software"],
    responsibilities: ["install HVAC systems","perform maintenance","diagnose issues","charge refrigerant","replace components","maintain service records"],
  },
  "Carpenter": {
    skills: ["framing","finish carpentry","blueprint reading","cabinet installation","trim work","safety compliance","OSHA 10"],
    tools:  ["circular saw","miter saw","nail gun","level","tape measure","hand tools","framing square"],
    responsibilities: ["frame structures","install finish work","read blueprints","build cabinets","hang doors","ensure structural integrity"],
  },
  "Welder": {
    skills: ["MIG welding","TIG welding","stick welding","blueprint reading","AWS certification","metal fabrication","quality inspection"],
    tools:  ["MIG welder","TIG welder","plasma cutter","angle grinder","welding helmet","measuring tools"],
    responsibilities: ["weld structural components","read blueprints","inspect welds","fabricate metal parts","maintain equipment","follow safety protocols"],
  },
  "Construction Superintendent": {
    skills: ["project scheduling","subcontractor management","budget control","safety management","OSHA 30","blueprint reading","quality control"],
    tools:  ["Procore","MS Project","Bluebeam","AutoCAD","scheduling software","budget tracking"],
    responsibilities: ["oversee daily operations","manage subcontractors","enforce safety","control budget","coordinate inspections","report to PM"],
  },
  "Construction Project Manager": {
    skills: ["project management","budget management","contract negotiation","scheduling","risk management","PMP certification","change order management"],
    tools:  ["Procore","MS Project","Primavera P6","Bluebeam","AutoCAD","cost management software"],
    responsibilities: ["manage project lifecycle","control costs","manage schedule","coordinate teams","negotiate contracts","report to stakeholders"],
  },
  "Foreman / Site Supervisor": {
    skills: ["crew supervision","safety enforcement","OSHA 10/30","scheduling","quality control","equipment operation","blueprint reading"],
    tools:  ["hand tools","power tools","scheduling boards","safety equipment","two-way radio"],
    responsibilities: ["supervise crew","enforce safety","coordinate daily tasks","inspect work quality","report progress","train new workers"],
  },
  "Pipefitter": {
    skills: ["pipe fitting","blueprint reading","welding","hydraulic systems","steam systems","OSHA compliance","rigging"],
    tools:  ["pipe wrench","pipe bender","welder","hydraulic tools","measuring instruments"],
    responsibilities: ["install piping systems","read isometric drawings","perform hydrostatic testing","weld pipe joints","maintain systems"],
  },
  "Sheet Metal Worker": {
    skills: ["sheet metal fabrication","blueprint reading","HVAC installation","soldering","plasma cutting","OSHA compliance"],
    tools:  ["plasma cutter","sheet metal brake","TIG welder","hand seamers","snips","measuring tools"],
    responsibilities: ["fabricate sheet metal components","install ductwork","read blueprints","measure and cut material","solder and seal joints"],
  },
  "Heavy Equipment Operator": {
    skills: ["excavator operation","bulldozer operation","crane operation","grade checking","safety compliance","OSHA certification","equipment maintenance"],
    tools:  ["excavator","bulldozer","grader","backhoe","crane","GPS grade control"],
    responsibilities: ["operate heavy machinery","grade sites","excavate foundations","maintain equipment logs","follow safety protocols"],
  },
  "CDL Truck Driver": {
    skills: ["CDL Class A","DOT compliance","pre-trip inspection","log books/ELD","defensive driving","cargo securement","HazMat (preferred)"],
    tools:  ["ELD device","GPS","semi-truck","trailer","straps and chains"],
    responsibilities: ["transport cargo safely","perform pre-trip inspections","maintain ELD logs","comply with DOT regulations","secure loads"],
  },
  "Diesel Mechanic": {
    skills: ["diesel engine repair","hydraulic systems","electrical diagnostics","preventive maintenance","CDL (preferred)","ASE certification"],
    tools:  ["diagnostic scanner","torque wrench","multimeter","hydraulic press","hand tools","lift equipment"],
    responsibilities: ["diagnose mechanical issues","perform engine overhauls","maintain service records","perform preventive maintenance","repair hydraulic systems"],
  },
  "Automotive Technician": {
    skills: ["ASE certification","diagnostic tools","engine repair","brake systems","electrical diagnostics","alignment","customer service"],
    tools:  ["OBD scanner","lift","torque wrench","alignment machine","multimeter","hand tools"],
    responsibilities: ["diagnose vehicle problems","perform repairs","conduct maintenance","communicate with customers","document work orders"],
  },
  "Maintenance Technician": {
    skills: ["preventive maintenance","electrical troubleshooting","plumbing","HVAC basics","blueprint reading","CMMS software","OSHA compliance"],
    tools:  ["multimeter","hand tools","power tools","CMMS system","testing equipment"],
    responsibilities: ["perform preventive maintenance","troubleshoot equipment failures","repair systems","document maintenance activities","ensure safety compliance"],
  },
  "Industrial Maintenance Mechanic": {
    skills: ["hydraulic systems","pneumatic systems","PLC basics","welding","machining","blueprint reading","predictive maintenance"],
    tools:  ["hydraulic tools","pneumatic tools","multimeter","welding equipment","precision measuring tools","CMMS"],
    responsibilities: ["maintain industrial machinery","troubleshoot breakdowns","perform PM schedules","rebuild components","support production uptime"],
  },
  "Warehouse Associate": {
    skills: ["forklift certification","order picking","inventory control","RF scanner","shipping and receiving","safety compliance","team collaboration"],
    tools:  ["forklift","pallet jack","RF scanner","WMS system","hand truck"],
    responsibilities: ["pick and pack orders","receive shipments","operate forklift","maintain inventory accuracy","follow safety procedures"],
  },
  "Facilities Manager": {
    skills: ["facilities management","vendor management","budget control","preventive maintenance","OSHA compliance","project management","CFM preferred"],
    tools:  ["CMMS","AutoCAD","MS Office","BMS systems","work order software"],
    responsibilities: ["manage building systems","oversee maintenance staff","manage vendors","control facilities budget","ensure safety compliance","plan capital projects"],
  },
  "Safety Manager / EHS": {
    skills: ["OSHA 30","safety program development","incident investigation","risk assessment","training delivery","OSHA compliance","CSP preferred"],
    tools:  ["safety management software","inspection checklists","incident reporting systems","PPE","training materials"],
    responsibilities: ["develop safety programs","conduct safety training","investigate incidents","perform site inspections","ensure regulatory compliance"],
  },
  "Construction Estimator": {
    skills: ["quantity takeoff","cost estimating","blueprint reading","bid preparation","vendor negotiation","Bluebeam","Excel"],
    tools:  ["Bluebeam","On-Screen Takeoff","RS Means","Excel","Procore","estimating software"],
    responsibilities: ["perform quantity takeoffs","prepare bid packages","solicit subcontractor bids","negotiate pricing","analyze scope documents","present estimates"],
  },

  // ── HEALTHCARE & TECHNICAL ────────────────────────────────────────────────────

  "Medical Assistant": {
    skills: ["patient care","vital signs","phlebotomy","EHR documentation","clinical procedures","HIPAA compliance","CMA certification"],
    tools:  ["EHR (Epic/Cerner)","phlebotomy equipment","vital signs monitors","medical instruments"],
    responsibilities: ["room patients","record vital signs","draw blood","assist with procedures","document in EHR","schedule appointments"],
  },
  "Certified Nursing Assistant": {
    skills: ["patient care","CNA certification","vital signs","ADL assistance","HIPAA compliance","CPR/BLS","documentation"],
    tools:  ["vital signs equipment","EHR","Hoyer lift","patient care supplies"],
    responsibilities: ["assist with daily living activities","monitor vital signs","document patient status","transport patients","communicate with nursing staff"],
  },
  "EMT / Paramedic": {
    skills: ["EMT-B/Paramedic certification","emergency response","patient assessment","BLS/ACLS","IV therapy","trauma care","documentation"],
    tools:  ["ambulance","defibrillator","oxygen equipment","IV supplies","patient care report software"],
    responsibilities: ["respond to emergencies","assess and treat patients","transport to hospital","document patient care","maintain equipment"],
  },
  "Pharmacy Technician": {
    skills: ["CPhT certification","prescription processing","medication dispensing","inventory management","insurance billing","HIPAA compliance","customer service"],
    tools:  ["pharmacy software","pill counter","automated dispensing system","labeling equipment"],
    responsibilities: ["fill prescriptions","process insurance claims","manage inventory","assist pharmacist","counsel customers on pickup"],
  },
  "IT Support Specialist": {
    skills: ["troubleshooting","Windows/Mac support","networking basics","Active Directory","ticketing systems","CompTIA A+","customer service"],
    tools:  ["ticketing system (ServiceNow/Jira)","remote desktop","Active Directory","Microsoft 365","networking tools"],
    responsibilities: ["resolve help desk tickets","troubleshoot hardware/software","set up workstations","manage user accounts","document solutions"],
  },
  "Network Technician": {
    skills: ["network installation","TCP/IP","routing and switching","cable management","CompTIA Network+","Cisco","troubleshooting"],
    tools:  ["Cisco equipment","cable tester","network analyzer","rack tools","documentation software"],
    responsibilities: ["install network infrastructure","configure switches and routers","troubleshoot connectivity","maintain network documentation","support end users"],
  },
  "Security Officer": {
    skills: ["security procedures","access control","surveillance","incident reporting","CPR/First Aid","security license","patrol"],
    tools:  ["access control system","surveillance cameras","incident report software","radio communication","metal detector"],
    responsibilities: ["patrol premises","monitor surveillance systems","respond to incidents","control access","write incident reports","enforce policies"],
  },
  "Firefighter": {
    skills: ["firefighting techniques","EMT/Paramedic","hazmat operations","rescue operations","fire prevention","physical fitness","team coordination"],
    tools:  ["fire apparatus","SCBA","Jaws of Life","thermal imaging camera","medical equipment"],
    responsibilities: ["respond to fire and medical emergencies","perform rescue operations","conduct fire prevention inspections","maintain equipment","train with crew"],
  },

  // ── GENERAL & WHITE COLLAR ────────────────────────────────────────────────────

  "Administrative Assistant": {
    skills: ["calendar management","Microsoft Office","data entry","communication","customer service","record keeping","multitasking"],
    tools:  ["Microsoft Office","Google Workspace","scheduling software","CRM","phone systems"],
    responsibilities: ["manage executive calendars","prepare documents","coordinate meetings","handle correspondence","maintain records","greet visitors"],
  },
  "Customer Service Representative": {
    skills: ["communication","problem solving","CRM software","active listening","de-escalation","product knowledge","data entry"],
    tools:  ["Salesforce","Zendesk","phone system","ticketing software","Microsoft Office"],
    responsibilities: ["handle customer inquiries","resolve complaints","process orders","update CRM records","meet service metrics","escalate issues"],
  },
  "Business Analyst": {
    skills: ["requirements gathering","process mapping","data analysis","stakeholder management","SQL","Agile/Scrum","documentation"],
    tools:  ["Jira","Confluence","SQL","Excel","Visio","Tableau","JIRA"],
    responsibilities: ["gather business requirements","document workflows","analyze data","facilitate stakeholder meetings","create process documentation","support UAT"],
  },
  "Project Manager": {
    skills: ["project planning","budget management","risk management","stakeholder communication","Agile","PMP certification","scheduling"],
    tools:  ["MS Project","Jira","Smartsheet","Asana","Excel","Confluence"],
    responsibilities: ["define project scope","manage budget and schedule","lead project team","communicate with stakeholders","manage risks","deliver on time"],
  },
  "Human Resources Generalist": {
    skills: ["recruiting","onboarding","employee relations","HRIS","benefits administration","employment law","performance management"],
    tools:  ["ATS (Workday/BambooHR)","HRIS","LinkedIn Recruiter","Excel","payroll software"],
    responsibilities: ["manage full-cycle recruiting","conduct onboarding","administer benefits","handle employee relations","maintain HR records","ensure compliance"],
  },
  "Accountant / Bookkeeper": {
    skills: ["accounts payable/receivable","bank reconciliation","financial reporting","GAAP","payroll","QuickBooks","Excel"],
    tools:  ["QuickBooks","SAP","Excel","financial reporting software","payroll systems"],
    responsibilities: ["manage AP/AR","reconcile accounts","prepare financial statements","process payroll","assist with audits","maintain general ledger"],
  },
  "Marketing Coordinator": {
    skills: ["content creation","social media management","SEO","email marketing","campaign management","Google Analytics","copywriting"],
    tools:  ["HubSpot","Mailchimp","Google Analytics","Canva","Meta Business Suite","WordPress"],
    responsibilities: ["create marketing content","manage social media","run email campaigns","track campaign performance","coordinate events","support marketing team"],
  },
  "Sales Representative": {
    skills: ["prospecting","cold calling","CRM management","negotiation","closing","product knowledge","quota attainment"],
    tools:  ["Salesforce","HubSpot","LinkedIn Sales Navigator","phone/video tools","Excel"],
    responsibilities: ["prospect new clients","manage sales pipeline","conduct product demos","negotiate contracts","achieve sales quotas","maintain CRM records"],
  },
  "Logistics / Warehouse Manager": {
    skills: ["warehouse operations","inventory management","team leadership","WMS","shipping and receiving","safety compliance","budget management"],
    tools:  ["WMS","ERP","forklift","RF scanner","Excel","inventory software"],
    responsibilities: ["manage warehouse operations","oversee inventory","lead warehouse team","coordinate shipping","ensure safety compliance","reduce costs"],
  },
  "Supply Chain Analyst": {
    skills: ["supply chain management","demand forecasting","vendor management","ERP systems","data analysis","SAP","Excel"],
    tools:  ["SAP","Oracle","Excel","Power BI","ERP systems","forecasting tools"],
    responsibilities: ["analyze supply chain data","forecast demand","manage vendor relationships","identify cost savings","optimize inventory","generate reports"],
  },
  "Data Analyst": {
    skills: ["SQL","Python/R","data visualization","Excel","statistical analysis","Tableau/Power BI","business intelligence"],
    tools:  ["SQL","Python","Tableau","Power BI","Excel","Google Analytics","Looker"],
    responsibilities: ["collect and analyze data","build dashboards","identify trends","present insights to stakeholders","maintain data quality","support decision making"],
  },
  "Software Developer": {
    skills: ["programming","version control","Agile/Scrum","unit testing","code review","CI/CD","problem solving"],
    tools:  ["Git","VS Code","Jira","Docker","AWS/Azure","REST APIs"],
    responsibilities: ["develop software features","write clean code","review code","fix bugs","participate in sprint planning","document technical solutions"],
  },
  "Graphic Designer": {
    skills: ["Adobe Creative Suite","typography","brand identity","print design","digital design","UI/UX basics","client communication"],
    tools:  ["Adobe Photoshop","Illustrator","InDesign","Figma","Canva"],
    responsibilities: ["create visual assets","develop brand materials","collaborate with marketing","prepare print files","present design concepts","revise based on feedback"],
  },
  "Real Estate Agent": {
    skills: ["real estate license","client relations","negotiation","MLS","contract management","prospecting","market knowledge"],
    tools:  ["MLS","Zillow","CRM","DocuSign","social media","email marketing"],
    responsibilities: ["represent buyers/sellers","conduct property showings","negotiate offers","prepare contracts","prospect new clients","coordinate closings"],
  },
  "Insurance Agent": {
    skills: ["insurance license","needs analysis","policy knowledge","prospecting","client service","cross-selling","compliance"],
    tools:  ["CRM","agency management software","quoting platforms","Microsoft Office"],
    responsibilities: ["assess client needs","recommend policies","process applications","service existing accounts","meet sales targets","maintain compliance"],
  },
  "Property Manager": {
    skills: ["lease management","tenant relations","maintenance coordination","budget management","property management software","fair housing compliance"],
    tools:  ["Yardi","AppFolio","MRI Software","Microsoft Office","maintenance platforms"],
    responsibilities: ["manage tenant relations","coordinate maintenance","process rent collection","market vacancies","enforce lease terms","report to owners"],
  },
  "Restaurant Manager": {
    skills: ["food service management","staff scheduling","inventory control","ServSafe","P&L management","customer service","vendor relations"],
    tools:  ["POS system","scheduling software","inventory management","Microsoft Office"],
    responsibilities: ["manage daily operations","hire and train staff","control food costs","ensure food safety compliance","handle customer complaints","achieve financial targets"],
  },
  "Retail Store Manager": {
    skills: ["retail operations","staff management","inventory management","visual merchandising","P&L management","customer service","loss prevention"],
    tools:  ["POS system","inventory software","scheduling software","Microsoft Office"],
    responsibilities: ["manage store operations","hire and train staff","meet sales targets","control shrinkage","ensure visual standards","report to district manager"],
  },
  "Teacher / Educator": {
    skills: ["lesson planning","classroom management","differentiated instruction","state standards alignment","assessment design","communication","technology integration"],
    tools:  ["Google Classroom","Canvas/Blackboard","Microsoft Teams","student information system","assessment tools"],
    responsibilities: ["deliver instruction","develop lesson plans","assess student progress","communicate with parents","maintain records","participate in professional development"],
  },
  "Social Worker / Case Manager": {
    skills: ["case management","crisis intervention","community resources","documentation","LCSW/LSW","motivational interviewing","cultural competency"],
    tools:  ["case management software","EHR","Microsoft Office","community resource databases"],
    responsibilities: ["assess client needs","develop service plans","connect clients to resources","document case notes","advocate for clients","collaborate with agencies"],
  },
};

/** Find US role data — exact match first, then keyword fallback */
export function findUSRoleData(profession: string | null | undefined): { role: string; data: RoleData } | null {
  if (!profession) return null;

  const pLower = profession.toLowerCase();

  // Exact match (case-insensitive)
  for (const [key, data] of Object.entries(usRoleLibrary)) {
    if (key.toLowerCase() === pLower) return { role: key, data };
  }

  // Partial match
  for (const [key, data] of Object.entries(usRoleLibrary)) {
    const kLower = key.toLowerCase();
    if (pLower.includes(kLower) || kLower.includes(pLower)) return { role: key, data };
  }

  // Keyword fallback
  const FALLBACKS: Array<{ keywords: string[]; role: string }> = [
    { keywords: ["electrician","electrical","wiring"],                role: "Electrician" },
    { keywords: ["plumber","plumbing","pipe"],                        role: "Plumber" },
    { keywords: ["hvac","refrigeration","air conditioning","cooling"], role: "HVAC Technician" },
    { keywords: ["carpenter","framing","woodwork","cabinet"],         role: "Carpenter" },
    { keywords: ["welder","welding","fabricat"],                      role: "Welder" },
    { keywords: ["superintendent","super","construction manager"],    role: "Construction Superintendent" },
    { keywords: ["project manager","project management","pm","program manager","project lead","sr. leader","senior leader","operations leader","project director"], role: "Construction Project Manager" },
    { keywords: ["foreman","supervisor","lead worker","crew lead"],   role: "Foreman / Site Supervisor" },
    { keywords: ["pipefitter","pipe fitter"],                        role: "Pipefitter" },
    { keywords: ["sheet metal","ductwork","duct"],                   role: "Sheet Metal Worker" },
    { keywords: ["equipment operator","excavator","bulldozer","crane operator"], role: "Heavy Equipment Operator" },
    { keywords: ["truck driver","cdl","driver","transport"],         role: "CDL Truck Driver" },
    { keywords: ["diesel","heavy truck mechanic"],                   role: "Diesel Mechanic" },
    { keywords: ["auto mechanic","automotive","car mechanic","vehicle tech"], role: "Automotive Technician" },
    { keywords: ["maintenance tech","maintenance mechanic","facility tech"], role: "Maintenance Technician" },
    { keywords: ["industrial mechanic","machine mechanic"],          role: "Industrial Maintenance Mechanic" },
    { keywords: ["warehouse","picker","packer","material handler","forklift"], role: "Warehouse Associate" },
    { keywords: ["facilities manager","facility manager","building manager"], role: "Facilities Manager" },
    { keywords: ["safety manager","ehs","safety officer","safety director"], role: "Safety Manager / EHS" },
    { keywords: ["estimator","cost estimating","quantity takeoff"],  role: "Construction Estimator" },
    { keywords: ["medical assistant","cma","clinical assistant"],    role: "Medical Assistant" },
    { keywords: ["cna","nursing assistant","patient care tech"],     role: "Certified Nursing Assistant" },
    { keywords: ["emt","paramedic","emergency medical"],             role: "EMT / Paramedic" },
    { keywords: ["pharmacy tech","pharm tech"],                     role: "Pharmacy Technician" },
    { keywords: ["it support","help desk","desktop support","tech support"], role: "IT Support Specialist" },
    { keywords: ["network tech","network admin","network engineer"], role: "Network Technician" },
    { keywords: ["security officer","security guard","loss prevention"], role: "Security Officer" },
    { keywords: ["firefighter","fire fighter","fire dept"],          role: "Firefighter" },
    { keywords: ["admin assistant","administrative","executive assistant","secretary"], role: "Administrative Assistant" },
    { keywords: ["customer service","call center","customer support"], role: "Customer Service Representative" },
    { keywords: ["business analyst","ba","systems analyst"],        role: "Business Analyst" },
    { keywords: ["hr","human resources","recruiter","talent"],      role: "Human Resources Generalist" },
    { keywords: ["accountant","bookkeeper","accounting","controller"], role: "Accountant / Bookkeeper" },
    { keywords: ["marketing","social media","content","digital marketing"], role: "Marketing Coordinator" },
    { keywords: ["sales","account executive","sales rep","bdm"],    role: "Sales Representative" },
    { keywords: ["logistics manager","warehouse manager","distribution"], role: "Logistics / Warehouse Manager" },
    { keywords: ["supply chain","procurement","purchasing"],         role: "Supply Chain Analyst" },
    { keywords: ["data analyst","analytics","business intelligence"], role: "Data Analyst" },
    { keywords: ["developer","software engineer","programmer","coder"], role: "Software Developer" },
    { keywords: ["graphic design","designer","creative","art director"], role: "Graphic Designer" },
    { keywords: ["real estate","realtor","agent","broker"],          role: "Real Estate Agent" },
    { keywords: ["insurance","underwriter","claims"],               role: "Insurance Agent" },
    { keywords: ["property manager","leasing","apartment manager"], role: "Property Manager" },
    { keywords: ["restaurant","food service","food and beverage"],  role: "Restaurant Manager" },
    { keywords: ["retail","store manager","retail manager"],        role: "Retail Store Manager" },
    { keywords: ["teacher","educator","instructor","professor"],    role: "Teacher / Educator" },
    { keywords: ["social worker","case manager","counselor","therapist"], role: "Social Worker / Case Manager" },
  ];

  for (const fb of FALLBACKS) {
    if (fb.keywords.some(kw => pLower.includes(kw))) {
      return { role: fb.role, data: usRoleLibrary[fb.role] };
    }
  }

  return null;
}
