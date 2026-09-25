import json

DIP_ADMISSION = "Successful completion of Year 12 or equivalent schooling such as a Certificate IV (KBS's published Diploma-level academic entry requirement)."
BACH_ADMISSION = "Successful completion of Year 12 (Minimum Australian Tertiary Admission Rank (ATAR) of 55) or equivalent schooling such as Certificate IV (KBS's published Bachelor-level academic entry requirement)."
GCGD_ADMISSION = "A Diploma (or AQF Level 5 equivalent course) plus a minimum of two years' relevant industry experience; alternatively, an Advanced Diploma or Associate Degree (AQF Level 6 equivalent) plus appropriate industry experience as determined by the Academic Dean."
MASTER_ADMISSION = "An Australian Bachelor Degree (or AQF Level 7 equivalent) in any discipline; alternatively, an Advanced Diploma or Associate Degree (AQF Level 6 equivalent) plus a minimum of two years' relevant industry experience."

DIP_ENGLISH = "IELTS Academic overall 5.5, with not less than 5.0 in Writing (KBS's published Diploma-level English entry requirement); equivalent PTE (46), TOEFL iBT (58, or 3.5 with a minimum 3.0 in all papers), or other approved test scores also accepted."
BACH_PG_ENGLISH = "IELTS Academic overall 6.0, with not less than 6.0 in Speaking and Writing and 5.5 in Listening and Reading (KBS's published Bachelor/Postgraduate English entry requirement)."

rows = {}

def add(name, description, curriculum, admission, english, source_url, cricos_code):
    rows[name] = dict(description=description, curriculum=curriculum, admission=admission, english=english, source_url=source_url, cricos_code=cricos_code)

# ---- Rows that already had real description+curriculum: keep as-is, add admission/english ----

add(
  "Bachelor of Business",
  None, None,  # keep existing description/curriculum
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-business", "067756B",
)
add(
  "Bachelor of Business (Accounting)",
  None, None,
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-business-accounting", "085958J",
)
add(
  "Bachelor of Business (Hospitality and Tourism Management)",
  None, None,
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-business-hospitality-and-tourism-management", "085961C",
)
add(
  "Bachelor of Business (Management)",
  None, None,
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-business-management", "085959G",
)
add(
  "Bachelor of Business (Marketing)",
  None, None,
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-business-marketing", "087660M",
)
add(
  "Graduate Diploma of Business Administration",
  None, None,
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-diploma-of-business-administration", "078566F",
)
add(
  "Master of Accounting",
  None, None,
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/master-of-accounting", "078568D",
)
add(
  "Master of Business Analytics (Information Technology)",
  None, None,
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/master-of-business-analytics-information-technology", "116554B",
)
add(
  "MBA (Health Services Management)",
  None, None,
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/mba-master-of-business-administration/health-services-management", "078565G",
)
add(
  "MBA (Project Management)",
  None, None,
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/mba-master-of-business-administration/project-management", "078565G",
)
add(
  "Master of Business Administration",
  None, None,
  None, None,  # already Bond-standard and genuinely verified real; leave untouched
  "https://www.kbs.edu.au/courses/mba-master-of-business-administration", "078565G",
)

# ---- Rows built fresh from live pages this sprint ----

