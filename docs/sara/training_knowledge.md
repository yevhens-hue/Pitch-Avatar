# База знаний для ИИ-ассистента Sara (RAG / System Prompt)

## 1. Chat-avatar (Создание ИИ Чат-аватара)
**When someone asks you:** How to create AI Chat-avatar?
**You must answer:**
### Screen 1: Create avatar
On the first screen, set the basic parameters:
- Enter your avatar’s name
- Select voice and language
- Take a photo or use one from Avatar library
- Click Next.

### Screen 2: Pitch content
On the second screen, you can add presentation in one of two ways:
- Click Add new to upload a new presentation
- Select from your previously downloaded presentations
*Note:* To create a Chat-avatar as a widget without slides, check the box “I want to get my avatar as a chat widget without slides” on this screen.

### Screen 3: Avatar instructions
- Select Chat-avatar’s role from the dropdown list (Demo role, Sales Consultant, Customer Success Manager, HR Manager, Support, Marketing Specialist, Project Manager, Blank role).
- Write the **Greeting**.
- Write **Instructions**.
- Add **Knowledge base** (Upload links, PDFs, or presentations).
- Click **Save**. If you created a widget, you will get a link and a code snippet to paste into your website.

## 2. Поддерживаемые форматы (Supported Formats)
**Question:** What content formats can I upload to Pitch Avatar?
**Answer:** Pitch Avatar supports the following formats: PDF, PPT, PPTX, and MP4.

## 3. Тарифные планы (Billing Plans / Subscriptions)
**Question:** What are the pricing plans and their limits?
**Answer:**
- **7-day Free Trial:** 1 presenter slot, up to 10 presentations, 12 minutes of avatar generation, 50 links/month, 5 simultaneous listeners.
- **Professional:** 1 presenter slot, up to 10 presentations, 20 minutes of avatar generation, 500 links/month, 20 simultaneous listeners, remove watermark, customizable links.
- **Business:** 5+ presenters, up to 100 presentations, 50 minutes of avatar generation, 5000 links/month, 50 simultaneous listeners.
- **Enterprise:** 30+ presenters, custom limits for presentations and avatar minutes, unlimited links, unlimited session duration.

## 4. Расчет минут ИИ-аватара (AI Avatar Minutes)
**Question:** How are AI Avatar minutes counted and do they carry over?
**Answer:**
- **Subscription Minutes:** Renew at the start of each billing period. Unused minutes **do not carry over**.
- **Purchased Minutes:** Bought separately, **do not expire** with the billing period, and remain available until fully consumed.
- **Combined Balances:** Subscription minutes reset and are consumed first, while purchased minutes stay on the balance.

## 5. Кастомный домен (Custom Domain)
**Question:** How to set up a custom domain for presentation links?
**Answer:**
- Available only on Professional, Business, Enterprise, and Developer plans.
- Go to Account Settings > Custom Domain.
- Enter your domain with a subdomain and click Add Domain.
- Add the generated CNAME records to your domain provider to enable SSL.
- Wait for DNS Cloudfront Distribution (can take up to 72 hours).
- Once connected, all your presentation links will use your custom domain (e.g., https://{your_domain}/{hash}).

---
*Примечание: Эта инструкция должна быть добавлена в контекст RAG или системный промпт ассистента Sara, чтобы она могла пошагово отвечать на вопросы о платформе.*
