// Technique: open strings, scales, arpeggios, bowing/shift études (original exercises + PD études).
export default [
{ id: 'tech-open-strings', genre: 'Technique', abc: `X:1
T:Open String Warm-Up
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:C
G,4|G, G, G, G,|D4|D D D D|A4|A A A A|e4|e e e e|
e e A A|D D G, G,|G, D A e|e A D G,|]` },

{ id: 'tech-d-major-scale', genre: 'Technique', abc: `X:1
T:D Major Scale (1 octave)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:D
D E F G|A B c d|d c B A|G F E D|
D/D/ E/E/ F/F/ G/G/|A/A/ B/B/ c/c/ d/d/|d/d/ c/c/ B/B/ A/A/|G/G/ F/F/ E/E/ D2|]` },

{ id: 'tech-a-major-scale', genre: 'Technique', abc: `X:1
T:A Major Scale (1 octave)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:A
A B c d|e f g a|a g f e|d c B A|]` },

{ id: 'tech-g-major-2oct', genre: 'Technique', abc: `X:1
T:G Major Scale (2 octaves)
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:G
G,A,B,C DEFG|ABcd efga|g2 fe dcBA|GFED CB,A,G,|G,8|]` },

{ id: 'tech-c-major-scale', genre: 'Technique', abc: `X:1
T:C Major Scale (low 2s)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:C
C D E F|G A B c|c B A G|F E D C|]` },

{ id: 'tech-a-minor-melodic', genre: 'Technique', abc: `X:1
T:A Melodic Minor Scale
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:Am
A,B,CD E^F^GA|Bcde ^f^ga2|a=g=fe dcBA|=G=FED CB,A,2|]` },

{ id: 'tech-chromatic', genre: 'Technique', abc: `X:1
T:Chromatic Scale on D & A Strings
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:C
D^D E F ^F G ^G A|^A B c ^c d ^d e2|e _e d _d c B _B A|_A G _G F E _E D2|]` },

{ id: 'tech-arpeggios', genre: 'Technique', abc: `X:1
T:Arpeggios in G, D and A
C:Exercise
M:3/4
L:1/8
Q:1/4=90
K:D
"G"G,B,D GBd|g6|dBG DB,G,|G,6|
"D"DFA dfa|d'6|afd AFD|D6|
"A"A,CE Ace|a6|ecA EC A,|A,6|]` },

{ id: 'tech-wohlfahrt-1', genre: 'Technique', abc: `X:1
T:Étude Op. 45 No. 1 (opening)
C:Franz Wohlfahrt (1850s)
M:4/4
L:1/8
Q:1/4=80
K:C
"C"CEGc CEGc|"G"B,DGB B,DGB|"C"CEGc CEGc|"G"DGBd DGBd|
"F"FAcf FAcf|"C"EGce EGce|"G"DGBd "G7"DFBd|"C"cGEC C4|]` },

{ id: 'tech-string-crossing', genre: 'Technique', abc: `X:1
T:String Crossing Study
C:Exercise
M:4/4
L:1/8
Q:1/4=80
K:D
"D"DADA DADA|FAFA FAFA|"G"GBGB GBGB|"D"FAFA DADA|
"A"EAEA EAEA|"D"FAFA "G"GBGB|"A"EAEA ^GBGB|"D"FADA D4|]` },

{ id: 'tech-third-position', genre: 'Technique', abc: `X:1
T:Third Position Shifting
C:Exercise
M:4/4
L:1/4
Q:1/4=70
K:D
d e f g|a g f e|d e f g|a2 a2|
a b c' d'|d' c' b a|g f e d|d4|]` },

{ id: 'tech-e-string-high', genre: 'Technique', abc: `X:1
T:High E-String Ladder
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:A
e f g a b c' d' e'|e' d' c' b a g f e|a b c' d' e' f' g' a'|a'8|]` },

{ id: 'tech-rhythm-dots', genre: 'Technique', abc: `X:1
T:Dotted Rhythm Drill
C:Exercise
M:4/4
L:1/8
Q:1/4=80
K:G
G>A B>c d>e f>g|g>f e>d c>B A>G|G>B d>B G>B d>B|g2 d2 B2 G2|]` },

{ id: 'tech-triplets', genre: 'Technique', abc: `X:1
T:Triplet Study
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:D
(3DEF (3GAB (3cde (3fga|(3agf (3edc (3BAG (3FED|(3DFA (3dAF (3DFA d2|(3AFD (3AFD A,4|]` },

{ id: 'tech-double-dutch', genre: 'Technique', abc: `X:1
T:Sixteenth-Note Detaché
C:Exercise
M:4/4
L:1/16
Q:1/4=70
K:A
AAAA BBBB cccc dddd|eeee dddd cccc BBBB|AcBd ceBd cAeA a4|]` },
];