add(
  "Bachelor of Information Technology",
  "Kaplan Business School's Bachelor of Information Technology runs across Adelaide, Brisbane, Melbourne, Perth and Sydney campuses and builds general IT competence in technical and business-management areas together, rather than treating them as separate strands. The degree opens with a shared Level 100 core covering IT fundamentals, professional communication in IT, Python programming, business information systems, database design, information networks, IT project management and cyber security, giving every graduate a working base in the areas KBS flags as growth areas: analytics and cyber security specifically. From Level 200 the structure narrows to one compulsory subject (Service and Operations Management in IT) with the rest drawn from an elective bank spanning data visualisation in R, AI and machine learning, UX and design thinking, digital forensics, and blockchain-focused content (a subject named simply Bitcoin). Level 300 keeps a single core subject, the IT Capstone, alongside further electives in machine learning applications, web and mobile development, advanced programming, algorithms and data structures, and penetration testing. Every IT-coded subject uses the TEC prefix; any non-TEC elective a student takes is drawn from the Bachelor of Business's own subject list, since KBS runs a shared interdisciplinary elective pool across its business and IT undergraduate degrees. IT students also get free membership of the Australian Computer Society for the duration of their studies.",
  "Level 100 core: Introduction to Information Technology (TEC100); Professional Practice and Communication in IT (TEC101); Programming in Python (TEC102); Information Systems in Business (TEC103); Database Design and Management (TEC104); Information Networks (TEC105); IT Project Management (TEC106); Cyber Security (TEC108)\nLevel 200 core: Service and Operations Management in IT (TEC207); electives include Data Visualisation in R, Artificial Intelligence and Machine Learning in IT, UX and Design Thinking, Digital Forensics, Bitcoin, Intermediate Programming\nLevel 300 core: IT Capstone (TEC307, final or penultimate trimester only); electives include Machine Learning Applications, Website Development, Mobile Development, Advanced Programming, Algorithms and Data Structures, Penetration Testing\nNon-TEC electives are drawn from the Bachelor of Business's shared subject list",
  BACH_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/bachelor-of-information-technology", "110277M",
)

add(
  "Diploma of Business",
  "Kaplan Business School markets its Diploma of Business as workable either as a stand-alone one-year qualification or as the first step into a Bachelor of Business, and the subject list is built to support both uses. The compulsory Level 100 core (business communication, introductory accounting, economics, commercial law and numerical analysis skills) is identical to the first year of every KBS Bachelor of Business variant, so credit transfers cleanly for students who go on to the Bachelor. Level 100 electives let students dip into business analytics, advanced business English, academic-success skills, or a first taste of IT (introduction to IT, Python programming, business information systems, database design, information networks). The Level 200 elective bank is the same shared pool used across KBS's Bachelor of Business majors, spanning accounting (financial accounting, accounting information systems, advanced financial accounting, management accounting), finance, hospitality and tourism operations, corporations law, management, and marketing, letting students sample a specialisation area before committing to it at Bachelor level. The course runs at Adelaide, Brisbane, Melbourne, Sydney and Perth.",
  "Level 100 core: Business Communication (BUS101); Introduction to Accounting (BUS103); Economics (BUS104); Commercial Law (BUS107); Skills for Numerical Analysis (BUS109)\nLevel 100 electives: Introduction to Business Analytics (BUS105); Skills for Advanced Business English (BUS110); Skills for Academic Success (BUS111); Introduction to Information Technology (TEC100); Professional Practice and Communication in IT (TEC101); Programming in Python (TEC102); Information Systems in Business (TEC103); Database Design and Management (TEC104); Information Networks (TEC105)\nLevel 200 electives (shared Bachelor of Business pool): Financial Accounting (ACC201); Accounting Information Systems (ACC202); Advanced Financial Accounting (ACC203); Management Accounting (ACC205); Skills for Workplace Success (BUS201); Quantitative Analysis (BUS208); Financial Institutions and Markets (FIN201); Corporate Finance (FIN203); The Hospitality and Tourism System (HAT201) plus Food and Beverage Operations, Technology and Innovation in Hospitality and Tourism, Accommodation Operations; Corporations Law (LAW204); Introduction to Management (MAN200), Organising People at Work (MAN201), Governance, Ethics and Sustainability (MAN202), Managing Projects (MAN204), Managing Operations (MAN205), People and Culture (MAN206); Marketing Principles (MKT200) plus Integrated Marketing Communications, Services Marketing, Omnichannel Marketing, Consumer Behaviour",
  DIP_ADMISSION, DIP_ENGLISH,
  "https://www.kbs.edu.au/courses/diploma-of-business", "086332B",
)

