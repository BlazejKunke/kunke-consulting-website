/* ============================================================================
   METRO NAMES — the daft bit.
   Plain data. Edit anything here and the game picks it up on the next reload.
   Nothing is sacred. Add your own. Delete the ones that offend you.
   ========================================================================= */

var METRO_NAMES = (function () {

  /* --- City names -------------------------------------------------------- */
  var city = [
    "Blazetown", "Grimsditch", "Nether Wallop Magna", "Upper Sogbury",
    "Great Snoring-on-Wold", "Piddlethwaite", "Clagcaster", "Mumblesby",
    "Stoke Malodour", "Wetherclough", "Bunting-under-Lyne", "Sprocket Hallow",
    "Lower Grumbleton", "Kettlewick", "Drizzlemouth", "Hoggingham",
    "Scunthorpe-but-Worse", "Bogshire", "Fenny Sputterton", "Marrowby",
    "Puddlemarsh", "Thruppleton", "Wibbleworth", "Old Sock",
    "Ashby-de-la-Nonsense", "Crumpsall Parva", "Nether Bottom",
    "Greater Flimwell", "Sludgeport", "Barnsley's Revenge", "Wormcastle",
    "Trumpington Vile", "Cheeseborough", "Slaphampton", "Widdlecombe",
    "Bishop's Trouble", "Kings Sulking", "Queen's Regret", "Duke's Elbow",
    "Little Mildew", "Great Mildew", "Mildew Magna", "Sourdough-on-Sea",
    "Crustington", "Gravyford", "Pieminster", "Battersby Poot",
    "Fogmarsh", "Vaguely-on-Thames", "Slightly Wrong Bridge",
    "Northern Southampton", "Cardigan Bay Adjacent", "Hemlock Weir",
    "Twattingham", "Bumford", "Splendid Ditch", "Weeping Cross",
    "Hangover Green", "Regretsville", "Doncaster's Cousin", "Pratt's End",
    "Umbrage-under-Water", "Thumping Norton", "Chipping Sodbury Junior",
    "Steeple Bumstead", "Curdle", "Curdle Magna", "Fleshwick",
    "Mousehole-but-Bigger", "Wamble", "Nether Wamble", "Wamble St Giles",
    "Squelch", "Squelchford", "Poundbury Actual", "Tinned Peaches",
    "Blandsworth", "Beigeington", "Adequate Green", "Fine, I Suppose",
    "Moistwich", "Gusset Hill", "Trouserton", "Ankleby", "Kneecapstone",
    "Shinsdale", "Elbowmarsh", "Nostrildon", "Earwigg", "Toenail Bay",
    "Gurning", "Gurning-on-Sea", "Loaf", "Big Loaf", "Loafminster",
    "Crispsby", "Vinegar Strand", "Chip Fat Cross", "Kebabley",
    "Wetherspoonshire", "Lidlington", "Aldi Parva", "Roundabout Magna",
    "Ring Road Regis", "Bypass-under-Edge", "Layby St Mary",
    "Traffic Cone Hill", "Bollardsby", "Pothole Green", "Speedbump End",
    "Yorkshire's Apology", "Slightly Wales", "Nearly Scotland",
    "Definitely Not Milton Keynes", "Basildon But Nice", "Croydon Superior",
    "Grim Ferrers", "Muck Bassett", "Filth Regis", "Squalor-on-the-Wold",
    "Prattle", "Prattle Bottom", "Old Prattle", "Nether Prattle"
  ];

  /* --- Line names -------------------------------------------------------- */
  var lines = [
    "The Wobbly Line", "Central Nonsense", "The Damp Line", "Pigeon Line",
    "The Sulk", "Bakerloo's Cousin", "The Long Way Round", "The Apology Line",
    "Grumble Line", "The Slightly Late", "Northern-ish", "The Wheeze",
    "Circle But Not Really", "The Sigh", "The Detour", "Mildew Line",
    "The Gravy Express", "The Reluctant", "Puddle Line", "The Clatter",
    "The Rattler", "Anxiety Line", "The Optimist", "The Shortcut That Isn't",
    "Loop of Regret", "The Big Green Idea", "The Fast One", "The Other One",
    "Auntie's Line", "The Vicar's Line", "The Wonky", "Line 1 (Provisional)",
    "The Committee Line", "Deferred Maintenance Line", "The Compromise",
    "Consultation Line", "The Overspend", "Phase Two (Eventually)",
    "The Trundler", "Whippet Line", "The Kettle", "Toast Line",
    "The Beige Route", "Municipal Blue", "The Lord Mayor's Whim",
    "The Diagonal", "Cross-City Faff", "The Backbone", "The Spine",
    "The Wiggle", "Old Faithful", "The Pride of the Borough",
    "The Nine-Twelve", "The Ratrun", "Sunday Service Line", "The Chancer",
    "Peak Only Line", "The Weekend Warrior", "The Necessary Evil",
    "Great Northern Shrug", "The Understudy", "Line of Best Fit"
  ];

  /* --- Curated station names --------------------------------------------- */
  /* The handmade ones. Roughly 500. Procedural generator below adds ~300k more. */
  var stationCurated = [
    /* the originals */
    "Old Apple's Market Bridge", "Bibbly Doobly", "Ol' Hogs Arse",
    "The Pollacks", "Venomous Spiders", "Aunt Daniela's Gay Lover",
    "Red Bannana's Pivot", "Buttmmanshire", "OneHanded Wanka",
    "Blazej's Metro",

    /* rude-adjacent geography */
    "Hogs Arse Central", "Hogs Arse Halt", "Lesser Hogs Arse",
    "Bottomley Bottom", "Bottomley End", "Upper Bottom", "Nether Bottom",
    "Bottom of the Bottom", "Fanny Wallop", "Wallop Magna", "Wallop Parva",
    "Steeple Bumsted", "Bumford Bridge", "Bumford Riverside",
    "Great Cockering", "Little Cockering", "Cockering Halt",
    "Knackers Yard", "The Knackered Arms", "Knackerton North",
    "Bollard's Bottom", "Bollocks Green", "Nether Bollocks",
    "Twattingham East", "Twattingham Parkway", "Twattingham Ferry",
    "Pratt's End", "Pratt's End Interchange", "Old Pratt",
    "Wazzock Lane", "Wazzock Junction", "Plonker Bridge",
    "Gusset Hill", "Gusset Hill Upper", "The Gusset",
    "Moist Norton", "Moist Norton West", "Damp Trevor", "Wet Trevor",
    "Wet Trevor Marsh", "Sopping Cross", "Dank Meadow", "Clammy Vale",
    "Sweaty Betty's", "Chafing Cross", "Chafing Cross Thameslink",

    /* daft nonsense */
    "Bibbly Doobly North", "Bibbly Doobly Sidings", "Doobly Parva",
    "Wibble", "Wibble Wobble", "Wobbly Wibble Halt", "Nether Wibbling",
    "Upper Wibbling", "Wibbling-on-the-Wold", "Flimflam Cross",
    "Squiggleford", "Squiggle Bottom", "Bimbleton", "Bimbleton Woods",
    "Fnarr", "Fnarr Fnarr", "Greater Fnarr", "Oi Oi Saveloy",
    "Blimey O'Reilly", "Crikey Halt", "Gordon Bennett Street",
    "Bloomin' Heck", "Well I Never", "Good Grief Green", "Oh For Heaven's Sake",
    "You're Having a Laugh", "Do Me a Favour", "Leave It Out",
    "Absolute Shambles", "Complete Faff", "Utter Palaver",
    "Right Old Kerfuffle", "Bit of a Do", "Proper Bother",
    "Total Mither", "Fine Mess Fields", "Nice One Cyril Street",

    /* the family scandal series */
    "Aunt Daniela's Gay Lover (Upper)", "Auntie Pat's Boyfriend Problem",
    "Uncle Kev's Third Wife", "Uncle Kev's Fourth Wife",
    "Nan's Secret Second Family", "Grandad's Unexplained Boat",
    "Cousin Gary's Legal Situation", "Cousin Gary's Other Legal Situation",
    "Our Sharon's Big Mistake", "Our Sharon's Bigger Mistake",
    "Mum's New Boyfriend Dave", "Dave (Not That Dave)",
    "The Other Dave", "Definitely Not Dave", "Dave's Regret",
    "Auntie Val's Shed", "Auntie Val's Other Shed", "Val's Divorce Settlement",
    "Grandma's Unmarked Grave", "Nan's Ashes (Approximate)",
    "The Will Reading", "Contested Probate Halt", "Family Group Chat Muted",
    "Christmas Argument Cross", "Boxing Day Silence",
    "Whose Turn Is It To Host", "Someone's Told Mum",

    /* British institutions, disgraced */
    "The Vicar's Elbow", "Vicar's Knee", "Bishop's Knuckle",
    "Bishop's Trouble", "Abbot's Regret", "Monk's Mistake",
    "Nun's Revenge", "Friar's Ankle", "Parson's Nose", "Parson's Nose East",
    "Canon Fodder", "Curate's Egg", "The Cheeky Vicarage",
    "Deacon's Dilemma", "Choirboy's Lament", "Organ Loft Junction",
    "Jumble Sale Halt", "Tombola Fields", "Raffle Ticket Row",
    "Parish Council Chambers", "Extraordinary General Meeting",
    "Any Other Business", "Matters Arising", "Minutes of the Last Meeting",
    "Apologies for Absence", "Motion Carried", "Motion Defeated",
    "Point of Order", "The Chair's Casting Vote",

    /* pub and food */
    "The Slaughtered Lamb", "The Confused Badger", "The Startled Ferret",
    "The Weeping Otter", "The Furious Duck", "The Passive-Aggressive Swan",
    "The Melancholy Pig", "The Optimistic Goat", "The Sceptical Heron",
    "The Drowned Rat", "The Feral Vicar", "The Hungover Bishop",
    "The Rusty Kettle", "The Broken Biscuit", "The Soggy Bottom",
    "The Last Chip", "The Cold Gravy", "The Wrong Sandwich",
    "Beans on Toast Central", "Full English Junction", "Black Pudding Sidings",
    "Gravy Ford", "Gravy Ford North", "Chip Fat Cross", "Vinegar Strand",
    "Mushy Pea Green", "Battered Sausage Bridge", "Kebab Alley",
    "Curry Sauce Halt", "Cheese Toastie Fields", "Crumpet Bottom",
    "Scone Argument Circus", "Jam First Lane", "Cream First Lane",
    "Tea Too Strong", "Tea Too Weak", "Milk In First",
    "Biscuit Tin Full of Sewing Things",

    /* wildlife of dubious temperament */
    "Venomous Spiders East", "Venomous Spiders Depot", "The Spider Situation",
    "Wasp Nest Parkway", "Aggressive Geese Crossing", "Goose Attack Corner",
    "The Seagull Problem", "Seagull Took My Chips", "Pigeon Terminal",
    "Pigeon Terminal (Abandoned)", "Feral Cat Sidings", "Urban Fox Depot",
    "The Badger Standoff", "Squirrel Uprising", "Rat King Cross",
    "Rat King Cross St Pancreas", "Slightly Rabid Hedgehog",
    "Moth Infestation Halt", "Silverfish Bottom", "The Wasp Line Terminus",
    "Cow Field (Trespassers Beware)", "Bullock Warning Bridge",
    "Horse With Opinions", "Donkey Sanctuary Parkway",
    "Ferrets Reunited", "The Ferret Emporium",

    /* municipal despair */
    "Roundabout Magna", "Second Roundabout", "Third Roundabout, Honestly",
    "Ring Road Regis", "Bypass-under-Edge", "Layby St Mary",
    "Traffic Cone Hill", "Bollardsby", "Pothole Green", "Speedbump End",
    "Temporary Traffic Lights", "Diversion Follows", "Road Closed Ahead",
    "Men At Work (None Visible)", "Cones But No Workmen",
    "Council Depot Sidings", "Recycling Centre Parkway",
    "Wheelie Bin Junction", "Bin Day Confusion", "Wrong Bin Wednesday",
    "Planning Permission Denied", "Change of Use Halt",
    "Listed Building Regret", "Conservation Area Boundary",
    "Section 106 Sidings", "Affordable Housing (Theoretical)",
    "Luxury Apartments Nobody Wants", "Riverside Development Flooded",
    "The Regeneration Zone", "The Regeneration Zone (Phase 4)",
    "Enterprise Zone Empty", "Business Park Ghost Town",
    "Retail Park Vacancy", "The Closed Woolworths", "Where The Bank Was",
    "Another Vape Shop", "Third Barber's on This Street",
    "Charity Shop Row", "Pound Shop Parade", "Cash Converters Cross",

    /* weather and mood */
    "Persistent Drizzle", "Drizzle Halt", "Light Rain Later",
    "Bit Nippy", "Right Parky", "Baltic Bottom", "Taters Green",
    "Mizzle Cross", "Grey Sky Junction", "Overcast Central",
    "Sunny Interval (One)", "Unseasonably Mild", "Wind From The East",
    "Storm Barbara Damage", "Yellow Weather Warning",
    "Leaves on the Line", "Wrong Kind of Snow", "The Wrong Kind of Leaves",
    "Signal Failure Fields", "Points Failure Parkway",
    "Person on the Track (Fine, Actually)", "Awaiting Replacement Bus",
    "Rail Replacement Bus Terminus", "Engineering Works Ahead",
    "Sunday Closure Sidings", "Delayed By Twelve Minutes",
    "We Apologise For The Delay", "This Is Not A Scheduled Stop",

    /* class warfare, gently */
    "Duke's Elbow", "Earl's Court Adjacent", "Viscount's Grievance",
    "The Marquess's Folly", "Lady Penelope's Disappointment",
    "Sir Nigel's Tax Arrangement", "The Baronet's Overdraft",
    "Old Money Halt", "New Money Parkway", "No Money At All",
    "Trust Fund Terrace", "Second Home Village", "Airbnb Ghost Street",
    "Nobody Actually Lives Here", "The Gated Community",
    "Private Road No Entry", "Neighbourhood Watch HQ",
    "Twitching Curtains Close", "Complained To The Council Again",
    "Parish Newsletter Offices", "Village Fete Committee",
    "Best Kept Village 1987", "Best Kept Village Runner-Up",

    /* body horror, mild */
    "Ankleby", "Kneecapstone", "Shinsdale", "Elbowmarsh", "Nostrildon",
    "Earwigg", "Toenail Bay", "Thumbleton", "Wristock", "Spleenfield",
    "Gallbladder Green", "Appendix Halt (Removed)", "Tonsil Bridge",
    "Adenoid Sidings", "Lower Intestine", "The Pancreas",
    "Gurning", "Gurning-on-Sea", "Grimace Hill", "Wince Bottom",
    "Flinch Cross", "Shudder Vale", "Twitch End",

    /* romance and its failures */
    "Left On Read", "Seen 9:41pm", "Three Dots Forever",
    "It's Not You It's Me Green", "We Should Talk Halt",
    "Sliding Into DMs Sidings", "Unmatched Parkway",
    "The Ick", "Mutual Friends Only", "Rebound Junction",
    "Situationship Central", "Talking Stage Terminus",
    "Booty Call Bottom", "Walk of Shame Way",
    "Sorry, Wrong Person", "Second Date Never Happened",
    "Her Mother Hated Me", "His Mother Loved Me Too Much",
    "The Divorce Solicitor's", "Amicable, Apparently",
    "Every Other Weekend Halt", "Shared Custody of the Dog",

    /* things that shouldn't be station names */
    "Small Claims Court", "Jury Duty Junction", "Speeding Awareness Course",
    "MOT Failure Depot", "Six Points on the Licence",
    "Unexpected Item in Bagging Area", "Please Take Your Items",
    "Card Declined Cross", "Insufficient Funds Fields",
    "Contactless Not Working", "Chip and PIN Halt",
    "Your Call Is Important To Us", "Press Two For Accounts",
    "Currently Experiencing High Call Volumes",
    "Have You Tried Turning It Off",
    "Terms and Conditions Apply", "Subject to Availability",
    "Some Restrictions Apply", "Photograph For Illustration Only",
    "May Contain Nuts", "Best Before Yesterday",
    "Sold As Seen", "No Refunds Under Any Circumstances",

    /* northern grandeur */
    "Grimditch", "Grimditch Vale", "Grimditch Upper Mill",
    "Clagworth", "Clagworth Parva", "Clagworth Colliery",
    "Sludgeport Docks", "Sludgeport Ferry", "Old Sludge",
    "Mumblesby", "Mumblesby Moor", "Mumbles End",
    "Sprocket Hallow", "Sprocket Works", "The Sprocket Foundry",
    "Kettlewick", "Kettlewick Bottoms", "Kettle Bridge",
    "Wetherclough", "Wetherclough Top", "Clough Bottom",
    "Marrowby", "Marrowby Junction", "Old Marrow",
    "Thruppleton", "Thruppleton Halt", "Thrupp",
    "Puddlemarsh", "Puddlemarsh Fen", "Puddle End",
    "Wormcastle", "Wormcastle Keep", "Worm Hill",
    "Hoggingham", "Hoggingham Parkway", "Hogg Green",

    /* southern smugness */
    "Chipping Faff", "Nether Chipping", "Chipping Under Chipping",
    "Little Snoring", "Great Snoring", "Snoring Magna",
    "Steeple Sulking", "Kings Sulking", "Sulking-on-Sea",
    "Vaguely-on-Thames", "Slightly Wrong Bridge", "Almost Richmond",
    "Nearly Chelsea", "Not Quite Hampstead", "Adjacent to Fulham",
    "Twickenham's Disappointing Cousin", "Surrey Overspill",
    "Home Counties Halt", "Commuter Belt Cross", "Season Ticket Sidings",
    "Park and Ride and Regret",

    /* pure surrealism */
    "The Concept of Tuesday", "An Unspecified Number of Owls",
    "Seventeen Wet Hats", "A Man Called Trevor",
    "The Sound of Distant Bagpipes", "Somebody Else's Umbrella",
    "A Pile of Warm Coats", "The Idea of a Sandwich",
    "Three Quarters of a Horse", "The Beige Room",
    "A Meeting That Could Have Been an Email",
    "The Long Corridor", "The Second Staircase",
    "Room 4B (Locked)", "The Cupboard Under The Stairs",
    "Behind The Sofa", "Under The Bed", "Back of the Airing Cupboard",
    "That Drawer With The Batteries", "The Bag of Bags",
    "Loft Insulation Terminus", "The Boiler Cupboard",
    "Somewhere Near The Motorway", "The Field With The Pylon",
    "The Bit Between Two Places", "Neither Here Nor There",
    "A Vague Sense of Unease", "Mild Existential Dread",
    "The Feeling You've Forgotten Something",
    "Did I Leave The Oven On", "Probably Fine",

    /* rude but coy */
    "Rectory Bottom", "Cockermouth Junior", "Penistone Parva",
    "Lower Swell", "Upper Swell", "Nempnett Thrubwell",
    "Shitterton Halt", "Crapstone Green", "Pratts Bottom",
    "Bell End", "Bell End Parkway", "Great Bell End",
    "Titty Ho", "Booby Dingle", "Brown Willy Summit",
    "Slack Bottom", "Slack Top", "Sandy Balls",
    "Wetwang", "Wetwang Sidings", "Ugley", "Ugley Green",
    "Loose Bottom", "Bitchfield", "North Piddle", "Piddle Bottom",

    /* transport in-jokes */
    "Mind The Gap", "Mind The Gap Please", "Stand Clear of the Doors",
    "This Train Terminates Here", "All Change", "All Change Please",
    "Alight Here For Nothing", "Interchange For Nowhere",
    "Not In Service", "Out of Service Depot", "Ghost Station",
    "Closed 1963", "Reopened 2019", "Closed Again 2021",
    "Beeching's Regret", "The Axe Fell Here", "Disused Platform 4",
    "Platform 9 and Some", "Platform Zero", "Platform Nine and Three Eighths",
    "Sidings and Sadness", "Turnback Siding", "Reversing Loop",
    "The Depot", "The Other Depot", "The Depot They Forgot",

    /* misc gems */
    "Red Bannana's Pivot North", "Bannana Sidings", "The Pivot",
    "Buttmmanshire East", "Buttmmanshire Parkway", "Old Buttmman",
    "The Pollacks Interchange", "Pollack Bay", "Lesser Pollacks",
    "Old Apple's Market", "New Apple's Market", "Apple's Market Bridge East",
    "Squelch", "Squelchford", "Squelch Bottom",
    "Curdle", "Curdle Magna", "Curdle Halt",
    "Fleshwick", "Fleshwick Sands", "Old Flesh",
    "Wamble", "Nether Wamble", "Wamble St Giles",
    "Loaf", "Big Loaf", "Loafminster", "Loaf End",
    "Crispsby", "Crispsby Docks", "Crisp Green",
    "Beigeington", "Adequate Green", "Fine I Suppose Halt",
    "Blandsworth Central", "Blandsworth Business Park",
    "Tinned Peaches", "Spam Junction", "Corned Beef Cross",
    "Angel Delight", "Arctic Roll Halt", "Viennetta Heights",
    "Findus Crispy Pancake", "Smash Potato Works",
    "Um Bongo Bridge", "Panda Pops Parkway", "Vimto Vale",
    "Irn Bru Border", "Tizer Terminus", "Dandelion and Burdock"
  ];

  return { city: city, lines: lines, stationCurated: stationCurated };
})();

