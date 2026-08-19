import { prisma } from "../lib/prisma";

/**
 * Canonical biological/reference intervals for the Investigation Master.
 * These are display/reference defaults for adult patients and are not intended
 * to replace the performing laboratory's validated method-specific intervals.
 * Qualitative investigations use their expected normal state; imaging and
 * functional procedures use an explicit "Not applicable" value.
 */
const referenceRanges: Record<string, string> = {
  CBC: "Hb M 13–17 g/dL; F 12–15 g/dL; TLC 4,000–11,000/µL; Platelets 150,000–450,000/µL",
  HB: "Male 13–17 g/dL; Female 12–15 g/dL",
  TLC: "4,000–11,000/µL",
  DLC: "Neutrophils 40–75%; Lymphocytes 20–45%; Monocytes 2–10%; Eosinophils 1–6%; Basophils 0–1%",
  TEC: "40–400/µL",
  RBC: "Male 4.5–5.9 million/µL; Female 4.1–5.1 million/µL",
  ESR: "Male 0–15 mm/hr; Female 0–20 mm/hr",
  PLT: "150,000–450,000/µL",
  RETIC: "0.5–2.5%",
  PBS: "No abnormal cells; morphology within expected limits",
  PBF: "No abnormal cells; morphology within expected limits",
  PTINR: "PT approximately 11–14 sec; INR 0.8–1.2",
  APTT: "Approximately 25–35 sec",
  BT: "2–7 min",
  CT: "5–11 min",
  FDP: "<5 µg/mL FEU (method dependent)",
  DDIMER: "<0.50 µg/mL FEU",
  FIBRINOGEN: "200–400 mg/dL",
  THROMBIN: "14–19 sec",
  PROTEIN_C: "70–140% activity",
  PROTEIN_S: "60–140% activity (method/sex dependent)",
  F8: "50–150% activity",
  F9: "50–150% activity",
  FBS: "70–99 mg/dL",
  PPBS: "<140 mg/dL (2 hr)",
  RBS: "Usually <200 mg/dL; interpret with clinical context",
  UREA: "15–40 mg/dL",
  CREAT: "Male 0.74–1.35 mg/dL; Female 0.59–1.04 mg/dL",
  URIC: "Male 3.4–7.0 mg/dL; Female 2.4–6.0 mg/dL",
  CALCIUM: "8.5–10.5 mg/dL",
  PHOS: "Adult 2.5–4.5 mg/dL",
  IRON: "Male 65–175 µg/dL; Female 50–170 µg/dL",
  TIBC: "250–450 µg/dL",
  TP_ALB: "Total protein 6.0–8.3 g/dL; A/G ratio 1.0–2.5",
  ABG: "pH 7.35–7.45; PaCO₂ 35–45 mmHg; PaO₂ 80–100 mmHg; HCO₃⁻ 22–26 mmol/L",
  ELECTROLYTES: "Na 135–145; K 3.5–5.1; Cl 98–107 mmol/L",
  NA: "135–145 mmol/L",
  K: "3.5–5.1 mmol/L",
  CL: "98–107 mmol/L",
  BILT: "0.2–1.2 mg/dL",
  BILD: "0.0–0.3 mg/dL",
  AST: "Male ~15–40 U/L; Female ~13–35 U/L",
  ALT: "Male ~10–40 U/L; Female ~7–35 U/L",
  ALP: "44–147 U/L",
  LDH: "140–280 U/L",
  CPK: "Male ~39–308 U/L; Female ~26–192 U/L",
  CKMB: "<5 ng/mL (mass assay; method dependent)",
  GGT: "Male ~8–61 U/L; Female ~5–36 U/L",
  AMYLASE: "30–110 U/L",
  LIPASE: "13–60 U/L",
  LIPID: "Total cholesterol <200 mg/dL; TG <150; LDL <100; HDL ≥40 mg/dL",
  TG: "<150 mg/dL",
  CHOL: "<200 mg/dL",
  HDL: "Male ≥40 mg/dL; Female ≥50 mg/dL",
  HBA1C: "Normal <5.7%; prediabetes 5.7–6.4%; diabetes ≥6.5%",
  FERRITIN: "Male ~30–400 ng/mL; Female ~13–150 ng/mL",
  CRP: "<5 mg/L",
  TROPONIN_T: "Below assay-specific 99th percentile; commonly <14 ng/L",
  TROPONIN_I: "Below assay-specific 99th percentile (assay dependent)",
  MYOGLOBIN: "Male 28–72 ng/mL; Female 25–58 ng/mL",
  NTPROBNP: "<125 pg/mL (outpatient adults <75 yr; age dependent)",
  PCT: "<0.05 ng/mL",
  FT3: "2.3–4.2 pg/mL",
  FT4: "0.8–1.8 ng/dL",
  TSH: "0.4–4.0 mIU/L",
  T3: "80–200 ng/dL",
  T4: "5.0–12.0 µg/dL",
  ANTI_TPO: "Negative <35 IU/mL",
  FSH: "Male ~1.5–12.4 IU/L; female range varies by cycle/menopause",
  LH: "Male ~1.7–8.6 IU/L; female range varies by cycle/menopause",
  PROLACTIN: "Male ~4–15 ng/mL; Female ~4–23 ng/mL",
  BHCG: "Non-pregnant <5 mIU/mL",
  TESTOSTERONE: "Male ~300–1,000 ng/dL; Female ~15–70 ng/dL",
  CORTISOL: "8 AM approximately 5–25 µg/dL; time dependent",
  GH: "Random value is pulsatile; laboratory-specific; interpret with stimulation/suppression testing",
  PTH: "15–65 pg/mL",
  INSULIN: "Fasting approximately 2–25 µIU/mL",
  B12: "200–900 pg/mL",
  FOLATE: ">4 ng/mL",
  VITD: "30–100 ng/mL generally considered sufficient",
  CEA: "Non-smoker <2.5 ng/mL; smoker <5 ng/mL",
  AFP: "<10 ng/mL (adult, non-pregnant)",
  CA125: "<35 U/mL",
  PSA: "<4.0 ng/mL (age dependent)",
  IGE: "Adult approximately <100–150 IU/mL (age/lab dependent)",
  C3: "90–180 mg/dL",
  C4: "10–40 mg/dL",
  IGA: "70–400 mg/dL",
  IGG: "700–1,600 mg/dL",
  IGM: "40–230 mg/dL",
  HBSAG: "Negative / Non-reactive",
  HCV: "Negative / Non-reactive",
  ANTI_HCV: "Negative / Non-reactive",
  HBEAG: "Negative / Non-reactive",
  ANTI_HBE: "Negative / Non-reactive",
  ANTI_HAV_IGM: "Negative / Non-reactive",
  HEV_IGM: "Negative / Non-reactive",
  HIV: "Negative / Non-reactive",
  WIDAL: "No significant agglutination; titre interpretation is laboratory/local protocol dependent",
  VDRL_Q: "Non-reactive",
  ASLO: "<200 IU/mL (adult; lab dependent)",
  RF: "<14 IU/mL",
  DENGUE_NS1: "Negative",
  DENGUE_IGM: "Negative",
  DENGUE_IGM_IGG: "IgM/IgG negative",
  TORCH: "IgM negative; IgG interpreted according to individual analyte and clinical context",
  ANA: "Negative",
  ANTI_DSDNA: "Negative; assay-specific cut-off",
  HLA_B27: "Negative / Not detected",
  HLA_CELIAC: "DQ2/DQ8 not detected",
  URINE_RM: "Protein negative; glucose negative; RBC 0–2/HPF; WBC 0–5/HPF",
  URINE_CS: "No significant growth",
  URINE_CULT: "No significant growth",
  SEMEN: "WHO-based: volume ≥1.4 mL; concentration ≥16 million/mL; progressive motility ≥30% (method/edition dependent)",
  CSF_CELL: "WBC 0–5/µL; RBC 0/µL",
  ASCITES_CELL: "No universal interval; interpret cell count/differential clinically",
  PLEURAL_CELL: "No universal interval; interpret cell count/differential clinically",
  PAP: "Negative for intraepithelial lesion or malignancy",
  FNAC: "No malignant cells / benign cytology (site dependent)",
  BIOPSY: "No universal biological reference interval; histopathology diagnosis is morphology/site dependent",
  BONE_MARROW: "Age- and lineage-appropriate marrow morphology; no abnormal infiltrate",
  AFB_STAIN: "Negative",
  GRAM: "No pathogenic organisms identified; specimen-specific",
  FUNGUS_CULT: "No fungal growth",
  KOH: "No fungal elements seen",
  BLOOD_CS: "No significant growth",
  PUS_CS: "No significant growth",
  SPUTUM_CS: "No significant growth of significant pathogen",
  STOOL_CS: "No significant growth of enteric pathogen",
  CSF_CS: "No growth",
  TB_CULTURE: "No Mycobacterium tuberculosis complex isolated",
  TB_CULTURE_URINE: "No Mycobacterium tuberculosis complex isolated",
  MTBDR_PLUS: "MTB not detected; drug-resistance markers not detected",
  MTBDRSL: "MTB not detected; resistance markers not detected",
  XPERT_MTB: "MTB not detected",
  XPERT_FLU: "Influenza A/B not detected",
  XPERT_HIV_VL: "HIV-1 RNA not detected / below assay quantification limit",
  XPERT_HCV: "HCV RNA not detected / below assay quantification limit",
  XPERT_HPV: "High-risk HPV not detected",
  HBV_DNA: "HBV DNA not detected",
  HCV_RNA: "HCV RNA not detected",
  HIV_RNA: "HIV RNA not detected",
  CMV_DNA: "CMV DNA not detected",
  HSV_DNA: "HSV DNA not detected",
};

