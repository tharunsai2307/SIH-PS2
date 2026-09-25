"""
ISense Mock BIS Dataset — Helmet Standards Knowledge Base
Phase 2: Curated prototype knowledge base for demonstration purposes.

IMPORTANT: This is NOT the complete BIS database. It is a curated prototype
knowledge base used to demonstrate the ISense architecture.
"""

STANDARDS_DATA = [
    {
        "is_number": "IS 4151",
        "title": "Protective Helmets for Motorcyclists",
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
        "requirements": {
            "construction": "Helmet shell must withstand prescribed impact loads without fracture",
            "field_of_vision": "Minimum 105 degrees horizontal, 30 degrees vertical",
            "shock_absorption": "Peak acceleration shall not exceed 300g during impact tests",
            "penetration_resistance": "Test striker shall not contact headform",
            "retention_system": "Chin strap with quick-release buckle; withstand 25 kg load",
            "surface_friction": "Helmets shall not rotate more than 35 degrees under oblique impact",
            "weight": "Maximum 1.5 kg for open-face, 1.8 kg for full-face helmets",
        },
        "testing_requirements": {
            "impact_absorption_test": "Drop test from 1.5m on flat anvil and hemispherical anvil",
            "penetration_test": "Striker dropped from prescribed height",
            "retention_test": "Dynamic load test on chin strap assembly",
            "chin_strap_test": "Elongation under 10 kg and 40 kg loads",
            "field_of_vision_test": "Measured using goniometer with headform",
            "conditioning": "Tests under ambient, cold (-20°C), hot (+50°C), and wet conditions",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Helmets (Quality Control) Order 2020",
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2018, "description": "Revised impact test procedures"},
            {"number": "AMD 2", "year": 2020, "description": "Updated retention system requirements"},
        ],
        "keywords": [
            "motorcycle helmet", "protective helmet", "motorcyclist", "moped", "scooter",
            "crash helmet", "road safety", "head protection", "ISI mark",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 4151:2015 (as amended up to AMD 2:2020)",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 2925",
        "title": "Industrial Safety Helmets",
        "year": 2019,
        "product_type": "Industrial Safety Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for industrial safety helmets designed to "
            "protect the wearer's head against impact from falling objects, rain, electric shock, "
            "and other occupational hazards. Applicable in construction, mining, manufacturing, "
            "and other industrial environments."
        ),
        "requirements": {
            "shell": "Shall be rigid, seamless, and free from defects",
            "impact_protection": "Peak transmission force ≤5000 N",
            "penetration_resistance": "Striker shall not touch headform",
            "flame_resistance": "Helmet shall not continue burning > 5 seconds after flame removal",
            "electrical_resistance": "Type E: withstand 2200V AC for 1 minute",
            "chin_strap": "If provided, shall not cause strangulation hazard",
            "marking": "IS 2925, manufacturer, year of manufacture, size, type",
        },
        "testing_requirements": {
            "impact_test": "Drop 5 kg mass from 1 m height onto helmet on headform",
            "penetration_test": "Conical striker dropped from 1 m",
            "flammability_test": "Exposure to 790°C flame for 10 seconds",
            "electrical_test": "Immerse in water, apply 2200 V AC (Type E helmets)",
            "cold_conditioning": "Tests at -10°C for 4 hours",
            "high_temp_conditioning": "Tests at 50°C for 4 hours",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": True,
            "legal_basis": "Factories Act provisions, PPE Rules",
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2021, "description": "Revised Type classification"},
        ],
        "keywords": [
            "industrial safety helmet", "hard hat", "construction helmet", "mining helmet",
            "head protection", "PPE", "occupational safety", "electrical protection",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 2925:2019",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 2745",
        "title": "Non-metallic Helmets for Firefighters",
        "year": 1983,
        "product_type": "Firefighter Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for non-metallic protective helmets used by "
            "firefighters. The helmets are designed to protect against heat, impact from falling "
            "objects, and penetration during firefighting operations."
        ),
        "requirements": {
            "construction": "Non-metallic shell with brim or peak for face protection",
            "heat_resistance": "Shell shall not deform, ignite, or drip at 260°C for 5 minutes",
            "impact_absorption": "Protection against falling objects",
            "penetration_resistance": "Resistance to sharp objects",
            "chin_strap": "Secure retention with quick-release mechanism",
            "shell_material": "High-density polyethylene or equivalent non-metallic material",
        },
        "testing_requirements": {
            "heat_resistance_test": "Exposed to 260°C for 5 minutes in oven",
            "impact_test": "Conditioned at room temperature, tested with hemispherical striker",
            "penetration_test": "Conical striker test",
            "stability_test": "Helmet shall not fall off with chin strap attached",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": [
            "firefighter helmet", "fire brigade", "heat resistant helmet",
            "non-metallic helmet", "fire protection", "emergency services",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 2745:1983",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 9562",
        "title": "Helmets for Racing Car Drivers",
        "year": 2001,
        "product_type": "Racing Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for helmets designed to be worn by drivers "
            "and co-drivers of racing cars and rally cars. These helmets provide higher levels "
            "of protection than standard motorcycle helmets due to the specific risks of motorsport."
        ),
        "requirements": {
            "construction": "Full-face helmet mandatory for racing applications",
            "impact_absorption": "Higher energy absorption than IS 4151",
            "fire_resistance": "Outer shell and liner shall be fire-resistant",
            "roll_bar_clearance": "Helmet profile to ensure compatibility with roll cage",
            "visor": "Optically clear, shatter-resistant visor",
            "retention": "Double D-ring or equivalent race-grade retention",
        },
        "testing_requirements": {
            "impact_test": "Multiple impact tests at higher energy levels",
            "fire_resistance_test": "Flame exposure per FIA standards",
            "roll_cage_simulation": "Crush test simulating roll-over",
            "visor_penetration": "High-velocity particle impact on visor",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark + FIA 8860 recognition",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
            "note": "Often supplemented by international FIA homologation",
        },
        "amendments": [
            {"number": "AMD 1", "year": 2010, "description": "Updated visor requirements"},
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
        "is_number": "IS 15758",
        "title": "Helmets for Horse Riders",
        "year": 2007,
        "product_type": "Equestrian Helmet",
        "status": "ACTIVE",
        "scope": (
            "Specifies performance requirements and test methods for helmets designed to protect "
            "horse riders from head injury during equestrian activities."
        ),
        "requirements": {
            "impact_absorption": "Protection against falls from horse height",
            "retention": "Chin strap must retain helmet under dynamic loads",
            "shell": "Must not shatter into sharp fragments",
            "coverage": "Must cover temples and back of head",
        },
        "testing_requirements": {
            "impact_test": "Drop tests on flat and kerbstone anvils",
            "retention_test": "Dynamic retention system test",
            "roll_off_test": "Helmet must not roll off headform under load",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": [
            "equestrian helmet", "horse riding helmet", "riding hat", "jockey helmet",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 15758:2007",
        "confidence_level": "VERIFIED",
    },
    {
        "is_number": "IS 4129",
        "title": "Helmets for Cyclists",
        "year": 2016,
        "product_type": "Cycling Helmet",
        "status": "ACTIVE",
        "scope": (
            "This standard specifies requirements for helmets designed to protect the heads of "
            "cyclists, including road cyclists, mountain bikers, and urban cyclists."
        ),
        "requirements": {
            "coverage": "Minimum head coverage as defined by reference plane",
            "impact_absorption": "Energy absorption across all test zones",
            "retention": "Chin strap with adequate dynamic and static retention",
            "ventilation": "Ventilation openings permitted within coverage limits",
        },
        "testing_requirements": {
            "impact_test": "Drop on flat, hemispherical and kerbstone anvils",
            "retention_test": "Combined static and dynamic chin strap test",
            "roll_off_test": "Anti-rotation test",
        },
        "certification_scheme": {
            "scheme": "BIS Certification Mark (ISI Mark)",
            "license_required": True,
            "mandatory": False,
            "bureau": "Bureau of Indian Standards",
        },
        "amendments": [],
        "keywords": [
            "cycling helmet", "bicycle helmet", "cyclist", "road cycling", "mountain bike",
        ],
        "source_url": "https://www.bis.gov.in/index.php/standards/",
        "source_reference": "IS 4129:2016",
        "confidence_level": "VERIFIED",
    },
]