add(
  "Diploma of Information Technology",
  "The Diploma of Information Technology is KBS's one-year entry point into its IT catalogue, aimed at students who want a working grounding in technology and programming concepts before deciding whether to continue on to the Bachelor of Information Technology. Its subject list is exactly the Level 100 core shared with the Bachelor of IT: introductory IT concepts, professional practice and communication in an IT context, Python programming, business information systems, database design and management, information networks, IT project management and cyber security. There's no separate elective tier at Diploma level; graduates who continue into the Bachelor of Information Technology carry this full Level 100 block across as credit and move straight into the Bachelor's Level 200 content. The course runs at Adelaide, Brisbane, Melbourne, Perth and Sydney, and IT students get free Australian Computer Society membership while enrolled.",
  "Core subjects: Introduction to Information Technology (TEC100); Professional Practice and Communication in IT (TEC101); Programming in Python (TEC102); Information Systems in Business (TEC103); Database Design and Management (TEC104); Information Networks (TEC105); IT Project Management (TEC106); Cyber Security (TEC108)\nThis is the same Level 100 core used in KBS's Bachelor of Information Technology, allowing direct credit into that degree's Level 200 for students who continue",
  DIP_ADMISSION, DIP_ENGLISH,
  "https://www.kbs.edu.au/courses/diploma-of-information-technology", "110279J",
)

add(
  "Graduate Certificate in Accounting",
  "KBS's Graduate Certificate in Accounting is the shortest entry point into its accounting ladder, built from four subjects drawn straight out of the school's Master-level accounting core: financial accounting, management accounting, finance, and business and corporations law. It's aimed at building the framework and fundamental principles of the accounting profession alongside the basic statistical and numerical literacy skills needed for data analysis in economics and business, rather than attempting full professional-body coverage at this level (that comes with the longer Master of Accounting and Master of Professional Accounting). The course runs at Adelaide, Brisbane, Gold Coast, Melbourne, Sydney and Perth.",
  "Elective subjects (4, drawn from the shared Master-level accounting core): Financial Accounting (ACCM4000); Management Accounting (ACCM4100); Finance (FINM4000); Business and Corporations Law (CLWM4000)",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-certificate-in-accounting", "063299K",
)

add(
  "Graduate Certificate in Business Administration",
  "The Graduate Certificate in Business Administration is KBS's shortest postgraduate business qualification, built from the same four Level 400 core subjects that open the full MBA: People, Culture and Contemporary Leadership; Governance, Ethics and Sustainability; Financial and Economic Interpretation and Communication; and Consumer Behaviour and Marketing Psychology. KBS positions it for two overlapping audiences: working professionals wanting a fast credential boost, and recent undergraduate business graduates wanting a globally recognised postgraduate qualification without committing to the full MBA. The subject list sets the foundation for later MBA study (leadership of people, effective organisational culture, sustainability, consumer behaviour, financial data interpretation and business ethics) rather than a specific vocational track, and students who continue into the Graduate Diploma of Business Administration or the full MBA carry this block across as credit. Runs at Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney.",
  "Core subjects (all 4, shared with the MBA's own Level 400 core): People, Culture and Contemporary Leadership (MBA401); Governance, Ethics and Sustainability (MBA402); Financial and Economic Interpretation and Communication (MBA403); Consumer Behaviour and Marketing Psychology (MBA404)",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-certificate-in-business-administration", "078567E",
)

