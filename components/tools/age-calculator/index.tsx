"use client";

import React, { useState, useCallback, useMemo } from "react";
import styles from "./styles.module.css";

// Types
interface DateRange {
  month: number;
  day: number;
}

interface ZodiacData {
  name: string;
  symbol: string;
  element: string;
  startDate: DateRange;
  endDate: DateRange;
}

interface RashiData {
  name: string;
  english: string;
  element: string;
  symbol: string;
  description: string;
  startDate: DateRange;
  endDate: DateRange;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthday: number;
  birthDate: string;
}

interface ComparisonResult {
  olderPerson?: "A" | "B";
  olderName?: string;
  personA: AgeResult & { zodiac: ZodiacData | null; rashi: RashiData | null };
  personB: AgeResult & { zodiac: ZodiacData | null; rashi: RashiData | null };
  difference: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
  };
  message?: string;
}

// Western Zodiac Data
const WESTERN_ZODIAC: Record<number, ZodiacData> = {
  0: {
    name: "Aries",
    symbol: "♈",
    element: "Fire",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
  },
  1: {
    name: "Taurus",
    symbol: "♉",
    element: "Earth",
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
  },
  2: {
    name: "Gemini",
    symbol: "♊",
    element: "Air",
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
  },
  3: {
    name: "Cancer",
    symbol: "♋",
    element: "Water",
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
  },
  4: {
    name: "Leo",
    symbol: "♌",
    element: "Fire",
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
  },
  5: {
    name: "Virgo",
    symbol: "♍",
    element: "Earth",
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
  },
  6: {
    name: "Libra",
    symbol: "♎",
    element: "Air",
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
  },
  7: {
    name: "Scorpio",
    symbol: "♏",
    element: "Water",
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
  },
  8: {
    name: "Sagittarius",
    symbol: "♐",
    element: "Fire",
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
  },
  9: {
    name: "Capricorn",
    symbol: "♑",
    element: "Earth",
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
  },
  10: {
    name: "Aquarius",
    symbol: "♒",
    element: "Air",
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
  },
  11: {
    name: "Pisces",
    symbol: "♓",
    element: "Water",
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
  },
};

// Vedic Rashi data (Moon Sign based on Nakshatra)
const VEDIC_RASHI: Record<number, RashiData> = {
  0: {
    name: "Mesha",
    english: "Aries",
    element: "Fire",
    symbol: "♈",
    description:
      "Courageous, energetic, and natural leaders who love challenges.",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
  },
  1: {
    name: "Vrishabha",
    english: "Taurus",
    element: "Earth",
    symbol: "♉",
    description: "Reliable, patient, and practical with strong determination.",
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
  },
  2: {
    name: "Mithuna",
    english: "Gemini",
    element: "Air",
    symbol: "♊",
    description:
      "Adaptable, curious, and excellent communicators who love variety.",
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
  },
  3: {
    name: "Karka",
    english: "Cancer",
    element: "Water",
    symbol: "♋",
    description:
      "Intuitive, emotional, and deeply connected to family and home.",
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
  },
  4: {
    name: "Simha",
    english: "Leo",
    element: "Fire",
    symbol: "♌",
    description:
      "Charismatic, creative, and natural-born leaders with generous hearts.",
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
  },
  5: {
    name: "Kanya",
    english: "Virgo",
    element: "Earth",
    symbol: "♍",
    description:
      "Analytical, practical, and detail-oriented with a helpful nature.",
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
  },
  6: {
    name: "Tula",
    english: "Libra",
    element: "Air",
    symbol: "♎",
    description: "Diplomatic, fair-minded, and lovers of beauty and harmony.",
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
  },
  7: {
    name: "Vrishchika",
    english: "Scorpio",
    element: "Water",
    symbol: "♏",
    description:
      "Passionate, resourceful, and determined with strong intuition.",
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
  },
  8: {
    name: "Dhanu",
    english: "Sagittarius",
    element: "Fire",
    symbol: "♐",
    description: "Optimistic, adventurous, and philosophical truth-seekers.",
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
  },
  9: {
    name: "Makara",
    english: "Capricorn",
    element: "Earth",
    symbol: "♑",
    description: "Disciplined, responsible, and patient with long-term vision.",
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
  },
  10: {
    name: "Kumbha",
    english: "Aquarius",
    element: "Air",
    symbol: "♒",
    description: "Innovative, independent, and humanitarian thinkers.",
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
  },
  11: {
    name: "Meena",
    english: "Pisces",
    element: "Water",
    symbol: "♓",
    description: "Compassionate, artistic, and deeply intuitive dreamers.",
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
  },
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#dc2626",
  Earth: "#16a34a",
  Air: "#0284c7",
  Water: "#7c3aed",
};

