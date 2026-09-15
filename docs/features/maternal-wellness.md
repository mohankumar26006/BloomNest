# Maternal Wellness Features

This document covers the holistic, physical, and emotional well-being modules within BloomNest.

## 1. Garbha Sanskar Wellness (`GarbhaWellnessPage.tsx`)
An Ayurvedic and mindful womb care module bridging ancient traditions with modern neuroscience.
- **Daily Sanskar Score:** A gamified daily checklist (0/4) encouraging routine engagement.
- **Garbha Samvad (Womb Conversation):** Provides daily, trimester-specific speech prompts for the mother/partner to read to the baby, stimulating fetal auditory pathways.
- **Classical Ragas (432Hz):** A curated list of Indian classical music ragas (e.g., Raga Yaman, Raga Malkauns) categorized by ideal trimester and time of day for acoustic healing.
- **Vedic Stotras & Mantras:** Integrates YouTube embed links for authentic traditional chanting (e.g., Garbarakshambigai Stotram), complete with synchronized Tamil/Sanskrit scripts and English transliterations for the mother to read along.

## 2. Prenatal Yoga (`YogaPage.tsx`)
A hub for safe pelvic and physical stretches.
- **Guided Breath Pacer:** An animated, pulsing visualizer guiding the user through the 4-4-6 labor relaxation breathing technique (Inhale 4s, Hold 4s, Exhale 6s) accompanied by soft audio chimes.
- **Trimester Yoga Poses:** A visual library of safe asanas (e.g., Butterfly Pose, Cat-Cow) with durations and specific physical benefits.

## 3. Exercise & Labor Breathing (`ExerciseBreathingPage.tsx`)
Clinical fitness protocols for perineal strength and cardiovascular health.
- **Kegel Exercise Timer:** An interactive contraction/relaxation interval timer specifically for strengthening pelvic floor muscles.
- **Maternal Walking Tracker:** A simulated pedometer tracking steps against a 5,000 daily step goal, calculating distance and duration.
- **Trimester Exercise Guide:** Checklists of safe physical activities tailored to the physiological limits of each trimester.

## 4. Mood & Sleep Tracker (`MoodPage.tsx`)
An emotional intelligence log to monitor maternal mental health.
- **Emoji State Selection:** A quick interface to log the daily emotional state (Joyful, Anxious, Exhausted, etc.).
- **Sleep Logging:** Tracks hours slept to ensure adequate rest.
- **Symptom Logging:** Captures physical symptoms like nausea or swelling to provide context to the mood data.

## 5. Nutrition (`NutritionPage.tsx`)
Dietary guidelines tailored for fetal growth.
- Displays trimester-specific macronutrient requirements and suggests daily recipes from the static `nutritionRecipes.ts` data source.

## 6. Education Classes (`EducationClassesPage.tsx`)
A module aggregating prenatal classes and informational resources (hypnobirthing, lactation basics).