RELATIONSHIPS_DATA = [
    # IS 4151 (Motorcycle Helmet) relationships
    {
        "source": "IS 4151",
        "target": "IS 2925",
        "type": "related_product",
        "description": "Both are head-protection standards; IS 4151 is road-use specific, IS 2925 is industrial",
        "strength": 0.7,
    },
    {
        "source": "IS 4151",
        "target": "IS 9562",
        "type": "related_product",
        "description": "IS 9562 (racing helmet) shares shock-absorption methodology with IS 4151",
        "strength": 0.6,
    },
    {
        "source": "IS 4151",
        "target": "IS 4129",
        "type": "related_product",
        "description": "IS 4129 (cycling helmet) shares retention system test methodology",
        "strength": 0.5,
    },
    {
        "source": "IS 2925",
        "target": "IS 2745",
        "type": "related_product",
        "description": "IS 2745 (firefighter) is a specialized variant of head protection for extreme environments",
        "strength": 0.6,
    },
    {
        "source": "IS 9562",
        "target": "IS 4151",
        "type": "normative_reference",
        "description": "IS 9562 references IS 4151 test methods as a baseline",
        "strength": 0.8,
    },
    {
        "source": "IS 4151",
        "target": "IS 15758",
        "type": "related_product",
        "description": "Equestrian helmets share similar retention and impact principles",
        "strength": 0.4,
    },
    {
        "source": "IS 2925",
        "target": "IS 4151",
        "type": "terminology",
        "description": "Shared terminology for headform types and conditioning procedures",
        "strength": 0.5,
    },
]
