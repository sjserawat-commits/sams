import { prisma } from "../lib/prisma";

type Seed = {
  code: string;
  name: string;
  shortName?: string;
  category: string;
  department?: string;
  specimen?: string;
  smsBenchmarkRate?: number;
  corporateBenchmarkRate?: number;
  rate?: number;
  aliases?: string[];
};

/**
 * Expansion policy:
 * - SMS benchmark values are taken from the publicly available SMS Jaipur
 *   investigation-rate list where a direct match exists.
 * - Corporate benchmarks are provisional market-positioning benchmarks, not
 *   claimed as official tariffs. They are intentionally conservative.
 * - SAMS is placed 65% of the way from SMS toward the corporate benchmark.
 *
 * The catalogue is deliberately expandable. New verified tariffs can replace
 * provisional corporate benchmarks without changing the workflow.
 */
const direct: Array<[string, string, string, string, string, number]> = [
  ["HB","Hemoglobin","Hb","Hematology","Blood",30],
  ["TLC","Total Leukocyte Count","TLC","Hematology","Blood",15],
  ["DLC","Differential Leukocyte Count","DLC","Hematology","Blood",15],
  ["TEC","Total Eosinophil Count","TEC","Hematology","Blood",15],
  ["RBC","Total Red Blood Cell Count","RBC","Hematology","Blood",15],
  ["ESR","Erythrocyte Sedimentation Rate","ESR","Hematology","Blood",10],
  ["PBF","Peripheral Blood Film","PBF","Hematology","Blood",20],
  ["PLT","Platelet Count","Platelets","Hematology","Blood",15],
  ["RETIC","Reticulocyte Count","Retic","Hematology","Blood",15],
  ["BT","Bleeding Time","BT","Coagulation","Blood",10],
  ["CT","Clotting Time","CT","Coagulation","Blood",10],
  ["PTINR","Prothrombin Time / INR","PT/INR","Coagulation","Citrated plasma",30],
  ["APTT","Activated Partial Thromboplastin Time","APTT","Coagulation","Citrated plasma",60],
  ["FDP","FDP Test","FDP","Coagulation","Plasma",300],
  ["DDIMER","D-Dimer","D-Dimer","Coagulation","Plasma",250],
  ["FIBRINOGEN","Serum Fibrinogen","Fibrinogen","Coagulation","Plasma",350],
  ["THROMBIN","Thrombin Time","TT","Coagulation","Plasma",200],
  ["PROTEIN_C","Protein C","Protein C","Coagulation","Plasma",1500],
  ["PROTEIN_S","Protein S","Protein S","Coagulation","Plasma",1500],
  ["F8","Factor VIII Estimation","Factor VIII","Coagulation","Plasma",800],
  ["F9","Factor IX Estimation","Factor IX","Coagulation","Plasma",800],
  ["FBS","Blood Sugar Fasting","FBS","Biochemistry","Fluoride plasma",20],
  ["PPBS","Blood Sugar Post Prandial","PPBS","Biochemistry","Fluoride plasma",20],
  ["RBS","Blood Sugar Random","RBS","Biochemistry","Fluoride plasma",20],
  ["UREA","Serum Urea","Urea","Biochemistry","Serum",25],
  ["CREAT","Serum Creatinine","Creatinine","Biochemistry","Serum",25],
  ["URIC","Serum Uric Acid","Uric Acid","Biochemistry","Serum",35],
  ["CALCIUM","Serum Calcium","Calcium","Biochemistry","Serum",35],
  ["PHOS","Serum Phosphorus","Phosphorus","Biochemistry","Serum",35],
  ["IRON","Serum Iron","Iron","Biochemistry","Serum",60],
  ["TIBC","Total Iron Binding Capacity","TIBC","Biochemistry","Serum",60],
  ["TP_ALB","Total Protein / Albumin Globulin Ratio","TP/A:G","Biochemistry","Serum",35],
  ["ABG","Blood Gas Analysis","ABG","Biochemistry","Heparinized blood",230],
  ["ELECTROLYTES","Serum Electrolytes","Electrolytes","Biochemistry","Serum",70],
  ["NA","Serum Sodium","Na+","Biochemistry","Serum",70],
  ["K","Serum Potassium","K+","Biochemistry","Serum",70],
  ["BILT","Serum Bilirubin Total","Total Bilirubin","Biochemistry","Serum",40],
  ["BILD","Serum Bilirubin Direct","Direct Bilirubin","Biochemistry","Serum",40],
  ["AST","SGOT / AST","AST","Biochemistry","Serum",25],
  ["ALT","SGPT / ALT","ALT","Biochemistry","Serum",25],
  ["ALP","Alkaline Phosphatase","ALP","Biochemistry","Serum",35],
  ["LDH","Lactate Dehydrogenase","LDH","Biochemistry","Serum",100],
  ["CPK","Creatine Phosphokinase","CPK","Biochemistry","Serum",100],
  ["CKMB","CK-MB","CK-MB","Biochemistry","Serum",420],
  ["GGT","Gamma GT","GGT","Biochemistry","Serum",100],
  ["AMYLASE","Serum Amylase","Amylase","Biochemistry","Serum",60],
  ["LIPASE","Serum Lipase","Lipase","Biochemistry","Serum",60],
  ["LIPID","Total Lipid Profile","Lipid Profile","Biochemistry","Serum",210],
  ["TG","Triglycerides","TG","Biochemistry","Serum",70],
  ["CHOL","Total Cholesterol","Cholesterol","Biochemistry","Serum",25],
  ["HDL","HDL Cholesterol","HDL","Biochemistry","Serum",40],
  ["HBA1C","Glycated Hemoglobin","HbA1c","Biochemistry","EDTA blood",200],
  ["FERRITIN","Serum Ferritin","Ferritin","Immunoassay","Serum",150],
  ["CRP","C-Reactive Protein","CRP","Immunology","Serum",185],
  ["TROPONIN_T","Troponin T","Troponin T","Cardiology","Blood",510],
  ["TROPONIN_I","Troponin I","Troponin I","Cardiology","Blood",510],
  ["MYOGLOBIN","Myoglobin","Myoglobin","Cardiology","Blood",495],
  ["NTPROBNP","NT-proBNP","NT-proBNP","Cardiology","Blood",1008],
  ["PCT","Procalcitonin","PCT","Immunology","Serum",924],
  ["FT3","Free T3","FT3","Endocrinology","Serum",100],
  ["FT4","Free T4","FT4","Endocrinology","Serum",100],
  ["TSH","Thyroid Stimulating Hormone","TSH","Endocrinology","Serum",100],
  ["ANTI_TPO","Anti-TPO Antibody","Anti-TPO","Endocrinology","Serum",250],
  ["FSH","Follicle Stimulating Hormone","FSH","Endocrinology","Serum",150],
  ["LH","Luteinizing Hormone","LH","Endocrinology","Serum",150],
  ["PROLACTIN","Prolactin","Prolactin","Endocrinology","Serum",150],
  ["BHCG","Beta hCG","β-hCG","Endocrinology","Serum",200],
  ["TESTOSTERONE","Testosterone","Testosterone","Endocrinology","Serum",200],
  ["CORTISOL","Cortisol","Cortisol","Endocrinology","Serum",200],
  ["GH","Growth Hormone","GH","Endocrinology","Serum",200],
  ["PTH","Parathyroid Hormone","PTH","Endocrinology","Serum",400],
  ["INSULIN","Insulin","Insulin","Endocrinology","Serum",200],
  ["B12","Vitamin B12","B12","Vitamins & Nutrition","Serum",300],
  ["FOLATE","Folate","Folate","Vitamins & Nutrition","Serum",300],
  ["VITD","Vitamin D3 / 25-OH Vitamin D","Vitamin D","Vitamins & Nutrition","Serum",1000],
  ["CEA","Carcinoembryonic Antigen","CEA","Tumor Markers","Serum",200],
  ["AFP","Alpha Fetoprotein","AFP","Tumor Markers","Serum",200],
  ["CA125","CA-125","CA-125","Tumor Markers","Serum",320],
  ["PSA","Prostate Specific Antigen","PSA","Tumor Markers","Serum",200],
  ["IGE","Total IgE","IgE","Immunology","Serum",250],
  ["C3","Complement C3","C3","Immunology","Serum",350],
  ["C4","Complement C4","C4","Immunology","Serum",350],
  ["IGA","Immunoglobulin A","IgA","Immunology","Serum",450],
  ["IGG","Immunoglobulin G","IgG","Immunology","Serum",450],
  ["IGM","Immunoglobulin M","IgM","Immunology","Serum",450],
  ["HBSAG","HBsAg","HBsAg","Serology","Serum",60],
  ["ANTI_HCV","Anti-HCV","Anti-HCV","Serology","Serum",350],
  ["HBEAG","HBeAg","HBeAg","Serology","Serum",350],
  ["ANTI_HBE","Anti-HBe","Anti-HBe","Serology","Serum",350],
  ["ANTI_HAV_IGM","Anti-HAV IgM","HAV IgM","Serology","Serum",350],
  ["HEV_IGM","HEV IgM","HEV IgM","Serology","Serum",350],
  ["WIDAL","Widal Test","Widal","Serology","Serum",30],
  ["VDRL_Q","VDRL Quantitative","VDRL","Serology","Serum",30],
  ["ASLO","ASLO Titre","ASLO","Serology","Serum",70],
  ["RF","Rheumatoid Factor","RF","Serology","Serum",35],
  ["DENGUE_IGM_IGG","Dengue IgM + IgG","Dengue IgM/IgG","Serology","Serum",475],
  ["TORCH","Complete TORCH Profile","TORCH","Serology","Serum",1400],
  ["ANA","Anti-Nuclear Antibody","ANA","Autoimmunity","Serum",300],
  ["ANTI_DSDNA","Anti-dsDNA","Anti-dsDNA","Autoimmunity","Serum",300],
  ["HLA_B27","HLA-B27","HLA-B27","Immunology","Blood",1000],
  ["HLA_CELIAC","HLA Typing for Celiac Disease DQ2/DQ8","HLA Celiac","Immunology","Blood",2000],
  ["URINE_RM","Urine Routine Examination","Urine R/M","Clinical Pathology","Urine",15],
  ["SEMEN","Semen Examination","Semen","Clinical Pathology","Semen",15],
  ["CSF_CELL","CSF Cell Count","CSF cells","Clinical Pathology","CSF",15],
  ["ASCITES_CELL","Ascitic Fluid Cell Count","Ascites cells","Clinical Pathology","Ascitic fluid",15],
  ["PLEURAL_CELL","Pleural Fluid Cell Count","Pleural cells","Clinical Pathology","Pleural fluid",15],
  ["PAP","Pap Smear","Pap","Cytology","Cervical specimen",60],
  ["FNAC","Fine Needle Aspiration Cytology","FNAC","Cytology","Aspirate",60],
  ["BIOPSY","Biopsy / Histopathology","Biopsy","Histopathology","Tissue",150],
  ["BONE_MARROW","Bone Marrow Aspiration + PBF","Bone marrow","Hematopathology","Bone marrow",60],
  ["RENAL_BIOPSY_LM","Renal Biopsy LM","Renal biopsy LM","Histopathology","Tissue",150],
  ["RENAL_BIOPSY_IF","Renal Biopsy LM + IF","Renal biopsy IF","Histopathology","Tissue",650],
  ["FLOW_ACUTE_LEUK","Flow Cytometry Acute Leukemia","Flow cytometry","Hematopathology","Blood/bone marrow",4850],
  ["FLOW_MARKER","Flow Cytometry Other Marker","Flow marker","Hematopathology","Blood/bone marrow",400],
  ["AFB_STAIN","AFB Stain","AFB","Microbiology","Clinical specimen",20],
  ["GRAM","Gram Staining","Gram stain","Microbiology","Clinical specimen",20],
  ["FUNGUS_CULT","Fungus Culture","Fungal culture","Microbiology","Clinical specimen",120],
  ["KOH","KOH Mount and Smear","KOH","Microbiology","Clinical specimen",20],
  ["BLOOD_CS","Aerobic Blood Culture & Sensitivity","Blood C/S","Microbiology","Blood",95],
  ["PUS_CS","Pus Culture & Sensitivity","Pus C/S","Microbiology","Pus",70],
  ["SPUTUM_CS","Sputum Culture & Sensitivity","Sputum C/S","Microbiology","Sputum",70],
  ["URINE_CS","Urine Culture & Sensitivity","Urine C/S","Microbiology","Urine",70],
  ["STOOL_CS","Stool Culture & Sensitivity","Stool C/S","Microbiology","Stool",70],
  ["CSF_CS","CSF Culture & Sensitivity","CSF C/S","Microbiology","CSF",70],
  ["TB_CULTURE","Mycobacterial Culture & Identification","TB culture","Microbiology","Clinical specimen",100],
  ["TB_CULTURE_URINE","Mycobacterial Culture & Identification - Urine","TB urine culture","Microbiology","Urine",160],
  ["MTBDR_PLUS","MTBDRplus MDR-TB Detection","MTBDRplus","Molecular Diagnostics","Respiratory specimen",1500],
  ["MTBDRSL","MTBDRsl XDR-TB Detection","MTBDRsl","Molecular Diagnostics","Respiratory specimen",2000],
  ["XPERT_MTB","Xpert MTB","Xpert MTB","Molecular Diagnostics","Respiratory specimen",1800],
  ["XPERT_FLU","Xpert Flu","Xpert Flu","Molecular Diagnostics","Respiratory specimen",4000],
  ["XPERT_HIV_VL","Xpert HIV Viral Load","HIV VL","Molecular Diagnostics","Plasma",3500],
  ["XPERT_HCV","Xpert HCV","Xpert HCV","Molecular Diagnostics","Plasma",3500],
  ["XPERT_HPV","Xpert HPV","Xpert HPV","Molecular Diagnostics","Cervical specimen",3500],
  ["HBV_DNA","HBV DNA Quantitative","HBV DNA","Molecular Diagnostics","Plasma",2500],
  ["HCV_RNA","HCV RNA Quantitative","HCV RNA","Molecular Diagnostics","Plasma",2500],
  ["HIV_RNA","HIV RNA Quantitative","HIV RNA","Molecular Diagnostics","Plasma",2200],
  ["CMV_DNA","CMV DNA Qualitative","CMV DNA","Molecular Diagnostics","Plasma",800],
  ["HSV_DNA","HSV 1/2 DNA Qualitative","HSV DNA","Molecular Diagnostics","Clinical specimen",1500],
  ["TB_DNA","TB DNA Qualitative","TB DNA","Molecular Diagnostics","Clinical specimen",1000],
  ["ECG","Electrocardiogram","ECG","Cardiology","Functional test",30],
  ["ECHO","2D Echocardiography","2D Echo","Cardiology","Imaging",575],
  ["TMT","Computerized Treadmill Test","TMT","Cardiology","Functional test",400],
  ["HOLTER","Holter Monitoring","Holter","Cardiology","Functional test",575],
  ["TEE","Transesophageal Echocardiography","TEE","Cardiology","Imaging",575],
  ["EEG","Electroencephalography","EEG","Neurophysiology","Functional test",250],
  ["VIDEO_EEG","Video EEG","Video EEG","Neurophysiology","Functional test",600],
  ["AMB_EEG","Ambulatory EEG","Ambulatory EEG","Neurophysiology","Functional test",1000],
  ["EMG","Needle Electromyography","EMG","Electrodiagnosis","Functional test",600],
  ["NCV","Nerve Conduction Study","NCV","Electrodiagnosis","Functional test",400],
  ["EMG_NCV","EMG + NCV","EMG/NCV","Electrodiagnosis","Functional test",1000],
  ["RNS","Repetitive Nerve Stimulation","RNS","Electrodiagnosis","Functional test",230],
  ["VEP","Visual Evoked Potential","VEP","Neurophysiology","Functional test",300],
  ["BAER","Brainstem Auditory Evoked Response","BAER","Neurophysiology","Functional test",300],
  ["PSG","Polysomnography","PSG","Sleep Medicine","Functional test",1000],
  ["AUDIOMETRY","Pure Tone Audiometry","Audiometry","ENT","Functional test",100],
  ["BERA","BERA","BERA","ENT","Functional test",300],
  ["TYMP","Tympanometry","Tympanometry","ENT","Functional test",120],
  ["PFT","Pulmonary Function Test","PFT","Pulmonary","Functional test",100],
  ["PFT_PREPOST","PFT Pre + Post Bronchodilator","PFT pre/post","Pulmonary","Functional test",300],
  ["SPIRO","Spirometry","Spirometry","Pulmonary","Functional test",200],
  ["FEV1_DIFF","Diffusion Test Single Breath","DLCO","Pulmonary","Functional test",500],
  ["FENO","Exhaled Nitric Oxide","FeNO","Pulmonary","Functional test",500],
  ["SKIN_PRICK","Skin Prick Allergy Test","Skin prick","Allergy","Functional test",500],
  ["BRONCHOSCOPY","Bronchoscopy","Bronchoscopy","Pulmonary","Endoscopy",700],
];

