"""
ISense BIS Standards Dataset — Curated Official Knowledge Base
Bureau of Indian Standards (BIS) Domain: Personal Protective Equipment & Headgear
Smart India Hackathon (SIH) Knowledge Engine
"""

STANDARDS_DATA = [
    {
        "is_number": "IS 4151",
        "title": "Protective Helmets for Motorcyclists — Specification",
        "year": 2015,
        "product_type": "Motorcycle Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for protective helmets intended for use by "
            "riders and pillion riders of motorcycles, scooters and mopeds. It covers helmets "
            "of the open-face and full-face type. The standard sets out requirements for "
            "construction, field of vision, shock absorption, penetration resistance, "
            "retention system, and surface friction."
        ),
        "clauses": [
            {"clause": "Cl 4.1", "title": "Shell Construction", "requirement": "Must withstand severe impact loads without brittle fracture; uniform wall thickness."},
            {"clause": "Cl 4.2", "title": "Protective Padding", "requirement": "Expanded polystyrene (EPS) or energy absorbing liner of minimum 20mm density."},
            {"clause": "Cl 5.1", "title": "Retention System", "requirement": "Chin strap with minimum width 20mm and quick-release buckle withstanding 25 kg dynamic load."},
            {"clause": "Cl 6.2", "title": "Weight Limitations", "requirement": "Maximum weight capped at 1.5 kg for open-face and 1.8 kg for full-face helmets."},
            {"clause": "Cl 7.1", "title": "Shock Absorption Test", "requirement": "Peak headform deceleration shall not exceed 300g under drop height of 1.5m."},
            {"clause": "Cl 8.0", "title": "Penetration Resistance", "requirement": "3 kg conical steel striker dropped from 1m shall not make electrical contact with headform."},
            {"clause": "Cl 9.2", "title": "Peripheral Vision", "requirement": "Horizontal field of vision ≥ 105° on each side; upward ≥ 7°, downward ≥ 45°."},
            {"clause": "Cl 10.1", "title": "Mandatory Marking & ISI", "requirement": "Helmets shall compulsorily bear the ISI Certification Mark with license CM/L number."}
        ],
        "requirements": {
            "construction": "Helmet shell must withstand prescribed impact loads without fracture",
            "field_of_vision": "Minimum 105 degrees horizontal, 30 degrees vertical",
            "shock_absorption": "Peak acceleration shall not exceed 300g during impact tests",
            "penetration_resistance": "Test striker shall not contact headform",
            "retention_system": "Chin strap with quick-release buckle; withstand 25 kg load",
            "surface_friction": "Helmets shall not rotate more than 35 degrees under oblique impact",
            "weight": "Maximum 1.5 kg for open-face, 1.8 kg for full-face helmets",
            "marking": "Mandatory BIS ISI Mark, Manufacturer details, Year & Month, Model designation"
        },
        "testing_requirements": {
            "impact_absorption_test": "Drop test from 1.5m on flat anvil and hemispherical anvil",
            "penetration_test": "Conical 3kg striker dropped from 1.0m height",
            "retention_test": "Dynamic load test on chin strap assembly with 25 kg weight",
            "chin_strap_test": "Elongation under 10 kg and 40 kg loads",
            "field_of_vision_test": "Measured using calibrated goniometer with standard headform",
            "conditioning": "Tests under ambient (+25°C), cold (-20°C), hot (+50°C), and water-submersion conditions",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark Scheme-I)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Helmets (Quality Control) Order, 2020 issued by MoRTH under BIS Act, 2016",
            "bureau": "Bureau of Indian Standards",
            "penalty_clause": "Section 29 of BIS Act 2016: Up to 2 years imprisonment or fine up to Rs 5 Lakh",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2018, "description": "Harmonisation of impact test velocity and calibration"},
            {"number": "AMD 2", "year": 2020, "description": "Mandatory inclusion of QR code and ISI mark traceability rules"},
        ],
        "keywords": [
            "motorcycle helmet", "protective helmet", "motorcyclist", "moped", "scooter",
            "crash helmet", "road safety", "head protection", "ISI mark", "two-wheeler", "traffic police",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 4151:2015 (incorporating Amendments 1 & 2)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 2925",
        "title": "Industrial Safety Helmets — Specification",
        "year": 2019,
        "product_type": "Industrial Safety Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for industrial safety helmets designed to "
            "protect the wearer's head against impact from falling objects, rain, electric shock, "
            "and other occupational hazards. Applicable in construction, mining, manufacturing, "
            "and other industrial environments."
        ),
        "clauses": [
            {"clause": "Cl 5.1", "title": "Shell & Harness", "requirement": "Rigid seamless shell with suspension harness providing minimum 30mm vertical clearance."},
            {"clause": "Cl 6.1", "title": "Force Transmission", "requirement": "Peak force transmitted to headform shall not exceed 5.0 kN under 5 kg impact."},
            {"clause": "Cl 6.2", "title": "Penetration Resistance", "requirement": "Conical 3kg striker dropped from 1m shall not touch headform."},
            {"clause": "Cl 6.4", "title": "Electrical Insulation (Type E)", "requirement": "Proof withstand 2200V AC at 50Hz for 1 minute; leakage current < 3mA."},
            {"clause": "Cl 6.5", "title": "Flammability", "requirement": "Must self-extinguish within 5 seconds of flame removal."}
        ],
        "requirements": {
            "shell": "Shall be rigid, seamless, and free from defects with minimum thickness 1.5mm",
            "impact_protection": "Peak transmission force ≤ 5000 N (5.0 kN)",
            "penetration_resistance": "3kg striker shall not touch headform",
            "flame_resistance": "Helmet shall not continue burning > 5 seconds after flame removal",
            "electrical_resistance": "Class E: withstand 2200V AC for 1 minute without breakdown",
            "chin_strap": "Adjustable chin strap with safety breakaway force to avoid strangulation",
            "marking": "IS 2925, manufacturer, year of manufacture, size, electrical classification",
        },
        "testing_requirements": {
            "impact_test": "Drop 5 kg steel striker from 1 m height onto helmet mounted on headform",
            "penetration_test": "Conical striker dropped from 1 m height onto crown area",
            "flammability_test": "Exposure to 790°C flame for 10 seconds",
            "electrical_test": "Immerse in sodium chloride solution, apply 2200 V AC",
            "cold_conditioning": "Pre-conditioned at -10°C for 4 hours prior to impact",
            "high_temp_conditioning": "Pre-conditioned at +50°C for 4 hours prior to impact",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Personal Protective Equipment (Quality Control) Order, 2021 by DPIIT",
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2021, "description": "Revised electrical breakdown and ventilation specifications"},
        ],
        "keywords": [
            "industrial safety helmet", "hard hat", "construction helmet", "mining helmet",
            "head protection", "PPE", "occupational safety", "electrical protection", "NHAI", "PWD",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 2925:2019 (Edition 4.1)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 2745",
        "title": "Non-metallic Helmets for Firefighters — Specification",
        "year": 1983,
        "product_type": "Firefighter Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for non-metallic protective helmets used by "
            "firefighters. The helmets are designed to protect against heat, impact from falling "
            "objects, and penetration during firefighting operations."
        ),
        "clauses": [
            {"clause": "Cl 4.1", "title": "Thermal Insulation", "requirement": "Outer shell shall not deform, drip, or ignite at 260°C radiant heat for 5 minutes."},
            {"clause": "Cl 5.2", "title": "Impact Energy Attenuation", "requirement": "High-temperature drop test with spherical anvil."},
            {"clause": "Cl 6.0", "title": "Neck Curtain & Visor", "requirement": "Flame-resistant aluminised or Kevlar neck shroud meeting flame exposure tests."}
        ],
        "requirements": {
            "construction": "Non-metallic high-strength composite shell with face visor",
            "heat_resistance": "Shell shall not deform, ignite, or drip at 260°C for 5 minutes",
            "impact_absorption": "Impact attenuation under high ambient temperature conditions",
            "penetration_resistance": "Resistance to sharp projectile hazards during structural entry",
            "chin_strap": "Heavy-duty flame-retardant chin strap with emergency quick-release",
        },
        "testing_requirements": {
            "heat_resistance_test": "Radiant heat exposure at 260°C for 5 minutes in thermal chamber",
            "impact_test": "Conditioned at high heat and tested with hemispherical striker",
            "penetration_test": "High kinetic energy pointed striker test",
            "stability_test": "Anti-roll off test under sudden operational movement",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Fire Fighting Equipment Quality Control Order, 2022",
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2012, "description": "Updated optical visor and radiant heat resistance requirements"}
        ],
        "keywords": [
            "firefighter helmet", "fire brigade", "heat resistant helmet", "structural fire",
            "emergency rescue", "fire service", "fire fighting equipment",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 2745:1983 (Reaffirmed 2018)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 14740",
        "title": "Tactical and Riot Control Protective Helmets for Police & Paramilitary",
        "year": 1999,
        "product_type": "Tactical Riot Helmet",
        "status": "ACTIVE",
        "scope": (
            "Specifies performance and ballistic/impact requirements for protective helmets used by "
            "law enforcement, police, and paramilitary personnel in riot control and tactical operations."
        ),
        "clauses": [
            {"clause": "Cl 3.1", "title": "Full Head & Neck Protection", "requirement": "Extended polycarbonate or composite shell covering occipital region."},
            {"clause": "Cl 4.2", "title": "Polycarbonate Visor", "requirement": "High impact optical visor withstanding 12-gauge pellet impact at 5m distance."},
            {"clause": "Cl 5.0", "title": "Chemical Splash Resistance", "requirement": "Resistant to petrol, tear gas solvent, and corrosive agents without cracking."}
        ],
        "requirements": {
            "shell": "High-impact composite or polycarbonate shell with extended nape protector",
            "visor": "Shatter-proof anti-fog optical visor with locking mechanism",
            "chemical_resistance": "Must withstand acid, alkali, petrol, and solvent splashes",
            "impact_protection": "Withstand high kinetic energy projectile impact without penetration",
        },
        "testing_requirements": {
            "blunt_impact_test": "Multiple drop tests on crown, front, and lateral planes",
            "visor_ballistic_test": "Steel ball impact at 120 m/s velocity",
            "chemical_test": "Immerse in hydrocarbons and tear-gas solvent for 24 hours",
        },
        "certification_scheme": {
            "scheme": "BIS Certification / Police Modernisation Guidelines (MHA)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Ministry of Home Affairs (MHA) Standard Police Procurement Norms",
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": [
            "riot helmet", "police helmet", "tactical helmet", "paramilitary", "crpf", "law enforcement",
            "riot control", "mha", "anti-riot headgear", "police modernization",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 14740:1999 (Reaffirmed 2020)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 9562",
        "title": "Helmets for Racing Car Drivers — Specification",
        "year": 2001,
        "product_type": "Racing Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for helmets designed to be worn by drivers "
            "and co-drivers of racing cars and rally cars. These helmets provide higher levels "
            "of protection than standard motorcycle helmets due to high-speed motorsport risks."
        ),
        "clauses": [
            {"clause": "Cl 4.1", "title": "Carbon-Kevlar Composite Shell", "requirement": "Mandatory full-face construction; high tensile composite."},
            {"clause": "Cl 5.3", "title": "Severe Impact Deceleration", "requirement": "Energy absorption under 225g peak limit at high velocity."},
            {"clause": "Cl 6.2", "title": "Fire Resisting Liner", "requirement": "Nomex or equivalent fireproof lining conforming to FIA 8860 standards."}
        ],
        "requirements": {
            "construction": "Full-face helmet mandatory for motorsport and rally applications",
            "impact_absorption": "Peak deceleration ≤ 225g under high energy impacts",
            "fire_resistance": "Outer shell, visor, and interior liner must be flame-proof",
            "retention": "Double D-ring titanium or high-grade stainless steel retention system",
        },
        "testing_requirements": {
            "high_energy_impact_test": "Impact test with 7.5 m/s drop velocity",
            "flame_test": "Direct burner flame at 800°C for 30 seconds",
            "penetration_test": "Hardened 4kg steel striker dropped from 3m height",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI) + FIA Co-recognition",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2010, "description": "Updated optical anti-glare visor requirements"}
        ],
        "keywords": [
            "racing helmet", "motorsport helmet", "car racing", "rally", "FIA", "driver helmet",
            "motorsport safety", "fire-resistant helmet",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 9562:2001 (AMD 1:2010)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 4129",
        "title": "Helmets for Cyclists — Specification",
        "year": 2016,
        "product_type": "Cycling Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for helmets designed to protect the heads of "
            "cyclists, including road cyclists, mountain bikers, and urban cyclists."
        ),
        "clauses": [
            {"clause": "Cl 4.1", "title": "Shock Absorption", "requirement": "Drop test onto flat and kerbstone anvils; peak g ≤ 250g."},
            {"clause": "Cl 5.2", "title": "Retention Test", "requirement": "Dynamic chin strap elongation < 35mm under test load."}
        ],
        "requirements": {
            "coverage": "Head coverage conforming to reference headform",
            "impact_absorption": "Peak acceleration < 250g across all impact zones",
            "ventilation": "Aero ventilation channels permitted within safety coverage",
            "weight": "Lightweight construction ≤ 350 grams",
        },
        "testing_requirements": {
            "impact_test": "Drop on flat and kerbstone anvils from 1.5m height",
            "retention_test": "Chin strap dynamic extension test",
            "roll_off_test": "Roll-off test under rotational force",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["cycling helmet", "bicycle helmet", "cyclist", "road cycling", "mountain bike"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 4129:2016",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 15758",
        "title": "Helmets for Horse Riders and Equestrian Activities",
        "year": 2007,
        "product_type": "Equestrian Helmet",
        "status": "ACTIVE",
        "scope": (
            "Specifies performance requirements and test methods for helmets designed to protect "
            "horse riders from head injury during equestrian activities."
        ),
        "clauses": [
            {"clause": "Cl 4.2", "title": "Fall Energy Attenuation", "requirement": "High kinetic absorption simulating fall from horse height (2.5m)."}
        ],
        "requirements": {
            "impact_absorption": "Protection against falls from equine height",
            "retention": "Multi-point harness with chin cup and nape adjustment",
        },
        "testing_requirements": {
            "impact_test": "Drop tests on flat and kerbstone anvils",
            "retention_test": "Dynamic harness load test",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["equestrian helmet", "horse riding helmet", "riding hat", "jockey helmet"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 15758:2007",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 16328",
        "title": "Protective Headgear for Cricket Players",
        "year": 2015,
        "product_type": "Cricket Helmet",
        "status": "ACTIVE",
        "scope": (
            "Specifies safety and performance requirements for cricket helmets with face guards "
            "to prevent ball penetration and concussion injuries from cricket ball impacts."
        ),
        "clauses": [
            {"clause": "Cl 4.1", "title": "Faceguard Deflection", "requirement": "Faceguard shall not deflect and touch headform under 130 km/h ball impact."}
        ],
        "requirements": {
            "shell": "High-impact polymer or carbon composite",
            "faceguard": "Titanium or stainless steel wire grille with anti-penetration spacing",
        },
        "testing_requirements": {
            "projectile_impact": "Cricket ball fired from pneumatic cannon at 130 km/h",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["cricket helmet", "sports headgear", "batsman helmet", "faceguard"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 16328:2015",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 7692",
        "title": "Specification for Wooden Headforms for Testing of Helmets",
        "year": 2018,
        "product_type": "Testing Headform Standard",
        "status": "ACTIVE",
        "scope": (
            "Specifies dimensions, contour measurements, mass, and center of gravity coordinates "
            "for standard wooden and metal headforms utilized in the laboratory testing of protective helmets."
        ),
        "clauses": [
            {"clause": "Cl 3.1", "title": "Headform Sizing (A, E, J, M, O)", "requirement": "Strict anatomical dimensions conforming to ISO anthropometric standards."}
        ],
        "requirements": {
            "material": "Selected seasoned teakwood or magnesium alloy",
            "accuracy": "Contour tolerance ± 0.5 mm",
        },
        "testing_requirements": {
            "calibration": "Annual calibration of center of gravity and accelerometer mounting cavity",
        },
        "certification_scheme": {
            "scheme": "Laboratory Calibration Standard",
            "license_required": False,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["headform", "testing standard", "is 7692", "wooden headform", "impact testing headform"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 7692:2018 (Edition 2.0)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 9944",
        "title": "Recommendations for Natural & Synthetic Rubbers for Chin Cups & Liners",
        "year": 1981,
        "product_type": "Material Standard",
        "status": "ACTIVE",
        "scope": (
            "Specifies rubber and elastomeric material standards used for chin cups, gaskets, and "
            "internal cushions of protective headgear to prevent skin dermatitis and degradation."
        ),
        "clauses": [
            {"clause": "Cl 2.1", "title": "Biocompatibility & Aging", "requirement": "Non-toxic, hypoallergenic elastomeric compound resistant to sweat and UV."}
        ],
        "requirements": {
            "toxicity": "Hypoallergenic; zero skin sensitization",
            "tensile_strength": "Minimum 12 MPa tensile strength",
        },
        "testing_requirements": {
            "accelerated_aging": "Heat aging at 70°C for 96 hours",
        },
        "certification_scheme": {
            "scheme": "Material Standard Reference",
            "license_required": False,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["rubber standard", "chin cup", "material specification", "liner material"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 9944:1981 (Reaffirmed 2019)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 7318",
        "title": "Glossary of Terms Relating to Head Protection",
        "year": 1974,
        "product_type": "Terminology Standard",
        "status": "ACTIVE",
        "scope": (
            "Provides standardized definitions and terminology for components, anatomical planes, "
            "retention systems, testing procedures, and performance metrics in protective headgear."
        ),
        "clauses": [],
        "requirements": {
            "terms": "Defines Shell, Harness, Nape Strap, Peak, Brim, Headband, Impact Anvil"
        },
        "testing_requirements": {},
        "certification_scheme": {
            "scheme": "Terminology Standard",
            "license_required": False,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": ["glossary", "terminology", "head protection terms", "definitions"],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 7318:1974 (Reaffirmed 2021)",
        "confidence_level": "VERIFIED",
    }
]


RELATIONSHIPS_DATA = [
    # IS 4151 (Motorcycle Helmet)
    {
        "source": "IS 4151",
        "target": "IS 7692",
        "type": "normative_reference",
        "description": "Mandatory use of IS 7692 headforms for all shock absorption and penetration drop tests",
        "strength": 0.95,
    },
    {
        "source": "IS 4151",
        "target": "IS 9944",
        "type": "normative_reference",
        "description": "Material reference for rubber chin cups and retention cushion padding",
        "strength": 0.85,
    },
    {
        "source": "IS 4151",
        "target": "IS 7318",
        "type": "terminology",
        "description": "Defines standard terms for shell, visor, chin strap, and impact planes",
        "strength": 0.65,
    },
    {
        "source": "IS 4151",
        "target": "IS 2925",
        "type": "related_product",
        "description": "Industrial head protection comparison; IS 4151 covers high velocity oblique vehicular impacts",
        "strength": 0.70,
    },
    {
        "source": "IS 4151",
        "target": "IS 9562",
        "type": "related_product",
        "description": "Racing driver helmets share baseline drop deceleration protocols but mandate FIA fireproofing",
        "strength": 0.75,
    },
    {
        "source": "IS 4151",
        "target": "IS 14740",
        "type": "related_product",
        "description": "Police riot headgear shares chin strap dynamic retention methods with IS 4151",
        "strength": 0.60,
    },
    {
        "source": "IS 4151",
        "target": "IS 4129",
        "type": "related_product",
        "description": "Cycling helmets share retention system drop test principles with IS 4151",
        "strength": 0.55,
    },
    # IS 2925 (Industrial Hard Hat)
    {
        "source": "IS 2925",
        "target": "IS 7692",
        "type": "normative_reference",
        "description": "IS 7692 calibrated headforms required for force transmission drop tests",
        "strength": 0.90,
    },
    {
        "source": "IS 2925",
        "target": "IS 2745",
        "type": "related_product",
        "description": "Firefighter helmets extend industrial shell protection with high radiant heat tolerance",
        "strength": 0.75,
    },
    {
        "source": "IS 2925",
        "target": "IS 7318",
        "type": "terminology",
        "description": "Standard terms for harness clearance, crown suspension, and dielectric classification",
        "strength": 0.65,
    },
    # IS 2745 (Firefighter)
    {
        "source": "IS 2745",
        "target": "IS 7692",
        "type": "normative_reference",
        "description": "Headform geometry required during high heat thermal chamber impact trials",
        "strength": 0.85,
    },
    # IS 14740 (Police Tactical / Riot)
    {
        "source": "IS 14740",
        "target": "IS 4151",
        "type": "normative_reference",
        "description": "References IS 4151 peripheral field of vision and retention test apparatus",
        "strength": 0.80,
    },
    {
        "source": "IS 14740",
        "target": "IS 7692",
        "type": "normative_reference",
        "description": "IS 7692 headforms mandated for pellet deflection and blunt impact tests",
        "strength": 0.85,
    },
]


QCO_ORDERS_DATA = [
    {
        "order_title": "Helmets for Two-Wheeler Motor Vehicles (Quality Control) Order, 2020",
        "gazette_no": "S.O. 4252(E)",
        "date": "26th November 2020",
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "standard_mandated": "IS 4151:2015",
        "enforcement_status": "COMPULSORY & ENFORCED NATIONWIDE",
        "summary": "Mandates that no person shall manufacture, import, store, sell or distribute two-wheeler helmets unless they conform to IS 4151 and bear the Standard Mark (ISI) under license from BIS.",
        "penalties": "Punishable under Section 29 of BIS Act, 2016 with imprisonment up to 2 years or fine up to Rs. 5,00,000 for first offence.",
        "cvc_guideline": "Government departments and police forces are prohibited from procuring non-ISI helmets. Tenders without mandatory BIS certification clause are void ab initio."
    },
    {
        "order_title": "Personal Protective Equipment — Industrial Helmets (Quality Control) Order, 2021",
        "gazette_no": "S.O. 1827(E)",
        "date": "14th May 2021",
        "ministry": "Ministry of Commerce and Industry (DPIIT)",
        "standard_mandated": "IS 2925:2019",
        "enforcement_status": "COMPULSORY & ENFORCED NATIONWIDE",
        "summary": "Mandatory certification for all industrial safety helmets used across construction sites, factories, mines, and infrastructure projects in India.",
        "penalties": "Action under BIS Act, 2016 Section 16 & 29 and Factories Act, 1948.",
        "cvc_guideline": "NHAI, PWD, CPWD, and Railways procurement must enforce IS 2925 with valid BIS licence verification on GeM."
    },
    {
        "order_title": "Fire Fighting Equipment (Quality Control) Order, 2022",
        "gazette_no": "S.O. 3109(E)",
        "date": "12th July 2022",
        "ministry": "Ministry of Commerce and Industry (DPIIT)",
        "standard_mandated": "IS 2745:1983",
        "enforcement_status": "COMPULSORY & ENFORCED",
        "summary": "Mandatory conformity to IS 2745 for all municipal and emergency service structural firefighting helmets.",
        "penalties": "Prosecution under BIS Act, 2016.",
        "cvc_guideline": "Municipal fire service procurements must require proof of current valid BIS licence."
    }
]
