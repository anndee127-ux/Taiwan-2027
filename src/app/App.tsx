import { useState, useEffect, useCallback } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import {
  WeatherForecast,
  type HistoricalClimate,
  type WeatherLocation,
} from "@/app/components/WeatherForecast";
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
import imgFuliHotel from "@/imports/fuli_hot_spring_resort_sunmoonlake.jpg";
import imgDafengHotel from "@/imports/dafeng_hotel_alishan_park.jpg";
import imgMaisonHotel from "@/imports/maison_de_chine_hotel_chiayi_city.jpg";
import imgDarlonHotel from "@/imports/darlon_hotel_hsinchu_city.jpg";
import imgDay4Sunrise from "@/imports/day4_sunrise.jpg";
import imgDay4Breakfast from "@/imports/day4_breakfast.jpg";
import imgDay4AlishanToZhaoping from "@/imports/day4_alishan_to_zhaoping.jpg";
import imgDay4SisterPonds from "@/imports/day4_sister_ponds.jpg";
import imgDay4ShouzhenTemple from "@/imports/day4_shouzhen_temple.jpg";
import imgDay4GiantTrees from "@/imports/day4_giant_trees.jpg";
import imgDay4ShenmuToAlishan from "@/imports/day4_shenmu_to_alishan.jpg";
import imgDay4AlishanVillage from "@/imports/day4_alishan_village.jpg";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, ChevronUp, MapPin, Clock, Car, ExternalLink,
  Navigation, Star, Coffee,
  Utensils, Camera, Calendar, Mountain, Bike, Ship,
  Check, X, ArrowRight, Eye, ShoppingBag,
  Trees, Train, Compass, Users, Bed, Building2, Map, Globe, Plane
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

// ─── helpers ─────────────────────────────────────────────────────────────────

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" } as const;

// ─── data ────────────────────────────────────────────────────────────────────

interface TimeSlot { time: string; activity: string; notes: string; icon: string; label?: string }
interface RouteStop { time: string; name: string; notes: string; mapsUrl?: string; label: string; icon: string }
interface DayActivity {
  name: string; notes: string; icon: string;
  duration?: string; optional?: boolean; badge?: string; mapsUrl?: string;
  mapLinks?: { label: string; url: string }[];
}
interface DayPlan { name: string; description: string; activities: DayActivity[] }
interface DetailedActivity {
  time: string; label: string; name: string; details: string[];
  facts?: string[]; badge?: string; image?: string;
}
type JourneyFilter = "all" | "days12" | "days34" | "days56" | "days78";
type JourneyColor = "blue" | "green" | "orange";
type RouteStyle = "highway" | "mountain" | "coastal" | "local";
interface ItineraryMapStop {
  id: string;
  sequence: number;
  label: string;
  location: string;
  description: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  textAnchor: "start" | "end";
  dayLabel: string;
  group: Exclude<JourneyFilter, "all">;
  color: JourneyColor;
  routeStyle?: RouteStyle;
  navDest?: string;
  optional?: boolean;
  overnight?: string;
  plan?: "Plan A" | "Plan B";
}
interface DayData {
  day: number; date: string; title: string; route: string;
  distance: string; driveTime: string; overnight: string;
  heroImage: string; localHeroImage: string; weather: HistoricalClimate;
  weatherLocation: WeatherLocation;
  morning?: TimeSlot; afternoon?: TimeSlot; evening?: TimeSlot;
  routeStops?: RouteStop[];
  flexibleActivities?: DayActivity[];
  linearActivities?: DayActivity[];
  plans?: DayPlan[];
  detailedSchedule?: DetailedActivity[];
  mapStops?: ItineraryMapStop[];
  departureDay?: boolean;
  highlights: string[]; parking: string; tolls: string; fuel: string;
  warning: string | null; navDest: string | null;
}

