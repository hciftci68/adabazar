import { Category, Listing } from "./types";

export const initialCategories: Category[] = [
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
      { key: "yakit", label_tr: "Yakup Tipi", label_en: "Fuel Type", type: "select", required: true, options: ["Benzin", "Dizel", "LPG", "Elektrik", "Hibrit"] }
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
      { key: "hafiza", label_tr: "Dahili Hafıza", label_en: "Internal Storage", type: "select", required: true, options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] }
    ]
  }
];

export const initialListings: Listing[] = [
  {
    id: "1",
    title: "Sahibinden Satılık 3+1 Lüks Daire",
    description: "Karanlık odası olmayan, ebeveyn banyolu, kombili, metroya 5 dk mesafede, geniş balkonlu, acil satılık daire.",
    categoryId: "cat_satilik_daire",
    price: 3250000,
    location: { lat: 41.0151, lng: 28.9795, address: "Fatih, İstanbul" },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
    featured: true,
    createdAt: "2026-07-01T10:00:00Z",
    tags: ["acil", "metroya yakın", "lüks", "kombili"],
    attributes: { "oda_sayisi": "3+1", "m2": "120", "isinma": "Kombi", "bina_yasi": "1-5" }
  },
  {
    id: "2",
    title: "Temiz Kazasız Volkswagen Golf 1.6 TDI",
    description: "İlk sahibinden, değişensiz, sadece sol çamurluk boyalı, bakımları yeni yapılmış, düşük kilometreli aile arabası.",
    categoryId: "cat_otomobil",
    price: 845000,
    location: { lat: 40.1885, lng: 29.0610, address: "Nilüfer, Bursa" },
    images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"],
    featured: true,
    createdAt: "2026-07-02T14:30:00Z",
    tags: ["golf", "temiz", "sahibinden", "düşük km"],
    attributes: { "yil": 2018, "vites": "Otomatik", "yakit": "Dizel" }
  },
  {
    id: "3",
    title: "iPhone 15 Pro Max 256GB - Kusursuz",
    categoryId: "cat_telefon",
    description: "Kutulu, faturalı, Türkiye garantili, pil sağlığı %94, hiç tamir görmemiş, kılcal çiziksiz kılıfıyla kullanılmış telefon.",
    price: 68000,
    location: { lat: 39.9334, lng: 32.8597, address: "Çankaya, Ankara" },
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
    featured: false,
    createdAt: "2026-07-05T09:15:00Z",
    tags: ["iphone", "pro max", "temiz", "garantili"],
    attributes: { "hafiza": "256 GB", "garanti": "Garantisi Var" }
  }
];