/* --- Procedural name parts ------------------------------------------------
   Mixed and matched at runtime, so the generator never runs dry.
   prefix x core x suffix is already six figures of nonsense before the
   possessive forms get involved.
   ------------------------------------------------------------------------ */
METRO_NAMES.parts = {
  prefix: [
    "Great", "Little", "Nether", "Upper", "Lower", "Old", "New", "Steeple",
    "Long", "Broad", "Deep", "Far", "Middle", "Kings", "Bishops", "Abbots",
    "Monks", "Priors", "Temple", "Castle", "Church", "Chapel", "Market",
    "Stoke", "Ashby", "Chipping", "Thorpe", "Barton", "Compton", "Sutton",
    "Norton", "Weston", "Easton", "Milton", "Hinton", "Bourton", "Wootton",
    "Damp", "Moist", "Grim", "Bleak", "Vague", "Slightly", "Nearly",
    "Faintly", "Mildly", "Deeply", "Extremely", "Unnecessarily",
    "Sulking", "Weeping", "Wincing", "Gurning", "Muttering", "Sniffing",
    "Feral", "Rabid", "Confused", "Startled", "Hungover", "Reluctant"
  ],
  core: [
    "Wibble", "Wobble", "Doobly", "Bibbly", "Flimwell", "Squelch", "Curdle",
    "Wamble", "Prattle", "Mumble", "Grumble", "Bumble", "Fumble", "Trundle",
    "Snoring", "Sulking", "Piddle", "Puddle", "Muddle", "Waffle", "Dawdle",
    "Clag", "Sludge", "Grime", "Mildew", "Fungus", "Moss", "Bracken",
    "Thistle", "Nettle", "Bramble", "Gorse", "Heather", "Bogg", "Fenn",
    "Marrow", "Turnip", "Parsnip", "Swede", "Beetroot", "Rhubarb", "Kale",
    "Gravy", "Custard", "Crumpet", "Scone", "Bap", "Barm", "Cob", "Loaf",
    "Hogg", "Sow", "Bullock", "Heifer", "Ferret", "Badger", "Otter",
    "Weasel", "Stoat", "Vole", "Newt", "Toad", "Heron", "Grebe", "Coot",
    "Trouser", "Gusset", "Anorak", "Cardigan", "Wellington", "Bobble",
    "Kettle", "Teapot", "Sprocket", "Cogg", "Widget", "Flange", "Grommet",
    "Wallop", "Whallop", "Clout", "Thump", "Prod", "Poke", "Nudge",
    "Bottom", "Elbow", "Knuckle", "Ankle", "Shin", "Nostril", "Earlobe"
  ],
  suffix: [
    "ton", "ham", "wick", "thorpe", "by", "ford", "bridge", "borough",
    "bury", "worth", "field", "well", "combe", "dale", "den", "stead",
    "shire", "minster", "chester", "caster", "mouth", "port", "haven",
    "moor", "marsh", "fen", "heath", "wold", "hurst", "leigh", "ley",
    "cliffe", "beck", "thwaite", "garth", "royd", "clough", "brook"
  ],
  tail: [
    "", "", "", "", "", "", "", "",
    " Green", " Cross", " Halt", " Junction", " Parkway", " Bridge",
    " Central", " North", " South", " East", " West", " Bottom", " Top",
    " Magna", " Parva", " Regis", " St Giles", " St Mary", " End",
    " Sidings", " Interchange", " Gardens", " Common", " Fields", " Rise",
    " Vale", " Hollow", " Hill", " Bank", " Row", " Terrace", " Circus",
    " Broadway", " Embankment", " Wharf", " Quay", " Docks", " Works",
    " Colliery", " Mill", " Foundry", " Depot", " Retail Park",
    " Business Park", " Services", " Roundabout", " Bypass", " Ferry"
  ],
  /* Possessive constructions: "<owner>'s <thing>" */
  owner: [
    "Aunt Daniela", "Uncle Kev", "Nan", "Grandad", "Cousin Gary",
    "Our Sharon", "Auntie Val", "Big Dave", "Little Dave", "Wrong Dave",
    "The Vicar", "The Bishop", "The Abbot", "The Verger", "The Curate",
    "The Landlord", "The Butcher", "The Baker", "The Undertaker",
    "Mad Barbara", "Feral Colin", "Hungover Steve", "Damp Trevor",
    "Sir Nigel", "Lady Penelope", "The Duke", "The Earl", "The Marquess",
    "Old Apple", "Red Bannana", "The Widow", "The Milkman", "The Postman",
    "Doreen", "Maureen", "Noreen", "Beryl", "Enid", "Mavis", "Gladys",
    "Keith", "Terry", "Barry", "Gary", "Clive", "Roy", "Alan", "Graham",
    "A Man Called Trevor", "Somebody's Mother", "Everyone's Ex"
  ],
  thing: [
    "Elbow", "Knee", "Knuckle", "Regret", "Mistake", "Folly", "Shed",
    "Other Shed", "Allotment", "Greenhouse", "Compost Heap", "Bins",
    "Overdraft", "Divorce", "Alibi", "Boyfriend", "Gay Lover", "Third Wife",
    "Legal Situation", "Unexplained Boat", "Missing Ferret", "Bad Back",
    "Hip Replacement", "Conservatory", "Loft Conversion", "Pivot",
    "Market Bridge", "Big Idea", "Last Nerve", "Final Warning",
    "Second Opinion", "Sunday Roast", "Christmas Sherry", "Emergency Trifle",
    "Prize Marrow", "Vegetable Patch", "Ashes (Approximate)",
    "Enormous Dog", "Unreliable Van", "Caravan of Sorrow", "Lock-Up",
    "Cousin From Hull", "Slightly Illegal Fireworks", "Wheelie Bin"
  ],
  /* District / neighbourhood flavour, used for area labels */
  areaAdj: [
    "Old", "New", "Little", "Greater", "Lesser", "Inner", "Outer",
    "North", "South", "East", "West", "Central", "Upper", "Lower"
  ]
};