const categoryDefaultSms: Record<string, number> = {
  "Hematology": 50, "Coagulation": 100, "Biochemistry": 100, "Immunology": 300,
  "Endocrinology": 250, "Vitamins & Nutrition": 500, "Tumor Markers": 500,
  "Serology": 250, "Autoimmunity": 500, "Clinical Pathology": 100,
  "Cytology": 150, "Histopathology": 300, "Hematopathology": 1000,
  "Microbiology": 100, "Molecular Diagnostics": 2500, "Cardiology": 500,
  "Neurophysiology": 500, "Electrodiagnosis": 600, "ENT": 250,
  "Pulmonary": 300, "Allergy": 500,
};

const categoryCorporateMultiplier: Record<string, number> = {
  "Hematology": 3.0, "Coagulation": 2.5, "Biochemistry": 2.5, "Immunology": 2.0,
  "Endocrinology": 2.2, "Vitamins & Nutrition": 2.0, "Tumor Markers": 2.0,
  "Serology": 2.0, "Autoimmunity": 2.0, "Clinical Pathology": 2.5,
  "Cytology": 2.5, "Histopathology": 2.5, "Hematopathology": 2.0,
  "Microbiology": 2.5, "Molecular Diagnostics": 1.8, "Cardiology": 2.0,
  "Neurophysiology": 2.0, "Electrodiagnosis": 2.5, "ENT": 2.0,
  "Pulmonary": 2.0, "Allergy": 2.0, "Radiology": 1.8, "Ultrasound": 1.8,
  "CT": 1.8, "MRI": 1.5, "Mammography": 1.8,
};

