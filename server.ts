import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Global In-Memory Store for OTP rate-limiting, category tree, and mock listing search
interface OtpState {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}
const otpStore: Record<string, OtpState> = {}; // keyed by phone or email

export interface SimulatedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

import fs from "fs";

const getTmpFilePath = (fileName: string) => {
  const localPath = path.join(process.cwd(), fileName);
  const tmpPath = path.join("/tmp", fileName);
  try {
    if (!fs.existsSync(tmpPath)) {
      if (fs.existsSync(localPath)) {
        fs.copyFileSync(localPath, tmpPath);
      }
    }
  } catch (err) {
    console.error(`Error copying ${fileName} to /tmp:`, err);
  }
  return tmpPath;
};

const LISTINGS_FILE = getTmpFilePath("db_listings.json");
const USERS_FILE = getTmpFilePath("db_users.json");
const CATEGORIES_FILE = getTmpFilePath("db_categories.json");
const EMAILS_FILE = getTmpFilePath("db_emails.json");
const ADVERTISEMENTS_FILE = getTmpFilePath("db_advertisements.json");
const AD_CLICKS_FILE = getTmpFilePath("db_clicks.json");
const EXCHANGE_RATES_FILE = getTmpFilePath("db_exchange_rates.json");
const LOCATIONS_FILE = getTmpFilePath("db_locations.json");

const defaultAdvertisements = [
  {
    id: "ad_default_1",
    title: "AçıkBazar Mobil Uygulaması Yayında!",
    description: "Tüm ilanlara dilediğiniz yerden, hızlıca ulaşmak için yeni mobil uygulamamızı hemen indirin.",
    owner: "AcikBazar Destek Ekibi",
    imageUrl: "",
    link: "https://acikbazar.com/app",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    status: "active",
    metadata: "Sistem Varsayılan Reklamı",
    createdAt: new Date().toISOString()
  }
];
const defaultAdClicks: any[] = [];

const defaultEmails = [
  {
    id: "mail_welcome",
    from: "noreply@sahibinden-clone.com",
    to: "hciftci68@gmail.com",
    subject: "Sahibinden Clone Platformuna Hoş Geldiniz",
    body: "Merhaba,\n\nSahibinden Clone platformuna kaydınız başarıyla tamamlanmıştır. Güvenli ilan verebilmek için lütfen e-posta ve SMS onaylarınızı tamamlayın.\n\nSaygılarımızla,\nDestek Ekibi",
    sentAt: new Date().toISOString()
  }
];

const defaultListings = [
  {
    id: "1",
    userId: "user_ahmet_99",
    title: "Sahibinden Satılık 3+1 Lüks Daire",
    description: "Karanlık odası olmayan, ebeveyn banyolu, kombili, metroya 5 dk mesafede, geniş balkonlu, acil satılık daire.",
    category: "Emlak > Konut > Satılık Daire",
    price: 3250000,
    location: { lat: 41.0151, lng: 28.9795, address: "Fatih, İstanbul" },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
    featured: true,
    createdAt: "2026-07-01T10:00:00Z",
    tags: ["acil", "metroya yakın", "lüks", "kombili"],
    attributes: { "oda_sayisi": "3+1", "m2": "120", "isinma": "Doğalgaz (Kombi)" },
    status: "approved"
  },
  {
    id: "2",
    userId: "user_ahmet_99",
    title: "Temiz Kazasız Volkswagen Golf 1.6 TDI",
    description: "İlk sahibinden, değişensiz, sadece sol çamurluk boyalı, bakımları yeni yapılmış, düşük kilometreli aile arabası.",
    category: "Vasıta > Otomobil > Volkswagen",
    price: 845000,
    location: { lat: 40.1885, lng: 29.0610, address: "Nilüfer, Bursa" },
    images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"],
    featured: true,
    createdAt: "2026-07-02T14:30:00Z",
    tags: ["golf", "temiz", "sahibinden", "düşük km"],
    attributes: { "yil": "2018", "km": "85.000", "yakit": "Dizel", "vites": "Otomatik" },
    status: "approved"
  },
  {
    id: "3",
    userId: "user_ayse_22",
    title: "iPhone 15 Pro Max 256GB - Kusursuz",
    description: "Kutulu, faturalı, Türkiye garantili, pil sağlığı %94, hiç tamir görmemiş, kılcal çiziksiz kılıfıyla kullanılmış telefon.",
    category: "Alışveriş > Cep Telefonu > Apple",
    price: 68000,
    location: { lat: 39.9334, lng: 32.8597, address: "Çankaya, Ankara" },
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
    featured: false,
    createdAt: "2026-07-05T09:15:00Z",
    tags: ["iphone", "pro max", "temiz", "garantili"],
    attributes: { "renk": "Doğal Titanyum", "garanti": "Var", "dahili_hafiza": "256 GB" },
    status: "approved"
  },
  {
    id: "4",
    userId: "user_mehmet_55",
    title: "Kiralık Eşyalı Stüdyo Rezidans Daire",
    description: "Merkezi konumda, güvenlikli site içerisinde, tüm beyaz eşyaları tam ve yeni, havuz ve spor salonu olanaklı lüks stüdyo.",
    category: "Emlak > Konut > Kiralık Daire",
    price: 18000,
    location: { lat: 41.0853, lng: 29.0112, address: "Şişli, İstanbul" },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    featured: false,
    createdAt: "2026-07-07T18:00:00Z",
    tags: ["kiralık", "eşyalı", "rezidans", "güvenlikli"],
    attributes: { "oda_sayisi": "1+0", "m2": "50", "isitma": "Merkezi Pay Ölçer" },
    status: "approved"
  },
  {
    id: "5",
    userId: "user_ahmet_99",
    title: "Yamaha MT-07 - Aksesuarlı ve Düşük KM",
    description: "Hasar kaydı yok, çanta demiri, koruma takozu, radyatör koruma ve katlanır plaka aksesuarları mevcut. Garaj motorudur.",
    category: "Vasıta > Motosiklet > Yamaha",
    price: 340000,
    location: { lat: 38.4192, lng: 27.1287, address: "Konak, İzmir" },
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"],
    featured: true,
    createdAt: "2026-07-06T11:45:00Z",
    tags: ["yamaha", "mt07", "temiz", "aksesuarlı"],
    attributes: { "yil": "2021", "km": "12.000", "motor_hacmi": "650 - 700 cc" },
    status: "approved"
  }
];

