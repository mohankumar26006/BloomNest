import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { JourneyStage, PrePregnancyDetails, PostpartumDetails, ExtractedMedicalField } from "../types";
import { WelcomeScreen } from "./onboarding/WelcomeScreen";
import { AuthScreen } from "./onboarding/AuthScreen";
import { JourneySelectionScreen } from "./onboarding/JourneySelectionScreen";
import { PrePregnancyOnboarding } from "./onboarding/PrePregnancyOnboarding";
import { PregnancyOnboarding } from "./onboarding/PregnancyOnboarding";
import { PostpartumOnboarding } from "./onboarding/PostpartumOnboarding";
import { MedicalReportPrompt } from "./onboarding/MedicalReportPrompt";
import { BloomScanUpload } from "./onboarding/BloomScanUpload";
import { BloomScanProcessing } from "./onboarding/BloomScanProcessing";
import { BloomScanReview } from "./onboarding/BloomScanReview";

export type OnboardingFlowStep =
  | "welcome"
  | "auth"
  | "journey_selection"
  | "journey_onboarding"
  | "medical_prompt"
  | "bloomscan_upload"
  | "bloomscan_processing"
  | "bloomscan_review";

export const OnboardingFlow: React.FC = () => {
  const { initializeNewUser, signInUser, setActivePage, showToast } = useApp();

  const [step, setStep] = useState<OnboardingFlowStep>("welcome");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  // User Profile Draft State
  const [userFullName, setUserFullName] = useState<string>("Sarah Jenkins");
  const [userEmail, setUserEmail] = useState<string>("sarah@bloomnest.com");
  const [selectedJourney, setSelectedJourney] = useState<JourneyStage>("PREGNANCY");

  // Journey Details Draft State
  const [prePregnancyData, setPrePregnancyData] = useState<PrePregnancyDetails | undefined>(undefined);
  const [pregnancyData, setPregnancyData] = useState<{
    currentWeek: number;
    trimester: number;
    edd: string;
    bloodGroup: string;
    doctorName: string;
    hospitalName: string;
  }>({
    currentWeek: 24,
    trimester: 2,
    edd: "2026-11-20",
    bloodGroup: "O+",
    doctorName: "Dr. Ananya Sharma, MD",
    hospitalName: "Apollo Cradle Maternity",
  });
  const [postpartumData, setPostpartumData] = useState<PostpartumDetails | undefined>(undefined);

  // BloomScan File Draft State
  const [uploadedReportName, setUploadedReportName] = useState<string>("Scan_Report.pdf");
  const [extractedFields, setExtractedFields] = useState<ExtractedMedicalField[]>([]);

  // Handlers for Navigation
  const handleAuthenticated = (details: {
    fullName: string;
    email: string;
    currentWeek?: number;
    trimester?: number;
    eddDate?: string;
    isExistingUser?: boolean;
  }) => {
    setUserFullName(details.fullName);
    setUserEmail(details.email);

    // Direct Dashboard Redirection on valid email & password sign in!
    if (details.isExistingUser) {
      signInUser({
        fullName: details.fullName,
        email: details.email,
        currentWeek: details.currentWeek,
        trimester: details.trimester,
        eddDate: details.eddDate,
      });
      return;
    }

    // New user Sign Up -> proceed to journey selection and optional medical report scan
    setStep("journey_selection");
  };

  const handleSelectJourney = (journey: JourneyStage) => {
    setSelectedJourney(journey);
    
    // Bypassing all questions and reports for PRE_PREGNANCY
    if (journey === "PRE_PREGNANCY") {
      initializeNewUser({
        currentJourney: journey,
        fullName: userFullName,
        email: userEmail,
        hasCompletedOnboarding: true,
      });
      setActivePage("dashboard");
      return;
    }
    
    setStep("journey_onboarding");
  };

  const handlePrePregnancyNext = (details: PrePregnancyDetails) => {
    setPrePregnancyData(details);
    setStep("medical_prompt");
  };

  const handlePregnancyNext = (details: {
    currentWeek: number;
    trimester: number;
    edd: string;
    bloodGroup: string;
    doctorName: string;
    hospitalName: string;
  }) => {
    setPregnancyData(details);
    setStep("medical_prompt");
  };

  const handlePostpartumNext = (details: PostpartumDetails) => {
    setPostpartumData(details);
    setStep("medical_prompt");
  };

  const handleStartAnalyzeReport = (fileName: string) => {
    setUploadedReportName(fileName);
    setStep("bloomscan_processing");
  };

  const handleProcessingComplete = (extractedData?: any) => {
    if (extractedData?.fields && Array.isArray(extractedData.fields)) {
      setExtractedFields(extractedData.fields);
    }
    if (extractedData) {
      setPregnancyData((prev) => ({
        ...prev,
        currentWeek: extractedData.detectedWeek || prev.currentWeek,
        trimester: extractedData.detectedTrimester || prev.trimester,
        edd: extractedData.detectedEdd || prev.edd,
        bloodGroup: extractedData.bloodGroup || prev.bloodGroup,
        doctorName: extractedData.doctorName || prev.doctorName,
        hospitalName: extractedData.hospitalName || prev.hospitalName,
      }));
    }
    setStep("bloomscan_review");
  };

  const handleFinishOnboarding = (finalExtractedFields?: ExtractedMedicalField[]) => {
    const fieldsToApply = finalExtractedFields || extractedFields;

    // Deep extraction analysis for personalized dashboard calibration
    let resolvedWeek = pregnancyData.currentWeek;
    let resolvedTrimester = pregnancyData.trimester;
    let resolvedEdd = pregnancyData.edd;
    let resolvedBloodGroup = pregnancyData.bloodGroup;
    let resolvedDoctor = pregnancyData.doctorName;
    let resolvedHospital = pregnancyData.hospitalName;

    if (fieldsToApply && fieldsToApply.length > 0) {
      const gaField = fieldsToApply.find((f) => f.label.toLowerCase().includes("gestational") || f.label.toLowerCase().includes("age"));
      if (gaField) {
        const match = gaField.value.match(/(\d+)\s*(?:weeks|w)/i);
        if (match && match[1]) {
          const wk = parseInt(match[1], 10);
          if (wk >= 1 && wk <= 42) {
            resolvedWeek = wk;
            resolvedTrimester = wk <= 13 ? 1 : wk <= 27 ? 2 : 3;
          }
        }
      }

      const eddField = fieldsToApply.find((f) => f.label.toLowerCase().includes("due date") || f.label.toLowerCase().includes("edd"));
      if (eddField && eddField.value) {
        resolvedEdd = eddField.value;
      }

      const bgField = fieldsToApply.find((f) => f.label.toLowerCase().includes("blood group"));
      if (bgField && bgField.value) {
        resolvedBloodGroup = bgField.value;
      }

      const docField = fieldsToApply.find((f) => f.label.toLowerCase().includes("doctor") || f.label.toLowerCase().includes("ob-gyn"));
      if (docField && docField.value) {
        resolvedDoctor = docField.value;
      }

      const hospField = fieldsToApply.find((f) => f.label.toLowerCase().includes("hospital") || f.label.toLowerCase().includes("clinic"));
      if (hospField && hospField.value) {
        resolvedHospital = hospField.value;
      }
    }

    const finalWeek = selectedJourney === "PREGNANCY" ? resolvedWeek : 20;
    const finalTrimester = selectedJourney === "PREGNANCY" ? resolvedTrimester : 2;
    const finalEdd = selectedJourney === "PREGNANCY" ? resolvedEdd : "2026-11-20";

    initializeNewUser({
      fullName: userFullName,
      email: userEmail,
      currentJourney: selectedJourney,
      currentWeek: finalWeek,
      trimester: finalTrimester,
      edd: finalEdd,
      doctorName: resolvedDoctor,
      hospitalName: resolvedHospital,
      bloodGroup: resolvedBloodGroup,
      prePregnancyDetails: prePregnancyData,
      postpartumDetails: postpartumData,
      extractedMedicalFields: fieldsToApply,
      hasCompletedOnboarding: true,
    });

    setActivePage("dashboard");
    showToast(`Welcome, ${userFullName}! Your dashboard is auto-calibrated to Week ${finalWeek}.`);
  };

  // Render Current Flow Step
  switch (step) {
    case "welcome":
      return (
        <WelcomeScreen
          onGetStarted={() => {
            setAuthMode("signup");
            setStep("auth");
          }}
          onSignIn={() => {
            setAuthMode("signin");
            setStep("auth");
          }}
        />
      );

    case "auth":
      return (
        <AuthScreen
          initialMode={authMode}
          onAuthenticated={handleAuthenticated}
          onBackToWelcome={() => setStep("welcome")}
        />
      );

    case "journey_selection":
      return (
        <JourneySelectionScreen
          onSelectJourney={handleSelectJourney}
        />
      );

    case "journey_onboarding":
      if (selectedJourney === "PRE_PREGNANCY") {
        return (
          <PrePregnancyOnboarding
            onNext={handlePrePregnancyNext}
            onBack={() => setStep("journey_selection")}
          />
        );
      }
      if (selectedJourney === "POST_PREGNANCY") {
        return (
          <PostpartumOnboarding
            onNext={handlePostpartumNext}
            onBack={() => setStep("journey_selection")}
          />
        );
      }
      return (
        <PregnancyOnboarding
          onNext={handlePregnancyNext}
          onBack={() => setStep("journey_selection")}
        />
      );

    case "medical_prompt":
      return (
        <MedicalReportPrompt
          onAddReport={() => setStep("bloomscan_upload")}
          onSkip={() => handleFinishOnboarding()}
          onBack={() => setStep("journey_onboarding")}
        />
      );

    case "bloomscan_upload":
      return (
        <BloomScanUpload
          onStartAnalyze={handleStartAnalyzeReport}
          onBack={() => setStep("medical_prompt")}
        />
      );

    case "bloomscan_processing":
      return (
        <BloomScanProcessing
          fileName={uploadedReportName}
          onComplete={handleProcessingComplete}
        />
      );

    case "bloomscan_review":
      return (
        <BloomScanReview
          initialFields={extractedFields}
          onConfirm={(fields) => {
            setExtractedFields(fields);
            handleFinishOnboarding(fields);
          }}
          onBack={() => setStep("bloomscan_upload")}
        />
      );

    default:
      return (
        <WelcomeScreen
          onGetStarted={() => setStep("auth")}
          onSignIn={() => setStep("auth")}
        />
      );
  }
};

export default OnboardingFlow;
