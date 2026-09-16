AkylMed: AI-Powered Medical Intelligence & Recovery Dashboard
AkylMed bridges the gap between patient discussions on social media and structured clinical insights. Using AI models for sentiment analysis, entity extraction, and credibility scoring, AkylMed provides patients and healthcare professionals with actionable data on drug efficacy, side effects, and recovery timelines.

Core Features
1. Medical Intelligence Dashboard
Data Ingestion: Scrapes medical discussions from online subreddits (e.g., r/Accutane, r/Metformin).

Demo Speed Optimization:

API Limit: 10 comments per run (~10–15 second processing).

Search Depth: 5 pages of comments per subreddit.

Network Parameters: Aggressive timeouts (3s) with 0.05s delays.

Recovery Analytics: Visualizes symptom frequency and recovery progress using Recharts.

Credibility Score (BS-Meter): Employs Natural Language Inference (NLI) to cross-reference social media drug claims against official FDA adverse event data.

2. Patient Empowerment Tools
Personalized Recovery Trace: Tracks individual side effects against aggregated community statistics.

Treatment Planning: Locates local hospitals and clinics via the Zembra API.

Privacy First: HIPAA-compliant pipeline that strips personally identifiable information (PII) before processing or storing data.




backend:

# Build the project

mvn clean install

# Run the application

mvn spring-boot:run

frontend:

npm install
npm run dev