const defaultUsers = [
  {
    id: "user_ad_8891",
    email: "hciftci68@gmail.com",
    phone: "+905051234567",
    name: "Hakan Çiftçi",
    status: "UNVERIFIED",
    role: "admin",
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    oneSignalPlayerId: null,
    oneSignalExternalId: null,
    password: "123456",
    country: "Türkiye",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Moda Caddesi No:45 Daire:3"
  },
  {
    id: "user_ahmet_99",
    email: "ahmet@example.com",
    phone: "+905329876543",
    name: "Ahmet Yılmaz",
    status: "FULLY_VERIFIED",
    role: "adv owner",
    emailVerifiedAt: "2026-07-03T11:00:00Z",
    phoneVerifiedAt: "2026-07-03T11:15:00Z",
    oneSignalPlayerId: "8bf07312-32a1-432d-9f44-8cb312dd71c4",
    oneSignalExternalId: "user_ahmet_99",
    password: "123456",
    country: "Türkiye",
    city: "İzmir",
    district: "Bornova",
    address: "Ege Üniversitesi Lojmanları No:12"
  },
  {
    id: "user_ayse_22",
    email: "ayse@demircelik.com",
    phone: "+905441112233",
    name: "Ayşe Demir",
    status: "EMAIL_VERIFIED",
    role: "user",
    emailVerifiedAt: "2026-07-05T14:20:00Z",
    phoneVerifiedAt: null,
    oneSignalPlayerId: null,
    oneSignalExternalId: null,
    password: "123456",
    country: "KKTC",
    city: "Girne",
    district: "Alsancak",
    address: "Deniz Sokak No:5"
  },
  {
    id: "user_mehmet_55",
    email: "mehmet@kaya.net",
    phone: "+905553334455",
    name: "Mehmet Kaya",
    status: "UNVERIFIED",
    role: "user",
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    oneSignalPlayerId: null,
    oneSignalExternalId: null,
    password: "123456",
    country: "KKTC",
    city: "Lefkoşa",
    district: "Gönyeli",
    address: "Atatürk Caddesi No:88"
  }
];

const defaultExchangeRates = [
  {
    id: "rates_latest",
    rates: {
      TL: 1.0,
      USD: 33.5,
      GBP: 43.2
    },
    lastUpdated: new Date().toISOString()
  }
];

const defaultLocations = [
  {
    id: "loc_tr",
    name: "Türkiye",
    cities: [
      {
        name: "İstanbul",
        districts: ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih", "Sarıyer", "Ataşehir", "Maltepe", "Pendik", "Beyoğlu"]
      },
      {
        name: "Ankara",
        districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Gölbaşı"]
      },
      {
        name: "İzmir",
        districts: ["Bornova", "Karşıyaka", "Konak", "Çeşme", "Buca", "Bayraklı", "Aliağa", "Urla"]
      },
      {
        name: "Antalya",
        districts: ["Muratpaşa", "Konyaaltı", "Alanya", "Manavgat", "Kemer", "Kepez"]
      },
      {
        name: "Bursa",
        districts: ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik"]
      }
    ]
  },
  {
    id: "loc_kktc",
    name: "KKTC",
    cities: [
      {
        name: "Lefkoşa",
        districts: ["Gönyeli", "Ortaköy", "Hamitköy", "Kumsal", "Çağlayan", "Kızılay"]
      },
      {
        name: "Gazimağusa",
        districts: ["Maraş", "Sakarya", "Karakol", "Baykal", "Dumlupınar", "Tuzla"]
      },
      {
        name: "Girne",
        districts: ["Alsancak", "Lapta", "Karaoğlanoğlu", "Edremit", "Zeytinlik", "Çatalköy"]
      },
      {
        name: "Güzelyurt",
        districts: ["Yayla", "Bostancı", "Kalkanlı", "Aydınköy", "Güneşköy"]
      },
      {
        name: "İskele",
        districts: ["Yeni İskele", "Boğaz", "Bafra", "Aygün", "Kayıp"]
      }
    ]
  }
];