// Simplified Moon position calculation (for demonstration)
// In production, use a proper ephemeris API like Swiss Ephemeris
const calculateMoonRashi = (
  date: Date,
  time: string,
  place: string,
): RashiData | null => {
  // This is a simplified placeholder calculation
  // For accurate results, integrate with:
  // - Swiss Ephemeris (https://www.astro.com/swisseph/)
  // - or APIs like https://json.astrologyapi.com/

  if (!date || !time || !place) return null;

  // Simplified: Use date to determine approximate moon position
  // Moon transits one rashi approximately every 2.25 days
  const startDate = new Date(2024, 0, 1); // Reference date
  const daysDiff = Math.floor(
    (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Rough approximation - for demo only
  const rashiIndex = (daysDiff % 27) / 2.25;
  const roundedIndex = Math.floor(rashiIndex) % 12;

  return VEDIC_RASHI[roundedIndex] ?? VEDIC_RASHI[0]!;
};

const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>("");
  const [birthTime, setBirthTime] = useState<string>("");
  const [birthPlace, setBirthPlace] = useState<string>("");
  const [enableVedic, setEnableVedic] = useState<boolean>(false);
  const [age, setAge] = useState<AgeResult | null>(null);
  const [westernZodiac, setWesternZodiac] = useState<ZodiacData | null>(null);
  const [vedicRashi, setVedicRashi] = useState<RashiData | null>(null);
  const [vedicError, setVedicError] = useState<string>("");

  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [personA, setPersonA] = useState<string>("");
  const [personATime, setPersonATime] = useState<string>("");
  const [personAPlace, setPersonAPlace] = useState<string>("");
  const [personB, setPersonB] = useState<string>("");
  const [personBTime, setPersonBTime] = useState<string>("");
  const [personBPlace, setPersonBPlace] = useState<string>("");
  const [enableVedicComparison, setEnableVedicComparison] =
    useState<boolean>(false);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [comparisonError, setComparisonError] = useState<string>("");

  // Calculate Western Zodiac Sign
  const calculateWesternZodiac = useCallback(
    (dateString: string): ZodiacData | null => {
      if (!dateString) return null;

      const birthDateObj = new Date(dateString);
      const month = birthDateObj.getMonth() + 1;
      const day = birthDateObj.getDate();

      // Capricorn special case (crosses year boundary)
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return WESTERN_ZODIAC[9] ?? null;
      }

      for (const key in WESTERN_ZODIAC) {
        if (key === "9") continue;
        const zodiac = WESTERN_ZODIAC[parseInt(key)];
        if (!zodiac) continue;
        const { month: startMonth, day: startDay } = zodiac.startDate;
        const { month: endMonth, day: endDay } = zodiac.endDate;

        if (startMonth <= endMonth) {
          if (
            (month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay) ||
            (month > startMonth && month < endMonth)
          ) {
            return zodiac;
          }
        }
      }

      return null;
    },
    [],
  );

  // Calculate Vedic Rashi with validation
  const calculateVedicRashi = useCallback(
    (dateString: string, time: string, place: string): RashiData | null => {
      if (!enableVedic) return null;

      if (!dateString) {
        setVedicError("Birth date is required");
        return null;
      }

      if (!time) {
        setVedicError(
          "Birth time is required for accurate Vedic Rashi calculation",
        );
        return null;
      }

      if (!place || place.trim() === "") {
        setVedicError(
          "Birth place is required for accurate Vedic Rashi calculation",
        );
        return null;
      }

      setVedicError("");

      const birthDateObj = new Date(dateString);
      const rashi = calculateMoonRashi(birthDateObj, time, place);

      if (!rashi) {
        setVedicError(
          "Unable to calculate Vedic Rashi. Please check your inputs.",
        );
      }

      return rashi;
    },
    [enableVedic],
  );

  const calculateAgeFromDate = useCallback(
    (dateString: string): AgeResult | null => {
      if (!dateString) return null;

      const birth = new Date(dateString);
      const today = new Date();

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      const diffTime = Math.abs(today.getTime() - birth.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const nextBirthday = new Date(
        today.getFullYear(),
        birth.getMonth(),
        birth.getDate(),
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntilBirthday = Math.ceil(
        (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        years,
        months,
        days,
        totalDays,
        nextBirthday: daysUntilBirthday,
        birthDate: dateString,
      };
    },
    [],
  );

  const calculateAge = useCallback((): void => {
    if (!birthDate) {
      alert("Please select your birth date");
      return;
    }

    const calculatedAge = calculateAgeFromDate(birthDate);
    const western = calculateWesternZodiac(birthDate);
    const vedic = calculateVedicRashi(birthDate, birthTime, birthPlace);

    setAge(calculatedAge);
    setWesternZodiac(western);
    setVedicRashi(vedic);
  }, [
    birthDate,
    birthTime,
    birthPlace,
    calculateAgeFromDate,
    calculateWesternZodiac,
    calculateVedicRashi,
  ]);

  const calculateComparison = useCallback((): void => {
    setComparisonError("");
    setComparisonResult(null);

    if (!personA || !personB) {
      setComparisonError("Please select both dates for comparison");
      return;
    }

    const ageA = calculateAgeFromDate(personA);
    const ageB = calculateAgeFromDate(personB);
    const zodiacA = calculateWesternZodiac(personA);
    const zodiacB = calculateWesternZodiac(personB);

    let rashiA: RashiData | null = null;
    let rashiB: RashiData | null = null;
    let vedicErrors: string[] = [];

    if (enableVedicComparison) {
      if (!personATime || !personAPlace) {
        vedicErrors.push(
          "Person A: Birth time and place required for Vedic Rashi",
        );
      } else {
        const birthDateA = new Date(personA);
        rashiA = calculateMoonRashi(birthDateA, personATime, personAPlace);
      }

      if (!personBTime || !personBPlace) {
        vedicErrors.push(
          "Person B: Birth time and place required for Vedic Rashi",
        );
      } else {
        const birthDateB = new Date(personB);
        rashiB = calculateMoonRashi(birthDateB, personBTime, personBPlace);
      }

      if (vedicErrors.length > 0) {
        setComparisonError(vedicErrors.join(". "));
      }
    }

    if (!ageA || !ageB) {
      setComparisonError("Invalid dates provided");
      return;
    }

    const birthDateA = new Date(personA);
    const birthDateB = new Date(personB);
    const isAOlder = birthDateA < birthDateB;
    const isSameDate = birthDateA.getTime() === birthDateB.getTime();

    if (isSameDate) {
      setComparisonResult({
        message: "Both are the same age",
        personA: { ...ageA, zodiac: zodiacA, rashi: rashiA },
        personB: { ...ageB, zodiac: zodiacB, rashi: rashiB },
        difference: { years: 0, months: 0, days: 0, totalDays: 0 },
      });
      return;
    }

    let diffYears = Math.abs(ageA.years - ageB.years);
    let diffMonths = Math.abs(ageA.months - ageB.months);
    let diffDays = Math.abs(ageA.days - ageB.days);
    const totalDiffDays = Math.abs(ageA.totalDays - ageB.totalDays);

    if (diffDays < 0) {
      diffMonths--;
      const prevMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        0,
      );
      diffDays += prevMonth.getDate();
    }

    if (diffMonths < 0) {
      diffYears--;
      diffMonths += 12;
    }

    setComparisonResult({
      olderPerson: isAOlder ? "A" : "B",
      olderName: isAOlder ? "Person A" : "Person B",
      personA: { ...ageA, zodiac: zodiacA, rashi: rashiA },
      personB: { ...ageB, zodiac: zodiacB, rashi: rashiB },
      difference: {
        years: diffYears,
        months: diffMonths,
        days: diffDays,
        totalDays: totalDiffDays,
      },
    });
  }, [
    personA,
    personB,
    personATime,
    personAPlace,
    personBTime,
    personBPlace,
    enableVedicComparison,
    calculateAgeFromDate,
    calculateWesternZodiac,
  ]);

  const clearAll = useCallback((): void => {
    setBirthDate("");
    setBirthTime("");
    setBirthPlace("");
    setAge(null);
    setWesternZodiac(null);
    setVedicRashi(null);
    setVedicError("");
    setPersonA("");
    setPersonATime("");
    setPersonAPlace("");
    setPersonB("");
    setPersonBTime("");
    setPersonBPlace("");
    setComparisonResult(null);
    setComparisonError("");
  }, []);

  const toggleComparisonMode = useCallback((): void => {
    const newMode = !comparisonMode;
    setComparisonMode(newMode);
    if (!newMode) {
      setPersonA("");
      setPersonATime("");
      setPersonAPlace("");
      setPersonB("");
      setPersonBTime("");
      setPersonBPlace("");
      setComparisonResult(null);
      setComparisonError("");
    }
  }, [comparisonMode]);

  const getDayOfWeek = useCallback((dateString: string): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
    });
  }, []);

  const getMonthsLived = useMemo(() => {
    if (!age) return "0";
    return Math.floor(age.totalDays / 30.44).toLocaleString();
  }, [age]);

  const getWeekendsLived = useMemo(() => {
    if (!age) return "0";
    return Math.floor(age.totalDays / 7).toLocaleString();
  }, [age]);

  const getHoursLived = useMemo(() => {
    if (!age) return "0";
    return Math.floor(age.totalDays * 24).toLocaleString();
  }, [age]);

  return (
    <div className={styles.ageCalculator}>
      <main className={styles.calculatorMain}>
        {/* Mode Toggle */}
        <div className={styles.modeSection}>
          <div className={styles.modeContainer}>
            <button
              onClick={toggleComparisonMode}
              className={`${styles.modeToggle} ${comparisonMode ? styles.active : ""}`}
              aria-label={
                comparisonMode
                  ? "Switch to single age mode"
                  : "Switch to comparison mode"
              }
            >
              <span className={styles.modeIcon}>
                {comparisonMode ? "👤" : "👥"}
              </span>
              <span className={styles.modeLabel}>
                {comparisonMode ? "Single Age" : "Age Comparison"}
              </span>
            </button>
          </div>
        </div>

        {/* Main Calculator Section */}
        <div className={styles.calculatorSection}>
          <div className={styles.inputCard}>
            {!comparisonMode ? (
              <>
                <div className={styles.inputHeader}>
                  <h3 className={styles.inputTitle}>Age Calculator</h3>
                  <p className={styles.inputDescription}>
                    Enter your birth details to calculate your age
                  </p>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="birthDate" className={styles.inputLabel}>
                    Birth Date *
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBirthDate(e.target.value)
                    }
                    className={styles.dateInput}
                    max={new Date().toISOString().split("T")[0]}
                    aria-required="true"
                  />
                </div>

                {/* Vedic Rashi Toggle */}
                <div className={styles.vedicToggleContainer}>
                  <label className={styles.vedicToggle}>
                    <input
                      type="checkbox"
                      checked={enableVedic}
                      onChange={(e) => {
                        setEnableVedic(e.target.checked);
                        setVedicRashi(null);
                        setVedicError("");
                      }}
                      className={styles.vedicCheckbox}
                    />
                    <span className={styles.vedicToggleSlider}></span>
                    <span className={styles.vedicToggleLabel}>
                      🌙 Calculate Indian Vedic Rashi (Moon Sign)
                    </span>
                  </label>
                </div>

                {/* Vedic Details - Conditionally Shown */}
                {enableVedic && (
                  <div className={styles.vedicDetails}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="birthTime" className={styles.inputLabel}>
                        Birth Time *
                      </label>
                      <input
                        id="birthTime"
                        type="time"
                        value={birthTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setBirthTime(e.target.value)
                        }
                        className={styles.timeInput}
                        step="60"
                      />
                      <small className={styles.inputHint}>
                        Required for accurate Moon position
                      </small>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="birthPlace" className={styles.inputLabel}>
                        Birth Place *
                      </label>
                      <input
                        id="birthPlace"
                        type="text"
                        value={birthPlace}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setBirthPlace(e.target.value)
                        }
                        className={styles.textInput}
                        placeholder="City, Country"
                      />
                      <small className={styles.inputHint}>
                        Required for accurate calculation
                      </small>
                    </div>
                  </div>
                )}

                {vedicError && (
                  <div className={styles.errorMessage} role="alert">
                    <span className={styles.errorIcon}>⚠️</span>
                    <span className={styles.errorText}>{vedicError}</span>
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <button
                    onClick={calculateAge}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={!birthDate}
                  >
                    <span className={styles.btnIcon}>🧮</span>
                    <span className={styles.btnText}>Calculate Age</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    <span className={styles.btnIcon}>🗑️</span>
                    <span className={styles.btnText}>Clear All</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.inputHeader}>
                  <h3 className={styles.inputTitle}>Age Comparison</h3>
                  <p className={styles.inputDescription}>
                    Compare ages between two people
                  </p>
                </div>

                {/* Vedic Toggle for Comparison */}
                <div className={styles.vedicToggleContainer}>
                  <label className={styles.vedicToggle}>
                    <input
                      type="checkbox"
                      checked={enableVedicComparison}
                      onChange={(e) => {
                        setEnableVedicComparison(e.target.checked);
                        setComparisonResult(null);
                      }}
                      className={styles.vedicCheckbox}
                    />
                    <span className={styles.vedicToggleSlider}></span>
                    <span className={styles.vedicToggleLabel}>
                      🌙 Include Vedic Rashi in Comparison
                    </span>
                  </label>
                </div>

                <div className={styles.comparisonInputs}>
                  <div className={styles.personInputGroup}>
                    <label htmlFor="personA" className={styles.inputLabel}>
                      <span className={styles.personIcon}>👤</span>
                      Person A
                    </label>
                    <input
                      id="personA"
                      type="date"
                      value={personA}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPersonA(e.target.value)
                      }
                      className={styles.dateInput}
                      max={new Date().toISOString().split("T")[0]}
                    />

                    {enableVedicComparison && (
                      <>
                        <input
                          type="time"
                          value={personATime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPersonATime(e.target.value)
                          }
                          className={styles.timeInput}
                          placeholder="Birth Time"
                          style={{ marginTop: "0.5rem" }}
                        />
                        <input
                          type="text"
                          value={personAPlace}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPersonAPlace(e.target.value)
                          }
                          className={styles.textInput}
                          placeholder="Birth Place"
                          style={{ marginTop: "0.5rem" }}
                        />
                      </>
                    )}
                  </div>

                  <div className={styles.vsSeparator}>
                    <span className={styles.vsText}>vs</span>
                  </div>

                  <div className={styles.personInputGroup}>
                    <label htmlFor="personB" className={styles.inputLabel}>
                      <span className={styles.personIcon}>👤</span>
                      Person B
                    </label>
                    <input
                      id="personB"
                      type="date"
                      value={personB}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPersonB(e.target.value)
                      }
                      className={styles.dateInput}
                      max={new Date().toISOString().split("T")[0]}
                    />

                    {enableVedicComparison && (
                      <>
                        <input
                          type="time"
                          value={personBTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPersonBTime(e.target.value)
                          }
                          className={styles.timeInput}
                          placeholder="Birth Time"
                          style={{ marginTop: "0.5rem" }}
                        />
                        <input
                          type="text"
                          value={personBPlace}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPersonBPlace(e.target.value)
                          }
                          className={styles.textInput}
                          placeholder="Birth Place"
                          style={{ marginTop: "0.5rem" }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {comparisonError && (
                  <div className={styles.errorMessage} role="alert">
                    <span className={styles.errorIcon}>⚠️</span>
                    <span className={styles.errorText}>{comparisonError}</span>
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <button
                    onClick={calculateComparison}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={!personA || !personB}
                  >
                    <span className={styles.btnIcon}>⚖️</span>
                    <span className={styles.btnText}>Compare Ages</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    <span className={styles.btnIcon}>🗑️</span>
                    <span className={styles.btnText}>Clear All</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Results Grid */}
          {(age || comparisonResult) && (
            <div className={styles.resultsSection}>
              {/* Single Age Results */}
              {age && !comparisonMode && (
                <>
                  <div className={styles.resultsHeader}>
                    <h3 className={styles.resultsTitle}>Your Age</h3>
                    <p className={styles.resultsSubtitle}>
                      Detailed age breakdown
                    </p>
                  </div>

                  <div className={styles.ageStatsGrid}>
                    <div className={`${styles.ageStatCard}`}>
                      <div className={styles.statValueHighlight}>
                        {age.years}
                      </div>
                      <div className={styles.statLabel}>Years</div>
                    </div>
                    <div className={styles.ageStatCard}>
                      <div className={styles.statValue}>{age.months}</div>
                      <div className={styles.statLabel}>Months</div>
                    </div>
                    <div className={styles.ageStatCard}>
                      <div className={styles.statValue}>{age.days}</div>
                      <div className={styles.statLabel}>Days</div>
                    </div>
                    <div className={styles.ageStatCard}>
                      <div className={styles.statValue}>
                        {age.totalDays.toLocaleString()}
                      </div>
                      <div className={styles.statLabel}>Total Days</div>
                    </div>
                  </div>

                  {/* Western Zodiac Sign - Always Shown */}
                  {westernZodiac && (
                    <div className={styles.zodiacCard}>
                      <div className={styles.zodiacHeader}>
                        <h4 className={styles.zodiacTitle}>
                          <span className={styles.zodiacIcon}>⭐</span>
                          Western Zodiac Sign
                        </h4>
                        <p className={styles.zodiacSubtitle}>
                          Based on your birth date
                        </p>
                      </div>

                      <div className={styles.zodiacContent}>
                        <div className={styles.zodiacMain}>
                          <div className={styles.zodiacSymbolDisplay}>
                            <span className={styles.zodiacSymbolLarge}>
                              {westernZodiac.symbol}
                            </span>
                          </div>
                          <div className={styles.zodiacDetails}>
                            <h5 className={styles.zodiacName}>
                              {westernZodiac.name}
                            </h5>
                            <div
                              className={styles.zodiacElement}
                              style={
                                {
                                  "--element-color":
                                    ELEMENT_COLORS[westernZodiac.element],
                                } as React.CSSProperties
                              }
                            >
                              <span className={styles.elementDot}></span>
                              <span className={styles.elementText}>
                                {westernZodiac.element} Element
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indian Vedic Rashi - Only when enabled and valid */}
                  {enableVedic && (
                    <div className={styles.rashiCard}>
                      <div className={styles.rashiHeader}>
                        <h4 className={styles.rashiTitle}>
                          <span className={styles.rashiIcon}>🌙</span>
                          Indian Vedic Rashi (Moon Sign)
                        </h4>
                        <p className={styles.rashiSubtitle}>
                          Based on Moon position at birth
                        </p>
                      </div>

                      {vedicRashi ? (
                        <div className={styles.rashiContent}>
                          <div className={styles.rashiMain}>
                            <div className={styles.rashiSymbolDisplay}>
                              <span className={styles.rashiSymbolLarge}>
                                {vedicRashi.symbol}
                              </span>
                            </div>
                            <div className={styles.rashiDetails}>
                              <h5 className={styles.rashiName}>
                                {vedicRashi.name}
                              </h5>
                              <div className={styles.rashiEnglish}>
                                {vedicRashi.english}
                              </div>
                            </div>
                          </div>

                          <div className={styles.rashiInfo}>
                            <div
                              className={styles.rashiElement}
                              style={
                                {
                                  "--element-color":
                                    ELEMENT_COLORS[vedicRashi.element],
                                } as React.CSSProperties
                              }
                            >
                              <span className={styles.elementDot}></span>
                              <span className={styles.elementText}>
                                {vedicRashi.element} Element
                              </span>
                            </div>
                            <div className={styles.rashiDescription}>
                              {vedicRashi.description}
                            </div>
                          </div>
                        </div>
                      ) : vedicError ? (
                        <div className={styles.vedicWarningMessage}>
                          <span className={styles.warningIcon}>⚠️</span>
                          <p className={styles.warningText}>
                            {vedicError ||
                              "Please provide birth time and place for accurate Vedic Rashi calculation."}
                          </p>
                        </div>
                      ) : (
                        <div className={styles.vedicPlaceholder}>
                          <p className={styles.placeholderText}>
                            Enable Vedic Rashi and provide birth time & place
                            for accurate Moon sign calculation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Birthday Countdown */}
                  <div className={styles.countdownCard}>
                    <div className={styles.countdownHeader}>
                      <h4 className={styles.countdownTitle}>
                        <span className={styles.countdownIcon}>🎂</span>
                        Birthday Countdown
                      </h4>
                      <p className={styles.countdownSubtitle}>
                        Days until your next birthday
                      </p>
                    </div>

                    <div className={styles.countdownGrid}>
                      <div className={styles.countdownBlock}>
                        <div className={styles.countdownValue}>
                          {age.nextBirthday}
                        </div>
                        <div className={styles.countdownLabel}>Days</div>
                      </div>
                      <div className={styles.countdownBlock}>
                        <div className={styles.countdownValue}>
                          {Math.floor(age.nextBirthday / 7)}
                        </div>
                        <div className={styles.countdownLabel}>Weeks</div>
                      </div>
                      <div className={styles.countdownBlock}>
                        <div className={styles.countdownValue}>
                          {getDayOfWeek(birthDate)}
                        </div>
                        <div className={styles.countdownLabel}>Birth Day</div>
                      </div>
                      <div className={styles.countdownBlock}>
                        <div className={styles.countdownValue}>
                          {new Date().getFullYear() -
                            new Date(birthDate).getFullYear() +
                            1}
                        </div>
                        <div className={styles.countdownLabel}>Next Age</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Comparison Results */}
              {comparisonMode && comparisonResult && (
                <div className={styles.comparisonResults}>
                  <div className={styles.resultsHeader}>
                    <h3 className={styles.resultsTitle}>Comparison Result</h3>
                    <p className={styles.resultsSubtitle}>
                      Detailed age difference analysis
                    </p>
                  </div>

                  {comparisonResult.message ? (
                    <div className={styles.sameAgeCard}>
                      <div className={styles.sameAgeIcon}>🎯</div>
                      <div className={styles.sameAgeMessage}>
                        {comparisonResult.message}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.olderCard}>
                        <div className={styles.olderContent}>
                          <div className={styles.crownIcon}>👑</div>
                          <div className={styles.olderInfo}>
                            <div className={styles.olderLabel}>Older is</div>
                            <div className={styles.olderName}>
                              {comparisonResult.olderName}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.differenceCard}>
                        <div className={styles.differenceHeader}>
                          <h4 className={styles.differenceTitle}>
                            Age Difference
                          </h4>
                        </div>
                        <div className={styles.differenceGrid}>
                          <div className={styles.differenceBlock}>
                            <div
                              className={`${styles.differenceValue} ${styles.highlight}`}
                            >
                              {comparisonResult.difference.years}
                            </div>
                            <div className={styles.differenceLabel}>Years</div>
                          </div>
                          <div className={styles.differenceBlock}>
                            <div className={styles.differenceValue}>
                              {comparisonResult.difference.months}
                            </div>
                            <div className={styles.differenceLabel}>Months</div>
                          </div>
                          <div className={styles.differenceBlock}>
                            <div className={styles.differenceValue}>
                              {comparisonResult.difference.days}
                            </div>
                            <div className={styles.differenceLabel}>Days</div>
                          </div>
                        </div>
                        <div className={styles.totalDifference}>
                          <span className={styles.totalLabel}>
                            Total Days Difference:
                          </span>
                          <span className={styles.totalValue}>
                            {comparisonResult.difference.totalDays.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className={styles.individualComparison}>
                        <div className={styles.personCard}>
                          <div className={styles.personHeader}>
                            <span className={styles.personIcon}>👤</span>
                            <h5 className={styles.personName}>Person A</h5>
                          </div>
                          <div className={styles.personDetails}>
                            <div className={styles.personAge}>
                              {comparisonResult.personA.years} Years
                            </div>
                            <div className={styles.personDays}>
                              {comparisonResult.personA.totalDays.toLocaleString()}{" "}
                              Total Days
                            </div>
                            {comparisonResult.personA.zodiac && (
                              <div className={styles.personZodiac}>
                                <span className={styles.zodiacSymbolSmall}>
                                  {comparisonResult.personA.zodiac.symbol}
                                </span>
                                <span className={styles.zodiacNameSmall}>
                                  {comparisonResult.personA.zodiac.name}
                                </span>
                              </div>
                            )}
                            {enableVedicComparison &&
                              comparisonResult.personA.rashi && (
                                <div className={styles.personRashi}>
                                  <span className={styles.rashiSymbolSmall}>
                                    {comparisonResult.personA.rashi.symbol}
                                  </span>
                                  <span className={styles.rashiNameSmall}>
                                    🌙 {comparisonResult.personA.rashi.name}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className={styles.personCard}>
                          <div className={styles.personHeader}>
                            <span className={styles.personIcon}>👤</span>
                            <h5 className={styles.personName}>Person B</h5>
                          </div>
                          <div className={styles.personDetails}>
                            <div className={styles.personAge}>
                              {comparisonResult.personB.years} Years
                            </div>
                            <div className={styles.personDays}>
                              {comparisonResult.personB.totalDays.toLocaleString()}{" "}
                              Total Days
                            </div>
                            {comparisonResult.personB.zodiac && (
                              <div className={styles.personZodiac}>
                                <span className={styles.zodiacSymbolSmall}>
                                  {comparisonResult.personB.zodiac.symbol}
                                </span>
                                <span className={styles.zodiacNameSmall}>
                                  {comparisonResult.personB.zodiac.name}
                                </span>
                              </div>
                            )}
                            {enableVedicComparison &&
                              comparisonResult.personB.rashi && (
                                <div className={styles.personRashi}>
                                  <span className={styles.rashiSymbolSmall}>
                                    {comparisonResult.personB.rashi.symbol}
                                  </span>
                                  <span className={styles.rashiNameSmall}>
                                    🌙 {comparisonResult.personB.rashi.name}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgeCalculator;