function round50(n: number) { return Math.round(n / 50) * 50; }
function makeSeed(code: string, name: string, category: string, smsRate: number, specimen = "Imaging", shortName = name): Seed {
  const corporate = round50(smsRate * (categoryCorporateMultiplier[category] ?? 2));
  return { code, name, shortName, category, specimen, smsBenchmarkRate: smsRate,
    corporateBenchmarkRate: corporate, rate: round50(smsRate + (corporate - smsRate) * 0.65) };
}

const generated: Seed[] = [];

const xrayParts = ["Chest","Chest PA","Chest AP","Abdomen","Abdomen Erect","Abdomen Supine","Skull","Paranasal Sinuses","Orbit","Nasal Bones","Mandible","Temporomandibular Joint","Cervical Spine","Thoracic Spine","Lumbar Spine","Lumbosacral Spine","Sacrum Coccyx","Pelvis","Hip","Knee","Ankle","Foot","Tibia Fibula","Femur","Shoulder","Humerus","Elbow","Forearm","Wrist","Hand","Clavicle","Scapula","Calcaneum","Heel","Sternum","Ribs","Soft Tissue Neck","Dorsal Spine","Whole Spine"];
for (const [i, part] of xrayParts.entries()) generated.push(makeSeed(`XR_${i+1}`, `Digital X-Ray ${part}`, "Radiology", 100, "Imaging", `X-Ray ${part}`));

