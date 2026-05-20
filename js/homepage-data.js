// Homepage Data - Aptamer Data Configuration
// Simplified aptamer data - Based on actual files - For homepage display

window.aptamerData = [
    {
        name: "Thrombin aptamer",
        filename: "Thrombin-aptamer.md",
        url: "/_posts/Thrombin-aptamer.html",
        molstarUrl: "/pdbfiles/3dd2-3D.pdb.bcif",
        pdbId: "3DD2",
        target: "Human Thrombin",
        affinity: "0.54 nM",
        authors: "Sullenger B.A. et al.",
        firstYear: "1994",
        description: "Thrombin is a serine protease belonging to the MEROPS protease family S1 (chymotrypsin family, PA(S) clan), subfamily S1A. Thrombin, also known as fibrinogenase and factor IIa, is the final protease in the vertebrate blood coagulation cascade. Thrombin triggers coagulation by releasing fibrinopeptides A and B from the amino termini of the fibrinogen a and b chains. This aptamer was selected through SELEX technology and exhibits high affinity and specific binding capability to human α-thrombin."
    },
    {
        name: "Tetracycline aptamer",
        filename: "Tetracycline-aptamer.md",
        url: "/_posts/Tetracycline-aptamer.html",
        molstarUrl: "/pdbfiles/3EGZ.pdb.bcif",
        pdbId: "3EGZ",
        target: "Tetracycline",
        affinity: "0.77 μM",
        authors: "Müller et al.",
        firstYear: "1994",
        description: "Tetracycline is a broad-spectrum antibiotic that works by inhibiting bacterial protein synthesis. This RNA aptamer can specifically bind to tetracycline molecules with good selectivity and affinity. This aptamer has important applications in biosensors and drug detection, and can be used to develop aptamer-based detection methods."
    },
    {
        name: "Theophylline aptamer",
        filename: "Theophylline-aptamer.md",
        url: "/_posts/Theophylline-aptamer.html",
        molstarUrl: "/pdbfiles/1THE.pdb.bcif",
        pdbId: "1THE",
        target: "Theophylline",
        affinity: "0.32 μM",
        authors: "Jenison et al.",
        firstYear: "1994",
        description: "Theophylline is a methylxanthine compound with bronchodilator and central nervous system stimulant effects. This RNA aptamer was one of the first small molecule-binding aptamers developed, obtained through in vitro selection technology. It demonstrates the great potential of aptamer technology in small molecule recognition and binding."
    },
    {
        name: "Tobramycin aptamer",
        filename: "Tobramycin-aptamer.md",
        url: "/_posts/Tobramycin-aptamer.html",
        molstarUrl: "/pdbfiles/1TOB.pdb.bcif",
        pdbId: "1TOB",
        target: "Tobramycin",
        affinity: "5 μM",
        authors: "Kaul et al.",
        firstYear: "2002",
        description: "Tobramycin is an aminoglycoside antibiotic primarily used to treat Gram-negative bacterial infections. This RNA aptamer can specifically recognize tobramycin, providing possibilities for developing new antibiotic detection methods. Structural studies of the aptamer reveal the molecular mechanisms of RNA-small molecule antibiotic interactions."
    },
    {
        name: "FMN Riboswitch",
        filename: "FMN-aptamer.md", 
        url: "/_posts/FMN-aptamer.html",
        molstarUrl: "/pdbfiles/1FMN.pdb.bcif",
        pdbId: "1FMN",
        target: "FMN (Flavin mononucleotide)",
        affinity: "40 nM",
        authors: "Winkler et al.",
        firstYear: "2002",
        description: "The FMN riboswitch is a naturally occurring RNA regulatory element that specifically binds flavin mononucleotide (FMN). This riboswitch regulates the expression of flavin synthesis-related genes in bacteria and is a classic model for studying RNA-ligand interactions. Its structure demonstrates how natural RNA has evolved precise molecular recognition capabilities."
    },
    {
        name: "Arginine aptamer",
        filename: "Arginine-aptamer.md",
        url: "/_posts/Arginine-aptamer.html",
        molstarUrl: "/pdbfiles/1KOC-3D-ARG.pdb.bcif",
        pdbId: "1KOC",
        target: "L-Arginine",
        affinity: "290 nM",
        authors: "Geiger et al.",
        firstYear: "1996",
        description: "Arginine is a positively charged basic amino acid that plays an important role in protein structure and function. This RNA aptamer was selected through in vitro selection technology and can specifically recognize L-arginine. Its structural studies provide important insights into understanding RNA-amino acid interactions and have applications in developing amino acid detection methods."
    },
    {
        name: "eIF4A aptamer",
        filename: "eIF4A-aptamer.md",
        url: "/_posts/eIF4A-aptamer.html",
        molstarUrl: "/pdbfiles/elF4A-3D.pdb.bcif",
        pdbId: "3EIF",
        target: "eIF4A protein",
        affinity: "25 nM",
        authors: "Fukuda et al.",
        firstYear: "2000",
        description: "eIF4A is eukaryotic translation initiation factor 4A, an ATP-dependent RNA helicase that plays a key role in mRNA translation initiation. This RNA aptamer can specifically bind to the eIF4A protein, providing a powerful tool for studying translation regulation mechanisms and has potential applications in anticancer drug development."
    },
    {
        name: "MS2 coat protein aptamer",
        filename: "bacteriophage-MS2-coat-protein-aptamer.md",
        url: "/_posts/bacteriophage-MS2-coat-protein-aptamer.html",
        molstarUrl: "/pdbfiles/MS2_coat_6msf-3D.pdb.bcif",
        pdbId: "6MSF",
        target: "MS2 coat protein",
        affinity: "5 nM",
        authors: "Lim et al.",
        firstYear: "1994",
        description: "The MS2 coat protein is a structural protein from the MS2 bacteriophage responsible for packaging the viral RNA genome. This RNA aptamer can bind to the MS2 coat protein with high affinity and is a classic model for studying RNA-protein interactions. This aptamer has important applications in RNA labeling, protein purification, and virus research."
    }
];

console.log('Generated aptamer data:', window.aptamerData); 