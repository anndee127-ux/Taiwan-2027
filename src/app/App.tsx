import { useState, useEffect, useCallback } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import imgSunMoonLake from "@/imports/sun_moon_lake.jpg";
import imgAlishanRailway from "@/imports/Alishan_Forest_Railway.jpg";
import imgAlishanForest from "@/imports/Alishan_Ancient_Forest.jpg";
import imgYUYUPAS from "@/imports/YUYUPAS_Tsou_Village.jpg";
import imgFenqihu from "@/imports/Fenqihu_Old_Street.jpg";
import imgHinoki from "@/imports/Hinoki_Village.jpg";
import imgNanliao from "@/imports/Nanliao_Fish_Harbor.jpg";
import imgItaThao from "@/imports/Ita_Thao_Village.jpg";
import imgWenhuaNightMarket from "@/imports/Wenhua_Road_Night_Market.jpg";
import imgItaThaoMarket from "@/imports/Ita_Thao_Indigenous_Market.jpg";
import imgFenqihuBento from "@/imports/Fenqihu_Railway_Bento.jpg";
import imgNanliaoSeafood from "@/imports/Nanliao_Harbor_Seafood.jpg";
import imgDay1 from "@/imports/day_1_-_sun_moon_lake.jpg";
import imgDay2 from "@/imports/day_2_-_Formosan_Aboriginal_Culture_Village______.jpg";
import imgDay3 from "@/imports/day_3_-_YUYUPAS_Tsou_Village.jpg";
import imgDay4 from "@/imports/day_4_-_Alishan_Ancient_Forest.jpg";
import imgDay5 from "@/imports/day_5_-_Fenqihu_Old_Street.jpg";
import imgDay6 from "@/imports/day_6_-_chiayi_city.jpg";
import imgDay7 from "@/imports/day_7_-_Nanliao_Harbor_Seafood.jpg";
import imgDay8 from "@/imports/day_8_-_last_day.jpg";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, ChevronUp, MapPin, Clock, Car, ExternalLink,
  Navigation, Sun, Cloud, CloudRain, Star, Coffee,
  Utensils, Camera, Calendar, Mountain, Bike, Ship,
  Check, X, ArrowRight, Eye, ShoppingBag,
  Trees, Train, Compass, Users, Bed, Building2, Map, Globe
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" } as const;

// ─── data ────────────────────────────────────────────────────────────────────

interface TimeSlot { time: string; activity: string; notes: string; icon: string }
interface DayData {
  day: number; date: string; title: string; route: string;
  distance: string; driveTime: string; overnight: string;
  heroImage: string; localHeroImage: string; weather: { high: number; low: number; rain: number; icon: string };
  morning: TimeSlot; afternoon: TimeSlot; evening: TimeSlot;
  highlights: string[]; parking: string; tolls: string; fuel: string;
  warning: string | null; navDest: string | null;
}

// Weather based on historical April averages:
// Sun Moon Lake (750m): ~22°C / 15°C, ~40% rain
// Alishan (2200m): ~13°C / 7°C, ~55% rain, very misty
// Chiayi City: ~27°C / 19°C, ~30% rain
// Hsinchu: ~23°C / 18°C, ~45% rain
// Taoyuan/TPE area: ~24°C / 18°C, ~45% rain

