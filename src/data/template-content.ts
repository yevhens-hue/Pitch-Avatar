import { SelectedElement } from '@/components/PresentationTemplates/Editor/TemplateEditor'

export interface SlideContent {
  id: number
  title: string   // Short label shown in sidebar & mini-preview
  elements: SelectedElement[]
}

export interface TemplateContent {
  templateId: string
  slides: SlideContent[]
}

// ── Slide builder helpers ─────────────────────────────────────────────────────

const title = (headline: string, sub: string): SelectedElement[] => [
  { id: 'bg', type: 'image', x: 0, y: 0, w: 960, h: 540 },
  { id: 'h1', type: 'bubble', x: 80, y: 160, w: 800, h: 110,
    content: `Title: ${headline}` },
  { id: 'sub', type: 'bubble', x: 80, y: 285, w: 680, h: 80,
    content: sub },
]

const content = (header: string, body: string): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  { id: 'body', type: 'bubble', x: 40, y: 116, w: 520, h: 390,
    content: body },
  { id: 'img', type: 'image', x: 576, y: 116, w: 344, h: 390 },
]

const bullets = (header: string, items: string[]): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  { id: 'list', type: 'bubble', x: 40, y: 116, w: 880, h: 390,
    content: items.map(b => `• ${b}`).join('\n\n') },
]

const twoCol = (header: string, left: string, right: string): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  { id: 'left', type: 'bubble', x: 40, y: 116, w: 420, h: 390,
    content: left },
  { id: 'right', type: 'bubble', x: 500, y: 116, w: 420, h: 390,
    content: right },
]

// ── Template content ──────────────────────────────────────────────────────────

