import { SelectedElement } from '@/components/PresentationTemplates/Editor/TemplateEditor'

export interface SlideContent {
  id: number
  elements: SelectedElement[]
}

export interface TemplateContent {
  templateId: string
  slides: SlideContent[]
}

// Helper to create basic slide structures
const createTitleSlide = (title: string, subtitle: string): SelectedElement[] => [
  { id: `img-bg`, type: 'image', x: 0, y: 0, w: 960, h: 540 },
  { id: `txt-title`, type: 'bubble', x: 80, y: 150, w: 800, h: 120, content: `Title: ${title}\n` },
  { id: `txt-sub`, type: 'bubble', x: 80, y: 290, w: 600, h: 80, content: `${subtitle}` }
]

const createContentSlide = (title: string, content: string): SelectedElement[] => [
  { id: `txt-header`, type: 'bubble', x: 40, y: 40, w: 880, h: 60, content: `Header: ${title}` },
  { id: `txt-body`, type: 'bubble', x: 40, y: 120, w: 500, h: 380, content: `${content}` },
  { id: `img-side`, type: 'image', x: 560, y: 120, w: 360, h: 380 }
]

const createBulletsSlide = (title: string, bullets: string[]): SelectedElement[] => [
  { id: `txt-header`, type: 'bubble', x: 40, y: 40, w: 880, h: 60, content: `Header: ${title}` },
  { id: `txt-bullets`, type: 'bubble', x: 40, y: 120, w: 880, h: 380, content: bullets.map(b => `• ${b}`).join('\n\n') }
]