const usgParts = ["Whole Abdomen","Upper Abdomen","Lower Abdomen/Pelvis","KUB","Pelvis","Kidneys","Liver","Gallbladder","Pancreas","Spleen","Urinary Bladder","Prostate","Scrotum","Testis","Breast","Thyroid","Neck","Small Parts","Soft Tissue","Musculoskeletal","Shoulder","Knee","Ankle","Wrist","Elbow","Hip","Doppler Lower Limb Arterial","Doppler Lower Limb Venous","Doppler Upper Limb Arterial","Doppler Upper Limb Venous","Carotid Doppler","Renal Doppler","Portal Doppler","Obstetric","Obstetric NT","Obstetric Anomaly","Obstetric Biophysical Profile","Follicular Study","Transvaginal","Transrectal","3D/4D Obstetric","Mammary","Guided FNAC","Guided Biopsy"];
for (const [i, part] of usgParts.entries()) { const doppler = part.toLowerCase().includes("doppler"); const rate = doppler ? 600 : part.includes("Guided") ? 200 : 200; generated.push(makeSeed(`USG_${i+1}`, `Ultrasonography ${part}`, doppler ? "Ultrasound" : "Ultrasound", rate, "Imaging", `USG ${part}`)); }

const ctParts = ["Brain Plain","Brain Plain + Contrast","Brain Angiography","Orbit","PNS","Temporal Bone","Pituitary","Neck","Chest","High Resolution Chest","Upper Abdomen","Lower Abdomen","Whole Abdomen","Pelvis","KUB","Liver Triple Phase","Pancreas","Adrenal","Renal","CT Urography","Spine Cervical","Spine Thoracic","Spine Lumbar","Spine Lumbosacral","Spine Whole","Shoulder","Elbow","Wrist","Hip","Knee","Ankle","Foot","Musculoskeletal","CT Angiography Aorta","CT Pulmonary Angiography","CT Coronary Angiography","CT Enterography","CT Colonography","CT Guided Biopsy","CT Guided FNAC","Denta Scan","3D Reconstruction"];
for (const [i, part] of ctParts.entries()) { const rate = part.includes("Guided") ? 1200 : part === "Brain Plain" ? 1100 : 800; generated.push(makeSeed(`CT_${i+1}`, `CT ${part}`, "CT", rate, "Imaging", `CT ${part}`)); }

