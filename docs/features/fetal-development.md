# Fetal Development Features

This document details the features dedicated to tracking the physical and biological development of the fetus.

## 1. Cinematic Baby Development Visualizer (`BabyDevelopmentPage.tsx`)
A highly interactive, data-driven studio for visualizing fetal growth week-by-week. It has been completely overhauled to favor a premium, cinematic experience over traditional cartoon-style trackers.
- **Cinematic UI Representation:** The UI uses a layered composition featuring a high-quality maternal silhouette portrait seamlessly blended with a holographic, rotating "cosmic womb" bubble.
- **AI-Generated Macro Photography:** Instead of simple vectors, the visualizer uses hyper-realistic 8K AI-generated macro photography of the fetus, suspended in amniotic fluid, for all 40 weeks.
- **Clinical Terminology:** Moved away from "Fruit Size" comparisons (e.g., Big as a Lemon) in favor of strictly accurate medical nomenclature (e.g., "Fetus (Viability Threshold)", "Embryo").
- **Static Pink Theming:** To maintain a cohesive premium brand aesthetic, the cinematic visualizer defaults to an elegant Rose/Pink gradient across all trimesters.
- **Growth Trajectory Charts:** Utilizes `recharts` to plot the Estimated Fetal Weight (g) and Crown-to-Heel Length (cm) curves across 40 weeks.
- **Audio Fetal Heartbeat:** A synthesized 140 BPM audio simulation mimicking a Doppler heartbeat monitor.

## 2. Kick Counter (`KickCounterPage.tsx`)
A clinical tool for monitoring fetal movement, typically used in the third trimester.
- **Live Session Tracker:** A stopwatch interface that users activate when they feel the first kick.
- **Interactive Logging:** Users tap a large, animated "Record Kick" button for every movement felt.
- **Threshold Alerts:** The app automatically completes the session and displays a reassuring message once the clinical threshold (e.g., 10 kicks) is reached.
- **History Log:** Saves the duration and timestamp of every session for doctor review.

## 3. Contraction Timer (`ContractionTimerPage.tsx`)
An essential labor readiness tool for tracking uterine contractions.
- **Live Timing:** Users press "Start" when a contraction begins and "Stop" when it ends.
- **Metric Calculation:** Automatically calculates the *Duration* (length of a single contraction) and *Frequency* (time from the start of the previous contraction to the start of the current one).
- **Labor Alert Logic:** Analyzes the history logs against standard clinical rules (e.g., the 5-1-1 rule: contractions 5 minutes apart, lasting 1 minute, for 1 hour) and alerts the user to head to the hospital if criteria are met.

## 4. Maternal Timeline (`TimelinePage.tsx`)
A chronologically ordered view of major pregnancy milestones.
- Connects disparate data points (scans, first kicks, trimesters) into a single, unified vertical timeline view.
