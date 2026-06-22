import re

with open('src/data/template-content.ts', 'r') as f:
    content = f.read()

# Replace manually for template 2
slides_str = """
      {
        id: 1, title: 'This Month\\'s Edition',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+1',
        elements: title(
          'Company Newsletter — May 2026 📣',
          'Highlights, wins, team news, and what\\'s coming next. Grab a coffee — this is your monthly catch-up on everything that happened across Pitch Avatar.',
        ),
      },
      {
        id: 2, title: 'CEO Message',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+2',
        elements: content(
          'A Message from Our CEO',
          'Team,\\n\\nThis month we crossed a milestone I\\'m incredibly proud of: 10,000 active customers. None of this would be possible without each one of you.\\n\\nWe launched three major features, expanded to two new markets, and our NPS hit an all-time high of 72. Customer stories this month have been overwhelming — they\\'re not just saving time, they\\'re winning deals they would have lost.\\n\\nAs we head into Q3, our focus sharpens on retention, enterprise expansion, and our upcoming Series B. More on that at next week\\'s all-hands.\\n\\nThank you for everything you do every single day.\\n\\n— Olena, CEO',
        ),
      },
      {
        id: 3, title: 'Key Wins This Month',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+3',
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
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+4',
        elements: twoCol(
          'What\\'s New in the Product — May Releases',
          '✅ Shipped in May\\n\\n🤖 AI Script Generator v2\\nFaster, smarter, now supports 12 new languages\\n\\n📊 Analytics Dashboard v2.0\\nCustom date ranges, export to PDF, shareable links\\n\\n🔗 HubSpot Integration (native)\\nTwo-way sync — no Zapier required\\n\\n📱 Mobile App — iOS & Android\\n50k downloads in first month!',
          '🔜 Coming in June\\n\\n🎨 New Theme Builder\\nFull brand customization — fonts, colors, logo\\n\\n🎙 Voice Cloning (Beta)\\nCreate your AI avatar with your own voice\\n\\n📧 Email Templates\\nSend personalized video links straight from the app\\n\\n🔌 Salesforce Native App\\nLaunch from within SF — zero tab-switching\\n\\n📈 Heatmaps\\nSee exactly where viewers\\'s attention goes',
        ),
      },
      {
        id: 5, title: 'Team Spotlight',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+5',
        elements: content(
          'Employee Spotlight — Maria K., Senior Engineer',
          '"Shipping the analytics revamp in 6 weeks was one of the hardest technical challenges I\\'ve worked on. We rewrote the entire data pipeline, migrated 2TB of event data without downtime, and launched 3 days early. The moment I saw the first customer tweet about the new dashboards — that made it all worth it."\\n\\n— Maria K., Senior Engineer, voted Employee of the Month\\n\\nMaria joined 3 years ago as a junior developer. She has since mentored 4 junior engineers, led 2 major architecture migrations, and spoken at two industry conferences.\\n\\n🏆 Maria receives a £500 learning budget top-up and a team dinner on us.',
        ),
      },
      {
        id: 6, title: 'People & Culture',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+6',
        elements: twoCol(
          'People News — Celebrations & Milestones',
          '🎂 Work Anniversaries\\n\\nAnna S. — 3 years in Engineering\\nMax T. — 1 year in Customer Success\\nLucas M. — 5 years in Sales! 🎖\\nPriya K. — 2 years in Design\\n\\n👶 Family News\\nCongrats to the Petrov family on the arrival of baby Mia! 🍼\\nCongrats to David & Emma L. — engaged! 💍\\n\\n🎓 Certifications This Month\\n→ 4 team members earned AWS certifications\\n→ 2 earned GDPR practitioner certificates\\n→ 1 completed Stanford Executive Leadership program',
          '🏅 Promotions\\n\\nKate B. → Senior Product Manager\\nAlex H. → Team Lead, Engineering\\nSofia R. → Director, Customer Success\\n\\n🤝 New Joiners (12 this month)\\nEngineering: 5 new engineers (2 senior, 3 mid)\\nSales: 3 Account Executives\\nMarketing: 2 Growth Marketers\\nProduct: 1 Product Designer\\nOps: 1 Finance Analyst\\n\\n📣 Departures\\nWe thank James P. for 4 years of dedication. He moves to a VP role at a portfolio company — we\\'re cheering him on!',
        ),
      },
      {
        id: 7, title: 'Upcoming Events',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+7',
        elements: timeline(
          'What\\'s Coming in June',
          [
            '📅 Jun 3\\n\\nAll-Hands Meeting\\n(Hybrid)\\n\\nQ2 results + Q3 roadmap reveal\\n\\nZoom link in calendar',
            '⚡ Jun 10–11\\n\\nHackathon\\n"Build Anything"\\n\\n48h sprint\\nPrizes: £5k · £3k · £1k\\n\\nAll welcome!',
            '🎓 Jun 17\\n\\nLeadership Workshop\\n"Radical Candour"\\n\\nFor team leads & senior ICs\\n\\nRegister via Confluence',
            '🎉 Jun 20\\n\\nSummer Party\\nRooftop, London HQ\\n6pm – late\\n\\nFamilies & +1s welcome\\nRSVP by Jun 13',
            '📊 Jun 27\\n\\nBoard Meeting\\n& Investor Update\\n\\nInternal only — leadership team',
          ],
        ),
      },
      {
        id: 8, title: 'Until Next Month!',
        image_url: 'https://placehold.co/960x540/eef2ff/0076ff?text=Corporate+Newsletter+8',
        elements: title(
          'That\\'s a Wrap — See You in June! 👋',
          'Have a story, win, or milestone to feature in next month\\'s newsletter? Drop it in #newsletter-submissions on Slack by June 20. Together, we\\'re building something special — and these stories prove it.',
        ),
      },
"""

def replace_slides(m):
    return m.group(1) + slides_str + m.group(3)

content = re.sub(r"('2': \{\s*templateId: '2',\s*slides: \[)(.*?)(\],\s*\},\s*// ── 3\.)", replace_slides, content, flags=re.DOTALL)

with open('src/data/template-content.ts', 'w') as f:
    f.write(content)
