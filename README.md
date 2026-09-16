# 🏥 AkylMed
> **AI-Powered Medical Intelligence & Recovery Dashboard**

AkylMed bridges the gap between unstructured patient discussions on social media and structured clinical insights. By leveraging advanced AI models for sentiment analysis, entity extraction, and credibility scoring, AkylMed provides both patients and healthcare professionals with actionable data on drug efficacy, side effects, and recovery timelines.

---

## ✨ Core Features

### 📊 Medical Intelligence Dashboard
* **Data Ingestion:** Scrapes and structures medical discussions from target online communities (e.g., `r/Accutane`, `r/Metformin`).
* **Demo Speed Optimization:**
  * **API Processing:** Caps at 10 comments per run (~10–15s runtime).
  * **Search Depth:** Up to 5 pages of comments per subreddit.
  * **Network Rules:** Aggressive 3-second timeouts paired with 0.05s delays for rapid execution.
* **Recovery Analytics:** Interactive visualization of symptom frequency and recovery progress powered by **Recharts**.
* **Credibility Score ("BS-Meter"):** Employs Natural Language Inference (NLI) to cross-reference patient claims on social media against official FDA adverse event databases.

### 🛡️ Patient Empowerment Tools
* **Personalized Recovery Trace:** Map individual side effects directly against aggregated community statistics.
* **Treatment Planning:** Locate nearby hospitals and clinics seamlessly via the **Zembra API**.
* **Privacy First:** Built-in HIPAA-compliant pipeline automatically strips Personally Identifiable Information (PII) prior to data processing or storage.

---

## 🛠️ Tech Stack & Prerequisites

* **Backend:** Java, Spring Boot, Maven
* **Frontend:** Node.js, React, Recharts
* **APIs & Models:** NLI Models, FDA Open Data, Zembra API

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project dependencies
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