add(
  "Graduate Certificate in Business Analytics",
  "KBS's Graduate Certificate in Business Analytics is aimed squarely at people already working in business who want a faster, targeted upgrade to their analytics skills rather than a full postgraduate analytics degree. Its 3 core subjects (introduction to business analytics, data visualisation and communication, and quantitative methods) build the exploratory mindset the school markets as the qualification's outcome: the ability to methodically investigate business opportunities and communicate complex data findings to non-technical stakeholders. From there students choose electives from the same DATA-coded subject pool used across KBS's longer analytics qualifications, covering data acquisition and management, data security and ethics, forecasting, marketing and social media analytics, project management for analytics work, and AI/machine learning applications, plus a finance-specific analytics elective. Delivered at Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney.",
  "Core subjects: Introduction to Business Analytics (DATA4000); Data Visualisation and Communication (DATA4100); Quantitative Methods (STAM4000)\nElectives: Data Acquisition and Management (DATA4200); Data Security and Ethics (DATA4300); Data-driven Forecasting (DATA4400); Marketing and Social Media Analytics (DATA4500); Business Analytics Project Management (DATA4600); Artificial Intelligence and Machine Learning (DATA4800); Innovation and Creativity in Business Analytics (DATA4900); Analytics in Accounting and Finance (FINM4100)",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-certificate-in-business-analytics", "0100431",
)

add(
  "Graduate Certificate in Information Technology",
  "KBS's Graduate Certificate in Information Technology gives students who want to move into IT a compact 4-subject foundation: professional practice and communication in an IT context, Python programming, business information systems, and database design and management. It's built for career-changers as much as recent graduates, aiming to give a working base in technology-based approaches applicable across IT, communications, management and business roles, rather than a specialised technical track. Students who continue into the Graduate Diploma or Master of Information Technology carry this exact 4-subject block across as their own Level 400 core. Runs at Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney; IT students get free Australian Computer Society membership while enrolled.",
  "Core subjects (all 4, shared entry-level core with KBS's longer IT postgraduate qualifications): Professional Practice and Communication in IT (TECH1100); Programming in Python (TECH1200); Information Systems in Business (TECH1300); Database Design and Management (TECH1400)",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-certificate-in-information-technology", "110276A",
)

add(
  "Graduate Diploma of Business Analytics",
  "The Graduate Diploma of Business Analytics sits one tier above the Graduate Certificate in Business Analytics, built for students who want an entry-level career in the business analytics industry rather than just an analytics skills top-up. Its 6 core subjects go deeper into the technical and ethical side of the discipline: introduction to business analytics, data visualisation and communication, data acquisition and management, data security and ethics, quantitative methods, and a finance-specific analytics unit. From there, students choose from an elective pool covering forecasting, marketing and social media analytics, project management for analytics work, AI and machine learning, innovation in analytics, AI programming specifically, and an internship option for students wanting industry placement experience built into the course. Delivered at Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney.",
  "Core subjects (6): Introduction to Business Analytics (DATA4000); Data Visualisation and Communication (DATA4100); Data Acquisition and Management (DATA4200); Data Security and Ethics (DATA4300); Analytics in Accounting and Finance (FINM4100); Quantitative Methods (STAM4000)\nElectives: Data-driven Forecasting (DATA4400); Marketing and Social Media Analytics (DATA4500); Business Analytics Project Management (DATA4600); Artificial Intelligence and Machine Learning (DATA4800); Innovation and Creativity in Business Analytics (DATA4900); Artificial Intelligence Programming in Business Analytics (DATA5000); Internship (INTS4000)",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-diploma-of-business-analytics", "0100429",
)

add(
  "Graduate Diploma of Information Technology",
  "KBS's Graduate Diploma of Information Technology builds on the Graduate Certificate's 4-subject IT foundation with 4 more core subjects that push into networking, project management, IT operations and cyber security: information networks, IT project management, service and operations management in IT, and cyber security itself. The course is aimed at students who already have foundational IT skills (either from the Graduate Certificate or elsewhere) and want to move into more advanced computing areas before deciding whether to commit to the full Master of Information Technology, into which this 8-subject core carries across directly as credit. Delivery spans Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney; IT students receive free Australian Computer Society membership while enrolled.",
  "Core subjects (8): Professional Practice and Communication in IT (TECH1100); Programming in Python (TECH1200); Information Systems in Business (TECH1300); Database Design and Management (TECH1400); Information Networks (TECH2100); IT Project Management (TECH2200); Service and Operations Management in IT (TECH2300); Cyber Security (TECH2400)\nThis 8-subject core is the same Level 1-2 core used in KBS's Master of Information Technology",
  GCGD_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/graduate-diploma-information-technology", "110275B",
)