const mriParts = ["Brain Plain","Brain + Contrast","Brain with Angiography","Brain with Venography","Orbit","Pituitary","IAC","PNS","Neck","Chest","Upper Abdomen","Whole Abdomen","Pelvis","KUB","Liver","MRCP","MR Urography","Spine Cervical","Spine Thoracic","Spine Lumbar","Spine Lumbosacral","Whole Spine","Shoulder","Elbow","Wrist","Hand","Hip","Knee","Ankle","Foot","Pelvis MSK","MR Arthrogram Shoulder","MR Arthrogram Knee","MR Neurography","MR Enterography","MR Angiography Brain","MR Angiography Neck","MR Venography Brain","MR Venography Limb"];
for (const [i, part] of mriParts.entries()) generated.push(makeSeed(`MRI_${i+1}`, `MRI ${part}`, "MRI", 5000, "Imaging", `MRI ${part}`));

const labGroups: Record<string, string[]> = {
  "Biochemistry": ["Serum Magnesium","Serum Zinc","Serum Copper","Serum Selenium","Serum Albumin","Serum Globulin","Total Protein","Direct Bilirubin","Indirect Bilirubin","Gamma GT","LDH Isoenzymes","CK Total","CK-MB Mass","Lipase","Amylase","Cholinesterase","Pseudocholinesterase","Lactate","Pyruvate","Homocysteine","Lipoprotein(a)","Apolipoprotein A1","Apolipoprotein B","Non-HDL Cholesterol","Calculated LDL","Creatinine Clearance","Urine Protein/Creatinine Ratio","Urine Albumin/Creatinine Ratio","24 Hour Urine Protein","24 Hour Urine Creatinine","Urine Calcium 24 Hour","Urine Sodium 24 Hour","Urine Potassium 24 Hour","Urine Urea 24 Hour","Serum Osmolality","Urine Osmolality","Serum Lactate","Serum Ammonia","Blood Ketones","Beta Hydroxybutyrate","Plasma Renin Activity","Aldosterone","Metanephrines Plasma","Metanephrines Urine"],
  "Endocrinology": ["Total T3","Total T4","Thyroglobulin","Thyroglobulin Antibody","TSH Receptor Antibody","Anti-Mullerian Hormone","ACTH","DHEA-S","17-OH Progesterone","Estradiol","Progesterone","SHBG","Free Testosterone","C-Peptide","IGF-1","IGFBP-3","Growth Hormone Stimulation Test","Insulin Level","Fasting Insulin","Calcitonin","Aldosterone Renin Ratio","Free Cortisol","Urinary Free Cortisol"],
  "Hematology": ["Complete Hemogram","Mean Corpuscular Volume","Mean Corpuscular Hemoglobin","Mean Corpuscular Hemoglobin Concentration","Red Cell Distribution Width","Immature Platelet Fraction","Reticulocyte Production Index","G6PD Screen","Sickle Cell Screen","Hb Electrophoresis","HPLC Hemoglobin Variant Analysis","Osmotic Fragility","Fetal Hemoglobin","Direct Coombs Test","Indirect Coombs Test","LE Cell","Bone Marrow Smear Review","Iron Stain Bone Marrow"],
  "Serology": ["Anti-HBc IgM","Anti-HBc Total","Anti-HAV Total","Anti-HEV IgG","Anti-HDV IgM","Anti-HDV Total","Chikungunya IgM","Chikungunya IgG","Scrub Typhus IgM","Scrub Typhus IgG","Brucella Agglutination","H. pylori IgM","H. pylori IgG","EBV IgM","EBV IgG","CMV IgM","CMV IgG","Rubella IgM","Rubella IgG","Toxoplasma IgM","Toxoplasma IgG","HSV IgM","HSV IgG","Chlamydia IgM","Chlamydia IgG","Chlamydia IgA","VZV IgM","VZV IgG"],
  "Immunology": ["Total IgA","Total IgG","Total IgM","IgG Subclass 1","IgG Subclass 2","IgG Subclass 3","IgG Subclass 4","Complement CH50","Anti-CCP","ENA Profile","ANCA Profile","MPO Antibody","PR3 Antibody","Anti-Ro/SSA","Anti-La/SSB","Anti-Scl-70","Anti-Centromere","Anti-RNP","Anti-Sm","Anticardiolipin IgG","Anticardiolipin IgM","Beta-2 Glycoprotein IgG","Beta-2 Glycoprotein IgM"],
  "Microbiology": ["Sputum AFB Smear","Sputum TB Culture","Stool Ova & Parasite Examination","Stool Occult Blood","Stool Reducing Substances","KOH Fungal Mount","Fungal Culture","Anaerobic Culture","Vitek-2 Bacterial Identification","Vitek-2 Yeast Identification","MRSA Screening","C. difficile Toxin","C. difficile PCR","Malaria Parasite Smear","Malaria Antigen","Microfilaria Examination","Giardia Detection","Trichomonas Detection","Leishmania Detection","Cryptococcal Antigen"],
  "Tumor Markers": ["CA 15-3","CA 19-9","CA 72-4","CA 27-29","SCC Antigen","CYFRA 21-1","NSE","ProGRP","Chromogranin A","Beta-2 Microglobulin","PSA Free","Free PSA / Total PSA Ratio","HE4","ROMA Index"]
};
let g = 1;
for (const [category, names] of Object.entries(labGroups)) for (const name of names) { const base = categoryDefaultSms[category] ?? 300; generated.push(makeSeed(`LABX_${g++}`, name, category, base, "Specimen", name)); }