const defaultCategories = [
  {
    id: "cat_emlak",
    parentId: null,
    nameTr: "Emlak",
    nameEn: "Real Estate",
    slug: "emlak",
    icon: "Home",
    maxImages: 15,
    attributes: [
      { key: "isinma", label_tr: "Isınma Tipi", label_en: "Heating Type", type: "select", required: true, options: ["Kombi", "Merkezi Pay Ölçer", "Yerden Isıtma", "Klima"] }
    ]
  },
  {
    id: "cat_konut",
    parentId: "cat_emlak",
    nameTr: "Konut",
    nameEn: "Housing",
    slug: "konut",
    icon: "Building",
    maxImages: 20,
    attributes: [
      { key: "m2", label_tr: "Metrekare (Brüt)", label_en: "Square Meters (Gross)", type: "number", required: true }
    ]
  },
  {
    id: "cat_satilik_daire",
    parentId: "cat_konut",
    nameTr: "Satılık Daire",
    nameEn: "Apartment for Sale",
    slug: "satilik-daire",
    icon: "Building2",
    maxImages: 25,
    attributes: [
      { key: "oda_sayisi", label_tr: "Oda Sayısı", label_en: "Room Count", type: "select", required: true, options: ["1+0", "1+1", "2+1", "3+1", "4+2"] },
      { key: "bina_yasi", label_tr: "Bina Yaşı", label_en: "Building Age", type: "select", required: false, options: ["0 (Yeni)", "1-5", "6-10", "11-15", "16+"] }
    ]
  },
  {
    id: "cat_kiralik_daire",
    parentId: "cat_konut",
    nameTr: "Kiralık Daire",
    nameEn: "Apartment for Rent",
    slug: "kiralik-daire",
    icon: "KeyRound",
    maxImages: 15,
    attributes: [
      { key: "oda_sayisi", label_tr: "Oda Sayısı", label_en: "Room Count", type: "select", required: true, options: ["1+0", "1+1", "2+1", "3+1", "4+2"] },
      { key: "depozito", label_tr: "Depozito Tutarı (TL)", label_en: "Deposit Amount (TRY)", type: "number", required: true }
    ]
  },
  {
    id: "cat_vasita",
    parentId: null,
    nameTr: "Vasıta",
    nameEn: "Vehicles",
    slug: "vasita",
    icon: "Car",
    maxImages: 10,
    attributes: [
      { key: "vites", label_tr: "Vites Tipi", label_en: "Transmission", type: "select", required: true, options: ["Manuel", "Yarı Otomatik", "Otomatik"] }
    ]
  },
  {
    id: "cat_otomobil",
    parentId: "cat_vasita",
    nameTr: "Otomobil",
    nameEn: "Cars",
    slug: "otomobil",
    icon: "Gauge",
    maxImages: 12,
    attributes: [
      { key: "yil", label_tr: "Model Yılı", label_en: "Model Year", type: "number", required: true },
      { key: "yakit", label_tr: "Yakup Tipi", label_en: "Fuel Type", type: "select", required: true, options: ["Benzin", "Dizel", "LPG", "Elektrik", "Hibrit"] },
      { key: "marka", label_tr: "Marka", label_en: "Brand", type: "select", required: true, options: ["BMW", "Mercedes", "Audi", "Volkswagen"] },
      { key: "model", label_tr: "Model", label_en: "Model", type: "select", required: true, options: [
        "BMW:320i", "BMW:520d", "BMW:M3",
        "Mercedes:C200", "Mercedes:E180", "Mercedes:CLA 180",
        "Audi:A3", "Audi:A4", "Audi:A6",
        "Volkswagen:Golf", "Volkswagen:Passat", "Volkswagen:Polo"
      ] }
    ]
  },
  {
    id: "cat_elektronik",
    parentId: null,
    nameTr: "Elektronik",
    nameEn: "Electronics",
    slug: "elektronik",
    icon: "Laptop",
    maxImages: 5,
    attributes: [
      { key: "garanti", label_tr: "Garanti Durumu", label_en: "Warranty Status", type: "select", required: true, options: ["Garantisi Var", "Garantisi Bitti"] }
    ]
  },
  {
    id: "cat_telefon",
    parentId: "cat_elektronik",
    nameTr: "Cep Telefonu",
    nameEn: "Mobile Phones",
    slug: "telefon",
    icon: "Smartphone",
    maxImages: 8,
    attributes: [
      { key: "hafiza", label_tr: "Dahili Hafıza", label_en: "Internal Storage", type: "select", required: true, options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
      { key: "marka", label_tr: "Marka", label_en: "Brand", type: "select", required: true, options: ["Apple", "Samsung", "Xiaomi"] },
      { key: "model", label_tr: "Model", label_en: "Model", type: "select", required: true, options: [
        "Apple:iPhone 13", "Apple:iPhone 14", "Apple:iPhone 15",
        "Samsung:Galaxy S23", "Samsung:Galaxy S24", "Samsung:Galaxy A54",
        "Xiaomi:Redmi Note 12", "Xiaomi:Redmi Note 13", "Xiaomi:Mi 13"
      ] }
    ]
  }
];

// --- FIREBASE FIRESTORE SYNC ENGINE ---
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";

const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = null;
if (fs.existsSync(CONFIG_FILE)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch (err) {
    console.error("Error reading firebase-applet-config.json:", err);
  }
}

let cachedListings: any[] = [];
let cachedUsers: any[] = [];
let cachedCategories: any[] = [];
let cachedEmails: any[] = [];
let cachedAdvertisements: any[] = [];
let cachedAdClicks: any[] = [];
let cachedExchangeRates: any[] = [];
let cachedLocations: any[] = [];
let isDataLoaded = false;
let firestoreDb: any = null;

function getFirestoreDb() {
  if (!firestoreDb && firebaseConfig) {
    try {
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } catch (err) {
      console.error("Error initializing Firestore DB:", err);
    }
  }
  return firestoreDb;
}

async function loadDataFromFirestore() {
  const db = getFirestoreDb();
  if (!db) {
    console.log("Firestore not configured, fallback to local JSON files");
    return;
  }

  console.log("Loading initial database collections from Firestore...");
  isDataLoaded = true; // Mark as true so we prefer in-memory cached state where available

  // 1. Categories
  try {
    const categoriesSnap = await getDocs(collection(db, "categories"));
    if (categoriesSnap.empty) {
      console.log("Seeding default categories to Firestore...");
      const batch = writeBatch(db);
      for (const cat of defaultCategories) {
        batch.set(doc(db, "categories", cat.id), cat);
      }
      await batch.commit();
      cachedCategories = [...defaultCategories];
    } else {
      cachedCategories = categoriesSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'categories', fallback to local file:", err);
    cachedCategories = readJsonFile(CATEGORIES_FILE, defaultCategories);
  }

  // 2. Users
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty) {
      console.log("Seeding default users to Firestore...");
      const batch = writeBatch(db);
      for (const u of defaultUsers) {
        batch.set(doc(db, "users", u.id), u);
      }
      await batch.commit();
      cachedUsers = [...defaultUsers];
    } else {
      cachedUsers = usersSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'users', fallback to local file:", err);
    cachedUsers = readJsonFile(USERS_FILE, defaultUsers);
  }

  // 3. Listings
  try {
    const listingsSnap = await getDocs(collection(db, "listings"));
    if (listingsSnap.empty) {
      console.log("Seeding default listings to Firestore...");
      const batch = writeBatch(db);
      for (const l of defaultListings) {
        batch.set(doc(db, "listings", l.id), l);
      }
      await batch.commit();
      cachedListings = [...defaultListings];
    } else {
      cachedListings = listingsSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'listings', fallback to local file:", err);
    cachedListings = readJsonFile(LISTINGS_FILE, defaultListings);
  }

  // 4. Emails
  try {
    const emailsSnap = await getDocs(collection(db, "emails"));
    if (emailsSnap.empty) {
      console.log("Seeding default emails to Firestore...");
      const batch = writeBatch(db);
      for (const em of defaultEmails) {
        batch.set(doc(db, "emails", em.id), em);
      }
      await batch.commit();
      cachedEmails = [...defaultEmails];
    } else {
      cachedEmails = emailsSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'emails', fallback to local file:", err);
    cachedEmails = readJsonFile(EMAILS_FILE, defaultEmails);
  }

  // 5. Advertisements
  try {
    const adsSnap = await getDocs(collection(db, "advertisements"));
    if (adsSnap.empty) {
      console.log("Seeding default advertisements to Firestore...");
      const batch = writeBatch(db);
      for (const ad of defaultAdvertisements) {
        batch.set(doc(db, "advertisements", ad.id), ad);
      }
      await batch.commit();
      cachedAdvertisements = [...defaultAdvertisements];
    } else {
      cachedAdvertisements = adsSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'advertisements', fallback to local file:", err);
    cachedAdvertisements = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
  }

  // 6. Ad Clicks
  try {
    const clicksSnap = await getDocs(collection(db, "ad_clicks"));
    if (clicksSnap.empty) {
      cachedAdClicks = [];
    } else {
      cachedAdClicks = clicksSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'ad_clicks', fallback to local file:", err);
    cachedAdClicks = readJsonFile(AD_CLICKS_FILE, []);
  }

  // 7. Exchange Rates
  try {
    const ratesSnap = await getDocs(collection(db, "exchange_rates"));
    if (ratesSnap.empty) {
      console.log("Seeding default exchange rates to Firestore...");
      const batch = writeBatch(db);
      for (const r of defaultExchangeRates) {
        batch.set(doc(db, "exchange_rates", r.id), r);
      }
      await batch.commit();
      cachedExchangeRates = [...defaultExchangeRates];
    } else {
      cachedExchangeRates = ratesSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'exchange_rates', fallback to local file:", err);
    cachedExchangeRates = readJsonFile(EXCHANGE_RATES_FILE, defaultExchangeRates);
  }

  // 8. Locations
  try {
    const locationsSnap = await getDocs(collection(db, "locations"));
    if (locationsSnap.empty) {
      console.log("Seeding default locations to Firestore...");
      const batch = writeBatch(db);
      for (const loc of defaultLocations) {
        batch.set(doc(db, "locations", loc.id), loc);
      }
      await batch.commit();
      cachedLocations = [...defaultLocations];
    } else {
      cachedLocations = locationsSnap.docs.map((doc: any) => doc.data());
    }
  } catch (err) {
    console.error("Firestore error loading 'locations', fallback to local file:", err);
    cachedLocations = readJsonFile(LOCATIONS_FILE, defaultLocations);
  }

  console.log("Firestore collections fully synchronized in-memory.");
}

async function syncCollectionToFirestore(collectionName: string, dataArray: any[]): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const batch = writeBatch(db);
    const existingIds = dataArray.map(item => item.id);

    // Set or update current items, with proactive protection against Firestore 1MB document size limit
    for (const item of dataArray) {
      if (!item.id) continue;

      let docData = JSON.parse(JSON.stringify(item));
      let serialized = JSON.stringify(docData);

      // Proactive size limit check (Firestore limits documents to 1,048,576 bytes)
      if (serialized.length > 800 * 1024) {
        console.warn(`[FIRESTORE SYNC] Document '${item.id}' in collection '${collectionName}' is extremely large (${(serialized.length / 1024 / 1024).toFixed(2)} MB). Optimizing image sizes...`);
        
        // Optimize array of images
        if (docData.images && Array.isArray(docData.images)) {
          docData.images = docData.images.map((img: string) => {
            // Replace giant raw base64 data URLs with elegant stock photo placeholders to stay under 1MB
            if (img && img.startsWith("data:image/") && img.length > 150 * 1024) {
              console.log(`[FIRESTORE SYNC] Replaced giant base64 image in array (${(img.length / 1024).toFixed(1)} KB) with a premium lightweight stock image placeholder.`);
              return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";
            }
            return img;
          });
        }

        // Optimize single image properties (like imageUrl)
        for (const key of Object.keys(docData)) {
          const val = docData[key];
          if (typeof val === "string" && val.startsWith("data:image/") && val.length > 150 * 1024) {
            console.log(`[FIRESTORE SYNC] Replaced giant base64 image in field '${key}' (${(val.length / 1024).toFixed(1)} KB) with a premium lightweight stock image placeholder.`);
            docData[key] = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";
          }
        }
      }

      batch.set(doc(db, collectionName, item.id), docData);
    }

    // Safely delete any records removed in local memory
    const snap = await getDocs(collection(db, collectionName));
    for (const d of snap.docs) {
      if (!existingIds.includes(d.id)) {
        batch.delete(d.ref);
      }
    }

    await batch.commit();
    console.log(`Firestore collection '${collectionName}' successfully synced.`);
    return true;
  } catch (err) {
    console.error(`Error syncing collection '${collectionName}' to Firestore:`, err);
    return false;
  }
}

function readJsonFile(filePath: string, defaultValue: any): any {
  if (isDataLoaded) {
    if (filePath === LISTINGS_FILE) return cachedListings;
    if (filePath === USERS_FILE) return cachedUsers;
    if (filePath === CATEGORIES_FILE) return cachedCategories;
    if (filePath === EMAILS_FILE) return cachedEmails;
    if (filePath === ADVERTISEMENTS_FILE) return cachedAdvertisements;
    if (filePath === AD_CLICKS_FILE) return cachedAdClicks;
    if (filePath === EXCHANGE_RATES_FILE) return cachedExchangeRates;
    if (filePath === LOCATIONS_FILE) return cachedLocations;
  }

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading JSON file " + filePath + ":", err);
    return defaultValue;
  }
}

function writeJsonFile(filePath: string, data: any): void {
  if (isDataLoaded) {
    if (filePath === LISTINGS_FILE) {
      cachedListings = data;
      syncCollectionToFirestore("listings", data);
    } else if (filePath === USERS_FILE) {
      cachedUsers = data;
      syncCollectionToFirestore("users", data);
    } else if (filePath === CATEGORIES_FILE) {
      cachedCategories = data;
      syncCollectionToFirestore("categories", data);
    } else if (filePath === EMAILS_FILE) {
      cachedEmails = data;
      syncCollectionToFirestore("emails", data);
    } else if (filePath === ADVERTISEMENTS_FILE) {
      cachedAdvertisements = data;
      syncCollectionToFirestore("advertisements", data);
    } else if (filePath === AD_CLICKS_FILE) {
      cachedAdClicks = data;
      syncCollectionToFirestore("ad_clicks", data);
    } else if (filePath === EXCHANGE_RATES_FILE) {
      cachedExchangeRates = data;
      syncCollectionToFirestore("exchange_rates", data);
    } else if (filePath === LOCATIONS_FILE) {
      cachedLocations = data;
      syncCollectionToFirestore("locations", data);
    }
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON file " + filePath + ":", err);
  }
}

async function writeAndSyncJsonFile(filePath: string, data: any): Promise<boolean> {
  if (isDataLoaded) {
    if (filePath === LISTINGS_FILE) cachedListings = data;
    else if (filePath === USERS_FILE) cachedUsers = data;
    else if (filePath === CATEGORIES_FILE) cachedCategories = data;
    else if (filePath === EMAILS_FILE) cachedEmails = data;
    else if (filePath === ADVERTISEMENTS_FILE) cachedAdvertisements = data;
    else if (filePath === AD_CLICKS_FILE) cachedAdClicks = data;
    else if (filePath === EXCHANGE_RATES_FILE) cachedExchangeRates = data;
    else if (filePath === LOCATIONS_FILE) cachedLocations = data;
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON file " + filePath + ":", err);
  }

  let syncResult = true;
  if (isDataLoaded) {
    if (filePath === LISTINGS_FILE) {
      syncResult = await syncCollectionToFirestore("listings", data);
    } else if (filePath === USERS_FILE) {
      syncResult = await syncCollectionToFirestore("users", data);
    } else if (filePath === CATEGORIES_FILE) {
      syncResult = await syncCollectionToFirestore("categories", data);
    } else if (filePath === EMAILS_FILE) {
      syncResult = await syncCollectionToFirestore("emails", data);
    } else if (filePath === ADVERTISEMENTS_FILE) {
      syncResult = await syncCollectionToFirestore("advertisements", data);
    } else if (filePath === AD_CLICKS_FILE) {
      syncResult = await syncCollectionToFirestore("ad_clicks", data);
    } else if (filePath === EXCHANGE_RATES_FILE) {
      syncResult = await syncCollectionToFirestore("exchange_rates", data);
    } else if (filePath === LOCATIONS_FILE) {
      syncResult = await syncCollectionToFirestore("locations", data);
    }
  }
  return syncResult;
}

// Helper Levenshtein Distance for fuzzy matching
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const substitutionCost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + substitutionCost // substitution
      );
    }
  }
  return d[m][n];
}