const DAYS: DayData[] = [
  {
    day: 1, date: "Tue, 6 Apr", title: "Arrival & Sun Moon Lake",
    route: "TPE Airport → Sun Moon Lake", distance: "200 km", driveTime: "~3.5 hrs",
    overnight: "Sun Moon Lake", heroImage: "1650446781402-bc6d1a21a868", localHeroImage: imgDay1,
    weather: { high: 22, low: 15, rain: 40, icon: "cloud" },
    morning: { time: "14:00", activity: "Pick up rental cars at TPE Airport", notes: "2x 5-seater hybrid cars for 7 people. Pick up at 2 PM.", icon: "car" },
    afternoon: { time: "17:00", activity: "Drive via Highway No. 3 and No. 6 to Sun Moon Lake", notes: "Mountain roads begin after Puli. Stop at 埔里 Puli town for a rest.", icon: "car" },
    evening: { time: "19:00", activity: "Lakeside walk & dinner at Shuishe Pier 水社碼頭", notes: "Chill first day. Try grilled fish and aboriginal cuisine at the pier.", icon: "food" },
    highlights: ["Shuishe Pier sunset walk", "Aboriginal cuisine dinner", "Lakeside promenade stroll"],
    parking: "Hotel parking included", tolls: "~NTD 200–300 on freeway", fuel: "Fill up at Puli before mountain roads",
    warning: null, navDest: "Sun Moon Lake, Nantou, Taiwan",
  },
  {
    day: 2, date: "Wed, 7 Apr", title: "Sun Moon Lake Discovery",
    route: "Sun Moon Lake (full day)", distance: "Leisure day", driveTime: "Boat + cable car",
    overnight: "Sun Moon Lake", heroImage: "1637127250465-a0805ccabbd0", localHeroImage: imgDay2,
    weather: { high: 22, low: 15, rain: 40, icon: "cloud" },
    morning: { time: "09:00–10:00", activity: "Morning boat cruise to Ita Thao Village 伊達邵", notes: "Boats depart Shuishe pier every 30 min. Indigenous snacks and unique crafts.", icon: "ship" },
    afternoon: { time: "13:00", activity: "Formosan Aboriginal Culture Village 九族文化村", notes: "Huge attraction park with cable car. Plan the full afternoon here.", icon: "attraction" },
    evening: { time: "17:00", activity: "Optional: Cycling on the Shuishe lakeside bike path", notes: "Rent bikes near the pier if energy permits. The south section is most scenic.", icon: "bike" },
    highlights: ["Boat to Ita Thao indigenous village", "Formosan Aboriginal Culture Village", "Cable car views", "Optional lakeside cycling"],
    parking: "Hotel parking", tolls: "None", fuel: "N/A",
    warning: null, navDest: "Formosan Aboriginal Culture Village, Taiwan",
  },
  {
    day: 3, date: "Thu, 8 Apr", title: "Alpine Drive to Alishan",
    route: "Sun Moon Lake → YUYUPAS → Alishan", distance: "100 km", driveTime: "~2.5 hrs",
    overnight: "Alishan National Park", heroImage: "1611037114947-0b436af42ed9", localHeroImage: imgDay3,
    weather: { high: 16, low: 8, rain: 45, icon: "rain" },
    morning: { time: "09:00", activity: "YUYUPAS Tsou Tribal Village 優遊吧斯鄒族文化部落", notes: "Cultural musical performance, tea plantation tour, authentic tribal lunch.", icon: "attraction" },
    afternoon: { time: "13:00", activity: "Drive Highway 21 alpine pass toward Alishan", notes: "Optional stop at 89.5K observation deck for sea-of-clouds panorama.", icon: "car" },
    evening: { time: "16:30", activity: "Check in to Alishan National Park — Dafong Hotel", notes: "Very limited accommodation inside the park. Book 3–6 months in advance.", icon: "hotel" },
    highlights: ["Tsou tribal performance", "Alpine tea tasting", "Hwy 21 scenic drive", "89.5K observation deck (optional)"],
    parking: "YUYUPAS designated lots", tolls: "~NTD 100", fuel: "Fill up before ascending — limited stations",
    warning: "Mountain roads — fog and sharp bends. Drive slowly.", navDest: "Alishan National Park, Taiwan",
  },
  {
    day: 4, date: "Fri, 9 Apr", title: "Alishan Sunrise & Ancient Forests",
    route: "Alishan National Park (full day)", distance: "Walking day", driveTime: "Forest train",
    overnight: "Alishan National Park", heroImage: "1676565464401-7a5da1752a61", localHeroImage: imgDay4,
    weather: { high: 13, low: 7, rain: 55, icon: "rain" },
    morning: { time: "04:00", activity: "4:30 AM Forest Train to Zhushan sunrise platform", notes: "Book tickets in advance! Wear 4 layers — it is ~7°C at the summit.", icon: "train" },
    afternoon: { time: "10:00", activity: "Giant ancient cypress tree trails & Sister Ponds", notes: "Walk among 2,000-year-old trees. The mist through the ponds is magical.", icon: "forest" },
    evening: { time: "15:00", activity: "Alishan village, high-mountain tea & local souvenirs", notes: "Alishan high-mountain tea (高山茶) is world-famous. Buy some to take home.", icon: "tea" },
    highlights: ["Sea-of-clouds sunrise", "Ancient 2,000-yr cypress forest", "Sister Ponds in the mist", "High-mountain tea"],
    parking: "Inside accommodation", tolls: "None", fuel: "N/A",
    warning: "Very cold at dawn (4–7°C). Pack warm layers and rain gear.", navDest: null,
  },
  {
    day: 5, date: "Sat, 10 Apr", title: "Descent via Fenqihu to Chiayi",
    route: "Alishan → Fenqihu → Zhulu Deer Park → Chiayi City", distance: "75 km", driveTime: "~2 hrs",
    overnight: "Chiayi City", heroImage: "1603416547763-c637d96f5fef", localHeroImage: imgDay5,
    weather: { high: 27, low: 19, rain: 30, icon: "sun" },
    morning: { time: "09:00", activity: "Descend via scenic Highway 18 to Fenqihu", notes: "Pull-overs at every turn — tea plantations cascade down the slopes.", icon: "car" },
    afternoon: { time: "11:30", activity: "Fenqihu Old Street 奮起湖老街, Railway Bento & Cedar Boardwalk Trail", notes: "The famous railway bento box is a must. Fenqihu Cedar Boardwalk Trail — tranquil walk around tea plantations.", icon: "food" },
    evening: { time: "15:30", activity: "Zhulu Sika Deer Park + Wenhua Rd Night Market, Chiayi", notes: "Optional deer feeding at the sika deer park. Night market opens from 17:30.", icon: "attraction" },
    highlights: ["Fenqihu railway bento box", "Cedar boardwalk trail", "Sika deer park", "Wenhua Rd Night Market"],
    parking: "Fenqihu paid lot NTD 50. Chiayi city parking at hotel.", tolls: "None", fuel: "Fill up in Chiayi",
    warning: null, navDest: "Fenqihu Old Street, Chiayi, Taiwan",
  },
  {
    day: 6, date: "Sun, 11 Apr", title: "Chiayi City Culture Day",
    route: "Chiayi City + Taiping Old Street", distance: "~50 km", driveTime: "~1 hr",
    overnight: "Chiayi City", heroImage: "1698567045771-a22c872c26fa", localHeroImage: imgDay6,
    weather: { high: 27, low: 19, rain: 30, icon: "sun" },
    morning: { time: "09:00", activity: "Cafe hopping at Hinoki Village 檜意森活村", notes: "Japanese colonial-era cypress timber buildings, now artisan cafes and boutiques.", icon: "coffee" },
    afternoon: { time: "12:30", activity: "Consider driving to Taiping Old Street 太平老街", notes: "1 hour drive north. Famous red suspension bridge & old merchants' alley.", icon: "attraction" },
    evening: { time: "16:00", activity: "Plum Factory Tour 梅問屋梅子元氣館 + dinner", notes: "Unique plum product tasting. Souvenirs. Dinner at a local restaurant.", icon: "food" },
    highlights: ["Hinoki Village Japanese architecture", "Artisan coffee & crafts", "Taiping suspension bridge", "Plum factory tasting"],
    parking: "Hinoki Village free lot. Taiping roadside.", tolls: "None", fuel: "Fill up for long drive tomorrow",
    warning: null, navDest: "Taiping Old Street, Taiwan",
  },
  {
    day: 7, date: "Mon, 12 Apr", title: "Coastal Drive to Hsinchu",
    route: "Chiayi City → Hsinchu Nanliao Harbor", distance: "230 km", driveTime: "~3 hrs",
    overnight: "Hsinchu (Nanliao Harbor area)", heroImage: "1661262745110-c79b38317c5f", localHeroImage: imgDay7,
    weather: { high: 23, low: 18, rain: 45, icon: "cloud" },
    morning: { time: "09:00", activity: "Drive north on Freeway No. 1 toward Hsinchu", notes: "Long but easy highway drive. Stop for coffee at a service area.", icon: "car" },
    afternoon: { time: "13:00", activity: "Nanliao Fish Harbor & Fish Scale Staircase", notes: "The colourful mosaic fish scale staircase is iconic. Rent bikes for the 17km coastal path.", icon: "attraction" },
    evening: { time: "17:30", activity: "Fresh seafood dinner at Nanliao Harbor restaurants", notes: "Tiger prawns, stone crabs, and grilled squid. Sunset over the Taiwan Strait.", icon: "food" },
    highlights: ["Fish Scale Staircase photos", "17km coastal cycling path", "Taiwan Strait sunset", "Fresh harbor seafood"],
    parking: "Harbor free parking", tolls: "~NTD 300 freeway", fuel: "Fill up in Chiayi",
    warning: null, navDest: "Nanliao Fish Harbor, Hsinchu, Taiwan",
  },
  {
    day: 8, date: "Tue, 13 Apr", title: "Farewell Coast Drive",
    route: "Hsinchu → Xinwu Weirs → Yongan Harbor → TPE Airport", distance: "80 km", driveTime: "~1.5 hrs",
    overnight: "Flight home 🛫", heroImage: "1719130212747-0755c255b8a9", localHeroImage: imgDay8,
    weather: { high: 24, low: 18, rain: 45, icon: "cloud" },
    morning: { time: "09:00", activity: "Drive north on coastal Highway 61", notes: "Scenic road hugging the Taiwan Strait. Stop at Xinwu Stone Weirs 新屋石滬.", icon: "car" },
    afternoon: { time: "11:30", activity: "Yongan Fishing Harbor 永安漁港 — last seafood lunch", notes: "Colourful harbor and excellent fresh seafood. Optional if time permits: Taiwan Tobacco & Liquor Corporation Zhunan Brewery or Qiding Tunnels.", icon: "food" },
    evening: { time: "14:00", activity: "Fuyuan Peanut Butter + Gloria Outlets → Return car by 18:00", notes: "Flight departs 20:00. Return car by 18:00. Check in 2 hrs early at TPE.", icon: "shopping" },
    highlights: ["Xinwu Stone Weirs coastal walk", "Yongan Harbor final lunch", "Gloria Outlets souvenir shopping", "Fuyuan peanut butter"],
    parking: "Harbor free", tolls: "~NTD 150", fuel: "Fill up before returning car",
    warning: "⚠️ Return car by 18:00. Flight departs 20:00.", navDest: "Yongan Fishing Harbor, Taiwan",
  },
];

