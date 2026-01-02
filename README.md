# RSU iLEARN LMS

Welcome to the RSU iLEARN LMS, a modern Learning Management System built with Next.js, Firebase, and Genkit.

## About This Project

This application is a feature-rich LMS designed for educational institutions. It provides separate portals for teachers and students, with features like course management, AI-powered quiz generation, assignment creation with interactive rubrics, and a high-density SpeedGrader.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- A Firebase Project with Firestore and Authentication (Email/Password and Google) enabled.

### Running the Development Server

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### Running the Genkit AI Flows

To enable the AI features like the Quiz Generator, you need to run the Genkit development server in a separate terminal:

```bash
npm run genkit:watch
```

This will start the Genkit flows and watch for any changes.
