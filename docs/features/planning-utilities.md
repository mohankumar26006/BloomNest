# Planning & Utilities Features

This document outlines the logistical, planning, and partner-oriented tools in BloomNest.

## 1. Hospital Bag Checklist (`HospitalBagPage.tsx`)
A comprehensive, interactive checklist for labor day preparation.
- **Categorization:** Items are split into logical tabs: Mother, Baby, Partner, and Documents.
- **Progress Tracking:** A visual progress bar calculates the packing completion percentage.
- **Custom Additions:** Users can append custom items to any category, which are persisted to the local context.

## 2. Birth Plan & Readiness (`BirthPlanPage.tsx`, `BirthReadinessPage.tsx`)
Tools to articulate labor preferences and assess logistical preparedness.
- **Birth Plan Generator:** Allows the mother to document preferences for pain management (Epidural, Natural), environment (Dim lights, Music), and birthing positions.
- **Readiness Score:** A quiz-like interface assessing if the car seat is installed, pediatricians chosen, and hospital route mapped.

## 3. Emergency Contacts (`EmergencyContactsPage.tsx`)
A critical speed-dial repository.
- Stores names, roles (e.g., Doula, Midwife, Partner, Ambulance), and phone numbers.
- Directly integrated with the global Floating SOS component for instant access during emergencies.

## 4. Partner Dashboard (`PartnerPage.tsx`)
A dedicated module for the spouse/partner.
- Offers actionable advice on how to support the mother physically (massage techniques) and emotionally during the current trimester.
- Highlights upcoming doctor appointments they need to attend.

## 5. Baby Names Database (`BabyNamesPage.tsx`)
An exploratory tool for selecting the baby's name.
- **Rich Data:** Interfaces with the `babyNames.ts` database containing thousands of names with origins (Sanskrit, Tamil, Arabic, etc.), numerology values, and deep meanings.
- **Search & Filter:** Real-time search indexing and filtering by gender or origin.
- **Favorites System:** Users can "heart" names, saving them to a persisted shortlist in the global state.

## 6. Travel Safety (`TravelSafetyPage.tsx`)
Provides guidelines on air travel restrictions, road trip safety, and necessary medical clearances based on the mother's current gestational week.
