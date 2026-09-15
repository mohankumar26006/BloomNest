# Medical & Clinical Features

This document outlines the clinical tracking and medical profile features of the BloomNest application.

## 1. Medical Profile & Digital ID (`MedicalProfilePage.tsx`)
A centralized repository for critical maternal health data.
- **Blood Group & Rh Factor:** Tracks blood typing and alerts the user if an Rh-negative protocol (RhoGAM) is required.
- **Obstetrical History:** Logs Gravida (total pregnancies), Para (deliveries), and prior C-section history.
- **Allergies & High-Risk Notes:** Dynamic lists for drug/environmental allergies.
- **Digital Medical ID Card:** Generates a printable, high-contrast emergency response card for paramedics, summarizing critical stats and emergency contacts.

## 2. Vitals Tracking (`HealthTrackerPage.tsx`)
A daily logging system for core maternal biometrics.
- **Input Forms:** Captures Weight (kg), Blood Pressure (Systolic/Diastolic), Water Intake (mL), Sleep (hours), and custom clinical notes.
- **Data Visualization:** Integrates with `recharts` to render historical trends over time (e.g., Weight Trajectory, Blood Pressure charts).
- **Persistence:** Logs are saved to the `vitals` array in the global context.

## 3. Medicine Reminder (`MedicinePage.tsx`)
A medication adherence tracker designed for prenatal vitamins and prescriptions.
- **Inventory:** Users can add medications, specifying dosage, timing (Morning, Afternoon, Evening), and clinical purpose.
- **Daily Checklist:** A reactive interface to mark medications as "Taken" for the current day.

## 4. Prenatal Scan Timeline (`MedicalTimelinePage.tsx`)
An educational and scheduling tool based on Indian OB-GYN guidelines.
- **Standard Protocol:** Lists expected ultrasounds (Dating, NT, Anomaly, Growth) mapped to specific gestational weeks.
- **Clinical Education:** Details the purpose, key metrics examined, preparation tips, and suggested questions to ask the sonographer for each scan.

## 5. Vaccination Protocol (`VaccinationPage.tsx`)
Tracks essential maternal immunizations to ensure passive immunity transfer to the fetus.
- **Core Vaccines:** Includes Tdap, Influenza, COVID-19, and Rh-specific immunizations.
- **Status Tracking:** Users can mark vaccines as administered, auto-stamping the completion date.

## 6. Doctor Reports Export (`ReportsPage.tsx`)
A utility page bridging the gap between the application and the attending OB-GYN.
- **Data Aggregation:** Compiles a tabular summary of all recorded vitals, kicks, and sleep logs.
- **CSV Export:** Generates and downloads a `.csv` file containing structured clinical data for doctor consultations.
- **Print Layout:** Includes a specialized `@media print` CSS layout for clean physical printouts.