/* --- Newspaper headlines for the daily report ---------------------------- */
/* {CITY} {STATION} {LINE} {PAX} {NUM} are substituted at runtime. */
METRO_NAMES.headlines = [
  "{CITY} EVENING SPLUTTER: '{PAX} of us went somewhere yesterday'",
  "COUNCILLOR OPENS {STATION}, IMMEDIATELY REGRETS IT",
  "LOCAL MAN RIDES {LINE} FOR NO REASON, TWICE",
  "'IT'S FINE ACTUALLY': {CITY} STUNNED BY WORKING METRO",
  "{STATION} VOTED THIRD MOST ADEQUATE STATION IN THE BOROUGH",
  "PIGEON ELECTED HONORARY STATIONMASTER AT {STATION}",
  "{PAX} JOURNEYS MADE. NOBODY THANKED THE DRIVER.",
  "MYSTERY SMELL ON {LINE} 'PROBABLY NOTHING' SAYS OPERATOR",
  "TOURIST ASKS DIRECTIONS AT {STATION}, NEVER SEEN AGAIN",
  "{CITY} GAZETTE: 'THE METRO IS GOOD NOW' ADMITS LIFELONG CRITIC",
  "ESCALATOR AT {STATION} WORKS FOR ENTIRE DAY, CROWDS GATHER",
  "MAN COMPLETES {LINE} END TO END, WIFE UNIMPRESSED",
  "BUSKER AT {STATION} PLAYS WONDERWALL, {NUM} PEOPLE WEEP",
  "'WHERE IS EVERYONE GOING?' ASKS BAFFLED {CITY} PENSIONER",
  "{STATION} NAMED IN LOCAL POETRY COMPETITION, JUDGES DISQUALIFY IT",
  "LOST PROPERTY AT {STATION}: {NUM} UMBRELLAS, ONE ACCORDION",
  "{LINE} RUNS ON TIME, RESIDENTS SUSPICIOUS",
  "COUNCIL SPENDS BUDGET ON TRAINS, NOT ON THE ROUNDABOUT AGAIN",
  "SEAGULL BOARDS AT {STATION}, ALIGHTS THREE STOPS LATER",
  "{CITY} DECLARED 'SLIGHTLY LESS ANNOYING TO CROSS' BY VISITOR",
  "SCHOOLCHILDREN VISIT {STATION}, ASK WHY IT IS CALLED THAT",
  "'I NAMED IT AFTER MY AUNT' EXPLAINS TRANSPORT CHIEF",
  "{NUM} PEOPLE MISSED THEIR STOP ON {LINE} WHILE ON THEIR PHONES",
  "NEW BENCH INSTALLED AT {STATION}, IMMEDIATELY OCCUPIED BY GULL",
  "RUSH HOUR AT {STATION} DESCRIBED AS 'BRISK BUT SURVIVABLE'"
];

