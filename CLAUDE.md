# Cape Launch Tracker — Project Context

## About This Project

A Progressive Web App (PWA) that helps people living near Cape Canaveral easily track upcoming rocket launches. The goal is one simple page that shows what's launching, when, who's launching it, what the weather will be, and sends push notifications before liftoff.

The app should be installable on Android phones via "Add to Home Screen" so it feels like a native app.

## About the Developer

Bryan is a complete beginner — first software project ever. No JavaScript knowledge, no web development experience, no familiarity with frameworks. All explanations should be in plain English, no assumed knowledge. When making technical decisions, briefly explain why that choice was made. Introduce concepts gradually as they become relevant.

## How to Communicate

- Explain things like a patient teacher talking to someone with no technical background
- Define jargon when it's first introduced
- When making decisions, briefly say why
- Each phase should produce something runnable and visible before moving on
- Check in before starting each new phase — do not assume approval

## Core Features (MVP)

1. List of upcoming launches from Cape Canaveral / Kennedy Space Center
2. Per launch: countdown timer, rocket name, rocket size, company (SpaceX / ULA / etc.), mission/payload name, launch pad
3. Weather forecast for Cape Canaveral at the scheduled launch time
4. Push notifications: 30 minutes before launch, and again at T-5 minutes
5. Embedded YouTube live stream (or a clear "Watch Live" link) when a stream is available
6. Installable on Android via "Add to Home Screen" (PWA)

## Data Sources

- **Launch data:** The Space Devs Launch Library 2 API — https://thespacedevs.com/llapi
  - Free tier. Filter by Cape Canaveral / KSC launch sites.
- **Weather:** National Weather Service API — https://api.weather.gov
  - No API key required. Use Cape Canaveral coordinates.
- **Live video:** YouTube stream URL pulled from the Launch Library API response when available.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **PWA support:** next-pwa (or equivalent) for service worker, installability, push notifications
- **Hosting:** Vercel (free tier)
- **Version control:** Git + GitHub

## Build Philosophy

- Build in small phases — each phase must run and be visible before starting the next
- No over-engineering; keep things simple and understandable
- Don't write code until the plan for a phase is approved
- Prefer straightforward solutions over clever ones