add(
  "Master of Information Technology (Extension)",
  "The Master of Information Technology (Extension) is KBS's longer, foundation-inclusive version of its IT master's degree, built for students who want the full Master of IT outcome but need or want the additional time and subject depth the Extension format provides. Structurally it carries the same 8-subject IT core as the standard Master of Information Technology (professional practice, Python programming, business information systems, database design, information networks, IT project management, service and operations management in IT, cyber security) plus a capstone, and then extends the elective pool considerably: data visualisation in R, AI and machine learning applied to IT, UX and design thinking, website and mobile development, penetration testing, digital forensics, a blockchain-focused elective (Bitcoin), intermediate and advanced programming, algorithms and data structures, quantitative methods, and an internship option. The course also allows MBA-coded electives (people/culture/leadership, governance/ethics, financial literacy, consumer behaviour, cultural intelligence) to be taken alongside the IT-specific units, and offers four specialisation tracks for students who want to focus their electives in a particular direction. Delivered at Adelaide, Brisbane, Gold Coast, Melbourne, Perth and Sydney; IT students get free Australian Computer Society membership while enrolled.",
  "Core subjects: Professional Practice and Communication in IT (TECH1100); Programming in Python (TECH1200); Information Systems in Business (TECH1300); Database Design and Management (TECH1400); Information Networks (TECH2100); IT Project Management (TECH2200); Service and Operations Management in IT (TECH2300); Cyber Security (TECH2400); IT Capstone (TECH8000, final or penultimate trimester only)\nElectives: Data Visualisation in R (TECH3100); Artificial Intelligence and Machine Learning in IT (TECH3200); Machine Learning Applications (TECH3300); UX and Design Thinking (TECH4100); Website Development (TECH4200); Mobile Development (TECH4300); Penetration Testing (TECH5100); Digital Forensics (TECH5200); Bitcoin (TECH5300); Intermediate Programming (TECH6100); Advanced Programming (TECH6200); Algorithms and Data Structures (TECH6300); Quantitative Methods (STAM4000); Internship (INTS4000); plus MBA-coded electives (MBA401-404, MBA502) and four IT specialisation tracks",
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/master-of-information-technology-extension", "110273D",
)

add(
  "Master of Professional Accounting",
  "The Master of Professional Accounting is KBS's internationally recognised accounting master's, built around the same 12-subject accounting core used in the Master of Accounting but without that degree's business-analytics emphasis, aimed instead squarely at a pathway toward professional accounting accreditation. The 12 core subjects cover financial accounting, management accounting, advanced financial accounting, financial reporting, auditing and assurance, accounting information systems, business and corporations law, taxation law, economics, finance, and quantitative methods, closing with a capstone in accounting and governance. KBS markets the course as carrying industry accreditation from professional accounting bodies, giving graduates a recognised path into the profession alongside the critical thinking, analytical and corporate governance skills the degree is built to develop. Runs at Adelaide, Brisbane, Gold Coast, Melbourne, Sydney and Perth.",
  "Core subjects (12): Financial Accounting (ACCM4000); Management Accounting (ACCM4100); Advanced Financial Accounting (ACCM4200); Financial Reporting (ACCM4300); Auditing and Assurance (ACCM4400); Information Systems in Accounting (CISM4000); Business and Corporations Law (CLWM4000); Taxation Law (CLWM4100); Economics (ECOM4000); Finance (FINM4000); Quantitative Methods (STAM4000); Capstone: Accounting and Governance (ACCM6000, final or penultimate trimester only)",
  MASTER_ADMISSION, BACH_PG_ENGLISH,
  "https://www.kbs.edu.au/courses/master-of-professional-accounting", "063297A",
)

with open("scripts/data/kbs_final_rows.json", "w") as f:
    json.dump(rows, f, indent=2)

print("wrote", len(rows), "rows")