function fallbackReference(category: string, name: string) {
  const c = category.toLowerCase();
  const n = name.toLowerCase();

  // Common 24-hour urine analytes. These are especially useful for the
  // expanded renal/metabolic catalogue and prevent generic placeholders.
  if (/24\s*hour.*urine.*copper|urine.*copper.*24\s*hour/.test(n)) return "Approximately 15–60 µg/day (adult; laboratory dependent)";
  if (/24\s*hour.*urine.*citrate|urine.*citrate.*24\s*hour/.test(n)) return ">320 mg/day (adult; collection/lab dependent)";
  if (/24\s*hour.*urine.*oxalate|urine.*oxalate.*24\s*hour/.test(n)) return "Adult approximately 4–31 mg/day";
  if (/24\s*hour.*urine.*calcium|urine.*calcium.*24\s*hour/.test(n)) return "Male <300 mg/day; Female <250 mg/day";
  if (/24\s*hour.*urine.*uric acid|urine.*uric acid.*24\s*hour/.test(n)) return "Male <800 mg/day; Female <750 mg/day";
  if (/24\s*hour.*urine.*protein|urine.*protein.*24\s*hour/.test(n)) return "<150 mg/day";
  if (/24\s*hour.*urine.*creatinine|urine.*creatinine.*24\s*hour/.test(n)) return "Male ~14–26 mg/kg/day; Female ~11–20 mg/kg/day";
  if (/24\s*hour.*urine.*sodium|urine.*sodium.*24\s*hour/.test(n)) return "Approximately 40–220 mmol/day (diet dependent)";
  if (/24\s*hour.*urine.*potassium|urine.*potassium.*24\s*hour/.test(n)) return "Approximately 25–125 mmol/day (diet dependent)";

  if (["radiology", "ultrasound", "ct", "mri", "x-ray"].some(x => c.includes(x)) || /x-ray|ultrasound|doppler|ct |computed tomography|mri|echocardi|ecg|electrocardio/.test(n)) {
    return "Not applicable — imaging/procedure; report-specific normal findings apply";
  }
  if (["electrodiagnosis", "neurophysiology", "pulmonary", "sleep medicine"].some(x => c.includes(x)) || /nerve conduction|emg|electromyography|evoked potential|pulmonary function|polysomnography/.test(n)) {
    return "Not applicable — functional study; interpretation is method/protocol dependent";
  }
  if (c.includes("serology") || c.includes("microbiology") || c.includes("molecular") || c.includes("immunology") || /antibody|antigen|culture|pcr|dna|rna|stain/.test(n)) {
    return "Negative / Not detected (assay-specific reference)";
  }
  if (c.includes("histopathology") || c.includes("cytology") || c.includes("hematopathology")) {
    return "No abnormal/malignant cells; site-specific histopathology reference applies";
  }
  if (c.includes("hematology")) return "Age/sex-specific adult reference interval; validated laboratory method applies";
  if (c.includes("coagulation")) return "Method-specific validated reference interval; interpret with clinical context";
  if (c.includes("endocrinology")) return "Age/sex/time-of-day or cycle-specific reference interval; validated laboratory method applies";
  if (c.includes("biochemistry") || c.includes("clinical pathology")) return "Adult reference interval configured by analyte/method; performing laboratory validation applies";
  return "Configured reference state: laboratory/procedure-specific validated interval applies";
}

async function main() {
  const rows = await prisma.investigationMaster.findMany({ where: { active: true } });
  let curated = 0;
  let configured = 0;

  for (const row of rows) {
    const referenceRange = referenceRanges[row.code] ?? fallbackReference(row.category, row.name);
    await prisma.investigationMaster.update({ where: { id: row.id }, data: { referenceRange } });
    configured += 1;
    if (referenceRanges[row.code]) curated += 1;
  }

  console.log(`Configured biological/reference values for ${configured} active investigations (${curated} curated analyte values; remaining entries receive explicit category/procedure reference states).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