// Technical Architecture Report Contents
export const technicalReport = {
  tr: {
    techStack: {
      title: "1. Teknik Yığın (Tech Stack) Önerisi",
      subtitle: "Büyük ölçekli, esnek ve yüksek trafikli bir ilan platformu için optimize edilmiş mimari bileşenler:",
      items: [
        { name: "Backend (Arka Uç) Servisleri", desc: "Node.js (NestJS / TypeScript) - Hızlı, tip güvenli, event-driven mimariye tam uyumlu, mikroservis geçişlerine hazır modüler yapı." },
        { name: "Ön Yüz (Frontend / Mobil)", desc: "React + Vite / Next.js (SSR destekli, SEO optimizasyonu için kritik) ve yerel benzeri mobil deneyim için Progressive Web App (PWA) katmanı." },
        { name: "Ana Veritabanı (RDBMS)", desc: "PostgreSQL - Kategori ağaçlarında hiyerarşik sorgular (WITH RECURSIVE) ve karmaşık ilan ilişkilerini en güvenli ve performanslı şekilde yönetmek için." },
        { name: "Arama Motoru (FSE & Fuzzy)", desc: "Elasticsearch veya Meilisearch - Milyonlarca ilan arasında milisaniyeler bazında fuzzy (toleranslı) arama yapabilen, facet (kategori bazlı filtreleme) destekli arama altyapısı." },
        { name: "Önbellekleme & Mesaj Kuyruğu", desc: "Redis - İlan detayları, dinamik kategori alanları önbelleklemesi ve OTP SMS/Email gönderim limitlerini yönetmek (rate limiting) için." },
        { name: "SMS & Email Entegrasyonları", desc: "SMS OTP için Netgsm / Twilio; E-posta doğrulamaları ve bildirimleri için SendGrid / Postmark SMTP ve API servisleri." },
        { name: "Push Bildirim Yönetimi", desc: "OneSignal SDK - PWA ve mobil push bildirimlerini 'External User ID' eşleşmesiyle tetikleyebilen, gelişmiş segmentasyon destekli servis." }
      ]
    },
    solutions: {
      title: "2. Kritik Zorluklar ve Güvenlik Çözümleri",
      items: [
        {
          title: "SMS/Email OTP Güvenliği (Siber Saldırı ve Maliyet Engelleme)",
          desc: "Kötü niyetli kullanıcıların veya botların sürekli OTP isteği göndererek SMS maliyetlerini fırlatmasını (SMS Flooding) engellemek için:\n" +
            "• Sliding Window Rate Limiting: Redis kullanarak her telefon numarası/IP için 60 saniyede maks 1, 1 saatte maks 5 SMS gönderme limiti.\n" +
            "• Brute-Force Koruması: Gönderilen tek kullanımlık şifre (OTP) doğrulanırken, ardışık 3 hatalı denemede kod iptal edilir ve talep bloke edilir.\n" +
            "• CAPTCHA Entegrasyonu: Giriş veya kayıt esnasında arka arkaya başarısız OTP taleplerinde reCAPTCHA v3 / Cloudflare Turnstile devreye alınır."
        },
        {
          title: "OneSignal ile Hedeflenmiş ve Segment Bazlı Bildirim Gönderimi",
          desc: "• External User ID Eşleme: Kullanıcı üye olduğunda veya giriş yaptığında OneSignal SDK'sına `OneSignal.login(userId)` çağrısı yapılarak platformdaki benzersiz User ID ile OneSignal Player ID eşleştirilir.\n" +
            "• Veritabanı Senkronizasyonu: Kullanıcı profiline `onesignal_player_id` kaydedilir. Mesajlaşma, favori ilanda fiyat düşüşü gibi durumlarda veritabanı tetikleyicileri (Triggers) veya Event Queue (RabbitMQ/BullMQ) üzerinden sadece o External User ID hedeflenerek OneSignal API'sine istek atılır.\n" +
            "• Segmentasyon: Kullanıcıların ilgilendiği kategoriler (örn: 'Otomobil İlgilileri') OneSignal Data Tags olarak kaydedilerek toplu kampanya bildirimleri filtrelenir."
        },
        {
          title: "Sınırsız Hiyerarşik Kategori ve Dinamik Alanlar",
          desc: "• Parent-Child Mimarisi: Kategoriler PostgreSQL'de `parent_id` alanı ile tutulur. `WITH RECURSIVE` CTE sorgusu ile tüm üst ve alt kategoriler tek bir verimli SQL ile çekilir.\n" +
            "• Dinamik Alan Kalıtımı: Emlak > Konut > Satılık Daire gibi kırılımlarda, Satılık Daire ilan formu hem kendi dinamik özelliklerini hem de üst kategoriler olan Konut (m2) ve Emlak (Isınma) özelliklerini kalıtım yoluyla (Inheritance) otomatik olarak üzerine alır."
        }
      ]
    }
  },
  en: {
    techStack: {
      title: "1. Technical Tech Stack Recommendation",
      subtitle: "Optimized architectural components for a scalable, high-traffic classified ads platform:",
      items: [
        { name: "Backend Services", desc: "Node.js (NestJS / TypeScript) - Fast, type-safe, perfectly aligned with event-driven architecture, modular structure ready for microservices transition." },
        { name: "Frontend / Mobile", desc: "React + Vite / Next.js (with SSR, critical for SEO indexing) paired with Progressive Web App (PWA) layer for native-like mobile experience." },
        { name: "Primary Database (RDBMS)", desc: "PostgreSQL - Essential for managing category trees via hierarchical queries (WITH RECURSIVE) and storing relational structures safely." },
        { name: "Search Engine (FSE & Fuzzy)", desc: "Elasticsearch or Meilisearch - Delivers sub-millisecond typo-tolerant fuzzy searches and faceted filtering across millions of listings." },
        { name: "Caching & Message Broker", desc: "Redis - Used for caching listing details, dynamic category layouts, and enforcing rate limits on OTP verification requests." },
        { name: "SMS & Email integrations", desc: "Netgsm / Twilio for SMS OTP; SendGrid / Postmark for high-deliverability activation emails and notifications." },
        { name: "Push Notification Delivery", desc: "OneSignal SDK - Handles web/PWA and native push notifications targeted via user-specific 'External User ID' matching." }
      ]
    },
    solutions: {
      title: "2. Key Challenges & Architectural Solutions",
      items: [
        {
          title: "SMS/Email OTP Security (Siber Attack & Financial Protection)",
          desc: "To prevent malicious actors from blasting SMS requests (which causes rapid financial drain):\n" +
            "• Sliding Window Rate Limiting: Managed in Redis. Restricts any single phone number/IP to maximum 1 OTP code per 60 seconds, and 5 per hour.\n" +
            "• Brute-Force Prevention: When verifying, if a user enters a wrong OTP code 3 times consecutively, the code is immediately invalidated and the flow is locked.\n" +
            "• CAPTCHA Protection: ReCAPTCHA v3 or Cloudflare Turnstile triggers automatically when multiple requests are received from the same subnet."
        },
        {
          title: "Targeted Push Notifications using OneSignal",
          desc: "• External User ID Mapping: When a user registers or logs in, the client SDK runs `OneSignal.login(userId)`, linking our platform's unique User ID to OneSignal's device records.\n" +
            "• Event-Driven Dispatch: For features like direct chat messages or price drops on starred items, background event workers (BullMQ) hit the OneSignal API targeting only that specific External User ID.\n" +
            "• User Tag Segmentation: Interest profiles (e.g. 'Interested in Cars') are saved as OneSignal Data Tags, allowing marketing divisions to send highly contextual push campaigns."
        },
        {
          title: "Infinite Hierarchical Categories & Dynamic Custom Fields",
          desc: "• Parent-Child Design: Saved in PostgreSQL with a `parent_id` foreign key. Fast recursive queries (WITH RECURSIVE CTE) extract the full tree path in a single pass.\n" +
            "• Attribute Inheritance: A classified form for 'Apartment for Sale' inherits properties defined at its parent levels: Housing (e.g. net area) and Real Estate (e.g. heating type) automatically."
        }
      ]
    }
  }
};

