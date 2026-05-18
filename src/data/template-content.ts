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

const threeKPI = (header: string, kpi1: string, kpi2: string, kpi3: string): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  { id: 'k1', type: 'bubble', x: 40, y: 130, w: 268, h: 370, content: kpi1 },
  { id: 'k2', type: 'bubble', x: 346, y: 130, w: 268, h: 370, content: kpi2 },
  { id: 'k3', type: 'bubble', x: 652, y: 130, w: 268, h: 370, content: kpi3 },
]

const quote = (header: string, blockquote: string, attribution: string): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  { id: 'q', type: 'bubble', x: 80, y: 130, w: 800, h: 260,
    content: `❝  ${blockquote}  ❞` },
  { id: 'attr', type: 'bubble', x: 80, y: 406, w: 800, h: 60,
    content: `— ${attribution}` },
]

const timeline = (header: string, steps: string[]): SelectedElement[] => [
  { id: 'hdr', type: 'bubble', x: 40, y: 36, w: 880, h: 64,
    content: `Header: ${header}` },
  ...steps.map((s, i) => ({
    id: `step${i}`,
    type: 'bubble' as const,
    x: 40 + i * 176,
    y: 116,
    w: 162,
    h: 390,
    content: s,
  })),
]

// ── Template content ──────────────────────────────────────────────────────────

