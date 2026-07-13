/**
 * Curated activity ideas per destination. `soloTag`/`soloNote` explain why an
 * activity works when traveling alone (e.g. in town for work with a free
 * evening). Entries without them get category defaults from
 * `src/utils/suggestedExperiences.js`.
 */
const ACTIVITIES = {
  kyoto: [
    { id: 'kyoto-1', name: 'Nishiki Market Food Walk', price: 45, time: '10:00 AM', rating: 4.8, reviews: 312, cat: 'food', soloTag: 'Easy alone', soloNote: 'Graze stall to stall at your own pace — no table for one needed.' },
    { id: 'kyoto-2', name: 'Fushimi Inari Sunrise Hike', price: 0, time: '5:30 AM', rating: 4.9, reviews: 891, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Popular trail with steady foot traffic — plenty of solo hikers at dawn.' },
    { id: 'kyoto-3', name: 'Traditional Tea Ceremony', price: 35, time: '2:00 PM', rating: 4.7, reviews: 156, cat: 'culture', soloTag: 'Small group', soloNote: 'Seats are individual and hosts are used to solo guests.' },
    { id: 'kyoto-4', name: 'Gion District Night Walk', price: 28, time: '7:00 PM', rating: 4.6, reviews: 203, cat: 'tours', soloTag: 'Good after work', soloNote: 'Guided evening walk — sociable without any commitment.' },
    { id: 'kyoto-5', name: 'Sake Tasting Experience', price: 55, time: '4:00 PM', rating: 4.8, reviews: 178, cat: 'food', soloTag: 'Meet people', soloNote: 'A shared tasting counter makes conversation easy.' },
    { id: 'kyoto-6', name: 'Arashiyama Bamboo Grove Walk', price: 0, time: '8:00 AM', rating: 4.5, reviews: 1024, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Go early and wander freely — a perfect solo morning.' },
    { id: 'kyoto-7', name: 'Zen Meditation at Nanzen-ji', price: 20, time: '6:30 AM', rating: 4.9, reviews: 87, cat: 'wellness', soloTag: 'Easy alone', soloNote: 'Silent sitting — being solo is the point.' },
    { id: 'kyoto-8', name: 'Pontocho Alley Bar Hopping', price: 60, time: '8:30 PM', rating: 4.4, reviews: 142, cat: 'nightlife', soloTag: 'Meet people', soloNote: 'Tiny counter bars where solo drinkers are the norm.' },
  ],
  lisbon: [
    { id: 'lisbon-1', name: 'Pastéis de Belém & Tram 28', price: 32, time: '9:30 AM', rating: 4.7, reviews: 445, cat: 'food', soloTag: 'Easy alone', soloNote: 'Counter service and window seats — an ideal solo morning.' },
    { id: 'lisbon-2', name: 'Alfama Walking Tour', price: 18, time: '10:00 AM', rating: 4.8, reviews: 367, cat: 'tours', soloTag: 'Meet people', soloNote: 'Small walking group — easy to fall into conversation.' },
    { id: 'lisbon-3', name: 'Sintra Day Trip', price: 65, time: '8:00 AM', rating: 4.9, reviews: 512, cat: 'tours', soloTag: 'Small group', soloNote: 'Join a small-group day trip solo; the guide handles all logistics.' },
    { id: 'lisbon-4', name: 'Sunset at Miradouro da Graça', price: 0, time: '6:30 PM', rating: 4.6, reviews: 289, cat: 'outdoors', soloTag: 'Good after work', soloNote: 'Locals linger solo with a drink at the viewpoint kiosk.' },
    { id: 'lisbon-5', name: 'Fado Night in Mouraria', price: 40, time: '9:00 PM', rating: 4.8, reviews: 198, cat: 'nightlife', soloTag: 'Safe at night', soloNote: 'Intimate venue with shared tables — solo guests fit right in.' },
    { id: 'lisbon-6', name: 'Time Out Market Food Tour', price: 50, time: '12:00 PM', rating: 4.5, reviews: 321, cat: 'food', soloTag: 'Easy alone', soloNote: 'Communal tables built for eating alone without feeling it.' },
    { id: 'lisbon-7', name: 'Surf Lesson at Costa da Caparica', price: 45, time: '10:00 AM', rating: 4.7, reviews: 156, cat: 'outdoors', soloTag: 'Meet people', soloNote: 'Group lessons pair you up — instant surf buddies.' },
    { id: 'lisbon-8', name: 'Tile Workshop in Intendente', price: 38, time: '3:00 PM', rating: 4.6, reviews: 94, cat: 'culture', soloTag: 'Small group', soloNote: 'Hands-on class where everyone works their own piece.' },
  ],
  medellin: [
    { id: 'med-1', name: 'Comuna 13 Graffiti Tour', price: 22, time: '10:00 AM', rating: 4.9, reviews: 678, cat: 'tours', soloTag: 'Meet people', soloNote: 'Backpacker-favorite group tour — most people join alone.' },
    { id: 'med-2', name: 'Coffee Farm Day Trip', price: 55, time: '7:00 AM', rating: 4.8, reviews: 412, cat: 'food', soloTag: 'Small group', soloNote: 'Shared van and tastings — a safe way to leave the city solo.' },
    { id: 'med-3', name: 'Guatapé & El Peñol Rock', price: 45, time: '6:30 AM', rating: 4.9, reviews: 534, cat: 'outdoors', soloTag: 'Small group', soloNote: 'Full-day group trip that solo travelers dominate.' },
    { id: 'med-4', name: 'Salsa Dancing Class', price: 20, time: '7:00 PM', rating: 4.6, reviews: 189, cat: 'nightlife', soloTag: 'Meet people', soloNote: 'Partners rotate — coming alone is expected.' },
    { id: 'med-5', name: 'Botero Plaza & Downtown Walk', price: 0, time: '11:00 AM', rating: 4.5, reviews: 301, cat: 'culture', soloTag: 'Easy alone', soloNote: 'A daytime stroll through the plazas at your own pace.' },
    { id: 'med-6', name: 'Street Food Tour in El Poblado', price: 35, time: '5:00 PM', rating: 4.7, reviews: 223, cat: 'food', soloTag: 'Good after work', soloNote: 'Evening tasting walk in the city\u2019s liveliest, most walkable zone.' },
    { id: 'med-7', name: 'Paragliding over the Valley', price: 70, time: '9:00 AM', rating: 4.8, reviews: 167, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Tandem flights — every rider goes up one at a time anyway.' },
    { id: 'med-8', name: 'Yoga & Juice in Laureles', price: 15, time: '7:30 AM', rating: 4.5, reviews: 78, cat: 'wellness', soloTag: 'Easy alone', soloNote: 'Drop-in class with a friendly local-expat mix.' },
  ],
  florence: [
    { id: 'flo-1', name: 'Uffizi Gallery Skip-the-Line', price: 48, time: '9:00 AM', rating: 4.8, reviews: 892, cat: 'culture' },
    { id: 'flo-2', name: 'Tuscan Wine Tasting', price: 65, time: '3:00 PM', rating: 4.9, reviews: 345, cat: 'food' },
    { id: 'flo-3', name: 'Ponte Vecchio Sunset Walk', price: 0, time: '6:30 PM', rating: 4.6, reviews: 567, cat: 'outdoors' },
    { id: 'flo-4', name: 'Pasta Making Class', price: 55, time: '11:00 AM', rating: 4.9, reviews: 278, cat: 'food' },
    { id: 'flo-5', name: 'Duomo Climb & Rooftop Views', price: 30, time: '8:00 AM', rating: 4.7, reviews: 456, cat: 'tours' },
    { id: 'flo-6', name: 'Oltrarno Artisan Quarter Tour', price: 25, time: '2:00 PM', rating: 4.5, reviews: 134, cat: 'tours' },
    { id: 'flo-7', name: 'Aperitivo Crawl in Santo Spirito', price: 40, time: '7:30 PM', rating: 4.6, reviews: 201, cat: 'nightlife' },
    { id: 'flo-8', name: 'Piazzale Michelangelo Yoga', price: 18, time: '7:00 AM', rating: 4.4, reviews: 67, cat: 'wellness' },
  ],
  bangkok: [
    { id: 'bkk-1', name: 'Grand Palace & Wat Pho', price: 25, time: '8:30 AM', rating: 4.7, reviews: 1203, cat: 'culture' },
    { id: 'bkk-2', name: 'Chinatown Street Food Night', price: 30, time: '6:00 PM', rating: 4.8, reviews: 567, cat: 'food' },
    { id: 'bkk-3', name: 'Floating Market Day Trip', price: 40, time: '6:30 AM', rating: 4.5, reviews: 389, cat: 'tours' },
    { id: 'bkk-4', name: 'Rooftop Bar Crawl', price: 55, time: '8:00 PM', rating: 4.6, reviews: 234, cat: 'nightlife' },
    { id: 'bkk-5', name: 'Muay Thai Class', price: 35, time: '10:00 AM', rating: 4.7, reviews: 178, cat: 'outdoors' },
    { id: 'bkk-6', name: 'Thai Massage at Wat Pho School', price: 20, time: '2:00 PM', rating: 4.9, reviews: 445, cat: 'wellness' },
    { id: 'bkk-7', name: 'Khao San Road Night Walk', price: 0, time: '9:00 PM', rating: 4.3, reviews: 678, cat: 'nightlife' },
    { id: 'bkk-8', name: 'Cooking Class with Market Tour', price: 45, time: '9:00 AM', rating: 4.8, reviews: 312, cat: 'food' },
  ],
  'cape-town': [
    { id: 'ct-1', name: 'Table Mountain Hike', price: 0, time: '7:00 AM', rating: 4.9, reviews: 892, cat: 'outdoors', soloTag: 'Meet people', soloNote: 'Join a guided morning group — the smart way to hike it solo.' },
    { id: 'ct-2', name: 'Cape Peninsula & Cape Point', price: 75, time: '8:00 AM', rating: 4.8, reviews: 534, cat: 'tours', soloTag: 'Small group', soloNote: 'Coach day tour — easy, safe solo sightseeing.' },
    { id: 'ct-3', name: 'Bo-Kaap Walking Tour', price: 22, time: '10:00 AM', rating: 4.7, reviews: 267, cat: 'culture', soloTag: 'Small group', soloNote: 'Local guide, small circle, plenty of chat.' },
    { id: 'ct-4', name: 'Wine Tasting in Stellenbosch', price: 60, time: '10:30 AM', rating: 4.8, reviews: 345, cat: 'food', soloTag: 'Meet people', soloNote: 'Shared tasting tables make solo visits social.' },
    { id: 'ct-5', name: 'Shark Cage Diving', price: 120, time: '5:30 AM', rating: 4.6, reviews: 189, cat: 'outdoors', soloTag: 'Meet people', soloNote: 'Boat crews group everyone together — adrenaline bonds fast.' },
    { id: 'ct-6', name: 'V&A Waterfront Sunset Walk', price: 0, time: '5:30 PM', rating: 4.4, reviews: 456, cat: 'outdoors', soloTag: 'Safe at night', soloNote: 'Well-patrolled promenade, lively into the evening.' },
    { id: 'ct-7', name: 'Long Street Bar Hopping', price: 35, time: '8:00 PM', rating: 4.3, reviews: 198, cat: 'nightlife', soloTag: 'Meet people', soloNote: 'Hostel crowds make solo bar-hopping the default here.' },
    { id: 'ct-8', name: 'Township Food Experience', price: 40, time: '12:00 PM', rating: 4.7, reviews: 145, cat: 'food', soloTag: 'Small group', soloNote: 'Hosted meal with a guide — you go with the group, never alone.' },
  ],
  barcelona: [
    { id: 'bcn-1', name: 'Sagrada Família Skip-the-Line', price: 36, time: '9:00 AM', rating: 4.8, reviews: 1567, cat: 'culture', soloTag: 'Easy alone', soloNote: 'Audio-guided visit at exactly your own pace.' },
    { id: 'bcn-2', name: 'La Boqueria Market Tour', price: 42, time: '10:30 AM', rating: 4.7, reviews: 423, cat: 'food', soloTag: 'Easy alone', soloNote: 'Stand-up tapas counters welcome solo grazers.' },
    { id: 'bcn-3', name: 'Gothic Quarter Walking Tour', price: 15, time: '11:00 AM', rating: 4.6, reviews: 567, cat: 'tours', soloTag: 'Meet people', soloNote: 'Walking-tour format draws mostly solo travelers.' },
    { id: 'bcn-4', name: 'Barceloneta Beach & Chiringuito', price: 0, time: '1:00 PM', rating: 4.5, reviews: 345, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Beach bar culture is casual — a book and a drink is plenty.' },
    { id: 'bcn-5', name: 'Flamenco Show in El Born', price: 38, time: '8:30 PM', rating: 4.7, reviews: 289, cat: 'culture', soloTag: 'Good after work', soloNote: 'A seated show — the natural solo evening plan.' },
    { id: 'bcn-6', name: 'Tapas & Wine Evening', price: 55, time: '7:00 PM', rating: 4.8, reviews: 378, cat: 'food', soloTag: 'Meet people', soloNote: 'Guided tapas crawl with a shared table at every stop.' },
    { id: 'bcn-7', name: 'Park Güell Sunrise Visit', price: 10, time: '6:30 AM', rating: 4.9, reviews: 234, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Quiet ticketed entry before the crowds arrive.' },
    { id: 'bcn-8', name: 'El Raval Bar Crawl', price: 30, time: '10:00 PM', rating: 4.4, reviews: 167, cat: 'nightlife', soloTag: 'Meet people', soloNote: 'Organized crawl — designed for people who arrive alone.' },
  ],
  reykjavik: [
    { id: 'ryk-1', name: 'Golden Circle Day Tour', price: 85, time: '8:00 AM', rating: 4.9, reviews: 678, cat: 'tours', soloTag: 'Small group', soloNote: 'Coach tours are full of solo travelers — seatmates become company.' },
    { id: 'ryk-2', name: 'Blue Lagoon Spa', price: 75, time: '10:00 AM', rating: 4.7, reviews: 1234, cat: 'wellness', soloTag: 'Easy alone', soloNote: 'Soaking solo is completely normal here.' },
    { id: 'ryk-3', name: 'Northern Lights Hunt', price: 65, time: '9:00 PM', rating: 4.6, reviews: 345, cat: 'outdoors', soloTag: 'Safe at night', soloNote: 'Guided night tour — chase the sky safely with a group.' },
    { id: 'ryk-4', name: 'Whale Watching from Harbour', price: 70, time: '9:00 AM', rating: 4.5, reviews: 289, cat: 'outdoors', soloTag: 'Easy alone', soloNote: 'Deck rails and viewpoints — no group needed.' },
    { id: 'ryk-5', name: 'Glacier Hike on Sólheimajökull', price: 95, time: '7:30 AM', rating: 4.9, reviews: 201, cat: 'outdoors', soloTag: 'Small group', soloNote: 'Roped teams put you with others by design.' },
    { id: 'ryk-6', name: 'Hallgrímskirkja & City Walk', price: 0, time: '11:00 AM', rating: 4.4, reviews: 567, cat: 'culture', soloTag: 'Easy alone', soloNote: 'A compact, safe center made for solo wandering.' },
    { id: 'ryk-7', name: 'Icelandic Lamb & Craft Beer', price: 50, time: '7:00 PM', rating: 4.6, reviews: 145, cat: 'food', soloTag: 'Good after work', soloNote: 'Bar seating and chatty brewpubs suit dinner for one.' },
    { id: 'ryk-8', name: 'Snorkeling in Silfra Fissure', price: 130, time: '8:00 AM', rating: 4.8, reviews: 178, cat: 'outdoors', soloTag: 'Small group', soloNote: 'Guides buddy you up — solo bookings are standard.' },
  ],
  bali: [
    { id: 'bali-1', name: 'Tegallalang Rice Terrace Walk', price: 0, time: '7:00 AM', rating: 4.7, reviews: 567, cat: 'outdoors' },
    { id: 'bali-2', name: 'Ubud Monkey Forest Visit', price: 5, time: '9:00 AM', rating: 4.5, reviews: 789, cat: 'outdoors' },
    { id: 'bali-3', name: 'Balinese Cooking Class', price: 35, time: '9:30 AM', rating: 4.8, reviews: 312, cat: 'food' },
    { id: 'bali-4', name: 'Uluwatu Temple Sunset & Kecak', price: 20, time: '4:30 PM', rating: 4.9, reviews: 445, cat: 'culture' },
    { id: 'bali-5', name: 'Sunrise Hike on Mt. Batur', price: 50, time: '2:00 AM', rating: 4.8, reviews: 389, cat: 'outdoors' },
    { id: 'bali-6', name: 'Surf Lesson in Canggu', price: 30, time: '8:00 AM', rating: 4.6, reviews: 234, cat: 'outdoors' },
    { id: 'bali-7', name: 'Yoga Retreat in Ubud', price: 25, time: '7:00 AM', rating: 4.7, reviews: 178, cat: 'wellness' },
    { id: 'bali-8', name: 'Seminyak Beach Club Night', price: 40, time: '8:00 PM', rating: 4.4, reviews: 267, cat: 'nightlife' },
  ],
  marrakech: [
    { id: 'mrk-1', name: 'Jemaa el-Fnaa Evening Walk', price: 0, time: '6:00 PM', rating: 4.7, reviews: 678, cat: 'culture' },
    { id: 'mrk-2', name: 'Medina Souk & Spice Tour', price: 28, time: '10:00 AM', rating: 4.6, reviews: 345, cat: 'tours' },
    { id: 'mrk-3', name: 'Moroccan Cooking Class', price: 40, time: '11:00 AM', rating: 4.8, reviews: 234, cat: 'food' },
    { id: 'mrk-4', name: 'Hammam & Spa Experience', price: 45, time: '2:00 PM', rating: 4.7, reviews: 289, cat: 'wellness' },
    { id: 'mrk-5', name: 'Atlas Mountains Day Trip', price: 60, time: '7:00 AM', rating: 4.8, reviews: 201, cat: 'outdoors' },
    { id: 'mrk-6', name: 'Jardin Majorelle Visit', price: 14, time: '9:00 AM', rating: 4.5, reviews: 567, cat: 'culture' },
    { id: 'mrk-7', name: 'Rooftop Tagine Dinner', price: 35, time: '7:30 PM', rating: 4.6, reviews: 178, cat: 'food' },
    { id: 'mrk-8', name: 'Sahara Desert Overnight', price: 120, time: '6:00 AM', rating: 4.9, reviews: 156, cat: 'outdoors' },
  ],
  'new-york': [
    { id: 'nyc-1', name: 'Central Park Guided Bike Tour', price: 45, time: '9:00 AM', rating: 4.7, reviews: 567, cat: 'tours' },
    { id: 'nyc-2', name: 'Brooklyn Pizza Walk', price: 50, time: '12:00 PM', rating: 4.8, reviews: 389, cat: 'food' },
    { id: 'nyc-3', name: 'High Line & Chelsea Market', price: 0, time: '10:00 AM', rating: 4.6, reviews: 892, cat: 'outdoors' },
    { id: 'nyc-4', name: 'Broadway Show (TKTS Booth)', price: 80, time: '7:30 PM', rating: 4.9, reviews: 1234, cat: 'culture' },
    { id: 'nyc-5', name: 'Speakeasy Cocktail Tour', price: 65, time: '8:00 PM', rating: 4.7, reviews: 234, cat: 'nightlife' },
    { id: 'nyc-6', name: 'Statue of Liberty & Ellis Island', price: 25, time: '8:30 AM', rating: 4.5, reviews: 1567, cat: 'culture' },
    { id: 'nyc-7', name: 'Sunrise Yoga in Bryant Park', price: 0, time: '6:30 AM', rating: 4.4, reviews: 145, cat: 'wellness' },
    { id: 'nyc-8', name: 'Chinatown & Little Italy Food Tour', price: 55, time: '11:30 AM', rating: 4.6, reviews: 278, cat: 'food' },
  ],
  paris: [
    { id: 'par-1', name: 'Louvre Museum Highlights Tour', price: 55, time: '9:30 AM', rating: 4.8, reviews: 1234, cat: 'culture' },
    { id: 'par-2', name: 'Montmartre & Sacré-Cœur Walk', price: 0, time: '10:00 AM', rating: 4.7, reviews: 678, cat: 'tours' },
    { id: 'par-3', name: 'Seine River Dinner Cruise', price: 85, time: '8:00 PM', rating: 4.6, reviews: 345, cat: 'food' },
    { id: 'par-4', name: 'Croissant & Patisserie Tour', price: 45, time: '9:00 AM', rating: 4.9, reviews: 289, cat: 'food' },
    { id: 'par-5', name: 'Eiffel Tower Sunset Visit', price: 30, time: '6:00 PM', rating: 4.7, reviews: 1567, cat: 'culture' },
    { id: 'par-6', name: 'Le Marais Wine Bar Evening', price: 40, time: '7:30 PM', rating: 4.5, reviews: 201, cat: 'nightlife' },
    { id: 'par-7', name: 'Luxembourg Gardens Morning Jog', price: 0, time: '7:00 AM', rating: 4.3, reviews: 112, cat: 'wellness' },
    { id: 'par-8', name: 'Versailles Half-Day Trip', price: 70, time: '8:30 AM', rating: 4.8, reviews: 456, cat: 'tours' },
  ],
  'buenos-aires': [
    { id: 'ba-1', name: 'Tango Lesson in San Telmo', price: 25, time: '7:00 PM', rating: 4.8, reviews: 345, cat: 'culture' },
    { id: 'ba-2', name: 'Asado & Malbec Experience', price: 55, time: '12:30 PM', rating: 4.9, reviews: 267, cat: 'food' },
    { id: 'ba-3', name: 'La Boca & Caminito Walk', price: 0, time: '10:00 AM', rating: 4.5, reviews: 456, cat: 'tours' },
    { id: 'ba-4', name: 'Recoleta Cemetery Tour', price: 18, time: '11:00 AM', rating: 4.7, reviews: 312, cat: 'culture' },
    { id: 'ba-5', name: 'Palermo Soho Bar Crawl', price: 35, time: '10:00 PM', rating: 4.6, reviews: 189, cat: 'nightlife' },
    { id: 'ba-6', name: 'Empanada Making Class', price: 30, time: '3:00 PM', rating: 4.7, reviews: 145, cat: 'food' },
    { id: 'ba-7', name: 'Tigre Delta Boat Trip', price: 40, time: '9:00 AM', rating: 4.5, reviews: 201, cat: 'outdoors' },
    { id: 'ba-8', name: 'Milonga Dance Hall Night', price: 15, time: '11:00 PM', rating: 4.8, reviews: 134, cat: 'nightlife' },
  ],
  seoul: [
    { id: 'seoul-1', name: 'Gyeongbokgung Palace & Hanbok', price: 25, time: '9:00 AM', rating: 4.8, reviews: 567, cat: 'culture' },
    { id: 'seoul-2', name: 'Korean BBQ & Soju Night', price: 40, time: '7:00 PM', rating: 4.7, reviews: 389, cat: 'food' },
    { id: 'seoul-3', name: 'Bukchon Hanok Village Walk', price: 0, time: '10:00 AM', rating: 4.6, reviews: 456, cat: 'tours' },
    { id: 'seoul-4', name: 'Myeongdong Street Food Tour', price: 30, time: '5:00 PM', rating: 4.8, reviews: 312, cat: 'food' },
    { id: 'seoul-5', name: 'DMZ Border Tour', price: 70, time: '7:00 AM', rating: 4.7, reviews: 234, cat: 'tours' },
    { id: 'seoul-6', name: 'Hongdae Live Music Night', price: 15, time: '9:00 PM', rating: 4.5, reviews: 201, cat: 'nightlife' },
    { id: 'seoul-7', name: 'Jjimjilbang Spa Experience', price: 12, time: '2:00 PM', rating: 4.6, reviews: 278, cat: 'wellness' },
    { id: 'seoul-8', name: 'Namsan Tower Sunset Hike', price: 0, time: '4:30 PM', rating: 4.5, reviews: 345, cat: 'outdoors' },
  ],
  prague: [
    { id: 'prg-1', name: 'Prague Castle & St. Vitus', price: 22, time: '9:00 AM', rating: 4.8, reviews: 678, cat: 'culture' },
    { id: 'prg-2', name: 'Czech Beer Tasting Tour', price: 35, time: '4:00 PM', rating: 4.7, reviews: 345, cat: 'food' },
    { id: 'prg-3', name: 'Charles Bridge Sunrise Walk', price: 0, time: '5:30 AM', rating: 4.6, reviews: 456, cat: 'outdoors' },
    { id: 'prg-4', name: 'Old Town & Astronomical Clock', price: 15, time: '11:00 AM', rating: 4.5, reviews: 567, cat: 'tours' },
    { id: 'prg-5', name: 'Traditional Czech Dinner', price: 30, time: '7:00 PM', rating: 4.6, reviews: 234, cat: 'food' },
    { id: 'prg-6', name: 'Žižkov Bar Crawl', price: 28, time: '9:00 PM', rating: 4.4, reviews: 189, cat: 'nightlife' },
    { id: 'prg-7', name: 'Vltava River Kayaking', price: 40, time: '10:00 AM', rating: 4.7, reviews: 145, cat: 'outdoors' },
    { id: 'prg-8', name: 'Jewish Quarter History Tour', price: 20, time: '1:00 PM', rating: 4.8, reviews: 201, cat: 'culture' },
  ],
};

export function getActivitiesForDestination(destinationId) {
  return ACTIVITIES[destinationId] || [];
}

export function getDestinationIds() {
  return Object.keys(ACTIVITIES);
}

export default ACTIVITIES;