/* --- Daft daily events --------------------------------------------------- */
/* effect: ridership multiplier for the day. Mostly harmless. */
METRO_NAMES.events = [
  { text: "A swan has occupied Platform 2 at {STATION}. Staff are negotiating.", mult: 0.98 },
  { text: "Free sausage rolls at {STATION}. Everyone suddenly needs to go there.", mult: 1.06 },
  { text: "Someone left a sofa on the concourse at {STATION}. It is comfortable.", mult: 1.01 },
  { text: "Rain. Proper rain. Nobody wants to walk anywhere.", mult: 1.09 },
  { text: "Unseasonably lovely. Half the borough has decided to cycle.", mult: 0.91 },
  { text: "Roadworks on the ring road. The metro is suddenly everyone's friend.", mult: 1.12 },
  { text: "Local derby at the ground. Chaos, but profitable chaos.", mult: 1.14 },
  { text: "School inset day. Fewer small people on {LINE}.", mult: 0.95 },
  { text: "A busker at {STATION} has been playing the same song since dawn.", mult: 0.99 },
  { text: "{STATION} smells faintly of vinegar. Nobody can explain it.", mult: 0.98 },
  { text: "The council has issued a leaflet about the metro. It is mostly wrong.", mult: 1.02 },
  { text: "Pigeons have learned to use the ticket barriers at {STATION}.", mult: 1.0 },
  { text: "A film crew is at {STATION}. Everyone is walking very slowly.", mult: 0.97 },
  { text: "Market day. {LINE} is full of people carrying enormous bags.", mult: 1.07 },
  { text: "Bin strike. The streets are unwalkable. Ridership up.", mult: 1.08 },
  { text: "Someone proposed at {STATION}. She said 'here?'. He said 'yes'.", mult: 1.0 },
  { text: "Half the borough is watching the match at home. Quiet day.", mult: 0.9 },
  { text: "A ferret was found on {LINE}. It has been named and adopted.", mult: 1.0 },
  { text: "Fog. Nobody can find the bus stops. Metro to the rescue.", mult: 1.1 },
  { text: "The chip shop near {STATION} has reopened. This matters locally.", mult: 1.03 }
];