const ATTRACTIONS = [
  { id: 1, name: "Sun Moon Lake", nameZh: "日月潭", day: "Days 1–2", location: "Nantou County", localImage: imgSunMoonLake, description: "Taiwan's most iconic alpine lake with stunning mountain reflections, indigenous Thao culture, world-class cycling paths, and peaceful boat cruises.", hours: "24 hrs · Boat tours 07:00–17:00", duration: "Full day", parking: "Shuishe Visitor Center lot", category: "Nature", rating: 4.9, bestSpot: "Shuishe Pier at golden hour", mapsUrl: "https://maps.google.com/?q=Sun+Moon+Lake+Taiwan" },
  { id: 2, name: "Alishan Forest Railway", nameZh: "阿里山森林鐵路", day: "Day 4", location: "Alishan National Park", localImage: imgAlishanRailway, description: "Board the narrow-gauge forest train at 4:30 AM to reach the Zhushan sunrise platform and witness the legendary sea-of-clouds breaking over the mountains.", hours: "Forest train departs ~04:30", duration: "Half day (sunrise)", parking: "Inside park accommodation", category: "Iconic", rating: 5.0, bestSpot: "Zhushan platform at 05:15 AM", mapsUrl: "https://maps.google.com/?q=Alishan+Forest+Railway" },
  { id: 3, name: "Alishan Ancient Forest", nameZh: "阿里山神木群", day: "Day 4", location: "Alishan National Park", localImage: imgAlishanForest, description: "Walk among millennia-old sacred cypress trees, some over 2,000 years old, along misty boardwalk trails to the ethereal Sister Ponds.", hours: "07:00–17:00", duration: "3–4 hours", parking: "Alishan Village lot", category: "Nature", rating: 4.8, bestSpot: "Sister Ponds in the morning mist", mapsUrl: "https://maps.google.com/?q=Alishan+Giant+Trees" },
  { id: 4, name: "YUYUPAS Tsou Village", nameZh: "優遊吧斯鄒族文化部落", day: "Day 3", location: "Chiayi County, Hwy 21", localImage: imgYUYUPAS, description: "An immersive Tsou indigenous cultural experience with traditional music performances, highland tea plantation walks, and authentic tribal lunch.", hours: "09:00–17:00 daily", duration: "3–4 hours", parking: "Free on-site lot", category: "Culture", rating: 4.6, bestSpot: "Open-air performance stage", mapsUrl: "https://maps.google.com/?q=YUYUPAS+Tsou+Cultural+Village" },
  { id: 5, name: "Fenqihu Old Street", nameZh: "奮起湖老街", day: "Day 5", location: "Chiayi County", localImage: imgFenqihu, description: "A charming mountain railway town famous for its legendary bento box lunches, cedar boardwalk trail, and nostalgic old-time village atmosphere.", hours: "08:00–18:00", duration: "2–3 hours", parking: "Paid lot NTD 50/hr", category: "Heritage", rating: 4.5, bestSpot: "Cedar boardwalk at dawn", mapsUrl: "https://maps.google.com/?q=Fenqihu+Old+Street" },
  { id: 6, name: "Hinoki Village", nameZh: "檜意森活村", day: "Day 6", location: "Chiayi City", localImage: imgHinoki, description: "A beautifully preserved Japanese colonial-era cluster of cypress timber buildings, now transformed into specialty cafes, design boutiques, and cultural venues.", hours: "10:00–18:00 (Tue–Sun)", duration: "2–3 hours", parking: "Free adjacent lot", category: "Heritage", rating: 4.7, bestSpot: "Morning coffee in timber courtyard", mapsUrl: "https://maps.google.com/?q=Hinoki+Village+Chiayi" },
  { id: 7, name: "Nanliao Fish Harbor", nameZh: "南寮漁港", day: "Day 7", location: "Hsinchu City", localImage: imgNanliao, description: "A scenic fishing harbor with the famous photogenic fish scale mosaic staircase, a 17km flat coastal cycling path, and excellent sunset views over the Taiwan Strait.", hours: "24 hours", duration: "Half day", parking: "Free harbor lot", category: "Coast", rating: 4.4, bestSpot: "Fish Scale Staircase for sunrise photos", mapsUrl: "https://maps.google.com/?q=Nanliao+Harbor+Hsinchu" },
  { id: 8, name: "Ita Thao Village", nameZh: "伊達邵商店街", day: "Day 2", location: "Sun Moon Lake (by boat)", localImage: imgItaThao, description: "Accessible only by boat, this Thao indigenous village is the heart of Sun Moon Lake culture — with mochi, bamboo rice, wild boar sausages and traditional crafts.", hours: "09:00–18:00 · Boat every 30 min", duration: "2–3 hours", parking: "N/A — boat access only", category: "Culture", rating: 4.7, bestSpot: "The wooden pier as you arrive by boat", mapsUrl: "https://maps.google.com/?q=Ita+Thao+Sun+Moon+Lake" },
];