// Check if fuzzy matches a word in target
function fuzzyMatchWord(queryWord: string, targetText: string): boolean {
  const words = targetText.toLowerCase().replace(/[^a-z0-9ğüşöçıı]/g, " ").split(/\s+/);
  const q = queryWord.toLowerCase();
  
  if (q.length < 3) {
    return words.some(w => w.startsWith(q));
  }

  for (const w of words) {
    if (w.includes(q)) return true;
    
    const maxDist = q.length <= 5 ? 1 : 2;
    if (Math.abs(w.length - q.length) <= maxDist) {
      if (levenshteinDistance(q, w) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}

// Helper for offline mockup fallback fields
function getMockCategoryFields(cat: string): any[] {
  const lowerCat = cat.toLowerCase();
  if (lowerCat.includes("daire") || lowerCat.includes("emlak") || lowerCat.includes("konut")) {
    return [
      { key: "oda_sayisi", label_tr: "Oda Sayısı", label_en: "Room Count", type: "select", required: true, options: ["1+0", "1+1", "2+1", "3+1", "4+2"] },
      { key: "m2_net", label_tr: "Net Metrekare", label_en: "Net Square Meters", type: "number", required: true },
      { key: "bina_yasi", label_tr: "Bina Yaşı", label_en: "Building Age", type: "select", required: false, options: ["0 (Yeni)", "1-5", "6-10", "11-15", "16+"] },
      { key: "isinma", label_tr: "Isınma Tipi", label_en: "Heating Type", type: "select", required: true, options: ["Kombi", "Merkezi Pay Ölçer", "Yerden Isıtma", "Klima"] },
      { key: "esyali", label_tr: "Eşyalı mı?", label_en: "Furnished?", type: "boolean", required: true }
    ];
  } else if (lowerCat.includes("otomobil") || lowerCat.includes("vasıta") || lowerCat.includes("car") || lowerCat.includes("araba")) {
    return [
      { key: "yil", label_tr: "Model Yılı", label_en: "Model Year", type: "number", required: true },
      { key: "km", label_tr: "Kilometre", label_en: "Kilometers", type: "number", required: true },
      { key: "vites", label_tr: "Vites Tipi", label_en: "Transmission", type: "select", required: true, options: ["Manuel", "Yarı Otomatik", "Otomatik"] },
      { key: "yakit", label_tr: "Yakup Tipi", label_en: "Fuel Type", type: "select", required: true, options: ["Benzin", "Dizel", "LPG", "Elektrik", "Hibrit"] },
      { key: "hasar_kaydi", label_tr: "Hasar Kaydı Var mı?", label_en: "Has Damage Record?", type: "boolean", required: false }
    ];
  } else if (lowerCat.includes("telefon") || lowerCat.includes("cep") || lowerCat.includes("elektronik") || lowerCat.includes("phone")) {
    return [
      { key: "hafiza", label_tr: "Dahili Hafıza", label_en: "Internal Storage", type: "select", required: true, options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
      { key: "garanti", label_tr: "Garanti Durumu", label_en: "Warranty Status", type: "select", required: true, options: ["Garantisi Var", "Garantisi Bitti", "İthalatçı Garantili"] },
      { key: "renk", label_tr: "Renk", label_en: "Color", type: "text", required: false },
      { key: "pil_sagligi", label_tr: "Pil Sağlığı (%)", label_en: "Battery Health (%)", type: "number", required: false }
    ];
  } else {
    return [
      { key: "durum", label_tr: "Ürün Durumu", label_en: "Item Condition", type: "select", required: true, options: ["Sıfır", "İkinci El (Çok Temiz)", "İkinci El (Yıpranmış)", "Kusurlu/Yedek Parça"] },
      { key: "marka", label_tr: "Marka / Üretici", label_en: "Brand / Manufacturer", type: "text", required: true },
      { key: "garanti_var_mi", label_tr: "Garantisi Var mı?", label_en: "Has Warranty?", type: "boolean", required: false }
    ];
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Wait for Firestore to load existing database or seed default values
  await loadDataFromFirestore();

  const PORT = 3000;

  // Lazy initialize Gemini AI with metadata headers
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        console.warn("GEMINI_API_KEY is not set in environment variables. Dynamic field suggestions will run in fallback mode.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key || "MOCK_KEY",
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // 1. AI Dynamic Fields Generator using Gemini
  app.post("/api/dynamic-fields", async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
      return res.status(400).json({ error: "Kategori adı gereklidir." });
    }

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY === "MOCK_KEY") {
        console.log("No valid API Key. Returning rich placeholder attributes for category:", categoryName);
        const mockAttributes = getMockCategoryFields(categoryName);
        return res.json({ attributes: mockAttributes, source: "mock" });
      }

      const ai = getAi();
      const prompt = `İlan sitesi için "${categoryName}" kategorisine özel dinamik ilan özellikleri (form alanları) üret. 
Her özelliğin; 'key' (benzersiz ingilizce id, örn: 'room_count'), 'label_tr' (Türkçe etiketi, örn: 'Oda Sayısı'), 'label_en' (İngilizce etiketi, örn: 'Room Count'), 'type' ('text', 'number', 'select' veya 'boolean'), 'required' (boolean) ve 'options' (eğer type 'select' ise seçeneklerin listesi, örn: ["3+1", "2+1"]) değerleri bulunmalıdır. 4-6 arası en mantıklı, ayırt edici alanları çıkar.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["attributes"],
            properties: {
              attributes: {
                type: Type.ARRAY,
                description: "List of specific attributes for this classified category",
                items: {
                  type: Type.OBJECT,
                  required: ["key", "label_tr", "label_en", "type", "required"],
                  properties: {
                    key: { type: Type.STRING },
                    label_tr: { type: Type.STRING },
                    label_en: { type: Type.STRING },
                    type: { 
                      type: Type.STRING, 
                      description: "Must be one of: text, number, select, boolean" 
                    },
                    required: { type: Type.BOOLEAN },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of choices if type is select, otherwise null or empty list"
                    }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json({ attributes: data.attributes || [], source: "gemini" });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ 
        error: "Yapay zeka alanları üretirken bir hata oluştu.", 
        details: error.message,
        fallback: getMockCategoryFields(categoryName)
      });
    }
  });

  // 2. Full-Text & Fuzzy Search Endpoint
  app.post("/api/fuzzy-search", (req, res) => {
    const { query, category, minPrice, maxPrice, featuredOnly, includePending, userId, queryCurrency, attributes } = req.body;
    const currentUserId = req.headers["x-user-id"] || userId;
    const userRole = req.headers["x-user-role"] || "";
    const isAdmin = userRole === "admin";
    
    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    let results = [...listings];

    const ratesData = readJsonFile(EXCHANGE_RATES_FILE, defaultExchangeRates);
    const rates = (ratesData && ratesData[0] && ratesData[0].rates) || { TL: 1.0, USD: 33.5, GBP: 43.2 };

    const convertPrice = (price: number, from: string | undefined, to: string): number => {
      const fromCur = from || "TL";
      const toCur = to;
      if (fromCur === toCur) return price;
      const rateFrom = rates[fromCur] || 1.0;
      const priceInTL = price * rateFrom;
      const rateTo = rates[toCur] || 1.0;
      return priceInTL / rateTo;
    };

    // Filter out pending and rejected listings unless includePending is set to true, or the requester is an admin, or the item belongs to the requesting user
    if (!includePending && !isAdmin) {
      results = results.filter(item => 
        (item as any).status === "approved" || 
        (item as any).status === undefined ||
        (currentUserId && (item as any).userId === currentUserId)
      );
    }

    if (category) {
      const categories = readJsonFile(CATEGORIES_FILE, defaultCategories);
      results = results.filter(item => {
        // Match by item's category name text if present
        if (item.category && item.category.toLowerCase().includes(category.toLowerCase())) {
          return true;
        }
        // Match by item's categoryId matching the categories name or parent recursively
        if (item.categoryId) {
          const checkCategoryMatch = (catId: string, filterStr: string): boolean => {
            const c = categories.find((x: any) => x.id === catId);
            if (!c) return false;
            if (c.id === filterStr || 
                (c.nameTr && c.nameTr.toLowerCase().includes(filterStr.toLowerCase())) ||
                (c.nameEn && c.nameEn.toLowerCase().includes(filterStr.toLowerCase())) ||
                (c.slug && c.slug.toLowerCase().includes(filterStr.toLowerCase()))) {
              return true;
            }
            if (c.parentId) {
              return checkCategoryMatch(c.parentId, filterStr);
            }
            return false;
          };
          return checkCategoryMatch(item.categoryId, category);
        }
        return false;
      });
    }
    if (minPrice !== undefined && minPrice !== "") {
      results = results.filter(item => {
        const itemPriceConverted = queryCurrency && queryCurrency !== "original" ? convertPrice(item.price, item.currency, queryCurrency) : item.price;
        return itemPriceConverted >= Number(minPrice);
      });
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      results = results.filter(item => {
        const itemPriceConverted = queryCurrency && queryCurrency !== "original" ? convertPrice(item.price, item.currency, queryCurrency) : item.price;
        return itemPriceConverted <= Number(maxPrice);
      });
    }
    if (featuredOnly) {
      results = results.filter(item => item.featured);
    }

    if (attributes && typeof attributes === "object") {
      results = results.filter(item => {
        return Object.entries(attributes).every(([key, filterVal]) => {
          if (filterVal === undefined || filterVal === null || filterVal === "") return true;
          const itemVal = item.attributes ? item.attributes[key] : undefined;
          if (itemVal === undefined || itemVal === null) return false;
          return String(itemVal).toLowerCase().includes(String(filterVal).toLowerCase());
        });
      });
    }

    if (query && query.trim() !== "") {
      const qWords = query.trim().toLowerCase().split(/\s+/);
      results = results.filter(item => {
        return qWords.every(qWord => {
          const inTitle = fuzzyMatchWord(qWord, item.title || "");
          const inDesc = fuzzyMatchWord(qWord, item.description || "");
          const inTags = item.tags && item.tags.some((tag: string) => fuzzyMatchWord(qWord, tag));
          const inCat = fuzzyMatchWord(qWord, item.category || "");
          return inTitle || inDesc || inTags || inCat;
        });
      });
    }

    return res.json({ count: results.length, data: results });
  });

  // 3. SMS/Email OTP code sender with rate-limiting (Security Simulation)
  app.post("/api/send-otp", (req, res) => {
    const { type, destination } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: "Lütfen bir telefon numarası veya e-posta adresi belirtin." });
    }

    const now = Date.now();
    const existing = otpStore[destination];

    if (existing && (now - existing.lastSentAt) < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({ 
        error: `Güvenlik nedeniyle çok sık kod gönderemezsiniz. Lütfen ${secondsLeft} saniye sonra tekrar deneyin.`,
        rateLimited: true,
        secondsLeft
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[destination] = {
      code: otpCode,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0,
      lastSentAt: now
    };

    console.log(`[OTP SENT] Type: ${type}, Destination: ${destination}, Code: ${otpCode}`);

    return res.json({ 
      success: true, 
      message: `${type === "sms" ? "SMS doğrulama kodu cep telefonunuza gönderildi" : "E-posta doğrulama linki ve kodu gönderildi"}.`,
      debugCode: otpCode,
      expiresIn: "5 dakika"
    });
  });

  // 4. OTP Verification (with brute-force limit check)
  app.post("/api/verify-otp", (req, res) => {
    const { destination, code } = req.body;

    if (!destination || !code) {
      return res.status(400).json({ error: "Hedef adres ve doğrulama kodu zorunludur." });
    }

    const otp = otpStore[destination];
    if (!otp) {
      return res.status(404).json({ error: "Bu numara veya e-posta için aktif bir doğrulama talebi bulunamadı." });
    }

    if (otp.attempts >= 3) {
      return res.status(403).json({ 
        error: "Çok fazla başarısız deneme yaptınız. Güvenliğiniz için bu kod iptal edildi. Lütfen yeni bir kod isteyin.",
        blocked: true
      });
    }

    const now = Date.now();
    if (now > otp.expiresAt) {
      delete otpStore[destination];
      return res.status(410).json({ error: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin." });
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      return res.status(400).json({ 
        error: `Hatalı doğrulama kodu. Kalan deneme hakkı: ${3 - otp.attempts}`,
        remainingAttempts: 3 - otp.attempts
      });
    }

    delete otpStore[destination];

    return res.json({ 
      success: true, 
      message: "Doğrulama işlemi başarıyla tamamlandı!" 
    });
  });

  // 5. OneSignal Token Mapping Sim
  app.post("/api/update-push-token", (req, res) => {
    const { userId, oneSignalPlayerId, action } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID gereklidir." });
    }

    console.log(`[ONESIGNAL BRIDGE] Mapping user ${userId} to Player ID: ${oneSignalPlayerId || "CLEARED"}. Action: ${action}`);
    return res.json({ 
      success: true, 
      mapped: true,
      message: oneSignalPlayerId 
        ? `OneSignal 'External User ID' başarıyla '${userId}' olarak set edildi.`
        : "Bildirim aboneliği başarıyla kaldırıldı."
    });
  });

  // 6. Get All Listings (Admin & General Use)
  app.get("/api/listings", (req, res) => {
    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    return res.json({ count: listings.length, data: listings });
  });

  // 7. Add Listing (With Admin notification email)
  app.post("/api/listings", async (req, res) => {
    const { listing } = req.body;
    if (!listing) {
      return res.status(400).json({ error: "İlan verisi eksik." });
    }

    const userId = req.headers["x-user-id"] || listing.userId;
    const users = readJsonFile(USERS_FILE, defaultUsers);
    const currentUser = users.find((u: any) => u.id === userId);

    if (currentUser) {
      const statusUpper = (currentUser.status || "").toUpperCase();
      const isAdmin = currentUser.role === "admin" || req.headers["x-user-role"] === "admin";
      if (!isAdmin && 
          statusUpper !== "FULLY_VERIFIED" && 
          statusUpper !== "FULLY_APPROVED" && 
          statusUpper !== "FULLY_VERIFIED_STATUS" && 
          statusUpper !== "EMAIL_VERIFIED") {
        return res.status(403).json({ error: "İlan ekleyebilmek için hesabınızın e-posta veya SMS ile doğrulanmış olması gerekmektedir." });
      }
      // If their role is user, update to adv owner!
      if (currentUser.role === "user" || !currentUser.role) {
        currentUser.role = "adv owner";
        await writeAndSyncJsonFile(USERS_FILE, users);
        console.log(`[BACKEND DATABASE] User ${currentUser.id} role updated to adv owner`);
      }
    }

    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    const newId = listing.id || "ad_" + Math.random().toString(36).substring(2, 9);
    
    const initialStatus = "pending"; // Start as pending review so the approval process works!

    const newListing = {
      ...listing,
      id: newId,
      userId: userId || "unknown",
      status: initialStatus
    };

    listings.unshift(newListing);
    const syncResult = await writeAndSyncJsonFile(LISTINGS_FILE, listings);
    console.log(`[BACKEND DATABASE] Listing added: ${newListing.title} (Status: ${initialStatus}). Firebase synced: ${syncResult}`);

    // Simulated email to Admin
    const adminMail = {
      id: "mail_" + Math.random().toString(36).substring(2, 9),
      from: "system@sahibinden-clone.com",
      to: "admin@sahibinden-clone.com",
      subject: `Yeni İlan Yayında: ${newListing.title}`,
      body: `Sayın Yönetici,\n\nSisteme yeni bir ilan eklendi ve doğrudan yayına alındı.\n\nİlan Detayları:\n- Başlık: ${newListing.title}\n- Fiyat: ${Number(newListing.price).toLocaleString("tr-TR")} TL\n- Açıklama: ${newListing.description}\n\nLütfen gerekirse yönetim paneline giriş yaparak ilanı inceleyin.\n\nSaygılarımızla,\nSistem Otomasyonu`,
      sentAt: new Date().toISOString()
    };
    const emails = readJsonFile(EMAILS_FILE, defaultEmails);
    emails.unshift(adminMail);
    await writeAndSyncJsonFile(EMAILS_FILE, emails);
    console.log(`[EMAIL DISPATCH] To: admin@sahibinden-clone.com | Subject: Onay Bekliyor: ${newListing.title}`);

    return res.json({ success: true, listing: newListing, firebaseSynced: syncResult });
  });

  // 8. Update Listing Status (With Advertiser notification email)
  app.put("/api/listings/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const userRole = req.headers["x-user-role"];
    if (userRole !== "admin") {
      return res.status(403).json({ error: "İlan onaylamaya veya reddetmeye yetkiniz yok. Sadece yöneticiler bu işlemi yapabilir." });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Geçersiz statü değeri." });
    }

    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    const listing = listings.find((l: any) => l.id === id);
    if (!listing) {
      return res.status(404).json({ error: "İlan bulunamadı." });
    }

    const oldStatus = listing.status;
    listing.status = status;
    const syncResult = await writeAndSyncJsonFile(LISTINGS_FILE, listings);
    console.log(`[BACKEND DATABASE] Listing ${id} status updated from ${oldStatus} to ${status}. Firebase synced: ${syncResult}`);

    // Simulated email to Advertiser
    const advertiserMail = {
      id: "mail_" + Math.random().toString(36).substring(2, 9),
      from: "noreply@sahibinden-clone.com",
      to: "ilanveren@gmail.com", // Simulated advertiser email
      subject: `İlanınızın Durumu Güncellendi: ${listing.title}`,
      body: `Merhaba,\n\n"${listing.title}" başlıklı ilanınızın onay süreci tamamlanmıştır.\n\nGüncel Durum: ${
        status === "approved" ? "ONAYLANDI (Yayında)" : "REDDEDİLDİ (Yayından Kaldırıldı)"
      }${feedback ? `\n\nYönetici Notu: ${feedback}` : ""}\n\nİlan Detayları:\n- Başlık: ${listing.title}\n- Fiyat: ${Number(listing.price).toLocaleString("tr-TR")} TL\n\nBizi tercih ettiğiniz için teşekkür ederiz.\n\nSaygılarımızla,\nDestek Ekibi`,
      sentAt: new Date().toISOString()
    };
    const emails = readJsonFile(EMAILS_FILE, defaultEmails);
    emails.unshift(advertiserMail);
    await writeAndSyncJsonFile(EMAILS_FILE, emails);
    console.log(`[EMAIL DISPATCH] To: ilanveren@gmail.com | Subject: İlanınızın Durumu Güncellendi: ${listing.title}`);

    return res.json({ success: true, listing, firebaseSynced: syncResult });
  });

  // 8.1. Edit listing endpoint
  app.put("/api/listings/:id", async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;

    const userRole = req.headers["x-user-role"];
    const userId = req.headers["x-user-id"];

    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    const index = listings.findIndex((l: any) => l.id === id);
    if (index > -1) {
      const currentListing = listings[index];
      // Only owner or admin can edit!
      if (userRole !== "admin" && currentListing.userId !== userId) {
        return res.status(403).json({ error: "Bu ilanı düzenleme yetkiniz yoktur. Sadece ilan sahibi veya yöneticiler düzenleyebilir." });
      }

      listings[index] = { ...listings[index], ...listing };
      const syncResult = await writeAndSyncJsonFile(LISTINGS_FILE, listings);
      return res.json({ success: true, listing: listings[index], firebaseSynced: syncResult });
    }
    return res.status(404).json({ error: "İlan bulunamadı." });
  });

  // 8.2. Delete listing endpoint
  app.delete("/api/listings/:id", async (req, res) => {
    const { id } = req.params;

    const userRole = req.headers["x-user-role"];
    const userId = req.headers["x-user-id"];

    const listings = readJsonFile(LISTINGS_FILE, defaultListings);
    const index = listings.findIndex((l: any) => l.id === id);
    if (index > -1) {
      const currentListing = listings[index];
      // Only owner or admin can delete!
      if (userRole !== "admin" && currentListing.userId !== userId) {
        return res.status(403).json({ error: "Bu ilanı silme yetkiniz yoktur. Sadece ilan sahibi veya yöneticiler silebilir." });
      }

      const filtered = listings.filter((l: any) => l.id !== id);
      const syncResult = await writeAndSyncJsonFile(LISTINGS_FILE, filtered);
      return res.json({ success: true, firebaseSynced: syncResult });
    }
    return res.status(404).json({ error: "İlan bulunamadı." });
  });

  // 9. Get Simulated Emails
  app.get("/api/simulated-emails", (req, res) => {
    const emails = readJsonFile(EMAILS_FILE, defaultEmails);
    return res.json({ count: emails.length, data: emails });
  });

  // 10. Send Simulated Email
  app.post("/api/send-simulated-email", async (req, res) => {
    const { from, to, subject, body } = req.body;
    const emails = readJsonFile(EMAILS_FILE, defaultEmails);
    const newEmail = {
      id: "mail_" + Math.random().toString(36).substring(2, 9),
      from: from || "noreply@sahibinden-clone.com",
      to,
      subject,
      body,
      sentAt: new Date().toISOString()
    };
    emails.unshift(newEmail);
    const syncResult = await writeAndSyncJsonFile(EMAILS_FILE, emails);
    console.log(`[EMAIL DISPATCH] Custom Email. To: ${to} | Subject: ${subject}`);
    return res.json({ success: true, email: newEmail, firebaseSynced: syncResult });
  });

  // 11. Users API CRUD Operations for persistent state
  app.get("/api/users", (req, res) => {
    const users = readJsonFile(USERS_FILE, defaultUsers);
    return res.json({ count: users.length, data: users });
  });

  app.post("/api/users", async (req, res) => {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: "Kullanıcı verisi eksik." });
    }
    const users = readJsonFile(USERS_FILE, defaultUsers);
    const existingIndex = users.findIndex((u: any) => u.id === user.id);
    if (existingIndex > -1) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    const syncResult = await writeAndSyncJsonFile(USERS_FILE, users);
    return res.json({ success: true, user, firebaseSynced: syncResult });
  });

  app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { user } = req.body;
    const users = readJsonFile(USERS_FILE, defaultUsers);
    const index = users.findIndex((u: any) => u.id === id);
    if (index > -1) {
      users[index] = { ...users[index], ...user };
      const syncResult = await writeAndSyncJsonFile(USERS_FILE, users);
      return res.json({ success: true, user: users[index], firebaseSynced: syncResult });
    }
    return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  });

  app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const users = readJsonFile(USERS_FILE, defaultUsers);
    const filtered = users.filter((u: any) => u.id !== id);
    const syncResult = await writeAndSyncJsonFile(USERS_FILE, filtered);
    return res.json({ success: true, firebaseSynced: syncResult });
  });

  // 12. Categories API CRUD Operations for persistent state
  app.get("/api/categories", (req, res) => {
    const categories = readJsonFile(CATEGORIES_FILE, defaultCategories);
    return res.json({ count: categories.length, data: categories });
  });

  app.post("/api/categories", async (req, res) => {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: "Kategori verisi eksik." });
    }
    const categories = readJsonFile(CATEGORIES_FILE, defaultCategories);
    const existingIndex = categories.findIndex((c: any) => c.id === category.id);
    if (existingIndex > -1) {
      categories[existingIndex] = { ...categories[existingIndex], ...category };
    } else {
      categories.push(category);
    }
    const syncResult = await writeAndSyncJsonFile(CATEGORIES_FILE, categories);
    return res.json({ success: true, category, firebaseSynced: syncResult });
  });

  app.post("/api/categories/bulk", async (req, res) => {
    const { categories: bulkCategories } = req.body;
    if (!Array.isArray(bulkCategories)) {
      return res.status(400).json({ error: "Geçersiz kategori listesi." });
    }
    const categories = readJsonFile(CATEGORIES_FILE, defaultCategories);
    for (const cat of bulkCategories) {
      const idx = categories.findIndex((c: any) => c.id === cat.id);
      if (idx > -1) {
        categories[idx] = { ...categories[idx], ...cat };
      } else {
        categories.push(cat);
      }
    }
    const syncResult = await writeAndSyncJsonFile(CATEGORIES_FILE, categories);
    cachedCategories = categories;
    return res.json({ success: true, firebaseSynced: syncResult });
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const { id } = req.params;
    const categories = readJsonFile(CATEGORIES_FILE, defaultCategories);
    const filtered = categories.filter((c: any) => c.id !== id);
    const syncResult = await writeAndSyncJsonFile(CATEGORIES_FILE, filtered);
    return res.json({ success: true, firebaseSynced: syncResult });
  });

  // 13. Advertisement API CRUD Operations and Clicks log
  app.get("/api/advertisements", (req, res) => {
    const ads = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
    return res.json({ count: ads.length, data: ads });
  });

  app.post("/api/advertisements", async (req, res) => {
    const { advertisement } = req.body;
    if (!advertisement) {
      return res.status(400).json({ error: "Reklam verisi eksik." });
    }
    
    const ads = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
    const newId = advertisement.id || "ad_" + Math.random().toString(36).substring(2, 9);
    
    const newAd = {
      ...advertisement,
      id: newId,
      createdAt: advertisement.createdAt || new Date().toISOString()
    };
    
    ads.unshift(newAd);
    const syncResult = await writeAndSyncJsonFile(ADVERTISEMENTS_FILE, ads);
    return res.json({ success: true, advertisement: newAd, firebaseSynced: syncResult });
  });

  app.put("/api/advertisements/:id", async (req, res) => {
    const { id } = req.params;
    const { advertisement } = req.body;
    if (!advertisement) {
      return res.status(400).json({ error: "Güncelleme verisi eksik." });
    }
    const ads = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
    const index = ads.findIndex((a: any) => a.id === id);
    if (index > -1) {
      ads[index] = { ...ads[index], ...advertisement };
      const syncResult = await writeAndSyncJsonFile(ADVERTISEMENTS_FILE, ads);
      return res.json({ success: true, advertisement: ads[index], firebaseSynced: syncResult });
    }
    return res.status(404).json({ error: "Reklam bulunamadı." });
  });

  app.delete("/api/advertisements/:id", async (req, res) => {
    const { id } = req.params;
    const ads = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
    const filtered = ads.filter((a: any) => a.id !== id);
    const syncResult = await writeAndSyncJsonFile(ADVERTISEMENTS_FILE, filtered);
    return res.json({ success: true, firebaseSynced: syncResult });
  });

  // Record Ad Click Log
  app.post("/api/advertisements/:id/click", async (req, res) => {
    const { id } = req.params;
    const { userId, userEmail, userName } = req.body;
    
    const ads = readJsonFile(ADVERTISEMENTS_FILE, defaultAdvertisements);
    const ad = ads.find((a: any) => a.id === id);
    if (!ad) {
      return res.status(404).json({ error: "Reklam bulunamadı." });
    }
    
    const clicks = readJsonFile(AD_CLICKS_FILE, defaultAdClicks);
    const newClick = {
      id: "click_" + Math.random().toString(36).substring(2, 9),
      adId: id,
      adTitle: ad.title,
      userId: userId || null,
      userEmail: userEmail || null,
      userName: userName || null,
      clickedAt: new Date().toISOString(),
      userAgent: req.headers["user-agent"] || "unknown"
    };
    
    clicks.unshift(newClick);
    const syncResult = await writeAndSyncJsonFile(AD_CLICKS_FILE, clicks);
    
    return res.json({ success: true, click: newClick, redirectUrl: ad.link, firebaseSynced: syncResult });
  });

  // Get Ad Click Logs
  app.get("/api/advertisements/clicks", (req, res) => {
    const clicks = readJsonFile(AD_CLICKS_FILE, defaultAdClicks);
    return res.json({ count: clicks.length, data: clicks });
  });

  // Get Exchange Rates
  app.get("/api/exchange-rates", (req, res) => {
    const rates = readJsonFile(EXCHANGE_RATES_FILE, defaultExchangeRates);
    return res.json({ success: true, data: rates });
  });

  // Update Exchange Rates
  app.post("/api/exchange-rates", async (req, res) => {
    const { rates, lastUpdated } = req.body;
    if (!rates) {
      return res.status(400).json({ error: "Kur verileri eksik." });
    }
    const updatedData = [
      {
        id: "rates_latest",
        rates,
        lastUpdated: lastUpdated || new Date().toISOString()
      }
    ];
    const syncResult = await writeAndSyncJsonFile(EXCHANGE_RATES_FILE, updatedData);
    return res.json({ success: true, data: updatedData, firebaseSynced: syncResult });
  });

  // Get Locations
  app.get("/api/locations", (req, res) => {
    const locations = readJsonFile(LOCATIONS_FILE, defaultLocations);
    return res.json({ success: true, data: locations });
  });

  // Update/Add Location (Country/City/District)
  app.post("/api/locations", async (req, res) => {
    const { locations } = req.body;
    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ error: "Konum verileri eksik veya geçersiz." });
    }
    const syncResult = await writeAndSyncJsonFile(LOCATIONS_FILE, locations);
    return res.json({ success: true, data: locations, firebaseSynced: syncResult });
  });

  // Solution A: Server-Side Meta Tag & Initial State Injection (SSR/SPA SEO Engine)
  const renderHtmlWithMeta = (req: express.Request, res: express.Response, id: string) => {
    try {
      const listings = readJsonFile(LISTINGS_FILE, defaultListings);
      const listing = listings.find((l: any) => l.id === id);
      
      let htmlPath = "";
      if (process.env.NODE_ENV !== "production") {
        htmlPath = path.join(process.cwd(), 'index.html');
      } else {
        htmlPath = path.join(process.cwd(), 'dist', 'index.html');
      }
      
      if (!fs.existsSync(htmlPath)) {
        console.warn(`HTML file not found at ${htmlPath}`);
        return res.redirect('/');
      }
      
      let html = fs.readFileSync(htmlPath, 'utf8');
      
      if (listing) {
        const title = `${listing.title} | Sahibinden Clone`;
        const description = listing.description.replace(/"/g, '&quot;').slice(0, 150) + (listing.description.length > 150 ? '...' : '');
        const imageUrl = listing.images && listing.images[0] ? listing.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';
        const url = `${req.protocol}://${req.get('host')}/listing/${listing.id}`;
        
        const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
        `;
        
        // Inject meta tags inside <head>
        if (html.includes("<title>")) {
          html = html.replace(/<title>.*?<\/title>/, metaTags);
        } else if (html.includes("</head>")) {
          html = html.replace("</head>", `${metaTags}\n</head>`);
        } else {
          html = html.replace("<head>", `<head>\n${metaTags}`);
        }
      }
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      console.error("Error rendering page with meta tags:", err);
      if (process.env.NODE_ENV !== "production") {
        return res.redirect('/');
      } else {
        return res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
      }
    }
  };

  app.get('/listing/:id', (req, res) => {
    renderHtmlWithMeta(req, res, req.params.id);
  });

  app.get('/ilan/:id', (req, res) => {
    renderHtmlWithMeta(req, res, req.params.id);
  });

  // Mount Vite middleware for development or static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