export const MOCK_TEMPLATE_CONTENTS: Record<string, TemplateContent> = {
  '1': {
    templateId: '1',
    slides: [
      { id: 1, elements: createTitleSlide('Welcome to the Team!', 'Your journey at our company starts here. Let’s get you onboarded.') },
      { id: 2, elements: createContentSlide('Our Mission & Values', 'We strive to build innovative products that empower people worldwide. Core values: Integrity, Innovation, Teamwork.') },
      { id: 3, elements: createBulletsSlide('First Week Checklist', ['Set up your workstation and accounts', 'Meet your buddy and manager', 'Complete security awareness training', 'Review team goals and OKRs']) },
      { id: 4, elements: createContentSlide('Tools We Use', 'Slack for communication, Jira for task tracking, Notion for documentation. Make sure to download all apps from the company portal.') },
      { id: 5, elements: createTitleSlide('Any Questions?', 'Reach out to the HR team or your manager at any time. We are here to help you succeed!') }
    ]
  },
  '2': {
    templateId: '2',
    slides: [
      { id: 1, elements: createTitleSlide('Corporate Newsletter', 'Monthly updates, highlights, and team achievements.') },
      { id: 2, elements: createContentSlide('Message from the CEO', 'This month we reached a new milestone in active users. Thank you to the engineering and marketing teams for their hard work.') },
      { id: 3, elements: createBulletsSlide('Key Highlights', ['Launched feature X successfully', 'Welcomed 15 new team members', 'Opened a new office in Berlin', 'Surpassed Q3 revenue targets']) },
      { id: 4, elements: createContentSlide('Upcoming Events', 'Townhall meeting on the 15th. Summer party on the 28th. Hackathon registration opens next week.') },
      { id: 5, elements: createTitleSlide('Thank You!', 'Keep up the great work. See you next month!') }
    ]
  },
  '3': {
    templateId: '3',
    slides: [
      { id: 1, elements: createTitleSlide('Pitch Avatar Demo', 'Interactive AI presentations to boost your engagement.') },
      { id: 2, elements: createContentSlide('The Problem', 'Standard presentations are boring. Audiences lose attention after 10 minutes. Follow-ups are manual and ineffective.') },
      { id: 3, elements: createBulletsSlide('Our Solution', ['Add AI avatars that speak 40+ languages', 'Interactive widgets directly on slides', 'Real-time viewer analytics', 'Automated CRM integrations']) },
      { id: 4, elements: createContentSlide('Pricing Plans', 'Flexible plans tailored to your needs. From Pro for solo creators to Enterprise for large sales teams.') },
      { id: 5, elements: createTitleSlide('Ready to Start?', 'Sign up for a free trial today or book a dedicated onboarding session.') }
    ]
  },
  '4': {
    templateId: '4',
    slides: [
      { id: 1, elements: createTitleSlide('Sales Presentation & Qualification', 'Let’s find out if we are a match.') },
      { id: 2, elements: createContentSlide('Understanding Your Needs', 'What is your current biggest bottleneck? How much time does your team spend on manual reporting?') },
      { id: 3, elements: createBulletsSlide('Why Choose Us', ['Proven ROI within 3 months', '24/7 dedicated support', 'Seamless integration with Salesforce', 'Bank-grade security compliance']) },
      { id: 4, elements: createContentSlide('Case Study: TechCorp', 'TechCorp increased their sales meetings by 45% using our interactive AI avatars in their cold outreach.') },
      { id: 5, elements: createTitleSlide('Next Steps', 'Let’s schedule a deep-dive technical demo with your engineering team.') }
    ]
  },
  '5': {
    templateId: '5',
    slides: [
      { id: 1, elements: createTitleSlide('Meet Your AI HR Assistant', 'Automating routine HR tasks so you can focus on people.') },
      { id: 2, elements: createContentSlide('What Can I Do?', 'I can answer policy questions, schedule interviews, collect feedback, and guide new hires through the portal.') },
      { id: 3, elements: createBulletsSlide('Integration Capabilities', ['Connects with Workday and BambooHR', 'Available via Slack and Teams', 'Automatically updates employee records']) },
      { id: 4, elements: createContentSlide('Privacy First', 'All interactions are fully encrypted. We comply with strict HR data protection standards.') },
      { id: 5, elements: createTitleSlide('Try It Now', 'Type your question in the chat below to see the HR assistant in action.') }
    ]
  },
  '6': {
    templateId: '6',
    slides: [
      { id: 1, elements: createTitleSlide('AI Customer Support Manager', '24/7 intelligent support for your clients.') },
      { id: 2, elements: createContentSlide('Instant Resolutions', 'Our AI resolves up to 70% of Tier 1 support tickets instantly, reducing wait times to zero.') },
      { id: 3, elements: createBulletsSlide('Seamless Escalation', ['Detects customer frustration automatically', 'Routes complex queries to human agents', 'Provides full context to the agent upon transfer']) },
      { id: 4, elements: createContentSlide('Analytics Dashboard', 'Track resolution rates, common issues, and customer satisfaction scores in real-time.') },
      { id: 5, elements: createTitleSlide('Setup Guide', 'Integrating the widget on your site takes just 5 minutes. Scan the QR to read the docs.') }
    ]
  },
  '7': {
    templateId: '7',
    slides: [
      { id: 1, elements: createTitleSlide('GDPR Compliance Training', 'Mandatory training for all employees handling EU data.') },
      { id: 2, elements: createContentSlide('What is GDPR?', 'The General Data Protection Regulation protects the privacy rights of EU citizens. Non-compliance results in severe fines.') },
      { id: 3, elements: createBulletsSlide('Key Principles', ['Lawfulness, fairness, and transparency', 'Purpose limitation', 'Data minimization', 'Storage limitation and confidentiality']) },
      { id: 4, elements: createContentSlide('Handling Data Breaches', 'If you suspect a data breach, you must report it to the DPO within 24 hours. Do not attempt to fix it yourself.') },
      { id: 5, elements: createTitleSlide('Knowledge Check', 'Please complete the quiz on the next slide to verify your understanding.') }
    ]
  },
  '8': {
    templateId: '8',
    slides: [
      { id: 1, elements: createTitleSlide('EU AI Act Compliance', 'Understanding the new regulations for AI systems.') },
      { id: 2, elements: createContentSlide('Risk Categories', 'The Act categorizes AI systems into: Unacceptable risk, High risk, Limited risk, and Minimal risk.') },
      { id: 3, elements: createBulletsSlide('Prohibited AI Practices', ['Subliminal manipulation', 'Social scoring by public authorities', 'Real-time biometric identification in public spaces']) },
      { id: 4, elements: createContentSlide('Requirements for High-Risk AI', 'Strict obligations regarding data quality, documentation, human oversight, and robustness.') },
      { id: 5, elements: createTitleSlide('Your Responsibility', 'Ensure all AI tools used in your department are logged in the central AI register.') }
    ]
  },
  '9': {
    templateId: '9',
    slides: [
      { id: 1, elements: createTitleSlide('Anti-Bribery & Anti-Corruption', 'Maintaining integrity in our business dealings.') },
      { id: 2, elements: createContentSlide('Definitions', 'Bribery is offering or receiving something of value to influence an official act. We maintain a zero-tolerance policy.') },
      { id: 3, elements: createBulletsSlide('Gifts & Entertainment Policy', ['Never accept cash gifts', 'Gifts must be nominal in value (under $50)', 'All corporate entertainment must be pre-approved', 'Log all received gifts in the portal']) },
      { id: 4, elements: createContentSlide('How to Report', 'Use the anonymous whistleblower hotline if you suspect corrupt practices. You will be protected from retaliation.') },
      { id: 5, elements: createTitleSlide('Commitment to Ethics', 'Thank you for upholding our company values.') }
    ]
  },
  '10': {
    templateId: '10',
    slides: [
      { id: 1, elements: createTitleSlide('Cyber Hygiene Training', 'Protecting company assets and your personal data.') },
      { id: 2, elements: createContentSlide('Password Policies', 'Use passphrases with at least 14 characters. Never reuse passwords across services. Enable 2FA everywhere.') },
      { id: 3, elements: createBulletsSlide('Spotting Phishing Emails', ['Check the sender address carefully', 'Look out for artificial urgency', 'Do not click suspicious links or download unexpected attachments']) },
      { id: 4, elements: createContentSlide('Device Security', 'Never leave your laptop unlocked in public. Use VPN when connecting to public Wi-Fi. Do not plug in unknown USB drives.') },
      { id: 5, elements: createTitleSlide('Stay Safe', 'Security is everyone’s responsibility. Report suspicious emails to the IT Helpdesk.') }
    ]
  }
}