const FOODS = [
  { id: 1, name: "Wenhua Road Night Market", nameZh: "文化路夜市", location: "Chiayi City", localImage: imgWenhuaNightMarket, type: "Night Market", mustTry: ["Turkey rice 火雞肉飯", "Taro ball dessert", "Grilled corn", "Intestine noodle soup"], hours: "17:30 – 00:00 daily", day: "Day 5", mapsUrl: "https://maps.google.com/?q=Wenhua+Road+Night+Market+Chiayi" },
  { id: 2, name: "Ita Thao Indigenous Market", nameZh: "伊達邵商店街", location: "Sun Moon Lake", localImage: imgItaThaoMarket, type: "Indigenous Market", mustTry: ["Wild boar sausage", "Bamboo rice 竹筒飯", "Sun cakes", "Mochi variety"], hours: "09:00 – 18:00", day: "Day 2", mapsUrl: "https://maps.google.com/?q=Ita+Thao+Village+Market" },
  { id: 3, name: "Fenqihu Railway Bento", nameZh: "奮起湖鐵路便當", location: "Fenqihu Station, Chiayi", localImage: imgFenqihuBento, type: "Local Specialty", mustTry: ["Classic railway bento box", "Mountain wild boar rice", "Bamboo shoots", "Osmanthus tea"], hours: "08:00 – 17:00", day: "Day 5", mapsUrl: "https://maps.google.com/?q=Fenqihu+Station+Bento" },
  { id: 4, name: "Nanliao Harbor Seafood", nameZh: "南寮漁港海鮮", location: "Hsinchu Nanliao Harbor", localImage: imgNanliaoSeafood, type: "Seafood Restaurant", mustTry: ["Tiger prawns 老虎蝦", "Stone crab 石蟹", "Grilled squid 花枝", "Clear clam soup 蛤蜊湯"], hours: "11:00 – 21:00", day: "Day 7", mapsUrl: "https://maps.google.com/?q=Nanliao+Harbor+Seafood" },
];

const HOTELS = [
  { nights: 2, location: "Sun Moon Lake", checkIn: "15:00", checkOut: "11:00", image: "1650446781402-bc6d1a21a868", recommended: "Lalu Sun Moon Lake · Fleur de Chine · Sun Moon Lake Hotel", parking: "Included", tip: "Lakefront rooms sell out months ahead. Book ASAP.", days: "Days 1–2" },
  { nights: 2, location: "Alishan National Park", checkIn: "14:00", checkOut: "10:00", image: "1603416547763-c637d96f5fef", recommended: "Dafong Hotel 大豐山莊 (preferred) · Alishan House", parking: "Limited inside park", tip: "Only a handful of hotels inside the park. Book 3–6 months ahead.", days: "Days 3–4" },
  { nights: 2, location: "Chiayi City", checkIn: "15:00", checkOut: "11:00", image: "1698567045771-a22c872c26fa", recommended: "Howard Johnson Chiayi · Minn Hotel · Royal Hotel", parking: "Hotel lot or nearby", tip: "Plenty of options close to the night market.", days: "Days 5–6" },
  { nights: 1, location: "Hsinchu (Nanliao area)", checkIn: "15:00", checkOut: "10:00", image: "1661262745110-c79b38317c5f", recommended: "Sheraton Hsinchu · Ambassador Hotel Hsinchu", parking: "Hotel lot", tip: "Easy drive to TPE Airport next morning (~45 min).", days: "Day 7" },
];

const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: Compass },
  { id: "itinerary", label: "Itinerary", Icon: Calendar },
  { id: "map", label: "Map", Icon: Map },
  { id: "attractions", label: "Attractions", Icon: Eye },
  { id: "food", label: "Food", Icon: Utensils },
  { id: "hotels", label: "Hotels", Icon: Bed },
];

