# CareerFlow

CareerFlow is a full-stack career management platform designed to help job seekers organize their job search, improve their professional profile, and prepare stronger job applications from one place.

The project combines application tracking, resume management, AI-assisted analysis, job matching, cover letter generation, LinkedIn and portfolio analysis, and practical career tools in a single dashboard.

## Overview

Job searching usually involves several disconnected tools: spreadsheets for tracking applications, separate resume builders, AI tools for writing cover letters, and different services for reviewing resumes or LinkedIn profiles.

CareerFlow was built to bring these workflows together.

Users can manage job opportunities, track application progress, create and analyze resumes, compare their experience against job descriptions, generate tailored application content, and monitor their overall job search activity.

## Features

### Dashboard

The main dashboard provides an overview of the user's job search and quick access to CareerFlow's core tools.

### Job Management

Users can save and manage job opportunities directly inside CareerFlow.

Each job can be assigned a status:

- Saved
- Interested
- Applied
- Archived

This makes it easier to track opportunities throughout the application process.

### Application Tracking

CareerFlow provides a dedicated area for managing job applications and keeping application-related information organized.

### Resume Builder

Users can create and maintain resumes directly inside the platform.

Saved resumes can also be reused by other CareerFlow tools such as Job Match and Cover Letter generation.

### Resume Analyzer

Users can upload a resume and receive an AI-assisted analysis covering areas such as:

- ATS compatibility
- Professional summary
- Work experience
- Skills
- Formatting and structure
- Impact and achievements

The analyzer provides both an overall score and detailed recommendations for improvement.

### Job Match

Job Match compares a saved resume against a specific job description.

The analysis evaluates factors such as experience alignment, relevant skills, ATS keywords, missing requirements, and overall compatibility with the position.

### Apply Copilot

Apply Copilot is designed to help users prepare for a specific job application by combining resume information with the target job description.

The goal is to reduce the amount of repetitive work required when tailoring applications for different positions.

### Cover Letter Generator

Users can select one of their saved resumes, provide a job title, company, and job description, and generate a tailored cover letter.

### LinkedIn Analyzer

CareerFlow can analyze professional profile information and provide feedback across areas such as:

- Headline
- About section
- Experience
- Skills
- Keywords and searchability

It can also provide suggested improvements for the profile headline and About section.

### Portfolio Analyzer

The Portfolio Analyzer reviews portfolio content and provides feedback intended to help users improve how their work and professional experience are presented.

### Career Tools

CareerFlow also includes smaller utilities that support the job search process without requiring AI.

Current tools include:

**Salary Calculator**

Converts annual compensation into monthly, bi-weekly, weekly, and hourly estimates.

**Follow-up Planner**

Helps users determine an appropriate date to follow up after submitting a job application.

**Job Search Progress**

Uses the user's saved job data to provide an overview of Saved, Interested, Applied, and Archived opportunities.

## AI Experience

Several CareerFlow features perform operations that can take a few seconds to complete.

The interface provides loading states and clear feedback while an analysis or generation request is running, helping users understand that their request is being processed instead of leaving the interface unresponsive.

AI-assisted features currently include resume analysis, job matching, profile analysis, portfolio analysis, application assistance, and cover letter generation.

## Tech Stack

CareerFlow is built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Authentication
- Google Gemini API
- Stripe
- Vercel
- Lucide React

## Architecture

The application uses the Next.js App Router and separates server-side data operations from interactive client components.

Supabase is responsible for authentication and persistent application data.

Server Actions are used for operations such as creating and updating jobs, processing forms, running analyses, and interacting with backend services.

Interactive interface elements such as calculators, loading states, dropdowns, and form controls are implemented as reusable client components.

## Authentication

CareerFlow includes user authentication powered by Supabase.

Protected dashboard routes require an authenticated user, and user-specific database queries are scoped to the authenticated account.

## Database

CareerFlow stores user-specific information including:

- User profiles
- Jobs
- Applications
- Resumes
- Resume analyses
- LinkedIn analyses
- Portfolio analyses
- Generated cover letters
- Job match results

Supabase Row Level Security is used to help isolate user data.

## Payments and Credits

CareerFlow includes a credit-based architecture for AI-powered features.

Stripe integration provides the foundation for billing and future subscription or credit purchase functionality.

Different AI operations can consume different amounts of credits depending on the feature.

## Project Structure

A simplified view of the project structure:

```text
src/
├── app/
│   ├── (auth)/
│   ├── api/
│   └── dashboard/
│       ├── applications/
│       ├── apply/
│       ├── billing/
│       ├── career-tools/
│       ├── cover-letter/
│       ├── job-match/
│       ├── jobs/
│       ├── linkedin/
│       ├── portfolio/
│       ├── profile/
│       ├── resume-analyzer/
│       ├── resume-builder/
│       └── settings/
│
├── components/
├── lib/
└── types/
```

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd careerflow
```

Install the dependencies:

```bash
npm install
```

Create a `.env.local` file and configure the required environment variables.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

NEXT_PUBLIC_SITE_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Never commit `.env.local` or production secrets to the repository.

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production

CareerFlow is deployed using Vercel.

Production environment variables are configured directly through the deployment environment rather than being stored in the repository.

## Current Status

CareerFlow is actively being developed.

The current version includes the core dashboard, authentication, job tracking, resume tools, AI-assisted career analysis, cover letter generation, career utilities, credit infrastructure, and production deployment.

Future development will focus on improving application workflows, expanding AI-assisted features, strengthening analytics, and continuing to improve the overall user experience.

## Purpose of the Project

CareerFlow was created as a full-stack software development project focused on solving a real problem rather than building isolated demonstration features.

The project includes authentication, database design, server-side logic, third-party APIs, AI integration, payments infrastructure, reusable UI components, responsive design, deployment, and production debugging.

It is also an ongoing project, with features being designed, implemented, tested, and improved based on the experience of using the application itself.

## Author

Developed by Leiziane Trevisan Dardin.