export const MOCK_TEMPLATE_CONTENTS: Record<string, TemplateContent> = {

  // ── 1. Onboarding (10 slides) ──────────────────────────────────────────────
  '1': {
    templateId: '1',
    slides: [
      {
        id: 1, title: 'Welcome',
        elements: title(
          'Welcome to the Team! 👋',
          'We\'re thrilled to have you here. This presentation walks you through everything you need to hit the ground running — from our mission to your first-week checklist.',
        ),
      },
      {
        id: 2, title: 'Our Mission & Values',
        elements: content(
          'Our Mission & Core Values',
          'Mission\nWe build tools that help teams communicate, collaborate, and grow — faster than ever before.\n\n🌟 Integrity — We do what we say.\n🚀 Innovation — We challenge the status quo every day.\n🤝 People First — Our team and customers always come first.\n🎯 Ownership — Every person owns their outcomes.\n💡 Curiosity — We ask questions and never stop learning.',
        ),
      },
      {
        id: 3, title: 'Company Overview',
        elements: threeKPI(
          'Pitch Avatar by the Numbers',
          '🌍 Global Reach\n\n10,000+\nActive customers\n\n45\nCountries\n\n29+\nLanguages supported',
          '🚀 Product\n\n3 min\nAvg. time to first presentation\n\n4.8 ★\nG2 + Capterra rating\n\n99.9%\nUptime SLA',
          '👥 Team\n\n120+\nTeam members globally\n\n3\nMain offices:\nKyiv · London · NYC\n\n40%\nPromoted internally in 2025',
        ),
      },
      {
        id: 4, title: 'Org Structure',
        elements: twoCol(
          'Who Does What — Your Org Map',
          '🏢 Leadership\nCEO — Olena Marchenko\nCTO — Alex Petrov\nCMO — Sarah Kim\nVP Sales — Marco Lanza\n\n🛠 Engineering & Product\n→ Product Squad (8 teams)\n→ Platform & Infrastructure\n→ AI & ML Research\n→ QA & Security\n\n📐 Design\n→ Product Design (UX/UI)\n→ Brand & Communications',
          '💼 Go-to-Market\n→ Sales (Enterprise + SMB)\n→ Customer Success\n→ Marketing & Growth\n→ Partnerships\n\n🧑‍💼 Operations\n→ People & Culture (your team!)\n→ Finance\n→ Legal & Compliance\n→ IT & Workplace\n\n📞 Your immediate contacts:\nYour Manager: [TBD]\nHR Partner: hr@pitchavatar.com\nIT Support: it@pitchavatar.com',
        ),
      },
      {
        id: 5, title: 'Your First Week',
        elements: bullets(
          'Your First-Week Checklist',
          [
            'Day 1 — Set up laptop, accounts & access (IT will guide you in the first 2 hours)',
            'Day 1 — Meet your buddy, manager, and immediate team over lunch',
            'Day 2–3 — Complete security & compliance training modules (mandatory, in this app!)',
            'Day 2–3 — Review team OKRs, current sprint goals, and product roadmap',
            'Day 4–5 — Shadow a colleague on a live call or project, attend your first stand-up',
            'By end of week — Schedule 1:1s with 5 key stakeholders and update your profile',
          ],
        ),
      },
      {
        id: 6, title: 'Tools & Systems',
        elements: twoCol(
          'The Tools We Use Every Day',
          '📬 Communication\nSlack — instant messaging (#general, #help-it)\nZoom — video calls and all-hands\nEmail — external & formal comms\n\n📋 Project Management\nJira — tasks, bugs & sprints\nConfluence — team documentation\nNotion — internal wikis & runbooks\n\n🎨 Design & Product\nFigma — UI/UX design (shared workspace)\nMiro — whiteboarding & workshops',
          '📊 Data & Analytics\nLooker — company dashboards\nGoogle Analytics — web & product\nAmplitude — user behaviour\n\n🔌 Sales & Marketing\nSalesforce — CRM (Sales team)\nHubSpot — inbound marketing\nIntercom — customer messaging\n\n🔐 Security & Access\nOkta — SSO, MFA (set up Day 1)\n1Password — password manager\nGithub / Gitlab — code repositories\nVPN — required for remote access',
        ),
      },
      {
        id: 7, title: 'Benefits & Perks',
        elements: bullets(
          'What We Offer — Your Full Benefits Package',
          [
            '💰 Competitive salary, reviewed annually + performance bonus up to 20%',
            '🏥 Private health insurance (medical, dental, vision) for you and dependants',
            '🏝 25 days PTO + public holidays + 1 additional day per year of service (up to 30)',
            '🏠 Flexible/hybrid working — 2 days office, 3 days remote (or fully remote for some roles)',
            '📚 £2,000 / $2,500 annual learning budget — courses, conferences, books, certifications',
            '💻 Home office stipend £500 on joining, refreshed every 3 years',
            '🥗 Free lunch in office on Tuesdays & Thursdays + daily snacks and barista coffee',
          ],
        ),
      },
      {
        id: 8, title: 'Learning & Development',
        elements: content(
          'Investing in Your Growth — L&D at Pitch Avatar',
          'We believe your growth = our growth.\n\n📚 Annual learning budget: £2,000 per person\nUse it for: online courses (Udemy, Coursera, LinkedIn Learning), industry conferences, certifications, and books.\n\n🎓 Internal Academy\nBi-weekly tech talks by engineers and product leads\nMonthly "Lunch & Learn" across all departments\nQuarterly leadership development for team leads\n\n🤝 Mentorship Programme\n6-month structured pairing with a senior colleague\nAvailable to all employees after 3 months\n\n🔗 How to Access\nClaim your budget via Confluence > HR > Learning Budget Request\nResults tracked in your Performance Review (bi-annual)',
        ),
      },
      {
        id: 9, title: 'Ways of Working',
        elements: twoCol(
          'Our Culture & Ways of Working',
          '🕘 Core Hours\n9am – 3pm your local time\n(flex outside these hours)\n\n📅 Meeting Norms\nAll meetings have agendas\nDefault: 25 or 50 min (never 30/60)\nNo-meeting Fridays (Eng & Product)\nAll-Hands: first Tuesday of the month\n\n🗣 Communication Style\nDefault to async (Slack, Notion)\nUse Zoom for nuanced discussions\nDocument decisions in Confluence',
          '🎯 Performance\nOKRs set quarterly at company, team, and individual level\n1:1s weekly with your manager\nPerformance reviews bi-annually (June & December)\nPromotion cycles twice a year\n\n📣 Feedback Culture\n"Direct & kind" — radical candour\nFeedback flows up, down, and sideways\nAnonymous pulse surveys monthly\n360 reviews at performance cycle\n\n🏆 Recognition\nPeer recognition via HeyTaco on Slack\nEmployee of the Month voted by team\nAnnual company awards ceremony',
        ),
      },
      {
        id: 10, title: 'You\'re All Set!',
        elements: title(
          'You\'re All Set — Let\'s Build Something Great Together! 🚀',
          'Your manager and buddy are your first port of call for any question — no matter how small. Check your email for your 30/60/90 day plan. We\'re incredibly glad you\'re here.',
        ),
      },
    ],
  },

  // ── 2. Corporate Newsletter (8 slides) ─────────────────────────────────────
  '2': {
    templateId: '2',
    slides: [
      {
        id: 1, title: 'This Month\'s Edition',
        elements: title(
          'Company Newsletter — May 2026 📣',
          'Highlights, wins, team news, and what\'s coming next. Grab a coffee — this is your monthly catch-up on everything that happened across Pitch Avatar.',
        ),
      },
      {
        id: 2, title: 'CEO Message',
        elements: content(
          'A Message from Our CEO',
          'Team,\n\nThis month we crossed a milestone I\'m incredibly proud of: 10,000 active customers. None of this would be possible without each one of you.\n\nWe launched three major features, expanded to two new markets, and our NPS hit an all-time high of 72. Customer stories this month have been overwhelming — they\'re not just saving time, they\'re winning deals they would have lost.\n\nAs we head into Q3, our focus sharpens on retention, enterprise expansion, and our upcoming Series B. More on that at next week\'s all-hands.\n\nThank you for everything you do every single day.\n\n— Olena, CEO',
        ),
      },
      {
        id: 3, title: 'Key Wins This Month',
        elements: bullets(
          'May Highlights & Key Achievements',
          [
            '🏆 Crossed 10,000 active customers — a historic company milestone!',
            '🚀 Launched AI-powered analytics dashboard v2.0 — 40% faster load times',
            '🌍 Expanded to German and Polish markets — first localized campaigns live',
            '💼 Closed 3 enterprise contracts worth $1.2M ARR — largest quarter in company history',
            '⭐ NPS score reached 72 — highest ever, up from 64 in April',
            '🎉 Welcomed 12 new team members across Product, Engineering & Sales',
            '📱 Mobile app hit 50,000 downloads — 3 months ahead of forecast',
          ],
        ),
      },
      {
        id: 4, title: 'Product Updates',
        elements: twoCol(
          'What\'s New in the Product — May Releases',
          '✅ Shipped in May\n\n🤖 AI Script Generator v2\nFaster, smarter, now supports 12 new languages\n\n📊 Analytics Dashboard v2.0\nCustom date ranges, export to PDF, shareable links\n\n🔗 HubSpot Integration (native)\nTwo-way sync — no Zapier required\n\n📱 Mobile App — iOS & Android\n50k downloads in first month!',
          '🔜 Coming in June\n\n🎨 New Theme Builder\nFull brand customization — fonts, colors, logo\n\n🎙 Voice Cloning (Beta)\nCreate your AI avatar with your own voice\n\n📧 Email Templates\nSend personalized video links straight from the app\n\n🔌 Salesforce Native App\nLaunch from within SF — zero tab-switching\n\n📈 Heatmaps\nSee exactly where viewers\'s attention goes',
        ),
      },
      {
        id: 5, title: 'Team Spotlight',
        elements: content(
          'Employee Spotlight — Maria K., Senior Engineer',
          '"Shipping the analytics revamp in 6 weeks was one of the hardest technical challenges I\'ve worked on. We rewrote the entire data pipeline, migrated 2TB of event data without downtime, and launched 3 days early. The moment I saw the first customer tweet about the new dashboards — that made it all worth it."\n\n— Maria K., Senior Engineer, voted Employee of the Month\n\nMaria joined 3 years ago as a junior developer. She has since mentored 4 junior engineers, led 2 major architecture migrations, and spoken at two industry conferences.\n\n🏆 Maria receives a £500 learning budget top-up and a team dinner on us.',
        ),
      },
      {
        id: 6, title: 'People & Culture',
        elements: twoCol(
          'People News — Celebrations & Milestones',
          '🎂 Work Anniversaries\n\nAnna S. — 3 years in Engineering\nMax T. — 1 year in Customer Success\nLucas M. — 5 years in Sales! 🎖\nPriya K. — 2 years in Design\n\n👶 Family News\nCongrats to the Petrov family on the arrival of baby Mia! 🍼\nCongrats to David & Emma L. — engaged! 💍\n\n🎓 Certifications This Month\n→ 4 team members earned AWS certifications\n→ 2 earned GDPR practitioner certificates\n→ 1 completed Stanford Executive Leadership program',
          '🏅 Promotions\n\nKate B. → Senior Product Manager\nAlex H. → Team Lead, Engineering\nSofia R. → Director, Customer Success\n\n🤝 New Joiners (12 this month)\nEngineering: 5 new engineers (2 senior, 3 mid)\nSales: 3 Account Executives\nMarketing: 2 Growth Marketers\nProduct: 1 Product Designer\nOps: 1 Finance Analyst\n\n📣 Departures\nWe thank James P. for 4 years of dedication. He moves to a VP role at a portfolio company — we\'re cheering him on!',
        ),
      },
      {
        id: 7, title: 'Upcoming Events',
        elements: timeline(
          'What\'s Coming in June',
          [
            '📅 Jun 3\n\nAll-Hands Meeting\n(Hybrid)\n\nQ2 results + Q3 roadmap reveal\n\nZoom link in calendar',
            '⚡ Jun 10–11\n\nHackathon\n"Build Anything"\n\n48h sprint\nPrizes: £5k · £3k · £1k\n\nAll welcome!',
            '🎓 Jun 17\n\nLeadership Workshop\n"Radical Candour"\n\nFor team leads & senior ICs\n\nRegister via Confluence',
            '🎉 Jun 20\n\nSummer Party\nRooftop, London HQ\n6pm – late\n\nFamilies & +1s welcome\nRSVP by Jun 13',
            '📊 Jun 27\n\nBoard Meeting\n& Investor Update\n\nInternal only — leadership team',
          ],
        ),
      },
      {
        id: 8, title: 'Until Next Month!',
        elements: title(
          'That\'s a Wrap — See You in June! 👋',
          'Have a story, win, or milestone to feature in next month\'s newsletter? Drop it in #newsletter-submissions on Slack by June 20. Together, we\'re building something special — and these stories prove it.',
        ),
      },
    ],
  },

  // ── 3. Product Presentation (10 slides) ────────────────────────────────────
  '3': {
    templateId: '3',
    slides: [
      {
        id: 1, title: 'The Problem',
        elements: title(
          'Your Audience Stops Watching at Slide 3 😔',
          'Static presentations lose 70% of viewer attention in the first 2 minutes. Your message deserves better than a forgotten PDF sitting in someone\'s downloads folder.',
        ),
      },
      {
        id: 2, title: 'The Numbers Don\'t Lie',
        elements: threeKPI(
          'The Broken Status Quo of Presentations',
          '😴 Attention\n\n73%\nof prospects forget the content of a presentation within 24 hours\n\n2 min\nAverage time before attention drops on a static slide deck',
          '📈 Lost Revenue\n\n$1.1T\nEstimated revenue lost globally per year due to ineffective communication\n\n58%\nOf deals lost due to lack of engagement post-presentation',
          '⏱ Wasted Time\n\n5+ hours\nAverage time a sales rep spends customizing a deck per deal\n\n0%\nVisibility into what happens after you press Send',
        ),
      },
      {
        id: 3, title: 'Introducing Pitch Avatar',
        elements: content(
          'Meet Pitch Avatar — Presentations That Talk Back',
          'Pitch Avatar turns your static slides into interactive AI-powered experiences that engage, qualify, and convert your audience — automatically.\n\n✅ Add an AI avatar that speaks your script in 40+ languages\n✅ Embed interactive widgets: polls, CTAs, lead capture, Calendly\n✅ Share via a single personalized link — zero software for viewers\n✅ Track every second of viewer attention with heatmaps in real time\n✅ Integrate directly with your CRM and marketing automation stack\n✅ Launch in under 2 minutes — upload PDF or PPTX, hit Publish',
        ),
      },
      {
        id: 4, title: 'How It Works',
        elements: timeline(
          'From Slides to Interactive Experience in 3 Steps',
          [
            '① Upload\n\nDrag & drop your existing PDF or PPTX\n\nAny format, up to 50MB\n\nProcessed in under 60 seconds',
            '② Customize\n\nChoose your AI avatar\n(40+ options or use your own photo)\n\nWrite or AI-generate your script\n\nAdd interactive elements',
            '③ Publish\n\nOne-click publish\n\nGet a personalized link per recipient\n\nSet access controls and expiry',
            '④ Engage\n\nYour audience watches, interacts, and converts\n\nAll without any app download',
            '⑤ Track\n\nSee every click, pause, and replay in real time\n\nGet notified when hot prospects re-open',
          ],
        ),
      },
      {
        id: 5, title: 'Key Features',
        elements: bullets(
          'What Makes Pitch Avatar Different',
          [
            '🤖 AI Avatars — realistic digital humans present your slides professionally in 40+ languages',
            '📊 Live Analytics — heatmaps, slide-by-slide attention, drop-off points, and re-open alerts',
            '🔗 Smart Links — personalized URLs with lead capture, access controls, and expiry dates',
            '💬 Interactive Elements — embed polls, Q&A, CTA buttons, Calendly, and lead forms mid-deck',
            '🔌 CRM Integrations — native sync with Salesforce, HubSpot, Pipedrive, and Marketo',
            '⚡ 2-Minute Setup — upload any PDF/PPTX and publish in under 2 minutes, no design skills needed',
          ],
        ),
      },
      {
        id: 6, title: 'Integrations',
        elements: twoCol(
          'Pitch Avatar Plugs Into Your Entire Stack',
          '🔌 CRM & Sales\nSalesforce (native app)\nHubSpot (native integration)\nPipedrive\nOutreach\nSalesloft\n\n📧 Marketing & Email\nMarketo\nMailchimp\nActiveCampaign\nMixpanel\n\n📅 Scheduling\nCalendly\nChilipiper\nGoogle Calendar',
          '💬 Communication\nSlack (real-time alerts)\nMicrosoft Teams\nIntercom\n\n🎙 Video & Conferencing\nZoom\nLoom\nGoogle Meet\n\n🔄 Automation\nZapier (5,000+ apps)\nMake (Integromat)\nAPI + Webhooks\n\n🔐 Security & SSO\nOkta, Azure AD, Google SSO\nSOC 2 Type II certified\nGDPR compliant',
        ),
      },
      {
        id: 7, title: 'Social Proof',
        elements: twoCol(
          'Trusted by 10,000+ Teams Worldwide',
          '"Pitch Avatar increased our demo-to-close rate by 34% in the first quarter. Our SDRs now send interactive presentations instead of static PDFs — and prospects actually reply."\n— Sarah K., VP Sales, TechCorp\n\n"We replaced 3 tools with Pitch Avatar. One link does it all: presents, qualifies leads, and books meetings."\n— Marco L., Head of Marketing, ScaleUp\n\n"Our NPS went up 18 points after switching from PDF leave-behinds to Pitch Avatar links."\n— Priya S., Customer Success Lead, FinStart',
          '📈 Results By the Numbers\n\n3x\nMore viewer engagement vs static slides\n\n+34%\nDemo-to-close rate for sales teams\n\n70%\nReduction in time spent on follow-ups\n\n8 sec\nAverage AI resolution time per support ticket\n\n10,000+\nActive users across 45 countries\n\n⭐ 4.8/5\nOn G2 and Capterra',
        ),
      },
      {
        id: 8, title: 'Pricing',
        elements: threeKPI(
          'Simple, Transparent Pricing',
          '🆓 Free\n$0/mo\n\n✅ 5 presentations\n✅ 1 AI avatar voice\n✅ Basic analytics\n✅ 3 language support\n\n❌ Custom branding\n❌ CRM integrations\n❌ Priority support\n\n[Start for Free]',
          '⭐ Professional\n$29/mo\n\n✅ Unlimited presentations\n✅ 5 AI avatar voices\n✅ Full analytics + heatmaps\n✅ 40+ languages\n✅ Custom domain & branding\n✅ HubSpot + Pipedrive sync\n✅ Priority email support\n\n[Most Popular]',
          '🏢 Business\n$79/mo\n\n✅ Everything in Pro\n✅ 10 team seats\n✅ Salesforce native app\n✅ Voice cloning (own voice)\n✅ SSO (Okta, Azure AD)\n✅ Dedicated CSM\n✅ SLA 99.9% uptime\n\n[Talk to Sales]',
        ),
      },
      {
        id: 9, title: 'Case Study',
        elements: content(
          'How TechCorp Grew Pipeline 3x in One Quarter',
          'The Challenge\nTechCorp\'s SDRs were sending static PDFs. Open rates were unmeasurable, engagement was zero, and reps spent 5+ hours per deal customizing decks.\n\nWhat We Did\n→ Replaced all outbound decks with Pitch Avatar interactive presentations\n→ Set up AI avatar in the VP\'s likeness for personalized outreach at scale\n→ Connected to Salesforce — hot prospect alerts triggered automatic follow-up sequences\n\nResults (90 days)\n✅ 3x increase in qualified pipeline from same outbound volume\n✅ 45% more demo bookings from cold email (same list, better delivery)\n✅ 60% reduction in time-to-proposal — from 5 hours to 12 minutes\n✅ 34% higher demo-to-close rate in Q2 vs Q1',
        ),
      },
      {
        id: 10, title: 'Get Started Today',
        elements: title(
          'Start Your Free Trial — No Credit Card Required 🎯',
          'Join 10,000+ teams already using Pitch Avatar. Create your first interactive presentation in under 5 minutes. If you don\'t see results in 14 days, we\'ll extend your trial — no questions asked.',
        ),
      },
    ],
  },

  // ── 4. Sales Presentation & Deal Qualification (9 slides) ──────────────────
  '4': {
    templateId: '4',
    slides: [
      {
        id: 1, title: 'Opening',
        elements: title(
          'Let\'s Find Out If We\'re a Perfect Match 🤝',
          'This is a two-way conversation. We\'ll share what we do — and we want to understand your challenges deeply so we can be completely honest about fit, timeline, and ROI.',
        ),
      },
      {
        id: 2, title: 'About Us',
        elements: threeKPI(
          'Who We Are — Pitch Avatar at a Glance',
          '📅 Founded\n\n2021\n\nBootstrapped to $5M ARR before raising Series A\n\nProfitable since Month 18',
          '🌍 Scale\n\n10,000+\nActive customers\n\n45 countries\n\n29+ languages\n\n99.9% uptime',
          '🏆 Recognition\n\n⭐ 4.8 on G2\n⭐ 4.8 on Capterra\n\n#1 in "Presentation Software" category\n\nForrester Wave Leader 2025',
        ),
      },
      {
        id: 3, title: 'Discovery — Your Challenges',
        elements: content(
          'What We Typically Hear From Teams Like Yours',
          'Do any of these sound familiar?\n\n❌ "Our sales decks are static — prospects ghost us after we send them."\n\n❌ "We have zero visibility into what happens after we press Send on a proposal."\n\n❌ "Our reps spend 5+ hours per deal customizing presentations manually."\n\n❌ "We can\'t tell which leads are hot vs cold — we follow up with everyone equally and burn capacity."\n\n❌ "Our presentations aren\'t localized — we\'re losing deals in international markets."\n\nIf even one of these resonates — we built Pitch Avatar specifically for this. Let\'s dig in.',
        ),
      },
      {
        id: 4, title: 'Our Solution',
        elements: twoCol(
          'How Pitch Avatar Solves Each of These',
          '🔴 Problem → ✅ Solution\n\n"Prospects ghost us after sending"\n→ AI avatar presents your pitch — interactive, engaging, hard to ignore\n\n"Zero visibility after pressing Send"\n→ Real-time analytics: who opened, which slides, how long, and when they re-opened\n\n"5+ hours per deck"\n→ Templates + AI script generation = proposal ready in 12 minutes',
          '🔴 Problem → ✅ Solution\n\n"Can\'t identify hot leads"\n→ Intent signals: re-open alerts + Salesforce automatic lead scoring\n\n"Not localized"\n→ One click: AI auto-translates script into 40+ languages — no translators needed\n\n🎯 Net result for a typical 10-person sales team:\n→ 5 hours/week saved per rep = 50 hours/week returned to selling\n→ Pipeline visibility from Day 1\n→ International coverage without headcount',
        ),
      },
      {
        id: 5, title: 'Why Teams Choose Us',
        elements: bullets(
          'Why 10,000+ Sales Teams Chose Pitch Avatar Over Alternatives',
          [
            '📈 34% higher close rates — interactive presentations convert 3x better than static PDFs',
            '⏱ 80% less time on deck prep — AI script generation + smart templates do the heavy lifting',
            '🔥 Real-time buyer intent — know the moment a prospect re-opens your link and which slide they\'re on',
            '🌍 Multi-language by default — present in the prospect\'s native language with zero additional effort',
            '🔌 Zero workflow disruption — plugs into Salesforce, HubSpot, Outreach exactly as-is',
            '⚡ ROI in 6 weeks — median time from first use to first measurable pipeline improvement',
          ],
        ),
      },
      {
        id: 6, title: 'Case Study — TechCorp',
        elements: content(
          'Case Study: TechCorp — 3x Pipeline Growth in 90 Days',
          'The Situation\nTechCorp (250-person SaaS company, 12-rep sales team) was sending static PDFs. Open rates were unmeasurable, follow-up was guesswork, and average time-to-proposal was 5 hours per deal.\n\nWhat We Did Together\n→ Week 1: Set up Salesforce integration and built 3 core presentation templates\n→ Week 2: Trained all 12 reps (90-minute session + async walkthroughs)\n→ Week 3: First live presentations sent to active pipeline\n→ Week 4: First re-open alerts triggered — SDRs called within 10 minutes\n\nResults (90 Days)\n✅ 3x qualified pipeline from same outbound volume\n✅ 45% more demo bookings from cold outreach\n✅ 60% reduction in time-to-proposal (5 hours → 12 minutes)\n✅ 34% improvement in demo-to-close rate',
        ),
      },
      {
        id: 7, title: 'ROI Model',
        elements: twoCol(
          'Your Expected ROI — Conservative Estimates',
          '🧮 Time Savings (10 reps)\n\nCurrent: 5 hrs/rep/week on deck prep\nWith Pitch Avatar: ~1 hr/week\nTime saved: 4 hrs × 10 reps = 40 hrs/week\n\nAt average OTE of $80k/rep = $38/hr\n40 hrs × $38 × 52 weeks = $79k/year\n\n🔥 Pipeline Impact\n\nTypical uplift: +25% in demo bookings\nIf you run 20 demos/month → +5 demos/mo\nAt 25% close rate, $30k ACV → +$37.5k/month\n= $450k additional ARR',
          '📊 Breakeven Analysis\n\nPitch Avatar Business Plan: $79/mo = $948/year (10 users)\n\nBreakeven: First week of using it.\n\n💡 Conservative 12-Month Projection\n\nTime savings: $79k\nAdditional pipeline closed: $450k ARR\nTotal value: ~$530k\n\nInvestment: $948/year\n\nROI: 55,000%\n\n[Note: Actual results vary. We provide a 90-day pilot with agreed success metrics before full rollout.]',
        ),
      },
      {
        id: 8, title: 'Objection Handling',
        elements: bullets(
          'Questions We\'re Commonly Asked — Answered Honestly',
          [
            '❓ "How long does onboarding take?" → 90-minute live training + your first deck live in Day 1',
            '❓ "What if our security team has concerns?" → SOC 2 Type II, GDPR, SSO, data stays in your region',
            '❓ "Do we need to replace our CRM?" → No. We plug into Salesforce/HubSpot as they are today',
            '❓ "What if reps don\'t adopt it?" → 89% of reps use it within first week — it makes their job easier',
            '❓ "What\'s your contract?" → Monthly, annual (20% discount), or custom enterprise terms',
            '❓ "What if it doesn\'t work for us?" → 90-day pilot with pre-agreed success metrics, full refund if unmet',
          ],
        ),
      },
      {
        id: 9, title: 'Next Steps',
        elements: twoCol(
          'Proposed Next Steps — This Week',
          '✅ What We\'ve Covered Today\n\nYour current challenges and their cost\n\nExactly how Pitch Avatar solves each one\n\nROI model for your team size and deal volume\n\nProof via TechCorp case study (comparable company)\n\nYour objections — addressed honestly',
          '🗓 Recommended Next Actions\n\n① Technical Deep-Dive (45 min)\nBring your sales ops + IT security lead\nWe\'ll cover integrations, SSO, and data flows\n\n② Pilot Agreement (30-day, 5 reps)\nSuccess metrics agreed upfront\nFull Pitch Avatar team supporting\n\n③ Executive Briefing\nWe present ROI model to your VP Sales\n\nShall we find time this week for Step 1?\n→ [Book via Calendly] or reply to this presentation',
        ),
      },
    ],
  },

  // ── 5. AI HR Assistant (8 slides) ─────────────────────────────────────────
  '5': {
    templateId: '5',
    slides: [
      {
        id: 1, title: 'Meet Alex',
        elements: title(
          'Meet Alex — Your AI HR Assistant 🤖',
          'Alex handles routine HR queries, guides employees through processes, and frees your HR team to focus on what only humans can do: building culture and developing people.',
        ),
      },
      {
        id: 2, title: 'The HR Problem',
        elements: threeKPI(
          'Why Traditional HR Is Struggling',
          '📞 Volume\n\n60%\nOf HR tickets are repetitive\n\n1,000+\nAvg. HR tickets per 500 employees per month\n\n4 hrs\nAvg. response time per query',
          '💸 Cost\n\n$15–25\nCost per HR ticket (industry avg)\n\n$125k–$200k\nAnnual cost for each dedicated HR generalist\n\n0%\nOf that time on strategic work',
          '😤 Experience\n\n42%\nOf employees frustrated with HR response times\n\n67%\nWant self-service options for routine requests\n\n3x\nMore likely to stay if HR experience is rated "excellent"',
        ),
      },
      {
        id: 3, title: 'What Alex Can Do',
        elements: bullets(
          'Alex Handles These Requests — Instantly, 24/7',
          [
            '📋 Policy Q&A — "How many sick days do I have?" answered in seconds, any time of day',
            '📅 Leave requests — submit, approve, and track PTO without any HR team involvement',
            '🎯 Onboarding guidance — step-by-step checklists for new hires, personalized to their role',
            '💰 Payroll inquiries — payslip explanations, tax document retrieval, bonus queries',
            '🏆 Performance cycles — reminders, form links, deadline tracking, manager notifications',
            '📚 Training enrollment — smart recommendations and self-service registration for L&D programs',
            '🔄 Offboarding — guided checklist for leavers, equipment return, final payroll queries',
          ],
        ),
      },
      {
        id: 4, title: 'How Alex Works',
        elements: timeline(
          'How Alex Handles a Typical Employee Query',
          [
            '① Employee asks\n\n"How do I apply for parental leave?"\n\nVia Slack, Teams, web portal, or mobile app',
            '② Alex understands\n\nNLP identifies intent\n\nChecks employee\'s location, role, and entitlements\n\nRetrieves relevant policy',
            '③ Alex answers\n\nPersonalized, step-by-step response\n\nLinks to correct form\n\nOffers to submit on their behalf',
            '④ Action taken\n\nIf approved → leave logged in HRIS\n\nManager notified\n\nCalendar blocked automatically',
            '⑤ Follow-up\n\n24h before return: automated reminder\n\nPost-leave check-in scheduled\n\nAll logged for compliance',
          ],
        ),
      },
      {
        id: 5, title: 'Integrations',
        elements: twoCol(
          'Alex Connects to Your Entire HR Tech Stack',
          '🔌 HRIS Systems\nWorkday\nBambooHR\nSAP SuccessFactors\nRippling\nOracleHCM\n\n💬 Communication Channels\nSlack\nMicrosoft Teams\nWeb portal (embeddable)\nMobile app (iOS & Android)\nEmail (for escalations)',
          '📊 Analytics & Reporting\nLooker\nPower BI\nTableau\nWorkday Analytics\n\n🗓 Scheduling & Calendars\nGoogle Calendar\nMicrosoft Outlook\nCalendly\n\n🔐 Single Sign-On\nOkta\nAzure Active Directory\nGoogle Workspace\n\n📋 Payroll\nADP\nPaylocity\nSage Payroll',
        ),
      },
      {
        id: 6, title: 'Privacy & Compliance',
        elements: content(
          'Built for Enterprise Privacy & Compliance',
          'Alex is designed from the ground up to meet the strictest enterprise requirements:\n\n🔐 End-to-end encryption for all conversations (TLS 1.3 + AES-256 at rest)\n📋 GDPR, CCPA, and SOC 2 Type II compliant — audited annually\n🏢 Data stays in your region — EU (Frankfurt), US (Virginia), or APAC (Singapore) hosting\n👤 Role-based access controls — employees only see their own data, always\n🔍 Full audit trail — every interaction logged and tamper-proof for compliance review\n🚫 No model training on your data — your conversations never improve our AI models\n👁 Data retention configurable — set deletion schedules to match your compliance requirements\n\nEnterprise legal review package (DPA, security questionnaire) available on request.',
        ),
      },
      {
        id: 7, title: 'Impact & ROI',
        elements: twoCol(
          'Measurable Impact for Your HR Team',
          '📊 Key Metrics (100-day avg, enterprise clients)\n\n87%\nOf routine queries resolved without human intervention\n\n8 seconds\nAverage resolution time (vs 4 hours manually)\n\n92%\nEmployee satisfaction with Alex interactions\n\n$280k/year\nCost savings per 500-person company\n(vs 2 additional HR generalists)',
          '✅ What Your HR Team Gets Back\n\nBack from Alex:\n→ ~62 hours/week of repetitive query handling\n→ Policy administration: automated\n→ Leave approvals: automated\n→ Compliance reminders: automated\n\nFree to focus on:\n→ Strategic workforce planning\n→ Culture & engagement programmes\n→ Talent development & succession\n→ Complex ER cases requiring empathy\n→ Leadership coaching & development',
        ),
      },
      {
        id: 8, title: 'Try Alex Now',
        elements: title(
          'Experience Alex Yourself — Ask Your First Question Now 💬',
          'Try: "What\'s our parental leave policy?" or "How do I submit a time-off request?" or "When is my next performance review?" Alex is live and ready to help right now.',
        ),
      },
    ],
  },

  // ── 6. AI Customer Support Manager (9 slides) ──────────────────────────────
  '6': {
    templateId: '6',
    slides: [
      {
        id: 1, title: 'The Support Crisis',
        elements: title(
          'Your Customers Can\'t Wait — But Your Team Can\'t Scale ⏳',
          '73% of customers leave after one bad support experience. And ticket volume grows 30% every year while hiring more agents is 10x more expensive. AI-powered support isn\'t the future — it\'s the only viable path.',
        ),
      },
      {
        id: 2, title: 'The Problem by Numbers',
        elements: threeKPI(
          'The Customer Support Crisis in Numbers',
          '😤 Customer Expectations\n\n90%\nExpect an immediate response\n\n60%\nDefine "immediate" as 10 minutes or less\n\n73%\nLeave after 1 bad experience',
          '💸 Business Impact\n\n$1.6T\nLost annually to poor customer service\n\n30%\nAvg. year-over-year ticket volume growth\n\n$25-65\nCost per agent-handled ticket',
          '🤯 Team Reality\n\n45%\nOf agents\' time on repetitive Tier-1 questions\n\n60%\nAgent burnout rate in high-volume support teams\n\n6 months\nAvg. time to hire and train a new support agent',
        ),
      },
      {
        id: 3, title: 'Instant Tier-1 Resolution',
        elements: content(
          'Resolve 70% of Tickets Instantly — Before a Human Gets Involved',
          'Our AI Support Manager handles your highest-volume, lowest-complexity tickets automatically:\n\n✅ Order status & real-time shipping tracking\n✅ Password resets and account access recovery\n✅ Product FAQs, setup guides, and troubleshooting\n✅ Refund eligibility checks and initiation\n✅ Billing inquiries, plan changes, and invoice retrieval\n✅ Returns and exchange initiations\n✅ Appointment scheduling and rescheduling\n\nAverage AI resolution time: 8 seconds.\nCustomer satisfaction on AI-handled tickets: 4.6 / 5 ⭐\nFirst Contact Resolution rate: 89% (industry avg: 74%)',
        ),
      },
      {
        id: 4, title: 'Smart Escalation',
        elements: bullets(
          'When AI Escalates — It Does It Right',
          [
            '😤 Sentiment analysis detects frustration before the customer explicitly expresses it',
            '🧠 Intent recognition routes complex issues to the right specialist team in under 3 seconds',
            '📋 Full context transfer — the human agent receives the entire conversation with a recommended resolution',
            '⚡ Priority scoring — VIP customers, high-value orders, and at-risk accounts escalated faster',
            '🌍 Language detection — escalates to a native-language speaker automatically when available',
            '🔁 Post-resolution check-in — AI follows up 24 hours later to confirm resolution and collect CSAT',
          ],
        ),
      },
      {
        id: 5, title: 'Knowledge Base',
        elements: twoCol(
          'Continuously Learning Knowledge Base',
          '📚 How It Works\n\nIngest your existing help docs, FAQs, and product documentation in one click\n\nAlex indexes them instantly — 500-page manuals processed in under 60 seconds\n\nEvery unanswered question flags a knowledge gap → your team fills it → Alex learns\n\n🔄 Continuous Improvement\n\nWeekly AI-generated gap report: "These 15 questions had low confidence — here\'s the suggested content"\n\nYour team reviews and approves — not writes from scratch',
          '📈 The Flywheel\n\nMore conversations\n↓\nMore learning\n↓\nHigher confidence answers\n↓\nHigher CSAT\n↓\nLess escalations\n↓\nMore time for strategic work\n↓\nMore conversations (now higher value)\n\n⭐ After 90 days:\n→ 87% of queries resolved without human\n→ Average confidence score: 94%\n→ Knowledge base: 98% coverage',
        ),
      },
      {
        id: 6, title: 'Analytics Dashboard',
        elements: twoCol(
          'Real-Time Support Intelligence — Your Control Tower',
          '📊 Key Metrics Dashboard\n\nFirst Contact Resolution Rate\n→ Industry avg: 74% | With AI: 89% ✅\n\nAverage Handle Time\n→ Before: 8.2 min | After: 2.1 min ✅\n\nCustomer Satisfaction (CSAT)\n→ Before: 3.8/5 | After: 4.6/5 ✅\n\nTicket Volume Handled by AI\n→ 70% fully automated\n→ 20% AI-assisted (human confirms)\n→ 10% fully human (complex cases)',
          '🔥 Live Trends (This Week)\n\nTop ticket categories:\n1. Shipping delays — 23% (⬆ 40% vs last week)\n2. Password reset — 18%\n3. Refund requests — 15%\n4. Feature questions — 14%\n5. Billing inquiries — 11%\n\n⚠ Alert: Shipping complaints up 40%\n→ Root cause: Carrier delay in DE region\n→ Recommended action: Proactive outreach to 847 affected orders\n→ Estimated churn prevention: $45,000',
        ),
      },
      {
        id: 7, title: 'Integrations',
        elements: twoCol(
          'Plug Into Your Existing Support Stack — Day 1',
          '🎫 Helpdesk & Ticketing\nZendesk (native app)\nIntercom (native)\nFreshdesk\nSalesforce Service Cloud\nHubSpot Service Hub\nJira Service Management\n\n💬 Live Chat\nLiveChat\nTidio\nDrift\nCrisp\n\n📧 Email\nGmail / Google Workspace\nMicrosoft 365 / Outlook\nFront',
          '🛒 E-Commerce\nShopify (real-time order data)\nWooCommerce\nMagento\nBigCommerce\n\n🏢 CRM\nSalesforce\nHubSpot\nPipedrive\n\n🔄 Automation\nZapier (5,000+ apps)\nMake\nAPI + Webhooks\n\n🔐 Security\nSOC 2 Type II\nGDPR compliant\nSSO: Okta, Azure AD',
        ),
      },
      {
        id: 8, title: 'ROI Calculator',
        elements: twoCol(
          'What You\'ll Save — Conservative Estimates for 50-Agent Team',
          '🧮 Cost Reduction\n\nCurrent cost per ticket (50 agents): $35 avg\nWith AI: $8 avg (70% automated @ $2, 30% assisted @ $22)\n\nTicket volume: 5,000/month\nCurrent cost: $175,000/month\nWith AI: $40,000/month\nSavings: $135,000/month → $1.62M/year\n\n📈 Revenue Protection\n\nCurrently losing: ~73 customers/month to poor service\nAvg LTV: $2,400\nRevenue saved: $175,200/year',
          '✅ Full 12-Month ROI Summary\n\nCost savings: $1,620,000\nRevenue protection: $175,200\nAgent productivity gain: $240,000 (repurposed to Tier-2+3)\n\nTotal value: ~$2.03M\n\nPitch Avatar annual investment\n(50 seats, Business plan): ~$47,400\n\nROI: 4,183%\nBreakeven: Day 1 of going live\n\n[Note: Based on customer averages. We provide a free 30-day pilot with your actual data before commitment.]',
        ),
      },
      {
        id: 9, title: 'Go Live in 5 Minutes',
        elements: title(
          'Live on Your Website in 5 Minutes — Seriously ⚡',
          'Paste one line of JavaScript. Connect your helpdesk (Zendesk, Intercom, Freshdesk). Upload your knowledge base. Done. Your AI Support Manager starts learning from Day 1 and improves with every single conversation. We\'ll hold your hand through every step.',
        ),
      },
    ],
  },

  // ── 7. GDPR Compliance Training (10 slides) ─────────────────────────────────
  '7': {
    templateId: '7',
    slides: [
      {
        id: 1, title: 'GDPR Overview',
        elements: title(
          'GDPR Compliance Training 🔒',
          'Mandatory for all employees who handle personal data of EU residents — regardless of your role. Estimated time: 18 minutes. A completion certificate will be issued upon passing the quiz at the end.',
        ),
      },
      {
        id: 2, title: 'What is GDPR?',
        elements: content(
          'Understanding the General Data Protection Regulation',
          'GDPR (General Data Protection Regulation) came into force on 25 May 2018 across all 27 EU member states. It governs how organizations collect, store, process, and share personal data of EU residents — regardless of where your organization is based.\n\nKey figures to remember:\n⚠️ €20 million or 4% of global annual turnover — maximum fine for serious violations (whichever is higher)\n⏱ 72 hours — maximum time to report a data breach to regulatory authorities\n📋 30 days — maximum time to respond to a Subject Access Request (SAR) from an individual\n\nIgnorance is not a legal defense. Every team member who handles personal data is individually responsible.',
        ),
      },
      {
        id: 3, title: '7 Core Principles',
        elements: bullets(
          'The 7 Principles of GDPR — Know Them All',
          [
            '1️⃣ Lawfulness, Fairness & Transparency — always have a clear legal basis; tell people what you do with their data',
            '2️⃣ Purpose Limitation — collect data only for a specific, explicit, and legitimate purpose',
            '3️⃣ Data Minimisation — collect only what you genuinely need; delete the rest',
            '4️⃣ Accuracy — keep personal data up to date; correct errors promptly when identified',
            '5️⃣ Storage Limitation — set and enforce retention periods; do not keep data longer than necessary',
            '6️⃣ Integrity & Confidentiality — protect data from unauthorised access, loss, and destruction',
            '7️⃣ Accountability — be able to demonstrate compliance at any time; document everything',
          ],
        ),
      },
      {
        id: 4, title: '6 Lawful Bases',
        elements: twoCol(
          'The 6 Lawful Bases for Processing Personal Data',
          '1. Consent\nFreely given, specific, informed, and unambiguous. Must be as easy to withdraw as to give.\n\n2. Contract\nProcessing necessary to fulfil a contract with the individual (e.g., processing payment details to deliver an order).\n\n3. Legal Obligation\nProcessing required by law (e.g., payroll tax reporting to HMRC).',
          '4. Vital Interests\nProcessing necessary to protect someone\'s life (rare — emergency medical situations).\n\n5. Public Task\nProcessing by public authorities in the exercise of official authority.\n\n6. Legitimate Interests\nYour interests as a business — but must be balanced against individual rights. NOT a catch-all. Requires a documented Legitimate Interests Assessment (LIA).\n\n⚠ Always document your chosen lawful basis BEFORE processing begins.',
        ),
      },
      {
        id: 5, title: 'Individual Rights',
        elements: bullets(
          'The 8 Rights of Individuals Under GDPR',
          [
            '1. Right to be Informed — individuals must know what data you hold, why, and for how long',
            '2. Right of Access — they can request a copy of all personal data you hold about them (SAR — respond within 30 days)',
            '3. Right to Rectification — they can ask you to correct inaccurate or incomplete data',
            '4. Right to Erasure ("Right to be Forgotten") — in certain circumstances, they can request deletion of their data',
            '5. Right to Restrict Processing — they can limit how you use their data while a dispute is resolved',
            '6. Right to Data Portability — they can receive their data in a machine-readable format to transfer to another provider',
            '7. Right to Object — they can object to processing, especially for marketing or legitimate interests',
            '8. Rights re Automated Decision-Making — they can refuse to be subject to fully automated decisions that affect them legally',
          ],
        ),
      },
      {
        id: 6, title: 'Data Breach Protocol',
        elements: twoCol(
          'What To Do If You Suspect a Data Breach',
          '🚨 STOP — Do not attempt to fix it yourself\nDo not delete files or cover your tracks — this significantly worsens the legal position.\n\n📞 REPORT IMMEDIATELY to your DPO\nWithin 1 hour of discovery:\ndpo@yourcompany.com\n+44 20 1234 5678 (24/7 hotline)\n\n📋 DOCUMENT EVERYTHING NOW\nWrite down:\n→ What happened\n→ When you discovered it\n→ What data types were involved\n→ How many individuals affected\n→ Who may have accessed the data',
          '⏱ Breach Response Timeline\n\nHour 0 — You discover the issue\nHour 1 — Report to DPO (MANDATORY)\nHour 4 — Internal incident team convened\nHour 8 — Initial impact assessment\nHour 24 — Scope and severity confirmed\nHour 72 — Regulatory notification filed with ICO/DPA (if required)\nDay 5–14 — Affected individuals notified (if required)\nDay 30 — Post-incident review completed\n\n⚠️ Missing the 72-hour regulatory notification window without documented good reason is itself a separate GDPR violation.',
        ),
      },
      {
        id: 7, title: 'Third-Party Processors',
        elements: content(
          'Third-Party Data Processors — Your Responsibilities',
          'When you share personal data with a third party (a supplier, software vendor, or contractor), they become a data processor and YOU remain the data controller — legally responsible.\n\nBefore sharing ANY personal data with a third party:\n\n1. Confirm they are GDPR compliant — request their DPA (Data Processing Agreement)\n2. Sign a DPA — this is legally required; storing it is mandatory\n3. Check their subprocessors — they must disclose and you must approve\n4. Review their security certifications — SOC 2, ISO 27001, or equivalent\n\nDo NOT share personal data via:\n❌ Personal email accounts\n❌ WhatsApp or consumer messaging apps\n❌ Unsecured file-sharing links\n❌ USB drives without encryption\n\nFor approved vendors: use only the approved file-sharing tools in our vendor register.',
        ),
      },
      {
        id: 8, title: 'Do\'s and Don\'ts',
        elements: twoCol(
          'GDPR in Practice — Real Scenarios',
          '✅ DO\n\nDocument why you collect every piece of personal data\n\nUse only approved cloud tools for storing personal data\n\nAnonymize data in analytics wherever possible\n\nReport any suspected breach within 1 hour — even if unsure\n\nRespond to SAR requests within 30 days (with legal support)\n\nDelete data when it reaches the end of its retention period\n\nGet explicit consent before adding anyone to a marketing list',
          '❌ DON\'T\n\nShare login credentials for systems containing personal data\n\nSend personal data via personal email or consumer file-sharing\n\nKeep data "just in case" — retention periods are mandatory\n\nAssume consent is implied — it must be explicit and documented\n\nProcess data for purposes other than those stated at collection\n\nIgnore or delay responding to a Data Subject Access Request\n\nUse personal data for profiling without a legitimate interests assessment',
        ),
      },
      {
        id: 9, title: 'Practical Examples',
        elements: bullets(
          'Spot the GDPR Violation — Can You Identify the Problem?',
          [
            '⚠ A sales rep exports all 10,000 contacts from the CRM and emails the list to themselves "for reference" — VIOLATION: unauthorised transfer, likely breach',
            '⚠ Marketing adds opt-in checkbox pre-ticked to a signup form — VIOLATION: consent must be active, not pre-assumed',
            '⚠ HR keeps ex-employee records indefinitely "in case they reapply" — VIOLATION: Storage Limitation principle breached',
            '⚠ A developer uses real customer data in a test environment — VIOLATION: must use anonymized or synthetic data only',
            '⚠ A customer requests all data held about them; the team ignores it for 5 weeks — VIOLATION: SAR must be fulfilled within 30 days',
            '⚠ Analytics tracking is enabled for all visitors without a cookie banner — VIOLATION: requires informed consent under GDPR + ePrivacy',
          ],
        ),
      },
      {
        id: 10, title: 'Knowledge Check',
        elements: title(
          'Knowledge Check — Let\'s See What You\'ve Learned ✅',
          'Complete the 10-question quiz to receive your GDPR Compliance Certificate. A score of 80% or above is required. You have unlimited attempts — review the slides if needed. Good luck! Your certificate will be emailed and logged in your compliance training record.',
        ),
      },
    ],
  },

  // ── 8. EU AI Act Compliance Training (9 slides) ─────────────────────────────
  '8': {
    templateId: '8',
    slides: [
      {
        id: 1, title: 'Introduction',
        elements: title(
          'EU AI Act Compliance Training 🤖⚖️',
          'The EU AI Act is the world\'s first comprehensive legal framework for artificial intelligence. It fully applies from August 2026. It affects any organization that develops, deploys, or uses AI systems that may affect EU residents.',
        ),
      },
      {
        id: 2, title: 'Key Dates & Scope',
        elements: twoCol(
          'What You Need to Know — Scope & Timeline',
          '🗓 Implementation Timeline\n\nFeb 2025 — Prohibited AI practices banned\nAug 2025 — GPAI model rules apply\nAug 2026 — High-risk AI obligations apply\nAug 2027 — High-risk AI in Annex I products\n\n🌍 Who It Applies To\n\nAny organization that:\n→ Develops AI systems (provider)\n→ Deploys AI systems (deployer)\n→ Uses AI-generated outputs to make decisions\n\n…that affect people located in the EU — regardless of where your company is based.',
          '⚠️ Penalties\n\n🔴 Prohibited practices violations:\n€35 million or 7% global turnover\n(whichever is higher)\n\n🟡 High-risk AI non-compliance:\n€15 million or 3% global turnover\n\n🟢 Providing incorrect information:\n€7.5 million or 1.5% global turnover\n\nSME cap: 2% for most violations\n\n📋 Enforcement:\nEach EU member state designates a national supervisory authority (like ICO for UK GDPR)\n\nEU AI Office for General Purpose AI models',
        ),
      },
      {
        id: 3, title: 'Risk Classification',
        elements: content(
          'The Four-Tier Risk Classification System',
          'The EU AI Act classifies ALL AI systems into four risk levels:\n\n🚫 Unacceptable Risk — BANNED immediately\nSocial scoring by governments, subliminal manipulation, exploitation of vulnerabilities, real-time mass biometric surveillance in public spaces, predictive policing based solely on profiling\n\n🔴 High Risk — STRICT COMPLIANCE OBLIGATIONS\nRecruitment & hiring tools, credit scoring & loan decisions, medical devices, critical infrastructure, education assessment, law enforcement, migration & border control\n\n🟡 Limited Risk — TRANSPARENCY OBLIGATIONS\nChatbots, deepfake generators, emotion recognition systems → must disclose AI involvement to users\n\n🟢 Minimal Risk — NO MANDATORY REQUIREMENTS\nSpam filters, AI in video games, basic content recommendation engines, document review tools',
        ),
      },
      {
        id: 4, title: 'Prohibited AI Practices',
        elements: bullets(
          'AI Practices Banned Under the EU AI Act — Effective February 2025',
          [
            '🚫 Social scoring — rating individuals based on behaviour for government allocation of services or benefits',
            '🚫 Subliminal manipulation — influencing decisions below the threshold of conscious awareness',
            '🚫 Exploitation of vulnerabilities — targeting age, disability, or economic situations to distort behaviour',
            '🚫 Real-time biometric identification in public spaces — live facial recognition by law enforcement (with narrow exceptions)',
            '🚫 Predictive policing — assessing individual crime risk based solely on profiling or location characteristics',
            '🚫 Emotion recognition at work or school — inferring emotional states from biometric data without explicit consent',
            '🚫 Biometric categorisation for sensitive characteristics — inferring race, political views, sexual orientation, religion from biometrics',
          ],
        ),
      },
      {
        id: 5, title: 'High-Risk Obligations',
        elements: twoCol(
          'If You Use or Deploy High-Risk AI — Your Obligations',
          '📋 Technical Documentation\nMaintain documentation throughout the full AI system lifecycle\n\nConduct and document conformity assessments before deployment\n\nRegister in the EU High-Risk AI Systems database (publicly searchable)\n\n👁 Human Oversight\nEnsure meaningful human ability to intervene at any point\n\nProvide override capabilities — not just monitoring\n\nLog all significant decisions with traceability\n\n📊 Accuracy & Bias\nMonitor continuously for accuracy degradation and bias\n\nTest across demographic groups before deployment',
          '✅ Data Governance\nUse only high-quality, representative training and testing data\n\nDocument all data sources, preprocessing, and known biases\n\nConduct regular bias audits — at least annually\n\n🔐 Cybersecurity\nProtect against adversarial attacks (data poisoning, evasion attacks)\n\nEnsure robustness across edge cases and distribution shift\n\nConduct penetration testing before deployment\n\n📣 Transparency to Users\nClearly disclose it is an AI system — not a human\n\nProvide instructions for use — including limitations\n\nExplain logic behind significant automated decisions on request',
        ),
      },
      {
        id: 6, title: 'General Purpose AI (GPAI)',
        elements: content(
          'General Purpose AI Models — Special Rules Under the EU AI Act',
          'General Purpose AI (GPAI) models — like large language models (GPT-4, Gemini, Claude) — face specific obligations as of August 2025:\n\nAll GPAI Models Must:\n📋 Publish technical documentation and provide it to downstream deployers\n📝 Comply with EU copyright law (training data transparency)\n📊 Publish a detailed summary of training data used\n\nSystemic Risk GPAI Models (above 10²⁵ FLOPs threshold):\n🔴 Conduct adversarial testing and red-teaming before release\n🔴 Report serious incidents to the EU AI Office\n🔴 Implement cybersecurity protocols against model-level attacks\n🔴 Report energy consumption of training runs\n\nPractical impact for your company:\nIf you build products on top of GPT-4, Claude, or similar — you are a "deployer" and bear the compliance obligations for how you use it.',
        ),
      },
      {
        id: 7, title: 'Your AI Register',
        elements: twoCol(
          'Building Your Company AI Register — Required by August 2026',
          '📋 What to Include for Each AI System\n\nFor every AI tool used in your department:\n\n1. AI system name and vendor\n2. Use case description — what decision does it influence?\n3. Risk classification (Unacceptable/High/Limited/Minimal)\n4. Data inputs and outputs\n5. Human oversight mechanism\n6. Vendor compliance documentation (DPA, conformity assessment)\n7. Internal owner and review date\n\n➡ Use the company AI Register template in Confluence → Compliance → AI Act',
          '🗓 Your Action Plan\n\nBy end of this month:\n→ List all AI tools used in your team (shadow AI included!)\n→ Assess risk category for each\n→ Flag any potential high-risk systems to your Compliance Lead\n\nBy end of quarter:\n→ Full AI Register submitted and approved\n→ All high-risk tools formally assessed\n→ Vendor DPAs updated to include AI Act provisions\n\nOngoing:\n→ Quarterly AI Register review\n→ Any new AI tool requires approval before use\n→ Incidents involving AI must be logged within 24 hours\n\n📧 Questions: ai-compliance@company.com',
        ),
      },
      {
        id: 8, title: 'Dos & Don\'ts',
        elements: twoCol(
          'EU AI Act in Practice — Do\'s and Don\'ts',
          '✅ DO\n\nRegister every AI tool in the company AI Register before using it\n\nDisclose when AI is involved in a decision that affects someone\n\nEnsure humans can meaningfully override AI recommendations\n\nDocument the data used to train or fine-tune any AI system\n\nReport AI-related incidents to your Compliance Lead within 24 hours\n\nRequest vendor DPAs that include EU AI Act compliance provisions\n\nConduct bias testing before deploying any AI in hiring or scoring',
          '❌ DON\'T\n\nUse AI for social scoring, emotion recognition at work, or real-time biometric surveillance\n\nDeploy a high-risk AI system without a completed conformity assessment\n\nUse AI to make fully automated decisions about people without a human override option\n\nIgnore energy consumption and sustainability requirements for model training\n\nAssume GDPR compliance = EU AI Act compliance (they are separate, both required)\n\nUse "free trial" AI tools without checking their compliance documentation\n\nTrain AI on personal data without documented lawful basis under GDPR',
        ),
      },
      {
        id: 9, title: 'Knowledge Check',
        elements: title(
          'Knowledge Check — Time to Test Your Understanding 🧠',
          'Complete the 8-question quiz to receive your EU AI Act Compliance Certificate. A score of 75% or above is required. This certificate must be renewed annually as the Act\'s secondary legislation is updated. Non-compliance carries personal liability for team leaders.',
        ),
      },
    ],
  },

  // ── 9. Anti-Bribery & Anti-Corruption Training (9 slides) ──────────────────
  '9': {
    templateId: '9',
    slides: [
      {
        id: 1, title: 'Zero Tolerance',
        elements: title(
          'Anti-Bribery & Anti-Corruption Training ⚖️',
          'Our zero-tolerance policy is absolute and non-negotiable. No business goal, client relationship, personal relationship, or financial incentive justifies bribery or corruption — ever. Understanding and following this policy is a condition of your employment.',
        ),
      },
      {
        id: 2, title: 'Legal Framework',
        elements: twoCol(
          'The Laws That Apply to You — Wherever You Are',
          '🇬🇧 UK Bribery Act 2010\nWidest reach of any anti-bribery law globally\n\n→ Applies to UK companies and their entire global operations\n→ Also applies to any company that does business in the UK\n→ Strict liability offense for companies: one employee bribing = company guilty\n→ Penalties: Unlimited fines + 10 years imprisonment for individuals\n→ Defense: Having "adequate procedures" in place (i.e., this training)',
          '🇺🇸 US Foreign Corrupt Practices Act (FCPA)\n→ Prohibits bribing foreign government officials\n→ Applies to US companies, citizens, and any company listed on US exchanges\n→ Penalties: $2 million per violation (companies) + 5 years prison (individuals)\n\n🇪🇺 EU Whistleblower Directive (2021)\n→ Mandatory anonymous reporting channels in companies 50+ employees\n→ Strong legal protections for whistleblowers across EU member states\n\n🌍 Key Rule: Our policy applies to EVERY market we operate in, even where local customs may differ.',
        ),
      },
      {
        id: 3, title: 'Definitions',
        elements: content(
          'What Constitutes Bribery and Corruption — Clearly Defined',
          'Bribery\nOffering, giving, receiving, or soliciting something of value to influence the actions of an official or any person in a position of trust. "Something of value" includes cash, gifts, entertainment, travel, favours, contracts, or preferential treatment.\n\nCorruption\nAbusing entrusted power for private gain — whether financial, reputational, or in any other form.\n\nFacilitation Payments ("Grease Payments")\nSmall payments to government officials to "speed up" routine administrative actions (permits, customs, utilities). These are ILLEGAL under the UK Bribery Act even where culturally common. We do not make them — ever.\n\nThe Newspaper Test\nBefore any decision: "Would I be comfortable if this appeared on the front page of tomorrow\'s newspaper with full context?" If the honest answer is no — don\'t do it. Report it instead.',
        ),
      },
      {
        id: 4, title: 'Warning Signs',
        elements: bullets(
          'Red Flags — Situations That Require Immediate Escalation',
          [
            '🚩 A supplier or partner requests payment in cash, via a personal account, or in cryptocurrency',
            '🚩 A government official asks for a "donation" or "fee" to process a legitimate application faster',
            '🚩 A client offers you a personal gift, holiday, or cash bonus for awarding them a contract',
            '🚩 A third party claims they have "special relationships" with officials and charges unusual fees',
            '🚩 An agent or consultant asks for payment to an offshore or anonymous account',
            '🚩 You feel pressured to sign off on an expense without seeing receipts or a clear business purpose',
            '🚩 A local partner says "this is just how business is done here" to justify an unusual payment',
          ],
        ),
      },
      {
        id: 5, title: 'Gifts & Hospitality Policy',
        elements: bullets(
          'Gifts, Hospitality & Entertainment — The Rules',
          [
            '💵 Cash or cash equivalents (gift cards, vouchers, crypto, loans) — NEVER acceptable in any amount or circumstance',
            '🎁 Gifts: Maximum value £50 / $60 / €55 — must be related to business, never cash-equivalent, never to public officials',
            '🍽 Business meals and entertainment: acceptable if modest, clearly business-related, properly receipted, and approved by your manager',
            '✈️ Travel, accommodation, or event tickets offered by third parties: requires WRITTEN approval from your line manager AND Legal before accepting',
            '📝 ALL received gifts above £20 threshold MUST be logged in the company Gifts Register within 48 hours — no exceptions',
            '🚫 NEVER offer gifts or hospitality to government officials, public servants, or their family members — even items of nominal value',
          ],
        ),
      },
      {
        id: 6, title: 'Third Parties & Due Diligence',
        elements: twoCol(
          'Third-Party Risk — Agents, Consultants & Suppliers',
          '⚠️ Why Third Parties Matter\n\nMost major bribery cases involve third parties acting on behalf of a company.\n\nUnder the UK Bribery Act, you are liable for what your agents and contractors do in your name — even if you didn\'t know.\n\n"I didn\'t know what they were doing" is NOT a legal defense.\n\n🔍 Due Diligence Required Before Engagement\n\n✅ Background check (PEP, sanctions screening)\n✅ AML (Anti-Money Laundering) check\n✅ Reference verification from independent sources\n✅ Contractual anti-bribery clause (mandatory)',
          '📋 Red Flags in Third-Party Contracts\n\n→ Vague scope of work with high fees\n→ No physical presence or business address\n→ Requests payment to personal accounts\n→ Cannot explain what services they provide\n→ Unusually high success fee only (% of contract won)\n→ Family or close relationship with decision-maker\n\n🛑 If you spot these:\n\n→ Do NOT proceed with the engagement\n→ Escalate to Legal & Compliance immediately\n→ Document everything\n→ Compliance will conduct enhanced due diligence\n\nLegal can be reached at: compliance@company.com',
        ),
      },
      {
        id: 7, title: 'Case Studies',
        elements: twoCol(
          'Learning from Real-World Violations',
          '📰 Case Study 1: The Rolls-Royce Scandal (2017)\n\nFine: £497 million (UK + US + Brazil)\n\nWhat happened: Rolls-Royce used "advisers" in multiple countries who bribed government officials to win defence and energy contracts over 24 years.\n\nThe lesson: The company claimed it didn\'t know. Courts said: "You should have known and had adequate procedures." Ignorance is not a defense.\n\n→ $197m went to UK authorities\n→ Executives personally prosecuted\n→ Stock fell 14% on announcement',
          '📰 Case Study 2: The "Reasonable Hospitality" Trap\n\nA senior sales manager at a tech firm took a government procurement officer to multiple Michelin-starred dinners over 6 months, totaling £8,400. The procurement officer subsequently awarded the company a £2.4M contract.\n\nResult: Both the executive and officer were prosecuted. The company paid a £1.8M penalty. The contract was voided. The executive received an 18-month suspended sentence.\n\nThe lesson: Even legitimate-seeming entertainment can constitute bribery if the intent or timing creates a connection to a decision.\n\n→ Always document the business purpose BEFORE the event, not after.',
        ),
      },
      {
        id: 8, title: 'How to Report',
        elements: twoCol(
          'How to Report Suspected Corruption — Your Options',
          '📣 Reporting Channels (in order of preference)\n\n1. Your direct manager\n(if not implicated in the concern)\n\n2. Legal & Compliance Team\ncompliance@company.com\n+44 20 1234 5678\n\n3. Anonymous Whistleblower Hotline\n0800 XXX XXXX (24/7, free, completely anonymous)\nwhistleblower.company.com\n(Third-party operated — we cannot trace your identity)\n\n4. External regulatory reporting\nUK: Serious Fraud Office (SFO)\nUS: DOJ / SEC\nEU: OLAF',
          '🛡️ Your Legal Protections\n\nYou are legally protected from retaliation for good-faith reporting under our policy and applicable law (UK Bribery Act, US Dodd-Frank, EU Whistleblower Directive).\n\nWhat "protected" means:\n✅ Complete confidentiality of your identity (even internally)\n✅ No disciplinary action, demotion, or dismissal\n✅ No discrimination in pay, promotion, or performance review\n✅ Free legal support if retaliation occurs despite protections\n\n❗ Retaliation against a good-faith whistleblower is a fireable offense — and potentially a criminal offense.\n\nYou do not need to be certain — if something feels wrong, report it. Investigation is our job, not yours.',
        ),
      },
      {
        id: 9, title: 'Commitment',
        elements: title(
          'Integrity Is Non-Negotiable — Thank You for Upholding It 🤝',
          'By completing this training, you confirm you have read, understood, and will comply with our Anti-Bribery & Anti-Corruption Policy. Sign the acknowledgment form in your compliance portal to complete this module and log your certificate.',
        ),
      },
    ],
  },

  // ── 10. Cyber Hygiene Training (10 slides) ────────────────────────────────
  '10': {
    templateId: '10',
    slides: [
      {
        id: 1, title: 'Why It Matters',
        elements: title(
          'Cyber Hygiene Training — Your First Line of Defense 🔐',
          '91% of cyberattacks start with a phishing email. The most sophisticated security infrastructure can be bypassed by a single employee clicking the wrong link. That employee could be any of us — which is exactly why this training exists.',
        ),
      },
      {
        id: 2, title: 'The Threat Landscape',
        elements: threeKPI(
          'The Scale of the Cyber Threat in 2026',
          '💸 Financial Impact\n\n$10.5T\nAnnual global cost of cybercrime by 2025\n\n$4.45M\nAverage cost of a data breach\n(IBM, 2024)\n\n212 days\nAvg. time to detect a breach',
          '🎯 Attack Vectors\n\n91%\nOf attacks start with phishing\n\n82%\nOf breaches involve human element\n\n$24,000\nAverage ransom payment (SMB)\n\n3.4M\nPhishing emails sent per day',
          '⚡ Speed of Attack\n\n<10 min\nTime to compromise after initial click\n\n72 hrs\nTypical time for ransomware to encrypt all files\n\n$1,270\nCost per minute of downtime for enterprise\n\n24/7\nAttackers work around the clock',
        ),
      },
      {
        id: 3, title: 'Password Security',
        elements: content(
          'Password Security — The Foundation of Everything',
          'Our company password policy (non-negotiable):\n\n✅ Minimum 14 characters — use a passphrase\n"Correct-Horse-Battery-Staple-2026!" is exponentially stronger than "P@ssw0rd!"\n\n✅ Unique password for every service — NEVER reuse across accounts\nOne breach of a reused password = all accounts compromised\n\n✅ 2FA/MFA enabled everywhere — especially email, GitHub, and Slack\nUse an authenticator app (Authy/Google Authenticator) not SMS where possible\n\n✅ Use 1Password (company-provided) — zero-knowledge encrypted\nBrowser storage and sticky notes are NOT acceptable\n\n❌ Never share your password with ANYONE — including IT. We will never ask for it.\n❌ No predictable patterns: Summer2026!, Password1!, Company#1',
        ),
      },
      {
        id: 4, title: 'Phishing Defense',
        elements: bullets(
          'How to Spot and Stop a Phishing Attack',
          [
            '📧 Check the sender address carefully — not just the display name (attackers fake display names to look legitimate)',
            '⚠️ Artificial urgency is a major red flag — "Your account will be suspended in 24 hours unless you act now!"',
            '🔗 Hover before you click — verify URLs match the expected domain exactly (paypa1.com ≠ paypal.com)',
            '📎 Unexpected attachments — never open .exe, .zip, .docm, or .xlsm files from unknown or unexpected senders',
            '💸 Wire transfer or gift card requests — these are almost always fraud, even if they appear to come from the CEO ("BEC scams")',
            '📞 Vishing — attackers also call and impersonate IT, banks, or executives. Verify by hanging up and calling back on an official number.',
            '✅ When in doubt — forward to security@company.com BEFORE clicking. No question is too small.',
          ],
        ),
      },
      {
        id: 5, title: 'Social Engineering',
        elements: twoCol(
          'Social Engineering — The Human Attack',
          '🎭 Types of Social Engineering\n\nPhishing — mass fraudulent emails\nSpear Phishing — targeted, personalized emails\nVishing — voice/phone calls\nSmishing — SMS text messages\nPretexting — fabricated scenarios ("I\'m from IT, I need your password to fix your account")\nTailgating — following someone through a secure door\nQR Code Scams — malicious QR codes on posters or emails\n\n⚠️ Social engineers are professional manipulators — they know psychology, create urgency, and exploit trust.',
          '🛡️ Your Defense Playbook\n\n1. Verify, always\nCall back on official numbers. Never use contact details from the suspicious message.\n\n2. Slow down\nUrgency is the attacker\'s weapon. Pause, think, verify.\n\n3. Trust your gut\nIf something feels off — it probably is. Report it.\n\n4. Protect physical security\nNever let tailgaters through secure doors — even if they have their arms full and look legitimate. Point them to reception.\n\n5. Lock your screen\nEvery time you step away from your desk — Win+L / Cmd+Ctrl+Q.',
        ),
      },
      {
        id: 6, title: 'Device Security',
        elements: twoCol(
          'Device Security — Non-Negotiable Rules',
          '💻 Laptop Security\n\n🔒 Lock screen whenever you step away\n(Win+L / Cmd+Ctrl+Q — make it automatic after 2 min)\n\n🚫 Never plug in USB devices you didn\'t buy yourself\n(USB drops with malware are a real, tested attack)\n\n📱 Enable full-disk encryption on all devices:\nBitlocker (Windows) | FileVault (macOS)\n\n🔄 Install security updates within 24 hours\n(Most ransomware exploits patched vulnerabilities)\n\n🏠 Never mix personal and work accounts on company devices\n\n📵 Enable remote wipe on all devices via Okta/MDM',
          '📱 Mobile Device Rules\n\n✅ Enable screen lock (biometric + PIN minimum)\n✅ Use company MDM profile (required for email access)\n✅ Enable remote wipe capability\n✅ Keep iOS/Android fully updated\n\n🚫 Don\'t jailbreak or root company devices\n🚫 Don\'t install apps from outside official stores\n🚫 Don\'t access company systems from shared/family devices\n\n🔐 Laptop Loss or Theft\n\nReport IMMEDIATELY: security@company.com\n+44 20 XXXX XXXX (24/7)\n\nOur MDM can remotely wipe the device within minutes — but only if you report fast.',
        ),
      },
      {
        id: 7, title: 'Network Security',
        elements: twoCol(
          'Network Security — Where and How You Connect Matters',
          '🌐 Public Wi-Fi Rules\n\n🚫 NEVER use public Wi-Fi for work — even with VPN as backup\nCoffee shops, airports, hotels, co-working spaces — all risky\n\nPublic Wi-Fi attacks:\n→ Man-in-the-middle: attacker intercepts all traffic\n→ Fake hotspots: "Starbucks_Guest" = attacker\'s router\n→ Packet sniffing: credentials captured in plain sight\n\n✅ Use your phone as a mobile hotspot instead\nPhone data is encrypted end-to-end — Wi-Fi is not\n\n✅ If you must use public Wi-Fi — always connect via VPN first',
          '🏠 Home Network Security\n\nYour home router is your first line of defense:\n\n① Change the default admin password immediately\n(Default: "admin/admin" — publicly documented for every router)\n\n② Use WPA3 encryption (or WPA2 at minimum)\n(Check in router settings → Wireless → Security Mode)\n\n③ Disable WPS\n(WPS PIN can be cracked in hours — turn it off)\n\n④ Create a separate guest network for IoT devices\n(Smart TVs, thermostats, cameras — keep them isolated from work devices)\n\n⑤ Keep router firmware updated\n(Most routers can auto-update — enable it)\n\n🔐 Always connect via VPN when working remotely',
        ),
      },
      {
        id: 8, title: 'Data Handling',
        elements: bullets(
          'Safe Data Handling — Protecting What We Hold',
          [
            '📁 Store work files only on company-approved storage: Google Drive, Confluence, or OneDrive — never personal Dropbox or iCloud',
            '🔐 Personal data (customer, employee, partner) must be encrypted at rest and in transit — use approved tools only',
            '🗑 Shred physical documents containing sensitive information — do not leave them in general recycling bins',
            '📧 Think before forwarding — does the recipient need to see all attachments and previous message history?',
            '☁️ Do NOT use personal AI tools (ChatGPT, Claude) with company confidential data or customer information — use only approved internal tools',
            '🚫 Do NOT share company data via personal email, WhatsApp, or consumer file-sharing services (WeTransfer, etc.)',
            '📊 Anonymize or synthesize data for testing, demos, and development environments — never use production data',
          ],
        ),
      },
      {
        id: 9, title: 'Incident Response',
        elements: timeline(
          'If You Think You\'ve Been Compromised — Act Fast',
          [
            '① STOP\n\nDo not try to fix it yourself\n\nDon\'t restart, reinstall, or delete — you may destroy forensic evidence',
            '② DISCONNECT\n\nUnplug from network (ethernet) or disable Wi-Fi\n\nDo NOT turn off the computer unless instructed',
            '③ REPORT NOW\nsecurity@company.com\n+44 20 XXXX (24/7)\n\nEven if unsure — report it',
            '④ DOCUMENT\n\nWrite down:\n→ What happened\n→ What you clicked\n→ When you noticed\n→ Any error messages',
            '⑤ WAIT\n\nIT Security team will respond within 15 minutes\n\nEarly response prevents 90% of damage',
          ],
        ),
      },
      {
        id: 10, title: 'Your Commitment',
        elements: title(
          'Seen Something Suspicious? Report It — Now 🚨',
          'There is no such thing as a "stupid" security report. Forward suspicious emails to security@company.com. If you\'ve clicked something dangerous, tell IT immediately — early response prevents 90% of damage. Security is every person\'s responsibility, every day.',
        ),
      },
    ],
  },
}