// ─── tiny reusable components ─────────────────────────────────────────────────

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "orange" | "grey" }) {
  const c = { blue: "bg-[#E8F0F7] text-[#1A6FA0]", green: "bg-[#E6F4ED] text-[#2E7D52]", orange: "bg-[#FEF0E6] text-[#F4841F]", grey: "bg-muted text-muted-foreground" }[color];
  return <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${c}`}>{children}</span>;
}

function WeatherWidget({ w }: { w: DayData["weather"] }) {
  const icons: Record<string, React.ReactNode> = {
    sun: <Sun size={16} className="text-[#F4841F]" />,
    cloud: <Cloud size={16} className="text-[#5C7285]" />,
    rain: <CloudRain size={16} className="text-[#1A6FA0]" />,
  };
  return (
    <div className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-2 text-sm">
      {icons[w.icon]}
      <span className="font-medium text-foreground">{w.high}°C</span>
      <span className="text-muted-foreground">{w.low}°C</span>
      <span className="text-[#1A6FA0] font-medium">{w.rain}% rain</span>
    </div>
  );
}

function GMapsButtons({ mapsUrl, navDest }: { mapsUrl?: string; navDest?: string | null }) {
  const navigateUrl = navDest
    ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(navDest)}`
    : null;

  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium bg-[#1A6FA0] text-white px-3 py-1.5 rounded-lg hover:bg-[#155d8a] transition-colors">
          <Navigation size={12} /> Open in Maps
        </a>
      )}
      {navigateUrl && (
        <a href={navigateUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors border border-border">
          <ExternalLink size={12} /> Navigate
        </a>
      )}
    </div>
  );
}

function SlotIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ReactNode> = {
    car: <Car size={14} />, ship: <Ship size={14} />, bike: <Bike size={14} />,
    train: <Train size={14} />, food: <Utensils size={14} />, attraction: <Eye size={14} />,
    hotel: <Bed size={14} />, coffee: <Coffee size={14} />, shopping: <ShoppingBag size={14} />,
    forest: <Trees size={14} />, tea: <Coffee size={14} />,
  };
  return <span className="text-[#1A6FA0]">{map[icon] ?? <MapPin size={14} />}</span>;
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-4
        bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#1A6FA0] font-bold text-lg tracking-wide" style={SERIF}>🇹🇼</span>
          <span className="font-semibold text-foreground text-sm tracking-wide">Taiwan 2027</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => onNav(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active === id ? "bg-[#1A6FA0] text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Badge color="green">6–13 Apr 2027</Badge>
          <Badge color="orange">7 Travellers</Badge>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => onNav(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${active === id ? "text-[#1A6FA0]" : "text-muted-foreground"}`}>
              <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

function HeroSection({ onExplore }: { onExplore: () => void }) {
  return (
    <section id="hero" className="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0a1520]">
        <img
          src={img("1676565464401-7a5da1752a61", 1920, 1200)}
          alt="Alishan forest train at sunrise"
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-none mb-4" style={SERIF}>
          Taiwan 2027
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25 }}
          className="text-xl sm:text-2xl text-white/80 mb-2 font-light" style={SERIF}>
          Sun Moon Lake · Alishan · Chiayi
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
          className="text-white/60 text-base mb-10">
          6 – 13 April 2027 · 8 Days · 7 People
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-10">
          {[["8", "Days"], ["7", "Travellers"], ["4", "Distinct Landmarks"]].map(([n, l]) => (
            <div key={l} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15">
              <div className="text-2xl font-bold text-white" style={SERIF}>{n}</div>
              <div className="text-xs text-white/60 mt-0.5 tracking-wide uppercase">{l}</div>
            </div>
          ))}
        </motion.div>

        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.7 }}
          onClick={onExplore}
          className="inline-flex items-center gap-3 bg-[#F4841F] hover:bg-[#e07318] text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#F4841F]/30">
          Start Exploring <ArrowRight size={18} />
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </motion.div>
    </section>
  );
}

// ─── OverviewSection ──────────────────────────────────────────────────────────

function OverviewSection() {
  const stages = [
    { days: "Days 1–2", area: "Sun Moon Lake", emoji: "🏔️", color: "#1A6FA0", desc: "Taiwan's most iconic alpine lake — boat cruises, cycling, and Thao indigenous culture." },
    { days: "Days 3–4", area: "Alishan", emoji: "🌲", color: "#2E7D52", desc: "Sacred mountain forests, ancient cypress trees, and the legendary sea-of-clouds sunrise." },
    { days: "Days 5–6", area: "Chiayi", emoji: "🏮", color: "#F4841F", desc: "Colonial heritage villages, night markets, and the famous railway bento box at Fenqihu." },
    { days: "Day 7", area: "Hsinchu Coast", emoji: "🌊", color: "#1A6FA0", desc: "Breezy coastal harbor, the fish scale staircase, and the best fresh seafood of the trip." },
  ];

  return (
    <section id="overview" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <Badge color="blue">Trip Overview</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Your Taiwan Journey</h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          8 days, 4 distinct regions, one unforgettable family adventure through the heart of Taiwan.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {stages.map((s) => (
          <motion.div key={s.area} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">{s.emoji}</div>
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1">{s.days}</div>
            <h3 className="text-lg font-bold text-foreground mb-2" style={SERIF}>{s.area}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            <div className="mt-3 h-1 rounded-full" style={{ background: s.color, width: "40%" }} />
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border p-6 md:p-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "🚗", tip: "Pick up 2x 5-seater hybrid cars at TPE Airport — confirm booking with car hire company." },
            { icon: "🏨", tip: "Alishan hotel availability is very limited. Book Dafong Hotel 3–6 months ahead." },
            { icon: "🚂", tip: "Alishan forest train tickets sell out fast. Pre-book online through the park website." },
          ].map((n, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#FEF0E6] rounded-xl p-3">
              <span className="text-lg">{n.icon}</span>
              <p className="text-xs text-[#7A3E00] leading-relaxed">{n.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DayCard ──────────────────────────────────────────────────────────────────

function DayCard({ d, open, onToggle }: { d: DayData; open: boolean; onToggle: () => void }) {

  return (
    <motion.div layout className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
      <button className="w-full text-left" onClick={onToggle}>
        <div className="relative h-48 overflow-hidden bg-[#1A2B3C]">
          <ImageWithFallback src={d.localHeroImage} alt={d.title} className="w-full h-full object-cover opacity-70 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block bg-[#F4841F] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">Day {d.day}</span>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight" style={SERIF}>{d.title}</h3>
                <p className="text-white/70 text-sm mt-1">{d.date}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 mt-1 text-white">
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <MapPin size={12} />{d.route}
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <Car size={12} />{d.distance} · {d.driveTime}
              </div>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }} className="overflow-hidden">
            <div className="p-5 md:p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <WeatherWidget w={d.weather} />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Bed size={14} />
                  <span>Overnight: <strong className="text-foreground">{d.overnight}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Schedule</h4>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  {[
                    { label: "Morning", data: d.morning },
                    { label: "Afternoon", data: d.afternoon },
                    { label: "Evening", data: d.evening },
                  ].map(({ label, data }) => (
                    <div key={label} className="flex gap-4 pb-6 last:pb-0">
                      <div className="relative z-10 flex-shrink-0 w-10 h-10 bg-[#E8F0F7] rounded-xl flex items-center justify-center border-2 border-white shadow-sm">
                        <SlotIcon icon={data.icon} />
                      </div>
                      <div className="pt-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#F4841F] bg-[#FEF0E6] px-2 py-0.5 rounded-md">{data.time}</span>
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <p className="font-medium text-foreground text-sm mb-1">{data.activity}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{data.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Day Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {d.highlights.map((h) => (
                    <span key={h} className="flex items-center gap-1.5 text-xs bg-[#E8F4ED] text-[#2E7D52] font-medium px-3 py-1.5 rounded-full">
                      <Star size={10} />{h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Parking", value: d.parking, icon: <Car size={14} /> },
                  { label: "Tolls", value: d.tolls, icon: <Globe size={14} /> },
                  { label: "Fuel", value: d.fuel, icon: <Mountain size={14} /> },
                ].map((info) => (
                  <div key={info.label} className="bg-secondary rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">{info.icon}{info.label}</div>
                    <p className="text-sm font-medium text-foreground leading-tight">{info.value}</p>
                  </div>
                ))}
              </div>

              {d.warning && (
                <div className="bg-[#FEF0E6] border border-[#F4841F]/20 rounded-xl p-3 text-sm text-[#7A3E00]">
                  {d.warning}
                </div>
              )}

              {d.navDest && (
                <div className="border-t border-border pt-4">
                  <GMapsButtons navDest={d.navDest} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItinerarySection() {
  const [openDay, setOpenDay] = useState<number>(1);
  return (
    <section id="itinerary" className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <Badge color="green">Day by Day</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>8-Day Itinerary</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Tap any day to expand the full schedule with activities, driving info, and maps.</p>
      </div>
      <div className="space-y-4">
        {DAYS.map((d) => (
          <DayCard key={d.day} d={d} open={openDay === d.day}
            onToggle={() => setOpenDay(openDay === d.day ? 0 : d.day)} />
        ))}
      </div>
    </section>
  );
}

// ─── StopCard (used inside MapSection) ───────────────────────────────────────

function StopCard({ id, color, badge, badgeColor, label, sub, hoveredStop, setHoveredStop, destinations }: {
  id: number; color: string; badge: string; badgeColor: "blue" | "green" | "orange" | "grey";
  label: string; sub: string;
  hoveredStop: number | null; setHoveredStop: (id: number | null) => void;
  destinations: { label: string; dest: string }[];
}) {
  return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
      onMouseEnter={() => setHoveredStop(id)} onMouseLeave={() => setHoveredStop(null)}
      className={`bg-card rounded-2xl border p-4 transition-all ${hoveredStop === id ? "border-[#1A6FA0] shadow-md" : "border-border shadow-sm"}`}>
      <div className="flex items-start gap-3">
        <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className="font-semibold text-foreground text-sm">{label}</h4>
            <Badge color={badgeColor}>{badge}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{sub}</p>
          {destinations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {destinations.map((d) => (
                <a key={d.dest} href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(d.dest)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors border border-border">
                  <ExternalLink size={11} /> {d.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MapSection ───────────────────────────────────────────────────────────────

function MapSection() {
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  const stops = [
    { id: 0, label: "TPE Airport", sub: "Taoyuan", cx: 82, cy: 55, day: "Day 1 Start", color: "#1A6FA0" },
    { id: 1, label: "Sun Moon Lake", sub: "Nantou", cx: 135, cy: 195, day: "Days 1–2", color: "#2E7D52" },
    { id: 2, label: "YUYUPAS", sub: "Chiayi County", cx: 142, cy: 248, day: "Day 3", color: "#F4841F" },
    { id: 3, label: "Alishan", sub: "Chiayi County", cx: 148, cy: 268, day: "Days 3–4", color: "#2E7D52" },
    { id: 4, label: "Chiayi City", sub: "Chiayi", cx: 100, cy: 298, day: "Days 5–6", color: "#F4841F" },
    { id: 5, label: "Hsinchu Coast", sub: "Hsinchu", cx: 58, cy: 115, day: "Day 7", color: "#1A6FA0" },
  ];

  const routePath = stops.reduce((acc, s, i) => i === 0 ? `M ${s.cx} ${s.cy}` : `${acc} L ${s.cx} ${s.cy}`, "");
  const fullPath = `${routePath} L ${stops[0].cx} ${stops[0].cy}`;

  return (
    <section id="map" className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <Badge color="blue">Self-Drive Route</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>The Full Journey</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">~680 km across 8 days through central and western Taiwan.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 bg-card rounded-3xl border border-border p-4 shadow-sm">
            <svg viewBox="0 0 250 430" className="w-full max-w-xs mx-auto" style={{ minHeight: 380 }}>
              <path d="M 105,8 C 125,5 148,12 163,24 C 193,40 218,65 228,95 C 238,120 241,148 237,178 C 232,208 225,235 218,262 C 210,298 200,330 182,360 C 165,385 145,405 126,415 C 110,420 93,415 78,406 C 60,394 45,372 36,348 C 25,320 20,292 21,263 C 22,234 26,206 34,180 C 43,150 52,122 66,97 C 80,70 92,42 105,8 Z"
                fill="#E8F0F7" stroke="#C5D8EA" strokeWidth="1.5" />
              {[100, 200, 300].map(y => <line key={y} x1="20" y1={y} x2="240" y2={y} stroke="#DDE6EE" strokeWidth="0.5" strokeDasharray="3,5" />)}
              {[80, 140, 200].map(x => <line key={x} x1={x} y1="20" x2={x} y2="410" stroke="#DDE6EE" strokeWidth="0.5" strokeDasharray="3,5" />)}
              <path d={fullPath} fill="none" stroke="#1A6FA0" strokeWidth="2" strokeDasharray="6,4" strokeLinecap="round" opacity="0.7" />
              {stops.map((s) => (
                <g key={s.id} onMouseEnter={() => setHoveredStop(s.id)} onMouseLeave={() => setHoveredStop(null)} style={{ cursor: "pointer" }}>
                  <circle cx={s.cx} cy={s.cy} r={hoveredStop === s.id ? 12 : 9}
                    fill={s.color} opacity={hoveredStop === s.id ? 1 : 0.85}
                    stroke="white" strokeWidth="2.5" style={{ transition: "r 0.2s ease" }} />
                  <circle cx={s.cx} cy={s.cy} r={5} fill="white" />
                  <text x={s.cx + 13} y={s.cy + 1} fontSize="8.5" fill="#1A2B3C" fontWeight="600" fontFamily="DM Sans, sans-serif">{s.label}</text>
                  <text x={s.cx + 13} y={s.cy + 10} fontSize="7" fill="#5C7285" fontFamily="DM Sans, sans-serif">{s.sub}</text>
                </g>
              ))}
              <text x="125" y="425" textAnchor="middle" fontSize="8" fill="#5C7285" fontFamily="DM Sans, sans-serif">Taiwan Island · Self-Drive Route 2027</text>
            </svg>
          </div>

          <div className="flex-1 space-y-3">
            {/* Day 0 — TPE Airport */}
            <StopCard id={0} color="#1A6FA0" badge="Day 0" badgeColor="blue"
              label="TPE Taoyuan Airport" sub="Taoyuan International Airport"
              hoveredStop={hoveredStop} setHoveredStop={setHoveredStop}
              destinations={[]} />

            {/* Days 1–2 — Sun Moon Lake */}
            <StopCard id={1} color="#2E7D52" badge="Days 1–2" badgeColor="green"
              label="Sun Moon Lake" sub="Ita Thao Street · Shuishe Pier"
              hoveredStop={hoveredStop} setHoveredStop={setHoveredStop}
              destinations={[{ label: "Navigate to Sun Moon Lake", dest: "Sun Moon Lake, Nantou, Taiwan" }]} />

            {/* Days 3–4 — YUYUPAS + Alishan */}
            <StopCard id={2} color="#F4841F" badge="Days 3–4" badgeColor="orange"
              label="YUYUPAS & Alishan" sub="Tsou Tribal Village · Alishan National Park"
              hoveredStop={hoveredStop} setHoveredStop={setHoveredStop}
              destinations={[
                { label: "Navigate to YUYUPAS", dest: "YUYUPAS Tsou Cultural Village, Chiayi, Taiwan" },
                { label: "Navigate to Alishan", dest: "Alishan National Park, Taiwan" },
              ]} />

            {/* Days 5–6 — Fenqihu + Chiayi */}
            <StopCard id={3} color="#F4841F" badge="Days 5–6" badgeColor="orange"
              label="Fenqihu & Chiayi City" sub="Fenqihu Old Street · Hinoki Village · Taiping Old Street"
              hoveredStop={hoveredStop} setHoveredStop={setHoveredStop}
              destinations={[
                { label: "Navigate to Fenqihu Old Street", dest: "Fenqihu Old Street, Chiayi, Taiwan" },
                { label: "Navigate to Chiayi City", dest: "Hinoki Village, Chiayi City, Taiwan" },
              ]} />

            {/* Days 7–8 — Hsinchu + Yongan */}
            <StopCard id={4} color="#1A6FA0" badge="Days 7–8" badgeColor="blue"
              label="Hsinchu Coast & Yongan Harbor" sub="Nanliao Fish Harbor · Yongan Fishing Harbour"
              hoveredStop={hoveredStop} setHoveredStop={setHoveredStop}
              destinations={[
                { label: "Navigate to Hsinchu Coast", dest: "Nanliao Fish Harbor, Hsinchu, Taiwan" },
                { label: "Navigate to Yongan Harbor", dest: "Yongan Fishing Harbor, Taiwan" },
              ]} />

            {/* Driving summary */}
            <div className="bg-secondary rounded-2xl p-4 mt-2">
              <h4 className="font-semibold text-foreground text-sm mb-3">Driving Summary</h4>
              <div className="space-y-2">
                {[
                  { route: "TPE → Sun Moon Lake", km: "~200 km", time: "3.5 hrs" },
                  { route: "SML → Alishan (via Hwy 21)", km: "~100 km", time: "2.5 hrs" },
                  { route: "Alishan → Chiayi City", km: "~75 km", time: "2 hrs" },
                  { route: "Chiayi → Hsinchu Coast", km: "~180 km", time: "2.5 hrs" },
                  { route: "Hsinchu → TPE Airport", km: "~80 km", time: "1.5 hrs" },
                ].map((r) => (
                  <div key={r.route} className="flex items-center justify-between text-xs">
                    <span className="text-foreground flex items-center gap-1.5"><Car size={11} className="text-[#1A6FA0]" />{r.route}</span>
                    <span className="text-muted-foreground font-medium">{r.km} · {r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AttractionsSection ───────────────────────────────────────────────────────

function AttractionCard({ a }: { a: typeof ATTRACTIONS[number] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-44 overflow-hidden bg-[#1A2B3C]">
        <ImageWithFallback src={a.localImage} alt={a.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <Badge color={a.category === "Nature" ? "green" : a.category === "Iconic" ? "orange" : "blue"}>{a.category}</Badge>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <Star size={10} fill="currentColor" /> {a.rating}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="font-bold text-foreground" style={SERIF}>{a.name}</h3>
            <p className="text-xs text-muted-foreground">{a.nameZh}</p>
          </div>
          <Badge color="grey">{a.day}</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-2">
          <MapPin size={11} /> {a.location}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{a.description}</p>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#1A6FA0] font-medium flex items-center gap-1 mb-2">
          {expanded ? <><ChevronUp size={12} /> Less info</> : <><ChevronDown size={12} /> More info</>}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="space-y-2 text-xs mb-3">
                {[
                  { icon: <Clock size={11} />, label: "Hours", val: a.hours },
                  { icon: <Eye size={11} />, label: "Duration", val: a.duration },
                  { icon: <Car size={11} />, label: "Parking", val: a.parking },
                  { icon: <Camera size={11} />, label: "Best Spot", val: a.bestSpot },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-0.5 flex-shrink-0 text-[#1A6FA0]">{row.icon}</span>
                    <span><span className="font-medium text-foreground">{row.label}:</span> {row.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <GMapsButtons mapsUrl={a.mapsUrl} />
      </div>
    </motion.div>
  );
}

function AttractionsSection() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Nature", "Iconic", "Culture", "Heritage", "Coast"];
  const filtered = filter === "All" ? ATTRACTIONS : ATTRACTIONS.filter(a => a.category === filter);
  return (
    <section id="attractions" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <Badge color="green">Along the Route</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Attractions</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Every site on your itinerary — with photos, hours, parking, and navigation.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === c ? "bg-[#1A6FA0] text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(a => <AttractionCard key={a.id} a={a} />)}
      </div>
    </section>
  );
}

// ─── FoodSection ──────────────────────────────────────────────────────────────

function FoodSection() {
  const cafes = [
    { name: "Cafe 53", location: "Sun Moon Lake", type: "☕ Cafe", desc: "Lakefront cafe with stunning views and excellent Taiwanese coffee.", day: "Day 2" },
    { name: "Alishan High-Mountain Tea House", location: "Alishan Village", type: "🍵 Tea House", desc: "Sample world-renowned Alishan 高山茶 in the misty park village.", day: "Day 4" },
    { name: "Hinoki Specialty Cafe", location: "Chiayi City", type: "☕ Artisan Cafe", desc: "Japanese-era timber building with specialty pour-over and pastries.", day: "Day 6" },
    { name: "Bubble Tea Row", location: "Chiayi City", type: "🧋 Bubble Tea", desc: "Try Yi Fang fruit teas and classic milk teas in the city centre.", day: "Day 5–6" },
  ];

  return (
    <section id="food" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <Badge color="orange">Eat Your Way Through Taiwan</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Food Discovery</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Night markets, indigenous feasts, railway bentos, and fresh harbor seafood.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {FOODS.map(f => (
          <motion.div key={f.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group">
            <div className="relative h-40 overflow-hidden bg-[#1A2B3C]">
              <ImageWithFallback src={f.localImage} alt={f.name}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <Badge color="orange">{f.type}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-foreground text-sm mb-0.5" style={SERIF}>{f.name}</h3>
              <p className="text-xs text-muted-foreground mb-0.5">{f.nameZh}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin size={10} />{f.location} · {f.day}
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-foreground mb-1.5">Must-try:</p>
                <div className="space-y-0.5">
                  {f.mustTry.map(item => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[#F4841F]">•</span> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Clock size={10} /> {f.hours}
              </div>
              <GMapsButtons mapsUrl={f.mapsUrl} />
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-5" style={SERIF}>Hidden Cafes & Tea Houses</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cafes.map(c => (
            <div key={c.name} className="bg-card rounded-2xl border border-border p-4">
              <div className="text-xs font-medium text-[#F4841F] mb-1">{c.type}</div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{c.name}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin size={10} /> {c.location} · <Badge color="grey">{c.day}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HotelsSection ────────────────────────────────────────────────────────────

function HotelsSection() {
  return (
    <section id="hotels" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <Badge color="blue">Accommodation</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Where We Stay</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Hotels are yet to be confirmed — bookings TBC. Recommendations included for each stop.</p>
        <div className="inline-flex items-center gap-2 bg-[#FEF0E6] text-[#7A3E00] text-sm font-medium px-4 py-2 rounded-xl mt-3">
          <Building2 size={15} /> {"All hotels are TBC — confirm bookings before the trip"}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {HOTELS.map((h) => (
          <motion.div key={h.location} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="relative h-40 bg-[#1A2B3C] overflow-hidden">
              <img src={img(h.image, 500, 300)} alt={h.location} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <Badge color="orange">TBC</Badge>
                  <span className="text-white/70 text-xs">{h.nights} {h.nights === 1 ? "night" : "nights"}</span>
                </div>
                <h3 className="text-white font-bold mt-1 text-sm" style={SERIF}>{h.location}</h3>
              </div>
            </div>
            <div className="p-4">
              <Badge color="grey">{h.days}</Badge>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={11} className="text-[#1A6FA0]" />
                  Check-in {h.checkIn} · Check-out {h.checkOut}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Car size={11} className="text-[#1A6FA0]" />
                  Parking: {h.parking}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1">Recommended options:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.recommended}</p>
              </div>
              <div className="mt-3 bg-[#FEF0E6] rounded-xl p-2.5 text-xs text-[#7A3E00]">
                💡 {h.tip}
              </div>
              <GMapsButtons navDest={`Hotel in ${h.location} Taiwan`} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-4 md:px-8 text-center">
      <p className="text-3xl mb-3">🇹🇼</p>
      <h3 className="text-lg font-bold text-foreground mb-1" style={SERIF}>Taiwan 2027 · Family Edition</h3>
      <p className="text-muted-foreground text-sm">6 – 13 April · 7 travellers · Sun Moon Lake · Alishan · Chiayi · Hsinchu</p>
      <p className="text-muted-foreground text-xs mt-4">Have an amazing trip! 旅途愉快！</p>
    </footer>
  );
}

// ─── ScrollProgress ───────────────────────────────────────────────────────────

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none">
      <div className="h-full bg-[#F4841F] transition-all duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(id);
    }
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map(n => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar active={activeSection} onNav={scrollTo} />
      <ScrollProgress />
      <HeroSection onExplore={() => scrollTo("overview")} />
      <main className="pb-24 md:pb-0">
        <OverviewSection />
        <ItinerarySection />
        <MapSection />
        <AttractionsSection />
        <FoodSection />
        <HotelsSection />
        <Footer />
      </main>
    </div>
  );
}
