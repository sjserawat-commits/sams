import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type InvestigationSeed = {
  code: string;
  name: string;
  shortName?: string;
  category: string;
  department?: string;
  specimen?: string;
  aliases?: string[];
};

// Initial canonical catalogue. This is intentionally a broad, structured seed;
// SMS-specific rates/reference intervals are not fabricated and should be filled
// only after source verification.
const investigations: InvestigationSeed[] = [
  // Hematology
  { code: "CBC", name: "Complete Blood Count", shortName: "CBC", category: "Hematology", specimen: "EDTA blood", aliases: ["complete hemogram", "hemogram"] },
  { code: "HB", name: "Hemoglobin", shortName: "Hb", category: "Hematology", specimen: "Blood", aliases: ["haemoglobin"] },
  { code: "ESR", name: "Erythrocyte Sedimentation Rate", shortName: "ESR", category: "Hematology", specimen: "Blood" },
  { code: "PLT", name: "Platelet Count", shortName: "Platelet", category: "Hematology", specimen: "EDTA blood" },
  { code: "RETIC", name: "Reticulocyte Count", shortName: "Retic Count", category: "Hematology", specimen: "Blood" },
  { code: "PBS", name: "Peripheral Blood Smear", shortName: "PBS", category: "Hematology", specimen: "Blood", aliases: ["peripheral smear", "blood film"] },
  { code: "PTINR", name: "Prothrombin Time / INR", shortName: "PT/INR", category: "Coagulation", specimen: "Citrated plasma" },
  { code: "APTT", name: "Activated Partial Thromboplastin Time", shortName: "aPTT", category: "Coagulation", specimen: "Citrated plasma" },
  { code: "BTCT", name: "Bleeding Time / Clotting Time", shortName: "BT/CT", category: "Coagulation", specimen: "Blood" },

  // Biochemistry
  { code: "FBS", name: "Blood Sugar (Fasting)", shortName: "FBS", category: "Biochemistry", specimen: "Fluoride plasma", aliases: ["fasting blood sugar", "fasting glucose"] },
  { code: "PPBS", name: "Blood Sugar (Post Prandial)", shortName: "PPBS", category: "Biochemistry", specimen: "Fluoride plasma", aliases: ["pp blood sugar", "post prandial glucose"] },
  { code: "RBS", name: "Blood Sugar (Random)", shortName: "RBS", category: "Biochemistry", specimen: "Fluoride plasma", aliases: ["random blood sugar", "random glucose"] },
  { code: "UREA", name: "Serum Urea", shortName: "Urea", category: "Biochemistry", specimen: "Serum" },
  { code: "CREAT", name: "Serum Creatinine", shortName: "Creatinine", category: "Biochemistry", specimen: "Serum" },
  { code: "URIC", name: "Serum Uric Acid", shortName: "Uric Acid", category: "Biochemistry", specimen: "Serum" },
  { code: "CALCIUM", name: "Serum Calcium", shortName: "Calcium", category: "Biochemistry", specimen: "Serum" },
  { code: "PHOS", name: "Serum Phosphorus", shortName: "Phosphorus", category: "Biochemistry", specimen: "Serum" },
  { code: "NA", name: "Serum Sodium", shortName: "Na+", category: "Biochemistry", specimen: "Serum" },
  { code: "K", name: "Serum Potassium", shortName: "K+", category: "Biochemistry", specimen: "Serum" },
  { code: "CL", name: "Serum Chloride", shortName: "Cl-", category: "Biochemistry", specimen: "Serum" },
  { code: "LFT", name: "Liver Function Test", shortName: "LFT", category: "Biochemistry", specimen: "Serum" },
  { code: "RFT", name: "Renal Function Test", shortName: "RFT", category: "Biochemistry", specimen: "Serum" },
  { code: "LIPID", name: "Lipid Profile", shortName: "Lipid Profile", category: "Biochemistry", specimen: "Serum" },
  { code: "HBA1C", name: "Glycated Hemoglobin", shortName: "HbA1c", category: "Biochemistry", specimen: "EDTA blood", aliases: ["glycosylated hemoglobin"] },

  // Endocrine / vitamins
  { code: "TSH", name: "Thyroid Stimulating Hormone", shortName: "TSH", category: "Endocrinology", specimen: "Serum" },
  { code: "FT3", name: "Free Triiodothyronine", shortName: "FT3", category: "Endocrinology", specimen: "Serum" },
  { code: "FT4", name: "Free Thyroxine", shortName: "FT4", category: "Endocrinology", specimen: "Serum" },
  { code: "T3", name: "Total Triiodothyronine", shortName: "T3", category: "Endocrinology", specimen: "Serum" },
  { code: "T4", name: "Total Thyroxine", shortName: "T4", category: "Endocrinology", specimen: "Serum" },
  { code: "VITD", name: "Vitamin D, 25-OH", shortName: "Vitamin D", category: "Vitamins & Nutrition", specimen: "Serum", aliases: ["25 hydroxy vitamin D", "25-OH vitamin D"] },
  { code: "B12", name: "Vitamin B12", shortName: "B12", category: "Vitamins & Nutrition", specimen: "Serum" },
  { code: "FOLATE", name: "Folate", shortName: "Folate", category: "Vitamins & Nutrition", specimen: "Serum" },
  { code: "PTH", name: "Parathyroid Hormone", shortName: "PTH", category: "Endocrinology", specimen: "Serum" },
  { code: "CORTISOL", name: "Serum Cortisol", shortName: "Cortisol", category: "Endocrinology", specimen: "Serum" },

  // Clinical pathology
  { code: "URINE_RM", name: "Urine Routine Examination & Microscopy", shortName: "Urine R/M", category: "Clinical Pathology", specimen: "Urine", aliases: ["urine routine", "urine microscopy"] },
  { code: "URINE_CULT", name: "Urine Culture & Sensitivity", shortName: "Urine C/S", category: "Microbiology", specimen: "Urine" },
  { code: "STOOL_RM", name: "Stool Routine Examination", shortName: "Stool R/M", category: "Clinical Pathology", specimen: "Stool" },
  { code: "SEMEN", name: "Semen Analysis", shortName: "Semen Analysis", category: "Clinical Pathology", specimen: "Semen" },

  // Microbiology / serology / molecular
  { code: "BLOOD_CULT", name: "Blood Culture & Sensitivity", shortName: "Blood C/S", category: "Bacteriology", specimen: "Blood" },
  { code: "GRAM", name: "Gram Staining", shortName: "Gram Stain", category: "Bacteriology", specimen: "Clinical specimen" },
  { code: "AFB_STAIN", name: "Acid-Fast Bacilli Staining", shortName: "AFB Stain", category: "Microbiology", specimen: "Clinical specimen" },
  { code: "HBSAG", name: "Hepatitis B Surface Antigen", shortName: "HBsAg", category: "Serology", specimen: "Serum" },
  { code: "HCV", name: "Hepatitis C Antibody", shortName: "Anti-HCV", category: "Serology", specimen: "Serum" },
  { code: "HIV", name: "HIV 1 & 2 Screening", shortName: "HIV", category: "Serology", specimen: "Serum" },
  { code: "DENGUE_NS1", name: "Dengue NS1 Antigen", shortName: "Dengue NS1", category: "Serology", specimen: "Serum" },
  { code: "DENGUE_IGM", name: "Dengue IgM Antibody", shortName: "Dengue IgM", category: "Serology", specimen: "Serum" },
  { code: "WIDAL", name: "Widal Test", shortName: "Widal", category: "Serology", specimen: "Serum" },
  { code: "TB_DNA", name: "Tuberculosis DNA Qualitative Test", shortName: "TB DNA", category: "Molecular Diagnostics", specimen: "Clinical specimen" },
  { code: "HBV_DNA", name: "HBV DNA Quantitative", shortName: "HBV DNA", category: "Molecular Diagnostics", specimen: "Plasma/serum" },
  { code: "HCV_RNA", name: "HCV RNA Quantitative", shortName: "HCV RNA", category: "Molecular Diagnostics", specimen: "Plasma/serum" },
  { code: "HIV_RNA", name: "HIV RNA Quantitative", shortName: "HIV RNA", category: "Molecular Diagnostics", specimen: "Plasma" },

  // Histopathology / cytology
  { code: "BIOPSY", name: "Biopsy / Histopathology Examination", shortName: "Biopsy", category: "Histopathology", specimen: "Tissue", aliases: ["histopathology", "histology"] },
  { code: "FNAC", name: "Fine Needle Aspiration Cytology", shortName: "FNAC", category: "Cytology", specimen: "Aspirate", aliases: ["fine needle aspiration"] },
  { code: "CYTOLOGY", name: "Cytology Examination", shortName: "Cytology", category: "Cytology", specimen: "Cell/fluid specimen" },

  // Radiology / imaging
  { code: "XRAY", name: "X-Ray Examination", shortName: "X-Ray", category: "Radiology", specimen: "Imaging" },
  { code: "USG", name: "Ultrasonography", shortName: "USG", category: "Ultrasound", specimen: "Imaging" },
  { code: "DOPPLER", name: "Doppler Ultrasonography", shortName: "Doppler", category: "Ultrasound", specimen: "Imaging" },
  { code: "CT", name: "Computed Tomography", shortName: "CT", category: "CT", specimen: "Imaging" },
  { code: "MRI", name: "Magnetic Resonance Imaging", shortName: "MRI", category: "MRI", specimen: "Imaging" },
  { code: "DEXA", name: "Bone Mineral Density / DXA", shortName: "DXA", category: "Bone & Metabolic", specimen: "Imaging", aliases: ["DEXA", "BMD"] },

  // Cardio / functional
  { code: "ECG", name: "Electrocardiogram", shortName: "ECG", category: "Cardiology", specimen: "Functional test" },
  { code: "ECHO", name: "Echocardiography", shortName: "ECHO", category: "Cardiology", specimen: "Imaging" },
  { code: "PFT", name: "Pulmonary Function Test", shortName: "PFT", category: "Pulmonary", specimen: "Functional test" },
  { code: "PSG", name: "Polysomnography", shortName: "PSG", category: "Sleep Medicine", specimen: "Functional test" },

  // Electrodiagnosis: F-wave and H-reflex remain components of NCV/NCS, not standalone investigations.
  { code: "NCV_NCS", name: "Nerve Conduction Study", shortName: "NCV/NCS", category: "Electrodiagnosis", department: "PM&R", specimen: "Functional test", aliases: ["NCV", "NCS", "nerve conduction velocity", "F-wave", "H-reflex"] },
  { code: "EMG", name: "Needle Electromyography", shortName: "EMG", category: "Electrodiagnosis", department: "PM&R", specimen: "Functional test", aliases: ["needle EMG", "electromyography"] },
  { code: "EMG_NCV", name: "EMG + Nerve Conduction Study", shortName: "EMG/NCV", category: "Electrodiagnosis", department: "PM&R", specimen: "Functional test" },
  { code: "RNS", name: "Repetitive Nerve Stimulation", shortName: "RNS", category: "Electrodiagnosis", department: "PM&R", specimen: "Functional test" },
  { code: "SSEP", name: "Somatosensory Evoked Potentials", shortName: "SSEP", category: "Neurophysiology", department: "Neurology", specimen: "Functional test" },
  { code: "VEP", name: "Visual Evoked Potentials", shortName: "VEP", category: "Neurophysiology", specimen: "Functional test" },
  { code: "BAEP", name: "Brainstem Auditory Evoked Potentials", shortName: "BAEP/BERA", category: "Neurophysiology", specimen: "Functional test", aliases: ["BERA"] },
];

async function main() {
  for (const item of investigations) {
    await prisma.investigationMaster.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        shortName: item.shortName,
        category: item.category,
        department: item.department,
        specimen: item.specimen,
        aliases: item.aliases?.join(", "),
        active: true,
      },
      create: {
        code: item.code,
        name: item.name,
        shortName: item.shortName,
        category: item.category,
        department: item.department,
        specimen: item.specimen,
        aliases: item.aliases?.join(", "),
        active: true,
      },
    });
  }

  console.log(`Seeded/updated ${investigations.length} canonical investigation entries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