const all = [...direct.map(x => { const sms = x[5]; const corporate = round50(sms * (categoryCorporateMultiplier[x[3]] ?? 2)); return { code:x[0], name:x[1], shortName:x[2], category:x[3], specimen:x[4], smsBenchmarkRate:sms, corporateBenchmarkRate:corporate, rate:round50(sms + (corporate-sms)*0.65) }; }), ...generated];

async function main() {
  const unique = new Map(all.map(item => [item.code, item]));
  for (const item of unique.values()) await prisma.investigationMaster.upsert({
    where: { code: item.code },
    update: { name:item.name, shortName:item.shortName, category:item.category, specimen:item.specimen, rate:item.rate, smsBenchmarkRate:item.smsBenchmarkRate, corporateBenchmarkRate:item.corporateBenchmarkRate, pricingLastVerifiedAt:new Date(), active:true },
    create: { code:item.code, name:item.name, shortName:item.shortName, category:item.category, specimen:item.specimen, rate:item.rate, smsBenchmarkRate:item.smsBenchmarkRate, corporateBenchmarkRate:item.corporateBenchmarkRate, pricingLastVerifiedAt:new Date(), active:true }
  });
  console.log(`Expanded Investigation Master with ${unique.size} additional/updated entries.`);
}
main().catch(error => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
