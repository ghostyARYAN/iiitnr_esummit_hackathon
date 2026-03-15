-- Insert default templates for sectors

-- Sand Template
INSERT INTO public.meeting_templates (name, content, sector_id, created_by)
SELECT 
  'Sand Mining Gist Template',
  'Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Salient Features of the Project:
   - Lease Area: [ ]
   - Production Capacity: [ ]
   - Method of Mining: Open Cast / Semi-Mechanized
   - Water Requirement: [ ] KLD
   - Employment Generation: [ ]

2. Environmental Management Plan:
   - Air Quality Management: Regular water sprinkling on haul roads.
   - Water Management: No intersection with ground water table.
   - Noise Management: Use of ear plugs/muffs, regular maintenance of vehicles.
   - Green Belt Development: Plantation along the lease boundary.

3. Compliance Status:
   - Valid Mining Lease: [ ]
   - District Survey Report (DSR): [ ]
   - Cluster Situation: [ ]',
  id,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
FROM public.sectors WHERE name = 'Sand'
ON CONFLICT DO NOTHING;

-- Limestone Template
INSERT INTO public.meeting_templates (name, content, sector_id, created_by)
SELECT 
  'Limestone Mining Gist Template',
  'Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Salient Features of the Project:
   - Lease Area: [ ]
   - Mineral: Limestone / Dolomite / Other
   - Production Capacity: [ ] TPA
   - Life of Mine: [ ] Years

2. Environmental Impact Assessment:
   - Baseline Data Collection Period: [ ]
   - Air Quality Index: [ ]
   - Ground Water Level: [ ]

3. EMP Measures:
   - Dust Suppression: [ ]
   - Plantation: [ ] saplings/year
   - CSR Activities: [ ]',
  id,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
FROM public.sectors WHERE name = 'Limestone'
ON CONFLICT DO NOTHING;

-- Bricks Template
INSERT INTO public.meeting_templates (name, content, sector_id, created_by)
SELECT 
  'Brick Kiln Gist Template',
  'Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Project Details:
   - Type of Kiln: Zig-Zag / Fixed Chimney
   - Capacity: [ ] Bricks per day
   - Fuel Type: Coal / Biomass / PNG

2. Pollution Control Measures:
   - Stack Height: [ ] meters
   - Ash Management: [ ]
   - Green Belt: [ ] % of total area

3. Regulatory Compliance:
   - Consent to Operate (CTO): [ ]
   - Distance from Habitation: [ ] meters',
  id,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
FROM public.sectors WHERE name = 'Bricks'
ON CONFLICT DO NOTHING;

-- Infrastructure Template
INSERT INTO public.meeting_templates (name, content, sector_id, created_by)
SELECT 
  'Infrastructure Project Gist Template',
  'Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Project Overview:
   - Total Plot Area: [ ] sq.m.
   - Built-up Area: [ ] sq.m.
   - Number of Floors: [ ]
   - Expected Occupancy: [ ]

2. Resource Requirements:
   - Water Demand: [ ] KLD (Fresh + Recycled)
   - Power Demand: [ ] KW
   - Solid Waste Generation: [ ] kg/day

3. Environmental Management:
   - STP Capacity: [ ] KLD
   - Rainwater Harvesting Pits: [ ]
   - Solar Power Generation: [ ] KW
   - Landscape Area: [ ] sq.m.',
  id,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
FROM public.sectors WHERE name = 'Infrastructure'
ON CONFLICT DO NOTHING;

-- Industry Template
INSERT INTO public.meeting_templates (name, content, sector_id, created_by)
SELECT 
  'Industrial Project Gist Template',
  'Project: {{project_name}}
Sector: {{sector}}
Location: {{location}}
Category: {{category}}

1. Industry Details:
   - Product: [ ]
   - Capacity: [ ]
   - Raw Materials: [ ]

2. Environmental Aspects:
   - Effluent Generation: [ ] KLD
   - ETP Capacity: [ ] KLD
   - Hazardous Waste Management: [ ]
   - Air Emission Control: [ ]

3. Safety & Risk Management:
   - Fire Safety System: [ ]
   - On-site Emergency Plan: [ ]',
  id,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
FROM public.sectors WHERE name = 'Industry'
ON CONFLICT DO NOTHING;
