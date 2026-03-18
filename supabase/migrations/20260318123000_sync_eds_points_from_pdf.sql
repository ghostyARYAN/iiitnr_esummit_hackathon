DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'eds_deficiency_points_point_text_key'
  ) THEN
    ALTER TABLE public.eds_deficiency_points
      ADD CONSTRAINT eds_deficiency_points_point_text_key UNIQUE (point_text);
  END IF;
END $$;

INSERT INTO public.eds_deficiency_points (point_text) VALUES
('PP shall submit processing fee details.'),
('PP shall submit Pre-feasibility report.'),
('PP shall submit Certified compliance Report of Air and Water Consent issued by CECB'),
('PP shall submit LOI.'),
('PP shall submit LOI Extension copy.'),
('PP shall submit Mining plan approval letter.'),
('PP shall submit approved Mining plan.'),
('PP shall submit the details of forest land (if any) & shall submit Stage 1 & Stage 2 clearance .'),
('PP shall submit Land Documents.'),
('PP shall submit Land Documents & Consent of Land Owners (If applicable).'),
('PP shall submit 200 m, 500 m Certificate.'),
('PP shall submit Gram Panchayat NoC.'),
('PP shall submit DSR (Latest) with Sand Replenishment Study.'),
('PP shall submit Sand Replenishment Study.'),
('PP shall submit Marked & Delimited Copy.'),
('PP shall submit revised Forest NOC from DFO, mentioning all khasra no. of applied area & the distance of the leasearea from the nearest forest boundary, National Park and Wild Life Sanctuary and Biodiversity Area.'),
('PP shall submit C.E.M.P details for cluster.'),
('PP shall submit updated EIA Report along with updated ToR compliance in Page no. 12, Point 18.'),
('PP shall submit Wild life Conservation plan (Schedule 1 Species as per Nt. Dated 01/4/2023).'),
('PP shall submit Water NOC for Ground water abstraction.'),
('PP shall submit Consent of Land Owners.'),
('PP shall submit notarized affidavit that no schedule 1 species found.'),
('PP shall submit Schedule 1 Species as per Nt. Dated 01/4/2023.'),
('PP shall submit latest past production certificate certified from Mining Department.'),
('PP shall submit CEMP details (If applicable).'),
('PP shall submit Plantation details as per previously issued EC.'),
('PP shall submit Geotagged photographs of applied lease area.'),
('PP shall submit Gram Panchayat NoC mentioning Khasra No.'),
('PP shall submit Self compliance Report of previously issued EC.'),
('PP shall submit Restoration Plan (if excavated).'),
('PP shall submit the updated list of Scheduled species as per Nt. Dated 01/4/2023 & Wild life Conservation plan(Schedule 1 Species as per Nt. Dated 01/4/2023) - If applicable.'),
('PP shall submit Panchnama.'),
('PP shall submit Previously issued EC (Environmental Clearance)'),
('PP shall submit PFR.'),
('PP shall submit Approved Layout from town and country planning copy'),
('PP shall submit Land Use / Zoning Map'),
('PP shall submit Built-up Area Statement'),
('PP shall submit Building permission copy'),
('PP shall submit STP Design & Reuse Plan / Disinfection Proposal'),
('PP shall submit Solid Waste Management Plan'),
('PP shall submit Green Belt Area statement'),
('PP shall submit EMP Cost Estimates'),
('PP shall submit NBWL Clearance (if <1km)'),
('PP shall submit Fire NOC'),
('PP shall submit Aviation NOC (If applicable)'),
('PP shall submit Wildlife Management Plan'),
('PP shall submit lease deed'),
('PP shall submit 500 m Certificate.'),
('PP shall submit 200 m Certificate (if applicable).'),
('PP shall submit DSR (Latest).'),
('PP shall submit KML file of applied area with properly demarcated boundary.'),
('PP shall submit drone video of the applied mining lease area.'),
('PP shall submit CER Details with consent from local authority.'),
('PP shall submit all notarized affidavits points related to project.'),
('PP shall submit the details of project (mandatory) mentioned in the below link.'),
('PP shall submit land documents with khasra No. of applied land and consent of land owners (if applicable)'),
('PP shall submit correct and legible copy of land documents containing khasra No. of applied land and consent of land owners (If applicable)'),
('Bring a hardcopy of District Survey Report (DSR - Latest) with Sand Replenishment Study at the time ofPresentation.'),
('Bring a hardcopy of District Survey Report (DSR - Latest) at the time of Presentation.')
ON CONFLICT (point_text) DO NOTHING;