export const MOCK_TEMPLATE_CONTENTS: Record<string, TemplateContent> = {

  // ── 1. Onboarding ──────────────────────────────────────────────────────────
  '1': {
    templateId: '1',
    slides: [
      {
        id: 1, title: 'Welcome',
        elements: title(
          'Welcome to the Team! 👋',
          'We\'re thrilled to have you here. This presentation will walk you through everything you need to know to hit the ground running in your first week.'
        ),
      },
      {
        id: 2, title: 'Our Mission & Values',
        elements: content(
          'Our Mission & Core Values',
          'Mission\nWe build tools that help teams communicate, collaborate, and grow — faster than ever before.\n\n🌟 Integrity — We do what we say.\n🚀 Innovation — We challenge the status quo every day.\n🤝 People First — Our team and customers always come first.\n🎯 Ownership — Every person owns their outcomes.'
        ),
      },
      {
        id: 3, title: 'Your First Week',
        elements: bullets(
          'Your First-Week Checklist',
          [
            'Day 1 — Set up laptop, accounts & access (IT will guide you)',
            'Day 1 — Meet your buddy, manager, and immediate team',
            'Day 2–3 — Complete security & compliance training modules',
            'Day 2–3 — Review team OKRs and current sprint goals',
            'Day 4–5 — Shadow a colleague and attend your first team stand-up',
            'By end of week — Schedule 1:1s with key stakeholders',
          ]
        ),
      },
      {
        id: 4, title: 'Tools & Systems',
        elements: twoCol(
          'Tools We Use Every Day',
          '📬 Communication\nSlack — instant messaging\nZoom — video calls\nEmail — external comms\n\n📋 Project Management\nJira — tasks & sprints\nConfluence — documentation\nNotion — team wikis',
          '🎨 Design & Product\nFigma — UI/UX design\nMiro — whiteboarding\n\n📊 Data & Analytics\nLooker — dashboards\nGoogle Analytics — web\n\n🔐 Security\nOkta — SSO & MFA\n1Password — passwords'
        ),
      },
      {
        id: 5, title: 'You\'re All Set!',
        elements: title(
          'You\'re All Set — Let\'s Build Something Great! 🚀',
          'Remember: no question is too small. Your manager and buddy are here to support you. We\'re glad you\'re here — now let\'s make an impact together.'
        ),
      },
    ],
  },

  // ── 2. Corporate Newsletter ────────────────────────────────────────────────
  '2': {
    templateId: '2',
    slides: [
      {
        id: 1, title: 'This Month\'s Edition',
        elements: title(
          'Company Newsletter — May 2026 📣',
          'Highlights, wins, team news, and what\'s coming next. Grab a coffee and catch up on everything that happened this month.'
        ),
      },
      {
        id: 2, title: 'CEO Message',
        elements: content(
          'A Message from Our CEO',
          'Team,\n\nThis month we crossed a milestone I\'m incredibly proud of: 10,000 active customers. None of this would be possible without each one of you.\n\nWe launched three major features, expanded to two new markets, and our NPS hit an all-time high of 72.\n\nAs we head into Q3, our focus sharpens on retention and enterprise expansion. More updates coming at next week\'s all-hands.\n\nThank you for everything.\n— Olena, CEO'
        ),
      },
      {
        id: 3, title: 'Key Wins This Month',
        elements: bullets(
          'May Highlights & Key Achievements',
          [
            '🏆 Crossed 10,000 active customers — a company milestone!',
            '🚀 Launched AI-powered analytics dashboard (v2.0)',
            '🌍 Expanded to German and Polish markets',
            '💼 Closed 3 enterprise contracts worth $1.2M ARR combined',
            '⭐ NPS score reached 72 — highest in company history',
            '🎉 Welcomed 12 new team members across Product, Eng & Sales',
          ]
        ),
      },
      {
        id: 4, title: 'Upcoming Events',
        elements: twoCol(
          'What\'s Coming in June',
          '📅 Key Dates\n\n📍 Jun 5 — All-Hands Meeting (Hybrid)\nQ2 results and Q3 roadmap reveal\n\n📍 Jun 12 — Hackathon\n48h to build anything you want — prizes for top 3 teams!\n\n📍 Jun 19 — Leadership Workshop\nFor team leads and senior ICs',
          '🎊 Celebrations\n\n🎂 Work anniversaries:\nAnna S. — 3 years\nMax T. — 1 year\n\n👶 New arrivals:\nCongrats to the Petrov family!\n\n🏅 Employee of the Month:\nMaria K. — Engineering\nFor shipping the analytics revamp ahead of schedule'
        ),
      },
      {
        id: 5, title: 'Until Next Month!',
        elements: title(
          'That\'s a Wrap — See You in June! 👋',
          'Questions or stories to share in next month\'s newsletter? Drop them in #newsletter on Slack. Together, we\'re building something special.'
        ),
      },
    ],
  },

  // ── 3. Product Presentation ────────────────────────────────────────────────
  '3': {
    templateId: '3',
    slides: [
      {
        id: 1, title: 'The Problem',
        elements: title(
          'Your Audience Stops Watching at Slide 3 😔',
          'Static presentations lose 70% of viewer attention in the first 2 minutes. Your message deserves better than a forgotten PDF.'
        ),
      },
      {
        id: 2, title: 'Introducing Pitch Avatar',
        elements: content(
          'Meet Pitch Avatar — Presentations That Talk Back',
          'Pitch Avatar turns your static slides into interactive AI-powered experiences that engage, qualify, and convert your audience — automatically.\n\n✅ Add an AI avatar that speaks your script in 40+ languages\n✅ Embed interactive widgets: polls, CTAs, calendars\n✅ Share via a single link — zero software required for viewers\n✅ Track every second of viewer attention in real time\n✅ Integrate directly with your CRM and marketing stack'
        ),
      },
      {
        id: 3, title: 'Key Features',
        elements: bullets(
          'What Makes Pitch Avatar Different',
          [
            '🤖 AI Avatars — realistic digital humans present your slides professionally',
            '🌍 Multilingual — auto-translate scripts into 40+ languages instantly',
            '📊 Live Analytics — track slide views, time spent, and drop-off points',
            '🔗 Smart Links — personalized URLs with lead capture and access controls',
            '🔌 CRM Integrations — sync with Salesforce, HubSpot, and Pipedrive',
            '⚡ 2-Minute Setup — upload PDF/PPTX and publish in under 2 minutes',
          ]
        ),
      },
      {
        id: 4, title: 'Social Proof',
        elements: twoCol(
          'Trusted by 10,000+ Teams Worldwide',
          '"Pitch Avatar increased our demo-to-close rate by 34% in the first quarter. Our SDRs now send interactive presentations instead of static PDFs."\n— Sarah K., VP Sales at TechCorp\n\n"We replaced 3 tools with Pitch Avatar. One link does everything: presents, qualifies leads, and books meetings."\n— Marco L., Head of Marketing at ScaleUp',
          '📈 By the Numbers\n\n3x more viewer engagement vs static slides\n\n+34% demo-to-close rate for sales teams\n\n70% reduction in time spent on follow-ups\n\n10,000+ active users across 45 countries\n\n⭐ 4.8/5 on G2 and Capterra'
        ),
      },
      {
        id: 5, title: 'Get Started Today',
        elements: title(
          'Start Your Free Trial — No Credit Card Required 🎯',
          'Join 10,000+ teams already using Pitch Avatar. Try it free for 14 days and see your first AI-powered presentation live in under 5 minutes.'
        ),
      },
    ],
  },

  // ── 4. Sales Presentation & Deal Qualification ────────────────────────────
  '4': {
    templateId: '4',
    slides: [
      {
        id: 1, title: 'Opening — Are We a Match?',
        elements: title(
          'Let\'s Find Out If We\'re a Perfect Match 🤝',
          'This is a two-way conversation. We\'ll share what we do — and we want to understand your challenges so we can be honest about fit.'
        ),
      },
      {
        id: 2, title: 'Understanding Your Challenges',
        elements: content(
          'What We Hear From Teams Like Yours',
          'Most of our customers come to us with one of these problems — do any of these sound familiar?\n\n❌ "Our sales decks are static — prospects don\'t engage after we send them."\n\n❌ "We have no visibility into what happens after we hit Send on a proposal."\n\n❌ "Our team spends 3+ hours per deal customizing presentations manually."\n\n❌ "We can\'t tell which leads are hot — we follow up with everyone equally."\n\nIf even one of these resonates, we need to talk.'
        ),
      },
      {
        id: 3, title: 'Why Teams Choose Us',
        elements: bullets(
          'Why 10,000+ Sales Teams Chose Pitch Avatar',
          [
            '📈 34% higher close rates — prospects who interact with AI presentations convert faster',
            '⏱ 80% less time on deck prep — templates + AI script generation do the heavy lifting',
            '🔥 Real-time buyer intent signals — know the moment a prospect opens your link',
            '🌍 Multi-language by default — present in the prospect\'s native language automatically',
            '🔌 Zero disruption to workflow — plugs into your existing CRM and email tools',
          ]
        ),
      },
      {
        id: 4, title: 'Case Study',
        elements: content(
          'How TechCorp Grew Pipeline 3x in One Quarter',
          'The Challenge\nTechCorp\'s SDRs were sending static PDFs. Open rates were low, engagement was impossible to measure, and follow-ups were guesswork.\n\nWhat We Did\n→ Replaced all outbound decks with interactive Pitch Avatar presentations\n→ Set up AI avatar in the VP\'s likeness for personalized outreach\n→ Connected to Salesforce for automatic lead scoring\n\nThe Results (90 days)\n✅ 3x increase in qualified pipeline\n✅ 45% more demo bookings from cold outreach\n✅ 60% reduction in time-to-proposal'
        ),
      },
      {
        id: 5, title: 'Proposed Next Steps',
        elements: twoCol(
          'Recommended Next Steps',
          '✅ What We\'ve Covered\n\nYour current challenges around engagement and pipeline visibility\n\nHow Pitch Avatar solves each of them\n\nProof from a comparable customer (TechCorp)\n\nROI timeline (typically 6–8 weeks to first measurable results)',
          '🗓 Suggested Next Steps\n\n1. Technical Deep-Dive (45 min)\nInvolve your sales ops + IT lead\n\n2. Pilot Agreement\n5 reps, 30 days, success metrics agreed upfront\n\n3. Executive Briefing\nPresent ROI model to your VP of Sales\n\nShall we find time this week for the technical session?'
        ),
      },
    ],
  },

  // ── 5. AI HR Assistant ────────────────────────────────────────────────────
  '5': {
    templateId: '5',
    slides: [
      {
        id: 1, title: 'Meet Your AI HR Assistant',
        elements: title(
          'Meet Alex — Your AI HR Assistant 🤖',
          'Alex handles routine HR queries, guides employees through processes, and frees your HR team to focus on what only humans can do: building culture and developing people.'
        ),
      },
      {
        id: 2, title: 'What Alex Can Do',
        elements: bullets(
          'Alex Handles These Requests — Instantly, 24/7',
          [
            '📋 Policy Q&A — "How many sick days do I have?" answered in seconds',
            '📅 Leave requests — submit, approve, and track PTO without HR involvement',
            '🎯 Onboarding guidance — step-by-step checklists for new hires',
            '💰 Payroll inquiries — payslip explanations and tax document retrieval',
            '🏆 Performance cycles — reminders, form links, and deadline tracking',
            '📚 Training enrollment — recommend and register employees for L&D programs',
          ]
        ),
      },
      {
        id: 3, title: 'Integrations',
        elements: twoCol(
          'Alex Connects to Your Existing HR Stack',
          '🔌 HRIS Systems\nWorkday\nBambooHR\nSAP SuccessFactors\nRippling\n\n💬 Communication Channels\nSlack\nMicrosoft Teams\nWeb portal\nMobile app',
          '📊 Analytics Platforms\nLooker\nPower BI\nTableau\n\n🗓 Scheduling Tools\nGoogle Calendar\nOutlook\nCalendly\n\n🔐 Single Sign-On\nOkta\nAzure AD\nGoogle Workspace'
        ),
      },
      {
        id: 4, title: 'Privacy & Compliance',
        elements: content(
          'Built for Enterprise Privacy & Compliance',
          'Alex is designed from the ground up to meet the strictest enterprise requirements:\n\n🔐 End-to-end encryption for all conversations\n📋 GDPR, CCPA, and SOC 2 Type II compliant\n🏢 Data stays in your region — EU, US, or APAC hosting\n👤 Role-based access — employees see only their own data\n🔍 Full audit trail — every interaction logged for compliance review\n🚫 No training on your data — your conversations never train our models\n\nEnterprise legal review package available on request.'
        ),
      },
      {
        id: 5, title: 'Try Alex Now',
        elements: title(
          'Experience Alex Yourself — Type Your First Question Below 💬',
          'Ask anything: "What\'s our parental leave policy?" or "How do I submit a time-off request?" Alex is ready to help right now.'
        ),
      },
    ],
  },

  // ── 6. AI Customer Support Manager ───────────────────────────────────────
  '6': {
    templateId: '6',
    slides: [
      {
        id: 1, title: 'The Support Crisis',
        elements: title(
          'Your Customers Can\'t Wait — But Your Team Can\'t Scale ⏳',
          '73% of customers leave after one bad support experience. Hiring more agents isn\'t the answer. AI-powered support is.'
        ),
      },
      {
        id: 2, title: 'Instant Tier-1 Resolution',
        elements: content(
          'Resolve 70% of Tickets Instantly — Before a Human Gets Involved',
          'Our AI Support Manager handles your highest-volume, lowest-complexity tickets automatically:\n\n✅ Order status & tracking\n✅ Password resets and account access\n✅ Product FAQs and troubleshooting guides\n✅ Refund eligibility checks\n✅ Billing inquiries and plan changes\n✅ Returns and exchange initiations\n\nAverage resolution time: 8 seconds.\nCustomer satisfaction on AI-handled tickets: 4.6 / 5 ⭐'
        ),
      },
      {
        id: 3, title: 'Smart Escalation',
        elements: bullets(
          'When AI Escalates — It Does It Right',
          [
            '😤 Sentiment analysis detects frustration before the customer says it explicitly',
            '🧠 Intent recognition routes complex issues to the right specialist team instantly',
            '📋 Full context transfer — the human agent sees the entire conversation history',
            '⚡ Priority scoring — VIP customers and high-value orders are escalated faster',
            '🔁 Post-resolution check — AI follows up 24h later to confirm satisfaction',
          ]
        ),
      },
      {
        id: 4, title: 'Analytics Dashboard',
        elements: twoCol(
          'Real-Time Support Intelligence',
          '📊 Key Metrics\n\nFirst Contact Resolution Rate\n→ Industry avg: 74% | With AI: 89%\n\nAverage Handle Time\n→ Before: 8.2 min | After: 2.1 min\n\nCustomer Satisfaction (CSAT)\n→ Before: 3.8/5 | After: 4.6/5\n\nTicket Volume Handled by AI\n→ 70% fully automated',
          '🔥 Trending Issues (Live)\n\nTop 5 ticket categories this week:\n1. Shipping delays — 23%\n2. Password reset — 18%\n3. Refund requests — 15%\n4. Feature questions — 14%\n5. Billing inquiries — 11%\n\n⚠ Spike Alert: Shipping complaints up 40% vs last week → Proactive outreach recommended'
        ),
      },
      {
        id: 5, title: 'Setup in 5 Minutes',
        elements: title(
          'Live on Your Website in 5 Minutes ⚡',
          'Paste one line of code. Connect your knowledge base. Done. Your AI Support Manager starts learning from Day 1 and improves with every conversation.'
        ),
      },
    ],
  },

  // ── 7. GDPR Compliance Training ──────────────────────────────────────────
  '7': {
    templateId: '7',
    slides: [
      {
        id: 1, title: 'GDPR Overview',
        elements: title(
          'GDPR Compliance Training 🔒',
          'Mandatory for all employees handling personal data of EU residents. Estimated time: 12 minutes. A completion certificate will be issued upon passing the quiz.'
        ),
      },
      {
        id: 2, title: 'What is GDPR?',
        elements: content(
          'Understanding the General Data Protection Regulation',
          'GDPR (General Data Protection Regulation) came into force on 25 May 2018 across all EU member states. It governs how organizations collect, store, process, and share personal data of EU residents — regardless of where your organization is based.\n\nKey figures:\n€20M or 4% of global annual turnover — maximum fine for serious violations\n72 hours — maximum time to report a data breach to authorities\n30 days — time limit to respond to a Subject Access Request (SAR)\n\nIgnorance is not a defense. Every team member who touches personal data is responsible.'
        ),
      },
      {
        id: 3, title: '7 Core Principles',
        elements: bullets(
          'The 7 Principles of GDPR You Must Know',
          [
            '1️⃣ Lawfulness, Fairness & Transparency — always have a legal basis for processing',
            '2️⃣ Purpose Limitation — collect data only for a specific, explicit purpose',
            '3️⃣ Data Minimisation — collect only what you actually need',
            '4️⃣ Accuracy — keep data up to date and correct errors promptly',
            '5️⃣ Storage Limitation — don\'t keep data longer than necessary',
            '6️⃣ Integrity & Confidentiality — protect data from unauthorised access or loss',
            '7️⃣ Accountability — be able to demonstrate compliance at any time',
          ]
        ),
      },
      {
        id: 4, title: 'Data Breach Protocol',
        elements: twoCol(
          'What To Do If You Suspect a Data Breach',
          '🚨 STOP\nDo not attempt to fix it yourself. Do not delete files or cover your tracks — this makes things significantly worse legally.\n\n📞 REPORT IMMEDIATELY\nContact your Data Protection Officer (DPO) within 1 hour of discovery:\ndpo@yourcompany.com\n+44 20 1234 5678 (24/7 hotline)\n\n📋 DOCUMENT EVERYTHING\nWrite down: what happened, when, what data was involved, who may have been affected.',
          '⏱ Timeline After Discovery\n\nHour 0 — You discover the issue\nHour 1 — Report to DPO\nHour 4 — Internal incident team convened\nHour 24 — Internal impact assessment complete\nHour 72 — Regulatory notification filed (if required)\nDay 14 — Affected individuals notified (if required)\n\n⚠ Missing the 72-hour window without good reason is itself a GDPR violation.'
        ),
      },
      {
        id: 5, title: 'Knowledge Check',
        elements: title(
          'Knowledge Check — Let\'s See What You\'ve Learned ✅',
          'Complete the 10-question quiz to receive your GDPR compliance certificate. A score of 80% or above is required. You have unlimited attempts. Good luck!'
        ),
      },
    ],
  },

  // ── 8. EU AI Act Compliance Training ─────────────────────────────────────
  '8': {
    templateId: '8',
    slides: [
      {
        id: 1, title: 'EU AI Act Introduction',
        elements: title(
          'EU AI Act Compliance Training 🤖⚖️',
          'The EU AI Act is the world\'s first comprehensive legal framework for artificial intelligence. It applies to any organization that develops, deploys, or uses AI systems affecting EU residents.'
        ),
      },
      {
        id: 2, title: 'Risk Classification',
        elements: content(
          'The Four-Tier Risk Classification System',
          'The EU AI Act classifies AI systems into four risk levels:\n\n🚫 Unacceptable Risk — BANNED\nSocial scoring, subliminal manipulation, real-time mass biometric surveillance in public spaces\n\n🔴 High Risk — STRICT OBLIGATIONS\nRecruitment tools, credit scoring, medical devices, critical infrastructure, law enforcement\n\n🟡 Limited Risk — TRANSPARENCY REQUIRED\nChatbots, deepfake generators → must disclose AI involvement to users\n\n🟢 Minimal Risk — NO RESTRICTIONS\nSpam filters, AI in video games, basic recommendation engines'
        ),
      },
      {
        id: 3, title: 'Prohibited AI Practices',
        elements: bullets(
          'AI Practices Banned Under the EU AI Act',
          [
            '🚫 Social scoring — ranking citizens based on behavior for government benefit allocation',
            '🚫 Subliminal manipulation — influencing decisions below conscious awareness',
            '🚫 Exploitation of vulnerabilities — targeting age, disability, or economic situations',
            '🚫 Real-time biometric ID in public — facial recognition in publicly accessible spaces',
            '🚫 Predictive policing — assessing crime risk based solely on profiling or location',
            '🚫 Emotion recognition at work or school — reading emotional states without consent',
          ]
        ),
      },
      {
        id: 4, title: 'High-Risk Obligations',
        elements: twoCol(
          'If You Use High-Risk AI — These Are Your Obligations',
          '📋 Documentation\nMaintain technical documentation throughout the AI lifecycle\n\nConduct conformity assessments before deployment\n\nRegister in the EU High-Risk AI database\n\n👁 Human Oversight\nEnsure a human can intervene at any point\n\nProvide meaningful override capabilities\n\nLog all decisions for audit purposes',
          '✅ Data Governance\nUse only high-quality, representative training data\n\nDocument data sources and preprocessing steps\n\nMonitor for bias and discrimination continuously\n\n🔐 Cybersecurity\nProtect against adversarial attacks\n\nEnsure robustness and accuracy across conditions\n\nConduct regular penetration testing on AI systems'
        ),
      },
      {
        id: 5, title: 'Your Responsibilities',
        elements: title(
          'Your Responsibility: Register Every AI Tool You Use 📋',
          'By end of quarter, every AI system used in your department must be logged in the company AI Register. Questions? Contact your AI Compliance Lead. Non-compliance carries personal liability under the Act.'
        ),
      },
    ],
  },

  // ── 9. Anti-Bribery & Anti-Corruption Training ───────────────────────────
  '9': {
    templateId: '9',
    slides: [
      {
        id: 1, title: 'Zero Tolerance Policy',
        elements: title(
          'Anti-Bribery & Anti-Corruption Training ⚖️',
          'Our zero-tolerance policy is absolute. No business goal, client relationship, or personal benefit justifies bribery or corruption — ever. Understanding and following this policy is a condition of employment.'
        ),
      },
      {
        id: 2, title: 'Definitions',
        elements: content(
          'What Constitutes Bribery and Corruption',
          'Bribery\nOffering, giving, receiving, or soliciting something of value to influence the actions of an official or person in a position of trust.\n\nCorruption\nAbusing entrusted power for private gain — whether financial or non-financial.\n\nFacilitation Payments\nSmall payments to government officials to "speed up" routine actions. These are ILLEGAL under most jurisdictions we operate in — even where culturally common.\n\nKey test: Would you be comfortable if this transaction appeared on the front page of a newspaper?\n\nIf not — don\'t do it. Report it instead.'
        ),
      },
      {
        id: 3, title: 'Gifts & Hospitality Policy',
        elements: bullets(
          'Gifts, Hospitality & Entertainment — The Rules',
          [
            '💰 Cash or cash equivalents (gift cards, vouchers) — NEVER acceptable in any amount',
            '🎁 Gifts must be nominal value — under $50 / €50 / £40 equivalent',
            '🍽 Business meals are acceptable — must be modest, business-related, properly receipted',
            '✈️ Travel or accommodation offered by third parties requires prior written approval',
            '📝 All received gifts over threshold MUST be logged in the Gifts Register within 48 hours',
            '🚫 Never offer gifts to government officials or their family members — even small ones',
          ]
        ),
      },
      {
        id: 4, title: 'How to Report',
        elements: twoCol(
          'How to Report Suspected Corruption',
          '📣 Reporting Channels\n\n1. Your direct manager (if not implicated)\n\n2. Legal & Compliance Team\ncompliance@company.com\n\n3. Anonymous Whistleblower Hotline\n0800 XXX XXXX (24/7, free, anonymous)\nwhistleblower.company.com\n\n4. External reporting to relevant authority if internal channels are compromised',
          '🛡 Your Protections\n\nYou are legally protected from retaliation for good-faith reporting under our policy and applicable law (UK Bribery Act, US FCPA, EU Whistleblower Directive).\n\nProtections include:\n✅ Confidentiality of your identity\n✅ No disciplinary action for reporting\n✅ No discrimination or dismissal\n✅ Legal support if retaliation occurs\n\nRetaliation against a whistleblower is a fireable offense.'
        ),
      },
      {
        id: 5, title: 'Your Commitment',
        elements: title(
          'Integrity Is Non-Negotiable — Thank You for Upholding It 🤝',
          'By completing this training, you confirm you have read, understood, and will comply with our Anti-Bribery & Anti-Corruption Policy. Your signature on the acknowledgment form completes this module.'
        ),
      },
    ],
  },

  // ── 10. Cyber Hygiene Training ────────────────────────────────────────────
  '10': {
    templateId: '10',
    slides: [
      {
        id: 1, title: 'Why Cyber Hygiene Matters',
        elements: title(
          'Cyber Hygiene Training — Your First Line of Defense 🔐',
          '91% of cyberattacks start with a phishing email. The most sophisticated security infrastructure in the world can be bypassed by one employee clicking the wrong link. That employee could be any of us.'
        ),
      },
      {
        id: 2, title: 'Password Security',
        elements: content(
          'Password Security — The Foundation of Everything',
          'Strong password rules at our company:\n\n✅ Minimum 14 characters — use a passphrase, not a word\nExample: "Correct-Horse-Battery-Staple-2026" is stronger than "P@ssw0rd!"\n\n✅ Unique password per service — NEVER reuse passwords across accounts\n✅ Enable 2FA/MFA everywhere — especially email, Slack, and GitHub\n✅ Use 1Password (company-provided) — never store passwords in browsers or notes\n\n❌ Don\'t do this:\n• Dictionary words or names\n• Predictable patterns (Password1!, Summer2026)\n• Sharing passwords over Slack or email\n• Writing passwords on sticky notes'
        ),
      },
      {
        id: 3, title: 'Phishing Defense',
        elements: bullets(
          'How to Spot and Stop a Phishing Attack',
          [
            '📧 Check the sender address carefully — not just the display name (it\'s easily faked)',
            '⚠️ Artificial urgency — "Your account will be suspended in 24 hours!" is a major red flag',
            '🔗 Hover before you click — verify URLs match the expected domain exactly',
            '📎 Unexpected attachments — never open .exe, .zip, or .macro files from unknown senders',
            '💸 Wire transfer or gift card requests — these are almost always fraud, even from "the CEO"',
            '✅ When in doubt — forward to security@company.com before clicking anything',
          ]
        ),
      },
      {
        id: 4, title: 'Device & Network Safety',
        elements: twoCol(
          'Device Security — Non-Negotiable Rules',
          '💻 Laptop & Mobile\n\n🔒 Lock your screen when you step away (Win+L / Cmd+Ctrl+Q)\n\n🚫 Never plug in unknown USB devices\n\n📱 Enable full-disk encryption on all devices\n\n🔄 Install security updates within 24 hours of release\n\n🏠 Separate work and personal devices — never mix accounts',
          '🌐 Network Security\n\n🚫 Never use public Wi-Fi for work — use mobile hotspot or wait\n\n🔐 Always connect via VPN when working remotely\n\n🏠 Secure your home router:\n→ Change default password\n→ Use WPA3 encryption\n→ Disable WPS\n\n📍 Report lost or stolen devices immediately:\nsecurity@company.com or +44 20 XXXX (24/7)'
        ),
      },
      {
        id: 5, title: 'Report & Stay Safe',
        elements: title(
          'Seen Something Suspicious? Report It Immediately 🚨',
          'There\'s no such thing as a "stupid" security report. Forward suspicious emails to security@company.com. If you\'ve clicked something dangerous, tell IT immediately — early response prevents 90% of damage. Security is everyone\'s responsibility.'
        ),
      },
    ],
  },
}