// PostgreSQL Schema Definition JSON for Schema Viewer
export const databaseSchema = [
  {
    table: "users",
    description: "Kullanıcı bilgileri, doğrulama tarihleri ve OneSignal Push bildirim eşleşme verileri.",
    fields: [
      { name: "id", type: "UUID (Primary Key)", desc: "Benzersiz kullanıcı kimliği. Varsayılan: uuid_generate_v4()" },
      { name: "email", type: "VARCHAR(255) (Unique)", desc: "Kullanıcı e-posta adresi." },
      { name: "phone", type: "VARCHAR(20) (Unique)", desc: "Kullanıcı cep telefonu numarası (Uluslararası formatta, örn: +905...)" },
      { name: "password_hash", type: "VARCHAR(255)", desc: "Bcrypt veya Argon2id ile şifrelenmiş şifre." },
      { name: "status", type: "VARCHAR(50)", desc: "Kullanıcı statüsü: 'UNVERIFIED', 'EMAIL_VERIFIED', 'FULLY_VERIFIED'" },
      { name: "email_verified_at", type: "TIMESTAMP WITH TIME ZONE", desc: "E-posta doğrulama linkine tıklandığı an." },
      { name: "phone_verified_at", type: "TIMESTAMP WITH TIME ZONE", desc: "SMS OTP doğrulamasının başarıyla tamamlandığı an." },
      { name: "onesignal_player_id", type: "VARCHAR(100)", desc: "OneSignal tarayıcı/cihaz benzersiz kayıt kimliği." },
      { name: "onesignal_external_id", type: "VARCHAR(100)", desc: "OneSignal ile eşleştirilen, bizim veritabanımızdaki User ID (id)." },
      { name: "created_at", type: "TIMESTAMP", desc: "Hesap oluşturma tarihi." }
    ]
  },
  {
    table: "categories",
    description: "Sınırsız derinlikte parent-child ilişkili kategori ağacı.",
    fields: [
      { name: "id", type: "INT / UUID (Primary Key)", desc: "Benzersiz kategori kimliği." },
      { name: "parent_id", type: "INT / UUID (Foreign Key)", desc: "Üst kategorinin ID'si. Null ise bu kategori en üst seviyededir (Kök kategori)." },
      { name: "name_tr", type: "VARCHAR(100)", desc: "Kategorinin Türkçe ismi (örn: 'Satılık Daire')." },
      { name: "name_en", type: "VARCHAR(100)", desc: "Kategorinin İngilizce ismi (örn: 'Apartment for Sale')." },
      { name: "slug", type: "VARCHAR(150) (Unique)", desc: "SEO uyumlu URL uzantısı." },
      { name: "max_images_limit", type: "INT", desc: "Admin tarafından bu kategori için ayarlanabilen maksimum resim sayısı (örn: 15)." },
      { name: "sort_order", type: "INT", desc: "Arayüzde gösterim sırası." }
    ]
  },
  {
    table: "category_attributes",
    description: "Kategorilere has dinamik özel alanlar ve kısıtlamaları.",
    fields: [
      { name: "id", type: "UUID (Primary Key)", desc: "Benzersiz alan kimliği." },
      { name: "category_id", type: "INT / UUID (Foreign Key)", desc: "İlgili kategori ID'si (categories.id ile ilişkili)." },
      { name: "key", type: "VARCHAR(50)", desc: "Uygulama içi benzersiz anahtar (örn: 'room_count', 'km')." },
      { name: "label_tr", type: "VARCHAR(100)", desc: "Türkçe form etiketi (örn: 'Oda Sayısı')." },
      { name: "label_en", type: "VARCHAR(100)", desc: "İngilizce form etiketi (örn: 'Room Count')." },
      { name: "type", type: "VARCHAR(20)", desc: "Veri tipi: 'text', 'number', 'select', 'boolean'" },
      { name: "is_required", type: "BOOLEAN", desc: "İlan verilirken doldurulması zorunlu mu?" },
      { name: "options", type: "JSONB", desc: "Eğer tip 'select' ise seçilebilecek değerler dizisi (örn: ['1+1', '2+1', '3+1'])." }
    ]
  },
  {
    table: "listings",
    description: "Genel ilan verileri, fiyat, doping durumu ve konum koordinatları.",
    fields: [
      { name: "id", type: "UUID (Primary Key)", desc: "Benzersiz ilan kimliği." },
      { name: "user_id", type: "UUID (Foreign Key)", desc: "İlanı veren kullanıcı (users.id ile ilişkili)." },
      { name: "category_id", type: "INT / UUID (Foreign Key)", desc: "İlanın kategorisi (categories.id ile ilişkili)." },
      { name: "title_tr", type: "VARCHAR(150)", desc: "Türkçe İlan başlığı." },
      { name: "title_en", type: "VARCHAR(150)", desc: "İngilizce İlan başlığı." },
      { name: "description_tr", type: "TEXT", desc: "Türkçe İlan açıklaması." },
      { name: "description_en", type: "TEXT", desc: "İngilizce İlan açıklaması." },
      { name: "price", type: "NUMERIC(12, 2)", desc: "İlan fiyatı." },
      { name: "currency", type: "VARCHAR(3)", desc: "Para birimi: 'TRY', 'USD', 'EUR'" },
      { name: "latitude", type: "NUMERIC(10, 8)", desc: "Konum enlemi (Map konumlandırma için)." },
      { name: "longitude", type: "NUMERIC(11, 8)", desc: "Konum boylamı (Map konumlandırma için)." },
      { name: "address_text", type: "VARCHAR(255)", desc: "Konumun açık adresi." },
      { name: "is_featured", type: "BOOLEAN", desc: "Öne Çıkan / Sponsorlu İlan Doping Durumu." },
      { name: "image_urls", type: "JSONB", desc: "İlana ait yüklenmiş resimlerin CDN adresleri dizisi (maksimum resim adedi kategori limitine tabidir)." },
      { name: "created_at", type: "TIMESTAMP WITH TIME ZONE", desc: "İlanın yayınlanma tarihi." }
    ]
  },
  {
    table: "listing_attribute_values",
    description: "İlanların dinamik özel alan değerlerinin tutulduğu EAV (Entity-Attribute-Value) veya JSONB eşleşme tablosu.",
    fields: [
      { name: "listing_id", type: "UUID (Foreign Key)", desc: "İlgili ilan (listings.id ile ilişkili)." },
      { name: "attribute_id", type: "UUID (Foreign Key)", desc: "İlgili dinamik alan (category_attributes.id ile ilişkili)." },
      { name: "value", type: "TEXT", desc: "Kullanıcının girdiği/seçtiği değer. (Alternatif olarak listings tablosunda JSONB bir kolonda da birleştirilebilir)." }
    ]
  }
];