type PlanSelections = Record<number, "Plan A" | "Plan B">;
const DEFAULT_PLAN_SELECTIONS: PlanSelections = { 2: "Plan A", 3: "Plan A", 8: "Plan A" };

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
    weatherLocation: { destination: "Sun Moon Lake", travelDate: "2027-04-06", latitude: 23.8681, longitude: 120.9087, timezone: "Asia/Taipei" },
    morning: { time: "14:00", activity: "Pick up rental cars at TPE Airport", notes: "2x 5-seater hybrid cars for 7 people. Pick up at 2 PM.", icon: "car", label: "Afternoon" },
    afternoon: { time: "15:00", activity: "Drive via Highway No. 3 and No. 6 to Sun Moon Lake", notes: "Mountain roads begin after Puli.", icon: "car", label: "Late afternoon" },
    routeStops: [
      { time: "En route", name: "西湖服務區 (南下)", notes: "First southbound rest stop on the drive from TPE Airport.", mapsUrl: "https://maps.app.goo.gl/DLVMEAchk2wKjWXk7", label: "Pit stop", icon: "car" },
      { time: "En route", name: "東草屯休息站", notes: "Second rest stop before continuing toward Sun Moon Lake.", mapsUrl: "https://maps.app.goo.gl/AJnaJYyj2EsfMczB9", label: "Pit stop", icon: "car" },
      { time: "18:00", name: "Check in to Fuli Hot Spring Resort", notes: "Settle in at the hotel before heading out for the evening.", label: "Evening", icon: "hotel" },
    ],
    evening: { time: "19:00", activity: "Lakeside walk & dinner at Shuishe Pier 水社碼頭", notes: "Chill first day. Try grilled fish and aboriginal cuisine at the pier.", icon: "food" },
    mapStops: [
      {
        id: "tpe-airport", sequence: 1, label: "TPE Airport", location: "Taoyuan",
        description: "Pick up the rental cars, then drive south via Highways 3 and 6.",
        cx: 82, cy: 55, labelX: 96, labelY: 47, textAnchor: "start",
        dayLabel: "Days 1 & 8", group: "days12", color: "blue",
        navDest: "Taoyuan International Airport, Taiwan",
      },
    ],
    highlights: ["Shuishe Pier sunset walk", "Aboriginal cuisine dinner", "Lakeside promenade stroll"],
    parking: "Hotel parking included", tolls: "~NTD 200–300 on freeway", fuel: "Fill up at Puli before mountain roads",
    warning: null, navDest: "Sun Moon Lake, Nantou, Taiwan",
  },
  {
    day: 2, date: "Wed, 7 Apr", title: "Sun Moon Lake Discovery",
    route: "Sun Moon Lake (full day)", distance: "Explore surrounding Sun Moon Lake / Formosan Aboriginal Culture Village", driveTime: "",
    overnight: "Sun Moon Lake", heroImage: "1637127250465-a0805ccabbd0", localHeroImage: imgDay2,
    weather: { high: 22, low: 15, rain: 40, icon: "cloud" },
    weatherLocation: { destination: "Sun Moon Lake", travelDate: "2027-04-07", latitude: 23.8659, longitude: 120.9159, timezone: "Asia/Taipei" },
    flexibleActivities: [
      { name: "Cycling: Shuishe Pier ↔ Xiangshan Visitor Center", notes: "Ride the lakeside cycle path from Shuishe Pier to Xiangshan Visitor Center, then return by the same scenic route.", icon: "bike", duration: "1.5 hrs round trip", optional: true },
      { name: "Breakfast around Shuishe Pier", notes: "Start the day with an easy breakfast near the pier before choosing the day's plan.", icon: "coffee" },
      { name: "Flexible dinner", notes: "Choose Thao cuisine at Ita Thao or return to Shuishe Pier for dinner.", icon: "food" },
    ],
    plans: [
      {
        name: "Plan A",
        description: "Temples, lakeside culture, street food and panoramic views.",
        activities: [
          { name: "Wenwu Temple", notes: "Visit the landmark lakeside temple and take in its elevated views over Sun Moon Lake.", icon: "attraction", mapsUrl: "https://maps.app.goo.gl/T98bDyKx1x4A552B7" },
          { name: "Ita Thao Shopping District", notes: "Explore the lively Thao lakeside district for local crafts, snacks and indigenous culture.", icon: "shopping", mapsUrl: "https://maps.app.goo.gl/uC3tFvjQNNePMbw67" },
          { name: "Lunch & street food in Ita Thao", notes: "Try local specialties such as mountain boar sausage and black tea buns.", icon: "food" },
          { name: "Panoramic views at Ci'en Pagoda", notes: "Finish with a climb to one of the lake's best panoramic viewpoints.", icon: "attraction", mapsUrl: "https://maps.app.goo.gl/7EGZjYws3bp5VpQb7" },
        ],
      },
      {
        name: "Plan B",
        description: "A full attraction day combining the ropeway and cultural village.",
        activities: [
          { name: "Sun Moon Lake Ropeway", notes: "Ride the gondola above the forest for sweeping views across the lake and surrounding mountains.", icon: "attraction" },
          { name: "Formosan Aboriginal Culture Village", notes: "Allow plenty of time for indigenous cultural experiences, gardens and attractions.", icon: "attraction", duration: "5 hrs", mapsUrl: "https://maps.app.goo.gl/3HexZQ9J5rgangBv9" },
        ],
      },
    ],
    mapStops: [
      {
        id: "sun-moon-lake", sequence: 2, label: "Sun Moon Lake", location: "Nantou County",
        description: "Plan A: Wenwu Temple, Ita Thao, street food and Ci'en Pagoda.",
        cx: 135, cy: 195, labelX: 149, labelY: 191, textAnchor: "start",
        dayLabel: "Days 1–2", group: "days12", color: "green", routeStyle: "highway",
        navDest: "Sun Moon Lake, Nantou, Taiwan", overnight: "Fuli Hot Spring Resort", plan: "Plan A",
      },
      {
        id: "sun-moon-lake", sequence: 2, label: "Sun Moon Lake", location: "Nantou County",
        description: "Plan B: Sun Moon Lake Ropeway and Formosan Aboriginal Culture Village.",
        cx: 135, cy: 195, labelX: 149, labelY: 191, textAnchor: "start",
        dayLabel: "Days 1–2", group: "days12", color: "green", routeStyle: "highway",
        navDest: "Sun Moon Lake, Nantou, Taiwan", overnight: "Fuli Hot Spring Resort", plan: "Plan B",
      },
    ],
    highlights: ["Lakeside cycling", "Wenwu Temple", "Ita Thao street food", "Ci'en Pagoda views", "Ropeway & culture village"],
    parking: "Hotel parking", tolls: "None", fuel: "N/A",
    warning: null, navDest: "Formosan Aboriginal Culture Village, Taiwan",
  },
  {
    day: 3, date: "Thu, 8 Apr", title: "Alpine Drive to Alishan",
    route: "Sun Moon Lake → Alishan (Plan A / Plan B)", distance: "Flexible mountain route", driveTime: "",
    overnight: "Alishan National Park", heroImage: "1611037114947-0b436af42ed9", localHeroImage: imgDay3,
    weather: { high: 16, low: 8, rain: 45, icon: "rain" },
    weatherLocation: { destination: "Alishan", travelDate: "2027-04-08", latitude: 23.5102, longitude: 120.805, timezone: "Asia/Taipei" },
    flexibleActivities: [
      { name: "Breakfast or brunch", notes: "Eat around Shuili Township when following Plan A, or around Shuishe when following Plan B.", icon: "coffee" },
      { name: "Dinner in Alishan Park", notes: "Plan for dinner inside Alishan National Scenic Area after checking in.", icon: "food" },
      { name: "Early bedtime", notes: "Rest early in preparation for the next morning's pre-dawn sunrise train.", icon: "hotel", badge: "Suggested" },
    ],
    plans: [
      {
        name: "Plan A",
        description: "Railway heritage, Shuili lunch and a scenic mountain approach via Tataka.",
        activities: [
          { name: "Checheng Old Street", notes: "Explore the former logging and railway village, historic station area and old-street atmosphere.", icon: "train", mapsUrl: "https://maps.app.goo.gl/zbRy5Ero417iJxqu5" },
          { name: "Linbandao Shopping District", notes: "Browse the timber-themed cultural district and local shops beside Checheng.", icon: "shopping", mapsUrl: "https://maps.app.goo.gl/WsiBkLSD7rWLGn9n9" },
          { name: "Lunch in Shuili Township", notes: "Stop for a relaxed local lunch before beginning the mountain drive toward Alishan.", icon: "food" },
          { name: "Tataka Visitor Center", notes: "Pause at the high-altitude visitor center for mountain scenery and a break on the alpine route.", icon: "attraction", mapsUrl: "https://maps.app.goo.gl/DRyk457meRuSybsj9" },
          { name: "Alishan DaFeng Hotel check-in", notes: "Check in to the hotel inside Alishan National Park and settle in before dinner.", icon: "hotel", duration: "16:00" },
        ],
      },
      {
        name: "Plan B",
        description: "A Tsou cultural experience followed by the drive into Alishan National Park.",
        activities: [
          { name: "YUYUPAS Cultural Park", notes: "Allow about 2.5 hours for the drive and typically around 3 hours to explore the cultural park.", icon: "attraction", duration: "~3 hrs visit", mapsUrl: "https://maps.app.goo.gl/mrLR7ufPCjKiHrAH6" },
          { name: "Lunch in YUYUPAS Cultural Park", notes: "Have lunch in the cultural park before continuing onward to Alishan.", icon: "food" },
          { name: "Alishan DaFeng Hotel check-in", notes: "Check in to the hotel inside Alishan National Park and settle in before dinner.", icon: "hotel", duration: "16:00" },
        ],
      },
    ],
    mapStops: [
      {
        id: "checheng-shuili", sequence: 3, label: "Checheng & Shuili", location: "Nantou County",
        description: "Plan A railway heritage stops, Linbandao district and lunch in Shuili.",
        cx: 122, cy: 225, labelX: 108, labelY: 220, textAnchor: "end",
        dayLabel: "Day 3", group: "days34", color: "orange", routeStyle: "mountain",
        navDest: "Checheng Old Street, Nantou, Taiwan", plan: "Plan A",
      },
      {
        id: "tataka", sequence: 4, label: "Tataka", location: "Yushan alpine route",
        description: "Plan A scenic mountain approach and visitor-center stop.",
        cx: 151, cy: 246, labelX: 165, labelY: 244, textAnchor: "start",
        dayLabel: "Day 3", group: "days34", color: "green", routeStyle: "mountain",
        navDest: "Tataka Visitor Center, Taiwan", plan: "Plan A",
      },
      {
        id: "yuyupas-plan-b", sequence: 3, label: "YUYUPAS", location: "Chiayi County",
        description: "Plan B Tsou cultural park visit and lunch before Alishan.",
        cx: 140, cy: 248, labelX: 126, labelY: 243, textAnchor: "end",
        dayLabel: "Day 3", group: "days34", color: "orange", routeStyle: "mountain",
        navDest: "YUYUPAS Tsou Cultural Village, Chiayi, Taiwan", plan: "Plan B",
      },
      {
        id: "alishan", sequence: 5, label: "Alishan", location: "Alishan National Park",
        description: "DaFeng Hotel stay, sunrise railway, ancient forest and village.",
        cx: 148, cy: 272, labelX: 162, labelY: 274, textAnchor: "start",
        dayLabel: "Days 3–4", group: "days34", color: "green", routeStyle: "mountain",
        navDest: "Alishan National Park, Taiwan", overnight: "DaFeng Hotel",
      },
    ],
    highlights: ["Checheng railway heritage", "Tataka alpine scenery", "YUYUPAS Tsou culture", "Alishan park stay"],
    parking: "Attraction parking + hotel parking", tolls: "~NTD 100", fuel: "Fill up before ascending — limited stations",
    warning: "Mountain roads — fog and sharp bends. Drive slowly.", navDest: "Alishan National Park, Taiwan",
  },
  {
    day: 4, date: "Fri, 9 Apr", title: "Alishan Sunrise & Ancient Forests",
    route: "Alishan National Park (full day)", distance: "Forest railway + walking", driveTime: "Pre-dawn to evening",
    overnight: "Alishan National Park", heroImage: "1676565464401-7a5da1752a61", localHeroImage: imgDay4,
    weather: { high: 13, low: 7, rain: 55, icon: "rain" },
    weatherLocation: { destination: "Alishan", travelDate: "2027-04-09", latitude: 23.5102, longitude: 120.805, timezone: "Asia/Taipei" },
    detailedSchedule: [
      {
        time: "04:00–06:30", label: "Sunrise experience", name: "Zhushan Sunrise Viewing Platform (祝山觀日平台)",
        badge: "Optional", image: imgDay4Sunrise,
        details: [
          "Arrive at Alishan Station about 20–30 minutes before the confirmed train departure. Ride the Zhushan Line uphill and walk a short distance to the viewing area.",
          "April sunrise is approximately 05:20–06:00 depending on the date. Enjoy the mountain silhouettes and possible sea of clouds, then return by train.",
        ],
        facts: ["Advance train booking required", "Walking: 5–15 min around the platform"],
      },
      {
        time: "06:45–09:00", label: "Breakfast and rest", name: "Breakfast back at the hotel area",
        image: imgDay4Breakfast,
        details: [
          "Have breakfast near the hotel after returning from the sunrise experience.",
          "Take a toilet break and refresh before heading out again, or have a short nap first.",
        ],
      },
      {
        time: "09:30–10:30", label: "Forest railway", name: "Alishan → Zhaoping Station (沼平車站)",
        image: imgDay4AlishanToZhaoping,
        details: [
          "Take the train from Alishan Station, then explore Zhaoping Park and its railway surroundings.",
        ],
        facts: ["Train: 6 min", "NT$100", "Short local walks"],
      },
      {
        time: "10:30–11:30", label: "Forest walking", name: "Sister Ponds (姊妹潭)",
        image: imgDay4SisterPonds,
        details: [
          "Walk from Zhaoping through the forest towards the two famous ponds, surrounded by towering cypress trees.",
          "Look out for the wooden pavilion and reflections of the forest.",
        ],
        facts: ["Approx. 0.8–1.2 km including approach and local paths", "Easy to moderate"],
      },
      {
        time: "10:50–11:20", label: "Temple and break", name: "Shouzhen Temple (受鎮宮)",
        image: imgDay4ShouzhenTemple,
        details: [
          "Continue along the signed forest route towards Shouzhen Temple, one of the park's main religious landmarks.",
          "Use this stop for toilets, a drink and a snack before entering the giant-tree section.",
        ],
        facts: ["Approx. 0.4–0.7 km from the ponds"],
      },
      {
        time: "11:20–12:45", label: "Main hiking highlight", name: "Giant Trees Plank Trail (巨木群棧道)",
        image: imgDay4GiantTrees,
        details: [
          "Follow the marked Giant Trees trail system through ancient red cypresses, wooden boardwalks and forest scenery.",
          "See the Three-Generation Tree, Xianglin Sacred Tree, Tree Spirit Pagoda and nearby historic sites, finishing downhill towards Shenmu Station.",
        ],
        facts: ["Around 1.5–2 km including connecting paths", "Moderate · Steps and slopes"],
      },
      {
        time: "12:45–13:30", label: "Return journey", name: "Shenmu Station → Alishan Station",
        image: imgDay4ShenmuToAlishan,
        details: [
          "Explore the old Sacred Tree area and station surroundings, then take the return forest railway.",
        ],
        facts: ["Train: 7 min", "NT$100"],
      },
      {
        time: "13:30–14:30", label: "Lunch", name: "Lunch in the Alishan village area",
        details: [
          "Return to the village area for a relaxed lunch after the morning's forest walk.",
        ],
      },
      {
        time: "14:30–End of day", label: "Village and rest", name: "Alishan Village",
        image: imgDay4AlishanVillage,
        details: [
          "Browse the shops near Alishan Station and the visitor centre. Look for Alishan high-mountain tea (高山茶), tea snacks, local wasabi products and wooden souvenirs.",
          "Visit the MORI 2488 exhibition, have dinner, and rest early after the pre-dawn start.",
        ],
      },
    ],
    mapStops: [
      {
        id: "zhushan-sunrise", sequence: 5.1, label: "Zhushan Sunrise", location: "Alishan",
        description: "Optional sunrise-train experience with advance booking.",
        cx: 158, cy: 260, labelX: 172, labelY: 258, textAnchor: "start",
        dayLabel: "Day 4", group: "days34", color: "green",
        navDest: "Zhushan Sunrise Observation Deck, Taiwan", optional: true,
      },
    ],
    highlights: ["Zhushan sunrise", "Forest railway", "Sister Ponds", "Giant Trees Plank Trail", "Alishan Village"],
    parking: "Inside accommodation", tolls: "None", fuel: "N/A",
    warning: "Very cold at dawn (4–7°C). Pack warm layers and rain gear.", navDest: null,
  },
  {
    day: 5, date: "Sat, 10 Apr", title: "Descent via Fenqihu to Chiayi",
    route: "Alishan → Shizhuo → Fenqihu → Chiayi City", distance: "Flexible route", driveTime: "",
    overnight: "Chiayi City", heroImage: "1603416547763-c637d96f5fef", localHeroImage: imgDay5,
    weather: { high: 27, low: 19, rain: 30, icon: "sun" },
    weatherLocation: { destination: "Chiayi City", travelDate: "2027-04-10", latitude: 23.4801, longitude: 120.4491, timezone: "Asia/Taipei" },
    linearActivities: [
      { name: "Shizhuo Tea Plantations (石棹茶園)", notes: "Enjoy the tea plantations and mountain scenery, including a visit to Dingshizhuo Lookout.", icon: "tea", mapsUrl: "https://maps.app.goo.gl/qGCDjoVGZ1yWMTUCA" },
      { name: "Shizhuo Sunset Trail (霞之道)", notes: "Take a short walk through tea plantations and bamboo forest.", icon: "forest", optional: true, mapsUrl: "https://maps.app.goo.gl/iWcT7q7mX8TLU9su8" },
      {
        name: "Fenqihu Old Street (奮起湖老街) and old railway station",
        notes: "Explore the old street and station, have the famous Fenqihu railway bento for lunch, try local snacks and browse the souvenir shops.",
        icon: "train",
        mapLinks: [
          { label: "Old Street", url: "https://maps.app.goo.gl/Hc8QYjU9g8KHsLPi9" },
          { label: "Railway Station", url: "https://maps.app.goo.gl/rNjL9U3wn281uS338" },
        ],
      },
      { name: "Fenqihu Cedar Boardwalk Trail", notes: "Walk through the cedar forest and along the wooden boardwalk.", icon: "forest", duration: "1 hr round trip", optional: true, mapsUrl: "https://maps.app.goo.gl/KBX97BiJLaCHP1bR8" },
      { name: "YUYUPAS Tsou Cultural Park (優遊吧斯)", notes: "Explore Tsou indigenous culture, exhibits and gardens if the day is running ahead of schedule.", icon: "attraction", badge: "If time permits", mapsUrl: "https://maps.app.goo.gl/nMYp9oPY1hMchqq67" },
      { name: "Chiayi City hotel check-in", notes: "Drive to Chiayi City via Highway 18 and check in to the hotel.", icon: "hotel" },
      { name: "Wenhua Road Night Market (文化路夜市)", notes: "Explore the shops and street food, and try Chiayi turkey rice (火雞肉飯).", icon: "food", mapsUrl: "https://maps.app.goo.gl/7wB4QY9p6oTgNrYP7" },
    ],
    mapStops: [
      {
        id: "shizhuo", sequence: 6, label: "Shizhuo Tea", location: "Chiayi mountain region",
        description: "Tea plantations, mountain scenery and Dingshizhuo Lookout.",
        cx: 140, cy: 288, labelX: 154, labelY: 286, textAnchor: "start",
        dayLabel: "Day 5", group: "days56", color: "green", routeStyle: "mountain",
        navDest: "Shizhuo Tea Plantation, Taiwan",
      },
      {
        id: "shizhuo-sunset", sequence: 6.1, label: "Shizhuo Sunset Trail", location: "Shizhuo",
        description: "Optional short walk through tea plantations and bamboo forest.",
        cx: 150, cy: 294, labelX: 164, labelY: 293, textAnchor: "start",
        dayLabel: "Day 5", group: "days56", color: "green",
        navDest: "Shizhuo Sunset Trail, Taiwan", optional: true,
      },
      {
        id: "fenqihu", sequence: 7, label: "Fenqihu", location: "Chiayi County",
        description: "Old Street, railway station, bento lunch and souvenir shops.",
        cx: 126, cy: 302, labelX: 140, labelY: 304, textAnchor: "start",
        dayLabel: "Day 5", group: "days56", color: "orange", routeStyle: "mountain",
        navDest: "Fenqihu Old Street, Chiayi, Taiwan",
      },
      {
        id: "fenqihu-cedar", sequence: 7.1, label: "Cedar Boardwalk", location: "Fenqihu",
        description: "Optional one-hour cedar forest and wooden-boardwalk walk.",
        cx: 136, cy: 310, labelX: 150, labelY: 312, textAnchor: "start",
        dayLabel: "Day 5", group: "days56", color: "green",
        navDest: "Fenqihu Cedar Boardwalk Trail, Taiwan", optional: true,
      },
      {
        id: "yuyupas-optional", sequence: 7.2, label: "YUYUPAS", location: "Chiayi County",
        description: "Optional cultural-park stop only if time permits.",
        cx: 144, cy: 280, labelX: 158, labelY: 279, textAnchor: "start",
        dayLabel: "Day 5", group: "days56", color: "orange",
        navDest: "YUYUPAS Tsou Cultural Village, Chiayi, Taiwan", optional: true,
      },
      {
        id: "chiayi-city", sequence: 8, label: "Chiayi City", location: "Chiayi",
        description: "Hotel base for East Market, Hinoki Village, Wenhua Road and Nice Plaza.",
        cx: 100, cy: 320, labelX: 114, labelY: 321, textAnchor: "start",
        dayLabel: "Days 5–6", group: "days56", color: "orange", routeStyle: "mountain",
        navDest: "Chiayi City, Taiwan", overnight: "Maison de Chine Hotel",
      },
    ],
    highlights: ["Shizhuo tea scenery", "Fenqihu railway bento", "Cedar boardwalk", "Tsou culture", "Wenhua Road Night Market"],
    parking: "Shizhuo/Fenqihu visitor parking + hotel parking", tolls: "None", fuel: "Fill up in Chiayi",
    warning: null, navDest: "Fenqihu Old Street, Chiayi, Taiwan",
  },
  {
    day: 6, date: "Sun, 11 Apr", title: "Chiayi City & Taiping Old Street",
    route: "Chiayi City + Taiping Old Street", distance: "City + mountain route", driveTime: "",
    overnight: "Chiayi City", heroImage: "1698567045771-a22c872c26fa", localHeroImage: imgDay6,
    weather: { high: 27, low: 19, rain: 30, icon: "sun" },
    weatherLocation: { destination: "Chiayi City", travelDate: "2027-04-11", latitude: 23.4801, longitude: 120.4491, timezone: "Asia/Taipei" },
    linearActivities: [
      { name: "Breakfast — Chiayi East Market (嘉義東市場)", notes: "Go early for the best selection of traditional Taiwanese breakfast and local snacks, including rice cakes, pork rib soup and other specialties.", icon: "food", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E5%98%89%E7%BE%A9%E6%9D%B1%E5%B8%82%E5%A0%B4" },
      { name: "Hinoki Village (檜意森活村)", notes: "Explore the Japanese-style wooden buildings, browse Taiwanese local brands, creative shops and souvenirs, and stop for coffee or dessert.", icon: "coffee", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E6%AA%9C%E6%84%8F%E6%A3%AE%E6%B4%BB%E6%9D%91" },
      { name: "Taiping Suspension Bridge (太平雲梯)", notes: "Drive approximately 1 hour from Chiayi City, walk across the famous 281 m suspension bridge and enjoy panoramic mountain and plains views. Book Sunday tickets in advance.", icon: "attraction", badge: "Book ahead", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%AA%E5%B9%B3%E9%9B%B2%E6%A2%AF" },
      { name: "Lunch & explore — Taiping Old Street (太平老街)", notes: "Explore the traditional mountain village street, try local snacks, tea and traditional food, and browse the small shops and souvenir stalls.", icon: "food", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%AA%E5%B9%B3%E8%80%81%E8%A1%97+%E6%A2%85%E5%B1%B1" },
      { name: "Ume Tonya Plum Vitality Museum (梅問屋梅子元氣館)", notes: "Learn about Taiwan's plum processing and sample dried plums, plum snacks and other local products at this specialty shop and tasting experience.", icon: "shopping", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E6%A2%85%E5%95%8F%E5%B1%8B%E6%A2%85%E5%AD%90%E5%85%83%E6%B0%A3%E9%A4%A8" },
      { name: "Dinner & shopping — Nice Plaza (耐斯廣場)", notes: "Return to Chiayi City for fashion, shoes, beauty and lifestyle shopping, then have dinner at the mall.", icon: "shopping", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E8%80%90%E6%96%AF%E5%BB%A3%E5%A0%B4" },
    ],
    mapStops: [
      {
        id: "taiping", sequence: 9, label: "Taiping Old Street", location: "Meishan, Chiayi",
        description: "Suspension bridge, mountain views, lunch and old-street shops.",
        cx: 112, cy: 296, labelX: 98, labelY: 294, textAnchor: "end",
        dayLabel: "Day 6", group: "days56", color: "orange", routeStyle: "local",
        navDest: "Taiping Old Street, Meishan, Taiwan",
      },
    ],
    highlights: ["Chiayi East Market breakfast", "Hinoki Village", "Taiping Suspension Bridge", "Taiping Old Street", "Plum tasting", "Nice Plaza"],
    parking: "City parking + Taiping visitor parking", tolls: "None", fuel: "Fill up for the long drive tomorrow",
    warning: null, navDest: "Taiping Old Street, Taiwan",
  },
  {
    day: 7, date: "Mon, 12 Apr", title: "Coastal Nanliao & Hsinchu City",
    route: "Chiayi City → Hsinchu Nanliao Harbor", distance: "Northbound highway + coast", driveTime: "",
    overnight: "Hsinchu City", heroImage: "1661262745110-c79b38317c5f", localHeroImage: imgDay7,
    weather: { high: 23, low: 18, rain: 45, icon: "cloud" },
    weatherLocation: { destination: "Nanliao Harbor, Hsinchu", travelDate: "2027-04-12", latitude: 24.8498, longitude: 120.9293, timezone: "Asia/Taipei" },
    linearActivities: [
      { name: "Drive north towards Hsinchu", notes: "Travel north from Chiayi via National Freeway No. 1 (國道一號).", icon: "car" },
      { name: "Rest stop — Tai'an Service Area (泰安服務區)", notes: "Take the main highway break for coffee, food, toilets and refreshments.", icon: "coffee", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B3%B0%E5%AE%89%E6%9C%8D%E5%8B%99%E5%8D%80" },
      { name: "Hukou Service Area (湖口服務區)", notes: "Use this as a convenient additional break stop near Hsinchu if needed.", icon: "coffee", optional: true, mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B9%96%E5%8F%A3%E6%9C%8D%E5%8B%99%E5%8D%80" },
      {
        name: "Nanliao Fishing Harbor (南寮漁港) & Fish Scale Staircase (魚鱗天梯)",
        notes: "Explore the harbor and coastal scenery, then visit the iconic colorful mosaic staircase overlooking the Taiwan Strait.",
        icon: "attraction",
        mapLinks: [
          { label: "Fishing Harbor", url: "https://www.google.com/maps/search/?api=1&query=%E5%8D%97%E5%AF%AE%E6%BC%81%E6%B8%AF" },
          { label: "Fish Scale Staircase", url: "https://www.google.com/maps/search/?api=1&query=%E5%8D%97%E5%AF%AE%E9%AD%9A%E9%B1%97%E5%A4%A9%E6%A2%AF" },
        ],
      },
      {
        name: "Coastal cycling — Hsinchu 17 km coastline",
        notes: "Rent bicycles near Nanliao Harbor and enjoy a shorter section of the coastal route and sea views; there is no need to complete the full 17 km.",
        icon: "bike",
        optional: true,
        mapLinks: [
          { label: "Bike Rental", url: "https://www.google.com/maps/search/?api=1&query=%E9%A3%9B%E7%BF%94%E5%96%AE%E8%BB%8A+%E5%8D%97%E5%AF%AE" },
        ],
      },
      { name: "Seafood dinner — Nanliao Fishery Products Direct-Sales Center (南寮漁產直銷中心)", notes: "Choose fresh seafood on level 1 and have it cooked to order on level 2. Additional cooking charges apply.", icon: "food", mapsUrl: "https://maps.app.goo.gl/koEZamR739Asvqpo9" },
      { name: "Fu Yuan Peanut Butter (福源花生醬)", notes: "Visit the famous Hsinchu shop for freshly made peanut butter, sesame paste and souvenirs.", icon: "shopping", mapsUrl: "https://maps.app.goo.gl/h7o2DkZMVvLxSHjDA" },
      { name: "Hsinchu Dongmen Market", notes: "Walk from the hotel instead of driving. The old traditional market is now home to small eateries, bars and restaurants.", icon: "food", mapsUrl: "https://maps.app.goo.gl/NmbekcKbTH2owryp6" },
    ],
    mapStops: [
      {
        id: "taian-service-area", sequence: 10, label: "Tai'an Service Area", location: "National Freeway No. 1",
        description: "Confirmed highway rest stop while driving north from Chiayi.",
        cx: 70, cy: 170, labelX: 84, labelY: 169, textAnchor: "start",
        dayLabel: "Day 7", group: "days78", color: "blue", routeStyle: "highway",
        navDest: "Tai'an Service Area, Taiwan",
      },
      {
        id: "hukou-service-area", sequence: 10.1, label: "Hukou Service Area", location: "Near Hsinchu",
        description: "Optional additional highway break near Hsinchu.",
        cx: 63, cy: 108, labelX: 49, labelY: 105, textAnchor: "end",
        dayLabel: "Day 7", group: "days78", color: "blue",
        navDest: "Hukou Service Area, Taiwan", optional: true,
      },
      {
        id: "hsinchu-nanliao", sequence: 11, label: "Hsinchu & Nanliao", location: "Hsinchu City",
        description: "Nanliao harbor, Fish Scale Staircase, seafood and city markets.",
        cx: 58, cy: 124, labelX: 72, labelY: 125, textAnchor: "start",
        dayLabel: "Day 7", group: "days78", color: "blue", routeStyle: "highway",
        navDest: "Nanliao Fishing Harbor, Hsinchu, Taiwan", overnight: "Darlon Hotel, Hsinchu City",
      },
      {
        id: "hsinchu-cycling", sequence: 11.1, label: "Coastal Cycling", location: "Nanliao Coast",
        description: "Optional shorter ride on Hsinchu's 17 km coastline.",
        cx: 49, cy: 132, labelX: 35, labelY: 134, textAnchor: "end",
        dayLabel: "Day 7", group: "days78", color: "blue",
        navDest: "Nanliao Bike Rental, Hsinchu, Taiwan", optional: true,
      },
    ],
    highlights: ["Highway rest stops", "Nanliao Harbor", "Fish Scale Staircase", "Coastal cycling", "Fresh seafood", "Hsinchu specialties"],
    parking: "Harbor parking + hotel parking", tolls: "~NTD 300 freeway", fuel: "Fill up in Chiayi",
    warning: null, navDest: "Nanliao Fish Harbor, Hsinchu, Taiwan",
  },
  {
    day: 8, date: "Tue, 13 Apr", title: "Farewell Coast Drive",
    route: "Hsinchu → Highway 61 → Taoyuan Airport", distance: "Scenic coastal route", driveTime: "",
    overnight: "Flight home", departureDay: true, heroImage: "1719130212747-0755c255b8a9", localHeroImage: imgDay8,
    weather: { high: 24, low: 18, rain: 45, icon: "cloud" },
    weatherLocation: { destination: "Taoyuan International Airport", travelDate: "2027-04-13", latitude: 25.0797, longitude: 121.2342, timezone: "Asia/Taipei" },
    flexibleActivities: [
      { name: "Breakfast in Hsinchu", notes: "Have breakfast in Hsinchu City before beginning the final coastal drive.", icon: "coffee" },
      { name: "Scenic Coastal Drive — Highway 61 (台61線 / 西濱快速道路)", notes: "Follow Taiwan's west-coast expressway north for the final scenic drive of the trip.", icon: "car" },
      { name: "Lunch — Yong'an Fishing Harbor (永安漁港)", notes: "Have fresh seafood at the tourist fish market before continuing towards Taoyuan.", icon: "food", mapsUrl: "https://maps.app.goo.gl/djQu6FSsC9yECzEF8" },
      { name: "Taoyuan International Airport (桃園國際機場)", notes: "Refuel and return the rental car. Target a 15:00 car return and check in for the flight at 17:45.", icon: "car" },
    ],
    plans: [
      {
        name: "Plan A",
        description: "Use the remaining time for last-minute outlet shopping before the airport.",
        activities: [
          { name: "GLORIA OUTLETS (華泰名品城)", notes: "Browse the large outdoor outlet shopping village for final purchases before the airport.", icon: "shopping", mapsUrl: "https://maps.app.goo.gl/KLY1VCCkMiAmK7yx6" },
        ],
      },
      {
        name: "Plan B",
        description: "Explore distinctive coastal architecture and learn about Ocean Hakka culture.",
        activities: [
          { name: "Yong'an Conch Cultural Experience Park (永安海螺文化體驗園區)", notes: "Explore the unique seashell-inspired architecture and learn about the local Ocean Hakka fishing culture.", icon: "attraction", mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B0%B8%E5%AE%89%E6%B5%B7%E8%9E%BA%E6%96%87%E5%8C%96%E9%AB%94%E9%A9%97%E5%9C%92%E5%8D%80" },
        ],
      },
    ],
    mapStops: [
      {
        id: "yongan-harbor", sequence: 12, label: "Yong'an Harbor", location: "Taoyuan Coast",
        description: "Plan A seafood lunch at Yong'an Fishing Harbor.",
        cx: 67, cy: 84, labelX: 53, labelY: 85, textAnchor: "end",
        dayLabel: "Day 8", group: "days78", color: "blue", routeStyle: "coastal",
        navDest: "Yongan Fishing Harbor, Taiwan", plan: "Plan A",
      },
      {
        id: "gloria-outlets", sequence: 13, label: "GLORIA OUTLETS", location: "Taoyuan",
        description: "Plan A last-minute shopping before returning the rental car.",
        cx: 77, cy: 64, labelX: 91, labelY: 66, textAnchor: "start",
        dayLabel: "Day 8", group: "days78", color: "orange", routeStyle: "coastal",
        navDest: "GLORIA OUTLETS, Taoyuan, Taiwan", plan: "Plan A",
      },
      {
        id: "yongan-conch", sequence: 12, label: "Yong'an Conch Park", location: "Taoyuan Coast",
        description: "Plan B Ocean Hakka cultural experience and coastal architecture.",
        cx: 66, cy: 91, labelX: 52, labelY: 93, textAnchor: "end",
        dayLabel: "Day 8", group: "days78", color: "blue", routeStyle: "coastal",
        navDest: "Yong'an Conch Cultural Experience Park, Taiwan", plan: "Plan B",
      },
      {
        id: "yongan-harbor", sequence: 13, label: "Yong'an Harbor", location: "Taoyuan Coast",
        description: "Plan B seafood lunch after the Conch Cultural Experience Park.",
        cx: 67, cy: 84, labelX: 53, labelY: 85, textAnchor: "end",
        dayLabel: "Day 8", group: "days78", color: "blue", routeStyle: "coastal",
        navDest: "Yongan Fishing Harbor, Taiwan", plan: "Plan B",
      },
    ],
    highlights: ["Highway 61 coastal drive", "Ocean Hakka culture", "Yong'an seafood", "Gloria Outlets", "Airport return"],
    parking: "Harbor free", tolls: "~NTD 150", fuel: "Fill up before returning car",
    warning: "Return the rental car by 15:00 and check in for the flight at 17:45.", navDest: "Yongan Fishing Harbor, Taiwan",
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
  {
    nights: 2, days: "Days 1–2",
    stayDates: "6–8 Apr",
    name: "Fuli Hot Spring Resort", nameZh: "馥麗溫泉大飯店",
    location: "Sun Moon Lake, Nantou County",
    checkIn: "15:00", checkOut: "11:00",
    parking: "Included — hotel lot",
    features: ["Private hot spring baths", "Lakefront views", "Restaurant on-site", "Spa & wellness"],
    breakfast: null,
    localImage: imgFuliHotel,
    mapsUrl: "https://maps.app.goo.gl/RKTw8NdizpYq4aLC6",
  },
  {
    nights: 2, days: "Days 3–4",
    stayDates: "8–10 Apr",
    name: "Dafeng Hotel", nameZh: "大豐山莊",
    location: "Alishan National Park, Chiayi County",
    checkIn: "14:00", checkOut: "10:00",
    parking: "Limited — inside park",
    features: ["Inside Alishan National Park", "Walking distance to forest trains", "Mountain views"],
    breakfast: "Breakfast coupons for partner restaurants",
    localImage: imgDafengHotel,
    mapsUrl: "https://maps.app.goo.gl/yXaojBM59hBibdjc6",
  },
  {
    nights: 2, days: "Days 5–6",
    stayDates: "10–12 Apr",
    name: "Maison de Chine Hotel", nameZh: "吾居吾宿",
    location: "Chiayi City",
    checkIn: "15:00", checkOut: "11:00",
    parking: "Hotel lot",
    features: ["Central Chiayi location", "Close to night markets", "Modern amenities", "Rooftop views"],
    breakfast: null,
    localImage: imgMaisonHotel,
    mapsUrl: "https://maps.app.goo.gl/k2na6eu79D9FaUhA8",
  },
  {
    nights: 1, days: "Day 7",
    stayDates: "12–13 Apr",
    name: "Darlon Hotel", nameZh: "達龍大飯店",
    location: "Hsinchu City",
    checkIn: "15:00", checkOut: "10:00",
    parking: "Hotel lot",
    features: ["Near Nanliao Harbor", "Easy TPE airport access", "City centre location"],
    breakfast: "Breakfast included",
    localImage: imgDarlonHotel,
    mapsUrl: "https://maps.app.goo.gl/G3WKhXw5Rt9o9E8D7",
  },
];

interface SouvenirItem {
  name: string; nameZh: string; description: string; where: string; imgSrc: string;
}
interface SouvenirLocation {
  id: string; label: string; labelZh: string;
  color: "blue" | "green" | "orange" | "grey"; accent: string; items: SouvenirItem[];
}

const SOUVENIRS: SouvenirLocation[] = [
  {
    id: "sml", label: "Sun Moon Lake", labelZh: "日月潭", color: "blue", accent: "#1A6FA0",
    items: [
      { name: "Sun Moon Lake Red Tea", nameZh: "日月潭紅茶", description: "Grown at 750 m altitude in Nantou, this ruby-red tea has a floral sweetness with no bitterness — Taiwan's most prized red tea variety.", where: "Pier-side tea shops & Ita Thao Village", imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh6ddw89LJNJ2bRpPeU7IA4jC39SQouduuZJAslzXzXQ&s=10" },
      { name: "Sun Moon Lake Millet Wine", nameZh: "小米酒", description: "Sweet traditional millet wine bottled by the indigenous Thao community — lightly fermented, gently fruity, and steeped in centuries of tribal ceremony.", where: "Ita Thao Village market stalls", imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLm29FPnhUm3I7dhjmLu_2FV5ZNxV47RW21ANcPhKNcQ&s=10" },
      { name: "Handmade Mochi", nameZh: "手工麻糬", description: "Sun Moon Lake mochi is famous throughout Taiwan — filled with red bean, peanut, or sesame and dusted in flour. Freshly made daily.", where: "Shuishe pier shops & Ita Thao", imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo6ClXwIEp78iMNHyprrMr4WlcDjjec1vNF0uBr9DhQw&s=10" },
    ]
  },
  {
    id: "alishan", label: "Alishan", labelZh: "阿里山", color: "green", accent: "#2E7D52",
    items: [
      { name: "Alishan High-Mountain Oolong", nameZh: "阿里山高山茶", description: "Grown at 1,000–2,000 m in misty mountain air, this world-famous oolong has a buttery floral finish and no astringency — buy directly from growers.", where: "Alishan village tea houses & hillside farms", imgSrc: img("1602130783992-6209cae2c589", 600, 450) },
      { name: "Alishan Single Drip Coffee", nameZh: "阿里山手沖咖啡", description: "Shade-grown arabica at 1,200–1,500 m brewed single-cup pour-over style. Low acidity, sweet nutty finish — Taiwan's finest mountain coffee experience.", where: "YUYUPAS Village & Alishan village cafés", imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVS2F9a4IdEvjCngRuQP0rTzguVN5EHLwgxsoF8igCvw&s=10" },
      { name: "Red Cypress Essential Oil", nameZh: "阿里山紅檜精油", description: "Distilled from Alishan's sacred red cypress (紅檜), this forest-fresh essential oil is treasured for its calming aroma and is unique to the Alishan highlands.", where: "Alishan village artisan & wellness shops", imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR52ilXoBGEHaSAuKScd5LhVL-L-DP58URcdFJOomMUbQ&s=10" },
    ]
  },
];

const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: Compass },
  { id: "itinerary", label: "Itinerary", Icon: Calendar },
  { id: "hotels", label: "Hotels", Icon: Bed },
  { id: "attractions", label: "Attractions", Icon: Eye },
  { id: "food", label: "Food", Icon: Utensils },
  { id: "map", label: "Map", Icon: Map },
  { id: "souvenirs", label: "Souvenirs", Icon: ShoppingBag },
];

// ─── tiny reusable components ─────────────────────────────────────────────────

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "orange" | "grey" }) {
  const c = { blue: "bg-[#E8F0F7] text-[#1A6FA0]", green: "bg-[#E6F4ED] text-[#2E7D52]", orange: "bg-[#FEF0E6] text-[#F4841F]", grey: "bg-muted text-muted-foreground" }[color];
  return <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${c}`}>{children}</span>;
}

function GMapsButtons({
  mapsUrl,
  mapLinks,
  navDest,
}: {
  mapsUrl?: string;
  mapLinks?: { label: string; url: string }[];
  navDest?: string | null;
}) {
  const navigateUrl = navDest
    ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(navDest)}`
    : null;
  const directLinks = [
    ...(mapsUrl ? [{ label: "Open in Maps", url: mapsUrl }] : []),
    ...(mapLinks ?? []),
  ];

  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {directLinks.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium bg-[#1A6FA0] text-white px-3 py-1.5 rounded-lg hover:bg-[#155d8a] transition-colors">
          <Navigation size={12} /> {link.label}
        </a>
      ))}
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
          className="flex flex-wrap justify-center gap-4 mb-6">
          {[["8", "Days"], ["7", "Travellers"], ["4", "Distinct Landmarks"]].map(([n, l]) => (
            <div key={l} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15">
              <div className="text-2xl font-bold text-white" style={SERIF}>{n}</div>
              <div className="text-xs text-white/60 mt-0.5 tracking-wide uppercase">{l}</div>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="https://drive.google.com/drive/folders/1tKWLhKZOOY29JuWflly5lbXquePrTe9x?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          whileHover={{ y: -3 }}
          className="group mx-auto mb-7 flex max-w-md items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-3 pr-4 text-left shadow-lg backdrop-blur-md transition-colors hover:bg-white/15"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#2E7D52] text-white shadow-md">
            <Globe size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/55">Shared trip folder</span>
            <span className="mt-0.5 block font-semibold text-white">Open Taiwan 2027 Google Drive</span>
          </span>
          <ExternalLink size={17} className="flex-shrink-0 text-white/55 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        </motion.a>

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

function FlexibleDayPlan({
  activities,
  plans = [],
  selectedPlan,
  onPlanChange,
}: {
  activities: DayActivity[];
  plans?: DayPlan[];
  selectedPlan?: "Plan A" | "Plan B";
  onPlanChange?: (plan: "Plan A" | "Plan B") => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Flexible day</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          {activities.map((activity) => (
            <div key={activity.name} className="rounded-2xl border border-border bg-secondary/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-card shadow-sm">
                  <SlotIcon icon={activity.icon} />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {(activity.badge || activity.optional) && <Badge color="grey">{activity.badge ?? "Optional"}</Badge>}
                  {activity.duration && <Badge color="blue">{activity.duration}</Badge>}
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">{activity.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{activity.notes}</p>
              {(activity.mapsUrl || activity.mapLinks) && <GMapsButtons mapsUrl={activity.mapsUrl} mapLinks={activity.mapLinks} />}
            </div>
          ))}
        </div>
      </div>

      {plans.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected route</span>
            {plans.map((plan) => (
              <Button
                key={plan.name}
                type="button"
                size="sm"
                variant={selectedPlan === plan.name ? "default" : "outline"}
                onClick={() => onPlanChange?.(plan.name as "Plan A" | "Plan B")}
                className="rounded-full"
                aria-pressed={selectedPlan === plan.name}
              >
                {plan.name}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan, planIndex) => {
            const isSelected = selectedPlan === plan.name;
            return (
            <div key={plan.name} className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all ${
              isSelected ? "border-primary ring-2 ring-primary/15" : "border-border opacity-75"
            }`}>
              <div className="border-b border-border bg-secondary/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={planIndex === 0 ? "green" : "orange"}>{plan.name}</Badge>
                  {isSelected && <Badge color="blue">Selected</Badge>}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{plan.description}</p>
              </div>
              <div className="divide-y divide-border">
                {plan.activities.map((activity) => (
                  <div key={activity.name} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <SlotIcon icon={activity.icon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{activity.name}</p>
                          {activity.duration && <Badge color="blue">{activity.duration}</Badge>}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{activity.notes}</p>
                        {(activity.mapsUrl || activity.mapLinks) && <GMapsButtons mapsUrl={activity.mapsUrl} mapLinks={activity.mapLinks} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}

function LinearDaySchedule({ activities }: { activities: DayActivity[] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h4>
      <div className="relative">
        <div className="absolute bottom-0 left-5 top-0 w-px bg-border" />
        {activities.map((activity) => (
          <div key={activity.name} className="flex gap-4 pb-6 last:pb-0">
            <div className="relative z-10 flex size-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-card bg-secondary shadow-sm">
              <SlotIcon icon={activity.icon} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{activity.name}</p>
                {(activity.badge || activity.optional) && <Badge color="grey">{activity.badge ?? "Optional"}</Badge>}
                {activity.duration && <Badge color="blue">{activity.duration}</Badge>}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{activity.notes}</p>
              {(activity.mapsUrl || activity.mapLinks) && (
                <GMapsButtons mapsUrl={activity.mapsUrl} mapLinks={activity.mapLinks} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedDaySchedule({ activities }: { activities: DetailedActivity[] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Detailed schedule</h4>
      <div className="space-y-4">
        {activities.map((activity) => (
          <motion.div
            key={`${activity.time}-${activity.name}`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
              activity.image ? "grid sm:grid-cols-[minmax(0,13rem)_1fr]" : ""
            }`}
          >
            {activity.image && (
              <div className="h-44 overflow-hidden bg-muted sm:h-full sm:min-h-48">
                <ImageWithFallback
                  src={activity.image}
                  alt={activity.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
            <div className="p-4 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge color="orange">{activity.time}</Badge>
                <span className="text-xs font-medium text-muted-foreground">{activity.label}</span>
                {activity.badge && <Badge color="grey">{activity.badge}</Badge>}
              </div>
              <h4 className="text-base font-bold text-foreground" style={SERIF}>{activity.name}</h4>
              <div className="mt-2 space-y-1.5">
                {activity.details.map((detail) => (
                  <p key={detail} className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
                ))}
              </div>
              {activity.facts && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activity.facts.map((fact) => (
                    <span key={fact} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                      {fact}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DayCard({
  d,
  open,
  onToggle,
  selectedPlan,
  onPlanChange,
}: {
  d: DayData;
  open: boolean;
  onToggle: () => void;
  selectedPlan?: "Plan A" | "Plan B";
  onPlanChange?: (plan: "Plan A" | "Plan B") => void;
}) {
  const schedule: { label: string; data: TimeSlot; mapsUrl?: string }[] = [
    ...(d.morning ? [{ label: d.morning.label ?? "Morning", data: d.morning }] : []),
    ...(d.afternoon ? [{ label: d.afternoon.label ?? "Afternoon", data: d.afternoon }] : []),
    ...(d.routeStops ?? []).map((stop) => ({
      label: stop.label,
      data: { time: stop.time, activity: stop.name, notes: stop.notes, icon: stop.icon },
      mapsUrl: stop.mapsUrl,
    })),
    ...(d.evening ? [{ label: "Evening", data: d.evening }] : []),
  ];

  return (
    <motion.div layout className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button
        className="group w-full cursor-pointer text-left outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-inset"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`day-${d.day}-details`}
        aria-label={`${open ? "Collapse" : "Explore"} Day ${d.day}: ${d.title}`}
      >
        <div className="relative h-48 overflow-hidden bg-[#1A2B3C]">
          <ImageWithFallback src={d.localHeroImage} alt={d.title} className="w-full h-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block bg-[#F4841F] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">Day {d.day}</span>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight" style={SERIF}>{d.title}</h3>
                <p className="text-white/70 text-sm mt-1">{d.date}</p>
              </div>
              <div className="mt-1 flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-white shadow-sm backdrop-blur-sm transition-all group-hover:border-white/30 group-hover:bg-white/25">
                <span className="text-xs font-semibold">{open ? "Collapse" : "Explore Day"}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <MapPin size={12} />{d.route}
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <Car size={12} />{d.distance}{d.driveTime ? ` · ${d.driveTime}` : ""}
              </div>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`day-${d.day}-details`} role="region" aria-label={`Day ${d.day} details`}
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }} className="overflow-hidden">
            <div className="p-5 md:p-6 space-y-6">
              <div className="space-y-3">
                <WeatherForecast location={d.weatherLocation} historical={d.weather} />
                {d.departureDay ? (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Plane size={14} />
                    <strong className="text-foreground">{d.overnight}</strong>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Bed size={14} />
                    <span>Overnight: <strong className="text-foreground">{d.overnight}</strong></span>
                  </div>
                )}
              </div>

              {d.detailedSchedule ? (
                <DetailedDaySchedule activities={d.detailedSchedule} />
              ) : d.linearActivities ? (
                <LinearDaySchedule activities={d.linearActivities} />
              ) : d.flexibleActivities ? (
                <FlexibleDayPlan
                  activities={d.flexibleActivities}
                  plans={d.plans}
                  selectedPlan={selectedPlan}
                  onPlanChange={onPlanChange}
                />
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Schedule</h4>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                    {schedule.map(({ label, data, mapsUrl }) => (
                      <div key={`${label}-${data.activity}`} className="flex gap-4 pb-6 last:pb-0">
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
                          {mapsUrl && <GMapsButtons mapsUrl={mapsUrl} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItinerarySection({
  planSelections,
  onPlanChange,
}: {
  planSelections: PlanSelections;
  onPlanChange: (day: number, plan: "Plan A" | "Plan B") => void;
}) {
  const [openDay, setOpenDay] = useState<number>(0);
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
            onToggle={() => setOpenDay(openDay === d.day ? 0 : d.day)}
            selectedPlan={planSelections[d.day]}
            onPlanChange={(plan) => onPlanChange(d.day, plan)} />
        ))}
      </div>
    </section>
  );
}

// ─── StopCard (used inside MapSection) ───────────────────────────────────────

interface JourneyStop extends ItineraryMapStop {
  key: string;
  order: string;
  groups: JourneyFilter[];
  sourceDay: number;
  alternativeAvailable: boolean;
  selectedPlan?: "Plan A" | "Plan B";
}

function StopCard({
  stop,
  selected,
  highlighted,
  onSelect,
  onHover,
}: {
  stop: JourneyStop;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const colorHex = { blue: "#1A6FA0", green: "#2E7D52", orange: "#F4841F" }[stop.color];
  const badgeColor = stop.color === "green" ? "green" : stop.color === "orange" ? "orange" : "blue";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Highlight ${stop.label} on the route`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => onHover(stop.key)}
      onMouseLeave={() => onHover(null)}
      className={`cursor-pointer rounded-2xl border p-4 outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? "border-primary bg-secondary/60 shadow-md"
          : highlighted
            ? "border-primary/60 bg-card shadow-md"
            : "border-border bg-card shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm ${
            stop.optional ? "border-dashed bg-card" : "border-card text-white"
          }`}
          style={{
            backgroundColor: stop.optional ? undefined : colorHex,
            borderColor: stop.optional ? colorHex : undefined,
            color: stop.optional ? colorHex : undefined,
          }}
        >
          {stop.optional ? "•" : stop.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
            <h4 className="font-semibold text-foreground text-sm">{stop.label}</h4>
            <Badge color={badgeColor}>{stop.dayLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{stop.location}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stop.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stop.optional && <Badge color="grey">Optional · Not on main route</Badge>}
            {stop.plan && <Badge color="blue">{stop.plan} route</Badge>}
            {stop.alternativeAvailable && <Badge color="grey">Alternative Plan Available</Badge>}
          </div>
          {stop.overnight && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bed size={11} className="text-primary" />
              <span>Overnight: <strong className="text-foreground">{stop.overnight}</strong></span>
            </div>
          )}
          {stop.navDest && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(stop.navDest)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink size={11} /> Navigate
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MapSection ───────────────────────────────────────────────────────────────

function MapSection({ planSelections }: { planSelections: PlanSelections }) {
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [filter, setFilter] = useState<JourneyFilter>("all");

  const selectedMapStops = DAYS.flatMap((day) =>
    (day.mapStops ?? [])
      .filter((stop) => !stop.plan || planSelections[day.day] === stop.plan)
      .map((stop) => ({
        ...stop,
        key: `${day.day}-${stop.id}`,
        sourceDay: day.day,
        groups: stop.id === "tpe-airport" ? ["days12", "days78"] as JourneyFilter[] : [stop.group],
        alternativeAvailable: Boolean(day.plans && day.plans.length > 1),
        selectedPlan: planSelections[day.day],
      })),
  );

  const confirmedStops = selectedMapStops
    .filter((stop) => !stop.optional)
    .sort((a, b) => a.sequence - b.sequence);
  const optionalStops = selectedMapStops
    .filter((stop) => stop.optional)
    .sort((a, b) => a.sequence - b.sequence);
  const finalJourneyNumber = confirmedStops.length + 1;
  const stops: JourneyStop[] = [
    ...confirmedStops.map((stop, index) => ({
      ...stop,
      order: stop.id === "tpe-airport" ? `1/${finalJourneyNumber}` : String(index + 1),
    })),
    ...optionalStops.map((stop) => ({ ...stop, order: "•" })),
  ];

  const mainRouteStops = stops.filter((stop) => !stop.optional);
  const segments = mainRouteStops.map((stop, index) => {
    const next = mainRouteStops[index + 1] ?? mainRouteStops[0];
    return {
      from: stop,
      to: next,
      group: index === mainRouteStops.length - 1 ? "days78" as JourneyFilter : next.group,
      routeStyle: index === mainRouteStops.length - 1 ? "coastal" as RouteStyle : next.routeStyle ?? "local",
    };
  });

  const filters: { id: JourneyFilter; label: string }[] = [
    { id: "all", label: "All Days" },
    { id: "days12", label: "Days 1–2" },
    { id: "days34", label: "Days 3–4" },
    { id: "days56", label: "Days 5–6" },
    { id: "days78", label: "Days 7–8" },
  ];

  const activeStop = selectedStop ?? hoveredStop;
  const filteredStops = filter === "all" ? stops : stops.filter((stop) => stop.groups.includes(filter));

  const isStopRelevant = (stop: JourneyStop) => filter === "all" || stop.groups.includes(filter);
  const isSegmentRelevant = (segment: typeof segments[number]) =>
    filter === "all" || segment.group === filter;
  const selectStop = (stop: JourneyStop) => {
    if (filter !== "all" && !stop.groups.includes(filter)) setFilter("all");
    setSelectedStop(stop.key);
  };

  useEffect(() => {
    if (selectedStop && !stops.some((stop) => stop.key === selectedStop)) setSelectedStop(null);
  }, [planSelections[2], planSelections[3], planSelections[8], selectedStop]);

  const routeColors: Record<RouteStyle, string> = {
    highway: "#1A6FA0",
    mountain: "#2E7D52",
    coastal: "#F4841F",
    local: "#5C7285",
  };

  return (
    <section id="map" className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <Badge color="blue">Self-Drive Route</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>The Full Journey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">8 days through Sun Moon Lake, Alishan, Chiayi, Hsinchu and the Taoyuan coast.</p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {filters.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={filter === item.id ? "default" : "outline"}
              onClick={() => {
                setFilter(item.id);
                setSelectedStop(null);
              }}
              aria-pressed={filter === item.id}
              className="rounded-full"
            >
              {item.label}
            </Button>
          ))}
          {(selectedStop !== null || filter !== "all") && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedStop(null);
                setFilter("all");
              }}
              className="rounded-full text-muted-foreground"
            >
              <X /> Full journey
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 bg-card rounded-3xl border border-border p-4 shadow-sm lg:sticky lg:top-24">
            <svg viewBox="0 0 250 430" className="w-full max-w-sm mx-auto" style={{ minHeight: 380 }} aria-label="Illustrative route map of Taiwan">
              <path d="M 105,8 C 125,5 148,12 163,24 C 193,40 218,65 228,95 C 238,120 241,148 237,178 C 232,208 225,235 218,262 C 210,298 200,330 182,360 C 165,385 145,405 126,415 C 110,420 93,415 78,406 C 60,394 45,372 36,348 C 25,320 20,292 21,263 C 22,234 26,206 34,180 C 43,150 52,122 66,97 C 80,70 92,42 105,8 Z"
                fill="#E8F0F7" stroke="#C5D8EA" strokeWidth="1.5" />
              {[100, 200, 300].map(y => <line key={y} x1="20" y1={y} x2="240" y2={y} stroke="#DDE6EE" strokeWidth="0.5" strokeDasharray="3,5" />)}
              {[80, 140, 200].map(x => <line key={x} x1={x} y1="20" x2={x} y2="410" stroke="#DDE6EE" strokeWidth="0.5" strokeDasharray="3,5" />)}
              {segments.map((segment) => {
                const from = segment.from;
                const to = segment.to;
                const adjacentToSelection = selectedStop !== null && (from.key === selectedStop || to.key === selectedStop);
                const relevant = isSegmentRelevant(segment);
                const emphasized = selectedStop !== null ? adjacentToSelection : relevant;
                const opacity = emphasized ? 0.95 : relevant ? 0.3 : 0.1;
                const selected = stops.find((stop) => stop.key === selectedStop);
                const stroke = adjacentToSelection && selected ? { blue: "#1A6FA0", green: "#2E7D52", orange: "#F4841F" }[selected.color] : routeColors[segment.routeStyle];
                const midX = (from.cx + to.cx) / 2;
                const midY = (from.cy + to.cy) / 2;
                const angle = Math.atan2(to.cy - from.cy, to.cx - from.cx) * 180 / Math.PI;

                return (
                  <g key={`${from.key}-${to.key}`} className="transition-opacity duration-300" opacity={opacity}>
                    <line
                      x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
                      stroke={stroke} strokeWidth={emphasized ? 2.5 : 1.5}
                      strokeDasharray="6,4" strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    <polygon
                      points="-4,-3 4,0 -4,3"
                      fill={stroke}
                      transform={`translate(${midX} ${midY}) rotate(${angle})`}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
              {stops.map((stop) => {
                const relevant = isStopRelevant(stop);
                const active = activeStop === stop.key;
                const selected = selectedStop === stop.key;
                const opacity = relevant ? (active ? 1 : 0.88) : 0.2;
                const colorHex = { blue: "#1A6FA0", green: "#2E7D52", orange: "#F4841F" }[stop.color];
                const showLabel = active || !stop.optional && (stop.overnight || ["tpe-airport", "fenqihu", "taiping", "taian-service-area", "yongan-harbor", "gloria-outlets"].includes(stop.id));

                return (
                <g
                  key={stop.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${stop.label}`}
                  onClick={() => selectStop(stop)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectStop(stop);
                    }
                  }}
                  onMouseEnter={() => setHoveredStop(stop.key)}
                  onMouseLeave={() => setHoveredStop(null)}
                  className="cursor-pointer outline-none transition-opacity duration-300"
                  opacity={opacity}
                >
                  {selected && <circle cx={stop.cx} cy={stop.cy} r="15" fill="none" stroke={colorHex} strokeWidth="1.5" opacity="0.35" />}
                  <circle
                    cx={stop.cx} cy={stop.cy} r={active ? 11 : 9}
                    fill={stop.optional ? "white" : colorHex}
                    stroke={stop.optional ? colorHex : "white"}
                    strokeWidth={stop.optional ? "2" : "2.5"}
                    strokeDasharray={stop.optional ? "2,2" : undefined}
                    className="transition-all duration-200"
                  />
                  <text
                    x={stop.cx} y={stop.cy + 2.5} textAnchor="middle"
                    fontSize={stop.order.length > 1 ? "5.5" : "7"} fill={stop.optional ? colorHex : "white"} fontWeight="700"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {stop.optional ? "•" : stop.order}
                  </text>
                  {showLabel && (
                    <>
                      <text x={stop.labelX} y={stop.labelY} textAnchor={stop.textAnchor} fontSize="8.5" fill="#1A2B3C" fontWeight="600" fontFamily="DM Sans, sans-serif">{stop.label}</text>
                      <text x={stop.labelX} y={stop.labelY + 9} textAnchor={stop.textAnchor} fontSize="6.5" fill="#5C7285" fontFamily="DM Sans, sans-serif">{stop.location}</text>
                    </>
                  )}
                </g>
                );
              })}
              <text x="125" y="425" textAnchor="middle" fontSize="8" fill="#5C7285" fontFamily="DM Sans, sans-serif">Illustrative route · not to scale</text>
            </svg>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold text-foreground">Marker legend</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" />Gateway & coast</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-accent" />Lake & forest</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-chart-1" />Culture & city</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-dashed border-muted-foreground bg-card" />Optional stop</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-primary" />Highway</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-accent" />Mountain</span>
                <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-chart-1" />Coastal</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredStops.map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  selected={selectedStop === stop.key}
                  highlighted={activeStop === stop.key}
                  onSelect={() => selectStop(stop)}
                  onHover={setHoveredStop}
                />
              ))}
            </AnimatePresence>

            {/* Driving summary */}
            <div className="bg-secondary rounded-2xl p-4 mt-2">
              <h4 className="font-semibold text-foreground text-sm mb-3">Driving Overview</h4>
              <div className="space-y-2">
                {[
                  { route: DAYS[0].route, detail: "Highways 3 & 6" },
                  { route: DAYS[2].route, detail: planSelections[3] === "Plan A" ? "Plan A · Checheng & Tataka" : "Plan B · YUYUPAS" },
                  { route: DAYS[4].route, detail: "Highway 18 mountain route" },
                  { route: DAYS[6].route, detail: "National Freeway No. 1" },
                  { route: DAYS[7].route, detail: `${planSelections[8]} · Highway 61 coast` },
                ].map((r) => (
                  <div key={r.route} className="flex items-center justify-between text-xs">
                    <span className="text-foreground flex items-center gap-1.5"><Car size={11} className="text-[#1A6FA0]" />{r.route}</span>
                    <span className="text-muted-foreground font-medium text-right">{r.detail}</span>
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
  return (
    <section id="food" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <Badge color="orange">Eat Your Way Through Taiwan</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Food Discovery</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Night markets, indigenous feasts, railway bentos, and fresh harbor seafood.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <p className="text-muted-foreground max-w-lg mx-auto">Four confirmed hotels across the journey — each chosen for location, comfort, and access.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {HOTELS.map((h) => (
          <motion.div key={h.name} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group">
            <div className="relative h-44 bg-[#1A2B3C] overflow-hidden">
              <ImageWithFallback src={h.localImage} alt={h.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge color="blue">{h.days}</Badge>
                  <span className="text-white/70 text-xs">{h.nights} {h.nights === 1 ? "night" : "nights"}</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-tight" style={SERIF}>{h.name}</h3>
                <p className="text-white/60 text-xs">{h.nameZh}</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Calendar size={11} className="text-[#F4841F] flex-shrink-0" />
                <span>{h.stayDates}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin size={11} className="text-[#1A6FA0] mt-0.5 flex-shrink-0" />
                <span>{h.location}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={11} className="text-[#1A6FA0]" />
                  Check-in {h.checkIn} · Check-out {h.checkOut}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Car size={11} className="text-[#1A6FA0]" />
                  {h.parking}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${h.breakfast ? "bg-[#E6F4ED] text-[#1A4D30]" : "bg-muted text-muted-foreground"}`}>
                <span>{h.breakfast ? "🍳" : "☕"}</span>
                {h.breakfast ? h.breakfast : "Breakfast not included"}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1.5">Highlights</p>
                <div className="space-y-1">
                  {h.features.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[#2E7D52]">✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <a href={h.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium bg-[#1A6FA0] text-white px-3 py-1.5 rounded-lg hover:bg-[#155d8a] transition-colors w-full justify-center mt-1">
                <Navigation size={11} /> Open in Google Maps
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── SouvenirsSection ─────────────────────────────────────────────────────────

function SouvenirsSection() {
  const [activeId, setActiveId] = useState<string>("sml");
  const active = SOUVENIRS.find(s => s.id === activeId)!;
  const tabColors: Record<string, string> = {
    blue: "bg-[#1A6FA0] text-white",
    green: "bg-[#2E7D52] text-white",
    orange: "bg-[#F4841F] text-white",
    grey: "bg-[#3A5068] text-white",
  };
  const tabIdle: Record<string, string> = {
    blue: "text-[#1A6FA0] hover:bg-[#E8F0F7]",
    green: "text-[#2E7D52] hover:bg-[#E6F4ED]",
    orange: "text-[#F4841F] hover:bg-[#FEF0E6]",
    grey: "text-[#5C7285] hover:bg-muted",
  };

  return (
    <section id="souvenirs" className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <Badge color="green">What to Bring Home</Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-3" style={SERIF}>Local Specialities</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Unique products and souvenirs found only at each destination — curated for the journey.</p>
      </div>

      {/* Location tabs */}
      <div className="flex items-center gap-2 justify-center flex-wrap mb-10">
        {SOUVENIRS.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveId(loc.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeId === loc.id ? tabColors[loc.color] : `bg-card border border-border ${tabIdle[loc.color]}`}`}
          >
            {loc.label}
            <span className="ml-1.5 opacity-60 text-xs font-normal">{loc.labelZh}</span>
          </button>
        ))}
      </div>

      {/* Product grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {active.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group"
            >
              <div className="relative h-44 overflow-hidden bg-muted">
                <img
                  src={item.imgSrc}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white/60 text-xs font-medium">{item.nameZh}</p>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <h4 className="font-bold text-foreground text-sm leading-snug" style={SERIF}>{item.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="pt-2 border-t border-border flex items-start gap-1.5">
                  <MapPin size={10} className="flex-shrink-0 mt-0.5" style={{ color: active.accent }} />
                  <span className="text-xs text-muted-foreground">{item.where}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
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
  const [planSelections, setPlanSelections] = useState<PlanSelections>(DEFAULT_PLAN_SELECTIONS);

  const handlePlanChange = useCallback((day: number, plan: "Plan A" | "Plan B") => {
    setPlanSelections((current) => ({ ...current, [day]: plan }));
  }, []);

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
        <ItinerarySection planSelections={planSelections} onPlanChange={handlePlanChange} />
        <HotelsSection />
        <AttractionsSection />
        <FoodSection />
        <MapSection planSelections={planSelections} />
        <SouvenirsSection />
        <Footer />
      </main>
    </div>
  );
}
