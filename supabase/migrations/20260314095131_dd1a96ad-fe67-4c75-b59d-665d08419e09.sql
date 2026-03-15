
-- Insert new sectors (don't delete existing ones due to FK constraints)
-- Use ON CONFLICT to handle duplicates by name

-- First add unique constraint on name if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sectors_name_key') THEN
    ALTER TABLE public.sectors ADD CONSTRAINT sectors_name_key UNIQUE (name);
  END IF;
END $$;

INSERT INTO public.sectors (name, description, required_documents, parameters) VALUES
('Sand', 'Sand mining and extraction projects', 
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR) / Sand Replenishment Study","Land Documents (B-1 P-2)","LOI","NOC from Gram Panchayat / Local Body","200 Meter Certificate","500 Meter Certificate","Marked & Delimited Copy","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","KML File","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","GIST Submission"]'::jsonb,
  '{"fee_amount": 5000, "category": "Mining"}'::jsonb
),
('Limestone', 'Limestone mining and quarrying projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR) / Sand Replenishment Study","Land Documents (B-1 P-2)","Consent of Landowner(s)","LOI","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","200 Meter Certificate","500 Meter Certificate","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Water NOC (CGWA)","CTE / CTO from CECB","Geo-tagged Photographs","7.5m Boundary Strip excavation status / Restoration Plan","Drone Video","KML File","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 10000, "category": "Mining"}'::jsonb
),
('Bricks', 'Brick kiln and earth clay projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","District Survey Report (DSR)","Land Documents (B-1 P-2)","Consent of Landowner(s)","LOI","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","Panchnama","200 Meter Certificate","500 Meter Certificate","Mining Plan Approval Letter","Approved Mining Plan","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Water NOC (CGWA)","CTE / CTO from CECB","Geo-tagged Photographs","1.0m Boundary Strip excavation status / Restoration Plan","Drone Video","KML File","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 5000, "category": "Mining"}'::jsonb
),
('Infrastructure', 'Construction, real estate, and infrastructure projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","Land Documents (B-1 P-2)","Previously issued EC","Actions taken to comply with EC","Partnership Deed / Consent of Owner(s)","Conceptual Plan","Approved Layout from Town & Country Planning","Land Use / Zoning Map","Built-up Area Statement","Building Permission","Water Permission (NRANVP/CGWA)","STP Design & Reuse Plan / Disinfection Proposal","Solid Waste Management Plan","Solar Energy Plan","Green Belt Area Statement","EMP Cost Estimates","NBWL Clearance (if <1km)","Fire NOC","Aviation NOC (If applicable)","Wildlife Management Plan (If applicable)","CTE / CTO from CECB","Geo-tagged Photographs","KML File","CER Details with consent of Gram Sabha / Concerned Dept.","All Affidavits","EIA Report and Public Hearing (If Applicable)","GIST Submission"]'::jsonb,
  '{"fee_amount": 15000, "category": "Construction"}'::jsonb
),
('Industry', 'Industrial and manufacturing projects',
  '["Processing Fees Details","Pre-feasibility Report","EMP","Form 1 / 1-M / CAF","Land Documents (B-1 P-2)","Consent of Landowner(s)","Lease Deed","Previously issued EC","Actions taken to comply with EC","Past Production Data (certified by Mining Dept.)","NOC from Gram Panchayat / Local Body","Forest NOC (Reserved/Protected Forest, National Park, Wildlife Sanctuary, Biodiversity Zone)","Complete Tree Plantation as per previously issued EC","Land Use Breakup Details","ETP","Fire NOC","Water Permission (NRANVP/CGWA)","Water NOC (CGWA)","STP Design & Reuse Plan / Disinfection Proposal","EMP Cost Estimates","CTE / CTO from CECB","ToR Granted","EIA Report and Public Hearing (If Applicable)","Wildlife Management Plan (If applicable)","Affidavit on Pending Litigation","All Compliance Affidavits","Drone Video","CCR (Certified Compliance Report)","C.E.M.P.","CER Details with consent of Gram Sabha / Concerned Dept.","GIST Submission"]'::jsonb,
  '{"fee_amount": 10000, "category": "Industrial"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  required_documents = EXCLUDED.required_documents,
  parameters = EXCLUDED.parameters,
  updated_at = now();

-- Create affidavit_points table
CREATE TABLE IF NOT EXISTS public.affidavit_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  point_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affidavit_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read affidavit points"
  ON public.affidavit_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage affidavit points"
  ON public.affidavit_points FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Affidavit points for Stones
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Stones', 'That top soil will be preserved & stored.'),
('Stones', 'That control blasting will be done by a DGMS authorized license holder.'),
('Stones', 'That completion certificate of 7.5 meter wide safety zone plantation and proposed work under CER activities will be submitted along with Geotag photographs in six monthly compliance reports.'),
('Stones', 'That survival rate of Plantation will be 90%.'),
('Stones', 'That demarcation will be done by boundary pillars as Mineral Concession Rules.'),
('Stones', 'That water sprinkling arrangements will be done for fugitive dust emission.'),
('Stones', 'That any type of polluted water will not be released into any natural water source.'),
('Stones', 'That employment will be given to the local people as per the rules of the State Government.'),
('Stones', 'That no court case is pending relating to this project before any Court of Law in India.'),
('Stones', 'That no violation of Notification S.O. 804(E) dated 14/03/2017 issued by MoEFCC, GoI.'),
('Stones', 'That the conditions given in the environmental clearance will be followed.'),
('Stones', 'That no excavation will be done in 7.5 meter safety zone in future.'),
('Stones', 'That mining operation does not cause any disturbance to flora & fauna.'),
('Stones', 'That proposed CER work will be done as per the proposal presented before the honourable committee.'),
('Stones', 'That proposed plantation will be done within a 7.5 meter lease boundary.');

-- Affidavit points for Bricks
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Bricks', 'That survival rate of Plantation will be 90%.'),
('Bricks', 'That water sprinkling arrangements will be done for fugitive dust emission.'),
('Bricks', 'That Contaminated water will not be discharged into natural water sources.'),
('Bricks', 'That demarcation will be done by boundary pillars as Mineral Concession Rules.'),
('Bricks', 'That employment will be given to the local people as per the rules of the State Government.'),
('Bricks', 'That no other lease/brick kiln is operated within a radius of 1 kilometer of this applied area.'),
('Bricks', 'That presently bricks are manufactured using clay and fly ash at 50%-50% mixture.'),
('Bricks', 'That the height of the fixed chimney is set at least 35m.'),
('Bricks', 'For firing bricks, zig-zag technology or vertical shaft technology will be used within 2 years.'),
('Bricks', 'That vehicles are kept covered during transportation of raw material/bricks.'),
('Bricks', 'That approved fuel will be used. No hazardous waste like tyres/plastics will be used.'),
('Bricks', 'That no court case is pending relating to this project before any Court of Law in India.'),
('Bricks', 'Convert the lease area into Zig Zag method as per notification dated 22/02/2022 issued by MoEFCC.'),
('Bricks', 'The conditions given in the environmental clearance will be followed and six monthly compliance reports will be submitted.');

-- Affidavit points for Sand
INSERT INTO public.affidavit_points (category, point_text) VALUES
('Sand', 'Water sprinkling arrangements for fugitive dust emission.'),
('Sand', '90% survival rate of Plantation.'),
('Sand', 'Employment given to the local people as per the rules of the State Government.'),
('Sand', 'Any type of polluted water will not be released into any natural water source.'),
('Sand', 'No court case pending relating to this project before any Court of Law in India.'),
('Sand', 'Mining shall be done in 60 percent of the total lease area.'),
('Sand', 'The direction given by Sustainable Mining Guideline 2016 & Enforcement and Monitoring guideline for Sand 2020 will be followed.'),
('Sand', 'Trees will be planted on both sides of the approached roads.'),
('Sand', 'Minerals will be transported by covering with tarpaulin sheet.'),
('Sand', 'Vehicles will not be transported through populated areas.'),
('Sand', 'Sand excavation work will not be done during the rainy season.'),
('Sand', 'Sand excavation and filling will be done manually; heavy vehicles will not enter the river.'),
('Sand', 'Demarcation will be done by boundary pillars as per Mineral Concession Rules.'),
('Sand', 'No Excavation work in the area prohibited for excavation.'),
('Sand', 'Mining will not be done outside the lease area.');

-- General affidavit points
INSERT INTO public.affidavit_points (category, point_text) VALUES
('General', 'The direction given in EC by the Supreme Court, High Court, NGT and any other court will be followed.'),
('General', 'Inform MoEFCC/SEIAA for any change in ownership of the mining lease.'),
('General', 'No excavation will be done outside the applied lease area.'),
('General', 'No Schedule 1 species have been found in the vicinity of the mine.'),
('General', 'Topsoil extracted will be stored within the lease area within the safety zone.'),
('General', 'Topsoil will not be misused, sold, or used for any other purpose.');

-- Create eds_deficiency_points table
CREATE TABLE IF NOT EXISTS public.eds_deficiency_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eds_deficiency_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read EDS points"
  ON public.eds_deficiency_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage EDS points"
  ON public.eds_deficiency_points FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed EDS deficiency points
INSERT INTO public.eds_deficiency_points (point_text) VALUES
('PP shall submit processing fee details.'),
('PP shall submit Pre-feasibility report.'),
('PP shall submit Certified compliance Report of Air and Water Consent issued by CECB.'),
('PP shall submit LOI.'),
('PP shall submit LOI Extension copy.'),
('PP shall submit Mining plan approval letter.'),
('PP shall submit approved Mining plan.'),
('PP shall submit the details of forest land & Stage 1 & Stage 2 clearance.'),
('PP shall submit Land Documents.'),
('PP shall submit Land Documents & Consent of Land Owners (If applicable).'),
('PP shall submit 200 m, 500 m Certificate.'),
('PP shall submit Gram Panchayat NoC.'),
('PP shall submit DSR (Latest) with Sand Replenishment Study.'),
('PP shall submit Marked & Delimited Copy.'),
('PP shall submit revised Forest NOC from DFO.'),
('PP shall submit C.E.M.P details for cluster.'),
('PP shall submit updated EIA Report along with updated ToR compliance.'),
('PP shall submit Wildlife Conservation plan (Schedule 1 Species).'),
('PP shall submit Water NOC for Ground water abstraction.'),
('PP shall submit Consent of Land Owners.'),
('PP shall submit notarized affidavit that no schedule 1 species found.'),
('PP shall submit latest past production certificate certified from Mining Department.'),
('PP shall submit Plantation details as per previously issued EC.'),
('PP shall submit Geotagged photographs of applied lease area.'),
('PP shall submit Self compliance Report of previously issued EC.'),
('PP shall submit Restoration Plan (if excavated).'),
('PP shall submit Panchnama.'),
('PP shall submit Previously issued EC.'),
('PP shall submit PFR.'),
('PP shall submit Approved Layout from town and country planning.'),
('PP shall submit Land Use / Zoning Map.'),
('PP shall submit Built-up Area Statement.'),
('PP shall submit Building permission copy.'),
('PP shall submit STP Design & Reuse Plan / Disinfection Proposal.'),
('PP shall submit Solid Waste Management Plan.'),
('PP shall submit Solar Energy Plan.'),
('PP shall submit Green Belt Area statement.'),
('PP shall submit EMP Cost Estimates.'),
('PP shall submit NBWL Clearance (if <1km).'),
('PP shall submit Fire NOC.'),
('PP shall submit Aviation NOC (If applicable).'),
('PP shall submit Wildlife Management Plan.'),
('PP shall submit lease deed.'),
('PP shall submit KML file of applied area with properly demarcated boundary.'),
('PP shall submit drone video of the applied mining lease area.'),
('PP shall submit CER Details with consent from local authority.'),
('PP shall submit all notarized affidavits points related to project.');