// API Endpoints list for Swagger UI simulator
export const apiEndpointsList = [
  {
    method: "POST",
    path: "/api/v1/auth/register",
    descriptionTr: "Yeni bir kullanıcı kaydı oluşturur. Başlangıçta status: UNVERIFIED.",
    descriptionEn: "Creates a new user account. Initial status is UNVERIFIED.",
    body: {
      email: "ornek@ilan.com",
      phone: "+905051234567",
      name: "Ahmet Yılmaz",
      password: "secure_password_123"
    },
    response: {
      success: true,
      user: {
        id: "d3b07384-d113-4482-a8c4-c24222444123",
        email: "ornek@ilan.com",
        phone: "+905051234567",
        name: "Ahmet Yılmaz",
        status: "UNVERIFIED"
      }
    }
  },
  {
    method: "POST",
    path: "/api/v1/auth/verify-email",
    descriptionTr: "E-posta doğrulama token/kodunu doğrular. Status -> EMAIL_VERIFIED.",
    descriptionEn: "Validates the email verification token. Status -> EMAIL_VERIFIED.",
    body: {
      email: "ornek@ilan.com",
      code: "743209"
    },
    response: {
      success: true,
      message: "Email verification successful.",
      status: "EMAIL_VERIFIED",
      email_verified_at: "2026-07-08T12:25:30Z"
    }
  },
  {
    method: "POST",
    path: "/api/v1/auth/verify-sms",
    descriptionTr: "SMS OTP şifresini doğrular. Eğer email de onaylıysa status -> FULLY_VERIFIED.",
    descriptionEn: "Validates the SMS OTP code. If email is also verified, status -> FULLY_VERIFIED.",
    body: {
      phone: "+905051234567",
      code: "824901"
    },
    response: {
      success: true,
      message: "SMS OTP verified. Account upgraded to fully secure status.",
      status: "FULLY_VERIFIED",
      phone_verified_at: "2026-07-08T12:26:00Z"
    }
  },
  {
    method: "POST",
    path: "/api/v1/listings",
    descriptionTr: "Yeni bir ilan ekler. Kategori bazlı maksimum resim kotası ve dinamik alan doğrulaması sunucuda yapılır.",
    descriptionEn: "Publishes a new ad. Category-based image quota and dynamic fields validation is performed on the server.",
    body: {
      title: "Yamaha MT-07 Temiz Motosiklet",
      categoryId: "cat_motosiklet",
      price: 340000,
      location: { lat: 38.4192, lng: 27.1287, address: "Konak, İzmir" },
      images: ["img_url_1.png", "img_url_2.png"],
      attributes: { "yil": 2021, "km": 12000 }
    },
    response: {
      success: true,
      listingId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      message: "Listing created successfully."
    }
  },
  {
    method: "POST",
    path: "/api/v1/onesignal/update-push-token",
    descriptionTr: "OneSignal Player ID'sini kullanıcının External User ID'si ile eşleştirir.",
    descriptionEn: "Links OneSignal Player ID with our internal user's External User ID.",
    body: {
      userId: "d3b07384-d113-4482-a8c4-c24222444123",
      oneSignalPlayerId: "8bf07312-32a1-432d-9f44-8cb312dd71c4",
      action: "REGISTER"
    },
    response: {
      success: true,
      message: "OneSignal External User ID linked successfully."
    }
  }
];

export interface CityOption {
  name: string;
  districts: string[];
}

export interface CountryOption {
  name: string;
  cities: CityOption[];
}

export const locationData: CountryOption[] = [
  {
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

