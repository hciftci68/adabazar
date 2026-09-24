import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Building, 
  Building2, 
  KeyRound, 
  Car, 
  Gauge, 
  Laptop, 
  Smartphone, 
  Search, 
  MapPin, 
  Tag, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Send, 
  Sparkles, 
  Languages, 
  Settings, 
  Layout, 
  Database, 
  FileCode, 
  CheckCircle, 
  RefreshCw, 
  Download,
  Upload,
  Star, 
  Info, 
  ChevronRight, 
  Play, 
  Server, 
  UserCheck, 
  Trash2, 
  Camera, 
  Plus, 
  Map,
  X,
  Share2,
  FileText,
  User,
  Users,
  UserPlus,
  Edit3,
  Sliders,
  ShieldAlert,
  Heart,
  MessageSquare,
  Globe,
  Terminal,
  ArrowRight,
  ExternalLink,
  LogIn,
  LogOut,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Megaphone,
  Calendar,
  Eye,
  BarChart2,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Shield,
  Coins
} from "lucide-react";
import { initialCategories, initialListings, technicalReport, databaseSchema, apiEndpointsList, locationData, CountryOption, CityOption } from "./data";
import { Category, Listing, User as UserType, UserStatus, DynamicAttribute } from "./types";
// @ts-ignore
import heroImage from "./assets/images/acikbazar_mockup_1784059169933.jpg";
import { Logo } from "./components/Logo";
import { InteractiveMap } from "./components/InteractiveMap";
import { CategoryTree, getCategoryIcon } from "./components/CategoryTree";

const getCategoryRootName = (categoryId: string, categories: Category[]): string => {
  let currentId: string | null = categoryId;
  let lastFoundName = "";
  while (currentId) {
    const found = categories.find(c => c.id === currentId);
    if (!found) break;
    lastFoundName = found.nameTr;
    currentId = found.parentId;
  }
  return lastFoundName;
};

// Client-side base64 image compressor to keep document sizes well below Firestore 1MB limits
const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

export default function App() {
  // Localization State
  const [lang, setLang] = useState<"tr" | "en">("tr");

  // Multi-page navigation state
  const [currentPage, setCurrentPage] = useState<"main" | "admin" | "login" | "register" | "forgot-password">("main");
  const [adminTab, setAdminTab] = useState<"users" | "categories" | "adverts" | "banners" | "locations" | "exchange_rates">("users");

  // Simulated users state for admin page
  const [adminUsers, setAdminUsers] = useState<UserType[]>([
    {
      id: "user_ad_8891",
      email: "hciftci68@gmail.com",
      phone: "+905051234567",
      name: "Hakan Çiftçi",
      status: UserStatus.Fully_Verified,
      role: "admin",
      emailVerifiedAt: "2026-07-10T09:11:30.185Z",
      phoneVerifiedAt: "2026-07-10T09:11:30.185Z",
      oneSignalPlayerId: null,
      oneSignalExternalId: null,
      password: "123456"
    },
    {
      id: "user_ahmet_99",
      email: "ahmet@example.com",
      phone: "+905329876543",
      name: "Ahmet Yılmaz",
      status: UserStatus.Fully_Verified,
      role: "adv owner",
      emailVerifiedAt: "2026-07-03T11:00:00Z",
      phoneVerifiedAt: "2026-07-03T11:15:00Z",
      oneSignalPlayerId: "8bf07312-32a1-432d-9f44-8cb312dd71c4",
      oneSignalExternalId: "user_ahmet_99",
      password: "123456"
    },
    {
      id: "user_ayse_22",
      email: "ayse@demircelik.com",
      phone: "+905441112233",
      name: "Ayşe Demir",
      status: UserStatus.Email_Verified,
      role: "user",
      emailVerifiedAt: "2026-07-05T14:20:00Z",
      phoneVerifiedAt: null,
      oneSignalPlayerId: null,
      oneSignalExternalId: null,
      password: "123456"
    },
    {
      id: "user_mehmet_55",
      email: "mehmet@kaya.net",
      phone: "+905553334455",
      name: "Mehmet Kaya",
      status: UserStatus.Unverified,
      role: "user",
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      oneSignalPlayerId: null,
      oneSignalExternalId: null,
      password: "123456"
    }
  ]);

  // Admin form/modal states
  const [adminNewName, setAdminNewName] = useState("");
  const [adminNewEmail, setAdminNewEmail] = useState("");
  const [adminNewPhone, setAdminNewPhone] = useState("");
  const [adminNewStatus, setAdminNewStatus] = useState<UserStatus>(UserStatus.Unverified);
  const [adminNewRole, setAdminNewRole] = useState<"user" | "adv owner" | "admin">("user");
  const [adminEditingUser, setAdminEditingUser] = useState<UserType | null>(null);
  const [adminEditingListing, setAdminEditingListing] = useState<Listing | null>(null);
  const [userEditingListing, setUserEditingListing] = useState<Listing | null>(null);

  // Advertisement & Click State
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [adClicks, setAdClicks] = useState<any[]>([]);
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Advertisement Form/Filter state
  const [adFilter, setAdFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adOwner, setAdOwner] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adStartDate, setAdStartDate] = useState("");
  const [adEndDate, setAdEndDate] = useState("");
  const [adStatus, setAdStatus] = useState<"active" | "inactive">("active");
  const [adMetadata, setAdMetadata] = useState("");
  const [newAdImage, setNewAdImage] = useState("");
  const [adImageError, setAdImageError] = useState<string | null>(null);
  const [adClicksSearch, setAdClicksSearch] = useState("");

  // Dynamic Locations state
  const [locations, setLocations] = useState<CountryOption[]>(locationData);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCityCountry, setNewCityCountry] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [newDistrictCountry, setNewDistrictCountry] = useState("");
  const [newDistrictCity, setNewDistrictCity] = useState("");
  const [newDistrictName, setNewDistrictName] = useState("");

  // Settings Tab States
  const [csvPasteContent, setCsvPasteContent] = useState("");
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  // Location CSV States
  const [locationCsvPasteContent, setLocationCsvPasteContent] = useState("");
  const [isImportingLocationCsv, setIsImportingLocationCsv] = useState(false);

  // User Interface states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailImageIdx, setDetailImageIdx] = useState(0);
  const [detailActiveTab, setDetailActiveTab] = useState<"photos" | "map">("photos");
  const [selectedSeller, setSelectedSeller] = useState<UserType | null>(null);
  const [showDirectMessageForm, setShowDirectMessageForm] = useState(false);
  const [directMessageText, setDirectMessageText] = useState("");
  const [isSendingDirectMessage, setIsSendingDirectMessage] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [devToolsTab, setDevToolsTab] = useState<"docs" | "schema" | "api" | "onesignal" | "emails" | "pwa">("docs");
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profileEmailVerificationSent, setProfileEmailVerificationSent] = useState(false);
  const [profileEmailVerificationCode, setProfileEmailVerificationCode] = useState("");
  const [profileOtpCode, setProfileOtpCode] = useState("");
  const [profileRateLimitTime, setProfileRateLimitTime] = useState(0);
  const [profileEmailAttempts, setProfileEmailAttempts] = useState(0);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileIsSaving, setProfileIsSaving] = useState(false);

  useEffect(() => {
    if (profileRateLimitTime > 0) {
      const timer = setTimeout(() => setProfileRateLimitTime(profileRateLimitTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [profileRateLimitTime]);

  // Custom Notifications for OneSignal simulation trigger
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string; type: string } | null>(null);

  useEffect(() => {
    if (selectedListing) {
      setDetailActiveTab("photos");
      setShowDirectMessageForm(false);
      setDirectMessageText("");
    }
  }, [selectedListing]);

  // --- Category State ---
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat_satilik_daire");
  const [newCatNameTr, setNewCatNameTr] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatParentId, setNewCatParentId] = useState<string>("");
  const [newCatMaxImages, setNewCatMaxImages] = useState(10);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Admin Category & Attribute management states
  const [adminNewCatNameTr, setAdminNewCatNameTr] = useState("");
  const [adminNewCatNameEn, setAdminNewCatNameEn] = useState("");
  const [adminNewCatParentId, setAdminNewCatParentId] = useState<string>("");
  const [adminNewCatMaxImages, setAdminNewCatMaxImages] = useState(10);
  const [adminNewCatIcon, setAdminNewCatIcon] = useState("Tag");
  const [adminSelectedCatAttr, setAdminSelectedCatAttr] = useState<string>("cat_emlak");
  const [adminAttrKey, setAdminAttrKey] = useState("");
  const [adminAttrLabelTr, setAdminAttrLabelTr] = useState("");
  const [adminAttrLabelEn, setAdminAttrLabelEn] = useState("");
  const [adminAttrType, setAdminAttrType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [adminAttrRequired, setAdminAttrRequired] = useState(false);
  const [adminAttrOptionsString, setAdminAttrOptionsString] = useState("");
  const [adminEditingCategory, setAdminEditingCategory] = useState<Category | null>(null);
  const [editingAttrKey, setEditingAttrKey] = useState("");
  const [editingAttrLabelTr, setEditingAttrLabelTr] = useState("");
  const [editingAttrLabelEn, setEditingAttrLabelEn] = useState("");
  const [editingAttrType, setEditingAttrType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [editingAttrRequired, setEditingAttrRequired] = useState(false);
  const [editingAttrOptionsString, setEditingAttrOptionsString] = useState("");
  const [selectedAttrIndexToEdit, setSelectedAttrIndexToEdit] = useState<number | null>(null);

  // --- Search & Listing State ---
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [selectedAttributesFilter, setSelectedAttributesFilter] = useState<Record<string, any>>({});
  const [searchedListings, setSearchedListings] = useState<Listing[]>(initialListings);
  const [normalSortField, setNormalSortField] = useState<string>("createdAt");
  const [normalSortOrder, setNormalSortOrder] = useState<"asc" | "desc">("desc");

  // Helper to count listings under a category (including descendants)
  const getListingCountForCategory = (catId: string): number => {
    const isDescendant = (childId: string, targetParentId: string): boolean => {
      if (childId === targetParentId) return true;
      const child = categories.find(c => c.id === childId);
      if (!child || !child.parentId) return false;
      return isDescendant(child.parentId, targetParentId);
    };

    return listings.filter(l => {
      const isActive = user?.role === "admin" || !l.status || l.status === "approved" || l.userId === user?.id;
      if (!isActive) return false;
      return isDescendant(l.categoryId, catId);
    }).length;
  };

  const isVehicleOrElectronics = (catId: string | null): "vasita" | "elektronik" | null => {
    if (!catId) return null;
    const isDesc = (id: string, targetId: string): boolean => {
      if (id === targetId) return true;
      const c = categories.find(cat => cat.id === id);
      if (c && c.parentId) {
        return isDesc(c.parentId, targetId);
      }
      return false;
    };
    if (isDesc(catId, "cat_vasita")) return "vasita";
    if (isDesc(catId, "cat_elektronik")) return "elektronik";
    return null;
  };

  const getCategoryAttributesRecursively = (catId: string | null): DynamicAttribute[] => {
    if (!catId) return [];
    const cat = categories.find(c => c.id === catId || c.slug === catId);
    if (!cat) return [];
    
    let currentAttrs = [...(cat.attributes || [])];
    const lineage = isVehicleOrElectronics(cat.id);
    if (lineage && cat.id !== "cat_vasita" && cat.id !== "cat_elektronik") {
      const hasMarka = currentAttrs.some(a => a.key === "marka");
      const hasModel = currentAttrs.some(a => a.key === "model");
      if (!hasMarka) {
        currentAttrs.push({
          key: "marka",
          label_tr: "Marka",
          label_en: "Brand",
          type: "select",
          required: true,
          options: lineage === "vasita"
            ? ["BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Renault"]
            : ["Apple", "Samsung", "Xiaomi", "Huawei", "Sony", "LG"]
        });
      }
      if (!hasModel) {
        currentAttrs.push({
          key: "model",
          label_tr: "Model",
          label_en: "Model",
          type: "select",
          required: true,
          options: lineage === "vasita"
            ? [
                "BMW:320i", "BMW:520d", "BMW:M3",
                "Mercedes:C200", "Mercedes:E180", "Mercedes:CLA 180",
                "Audi:A3", "Audi:A4", "Audi:A6",
                "Volkswagen:Golf", "Volkswagen:Passat", "Volkswagen:Polo"
              ]
            : [
                "Apple:iPhone 13", "Apple:iPhone 14", "Apple:iPhone 15",
                "Samsung:Galaxy S23", "Samsung:Galaxy S24", "Samsung:Galaxy A54",
                "Xiaomi:Redmi Note 12", "Xiaomi:Redmi Note 13", "Xiaomi:Mi 13"
              ]
        });
      }
    }
    
    const parentAttrs = cat.parentId ? getCategoryAttributesRecursively(cat.parentId) : [];
    const combined = [...currentAttrs, ...parentAttrs];
    const unique: DynamicAttribute[] = [];
    const keys = new Set<string>();
    for (const attr of combined) {
      if (!keys.has(attr.key)) {
        keys.add(attr.key);
        unique.push(attr);
      }
    }
    return unique;
  };

  // New Listing creation panel simulation
  const [newListingTitle, setNewListingTitle] = useState("");
  const [newListingDesc, setNewListingDesc] = useState("");
  const [newListingPrice, setNewListingPrice] = useState("");
  const [newListingLocAddress, setNewListingLocAddress] = useState("Kadıköy, İstanbul");
  const [newListingLat, setNewListingLat] = useState(40.9818);
  const [newListingLng, setNewListingLng] = useState(29.0576);
  const [newListingCountry, setNewListingCountry] = useState("Türkiye");
  const [newListingCity, setNewListingCity] = useState("İstanbul");
  const [newListingDistrict, setNewListingDistrict] = useState("Kadıköy");
  const [newListingFeatured, setNewListingFeatured] = useState(false);
  const [newListingImages, setNewListingImages] = useState<string[]>([]);
  const [newListingAttrValues, setNewListingAttrValues] = useState<Record<string, any>>({});
  const [listingError, setListingError] = useState<string | null>(null);

  // Multi-currency support
  const [newListingCurrency, setNewListingCurrency] = useState<"TL" | "USD" | "GBP">("TL");
  const [queryCurrency, setQueryCurrency] = useState<"original" | "TL" | "USD" | "GBP">("original");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    TL: 1.0,
    USD: 33.5,
    GBP: 43.2
  });
  const [exchangeRatesLastUpdated, setExchangeRatesLastUpdated] = useState<string>(new Date().toISOString());
  const [adminRateUsd, setAdminRateUsd] = useState<string>("33.5");
  const [adminRateGbp, setAdminRateGbp] = useState<string>("43.2");

  // Currency helper functions
  const convertPrice = (price: number, from: string | undefined, to: string): number => {
    const fromCur = from || "TL";
    const toCur = to;
    if (fromCur === toCur) return price;

    // Convert from source currency to TL (our base)
    const rateFrom = exchangeRates[fromCur] || 1.0;
    const priceInTL = price * rateFrom;

    // Convert from TL to target currency
    const rateTo = exchangeRates[toCur] || 1.0;
    return priceInTL / rateTo;
  };

  const formatPrice = (price: number, currency: string | undefined): string => {
    const cur = currency || "TL";
    const formattedVal = Number(price).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    if (cur === "TL") return `${formattedVal} TL`;
    if (cur === "USD") return `$${formattedVal}`;
    if (cur === "GBP") return `£${formattedVal}`;
    return `${formattedVal} ${cur}`;
  };

  const renderPriceElement = (ad: Listing, customClass: string = "font-mono font-bold") => {
    const orig = formatPrice(ad.price, ad.currency);
    if (queryCurrency === "original") {
      return <span className={customClass}>{orig}</span>;
    }
    const converted = convertPrice(ad.price, ad.currency, queryCurrency);
    const convertedStr = formatPrice(converted, queryCurrency);
    const isDifferent = (ad.currency || "TL") !== queryCurrency;

    return (
      <span className="inline-flex flex-col">
        <span className={customClass}>{convertedStr}</span>
        {isDifferent && (
          <span className="text-[10px] text-zinc-500 font-normal">
            ({lang === "tr" ? "Orijinal" : "Original"}: {orig})
          </span>
        )}
      </span>
    );
  };

  const [isListingSaving, setIsListingSaving] = useState(false);
  const [savingElapsedSeconds, setSavingElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isListingSaving) {
      setSavingElapsedSeconds(0);
      timer = setInterval(() => {
        setSavingElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSavingElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isListingSaving]);

  // --- Auth & OTP Simulator State ---
  const [user, setUser] = useState<UserType>(() => {
    try {
      const saved = localStorage.getItem("vadi_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading initial user from localStorage:", e);
    }
    return {
      id: "guest",
      email: "",
      phone: "",
      name: "Misafir Kullanıcı",
      status: UserStatus.Unverified,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      oneSignalPlayerId: null,
      oneSignalExternalId: null
    };
  });

  const [otpEmailCode, setOtpEmailCode] = useState("");
  const [otpSmsCode, setOtpSmsCode] = useState("");
  const [emailInputCode, setEmailInputCode] = useState("");
  const [smsInputCode, setSmsInputCode] = useState("");

  const [emailRateLimitTime, setEmailRateLimitTime] = useState(0);
  const [smsRateLimitTime, setSmsRateLimitTime] = useState(0);

  const [emailAttempts, setEmailAttempts] = useState(0);
  const [smsAttempts, setSmsAttempts] = useState(0);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // --- Login Form States ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- Register Form States ---
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerStep, setRegisterStep] = useState<"form" | "verify">("form");
  const [registerVerifyCode, setRegisterVerifyCode] = useState("");
  const [registerSentOtp, setRegisterSentOtp] = useState("");

  // --- Forgot Password States ---
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotInputOtp, setForgotInputOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);

  // --- OneSignal Push Notification Sim State ---
  const [oneSignalPlayerId, setOneSignalPlayerId] = useState("8bf07312-32a1-432d-9f44-8cb312dd71c4");
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  // --- API Swagger State ---
  const [selectedApiIndex, setSelectedApiIndex] = useState(0);
  const [apiResponseMock, setApiResponseMock] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // --- PWA Simulation State ---
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Map panning & zoom simulation
  const [mapCenter, setMapCenter] = useState({ lat: 41.0151, lng: 28.9795 });
  const [mapZoom, setMapZoom] = useState(11);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

  const handleGoHome = () => {
    setCurrentPage("main");
    setSelectedListing(null);
    setSearchQuery("");
    setSelectedCatFilter("");
    setMinPrice("");
    setMaxPrice("");
    setFeaturedFilter(false);
  };

  // Trigger real-time fuzzy search on listings
  const handleSearch = async () => {
    try {
      const response = await fetch("/api/fuzzy-search", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": user?.id || "",
          "X-User-Role": user?.role || ""
        },
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCatFilter,
          minPrice,
          maxPrice,
          featuredOnly: featuredFilter,
          userId: user?.id || "",
          queryCurrency,
          attributes: selectedAttributesFilter
        })
      });
      const result = await response.json();
      if (result && result.data) {
        const filteredByStatus = result.data.filter((l: any) => {
          return user?.role === "admin" || !l.status || l.status === "approved" || l.userId === user?.id;
        });
        setSearchedListings(filteredByStatus);
      }
    } catch (e) {
      // client-side fallback
      let filtered = listings.filter(l => {
        return user?.role === "admin" || !l.status || l.status === "approved" || l.userId === user?.id;
      });
      if (selectedCatFilter) {
        const isMatch = (catId: string, filterStr: string): boolean => {
          if (catId === filterStr) return true;
          const c = categories.find(x => x.id === catId);
          if (!c) return false;
          if (c.nameTr.toLowerCase().includes(filterStr.toLowerCase()) ||
              c.nameEn.toLowerCase().includes(filterStr.toLowerCase()) ||
              c.slug.toLowerCase().includes(filterStr.toLowerCase()) ||
              c.id === filterStr) {
            return true;
          }
          if (c.parentId) {
            return isMatch(c.parentId, filterStr);
          }
          return false;
        };
        filtered = filtered.filter(l => isMatch(l.categoryId, selectedCatFilter));
      }
      if (selectedAttributesFilter && Object.keys(selectedAttributesFilter).length > 0) {
        filtered = filtered.filter(l => {
          return Object.entries(selectedAttributesFilter).every(([key, filterVal]) => {
            if (filterVal === undefined || filterVal === null || filterVal === "") return true;
            const itemVal = l.attributes?.[key];
            if (itemVal === undefined || itemVal === null) return false;
            return String(itemVal).toLowerCase().includes(String(filterVal).toLowerCase());
          });
        });
      }
      if (searchQuery) {
        filtered = filtered.filter(l => 
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (minPrice) {
        filtered = filtered.filter(l => {
          const itemPriceConverted = queryCurrency !== "original" ? convertPrice(l.price, l.currency, queryCurrency) : l.price;
          return itemPriceConverted >= Number(minPrice);
        });
      }
      if (maxPrice) {
        filtered = filtered.filter(l => {
          const itemPriceConverted = queryCurrency !== "original" ? convertPrice(l.price, l.currency, queryCurrency) : l.price;
          return itemPriceConverted <= Number(maxPrice);
        });
      }
      if (featuredFilter) {
        filtered = filtered.filter(l => l.featured);
      }
      setSearchedListings(filtered);
    }
  };

  const handleSortNormal = (field: string) => {
    if (normalSortField === field) {
      setNormalSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setNormalSortField(field);
      setNormalSortOrder("desc");
    }
  };

  const getSortedStandardListings = () => {
    const list = searchedListings.filter(ad => !ad.featured);
    return [...list].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (normalSortField === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (normalSortField === "category") {
        const catA = categories.find(c => c.id === a.categoryId);
        const catB = categories.find(c => c.id === b.categoryId);
        valA = catA ? (lang === "tr" ? catA.nameTr : catA.nameEn).toLowerCase() : "";
        valB = catB ? (lang === "tr" ? catB.nameTr : catB.nameEn).toLowerCase() : "";
      } else if (normalSortField === "price") {
        valA = a.price;
        valB = b.price;
      } else if (normalSortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (normalSortField === "location") {
        valA = (a.location?.address || "").toLowerCase();
        valB = (b.location?.address || "").toLowerCase();
      }

      if (valA < valB) return normalSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return normalSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Load listings, users, categories and simulated emails on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const resListings = await fetch("/api/listings");
        const dataListings = await resListings.json();
        if (dataListings && dataListings.data) {
          setListings(dataListings.data);
        }

        const resUsers = await fetch("/api/users");
        const dataUsers = await resUsers.json();
        if (dataUsers && dataUsers.data) {
          setAdminUsers(dataUsers.data);
        }

        const resCategories = await fetch("/api/categories");
        const dataCategories = await resCategories.json();
        if (dataCategories && dataCategories.data) {
          setCategories(dataCategories.data);
        }

        const resEmails = await fetch("/api/simulated-emails");
        const dataEmails = await resEmails.json();
        if (dataEmails && dataEmails.data) {
          setSimulatedEmails(dataEmails.data);
        }

        const resAds = await fetch("/api/advertisements");
        const dataAds = await resAds.json();
        if (dataAds && dataAds.data) {
          setAdvertisements(dataAds.data);
        }

        const resClicks = await fetch("/api/advertisements/clicks");
        const dataClicks = await resClicks.json();
        if (dataClicks && dataClicks.data) {
          setAdClicks(dataClicks.data);
        }

        const resExchangeRates = await fetch("/api/exchange-rates");
        const dataExchangeRates = await resExchangeRates.json();
        if (dataExchangeRates && dataExchangeRates.success && dataExchangeRates.data && dataExchangeRates.data.length > 0) {
          const fetchedRates = dataExchangeRates.data[0].rates;
          setExchangeRates(fetchedRates);
          setExchangeRatesLastUpdated(dataExchangeRates.data[0].lastUpdated);
          if (fetchedRates.USD) setAdminRateUsd(fetchedRates.USD.toString());
          if (fetchedRates.GBP) setAdminRateGbp(fetchedRates.GBP.toString());
        }

        const resLocations = await fetch("/api/locations");
        const dataLocations = await resLocations.json();
        if (dataLocations && dataLocations.success && dataLocations.data) {
          setLocations(dataLocations.data);
        }
      } catch (err) {
        console.error("Backend fetch error on mount, using initial values:", err);
      }
    };
    fetchBackendData();
  }, []);

  // Active User session persistence and auto-sync with backend
  useEffect(() => {
    const fetchUserData = async () => {
      const saved = localStorage.getItem("vadi_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) {
            setUser(parsed);
            // Fetch fresh copy from backend users API to sync
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data && data.data) {
              const fresh = data.data.find((u: any) => u.id === parsed.id);
              if (fresh) {
                setUser(fresh);
                localStorage.setItem("vadi_user", JSON.stringify(fresh));
              }
            }
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user && user.id !== "guest") {
      localStorage.setItem("vadi_user", JSON.stringify(user));
      // Sync update with backend database to keep session persistent
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user })
      }).catch(err => console.error("Error syncing user session with backend:", err));

      // Synchronize current user with the admin panel users list to reflect updates immediately
      setAdminUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      localStorage.removeItem("vadi_user");
    }
  }, [user]);

  // --- Solution A: SPA Deep Link Routing & Path Sync ---
  // Handle URL matching on mount or when listings load
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/(listing|ilan)\/([a-zA-Z0-9_-]+)$/);
      
      if (match) {
        const id = match[2];
        if (listings && listings.length > 0) {
          const found = listings.find(l => l.id === id);
          if (found) {
            setSelectedListing(found);
            setCurrentPage("main");
          }
        }
      } else if (path === "/admin") {
        if (user.role === "admin") {
          setCurrentPage("admin");
        } else {
          setCurrentPage("main");
          window.history.replaceState(null, "", "/");
        }
      } else if (path === "/login") {
        setCurrentPage("login");
      } else if (path === "/register") {
        setCurrentPage("register");
      } else if (path === "/forgot-password") {
        setCurrentPage("forgot-password");
      } else if (path === "/harita" || path === "/map") {
        setCurrentPage("map-fullscreen");
      } else if (path === "/") {
        setCurrentPage("main");
        setSelectedListing(null);
      }
    };

    handleUrlRouting();

    // Listen to popstate (browser back/forward)
    window.addEventListener("popstate", handleUrlRouting);
    return () => {
      window.removeEventListener("popstate", handleUrlRouting);
    };
  }, [listings, user.role]);

  // Sync URL when selectedListing or currentPage changes
  useEffect(() => {
    if (currentPage === "map-fullscreen") return;
    const path = window.location.pathname;
    
    if (selectedListing) {
      const targetPath = `/${lang === "tr" ? "ilan" : "listing"}/${selectedListing.id}`;
      if (path !== targetPath) {
        window.history.pushState({ listingId: selectedListing.id }, "", targetPath);
      }
    } else {
      // Sync other pages if selectedListing is null
      let targetPath = "/";
      if (currentPage === "admin" && user.role === "admin") {
        targetPath = "/admin";
      } else if (currentPage === "login") {
        targetPath = "/login";
      } else if (currentPage === "register") {
        targetPath = "/register";
      } else if (currentPage === "forgot-password") {
        targetPath = "/forgot-password";
      }

      if (path !== targetPath && !path.startsWith("/listing/") && !path.startsWith("/ilan/")) {
        window.history.pushState(null, "", targetPath);
      }
    }
  }, [selectedListing, currentPage, user.role, lang]);

  useEffect(() => {
    setSelectedAttributesFilter({});
  }, [selectedCatFilter]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCatFilter, minPrice, maxPrice, featuredFilter, listings, user.id, queryCurrency, exchangeRates, selectedAttributesFilter]);

  // Rate Limiter Timers countdown
  useEffect(() => {
    if (emailRateLimitTime > 0) {
      const timer = setTimeout(() => setEmailRateLimitTime(emailRateLimitTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailRateLimitTime]);

  useEffect(() => {
    if (smsRateLimitTime > 0) {
      const timer = setTimeout(() => setSmsRateLimitTime(smsRateLimitTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsRateLimitTime]);

  // Toast auto-clear
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // OneSignal External ID Mapping Simulation
  const handleOneSignalRegister = async () => {
    setApiLoading(true);
    try {
      const response = await fetch("/api/update-push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          oneSignalPlayerId: isPushSubscribed ? null : oneSignalPlayerId,
          action: isPushSubscribed ? "DEREGISTER" : "REGISTER"
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsPushSubscribed(!isPushSubscribed);
        setUser(prev => ({
          ...prev,
          oneSignalPlayerId: !isPushSubscribed ? oneSignalPlayerId : null,
          oneSignalExternalId: !isPushSubscribed ? user.id : null
        }));
        setToastNotification({
          title: !isPushSubscribed ? "OneSignal Subscribed" : "OneSignal Unsubscribed",
          message: data.message,
          type: "success"
        });
      }
    } catch (e) {
      setIsPushSubscribed(!isPushSubscribed);
    } finally {
      setApiLoading(false);
    }
  };

  // Triggering test notifications
  const triggerPushDemo = (type: "price_drop" | "chat_message" | "admin_alert") => {
    if (!isPushSubscribed) {
      setToastNotification({
        title: lang === "tr" ? "Abonelik Bulunamadı" : "No Active Subscription",
        message: lang === "tr" ? "Bildirim alabilmek için önce 'OneSignal Eşleştirmesini Aktif Et' butonuna tıklamalısınız." : "You must enable 'OneSignal Sync' first to receive push notifications.",
        type: "warning"
      });
      return;
    }

    if (type === "price_drop") {
      setToastNotification({
        title: lang === "tr" ? "🔔 Fiyat Düşüşü Bildirimi!" : "🔔 Price Drop Alert!",
        message: lang === "tr" ? "Takip ettiğiniz 'iPhone 15 Pro Max' ilanında fiyat 68,000 TL'den 64,500 TL'ye düştü!" : "The price of your favorite 'iPhone 15 Pro Max' dropped from 68,000 TRY to 64,500 TRY!",
        type: "info"
      });
    } else if (type === "chat_message") {
      setToastNotification({
        title: lang === "tr" ? "💬 Yeni Sohbet Mesajı" : "💬 New Message",
        message: lang === "tr" ? "Ahmet Y.: 'İlanınız için son fiyat nedir? Detayları görüşebilir miyiz?'" : "Ahmet Y.: 'What is your best price? Can we discuss details?'",
        type: "info"
      });
    } else {
      setToastNotification({
        title: lang === "tr" ? "📢 Sistem Duyurusu" : "📢 System Announcement",
        message: lang === "tr" ? "Yönetici: 'Platformumuzda yeni harita entegrasyonu yayına girdi! Hemen deneyin.'" : "Admin: 'Our brand new map integration is live now! Check it out.'",
        type: "info"
      });
    }
  };

  // OTP Sending simulation with Security Rules check
  const sendOtpCode = async (type: "email" | "sms") => {
    const dest = type === "email" ? user.email : user.phone;
    
    // Check local rate limits first
    if (type === "email" && emailRateLimitTime > 0) return;
    if (type === "sms" && smsRateLimitTime > 0) return;

    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, destination: dest })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.error);
        return;
      }

      if (type === "email") {
        setOtpEmailCode(data.debugCode);
        setEmailRateLimitTime(60); // 60s restriction
        setAuthSuccess(lang === "tr" ? `E-posta onay kodu gönderildi: ${data.debugCode} (Geliştirme için gösterilmiştir)` : `Email OTP sent: ${data.debugCode} (Shown for testing purposes)`);
      } else {
        setOtpSmsCode(data.debugCode);
        setSmsRateLimitTime(60); // 60s restriction
        setAuthSuccess(lang === "tr" ? `SMS OTP onay kodu gönderildi: ${data.debugCode} (Geliştirme için gösterilmiştir)` : `SMS OTP code sent: ${data.debugCode} (Shown for testing purposes)`);
      }
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  // OTP verifying simulation with Brute Force limits
  const verifyOtpCode = async (type: "email" | "sms") => {
    const dest = type === "email" ? user.email : user.phone;
    const code = type === "email" ? emailInputCode : smsInputCode;

    setAuthError(null);
    setAuthSuccess(null);

    // Simulated local attack prevention increment
    if (type === "email") {
      if (emailAttempts >= 3) {
        setAuthError(lang === "tr" ? "Güvenlik nedeniyle hesabınız kilitlendi. Çok fazla deneme yapıldı!" : "Brute force detected! Too many failed verification attempts.");
        return;
      }
    } else {
      if (smsAttempts >= 3) {
        setAuthError(lang === "tr" ? "Çok fazla başarısız deneme! SMS kodunuz bloke oldu. Lütfen yeni kod isteyin." : "SMS OTP blocked due to multiple incorrect submissions.");
        return;
      }
    }

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: dest, code })
      });
      const data = await response.json();

      if (!response.ok) {
        if (type === "email") {
          setEmailAttempts(prev => prev + 1);
        } else {
          setSmsAttempts(prev => prev + 1);
        }
        setAuthError(data.error);
        return;
      }

      // Success
      setAuthSuccess(data.message);
      if (type === "email") {
        setEmailInputCode("");
        const newStatus = user.status === UserStatus.Unverified ? UserStatus.Email_Verified : user.status;
        setUser(prev => ({
          ...prev,
          status: newStatus,
          emailVerifiedAt: new Date().toISOString()
        }));
      } else {
        setSmsInputCode("");
        setUser(prev => ({
          ...prev,
          status: UserStatus.Fully_Verified,
          phoneVerifiedAt: new Date().toISOString()
        }));
      }
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  // Reset verification for simulator testing
  const resetVerificationSim = () => {
    setUser(prev => ({
      ...prev,
      status: UserStatus.Unverified,
      emailVerifiedAt: null,
      phoneVerifiedAt: null
    }));
    setEmailAttempts(0);
    setSmsAttempts(0);
    setOtpEmailCode("");
    setOtpSmsCode("");
    setAuthSuccess(lang === "tr" ? "Kullanıcı doğrulama simülatörü sıfırlandı!" : "User verification state has been reset!");
    setAuthError(null);
  };

  // --- Profile Modal Custom Actions ---
  const handleProfileSendOtp = async () => {
    if (profileRateLimitTime > 0) return;
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", destination: user.email })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setProfileError(data.error || (lang === "tr" ? "Bir hata oluştu" : "An error occurred"));
        return;
      }

      setProfileOtpCode(data.debugCode);
      setProfileRateLimitTime(60);
      setProfileEmailVerificationSent(true);
      setProfileSuccess(
        lang === "tr" 
          ? `E-posta onay kodu gönderildi: ${data.debugCode} (Geliştirme amacıyla gösterilmektedir)` 
          : `Email OTP code sent: ${data.debugCode} (Shown for development testing purposes)`
      );
    } catch (err: any) {
      setProfileError(err.message || (lang === "tr" ? "E-posta gönderilemedi" : "Failed to send email"));
    }
  };

  const handleProfileVerifyOtp = async () => {
    if (profileEmailAttempts >= 3) {
      setProfileError(
        lang === "tr" 
          ? "Güvenlik nedeniyle çok fazla deneme yapıldı! Lütfen yeni kod isteyin." 
          : "Too many failed attempts! Please request a new verification code."
      );
      return;
    }

    setProfileError(null);
    setProfileSuccess(null);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: user.email, code: profileEmailVerificationCode })
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileEmailAttempts(prev => prev + 1);
        setProfileError(data.error || (lang === "tr" ? "Geçersiz kod" : "Invalid code"));
        return;
      }

      setProfileSuccess(
        lang === "tr" 
          ? "E-posta adresiniz başarıyla onaylandı!" 
          : "Your email address has been verified successfully!"
      );
      setProfileEmailVerificationSent(false);
      setProfileEmailVerificationCode("");
      
      const newStatus = user.status === UserStatus.Unverified ? UserStatus.Email_Verified : user.status;
      setUser(prev => ({
        ...prev,
        status: newStatus,
        emailVerifiedAt: new Date().toISOString()
      }));
    } catch (err: any) {
      setProfileError(err.message || (lang === "tr" ? "Doğrulama hatası" : "Verification error"));
    }
  };

  const handleProfileResetVerification = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const updatedUser = {
        ...user,
        status: UserStatus.Unverified,
        emailVerifiedAt: null
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: updatedUser })
      });
      
      if (!response.ok) {
        const data = await response.json();
        setProfileError(data.error || (lang === "tr" ? "Sıfırlanırken hata oluştu" : "Failed to reset"));
        return;
      }

      setUser(updatedUser);
      setProfileEmailVerificationSent(false);
      setProfileEmailVerificationCode("");
      setProfileOtpCode("");
      setProfileEmailAttempts(0);
      setProfileSuccess(
        lang === "tr" 
          ? "E-posta doğrulama durumu başarıyla sıfırlandı. Yeniden doğrulama yapabilirsiniz." 
          : "Email verification status reset successfully. You can try verifying again."
      );
    } catch (err: any) {
      setProfileError(err.message || (lang === "tr" ? "Bir hata oluştu" : "An error occurred"));
    }
  };

  const handleProfileSave = async () => {
    setProfileIsSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // Create user copy with updated structured address
      const updatedUser = {
        ...user,
        address: profileAddress,
        country: profileCountry,
        city: profileCity,
        district: profileDistrict
      };

      // Direct POST call to /api/users to save the updated data in backend
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: updatedUser })
      });
      
      if (!response.ok) {
        const data = await response.json();
        setProfileError(data.error || (lang === "tr" ? "Profil güncellenirken hata oluştu" : "Failed to update profile"));
        setProfileIsSaving(false);
        return;
      }

      // Update state, this triggers localstorage and user effect
      setUser(updatedUser);
      
      setProfileSuccess(
        lang === "tr" 
          ? "Profil bilgileriniz başarıyla güncellendi!" 
          : "Your profile information has been updated successfully!"
      );
      
      // Close modal after a short delay so the user sees the success state
      setTimeout(() => {
        setShowProfileModal(false);
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message || (lang === "tr" ? "Bir hata oluştu" : "An error occurred"));
    } finally {
      setProfileIsSaving(false);
    }
  };

  // AI Dynamic Fields Generator using Server-Side Gemini API
  const generateAiAttributes = async () => {
    const targetCat = categories.find(c => c.id === selectedCategoryId);
    if (!targetCat) return;

    setAiGenerating(true);
    try {
      const response = await fetch("/api/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: targetCat.nameTr })
      });
      const data = await response.json();
      
      if (data.attributes && data.attributes.length > 0) {
        const updatedCat = { ...targetCat, attributes: data.attributes };
        // Sync with backend
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: updatedCat })
        }).catch(err => console.error("Error saving dynamic fields:", err));

        // Map and update category with these fields
        setCategories(prev => prev.map(c => {
          if (c.id === selectedCategoryId) {
            return updatedCat;
          }
          return c;
        }));
        setToastNotification({
          title: lang === "tr" ? "Yapay Zeka Alanları Üretti" : "AI Fields Generated",
          message: lang === "tr" ? `Gemini API, '${targetCat.nameTr}' kategorisine özel dinamik alanlar atadı.` : `Gemini API mapped custom dynamic attributes for '${targetCat.nameEn}'.`,
          type: "success"
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  // --- Advertisement & Banner Actions ---

  const fetchAdvertisements = async () => {
    try {
      const res = await fetch("/api/advertisements");
      const data = await res.json();
      if (data && data.data) {
        setAdvertisements(data.data);
      }
    } catch (err) {
      console.error("Error fetching advertisements:", err);
    }
  };

  const fetchAdClicks = async () => {
    try {
      const res = await fetch("/api/advertisements/clicks");
      const data = await res.json();
      if (data && data.data) {
        setAdClicks(data.data);
      }
    } catch (err) {
      console.error("Error fetching ad clicks:", err);
    }
  };

  const getActiveAds = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    return advertisements.filter(ad => {
      return ad.status === "active" && 
             (!ad.startDate || ad.startDate <= todayStr) && 
             (!ad.endDate || ad.endDate >= todayStr);
    });
  };

  const activeAds = getActiveAds();

  // Rotate active ads every 5 seconds if multiple
  useEffect(() => {
    if (activeAds.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAdIndex(prev => (prev + 1) % activeAds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeAds.length]);

  const handleAdClick = async (ad: any) => {
    try {
      await fetch(`/api/advertisements/${ad.id}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName: user?.name || null
        })
      });
      // Refresh local logs
      fetchAdClicks();
    } catch (err) {
      console.error("Error logging ad click:", err);
    }
    if (ad.link) {
      window.open(ad.link, "_blank");
    }
  };

  const handleAdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdImageError(null);

    // Size limit check: 2MB
    if (file.size > 2 * 1024 * 1024) {
      setAdImageError(
        lang === "tr" 
          ? "Resim boyutu çok büyük! Maksimum 2MB yükleyebilirsiniz." 
          : "File size too large! Maximum allowed is 2MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        const ratio = img.width / img.height;
        if (ratio < 1.4 || ratio > 2.6) {
          setAdImageError(
            lang === "tr"
              ? `Uygun Olmayan Format! En-Boy Oranı: ${ratio.toFixed(2)}. Önerilen: Yatay Banner (16:9 oranında, örn: 1200x630px). Lütfen en-boy oranı 1.5 ile 2.5 arasında bir resim seçin.`
              : `Invalid Format! Aspect Ratio: ${ratio.toFixed(2)}. Recommended: Landscape Banner (16:9 ratio, e.g. 1200x630px). Please upload an image with a ratio between 1.5 and 2.5.`
          );
          return;
        }
        
        try {
          // Banners are horizontal, compress to max width 800px and 0.7 quality (perfectly optimized)
          const compressed = await compressImage(rawBase64, 800, 450, 0.7);
          setNewAdImage(compressed);
        } catch (err) {
          console.error("Ad image compression failed:", err);
          setNewAdImage(rawBase64);
        }
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adOwner || !adLink || !adStartDate || !adEndDate) {
      setToastNotification({
        title: lang === "tr" ? "Hata" : "Error",
        message: lang === "tr" ? "Lütfen tüm zorunlu alanları doldurun." : "Please fill in all required fields.",
        type: "warning"
      });
      return;
    }

    const newAd = {
      title: adTitle,
      description: adDescription,
      owner: adOwner,
      imageUrl: newAdImage || "",
      link: adLink,
      startDate: adStartDate,
      endDate: adEndDate,
      status: adStatus,
      metadata: adMetadata,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertisement: newAd })
      });
      const data = await res.json();
      if (data && data.success) {
        setToastNotification({
          title: lang === "tr" ? "Başarılı" : "Success",
          message: lang === "tr" ? "Reklam başarıyla eklendi." : "Advertisement added successfully.",
          type: "success"
        });
        setAdTitle("");
        setAdDescription("");
        setAdOwner("");
        setAdLink("");
        setAdStartDate("");
        setAdEndDate("");
        setAdStatus("active");
        setAdMetadata("");
        setNewAdImage("");
        setAdImageError(null);
        fetchAdvertisements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdDescription(ad.description || "");
    setAdOwner(ad.owner);
    setAdLink(ad.link);
    setAdStartDate(ad.startDate);
    setAdEndDate(ad.endDate);
    setAdStatus(ad.status);
    setAdMetadata(ad.metadata || "");
    setNewAdImage(ad.imageUrl || "");
    setAdImageError(null);
    // Scroll form into view
    const element = document.getElementById("ad-form-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    if (!adTitle || !adOwner || !adLink || !adStartDate || !adEndDate) {
      setToastNotification({
        title: lang === "tr" ? "Hata" : "Error",
        message: lang === "tr" ? "Lütfen tüm zorunlu alanları doldurun." : "Please fill in all required fields.",
        type: "warning"
      });
      return;
    }

    const updatedAd = {
      ...editingAd,
      title: adTitle,
      description: adDescription,
      owner: adOwner,
      imageUrl: newAdImage || "",
      link: adLink,
      startDate: adStartDate,
      endDate: adEndDate,
      status: adStatus,
      metadata: adMetadata
    };

    try {
      const res = await fetch(`/api/advertisements/${editingAd.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertisement: updatedAd })
      });
      const data = await res.json();
      if (data && data.success) {
        setToastNotification({
          title: lang === "tr" ? "Başarılı" : "Success",
          message: lang === "tr" ? "Reklam başarıyla güncellendi." : "Ad updated successfully.",
          type: "success"
        });
        setEditingAd(null);
        setAdTitle("");
        setAdDescription("");
        setAdOwner("");
        setAdLink("");
        setAdStartDate("");
        setAdEndDate("");
        setAdStatus("active");
        setAdMetadata("");
        setNewAdImage("");
        setAdImageError(null);
        fetchAdvertisements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAdStatus = async (ad: any) => {
    const updatedAd = { ...ad, status: ad.status === "active" ? "inactive" : "active" };
    try {
      const res = await fetch(`/api/advertisements/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertisement: updatedAd })
      });
      const data = await res.json();
      if (data && data.success) {
        setToastNotification({
          title: lang === "tr" ? "Başarılı" : "Success",
          message: lang === "tr" ? "Reklam durumu güncellendi." : "Ad status updated.",
          type: "success"
        });
        fetchAdvertisements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm(lang === "tr" ? "Bu reklamı silmek istediğinize emin misiniz?" : "Are you sure you want to delete this ad?")) return;
    try {
      const res = await fetch(`/api/advertisements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data && data.success) {
        setToastNotification({
          title: lang === "tr" ? "Başarılı" : "Success",
          message: lang === "tr" ? "Reklam silindi." : "Ad deleted.",
          type: "success"
        });
        if (editingAd?.id === id) {
          setEditingAd(null);
          setAdTitle("");
          setAdDescription("");
          setAdOwner("");
          setAdLink("");
          setAdStartDate("");
          setAdEndDate("");
          setAdStatus("active");
          setAdMetadata("");
          setNewAdImage("");
          setAdImageError(null);
        }
        fetchAdvertisements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Custom Category recursively
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameTr || !newCatNameEn) return;

    const newId = "cat_" + Math.random().toString(36).substring(2, 9);
    const newSlug = newCatNameTr.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const newCat: Category = {
      id: newId,
      parentId: newCatParentId || null,
      nameTr: newCatNameTr,
      nameEn: newCatNameEn,
      slug: newSlug,
      icon: "Tag",
      maxImages: newCatMaxImages,
      attributes: [
        { key: "durum", label_tr: "Ürün Durumu", label_en: "Condition", type: "select", required: true, options: ["Yeni", "Az Kullanılmış", "Eski"] }
      ]
    };

    // Sync with backend
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCat })
    }).catch(err => console.error("Error adding category:", err));

    setCategories(prev => [...prev, newCat]);
    setNewCatNameTr("");
    setNewCatNameEn("");
    setNewCatParentId("");
    setSelectedCategoryId(newId);

    setToastNotification({
      title: lang === "tr" ? "Kategori Eklendi" : "Category Added",
      message: lang === "tr" ? `'${newCatNameTr}' başarıyla hiyerarşiye eklendi.` : `'${newCatNameEn}' added to taxonomy tree.`,
      type: "success"
    });
  };

  // --- Admin Panel Operations ---

  // User management actions
  const handleAddSimulatedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewName || !adminNewEmail || !adminNewPhone) {
      setToastNotification({
        title: lang === "tr" ? "Eksik Bilgi" : "Validation Error",
        message: lang === "tr" ? "Lütfen tüm kullanıcı alanlarını doldurun." : "Please fill out name, email, and phone contact details.",
        type: "warning"
      });
      return;
    }
    const newUser: UserType = {
      id: "user_" + Math.floor(Math.random() * 10000),
      name: adminNewName,
      email: adminNewEmail,
      phone: adminNewPhone,
      status: adminNewStatus,
      role: adminNewRole,
      emailVerifiedAt: adminNewStatus !== UserStatus.Unverified ? new Date().toISOString() : null,
      phoneVerifiedAt: adminNewStatus === UserStatus.Fully_Verified ? new Date().toISOString() : null,
      oneSignalPlayerId: null,
      oneSignalExternalId: null
    };

    // Sync with backend
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: newUser })
    }).catch(err => console.error("Error creating user:", err));

    setAdminUsers(prev => [...prev, newUser]);
    setAdminNewName("");
    setAdminNewEmail("");
    setAdminNewPhone("");
    setAdminNewStatus(UserStatus.Unverified);
    setAdminNewRole("user");
    setToastNotification({
      title: lang === "tr" ? "Kullanıcı Eklendi" : "User Added",
      message: lang === "tr" ? `${newUser.name} başarıyla sisteme kaydedildi.` : `${newUser.name} registered into simulation database successfully.`,
      type: "success"
    });
  };

  const handleUpdateSimulatedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingUser) return;

    // Sync with backend
    fetch(`/api/users/${adminEditingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: adminEditingUser })
    }).catch(err => console.error("Error updating user:", err));

    setAdminUsers(prev => prev.map(u => u.id === adminEditingUser.id ? adminEditingUser : u));
    
    // Sync with active session user if edited
    if (adminEditingUser.id === user.id) {
      setUser(adminEditingUser);
    }

    setToastNotification({
      title: lang === "tr" ? "Kullanıcı Güncellendi" : "User Updated",
      message: lang === "tr" ? "Kullanıcı bilgileri başarıyla güncellendi." : "Simulated user details updated successfully.",
      type: "success"
    });
    setAdminEditingUser(null);
  };

  const handleDeleteSimulatedUser = (userId: string) => {
    const targetUser = adminUsers.find(u => u.id === userId);

    // Sync with backend
    fetch(`/api/users/${userId}`, {
      method: "DELETE"
    }).catch(err => console.error("Error deleting user:", err));

    setAdminUsers(prev => prev.filter(u => u.id !== userId));
    setToastNotification({
      title: lang === "tr" ? "Kullanıcı Silindi" : "User Terminated",
      message: lang === "tr" ? `${targetUser?.name || "Kullanıcı"} veri tabanından kalıcı olarak silindi.` : `${targetUser?.name || "User"} purged from directory.`,
      type: "error"
    });
  };

  const handleCycleUserStatus = (userId: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        let nextStatus = UserStatus.Unverified;
        if (u.status === UserStatus.Unverified) nextStatus = UserStatus.Email_Verified;
        else if (u.status === UserStatus.Email_Verified) nextStatus = UserStatus.Fully_Verified;
        
        const updated = {
          ...u,
          status: nextStatus,
          emailVerifiedAt: nextStatus !== UserStatus.Unverified ? new Date().toISOString() : null,
          phoneVerifiedAt: nextStatus === UserStatus.Fully_Verified ? new Date().toISOString() : null
        };
        
        // Sync with backend
        fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: updated })
        }).catch(err => console.error("Error cycling user status:", err));

        if (u.id === user.id) {
          setUser(updated);
        }
        
        setToastNotification({
          title: lang === "tr" ? "Yetkilendirme Güncellendi" : "Authorization Altered",
          message: lang === "tr" ? `${u.name} statüsü: ${nextStatus}` : `${u.name} status updated to ${nextStatus}`,
          type: "info"
        });
        return updated;
      }
      return u;
    }));
  };

  const handleCreateCategoryAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewCatNameTr || !adminNewCatNameEn) {
      setToastNotification({
        title: lang === "tr" ? "Eksik Bilgi" : "Validation Error",
        message: lang === "tr" ? "Kategori adlarını doldurmalısınız." : "Please define both Turkish and English localized names.",
        type: "warning"
      });
      return;
    }

    const newSlug = adminNewCatNameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat: Category = {
      id: "cat_" + Math.floor(Math.random() * 10000),
      parentId: adminNewCatParentId === "" ? null : adminNewCatParentId,
      nameTr: adminNewCatNameTr,
      nameEn: adminNewCatNameEn,
      slug: newSlug,
      icon: adminNewCatIcon,
      maxImages: adminNewCatMaxImages,
      attributes: []
    };

    // Sync with backend
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCat })
    }).catch(err => console.error("Error creating category:", err));

    setCategories(prev => [...prev, newCat]);
    setAdminNewCatNameTr("");
    setAdminNewCatNameEn("");
    setAdminNewCatParentId("");
    setAdminNewCatMaxImages(10);
    setAdminNewCatIcon("Tag");

    setToastNotification({
      title: lang === "tr" ? "Kategori Oluşturuldu" : "Category Created",
      message: lang === "tr" ? `'${newCat.nameTr}' kategorisi hiyerarşiye eklendi.` : `'${newCat.nameEn}' category appended to tree successfully.`,
      type: "success"
    });
  };

  const handleSaveEditedCategoryAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingCategory) return;
    if (!adminEditingCategory.nameTr || !adminEditingCategory.nameEn) {
      setToastNotification({
        title: lang === "tr" ? "Eksik Bilgi" : "Validation Error",
        message: lang === "tr" ? "Kategori adlarını doldurmalısınız." : "Please define both Turkish and English localized names.",
        type: "warning"
      });
      return;
    }

    // Auto-compute slug
    const updatedSlug = adminEditingCategory.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categoryToSave = {
      ...adminEditingCategory,
      slug: updatedSlug
    };

    // Sync with backend
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: categoryToSave })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCategories(prev => prev.map(c => c.id === categoryToSave.id ? categoryToSave : c));
        setAdminEditingCategory(null);
        setToastNotification({
          title: lang === "tr" ? "Kategori Güncellendi" : "Category Updated",
          message: lang === "tr" 
            ? `'${categoryToSave.nameTr}' kategorisi başarıyla kaydedildi.` 
            : `'${categoryToSave.nameEn}' category successfully saved.`,
          type: "success"
        });
      } else {
        setToastNotification({
          title: lang === "tr" ? "Hata" : "Error",
          message: data.error || (lang === "tr" ? "Kategori kaydedilemedi." : "Failed to save category."),
          type: "error"
        });
      }
    })
    .catch(err => {
      console.error(err);
      setToastNotification({
        title: lang === "tr" ? "Hata" : "Error",
        message: lang === "tr" ? "Sunucu bağlantı hatası." : "Server connection failure.",
        type: "error"
      });
    });
  };

  const handleAddAttributeAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAttrKey || !adminAttrLabelTr || !adminAttrLabelEn) {
      setToastNotification({
        title: lang === "tr" ? "Eksik Bilgi" : "Validation Error",
        message: lang === "tr" ? "Lütfen özellik anahtarı ve başlıklarını doldurun." : "Fill attribute key identifier and headers.",
        type: "warning"
      });
      return;
    }

    const options = adminAttrOptionsString 
      ? adminAttrOptionsString.split(",").map(s => s.trim()).filter(Boolean) 
      : undefined;

    const newAttr: DynamicAttribute = {
      key: adminAttrKey,
      label_tr: adminAttrLabelTr,
      label_en: adminAttrLabelEn,
      type: adminAttrType,
      required: adminAttrRequired,
      options
    };

    const targetCat = categories.find(c => c.id === adminSelectedCatAttr);
    if (targetCat) {
      const updatedCat = {
        ...targetCat,
        attributes: [...(targetCat.attributes || []), newAttr]
      };
      // Sync with backend
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: updatedCat })
      }).catch(err => console.error("Error adding attribute:", err));
    }

    setCategories(prev => prev.map(c => {
      if (c.id === adminSelectedCatAttr) {
        return {
          ...c,
          attributes: [...(c.attributes || []), newAttr]
        };
      }
      return c;
    }));

    setAdminAttrKey("");
    setAdminAttrLabelTr("");
    setAdminAttrLabelEn("");
    setAdminAttrType("text");
    setAdminAttrRequired(false);
    setAdminAttrOptionsString("");

    setToastNotification({
      title: lang === "tr" ? "Dinamik Özellik Eklendi" : "Attribute Added",
      message: lang === "tr" ? "Seçilen kategori için form alanı güncellendi." : "New form field appended to target taxonomy.",
      type: "success"
    });
  };

  const handleDeleteCategoryAdmin = (catId: string) => {
    // Sync with backend
    fetch(`/api/categories/${catId}`, {
      method: "DELETE"
    }).catch(err => console.error("Error deleting category:", err));

    setCategories(prev => prev.filter(c => c.id !== catId));
    setToastNotification({
      title: lang === "tr" ? "Kategori Silindi" : "Category Terminated",
      message: lang === "tr" ? "Kategori ve bağlı referansları silindi." : "Category taxonomy node pruned.",
      type: "error"
    });
  };

  // Advert management actions
  const handleToggleFeaturedAdmin = (listingId: string) => {
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const nextFeatured = !l.featured;
        const updated = { ...l, featured: nextFeatured };
        
        // Sync with backend
        fetch(`/api/listings/${listingId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "X-User-Role": user.role || "",
            "X-User-Id": user.id || ""
          },
          body: JSON.stringify({ listing: updated })
        }).catch(err => console.error("Error toggling listing featured:", err));

        setToastNotification({
          title: lang === "tr" ? "Yıldızlı Durumu Güncellendi" : "Featured Toggled",
          message: nextFeatured 
            ? (lang === "tr" ? "İlan yıldızlı (öne çıkarılmış) olarak güncellendi!" : "Listing promoted successfully!")
            : (lang === "tr" ? "İlan yıldızlı durumu iptal edildi." : "Listing promotion disabled."),
          type: "success"
        });
        return updated;
      }
      return l;
    }));
  };

  const handleDeleteListingAdmin = (listingId: string) => {
    // Sync with backend
    fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
      headers: {
        "X-User-Role": user.role || "",
        "X-User-Id": user.id || ""
      }
    }).catch(err => console.error("Error deleting listing:", err));

    setListings(prev => prev.filter(l => l.id !== listingId));
    setToastNotification({
      title: lang === "tr" ? "İlan Silindi" : "Listing Terminated",
      message: lang === "tr" ? "İlan veri tabanından kalıcı olarak silindi." : "Advert pruned from general database index.",
      type: "error"
    });
  };

  const handleUpdateListingAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEditingListing) return;

    // Price numeric validation
    const priceNum = Number(adminEditingListing.price);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 1000000000) {
      setToastNotification({
        title: lang === "tr" ? "Geçersiz Fiyat" : "Invalid Price",
        message: lang === "tr" ? "Fiyat en az 1 TL ve en fazla 1.000.000.000 TL olmalıdır!" : "Price must be between 1 and 1,000,000,000 TRY!",
        type: "error"
      });
      return;
    }

    fetch(`/api/listings/${adminEditingListing.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": user.role || "",
        "X-User-Id": user.id || ""
      },
      body: JSON.stringify({ listing: adminEditingListing })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setListings(prev => prev.map(l => l.id === adminEditingListing.id ? data.listing || adminEditingListing : l));
        if (data.firebaseSynced === false) {
          setToastNotification({
            title: lang === "tr" ? "⚠️ Firebase Senkronizasyon Sorunu" : "⚠️ Firebase Sync Warning",
            message: lang === "tr" 
              ? "İlan detayları yerel belleğe kaydedildi, fakat uzak Firebase veritabanına senkronize edilemedi. Lütfen internet bağlantısını kontrol edin veya resimleri küçültün." 
              : "Ad details are updated locally, but failed to sync to Firebase. Please check your connection or optimize your images.",
            type: "warning"
          });
        } else {
          setToastNotification({
            title: lang === "tr" ? "İlan Güncellendi" : "Listing Updated",
            message: lang === "tr" ? "İlan detayları başarıyla kaydedildi." : "Ad details persisted into database successfully.",
            type: "success"
          });
        }
        setAdminEditingListing(null);
      } else {
        setToastNotification({
          title: lang === "tr" ? "Güncelleme Başarısız" : "Update Failed",
          message: data.error || (lang === "tr" ? "İlan güncellenemedi." : "Could not update listing."),
          type: "error"
        });
      }
    })
    .catch(err => {
      console.error("Error updating listing:", err);
      setToastNotification({
        title: lang === "tr" ? "Bağlantı Hatası" : "Connection Error",
        message: lang === "tr" ? "Sunucuyla bağlantı kurulamadı." : "Could not connect to server.",
        type: "error"
      });
    });
  };

  const handleApproveListing = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": user.role || "",
          "X-User-Id": user.id || ""
        },
        body: JSON.stringify({ status: "approved" })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "approved" } : l));
        
        // Reload simulated emails
        const emailRes = await fetch("/api/simulated-emails");
        const emailData = await emailRes.json();
        if (emailData && emailData.data) setSimulatedEmails(emailData.data);

        if (data.firebaseSynced === false) {
          setToastNotification({
            title: lang === "tr" ? "⚠️ Firebase Senkronizasyon Sorunu" : "⚠️ Firebase Sync Warning",
            message: lang === "tr" 
              ? "İlan yerel olarak onaylandı fakat bu değişiklik Firebase veritabanına senkronize edilemedi. Lütfen bağlantıyı ve kotayı kontrol edin." 
              : "Listing approved locally, but the change failed to sync to Firebase. Please check connection and quota.",
            type: "warning"
          });
        } else {
          setToastNotification({
            title: lang === "tr" ? "İlan Onaylandı" : "Advert Approved",
            message: lang === "tr" 
              ? "İlan başarıyla onaylandı ve yayına alındı. İlan sahibine e-posta bildirimi gönderildi." 
              : "Listing approved and published. E-mail notification dispatched to advertiser.",
            type: "success"
          });
        }
      } else {
        setToastNotification({
          title: lang === "tr" ? "Hata" : "Error",
          message: data.error || (lang === "tr" ? "Onaylama başarısız oldu." : "Approval failed."),
          type: "error"
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback for offline simulation
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "approved" } : l));
    }
  };

  const handleRejectListing = async (listingId: string) => {
    const feedback = prompt(
      lang === "tr" 
        ? "Lütfen ilan sahibine gönderilecek ret gerekçesini yazın (İsteğe bağlı):" 
        : "Please enter the rejection reason for the advertiser (Optional):"
    ) || "";

    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": user.role || "",
          "X-User-Id": user.id || ""
        },
        body: JSON.stringify({ status: "rejected", feedback })
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "rejected" } : l));

        // Reload simulated emails
        const emailRes = await fetch("/api/simulated-emails");
        const emailData = await emailRes.json();
        if (emailData && emailData.data) setSimulatedEmails(emailData.data);

        if (data.firebaseSynced === false) {
          setToastNotification({
            title: lang === "tr" ? "⚠️ Firebase Senkronizasyon Sorunu" : "⚠️ Firebase Sync Warning",
            message: lang === "tr" 
              ? "İlan yerel olarak reddedildi fakat bu değişiklik Firebase veritabanına senkronize edilemedi. Lütfen bağlantıyı ve kotayı kontrol edin." 
              : "Listing rejected locally, but the change failed to sync to Firebase. Please check connection and quota.",
            type: "warning"
          });
        } else {
          setToastNotification({
            title: lang === "tr" ? "İlan Reddedildi" : "Advert Rejected",
            message: lang === "tr" 
              ? "İlan reddedildi ve yayından kaldırıldı. İlan sahibine gerekçesiyle birlikte e-posta gönderildi." 
              : "Listing rejected and removed. E-mail notification dispatched to advertiser.",
            type: "success"
          });
        }
      } else {
        setToastNotification({
          title: lang === "tr" ? "Hata" : "Error",
          message: data.error || (lang === "tr" ? "Reddetme başarısız oldu." : "Rejection failed."),
          type: "error"
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback for offline simulation
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "rejected" } : l));
    }
  };

  const resetNewListingForm = () => {
    setNewListingTitle("");
    setNewListingDesc("");
    setNewListingPrice("");
    setNewListingLocAddress("Kadıköy, İstanbul");
    setNewListingLat(40.9818);
    setNewListingLng(29.0576);
    setNewListingFeatured(false);
    setNewListingImages([]);
    setNewListingAttrValues({});
    setListingError(null);
  };

  // Add Listing form logic (Includes check on Image Limits per category!)
  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    setListingError(null);

    const cat = categories.find(c => c.id === selectedCategoryId);
    if (!cat) return;

    // Check Max Images Limit per Category
    if (newListingImages.length > cat.maxImages) {
      setListingError(
        lang === "tr" 
          ? `Hata! '${cat.nameTr}' kategorisi için izin verilen maksimum fotoğraf adedi ${cat.maxImages} adettir. Sizin yüklediğiniz: ${newListingImages.length}`
          : `Validation Error! Maximum image quota for '${cat.nameEn}' is ${cat.maxImages}. You uploaded: ${newListingImages.length}`
      );
      return;
    }

    if (!newListingTitle || !newListingPrice) {
      setListingError(lang === "tr" ? "Başlık ve fiyat alanları zorunludur!" : "Title and Price fields are required!");
      return;
    }

    if (newListingImages.length === 0) {
      setListingError(lang === "tr" ? "En az bir adet resim eklenmesi zorunludur!" : "At least one image is required!");
      return;
    }

    const priceNum = Number(newListingPrice);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 1000000000) {
      setListingError(lang === "tr" ? "Fiyat en az 1 TL ve en fazla 1.000.000.000 TL olmalıdır!" : "Price must be between 1 and 1,000,000,000 TRY!");
      return;
    }

    // Validate dynamic attributes
    for (const attr of cat.attributes || []) {
      const val = newListingAttrValues[attr.key];
      if (attr.required && (val === undefined || val === "")) {
        setListingError(lang === "tr" ? `'${attr.label_tr}' alanı zorunludur!` : `'${attr.label_en}' field is required!`);
        return;
      }
      if (attr.type === "number" && val !== undefined && val !== "") {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          setListingError(lang === "tr" ? `'${attr.label_tr}' geçerli bir sayı olmalıdır!` : `'${attr.label_en}' must be a valid number!`);
          return;
        }
        if (numVal < 0 || numVal > 100000000) {
          setListingError(lang === "tr" ? `'${attr.label_tr}' değeri 0 ile 100.000.000 arasında olmalıdır!` : `'${attr.label_en}' value must be between 0 and 100,000,000!`);
          return;
        }
      }
    }

    const newAd: Listing = {
      id: "ad_" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      title: newListingTitle,
      description: newListingDesc,
      categoryId: selectedCategoryId,
      price: priceNum,
      currency: newListingCurrency,
      location: {
        lat: newListingLat,
        lng: newListingLng,
        address: newListingLocAddress,
        country: newListingCountry,
        city: newListingCity,
        district: newListingDistrict
      },
      images: newListingImages,
      featured: newListingFeatured,
      createdAt: new Date().toISOString(),
      tags: ["yeni_ilan", cat.slug],
      attributes: newListingAttrValues,
      status: "pending" // default status is pending review
    };

    setIsListingSaving(true);
    // Post to backend database & trigger admin notification
    fetch("/api/listings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": user.role || "",
        "X-User-Id": user.id || ""
      },
      body: JSON.stringify({ listing: newAd })
    })
    .then(res => res.json())
    .then(data => {
      setIsListingSaving(false);
      if (data.success) {
        // Refresh emails list to pull simulated notifications
        fetch("/api/simulated-emails")
          .then(res => res.json())
          .then(mailData => {
            if (mailData && mailData.data) setSimulatedEmails(mailData.data);
          });

        // Upgrade frontend user role to adv owner if they were user
        if (user.role === "user" || !user.role) {
          const updatedUser = { ...user, role: "adv owner" as const };
          setUser(updatedUser);
          setAdminUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        }

        // Add listing to state only on successful backend save
        setListings([data.listing || newAd, ...listings]);
        resetNewListingForm();
        setShowAddListingModal(false);
        
        if (data.firebaseSynced === false) {
          setToastNotification({
            title: lang === "tr" ? "⚠️ Firebase Senkronizasyon Sorunu" : "⚠️ Firebase Sync Warning",
            message: lang === "tr" 
              ? "İlanınız yerel olarak kaydedildi, ancak uzak Firebase Firestore veritabanına ulaştırılamadı. Resimleriniz çok büyük olabilir (1MB sınırı) veya Firebase kotası dolmuş olabilir." 
              : "Your ad has been saved locally, but failed to reach the remote Firebase Firestore database. The images may be too large (1MB limit) or the Firebase quota might be exhausted.",
            type: "warning"
          });
        } else {
          setToastNotification({
            title: lang === "tr" ? "İlanınız Yayında!" : "Ad is Live!",
            message: lang === "tr" 
              ? `İlanınız başarıyla oluşturuldu ve canlıya alındı.` 
              : `Your listing has been successfully created and taken live.`,
            type: "success"
          });
        }
      } else {
        setToastNotification({
          title: lang === "tr" ? "Hata" : "Error",
          message: data.error || (lang === "tr" ? "İlan eklenemedi." : "Failed to add listing."),
          type: "error"
        });
      }
    })
    .catch(err => {
      setIsListingSaving(false);
      console.error("Error creating listing in backend:", err);
      setToastNotification({
        title: lang === "tr" ? "Bağlantı Hatası" : "Connection Error",
        message: lang === "tr" ? "İlan eklenirken bir ağ veya sunucu hatası oluştu." : "A network or server error occurred while creating listing.",
        type: "error"
      });
    });
  };

  const handleUpdateUserListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEditingListing) return;

    if (!userEditingListing.title || !userEditingListing.price) {
      setToastNotification({
        title: lang === "tr" ? "Hata" : "Error",
        message: lang === "tr" ? "Başlık ve fiyat alanları zorunludur!" : "Title and Price fields are required!",
        type: "error"
      });
      return;
    }

    setIsListingSaving(true);
    // Sync with backend
    fetch(`/api/listings/${userEditingListing.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": user.role || "",
        "X-User-Id": user.id || ""
      },
      body: JSON.stringify({ listing: userEditingListing })
    })
    .then(res => res.json())
    .then(data => {
      setIsListingSaving(false);
      if (data.success) {
        setListings(prev => prev.map(l => l.id === userEditingListing.id ? userEditingListing : l));
        if (data.firebaseSynced === false) {
          setToastNotification({
            title: lang === "tr" ? "⚠️ Firebase Senkronizasyon Sorunu" : "⚠️ Firebase Sync Warning",
            message: lang === "tr" 
              ? "İlan detaylarınız yerel belleğe kaydedildi, fakat uzak Firebase veritabanına senkronize edilemedi. Lütfen internet bağlantınızı kontrol edin veya resimleri küçültün." 
              : "Your ad details are updated locally, but failed to sync to Firebase. Please check your connection or optimize your images.",
            type: "warning"
          });
        } else {
          setToastNotification({
            title: lang === "tr" ? "İlan Güncellendi" : "Listing Updated",
            message: lang === "tr" ? "İlan detaylarınız başarıyla kaydedildi." : "Your ad details were successfully updated.",
            type: "success"
          });
        }
        setUserEditingListing(null);
      } else {
        setToastNotification({
          title: lang === "tr" ? "Hata" : "Error",
          message: data.error || (lang === "tr" ? "Güncelleme başarısız." : "Update failed."),
          type: "error"
        });
      }
    })
    .catch(err => {
      setIsListingSaving(false);
      console.error(err);
      setListings(prev => prev.map(l => l.id === userEditingListing.id ? userEditingListing : l));
      setUserEditingListing(null);
    });
  };

  // Run Custom Live API Request Demo (Swagger style)
  const runApiTest = async () => {
    setApiLoading(true);
    setApiResponseMock(null);
    const endpoint = apiEndpointsList[selectedApiIndex];

    setTimeout(() => {
      setApiResponseMock(endpoint.response);
      setApiLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black pb-24">
      
      {/* OFFLINE SIMULATION TOP NOTIFICATION BAR */}
      {isOfflineMode && (
        <div className="bg-rose-500 text-black px-4 py-2 text-center text-xs font-bold font-mono tracking-wide shadow-lg flex items-center justify-center gap-2 relative z-50">
          <span className="w-2 h-2 rounded-full bg-black animate-ping" />
          <span>⚠️ {lang === "tr" ? "PWA ÇEVRİMDIŞI SİMÜLASYONU AKTİF!" : "PWA OFFLINE SIMULATION ACTIVE!"}</span>
          <span className="opacity-75 font-sans font-medium hidden md:inline">
            • {lang === "tr" ? "İnternet bağlantınız simüle olarak kesildi. Veriler yerel PWA Service Worker önbelleğinden gelmektedir." : "Internet connection simulated offline. Assets and layouts are served from local PWA Service Worker cache."}
          </span>
          <button 
            type="button"
            onClick={() => {
              setIsOfflineMode(false);
              setToastNotification({
                title: lang === "tr" ? "Çevrimiçi Mod" : "Online Mode",
                message: lang === "tr" ? "Bağlantı başarıyla sağlandı." : "Connected back to live servers.",
                type: "success"
              });
            }}
            className="ml-4 bg-black text-white hover:bg-neutral-800 text-[10px] px-2 py-0.5 rounded transition-all"
          >
            {lang === "tr" ? "Sıfırla" : "Restore"}
          </button>
        </div>
      )}

      {/* REAL-TIME NOTIFICATION POPUP BRIDGE */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl p-4 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="flex gap-3">
              <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 h-10 w-10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-zinc-100">{toastNotification.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{toastNotification.message}</p>
                <div className="mt-2 text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  OneSignal Live Event Bridge
                </div>
              </div>
              <button onClick={() => setToastNotification(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY CLASSY HEADER */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 h-18 flex items-center justify-between">
          
          {/* Logo, Brand & Navigation Links */}
          <div className="flex items-center gap-8">
            {/* Clickable Logo & Brand */}
            <button 
              id="header-logo-button"
              onClick={handleGoHome}
              className="flex items-center focus:outline-none cursor-pointer bg-transparent transition-transform duration-300 hover:scale-105 active:scale-95 p-0"
            >
              <Logo className="h-[72px] md:h-[82px] w-auto" />
            </button>
          </div>

          {/* Right Header Navigation & Stats */}
          <div className="flex items-center gap-4">
            
            {/* Offline Simulation Control */}
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
              <span className={`w-2 h-2 rounded-full ${isOfflineMode ? "bg-red-500" : "bg-green-500 animate-pulse"}`}></span>
              <span className="text-[10px] font-mono text-zinc-400 hidden lg:inline">PWA: {isOfflineMode ? "Offline" : "Online"}</span>
              <button 
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-mono"
              >
                {isOfflineMode ? "Bağlan" : "Kes"}
              </button>
            </div>

            {/* Language Switch */}
            <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button 
                onClick={() => setLang("tr")} 
                className={`px-2 py-1 text-[10px] rounded font-bold ${lang === "tr" ? "bg-amber-500 text-black" : "text-zinc-400"}`}
              >
                TR
              </button>
              <button 
                onClick={() => setLang("en")} 
                className={`px-2 py-1 text-[10px] rounded font-bold ${lang === "en" ? "bg-amber-500 text-black" : "text-zinc-400"}`}
              >
                EN
              </button>
            </div>

            {/* Admin Panel Toggle */}
            {user.role === "admin" && (
              <button
                id="admin-nav-toggle"
                onClick={() => {
                  window.history.pushState(null, "", currentPage === "admin" ? "/" : "/admin");
                  setCurrentPage(currentPage === "admin" ? "main" : "admin");
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-mono transition-all border ${
                  currentPage === "admin"
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-neutral-900 text-zinc-300 border-neutral-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <Settings className={`w-3.5 h-3.5 ${currentPage === "admin" ? "rotate-45" : "animate-spin-slow"}`} />
                <span>{lang === "tr" ? "Yönetim" : "Admin"}</span>
              </button>
            )}

            {/* Login / Logout Button */}
            {user.id === "guest" ? (
              <button
                onClick={() => {
                  window.history.pushState(null, "", "/login");
                  setCurrentPage("login");
                }}
                className="bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === "tr" ? "Giriş Yap" : "Sign In"}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setUser({
                    id: "guest",
                    email: "",
                    phone: "",
                    name: "Misafir Kullanıcı",
                    status: UserStatus.Unverified,
                    emailVerifiedAt: null,
                    phoneVerifiedAt: null,
                    oneSignalPlayerId: null,
                    oneSignalExternalId: null
                  });
                  window.history.pushState(null, "", "/");
                  setCurrentPage("main");
                  setToastNotification({
                    title: lang === "tr" ? "Çıkış Yapıldı" : "Logged Out",
                    message: lang === "tr" ? "Hesabınızdan güvenli bir şekilde çıkış yapıldı." : "You have been logged out securely.",
                    type: "success"
                  });
                }}
                className="bg-neutral-900 border border-neutral-800 text-red-500 hover:bg-red-500/5 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                title={lang === "tr" ? "Çıkış Yap" : "Log Out"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{lang === "tr" ? "Çıkış" : "Logout"}</span>
              </button>
            )}

            {/* User Component (At the absolute right) */}
            {user.id === "guest" ? (
              <span className="text-xs font-semibold text-zinc-200 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl whitespace-nowrap">
                👤 {lang === "tr" ? "Misafir" : "Guest"}
              </span>
            ) : (
              <button
                onClick={() => {
                  setProfileAddress(user.address || "");
                  setProfileCountry(user.country || "");
                  setProfileCity(user.city || "");
                  setProfileDistrict(user.district || "");
                  setProfileError(null);
                  setProfileSuccess(null);
                  setProfileEmailVerificationSent(false);
                  setProfileEmailVerificationCode("");
                  setShowProfileModal(true);
                }}
                className="text-xs font-semibold text-zinc-200 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer hover:bg-neutral-850 hover:border-neutral-700 hover:text-white transition-all flex items-center gap-1"
                title={lang === "tr" ? "Profilimi Düzenle" : "Edit My Profile"}
              >
                <span>👤 {user.name}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* OFFLINE SHIELD BAR */}
      {isOfflineMode && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
          <span>{lang === "tr" ? "Simüle Edilen Çevrimdışı Mod Aktif. API'ler yerel bellek yedeğiyle çalışır." : "Simulated Offline Mode Engaged. Fallbacks are powered by local in-memory caches."}</span>
        </div>
      )}

      {currentPage === "admin" && user.role === "admin" ? (
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-8 space-y-8 animate-fade-in">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {lang === "tr" ? "Yönetim Kontrol Paneli" : "Admin Management Control Center"}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === "tr" 
                  ? "Kullanıcı simülasyon veri tabanı, hiyerarşik kategori ağaçları ve ilan yıldızlı durumlarını gerçek zamanlı yönetin."
                  : "Perform real-time actions on the simulation CRM, dynamic catalog metadata, and global advert index."}
              </p>
            </div>

            {/* Admin Tabs */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-stretch md:self-auto overflow-x-auto">
              {[
                { id: "users", label: lang === "tr" ? "Kullanıcılar" : "Users", icon: Users },
                { id: "categories", label: lang === "tr" ? "Kategoriler" : "Categories", icon: Tag },
                { id: "adverts", label: lang === "tr" ? "İlan Yönetimi" : "Adverts", icon: FileText },
                { id: "banners", label: lang === "tr" ? "Reklam Yönetimi" : "Banner Ads", icon: Megaphone },
                { id: "exchange_rates", label: lang === "tr" ? "Döviz Kurları" : "Exchange Rates", icon: Coins },
                { id: "locations", label: lang === "tr" ? "Konum Yönetimi" : "Locations", icon: MapPin },
                { id: "settings", label: lang === "tr" ? "Ayarlar" : "Settings", icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    adminTab === tab.id 
                      ? "bg-amber-500 text-black shadow-md" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Relocated Premium Market Analytics Section */}
          <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.02),transparent_40%)]" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1 max-w-sm">
                <h3 className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {lang === "tr" ? "PRESTİJ VE ANALİTİK" : "METRICS & PRESTIGE"}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {lang === "tr" ? "Canlı ilan portföy analizleri, doğrulanmış üye yoğunluğu ve sistem metrikleri." : "Real-time listings analysis, secure user verification telemetry, and system indicators."}
                </p>
              </div>

              {/* Analytical Specs inside Admin panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[8.5px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "AKTİF PORTFÖY" : "ACTIVE PORTFOLIO"}</span>
                    <span className="text-xl font-serif font-semibold text-white mt-1 block">
                      {listings.length} <span className="text-xs text-zinc-500 font-sans font-medium">{lang === "tr" ? "İlan" : "Ads"}</span>
                    </span>
                  </div>
                  <FileText className="w-8 h-8 text-neutral-800" />
                </div>
                
                <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[8.5px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "GÜVENLİ SATICI" : "VERIFIED USERS"}</span>
                    <span className="text-xl font-serif font-semibold text-white mt-1 block">
                      {adminUsers.filter(u => u.status === "fully_verified" || u.status === UserStatus.Fully_Verified).length} <span className="text-xs text-zinc-500 font-sans font-medium">{lang === "tr" ? "Üye" : "Profiles"}</span>
                    </span>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-neutral-800" />
                </div>

                <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800/60 flex items-center justify-between col-span-1">
                  <div>
                    <span className="text-[8.5px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "ORTALAMA BEDEL" : "AVERAGE VALUE"}</span>
                    <span className="text-sm font-mono font-bold text-amber-500 mt-1 block">
                      {(() => {
                        const totalTl = listings.reduce((sum, l) => sum + convertPrice(Number(l.price), l.currency || "TL", "TL"), 0);
                        const avgTl = listings.length > 0 ? Math.round(totalTl / listings.length) : 0;
                        return formatPrice(avgTl, "TL");
                      })()}
                    </span>
                  </div>
                  <div className="text-right flex flex-col justify-between h-full py-0.5">
                    <span className="text-[8.5px] font-mono text-zinc-500 block uppercase">PWA STATUS</span>
                    <span className="inline-flex items-center gap-1 text-[9.5px] text-green-400 font-mono mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                      ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Protocol Block */}
              <div className="flex items-center justify-between lg:flex-col lg:justify-center lg:items-end text-[10px] text-zinc-500 border-t lg:border-t-0 lg:border-l border-neutral-800/50 pt-4 lg:pt-0 lg:pl-6 shrink-0 font-mono">
                <span className="text-[9px] uppercase tracking-wider block text-zinc-600">{lang === "tr" ? "ŞİFRELEME PROTOKOLÜ" : "SECURITY CLEARANCE"}</span>
                <span className="text-amber-500 font-bold mt-1 text-right block uppercase">AES-256 SSL</span>
              </div>
            </div>
          </div>

          {/* Sub Pages */}
          {adminTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add User Form / Edit User Form */}
              <div id="user-form-container" className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-6">
                {adminEditingUser ? (
                  <form onSubmit={handleUpdateSimulatedUser} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-500" />
                        <span>{lang === "tr" ? "Kullanıcıyı Düzenle" : "Edit Simulated User"}</span>
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setAdminEditingUser(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        {lang === "tr" ? "İptal" : "Cancel"}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "TAM AD" : "FULL NAME"}</label>
                        <input 
                          type="text" 
                          value={adminEditingUser.name}
                          onChange={e => setAdminEditingUser({ ...adminEditingUser, name: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "E-POSTA" : "EMAIL ADDRESS"}</label>
                        <input 
                          type="email" 
                          value={adminEditingUser.email}
                          onChange={e => setAdminEditingUser({ ...adminEditingUser, email: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "TELEFON" : "PHONE NUMBER"}</label>
                        <input 
                          type="text" 
                          value={adminEditingUser.phone}
                          onChange={e => setAdminEditingUser({ ...adminEditingUser, phone: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "ŞİFRE" : "PASSWORD"}</label>
                        <input 
                          type="text" 
                          value={adminEditingUser.password || "123456"}
                          onChange={e => setAdminEditingUser({ ...adminEditingUser, password: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "DOĞRULAMA DURUMU" : "VERIFICATION STATUS"}</label>
                        <select 
                          value={adminEditingUser.status}
                          onChange={e => {
                            const val = e.target.value as UserStatus;
                            setAdminEditingUser({ 
                              ...adminEditingUser, 
                              status: val,
                              emailVerifiedAt: val !== UserStatus.Unverified ? new Date().toISOString() : null,
                              phoneVerifiedAt: val === UserStatus.Fully_Verified ? new Date().toISOString() : null
                            });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value={UserStatus.Unverified}>{lang === "tr" ? "Onaylanmamış" : "Unverified"}</option>
                          <option value={UserStatus.Email_Verified}>{lang === "tr" ? "Sadece E-posta Onaylı" : "Email Verified"}</option>
                          <option value={UserStatus.Fully_Verified}>{lang === "tr" ? "Tam Onaylı (E-posta + SMS)" : "Fully Verified (Email + SMS)"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "KULLANICI TİPİ (ROL)" : "USER TYPE / ROLE"}</label>
                        <select 
                          value={adminEditingUser.role || "user"}
                          onChange={e => {
                            const val = e.target.value as "user" | "adv owner" | "admin";
                            setAdminEditingUser({ 
                              ...adminEditingUser, 
                              role: val
                            });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                        >
                          <option value="user">{lang === "tr" ? "Standart Üye (user)" : "Regular User (user)"}</option>
                          <option value="adv owner">{lang === "tr" ? "İlan Sahibi (adv owner)" : "Advertiser Owner (adv owner)"}</option>
                          <option value="admin">{lang === "tr" ? "Yönetici (admin)" : "Administrator (admin)"}</option>
                        </select>
                      </div>

                      {/* Structured address fields for Admin Edit */}
                      <div className="border-t border-neutral-800 pt-3 space-y-3">
                        <h4 className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
                          {lang === "tr" ? "ADRES VE LOKASYON BİLGİLERİ" : "ADDRESS & LOCATION DETAILS"}
                        </h4>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono block mb-1">{lang === "tr" ? "ÜLKE" : "COUNTRY"}</label>
                          <select
                            value={adminEditingUser.country || ""}
                            onChange={e => setAdminEditingUser({
                              ...adminEditingUser,
                              country: e.target.value,
                              city: "",
                              district: ""
                            })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">{lang === "tr" ? "Ülke Seçin" : "Select Country"}</option>
                            {locations.map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono block mb-1">{lang === "tr" ? "ŞEHİR" : "CITY"}</label>
                          <select
                            value={adminEditingUser.city || ""}
                            disabled={!adminEditingUser.country}
                            onChange={e => setAdminEditingUser({
                              ...adminEditingUser,
                              city: e.target.value,
                              district: ""
                            })}
                            className="w-full bg-neutral-950 border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">{lang === "tr" ? "Şehir Seçin" : "Select City"}</option>
                            {adminEditingUser.country && (locations.find(c => c.name === adminEditingUser.country)?.cities || []).map(city => (
                              <option key={city.name} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono block mb-1">{lang === "tr" ? "SEMT" : "DISTRICT"}</label>
                          <select
                            value={adminEditingUser.district || ""}
                            disabled={!adminEditingUser.city}
                            onChange={e => setAdminEditingUser({
                              ...adminEditingUser,
                              district: e.target.value
                            })}
                            className="w-full bg-neutral-950 border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                          >
                            <option value="">{lang === "tr" ? "Semt Seçin" : "Select District"}</option>
                            {adminEditingUser.city && ((locations.find(c => c.name === adminEditingUser.country)?.cities || []).find(ct => ct.name === adminEditingUser.city)?.districts || []).map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono block mb-1">{lang === "tr" ? "DETAYLI AÇIK ADRES" : "DETAILED STREET ADDRESS"}</label>
                          <textarea
                            value={adminEditingUser.address || ""}
                            onChange={e => setAdminEditingUser({
                              ...adminEditingUser,
                              address: e.target.value
                            })}
                            rows={2}
                            placeholder={lang === "tr" ? "Sokak, bina no, daire no..." : "Street name, building info, apt..."}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      {lang === "tr" ? "Değişiklikleri Kaydet" : "Save User Changes"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAddSimulatedUser} className="space-y-4">
                    <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-500" />
                      <span>{lang === "tr" ? "Yeni Simüle Kullanıcı Ekle" : "Create Simulated User"}</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "TAM AD" : "FULL NAME"}</label>
                        <input 
                          type="text" 
                          placeholder="Örn: Mehmet Öz"
                          value={adminNewName}
                          onChange={e => setAdminNewName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "E-POSTA ADRESİ" : "EMAIL ADDRESS"}</label>
                        <input 
                          type="email" 
                          placeholder="mehmet@example.com"
                          value={adminNewEmail}
                          onChange={e => setAdminNewEmail(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "TELEFON NUMARASI" : "PHONE CONTACT"}</label>
                        <input 
                          type="text" 
                          placeholder="+905558887766"
                          value={adminNewPhone}
                          onChange={e => setAdminNewPhone(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "BAŞLANGIÇ YETKİ SEVİYESİ" : "VERIFICATION LEVEL"}</label>
                        <select 
                          value={adminNewStatus}
                          onChange={e => setAdminNewStatus(e.target.value as UserStatus)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value={UserStatus.Unverified}>{lang === "tr" ? "Onaylanmamış" : "Unverified"}</option>
                          <option value={UserStatus.Email_Verified}>{lang === "tr" ? "E-posta Doğrulanmış" : "Email Verified Only"}</option>
                          <option value={UserStatus.Fully_Verified}>{lang === "tr" ? "Tam Doğrulanmış (E-posta + SMS)" : "Fully Verified"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "KULLANICI TİPİ (ROL)" : "USER TYPE / ROLE"}</label>
                        <select 
                          value={adminNewRole}
                          onChange={e => setAdminNewRole(e.target.value as "user" | "adv owner" | "admin")}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                        >
                          <option value="user">{lang === "tr" ? "Standart Üye (user)" : "Regular User (user)"}</option>
                          <option value="adv owner">{lang === "tr" ? "İlan Sahibi (adv owner)" : "Advertiser Owner (adv owner)"}</option>
                          <option value="admin">{lang === "tr" ? "Yönetici (admin)" : "Administrator (admin)"}</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      {lang === "tr" ? "Kullanıcı Kaydet" : "Register User"}
                    </button>
                  </form>
                )}
              </div>

              {/* Active CRM Table list */}
              <div className="lg:col-span-8 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{lang === "tr" ? "KULLANICI VERİ TABANI DİZİNİ" : "SIMULATED CRM INDEX"}</span>
                  <span className="text-[10px] bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded font-mono text-amber-500">
                    {adminUsers.length} {lang === "tr" ? "Hesap" : "Profiles"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-2">{lang === "tr" ? "Kullanıcı Bilgisi" : "User Info"}</th>
                        <th className="py-3 px-2">{lang === "tr" ? "Durum" : "Status"}</th>
                        <th className="py-3 px-2 font-mono">OneSignal ID</th>
                        <th className="py-3 px-2 text-right">{lang === "tr" ? "İşlemler" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {adminUsers.map(u => (
                        <tr key={u.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.id === user.id && (
                                <span className="bg-amber-500/10 text-amber-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                                  {lang === "tr" ? "Siz" : "You"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{u.email} • {u.phone}</div>
                          </td>
                          <td className="py-3 px-2">
                            <button
                              type="button"
                              onClick={() => handleCycleUserStatus(u.id)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                                u.status === UserStatus.Fully_Verified
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                  : u.status === UserStatus.Email_Verified
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                              }`}
                              title={lang === "tr" ? "Durumu Değiştirmek İçin Tıklayın" : "Click to Cycle Verification Status"}
                            >
                              {u.status === UserStatus.Fully_Verified
                                ? (lang === "tr" ? "Tam Onaylı" : "Fully Verified")
                                : u.status === UserStatus.Email_Verified
                                ? (lang === "tr" ? "E-posta Onaylı" : "Email Verified")
                                : (lang === "tr" ? "Onaysız" : "Unverified")}
                            </button>
                          </td>
                          <td className="py-3 px-2 font-mono text-[10px] text-zinc-500">
                            {u.oneSignalPlayerId ? (
                              <span className="text-emerald-500 select-all" title={u.oneSignalPlayerId}>
                                {u.oneSignalPlayerId.slice(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-zinc-600">--</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right space-x-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setAdminEditingUser({ ...u });
                                setTimeout(() => {
                                  document.getElementById('user-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }}
                              className="text-amber-500 hover:text-amber-400 transition-colors p-1"
                              title={lang === "tr" ? "Düzenle" : "Edit"}
                            >
                              <Edit3 className="w-3.5 h-3.5 inline" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteSimulatedUser(u.id)}
                              className="text-rose-500 hover:text-rose-400 transition-colors p-1"
                              title={lang === "tr" ? "Sil" : "Delete"}
                              disabled={u.id === user.id}
                            >
                              <X className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Category creation form */}
              <div className="lg:col-span-4 space-y-6">
                <form onSubmit={handleCreateCategoryAdmin} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>{lang === "tr" ? "Yeni Kategori Tanımla" : "Define New Taxonomy Node"}</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "KATEGORİ ADI (TÜRKÇE)" : "CATEGORY TITLE (TURKISH)"}</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Ev / Konut"
                        value={adminNewCatNameTr}
                        onChange={e => setAdminNewCatNameTr(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "KATEGORİ ADI (İNGİLİZCE)" : "CATEGORY TITLE (ENGLISH)"}</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Residential Property"
                        value={adminNewCatNameEn}
                        onChange={e => setAdminNewCatNameEn(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "ÜST KATEGORİ REKURSİF" : "HIERARCHICAL PARENT NODE"}</label>
                      <select 
                        value={adminNewCatParentId}
                        onChange={e => setAdminNewCatParentId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">{lang === "tr" ? "Kök Kategori (Root)" : "None (Root Category)"}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{lang === "tr" ? c.nameTr : c.nameEn}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "MAKS FOTO" : "MAX IMAGES"}</label>
                        <input 
                          type="number" 
                          value={adminNewCatMaxImages}
                          onChange={e => setAdminNewCatMaxImages(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">ICON CLASS</label>
                        <select 
                          value={adminNewCatIcon}
                          onChange={e => setAdminNewCatIcon(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                        >
                          <option value="Building2">Building</option>
                          <option value="Car">Car</option>
                          <option value="Smartphone">Smartphone</option>
                          <option value="Tag">Tag/Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    {lang === "tr" ? "Kategori Ekle" : "Append Category"}
                  </button>
                </form>

                {/* Attribute builder form */}
                <form onSubmit={handleAddAttributeAdmin} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>{lang === "tr" ? "Özellik Şeması Ekle" : "Add Dynamic Attribute Schema"}</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "HEDEF KATEGORİ" : "TARGET CATEGORY"}</label>
                      <select 
                        value={adminSelectedCatAttr}
                        onChange={e => setAdminSelectedCatAttr(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{lang === "tr" ? c.nameTr : c.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "ANAHTAR SÖZCÜK ID (KEY)" : "IDENTIFIER KEY"}</label>
                      <input 
                        type="text" 
                        placeholder="Örn: m2, yakit, model_yili"
                        value={adminAttrKey}
                        onChange={e => setAdminAttrKey(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "ETİKET TR" : "LABEL TR"}</label>
                        <input 
                          type="text" 
                          placeholder="Örn: Metrekare"
                          value={adminAttrLabelTr}
                          onChange={e => setAdminAttrLabelTr(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "ETİKET EN" : "LABEL EN"}</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Area Size"
                          value={adminAttrLabelEn}
                          onChange={e => setAdminAttrLabelEn(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "VERİ TİPİ" : "INPUT TYPE"}</label>
                        <select 
                          value={adminAttrType}
                          onChange={e => setAdminAttrType(e.target.value as any)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                        >
                          <option value="text">Text (Yazı)</option>
                          <option value="number">Number (Sayı)</option>
                          <option value="select">Dropdown Selection</option>
                          <option value="boolean">Boolean Switch</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-5 pl-2">
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={adminAttrRequired} 
                            onChange={e => setAdminAttrRequired(e.target.checked)} 
                            className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
                          />
                          <span>{lang === "tr" ? "Zorunlu Alan" : "Required"}</span>
                        </label>
                      </div>
                    </div>

                    {adminAttrType === "select" && (
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "SEÇENEKLER (VİRGÜLLE AYIRIN)" : "SELECTIONS (COMMA SEPARATED)"}</label>
                        <input 
                          type="text" 
                          placeholder="Örn: Benzin, Dizel, Hibrit"
                          value={adminAttrOptionsString}
                          onChange={e => setAdminAttrOptionsString(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    {lang === "tr" ? "Özelliği Tanımla" : "Define Attribute"}
                  </button>
                </form>
              </div>

              {/* Taxonomy visual list */}
              <div className="lg:col-span-8 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">{lang === "tr" ? "HİYERARŞİK KATEGORİ SİSTEM ŞEMASI" : "HIERARCHICAL SCHEMA SCHEMA"}</span>
                
                <div className="space-y-3">
                  {categories.map(c => (
                    <div key={c.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500">
                            {getCategoryIcon(c.icon, "w-3.5 h-3.5")}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs">{lang === "tr" ? c.nameTr : c.nameEn}</span>
                            <span className="text-[10px] font-mono text-zinc-500 ml-2">ID: {c.id}</span>
                          </div>
                        </div>
                        {c.parentId && (
                          <div className="text-[10px] text-zinc-500 font-mono mt-1.5 pl-8">
                            ↳ {lang === "tr" ? "Bağlı Olduğu Kategori" : "Hierarchical Parent"}: <span className="text-amber-500">{categories.find(p => p.id === c.parentId)?.nameTr || c.parentId}</span>
                          </div>
                        )}

                        {/* Dynamic attributes schema badges display */}
                        {c.attributes && c.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pl-8">
                            {c.attributes.map(attr => (
                              <span key={attr.key} className="bg-neutral-900 border border-neutral-800 text-[9px] text-zinc-400 font-mono px-2 py-0.5 rounded-md" title={`Type: ${attr.type}, Required: ${attr.required ? "Yes" : "No"}`}>
                                ⚡ {attr.key} ({lang === "tr" ? attr.label_tr : attr.label_en})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500">{lang === "tr" ? "Maks Foto" : "Max Pics"}: {c.maxImages}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setAdminEditingCategory(JSON.parse(JSON.stringify(c))); // deep clone to prevent accidental direct state mutation
                            setSelectedAttrIndexToEdit(null);
                            setEditingAttrKey("");
                            setEditingAttrLabelTr("");
                            setEditingAttrLabelEn("");
                            setEditingAttrType("text");
                            setEditingAttrRequired(false);
                            setEditingAttrOptionsString("");
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 p-1.5 rounded-lg border border-amber-500/10 transition-colors"
                          title={lang === "tr" ? "Düzenle" : "Edit Category & Attributes"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteCategoryAdmin(c.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-1.5 rounded-lg border border-rose-500/10 transition-colors"
                          title={lang === "tr" ? "Sil" : "Prune Node"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {adminTab === "adverts" && (
            <div className="space-y-6">
              {adminEditingListing && (
                <form onSubmit={handleUpdateListingAdmin} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-500" />
                      <span>{lang === "tr" ? "İlan Düzenle" : "Edit Advert parameters"}</span>
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => setAdminEditingListing(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      {lang === "tr" ? "İptal" : "Cancel"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "İLAN BAŞLIĞI" : "AD TITLE"}</label>
                      <input 
                        type="text" 
                        value={adminEditingListing.title}
                        onChange={e => setAdminEditingListing({ ...adminEditingListing, title: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "FİYAT (TL)" : "PRICE (TL)"}</label>
                      <input 
                        type="number" 
                        value={adminEditingListing.price}
                        onChange={e => setAdminEditingListing({ ...adminEditingListing, price: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1">{lang === "tr" ? "İLAN AÇIKLAMASI" : "DESCRIPTION"}</label>
                      <textarea 
                        rows={3}
                        value={adminEditingListing.description}
                        onChange={e => setAdminEditingListing({ ...adminEditingListing, description: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    {lang === "tr" ? "İlan Değişikliklerini Kaydet" : "Update Advert Details"}
                  </button>
                </form>
              )}

              <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">{lang === "tr" ? "TÜM İLAN ARŞİVİ ENDEKSİ" : "GLOBAL ADVERT INDEX DIRECTORY"}</span>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-2">{lang === "tr" ? "Resim & İlan" : "Thumbnail & Title"}</th>
                        <th className="py-3 px-2">{lang === "tr" ? "Kategori" : "Category"}</th>
                        <th className="py-3 px-2">{lang === "tr" ? "Fiyat" : "Price"}</th>
                        <th className="py-3 px-2">{lang === "tr" ? "Öne Çıkarılmış (Yıldızlı)" : "Featured"}</th>
                        <th className="py-3 px-2">{lang === "tr" ? "Durum / Onay" : "Status / Approval"}</th>
                        <th className="py-3 px-2 text-right">{lang === "tr" ? "İşlemler" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {listings.map(l => (
                        <tr key={l.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <img src={l.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} alt={l.title} className="w-10 h-10 object-cover rounded-lg border border-neutral-800" />
                              <div>
                                <span className="font-bold text-white text-xs block">{l.title}</span>
                                <span className="text-[9px] text-zinc-500 font-mono">ID: {l.id} • 📅 {(l.createdAt || "").slice(0, 10)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {(() => {
                                const cat = categories.find(c => c.id === l.categoryId);
                                return cat ? (lang === "tr" ? cat.nameTr : cat.nameEn) : l.categoryId;
                              })()}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-amber-400 font-bold">
                            {renderPriceElement(l, "text-amber-400 font-bold")}
                          </td>
                          <td className="py-3 px-2">
                            <button
                              type="button"
                              onClick={() => handleToggleFeaturedAdmin(l.id)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                                l.featured 
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30" 
                                  : "bg-neutral-950 text-zinc-600 border border-neutral-800 hover:text-zinc-400"
                              }`}
                            >
                              <Star className={`w-3 h-3 ${l.featured ? "fill-amber-400" : ""}`} />
                              <span>{l.featured ? (lang === "tr" ? "DOPİNG" : "FEATURED") : (lang === "tr" ? "YOK" : "NONE")}</span>
                            </button>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1.5">
                              {/* Status Badge */}
                              {l.status === "approved" || l.status === undefined ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full w-max font-bold">
                                  ● {lang === "tr" ? "ONAYLANDI" : "APPROVED"}
                                </span>
                              ) : l.status === "rejected" ? (
                                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full w-max font-bold">
                                  ● {lang === "tr" ? "REDDEDİLDİ" : "REJECTED"}
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full w-max font-bold animate-pulse">
                                  ● {lang === "tr" ? "ONAY BEKLİYOR" : "PENDING REVIEW"}
                                </span>
                              )}

                              {/* Approval Action Buttons */}
                              <div className="flex gap-1.5 mt-0.5">
                                {(l.status === "pending" || l.status === "rejected") && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveListing(l.id)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                                    title={lang === "tr" ? "Onayla" : "Approve"}
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>{lang === "tr" ? "Onayla" : "Approve"}</span>
                                  </button>
                                )}
                                {(l.status === "pending" || l.status === "approved" || l.status === undefined) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRejectListing(l.id)}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                                    title={lang === "tr" ? "Reddet" : "Reject"}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                    <span>{lang === "tr" ? "Reddet" : "Reject"}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right space-x-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setUserEditingListing({
                                  ...l,
                                  attributes: l.attributes || {}
                                });
                              }}
                              className="text-amber-500 hover:text-amber-400 transition-colors p-1"
                              title={lang === "tr" ? "Düzenle" : "Edit"}
                            >
                              <Edit3 className="w-3.5 h-3.5 inline" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteListingAdmin(l.id)}
                              className="text-rose-500 hover:text-rose-400 transition-colors p-1"
                              title={lang === "tr" ? "Sil" : "Delete"}
                            >
                              <X className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminTab === "banners" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Create or Edit Form */}
              <div id="ad-form-container" className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-500" />
                    <span>{editingAd ? (lang === "tr" ? "Reklamı Düzenle" : "Edit Advertisement") : (lang === "tr" ? "Yeni Reklam Ekle" : "Add New Banner")}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {lang === "tr" 
                      ? "Ana sayfada görüntülenecek sponsorlu reklam bannerlarını ekleyin veya güncelleyin."
                      : "Create or modify sponsor-level promotional banners displayed on the home page."}
                  </p>
                </div>

                <form onSubmit={editingAd ? handleUpdateAd : handleCreateAd} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "REKLAM SAHİBİ *" : "ADVERTISER / OWNER *"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Örn: AçıkBazar Destek Ekibi"
                      value={adOwner}
                      onChange={e => setAdOwner(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "REKLAM BAŞLIĞI *" : "AD TITLE *"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Örn: Mobil Uygulamamız Yayında!"
                      value={adTitle}
                      onChange={e => setAdTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "REKLAM DETAYI / AÇIKLAMA" : "AD DESCRIPTION"}
                    </label>
                    <textarea 
                      placeholder="Örn: Uygulamamızı indirip ilan vermeyi kolaylaştırın..."
                      value={adDescription}
                      onChange={e => setAdDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "HEDEF LİNK (YÖNLENDİRİLECEK URL) *" : "TARGET URL / LINK *"}
                    </label>
                    <input 
                      type="url"
                      required
                      placeholder="https://acikbazar.com/app"
                      value={adLink}
                      onChange={e => setAdLink(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700"
                    />
                  </div>

                  {/* Image Upload Block with Validation Alerts */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "REKLAM RESMİ" : "BANNER IMAGE"}
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-800 border-dashed rounded-xl cursor-pointer bg-neutral-950 hover:bg-neutral-900/50 hover:border-amber-500/50 transition-all p-4">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <Camera className="w-6 h-6 text-zinc-500 mb-2" />
                            <p className="text-xs font-semibold text-zinc-400">
                              {lang === "tr" ? "Resim yüklemek için tıklayın" : "Click to upload banner image"}
                            </p>
                            <p className="text-[9px] text-zinc-600 mt-1 font-mono">
                              {lang === "tr" ? "Yatay Format (Önerilen: 16:9 • Maks: 2MB)" : "Landscape Ratio (Ideal: 16:9 • Max: 2MB)"}
                            </p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAdImageChange}
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* Descriptive Guidelines Box & Warning Alerts */}
                      {adImageError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 leading-relaxed font-mono">
                          ⚠️ {adImageError}
                        </div>
                      )}

                      {!adImageError && !newAdImage && (
                        <div className="p-2 bg-neutral-950 rounded-xl text-[9px] text-zinc-500 border border-neutral-800/50 leading-relaxed">
                          📌 {lang === "tr" 
                            ? "Eğer görsel yüklenmezse, reklamınız ana sayfada sistemin modern dinamik renk gradyanı eşliğinde metinsel olarak şıkça sunulacaktır." 
                            : "If no image is uploaded, the banner will fall back to displaying a premium typographic CSS gradient layout."}
                        </div>
                      )}

                      {/* Miniature Image Preview */}
                      {newAdImage && (
                        <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 p-1 flex flex-col items-center">
                          <img src={newAdImage} alt="Ad Preview" className="w-full h-16 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setNewAdImage("")}
                            className="absolute top-2 right-2 bg-black/80 hover:bg-black hover:text-rose-400 text-zinc-400 p-1 rounded-full text-[10px] transition-colors"
                          >
                            ✕
                          </button>
                          <span className="text-[9px] text-green-400 font-mono mt-1">✔ {lang === "tr" ? "Format Kontrolü Başarılı" : "Format Check Passed"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                        {lang === "tr" ? "BAŞLANGIÇ TARİHİ *" : "START DATE *"}
                      </label>
                      <input 
                        type="date"
                        required
                        value={adStartDate}
                        onChange={e => setAdStartDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                        {lang === "tr" ? "BİTİŞ TARİHİ *" : "END DATE *"}
                      </label>
                      <input 
                        type="date"
                        required
                        value={adEndDate}
                        onChange={e => setAdEndDate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                        {lang === "tr" ? "REKLAM DURUMU *" : "INITIAL STATUS *"}
                      </label>
                      <select 
                        value={adStatus}
                        onChange={e => setAdStatus(e.target.value as any)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="active">{lang === "tr" ? "Aktif / Gösterimde" : "Active / Live"}</option>
                        <option value="inactive">{lang === "tr" ? "Pasif / Yayında Değil" : "Inactive / Paused"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                        {lang === "tr" ? "META DATA / NOT" : "INTERNAL METADATA"}
                      </label>
                      <input 
                        type="text"
                        placeholder="Örn: Bayram Kampanyası"
                        value={adMetadata}
                        onChange={e => setAdMetadata(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {editingAd ? (lang === "tr" ? "Değişiklikleri Kaydet" : "Update Banner") : (lang === "tr" ? "Sisteme Kaydet" : "Publish Banner")}
                    </button>
                    {editingAd && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAd(null);
                          setAdTitle("");
                          setAdDescription("");
                          setAdOwner("");
                          setAdLink("");
                          setAdStartDate("");
                          setAdEndDate("");
                          setAdStatus("active");
                          setAdMetadata("");
                          setNewAdImage("");
                          setAdImageError(null);
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        {lang === "tr" ? "İptal" : "Cancel"}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Advertisement List, Filters, and Clicks log */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Banner Ads List Panel */}
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-amber-500" />
                        <span>{lang === "tr" ? "Kayıtlı Reklam Kampanyaları" : "Active Ad Campaigns"}</span>
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {lang === "tr" ? "Sistemdeki tüm bannerlar, tarih aralıkları og aktiflik durumları." : "Manage all banners, run times, impressions, and live statistics."}
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[10px] font-mono">
                      {[
                        { id: "all", label: lang === "tr" ? "TÜMÜ" : "ALL" },
                        { id: "active", label: lang === "tr" ? "AKTİF" : "ACTIVE" },
                        { id: "inactive", label: lang === "tr" ? "PASİF" : "INACTIVE" }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setAdFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                            adFilter === f.id 
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ads Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-zinc-300">
                      <thead>
                        <tr className="border-b border-neutral-800 text-zinc-400 font-mono text-[10px]">
                          <th className="py-3 px-2">{lang === "tr" ? "Reklam Bilgisi" : "Banner & Title"}</th>
                          <th className="py-3 px-2">{lang === "tr" ? "Hedef Link" : "Target link"}</th>
                          <th className="py-3 px-2">{lang === "tr" ? "Yayın Süresi" : "Flight Duration"}</th>
                          <th className="py-3 px-2 text-center">{lang === "tr" ? "Tıklamalar" : "Clicks"}</th>
                          <th className="py-3 px-2">{lang === "tr" ? "Durum" : "Status"}</th>
                          <th className="py-3 px-2 text-right">{lang === "tr" ? "İşlemler" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {advertisements
                          .filter(ad => {
                            if (adFilter === "active") return ad.status === "active";
                            if (adFilter === "inactive") return ad.status === "inactive";
                            return true;
                          })
                          .map(ad => {
                            const clicksCount = adClicks.filter(c => c.adId === ad.id).length;
                            const todayStr = new Date().toISOString().split("T")[0];
                            const isCurrentlyLive = ad.status === "active" && (!ad.startDate || ad.startDate <= todayStr) && (!ad.endDate || ad.endDate >= todayStr);

                            return (
                              <tr key={ad.id} className="hover:bg-neutral-900/30 transition-colors">
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-3">
                                    {ad.imageUrl ? (
                                      <img src={ad.imageUrl} alt={ad.title} className="w-14 h-8 object-cover rounded border border-neutral-800" />
                                    ) : (
                                      <div className="w-14 h-8 rounded bg-gradient-to-br from-amber-500/20 to-neutral-950 border border-neutral-800 flex items-center justify-center font-mono text-[8px] text-amber-500 font-bold uppercase">
                                        Gradient
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-bold text-white text-xs block leading-snug">{ad.title}</span>
                                      <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                                        {lang === "tr" ? "Sahibi" : "Owner"}: {ad.owner} • {ad.metadata ? `[${ad.metadata}]` : ""}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <a href={ad.link} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline flex items-center gap-1 font-mono text-[10px] w-max max-w-[120px] truncate">
                                    <span>{ad.link}</span>
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  </a>
                                </td>
                                <td className="py-3 px-2 font-mono text-[10px] text-zinc-400">
                                  <div className="flex flex-col">
                                    <span>{ad.startDate || "Anytime"}</span>
                                    <span className="text-zinc-600">to {ad.endDate || "Forever"}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center font-mono font-bold text-amber-400 text-sm">
                                  {clicksCount}
                                </td>
                                <td className="py-3 px-2">
                                  {isCurrentlyLive ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                      {lang === "tr" ? "YAYINDA" : "LIVE NOW"}
                                    </span>
                                  ) : ad.status === "active" ? (
                                    <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                                      {lang === "tr" ? "ZAMANLANMIŞ" : "SCHEDULED"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-neutral-950 text-zinc-600 border border-neutral-800 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                                      {lang === "tr" ? "PASİF" : "PAUSED"}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-right space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAdStatus(ad)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                                      ad.status === "active" 
                                        ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    }`}
                                  >
                                    {ad.status === "active" ? (lang === "tr" ? "Pasife Al" : "Pause") : (lang === "tr" ? "Aktife Al" : "Activate")}
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleEditAd(ad)}
                                    className="text-amber-500 hover:text-amber-400 transition-colors p-1"
                                    title={lang === "tr" ? "Düzenle" : "Edit"}
                                  >
                                    <Edit3 className="w-3.5 h-3.5 inline" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="text-rose-500 hover:text-rose-400 transition-colors p-1"
                                    title={lang === "tr" ? "Sil" : "Delete"}
                                  >
                                    <X className="w-3.5 h-3.5 inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        {advertisements.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-zinc-500 font-mono text-[11px]">
                              {lang === "tr" ? "Sistemde henüz reklam bulunmamaktadır." : "No advertisement campaigns created yet."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Impressions and Click Logs Panel */}
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-amber-500" />
                        <span>{lang === "tr" ? "Tıklama ve Kullanıcı Metrikleri" : "User Interaction & Click Metrics"}</span>
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {lang === "tr" ? "Ziyaretçilerin sponsorlu reklamlara tıklama geçmişi ve cihaz bilgileri." : "Detailed audit log of sponsor interactions, unique sessions, and user telemetry."}
                      </p>
                    </div>

                    {/* Simple Search Box */}
                    <input 
                      type="text"
                      placeholder={lang === "tr" ? "Loglarda ara (Başlık, Kullanıcı)" : "Search logs (Title, User)"}
                      value={adClicksSearch}
                      onChange={e => setAdClicksSearch(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-700 font-mono"
                    />
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "TOPLAM TIKLAMA" : "TOTAL CLICKS"}</span>
                      <span className="text-lg font-mono font-bold text-white mt-0.5 block">{adClicks.length}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "GÜVENLİ TIKLAMA" : "VERIFIED CLICKS"}</span>
                      <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5 block">
                        {adClicks.filter(c => c.userId).length}
                      </span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "ANONİM TIKLAMA" : "GUEST CLICKS"}</span>
                      <span className="text-lg font-mono font-bold text-zinc-400 mt-0.5 block">
                        {adClicks.filter(c => !c.userId).length}
                      </span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                      <span className="text-[9px] text-zinc-500 font-mono block uppercase">{lang === "tr" ? "TEKİL KAMPANYA" : "UNIQUE FLIGHTS"}</span>
                      <span className="text-lg font-mono font-bold text-amber-500 mt-0.5 block">
                        {new Set(adClicks.map(c => c.adId)).size}
                      </span>
                    </div>
                  </div>

                  {/* Clicks Table */}
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950 p-1">
                    <table className="w-full text-left border-collapse text-[11px] text-zinc-300">
                      <thead className="bg-neutral-900/60 sticky top-0 font-mono text-[9px] text-zinc-400 border-b border-neutral-800">
                        <tr>
                          <th className="py-2.5 px-3">{lang === "tr" ? "Zaman" : "Timestamp"}</th>
                          <th className="py-2.5 px-3">{lang === "tr" ? "Reklam Kampanyası" : "Campaign Title"}</th>
                          <th className="py-2.5 px-3">{lang === "tr" ? "Tıklayan Kullanıcı" : "User Profile"}</th>
                          <th className="py-2.5 px-3">{lang === "tr" ? "Cihaz / Tarayıcı" : "Telemetry / Agent"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900 text-zinc-300">
                        {adClicks
                          .filter(c => {
                            if (!adClicksSearch) return true;
                            const term = adClicksSearch.toLowerCase();
                            return c.adTitle.toLowerCase().includes(term) || 
                                   (c.userEmail && c.userEmail.toLowerCase().includes(term)) ||
                                   (c.userName && c.userName.toLowerCase().includes(term));
                          })
                          .map(click => (
                            <tr key={click.id} className="hover:bg-neutral-900/20">
                              <td className="py-2 px-3 font-mono text-[10px] text-zinc-500">
                                {new Date(click.clickedAt).toLocaleString("tr-TR")}
                              </td>
                              <td className="py-2 px-3 font-bold text-white">
                                {click.adTitle}
                              </td>
                              <td className="py-2 px-3 font-mono">
                                {click.userId ? (
                                  <div className="flex flex-col">
                                    <span className="text-emerald-400 font-semibold">{click.userName || "Verified User"}</span>
                                    <span className="text-[9px] text-zinc-500">{click.userEmail}</span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-600 font-normal italic">{lang === "tr" ? "Anonim Ziyaretçi" : "Guest Browser"}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-zinc-500 text-[9.5px] max-w-[200px] truncate" title={click.userAgent}>
                                {click.userAgent}
                              </td>
                            </tr>
                          ))}
                        {adClicks.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-zinc-600 font-mono text-[10px]">
                              {lang === "tr" ? "Tıklama kaydı bulunmamaktadır." : "No telemetry logged yet."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {adminTab === "exchange_rates" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Update Exchange Rates Form */}
              <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{lang === "tr" ? "Günlük Kur Güncelleme" : "Daily Exchange Rates"}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {lang === "tr" 
                      ? "Türk Lirası (TL) tabanlı günlük USD ve GBP satış kurlarını güncelleyin."
                      : "Modify current USD and GBP rates relative to Turkish Lira (TL)."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "1 USD DEĞERİ (TL) *" : "1 USD VALUE (TL) *"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-xs">$</span>
                      <input 
                        type="number"
                        step="0.0001"
                        required
                        placeholder="Örn: 33.52"
                        value={adminRateUsd}
                        onChange={e => setAdminRateUsd(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "1 GBP DEĞERİ (TL) *" : "1 GBP VALUE (TL) *"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-xs">£</span>
                      <input 
                        type="number"
                        step="0.0001"
                        required
                        placeholder="Örn: 43.25"
                        value={adminRateGbp}
                        onChange={e => setAdminRateGbp(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const usd = Number(adminRateUsd);
                      const gbp = Number(adminRateGbp);
                      if (isNaN(usd) || usd <= 0 || isNaN(gbp) || gbp <= 0) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Geçerli döviz kurları girmelisiniz." : "Please enter valid exchange rates.",
                          type: "error"
                        });
                        return;
                      }

                      try {
                        const ratesObj = { TL: 1.0, USD: usd, GBP: gbp };
                        const res = await fetch("/api/exchange-rates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rates: ratesObj })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setExchangeRates(ratesObj);
                          setExchangeRatesLastUpdated(new Date().toISOString());
                          setToastNotification({
                            title: lang === "tr" ? "Başarılı" : "Success",
                            message: lang === "tr" ? "Döviz kurları başarıyla güncellendi ve kaydedildi." : "Exchange rates successfully updated and saved.",
                            type: "success"
                          });
                        } else {
                          throw new Error("API update failed");
                        }
                      } catch (err) {
                        console.error(err);
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Kurları güncellerken bir hata oluştu." : "Failed to update exchange rates.",
                          type: "error"
                        });
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
                  >
                    {lang === "tr" ? "Kurları Güncelle ve Kaydet" : "Update & Save Rates"}
                  </button>
                </div>
              </div>

              {/* Right Column: Exchange rate details list & conversion table */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>{lang === "tr" ? "Mevcut Döviz Eşlemeleri ve Kurlar" : "Active Exchange Rate Matrix"}</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {lang === "tr" 
                        ? `Sistemdeki güncel kurlar ve TL cinsinden karşılıkları. Son Güncelleme: ${new Date(exchangeRatesLastUpdated).toLocaleString("tr-TR")}`
                        : `Active exchange rates in Lira. Last updated: ${new Date(exchangeRatesLastUpdated).toLocaleString()}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 flex flex-col justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono block uppercase">TURKISH LIRA (TL)</span>
                      <span className="text-2xl font-mono font-bold text-white mt-1">₺1.00</span>
                      <span className="text-[9px] text-zinc-600 mt-0.5 block">{lang === "tr" ? "Baz Para Birimi" : "Base Currency"}</span>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 flex flex-col justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono block uppercase">US DOLLAR (USD)</span>
                      <span className="text-2xl font-mono font-bold text-amber-500 mt-1">₺{exchangeRates.USD || "33.50"}</span>
                      <span className="text-[9px] text-zinc-600 mt-0.5 block">1 USD = {exchangeRates.USD || "33.50"} TL</span>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 flex flex-col justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono block uppercase">BRITISH POUND (GBP)</span>
                      <span className="text-2xl font-mono font-bold text-amber-500 mt-1">₺{exchangeRates.GBP || "43.20"}</span>
                      <span className="text-[9px] text-zinc-600 mt-0.5 block">1 GBP = {exchangeRates.GBP || "43.20"} TL</span>
                    </div>
                  </div>

                  {/* Currencies Conversion Grid Playground */}
                  <div className="border border-neutral-800/50 rounded-xl overflow-hidden bg-neutral-950">
                    <div className="bg-neutral-900/60 p-3 border-b border-neutral-800 flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">{lang === "tr" ? "HIZLI HESAPLAMA MATRİSİ (Örnek: 100 Birim Çevrimi)" : "QUICK CONVERSION GRID (e.g. 100 Units)"}</span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs text-zinc-300">
                      <div className="grid grid-cols-4 gap-2 border-b border-neutral-900 pb-2 text-[10px] text-zinc-500">
                        <span>{lang === "tr" ? "Miktar" : "Amount"}</span>
                        <span>{lang === "tr" ? "TL Karşılığı" : "In TRY"}</span>
                        <span>{lang === "tr" ? "USD Karşılığı" : "In USD"}</span>
                        <span>{lang === "tr" ? "GBP Karşılığı" : "In GBP"}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 py-1">
                        <span className="text-white font-bold">100 ₺ (TL)</span>
                        <span>100 ₺</span>
                        <span>${(100 / (exchangeRates.USD || 1)).toFixed(2)}</span>
                        <span>£{(100 / (exchangeRates.GBP || 1)).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 py-1">
                        <span className="text-white font-bold">100 $ (USD)</span>
                        <span>{((exchangeRates.USD || 1) * 100).toFixed(2)} ₺</span>
                        <span>$100</span>
                        <span>£{(((exchangeRates.USD || 1) * 100) / (exchangeRates.GBP || 1)).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 py-1">
                        <span className="text-white font-bold">100 £ (GBP)</span>
                        <span>{((exchangeRates.GBP || 1) * 100).toFixed(2)} ₺</span>
                        <span>${(((exchangeRates.GBP || 1) * 100) / (exchangeRates.USD || 1)).toFixed(2)}</span>
                        <span>£100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminTab === "locations" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Forms to Add Country/City/District */}
              <div className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{lang === "tr" ? "Yeni Konum Girişi" : "Add New Location"}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {lang === "tr" 
                      ? "Sisteme yeni ülke, şehir ve semt/ilçe ekleyerek ilan ve profil adres seçeneklerini genişletin."
                      : "Add new countries, cities, and districts to expand listing and profile address selectors."}
                  </p>
                </div>

                {/* Form 1: Add Country */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                    <span>1. {lang === "tr" ? "Ülke Ekle" : "Add Country"}</span>
                  </h4>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Ülke Adı *" : "Country Name *"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={lang === "tr" ? "Örn: Almanya" : "e.g. Germany"}
                      value={newCountryName}
                      onChange={e => setNewCountryName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCountryName.trim()) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Lütfen bir ülke adı girin." : "Please enter a country name.",
                          type: "error"
                        });
                        return;
                      }
                      
                      const countryExists = locations.some(l => l.name.toLowerCase() === newCountryName.trim().toLowerCase());
                      if (countryExists) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Bu ülke zaten kayıtlı." : "This country already exists.",
                          type: "error"
                        });
                        return;
                      }

                      const updatedLocations = [
                        ...locations,
                        {
                          id: `loc_${newCountryName.trim().toLowerCase().replace(/\s+/g, '_')}`,
                          name: newCountryName.trim(),
                          cities: []
                        }
                      ];

                      try {
                        const res = await fetch("/api/locations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ locations: updatedLocations })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setLocations(updatedLocations);
                          setNewCountryName("");
                          setToastNotification({
                            title: lang === "tr" ? "Başarılı" : "Success",
                            message: lang === "tr" ? "Ülke başarıyla eklendi." : "Country successfully added.",
                            type: "success"
                          });
                        } else {
                          throw new Error("API update failed");
                        }
                      } catch (err) {
                        console.error(err);
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Ülke eklenirken bir hata oluştu." : "Failed to add country.",
                          type: "error"
                        });
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 hover:text-amber-400 font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                  >
                    {lang === "tr" ? "Ülke Ekle" : "Add Country"}
                  </button>
                </div>

                {/* Form 2: Add City */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                    <span>2. {lang === "tr" ? "Şehir Ekle" : "Add City"}</span>
                  </h4>
                  
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Hangi Ülkeye? *" : "To Which Country? *"}
                    </label>
                    <select
                      value={newCityCountry}
                      onChange={e => setNewCityCountry(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Seçiniz" : "Select Country"}</option>
                      {locations.map(l => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Şehir Adı *" : "City Name *"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={lang === "tr" ? "Örn: Berlin" : "e.g. Berlin"}
                      value={newCityName}
                      onChange={e => setNewCityName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCityCountry) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Lütfen bir ülke seçin." : "Please select a country.",
                          type: "error"
                        });
                        return;
                      }
                      if (!newCityName.trim()) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Lütfen bir şehir adı girin." : "Please enter a city name.",
                          type: "error"
                        });
                        return;
                      }

                      const updatedLocations = locations.map(c => {
                        if (c.name === newCityCountry) {
                          const cityExists = c.cities.some(city => city.name.toLowerCase() === newCityName.trim().toLowerCase());
                          if (cityExists) return c;
                          return {
                            ...c,
                            cities: [
                              ...c.cities,
                              { name: newCityName.trim(), districts: [] }
                            ]
                          };
                        }
                        return c;
                      });

                      const targetCountry = locations.find(c => c.name === newCityCountry);
                      const cityExists = targetCountry?.cities.some(city => city.name.toLowerCase() === newCityName.trim().toLowerCase());
                      if (cityExists) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Bu şehir zaten kayıtlı." : "This city already exists in this country.",
                          type: "error"
                        });
                        return;
                      }

                      try {
                        const res = await fetch("/api/locations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ locations: updatedLocations })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setLocations(updatedLocations);
                          setNewCityName("");
                          setToastNotification({
                            title: lang === "tr" ? "Başarılı" : "Success",
                            message: lang === "tr" ? "Şehir başarıyla eklendi." : "City successfully added.",
                            type: "success"
                          });
                        } else {
                          throw new Error("API update failed");
                        }
                      } catch (err) {
                        console.error(err);
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Şehir eklenirken bir hata oluştu." : "Failed to add city.",
                          type: "error"
                        });
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 hover:text-amber-400 font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                  >
                    {lang === "tr" ? "Şehir Ekle" : "Add City"}
                  </button>
                </div>

                {/* Form 3: Add District */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                    <span>3. {lang === "tr" ? "Semt Ekle" : "Add District"}</span>
                  </h4>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Ülke Seçin *" : "Select Country *"}
                    </label>
                    <select
                      value={newDistrictCountry}
                      onChange={e => {
                        setNewDistrictCountry(e.target.value);
                        setNewDistrictCity("");
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Seçiniz" : "Select Country"}</option>
                      {locations.map(l => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Şehir Seçin *" : "Select City *"}
                    </label>
                    <select
                      value={newDistrictCity}
                      disabled={!newDistrictCountry}
                      onChange={e => setNewDistrictCity(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Seçiniz" : "Select City"}</option>
                      {(locations.find(l => l.name === newDistrictCountry)?.cities || []).map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase font-bold">
                      {lang === "tr" ? "Semt/İlçe Adı *" : "District Name *"}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={lang === "tr" ? "Örn: Mitte" : "e.g. Mitte"}
                      value={newDistrictName}
                      onChange={e => setNewDistrictName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!newDistrictCountry || !newDistrictCity) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Lütfen ülke ve şehri seçin." : "Please select country and city.",
                          type: "error"
                        });
                        return;
                      }
                      if (!newDistrictName.trim()) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Lütfen bir semt adı girin." : "Please enter a district name.",
                          type: "error"
                        });
                        return;
                      }

                      const updatedLocations = locations.map(country => {
                        if (country.name === newDistrictCountry) {
                          return {
                            ...country,
                            cities: country.cities.map(city => {
                              if (city.name === newDistrictCity) {
                                const districtExists = city.districts.some(dist => dist.toLowerCase() === newDistrictName.trim().toLowerCase());
                                if (districtExists) return city;
                                return {
                                  ...city,
                                  districts: [...city.districts, newDistrictName.trim()]
                                };
                              }
                              return city;
                            })
                          };
                        }
                        return country;
                      });

                      const targetCountry = locations.find(c => c.name === newDistrictCountry);
                      const targetCity = targetCountry?.cities.find(city => city.name === newDistrictCity);
                      const districtExists = targetCity?.districts.some(dist => dist.toLowerCase() === newDistrictName.trim().toLowerCase());
                      if (districtExists) {
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Bu semt zaten kayıtlı." : "This district already exists in this city.",
                          type: "error"
                        });
                        return;
                      }

                      try {
                        const res = await fetch("/api/locations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ locations: updatedLocations })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setLocations(updatedLocations);
                          setNewDistrictName("");
                          setToastNotification({
                            title: lang === "tr" ? "Başarılı" : "Success",
                            message: lang === "tr" ? "Semt başarıyla eklendi." : "District successfully added.",
                            type: "success"
                          });
                        } else {
                          throw new Error("API update failed");
                        }
                      } catch (err) {
                        console.error(err);
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: lang === "tr" ? "Semt eklenirken bir hata oluştu." : "Failed to add district.",
                          type: "error"
                        });
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 hover:text-amber-400 font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
                  >
                    {lang === "tr" ? "Semt Ekle" : "Add District"}
                  </button>
                </div>

                {/* Form 4: Excel / CSV Import & Export */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                      <span>4. {lang === "tr" ? "Toplu Konum İşlemleri (Excel/CSV)" : "Bulk Locations (Excel/CSV)"}</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {lang === "tr"
                        ? "Mevcut konumları dışa aktarın veya düzenlenen dosyayı topluca içeri aktarın."
                        : "Export current location hierarchy or import edited bulk location table."}
                    </p>
                  </div>

                  {/* Export Button */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase font-semibold">
                      {lang === "tr" ? "Mevcut Konumları İndir" : "Download Current Locations"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const rows = [
                          ["Country (Ülke)", "City (Şehir)", "District (Semt/İlçe)"]
                        ];

                        locations.forEach(country => {
                          if (country.cities.length === 0) {
                            rows.push([country.name, "", ""]);
                          } else {
                            country.cities.forEach(city => {
                              if (city.districts.length === 0) {
                                rows.push([country.name, city.name, ""]);
                              } else {
                                city.districts.forEach(dist => {
                                  rows.push([country.name, city.name, dist]);
                                });
                              }
                            });
                          }
                        });

                        const csvContent = rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
                        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `acikbazar_konumlar.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        setToastNotification({
                          title: lang === "tr" ? "Başarılı" : "Success",
                          message: lang === "tr" ? "Konum tablosu başarıyla dışa aktarıldı." : "Location list successfully exported.",
                          type: "success"
                        });
                      }}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 hover:text-amber-400 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === "tr" ? "Şablon & Konumları Excel Olarak İndir" : "Download Template & Data as Excel"}</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-800/60 my-2"></div>

                  {/* Import Input & Selector */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-semibold mb-1">
                        {lang === "tr" ? "Konum Verilerini Yapıştır veya Dosya Seç" : "Paste Location Data or Select File"}
                      </span>
                      <textarea
                        rows={4}
                        placeholder={
                          lang === "tr"
                            ? "Örn:\nCountry (Ülke),City (Şehir),District (Semt/İlçe)\nTürkiye,İstanbul,Kadıköy\nTürkiye,Ankara,Çankaya"
                            : "e.g.\nCountry (Ülke),City (Şehir),District (Semt/İlçe)\nTurkey,Istanbul,Kadikoy"
                        }
                        value={locationCsvPasteContent}
                        onChange={e => setLocationCsvPasteContent(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-[10px] text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Drag and Drop simulator */}
                    <div className="relative border border-dashed border-neutral-850 hover:border-amber-500/50 bg-neutral-900/10 p-4 rounded-xl text-center transition-all">
                      <input
                        type="file"
                        accept=".csv"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const text = event.target?.result;
                            if (typeof text === "string") {
                              setLocationCsvPasteContent(text);
                              setToastNotification({
                                title: lang === "tr" ? "Dosya Yüklendi" : "File Loaded",
                                message: lang === "tr" ? `'${file.name}' içeriği başarıyla okundu.` : `'${file.name}' loaded successfully.`,
                                type: "success"
                              });
                            }
                          };
                          reader.readAsText(file, "UTF-8");
                        }}
                      />
                      <Upload className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
                      <span className="text-[10px] text-zinc-400 block font-semibold">
                        {lang === "tr" ? "CSV Dosyasını Sürükleyin veya Seçin" : "Drag & Drop CSV File or Click"}
                      </span>
                    </div>

                    {/* Parse and Save Button */}
                    <button
                      type="button"
                      disabled={isImportingLocationCsv || !locationCsvPasteContent.trim()}
                      onClick={async () => {
                        if (!locationCsvPasteContent.trim()) return;
                        setIsImportingLocationCsv(true);

                        try {
                          const cleanCsv = locationCsvPasteContent.replace(/^\uFEFF/, "").trim();
                          const lines = cleanCsv.split(/\r?\n/);
                          if (lines.length < 2) {
                            throw new Error(lang === "tr" ? "CSV içeriği boş veya geçersiz." : "CSV content is empty or invalid.");
                          }

                          const firstLine = lines[0];
                          let delimiter = ",";
                          if (firstLine.includes(";")) {
                            delimiter = ";";
                          } else if (firstLine.includes("\t")) {
                            delimiter = "\t";
                          }

                          const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').trim());

                          // Detect if first line contains header fields
                          let isFirstLineHeader = false;
                          const headerCheckWords = ["country", "ülke", "ulke", "city", "şehir", "sehir", "district", "semt", "ilçe", "ilce"];
                          if (headers.some(c => headerCheckWords.some(w => c.toLowerCase().includes(w)))) {
                            isFirstLineHeader = true;
                          }

                          const findHeaderIndex = (keys: string[]): number => {
                            const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
                            let idx = headers.findIndex(h => keys.some(k => cleanStr(k) === cleanStr(h)));
                            if (idx !== -1) return idx;
                            return headers.findIndex(h => {
                              const cleanH = cleanStr(h);
                              return keys.some(k => {
                                const cleanK = cleanStr(k);
                                return cleanK.length > 2 && (cleanH.includes(cleanK) || cleanK.includes(cleanH));
                              });
                            });
                          };

                          let countryIdx = -1;
                          let cityIdx = -1;
                          let districtIdx = -1;

                          if (isFirstLineHeader) {
                            countryIdx = findHeaderIndex(["Country", "Ülke", "Ulke", "Country Name"]);
                            cityIdx = findHeaderIndex(["City", "Şehir", "Sehir", "City Name"]);
                            districtIdx = findHeaderIndex(["District", "Semt", "İlçe", "Ilce", "Neighborhood", "District Name"]);
                          }

                          if (countryIdx === -1) countryIdx = 0;
                          if (cityIdx === -1) cityIdx = 1;
                          if (districtIdx === -1) districtIdx = 2;

                          const tempMap: { [countryName: string]: { [cityName: string]: string[] } } = {};
                          const startLineIdx = isFirstLineHeader ? 1 : 0;
                          let rowCount = 0;

                          for (let i = startLineIdx; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (!line) continue;

                            const columns: string[] = [];
                            let current = "";
                            let inQuotes = false;
                            for (let c = 0; c < line.length; c++) {
                              const char = line[c];
                              if (char === '"' || char === "'") {
                                inQuotes = !inQuotes;
                              } else if (char === delimiter && !inQuotes) {
                                columns.push(current.trim());
                                current = "";
                              } else {
                                current += char;
                              }
                            }
                            columns.push(current.trim());

                            const country = columns[countryIdx]?.replace(/^["']|["']$/g, '').trim();
                            const city = columns[cityIdx]?.replace(/^["']|["']$/g, '').trim() || "";
                            const district = columns[districtIdx]?.replace(/^["']|["']$/g, '').trim() || "";

                            if (!country) continue;

                            if (!tempMap[country]) {
                              tempMap[country] = {};
                            }

                            if (city) {
                              if (!tempMap[country][city]) {
                                tempMap[country][city] = [];
                              }
                              if (district) {
                                if (!tempMap[country][city].includes(district)) {
                                  tempMap[country][city].push(district);
                                }
                              }
                            }
                            rowCount++;
                          }

                          if (rowCount === 0) {
                            throw new Error(lang === "tr" ? "Çözümlenecek geçerli satır bulunamadı." : "No valid rows found to parse.");
                          }

                          const updatedLocations = Object.keys(tempMap).map(countryName => {
                            const countryId = `loc_${countryName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                            const citiesMap = tempMap[countryName];
                            const cities = Object.keys(citiesMap).map(cityName => {
                              return {
                                name: cityName,
                                districts: citiesMap[cityName]
                              };
                            });
                            return {
                              id: countryId,
                              name: countryName,
                              cities: cities
                            };
                          });

                          const res = await fetch("/api/locations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ locations: updatedLocations })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setLocations(updatedLocations);
                            setLocationCsvPasteContent("");
                            setToastNotification({
                              title: lang === "tr" ? "Başarılı" : "Success",
                              message: lang === "tr" 
                                ? `${rowCount} satır işlendi, konum listesi güncellendi.` 
                                : `${rowCount} rows processed, location directory updated.`,
                              type: "success"
                            });
                          } else {
                            throw new Error("API update failed");
                          }

                        } catch (err: any) {
                          console.error(err);
                          setToastNotification({
                            title: lang === "tr" ? "Hata" : "Error",
                            message: err.message || (lang === "tr" ? "İçe aktarım sırasında bir hata oluştu." : "Failed to import locations."),
                            type: "error"
                          });
                        } finally {
                          setIsImportingLocationCsv(false);
                        }
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImportingLocationCsv ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>{lang === "tr" ? "Konumları Güncelle ve Kaydet" : "Update and Save Locations"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Location List Explorer */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>{lang === "tr" ? "Kayıtlı Konum Hiyerarşisi" : "Registered Locations Hierarchy"}</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {lang === "tr" 
                        ? "Sistemde yer alan aktif ülkeler, bunlara bağlı şehirler ve şehir içi semt listeleri."
                        : "Active countries, associated cities, and neighborhoods currently loaded in the directory."}
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {locations.map(country => (
                      <div key={country.name} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            {country.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {country.cities.length} {lang === "tr" ? "Şehir" : "Cities"}
                          </span>
                        </div>

                        {country.cities.length === 0 ? (
                          <p className="text-[11px] text-zinc-600 italic">
                            {lang === "tr" ? "Bu ülkeye ait şehir eklenmemiş." : "No cities registered for this country."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {country.cities.map(city => (
                              <div key={city.name} className="bg-neutral-900/30 border border-neutral-800/40 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between items-center border-b border-neutral-900/60 pb-1.5">
                                  <span className="text-[11px] text-white font-bold">{city.name}</span>
                                  <span className="text-[9px] font-mono text-zinc-500">
                                    {city.districts.length} {lang === "tr" ? "Semt" : "Districts"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {city.districts.length === 0 ? (
                                    <span className="text-[10px] text-zinc-600 italic">
                                      {lang === "tr" ? "Semt girilmemiş" : "No districts"}
                                    </span>
                                  ) : (
                                    city.districts.map(dist => (
                                      <span key={dist} className="bg-neutral-950 text-zinc-400 border border-neutral-800 px-2 py-0.5 rounded text-[10px] font-medium font-sans">
                                        {dist}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* Left Side: Actions (Export & Import controls) */}
              <div className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    <span>{lang === "tr" ? "Sistem Ayarları" : "System Settings"}</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {lang === "tr" 
                      ? "Bütün kategorilerin marka ve model verisini Excel formatında dışa aktarın ve topluca içe aktarın."
                      : "Export brand and model mappings for all categories, or import them in bulk."}
                  </p>
                </div>

                {/* Section 1: EXPORT */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                    <span>1. {lang === "tr" ? "Marka ve Model Verilerini Dışa Aktar" : "Export Brands & Models"}</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {lang === "tr"
                      ? "Sistemdeki tüm alt kategorilere ait tanımlı marka ve model hiyerarşisini UTF-8 kodlu bir Excel/CSV dosyası olarak indirin."
                      : "Download the complete category brand and model definitions as a UTF-8 encoded Excel-friendly CSV."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const rows = [
                        ["Category ID", "Category Name (TR)", "Category Name (EN)", "Brand (Marka)", "Model"]
                      ];
                      
                      categories.forEach(cat => {
                        const attrs = cat.attributes || [];
                        const modelAttr = attrs.find(a => a.key === "model");
                        
                        if (modelAttr && modelAttr.options) {
                          modelAttr.options.forEach(opt => {
                            if (opt.includes(":")) {
                              const parts = opt.split(":");
                              const brand = parts[0];
                              const modelName = parts.slice(1).join(":");
                              rows.push([
                                cat.id,
                                cat.nameTr,
                                cat.nameEn,
                                brand,
                                modelName
                              ]);
                            } else {
                              rows.push([
                                cat.id,
                                cat.nameTr,
                                cat.nameEn,
                                "",
                                opt
                              ]);
                            }
                          });
                        }
                      });
                      
                      categories.forEach(cat => {
                        const hasExplicit = (cat.attributes || []).some(a => a.key === "model");
                        if (hasExplicit) return;
                        
                        const activeAttrs = getCategoryAttributesRecursively(cat.id);
                        const modelAttr = activeAttrs.find(a => a.key === "model");
                        if (modelAttr && modelAttr.options) {
                          modelAttr.options.forEach(opt => {
                            if (opt.includes(":")) {
                              const parts = opt.split(":");
                              const brand = parts[0];
                              const modelName = parts.slice(1).join(":");
                              rows.push([
                                cat.id,
                                cat.nameTr,
                                cat.nameEn,
                                brand,
                                modelName
                              ]);
                            }
                          });
                        }
                      });

                      const csvContent = rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
                      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `acikbazar_kategori_marka_model.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      setToastNotification({
                        title: lang === "tr" ? "Başarılı" : "Success",
                        message: lang === "tr" ? "Marka ve model tablosu başarıyla dışa aktarıldı." : "Brand & model list successfully exported.",
                        type: "success"
                      });
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 hover:text-amber-400 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{lang === "tr" ? "Excel / CSV Olarak İndir" : "Download as Excel / CSV"}</span>
                  </button>
                </div>

                {/* Section 2: IMPORT */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono">
                    <span>2. {lang === "tr" ? "Marka ve Model Verilerini İçe Aktar" : "Import Brands & Models"}</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {lang === "tr"
                      ? "Excel dosyanızın içeriğini kopyalayıp aşağıdaki alana yapıştırın veya dosya yükleyin. Format: Category ID, Category Name, Brand, Model"
                      : "Paste CSV content directly or upload a CSV file with brand-model columns."}
                  </p>

                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      placeholder={
                        lang === "tr"
                          ? "Örn:\nCategory ID,Category Name (TR),Category Name (EN),Brand (Marka),Model\ncat_otomobil,Otomobil,Cars,BMW,320i\ncat_otomobil,Otomobil,Cars,Mercedes,C200"
                          : "e.g.\nCategory ID,Category Name (TR),Category Name (EN),Brand (Marka),Model\ncat_otomobil,Otomobil,Cars,BMW,320i"
                      }
                      value={csvPasteContent}
                      onChange={e => setCsvPasteContent(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-[10px] text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />

                    {/* Drag-and-drop file upload simulator / real file reader */}
                    <div className="relative border border-dashed border-neutral-850 hover:border-amber-500/50 bg-neutral-900/10 p-4 rounded-xl text-center transition-all">
                      <input
                        type="file"
                        accept=".csv"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const text = event.target?.result;
                            if (typeof text === "string") {
                              setCsvPasteContent(text);
                              setToastNotification({
                                title: lang === "tr" ? "Dosya Yüklendi" : "File Loaded",
                                message: lang === "tr" ? `'${file.name}' içeriği başarıyla okundu.` : `'${file.name}' loaded successfully.`,
                                type: "success"
                              });
                            }
                          };
                          reader.readAsText(file, "UTF-8");
                        }}
                      />
                      <FileCode className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
                      <span className="text-[10px] text-zinc-400 block font-semibold">
                        {lang === "tr" ? "CSV Dosyasını Buraya Sürükleyin veya Seçin" : "Drag & Drop CSV File or Click"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isImportingCsv || !csvPasteContent.trim()}
                    onClick={async () => {
                      if (!csvPasteContent.trim()) return;
                      setIsImportingCsv(true);
                      
                      try {
                        const cleanCsv = csvPasteContent.replace(/^\uFEFF/, "").trim();
                        const lines = cleanCsv.split(/\r?\n/);
                        if (lines.length < 2) {
                          throw new Error(lang === "tr" ? "CSV içeriği boş veya geçersiz." : "CSV content is empty or invalid.");
                        }

                        const firstLine = lines[0];
                        let delimiter = ",";
                        if (firstLine.includes(";")) {
                          delimiter = ";";
                        } else if (firstLine.includes("\t")) {
                          delimiter = "\t";
                        }

                        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').trim());
                        
                        const findHeaderIndex = (keys: string[]): number => {
                          const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
                          // First try exact cleaned match
                          let idx = headers.findIndex(h => keys.some(k => cleanStr(k) === cleanStr(h)));
                          if (idx !== -1) return idx;
                          // If not found, try partial match (ensure key has meaningful length to avoid false positives)
                          return headers.findIndex(h => {
                            const cleanH = cleanStr(h);
                            return keys.some(k => {
                              const cleanK = cleanStr(k);
                              return cleanK.length > 2 && (cleanH.includes(cleanK) || cleanK.includes(cleanH));
                            });
                          });
                        };

                        // Detect if first line contains header fields
                        let isFirstLineHeader = false;
                        const headerCheckWords = ["category", "kategori", "id", "brand", "marka", "model", "name", "ad"];
                        const firstLineCols = firstLine.split(delimiter).map(c => c.trim().toLowerCase().replace(/^["']|["']$/g, ''));
                        if (firstLineCols.some(c => headerCheckWords.some(w => c.includes(w)))) {
                          isFirstLineHeader = true;
                        }

                        let catIdIdx = -1;
                        let brandIdx = -1;
                        let modelIdx = -1;

                        if (isFirstLineHeader) {
                          catIdIdx = findHeaderIndex(["Category ID", "Kategori ID", "id", "categoryId"]);
                          brandIdx = findHeaderIndex(["Brand", "Marka", "brand_name", "marka"]);
                          modelIdx = findHeaderIndex(["Model", "model_name", "model"]);
                        }

                        // Intelligent fallback if headers are missing or not matched
                        if (catIdIdx === -1 || brandIdx === -1 || modelIdx === -1) {
                          const sampleLine = isFirstLineHeader && lines.length > 1 ? lines[1] : lines[0];
                          if (sampleLine) {
                            const cols = sampleLine.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '').trim());
                            if (cols.length >= 3) {
                              let guessedCatId = cols.findIndex(c => c.toLowerCase().includes("cat_") || c.toLowerCase().startsWith("cat"));
                              if (guessedCatId === -1) {
                                guessedCatId = 0; // Default to first column for Category ID
                              }

                              let guessedBrand = -1;
                              let guessedModel = -1;

                              if (cols.length === 5) {
                                guessedBrand = 3;
                                guessedModel = 4;
                              } else if (cols.length === 3) {
                                guessedBrand = 1;
                                guessedModel = 2;
                              } else if (cols.length === 4) {
                                guessedBrand = 2;
                                guessedModel = 3;
                              } else {
                                guessedBrand = cols.length - 2;
                                guessedModel = cols.length - 1;
                              }

                              if (catIdIdx === -1) catIdIdx = guessedCatId;
                              if (brandIdx === -1) brandIdx = guessedBrand;
                              if (modelIdx === -1) modelIdx = guessedModel;
                            }
                          }
                        }

                        // Absolute fallback if everything fails
                        if (catIdIdx === -1) catIdIdx = 0;
                        if (brandIdx === -1) brandIdx = 1;
                        if (modelIdx === -1) modelIdx = 2;

                        const updatedCategories = JSON.parse(JSON.stringify(categories));
                        let successfullyMatched = 0;
                        let brandsModelsAdded = 0;

                        const startLineIndex = isFirstLineHeader ? 1 : 0;

                        for (let i = startLineIndex; i < lines.length; i++) {
                          const line = lines[i].trim();
                          if (!line) continue;

                          const columns: string[] = [];
                          let current = "";
                          let inQuotes = false;
                          for (let c = 0; c < line.length; c++) {
                            const char = line[c];
                            if (char === '"' || char === "'") {
                              inQuotes = !inQuotes;
                            } else if (char === delimiter && !inQuotes) {
                              columns.push(current.trim());
                              current = "";
                            } else {
                              current += char;
                            }
                          }
                          columns.push(current.trim());

                          const catId = columns[catIdIdx]?.replace(/^["']|["']$/g, '');
                          const brand = columns[brandIdx]?.replace(/^["']|["']$/g, '');
                          const model = columns[modelIdx]?.replace(/^["']|["']$/g, '');

                          if (!catId || !brand || !model) continue;

                          const targetCat = updatedCategories.find((c: any) => c.id === catId);
                          if (!targetCat) continue;

                          successfullyMatched++;

                          if (!targetCat.attributes) {
                            targetCat.attributes = [];
                          }

                          let markaAttr = targetCat.attributes.find((a: any) => a.key === "marka");
                          if (!markaAttr) {
                            markaAttr = {
                              key: "marka",
                              label_tr: "Marka",
                              label_en: "Brand",
                              type: "select",
                              required: true,
                              options: []
                            };
                            targetCat.attributes.push(markaAttr);
                          }
                          if (!markaAttr.options.includes(brand)) {
                            markaAttr.options.push(brand);
                            brandsModelsAdded++;
                          }

                          let modelAttr = targetCat.attributes.find((a: any) => a.key === "model");
                          if (!modelAttr) {
                            modelAttr = {
                              key: "model",
                              label_tr: "Model",
                              label_en: "Model",
                              type: "select",
                              required: true,
                              options: []
                            };
                            targetCat.attributes.push(modelAttr);
                          }
                          const combinedModelOpt = `${brand}:${model}`;
                          if (!modelAttr.options.includes(combinedModelOpt)) {
                            modelAttr.options.push(combinedModelOpt);
                            brandsModelsAdded++;
                          }
                        }

                        if (successfullyMatched === 0) {
                          throw new Error(lang === "tr" ? "Eşleşen herhangi bir kategori bulunamadı." : "No matching categories found in the CSV file.");
                        }

                        const res = await fetch("/api/categories/bulk", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ categories: updatedCategories })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setCategories(updatedCategories);
                          setCsvPasteContent("");
                          setToastNotification({
                            title: lang === "tr" ? "Başarılı" : "Success",
                            message: lang === "tr" 
                              ? `${successfullyMatched} satır işlendi, ${brandsModelsAdded} yeni marka/model eklendi.` 
                              : `${successfullyMatched} rows processed, ${brandsModelsAdded} brand/model definitions imported.`,
                            type: "success"
                          });
                        } else {
                          throw new Error("Bulk category save API returned error");
                        }

                      } catch (err: any) {
                        console.error(err);
                        setToastNotification({
                          title: lang === "tr" ? "Hata" : "Error",
                          message: err.message || (lang === "tr" ? "İçe aktarım sırasında bir hata oluştu." : "Failed to import brands and models."),
                          type: "error"
                        });
                      } finally {
                        setIsImportingCsv(false);
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImportingCsv ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{lang === "tr" ? "İçeriği Çözümle ve Kaydet" : "Parse and Save Mappings"}</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Preview Table & Current Brand/Model Tree */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-500" />
                      <span>{lang === "tr" ? "Aktif Marka & Model Katalog İzleyici" : "Active Brand & Model Catalog Matrix"}</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {lang === "tr" 
                        ? "Sistemde yer alan kategorilerdeki tescilli markalar ve bu markalara bağlı model sayıları."
                        : "Registered brands and model counts associated with your directory categories."}
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {categories.filter(cat => isVehicleOrElectronics(cat.id)).map(cat => {
                      const activeAttrs = getCategoryAttributesRecursively(cat.id);
                      const brandAttr = activeAttrs.find(a => a.key === "marka");
                      const modelAttr = activeAttrs.find(a => a.key === "model");

                      const brandsList = brandAttr?.options || [];
                      const modelsList = modelAttr?.options || [];

                      return (
                        <div key={cat.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                          <div className="flex justify-between items-center border-b border-neutral-950 pb-2">
                            <div>
                              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                {lang === "tr" ? cat.nameTr : cat.nameEn}
                              </span>
                              <span className="text-[9px] text-zinc-600 block font-mono mt-0.5">ID: {cat.id}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {brandsList.length} {lang === "tr" ? "Marka" : "Brands"} / {modelsList.length} {lang === "tr" ? "Model" : "Models"}
                            </span>
                          </div>

                          {brandsList.length === 0 ? (
                            <p className="text-[11px] text-zinc-600 italic">
                              {lang === "tr" ? "Bu kategoride tanımlı marka/model bulunmuyor." : "No brands/models registered for this category."}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {brandsList.map(brand => {
                                const brandModels = modelsList
                                  .filter(m => m.startsWith(`${brand}:`))
                                  .map(m => m.substring(m.indexOf(":") + 1));

                                return (
                                  <div key={brand} className="bg-neutral-900/30 border border-neutral-900 p-3 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center border-b border-neutral-950 pb-1.5">
                                      <span className="text-[11px] text-white font-bold">{brand}</span>
                                      <span className="text-[9px] font-mono text-amber-500/80">
                                        {brandModels.length} {lang === "tr" ? "Model" : "Models"}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {brandModels.length === 0 ? (
                                        <span className="text-[10px] text-zinc-600 italic">
                                          {lang === "tr" ? "Model bulunamadı" : "No models found"}
                                        </span>
                                      ) : (
                                        brandModels.map(modelName => (
                                          <span key={modelName} className="bg-neutral-950 text-zinc-400 border border-neutral-800 px-2 py-0.5 rounded text-[10px] font-medium font-sans">
                                            {modelName}
                                          </span>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : currentPage === "login" ? (
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-16 flex items-center justify-center min-h-[70vh] animate-fade-in">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                {lang === "tr" ? "Hesabınıza Giriş Yapın" : "Sign In to Your Account"}
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === "tr" ? "Vadi İlan dünyasına katılın veya ilanlarınızı yönetin" : "Manage listings, view statuses and chat with buyers"}
              </p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const foundUser = adminUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
              if (!foundUser) {
                setLoginError(lang === "tr" ? "Bu e-posta adresine kayıtlı kullanıcı bulunamadı." : "No registered user found with this email.");
                return;
              }
              // Check password
              const checkPass = foundUser.password || "123456";
              if (loginPassword !== checkPass) {
                setLoginError(lang === "tr" ? `Hatalı şifre! (Geliştirici testi için bu hesabın şifresi: ${checkPass})` : `Invalid password! (For development testing, password is: ${checkPass})`);
                return;
              }
              setLoginError(null);
              setUser(foundUser);
              window.history.pushState(null, "", "/");
              setCurrentPage("main");
              setToastNotification({
                title: lang === "tr" ? "Giriş Başarılı" : "Sign In Successful",
                message: lang === "tr" ? `Hoş geldiniz, ${foundUser.name}!` : `Welcome back, ${foundUser.name}!`,
                type: "success"
              });
              setLoginEmail("");
              setLoginPassword("");
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "E-posta Adresi" : "Email Address"}</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="ornek@example.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Şifre" : "Password"}</label>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, "", "/forgot-password");
                      setCurrentPage("forgot-password");
                      setLoginError(null);
                      setForgotError(null);
                    }}
                    className="text-[11px] text-amber-500 hover:underline font-semibold"
                  >
                    {lang === "tr" ? "Şifremi Unuttum" : "Forgot Password?"}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-normal">
                  💡 {lang === "tr" 
                    ? "Kayıtlı demo hesapları (Yönetim sayfasından veya aşağıdan e-postalarını görebilirsiniz) şifre olarak '123456' kullanır." 
                    : "Simulated accounts use password '123456' by default (you can inspect emails in Admin or mailbox below)."}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {lang === "tr" ? "Giriş Yap" : "Sign In"}
              </button>
            </form>

            <div className="text-center text-xs text-zinc-400 pt-4 border-t border-neutral-800">
              <span>{lang === "tr" ? "Hesabınız yok mu?" : "Don't have an account?"} </span>
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, "", "/register");
                  setCurrentPage("register");
                  setLoginError(null);
                  setRegisterError(null);
                }}
                className="text-amber-500 hover:underline font-bold"
              >
                {lang === "tr" ? "Şimdi Kayıt Olun" : "Register Now"}
              </button>
            </div>
          </div>
        </div>
      ) : currentPage === "register" ? (
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-16 flex items-center justify-center min-h-[70vh] animate-fade-in">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
            
            {registerStep === "form" ? (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                    {lang === "tr" ? "Yeni Hesap Oluştur" : "Create New Account"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {lang === "tr" ? "E-posta onaylı güvenli kayıt sürecini başlatın" : "Secure signup with instant email activation"}
                  </p>
                </div>

                {registerError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{registerError}</p>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (registerPassword !== registerConfirmPassword) {
                    setRegisterError(lang === "tr" ? "Şifreler uyuşmuyor!" : "Passwords do not match!");
                    return;
                  }
                  if (registerPassword.length < 6) {
                    setRegisterError(lang === "tr" ? "Şifreniz en az 6 karakterden oluşmalıdır." : "Password must be at least 6 characters.");
                    return;
                  }
                  const exists = adminUsers.some(u => u.email.toLowerCase() === registerEmail.trim().toLowerCase());
                  if (exists) {
                    setRegisterError(lang === "tr" ? "Bu e-posta adresi zaten kullanımda!" : "This email address is already in use!");
                    return;
                  }
                  
                  // Generate OTP Code
                  const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                  setRegisterSentOtp(generatedCode);

                  // Send Simulated Email
                  try {
                    await fetch("/api/send-simulated-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: registerEmail.trim(),
                        subject: lang === "tr" ? "Vadi İlan - E-posta Onay Kodu" : "Vadi Ilan - Email Verification Code",
                        body: lang === "tr" 
                          ? `Sayın ${registerName},\n\nVadi İlan platformuna kayıt işleminizi tamamlamak için e-posta doğrulama kodunuz:\n\n👉 ${generatedCode}\n\nBu kodu kayıt ekranındaki kutucuğa girerek üyeliğinizi onaylayabilirsiniz.\n\nİyi günler dileriz.` 
                          : `Dear ${registerName},\n\nYour email verification code to complete sign up is:\n\n👉 ${generatedCode}\n\nPlease enter this code on the registration page.\n\nBest regards.`
                      })
                    });
                  } catch (err) {
                    console.error(err);
                  }

                  setRegisterStep("verify");
                  setRegisterError(null);
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Ad Soyad" : "Full Name"}</label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      placeholder={lang === "tr" ? "Örn: Mehmet Can" : "e.g. John Doe"}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "E-posta Adresi" : "Email Address"}</label>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      placeholder="mehmet@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Cep Telefonu" : "Mobile Phone"}</label>
                    <input
                      type="tel"
                      required
                      value={registerPhone}
                      onChange={e => setRegisterPhone(e.target.value)}
                      placeholder="+905551234567"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Şifre" : "Password"}</label>
                      <input
                        type="password"
                        required
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Şifre Tekrar" : "Confirm Password"}</label>
                      <input
                        type="password"
                        required
                        value={registerConfirmPassword}
                        onChange={e => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    {lang === "tr" ? "Devam Et (E-posta Onayla)" : "Continue (Verify Email)"}
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-400 pt-4 border-t border-neutral-800">
                  <span>{lang === "tr" ? "Zaten üye misiniz?" : "Already registered?"} </span>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, "", "/login");
                      setCurrentPage("login");
                      setRegisterError(null);
                    }}
                    className="text-amber-500 hover:underline font-bold"
                  >
                    {lang === "tr" ? "Giriş Yapın" : "Sign In"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-100">
                    {lang === "tr" ? "E-posta Doğrulama Kodu" : "Verify Your Email"}
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-normal">
                    {lang === "tr" 
                      ? `Doğrulama kodu ${registerEmail} adresine gönderildi. Lütfen gelen kutunuzu (ekranın altındaki simüle e-posta günlüğünü) kontrol edin.` 
                      : `A verification code was dispatched to ${registerEmail}. (Trapped emails can be viewed in Sim Inbox at bottom of screen!)`}
                  </p>
                </div>

                {registerError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{registerError}</p>
                  </div>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (registerVerifyCode !== registerSentOtp) {
                    setRegisterError(lang === "tr" ? "Hatalı doğrulama kodu! Lütfen tekrar deneyin." : "Incorrect confirmation code. Please check Sim Inbox below.");
                    return;
                  }

                  // Verification Success
                  const newUser: UserType = {
                    id: "user_" + Math.random().toString(36).substring(2, 9),
                    name: registerName,
                    email: registerEmail.trim(),
                    phone: registerPhone || "+905550001122",
                    status: UserStatus.Email_Verified,
                    emailVerifiedAt: new Date().toISOString(),
                    phoneVerifiedAt: null,
                    oneSignalPlayerId: null,
                    oneSignalExternalId: null,
                    password: registerPassword
                  };

                  // Sync with backend
                  fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: newUser })
                  }).catch(err => console.error("Error creating user during register:", err));

                  setAdminUsers(prev => [...prev, newUser]);
                  setUser(newUser);

                  // Send Welcome Email
                  try {
                    fetch("/api/send-simulated-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: registerEmail.trim(),
                        subject: lang === "tr" ? "Vadi İlan'a Hoş Geldiniz!" : "Welcome to Vadi Ilan!",
                        body: lang === "tr"
                          ? `Merhaba ${registerName},\n\nHesabınız başarıyla doğrulandı ve üyeliğiniz aktifleştirildi.\n\nArtık ilan akışımızı gezebilir ve güvenli satıcı ayrıcalıklarından faydalanabilirsiniz.\n\nKeyifli alışverişler dileriz.`
                          : `Hello ${registerName},\n\nYour email has been verified successfully and your account is now active.\n\nBest regards.`
                      })
                    });
                  } catch (err) { console.error(err); }

                  window.history.pushState(null, "", "/");
                  setCurrentPage("main");
                  setToastNotification({
                    title: lang === "tr" ? "Üyelik Aktif" : "Account Active",
                    message: lang === "tr" ? "E-posta adresiniz başarıyla onaylandı ve hesabınız açıldı." : "Email verification validated. Your account is fully active.",
                    type: "success"
                  });

                  // Clear Form
                  setRegisterName("");
                  setRegisterEmail("");
                  setRegisterPhone("");
                  setRegisterPassword("");
                  setRegisterConfirmPassword("");
                  setRegisterStep("form");
                  setRegisterVerifyCode("");
                }} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <label className="text-xs font-bold text-zinc-300 block mb-2">{lang === "tr" ? "6 Haneli Doğrulama Kodu" : "6-Digit Verification Code"}</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={registerVerifyCode}
                      onChange={e => setRegisterVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="w-40 mx-auto tracking-[0.5em] text-center font-mono font-bold bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-lg text-amber-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    {lang === "tr" ? "Kayıt İşlemini Tamamla" : "Complete Registration"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep("form");
                      setRegisterError(null);
                    }}
                    className="w-full bg-transparent hover:bg-neutral-800/20 text-zinc-400 font-bold py-2 rounded-xl text-center text-xs transition-all"
                  >
                    {lang === "tr" ? "Geri Dön" : "Back to Form"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : currentPage === "forgot-password" ? (
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-16 flex items-center justify-center min-h-[70vh] animate-fade-in">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
            
            {forgotStep === "email" ? (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                    <KeyRound className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                    {lang === "tr" ? "Şifremi Unuttum" : "Forgot Password"}
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {lang === "tr" ? "Kayıtlı e-posta adresinizi girin. Size bir şifre sıfırlama kodu göndereceğiz." : "Enter your email address and we'll send a password recovery code."}
                  </p>
                </div>

                {forgotError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{forgotError}</p>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const target = adminUsers.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
                  if (!target) {
                    setForgotError(lang === "tr" ? "Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı." : "No user registered with this email address.");
                    return;
                  }

                  // Generate OTP code
                  const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                  setForgotOtp(generatedCode);

                  // Send Simulated Email
                  try {
                    await fetch("/api/send-simulated-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: forgotEmail.trim(),
                        subject: lang === "tr" ? "Vadi İlan - Şifre Sıfırlama Kodu" : "Vadi Ilan - Password Reset Code",
                        body: lang === "tr"
                          ? `Merhaba ${target.name},\n\nHesap şifrenizi sıfırlamak için doğrulama kodunuz:\n\n👉 ${generatedCode}\n\nBu kodu sıfırlama ekranına girerek yeni şifrenizi tanımlayabilirsiniz.`
                          : `Hello ${target.name},\n\nYour password reset verification code is:\n\n👉 ${generatedCode}`
                      })
                    });
                  } catch (err) { console.error(err); }

                  setForgotStep("reset");
                  setForgotError(null);
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "E-posta Adresi" : "Email Address"}</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="ornek@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    {lang === "tr" ? "Şifre Sıfırlama Kodu Gönder" : "Send Recovery Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, "", "/login");
                      setCurrentPage("login");
                      setForgotError(null);
                    }}
                    className="w-full bg-transparent hover:bg-neutral-800/20 text-zinc-400 font-bold py-2 rounded-xl text-center text-xs transition-all"
                  >
                    {lang === "tr" ? "Giriş Ekranına Dön" : "Back to Sign In"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                    <CheckCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                    {lang === "tr" ? "Şifrenizi Sıfırlayın" : "Reset Your Password"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {lang === "tr" ? "Onay kodunu ve yeni şifrenizi girin." : "Enter confirmation code and set your new password."}
                  </p>
                </div>

                {forgotError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{forgotError}</p>
                  </div>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotInputOtp !== forgotOtp) {
                    setForgotError(lang === "tr" ? "Hatalı doğrulama kodu! Lütfen simüle e-posta kutunuzu kontrol edin." : "Incorrect recovery code. Check simulated inbox.");
                    return;
                  }
                  if (forgotNewPassword.length < 6) {
                    setForgotError(lang === "tr" ? "Yeni şifre en az 6 karakterden oluşmalıdır." : "New password must be at least 6 characters.");
                    return;
                  }
                  if (forgotNewPassword !== forgotConfirmPassword) {
                    setForgotError(lang === "tr" ? "Girdiğiniz şifreler uyuşmuyor!" : "Passwords do not match!");
                    return;
                  }

                  // Update simulated database password for all matching emails
                  setAdminUsers(prev => prev.map(u => {
                    if (u.email.toLowerCase() === forgotEmail.trim().toLowerCase()) {
                      const updated = { ...u, password: forgotNewPassword };
                      
                      // Sync with backend
                      fetch(`/api/users/${u.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user: updated })
                      }).catch(err => console.error("Error updating user password:", err));

                      return updated;
                    }
                    return u;
                  }));

                  setToastNotification({
                    title: lang === "tr" ? "Şifre Değiştirildi" : "Password Restored",
                    message: lang === "tr" ? "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz." : "Your account password was updated successfully. Please sign in.",
                    type: "success"
                  });

                  // Clear Form and Route
                  setForgotEmail("");
                  setForgotNewPassword("");
                  setForgotConfirmPassword("");
                  setForgotInputOtp("");
                  setForgotStep("email");
                  window.history.pushState(null, "", "/login");
                  setCurrentPage("login");
                  setForgotError(null);
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Onay Kodu" : "Verification Code"}</label>
                    <input
                      type="text"
                      required
                      value={forgotInputOtp}
                      onChange={e => setForgotInputOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest text-base font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Yeni Şifre" : "New Password"}</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">{lang === "tr" ? "Yeni Şifre Tekrar" : "Confirm New Password"}</label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    {lang === "tr" ? "Şifremi Sıfırla" : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("email");
                      setForgotError(null);
                    }}
                    className="w-full bg-transparent hover:bg-neutral-800/20 text-zinc-400 font-bold py-2 rounded-xl text-center text-xs transition-all"
                  >
                    {lang === "tr" ? "Geri Dön" : "Go Back"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : currentPage === "map-fullscreen" ? (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col w-screen h-screen overflow-hidden">
          {/* Header Bar */}
          <div className="bg-neutral-900 border-b border-neutral-850 h-16 px-4 md:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.history.pushState(null, "", "/");
                  window.dispatchEvent(new Event("popstate"));
                }}
                className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === "tr" ? "Geri Dön" : "Back"}</span>
              </button>
              <div className="h-4 w-px bg-neutral-800" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                  {new URLSearchParams(window.location.search).get("title") || (lang === "tr" ? "Müstakil Harita Sayfası" : "Standalone Map Page")}
                </h2>
              </div>
            </div>
            
            {/* Quick action: Close and home */}
            <button
              onClick={() => {
                window.history.pushState(null, "", "/");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Fully Interactive Map Area */}
          <div className="flex-1 w-full relative bg-neutral-950">
            <InteractiveMap
              lat={parseFloat(new URLSearchParams(window.location.search).get("lat") || "41.0082")}
              lng={parseFloat(new URLSearchParams(window.location.search).get("lng") || "28.9784")}
              title={new URLSearchParams(window.location.search).get("title") || "Emlak"}
              lang={lang}
            />
          </div>
        </div>
      ) : (
        <>
          {/* HERO HERO SECTION */}
          <section className="bg-neutral-950 border-b border-neutral-900 py-7 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.06),transparent_40%)] animate-pulse duration-[8000ms]" />
            <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch items-center">
                
                {/* Left Column (1/3 width: lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-5 text-left flex flex-col justify-center items-start">
                  
                  <h2 className="text-2xl lg:text-3xl font-serif font-medium text-white tracking-tight leading-tight">
                    {lang === "tr" ? "Güvenli ve Akıllı İlan Dünyasını Keşfedin" : "Discover Safe & Smart Premium Classifieds"}
                  </h2>
                  
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    {lang === "tr" 
                      ? "Çift onaylı güvenli üyelik altyapısı, imla hatalarını tolere eden fuzzy arama motoru ve yapay zekayla tasarlanan dinamik kategori özellikleri tek bir platformda."
                      : "Featuring multi-channel secure registration, robust typo-tolerant fuzzy indexing, and generative dynamic category models in an elite modern visual standard."}
                  </p>

                  {/* "Ücretsiz İlan Ver" Button */}
                  <button
                    onClick={() => {
                      const statusUpper = (user.status || "").toUpperCase();
                      const isAdmin = user.role === "admin";
                      const isFullyVerified = statusUpper === "FULLY_VERIFIED" || 
                                              statusUpper === "FULLY_APPROVED" || 
                                              statusUpper === "FULLY_VERIFIED_STATUS" ||
                                              statusUpper === "EMAIL_VERIFIED";
                      
                      if (!isAdmin && !isFullyVerified) {
                        setToastNotification({
                          title: lang === "tr" ? "Üyelik Doğrulaması Gerekli" : "Auth Required",
                          message: lang === "tr" ? "Lütfen ilan ekleyebilmek için önce hesabınızı doğrulayın." : "Please verify your email/SMS phone first to unlock posting privileges.",
                          type: "warning"
                        });
                        setShowAuthModal(true);
                      } else {
                        resetNewListingForm();
                        setShowAddListingModal(true);
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "tr" ? "Ücretsiz İlan Ver" : "Post Free Ad"}</span>
                  </button>
                  
                  {/* Fuzzy tolerant correction trace feedback */}
                  {searchQuery && (
                    <div className="inline-flex items-center gap-2 bg-neutral-900/60 border border-neutral-800/80 px-4 py-2 rounded-xl text-[10px] font-mono text-zinc-400 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-amber-500 font-semibold">Fuzzy Tolerant Matcher:</span>
                      <span>{lang === "tr" ? "İmla hataları tolere edilerek en yakın sonuçlar listeleniyor." : "Typo constraints corrected dynamically."}</span>
                    </div>
                  )}
                </div>

                {/* Right Column (2/3 width: lg:col-span-8) - Advertisement Display Area with Dynamic Slider */}
                <div className="lg:col-span-8 flex items-stretch">
                  <div className="relative w-full min-h-[300px] lg:min-h-0 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/30 p-1 group flex flex-col justify-between w-full">
                    {activeAds.length > 0 ? (
                      <div className="relative w-full h-full min-h-[280px] flex items-stretch rounded-2xl overflow-hidden select-none w-full">
                        <AnimatePresence mode="wait">
                          {activeAds.map((ad, idx) => {
                            if (idx !== activeAdIndex) return null;
                            return (
                              <motion.div
                                key={ad.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => handleAdClick(ad)}
                                className="absolute inset-0 flex flex-col justify-between p-6 lg:p-8 cursor-pointer rounded-2xl overflow-hidden group/ad w-full h-full"
                              >
                                {/* Background Image or Gradient */}
                                {ad.imageUrl ? (
                                  <>
                                    <img 
                                      src={ad.imageUrl} 
                                      alt={ad.title} 
                                      className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover/ad:scale-[1.02]"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/20 pointer-events-none rounded-2xl" />
                                  </>
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-neutral-950 to-neutral-950 rounded-2xl border border-neutral-800/50" />
                                )}

                                {/* Content Overlay */}
                                <div className="relative z-10 flex flex-col justify-end h-full w-full">
                                  {/* Bottom Row: Text & Action */}
                                  <div className="space-y-3 mt-auto max-w-lg">
                                    <h3 className="text-lg lg:text-xl font-bold text-white tracking-tight leading-snug group-hover/ad:text-amber-400 transition-colors">
                                      {ad.title}
                                    </h3>
                                    <p className="text-xs text-zinc-400 line-clamp-2">
                                      {ad.description}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold font-mono pt-1">
                                      <span>{lang === "tr" ? "Detayları Keşfet" : "Explore Details"}</span>
                                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/ad:translate-x-1" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>

                        {/* Slide Navigation Controls */}
                        {activeAds.length > 1 && (
                          <>
                            {/* Previous Slide Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAdIndex(prev => (prev - 1 + activeAds.length) % activeAds.length);
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-neutral-800 text-white hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                            >
                              ‹
                            </button>
                            {/* Next Slide Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAdIndex(prev => (prev + 1) % activeAds.length);
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-neutral-800 text-white hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                            >
                              ›
                            </button>

                            {/* Dots Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                              {activeAds.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAdIndex(idx);
                                  }}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    idx === activeAdIndex 
                                      ? "bg-amber-500 w-3" 
                                      : "bg-zinc-600 hover:bg-zinc-400"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Fallback Mockup Image */
                      <div className="relative w-full h-full min-h-[280px] flex items-stretch rounded-2xl overflow-hidden w-full">
                        <img 
                          src={heroImage} 
                          alt="AçıkBazar Mockup" 
                          className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* MAIN BENTO GRID DASHBOARD */}
          <main className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-8 space-y-8 font-sans">
            
            {/* Search & Smart Filtering Hub (Top full-width Box) */}
            <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.03),transparent_50%)]" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                    {lang === "tr" ? "Arama & Filtreleme" : "Search & Filter Hub"}
                  </h3>
                  <span className="text-[9px] font-mono text-zinc-500 bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-800/40">Fuzzy Search Active</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-serif font-medium text-white tracking-tight leading-snug">
                  {lang === "tr" ? "Aradığınız Prestijli Yaşamı Filtreleyin" : "Filter Your Desired Prestigious Living"}
                </h2>
                <p className="text-xs text-zinc-500 max-w-xl">
                  {lang === "tr" 
                    ? "Gelişmiş akıllı fiyat aralığı filtreleri ve imla hatalarını otomatik tolere eden endeksleyicimiz ile kusursuz eşleşmeye ulaşın."
                    : "Find premium listings instantly with automatic typo matching and advanced pricing criteria."}
                </p>
              </div>

              {/* Smart Search Panel */}
              <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === "tr" ? "Emlak, vasıta ara... (Örn: 'daere', 'ifone', 'volksvagen')" : "Search real estate... (e.g., 'daere', 'ifone')"}
                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-2xl pl-11 pr-10 py-3 text-xs text-white focus:outline-none placeholder-zinc-500 font-sans transition-all focus:border-neutral-700"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 text-zinc-500 hover:text-zinc-300">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Min-Max inputs inside Bento Box */}
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800/80 px-4 py-2.5 rounded-2xl shrink-0">
                  <input 
                    type="number"
                    placeholder={queryCurrency === "original" ? (lang === "tr" ? "Min" : "Min") : `Min ${queryCurrency}`}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-16 bg-transparent text-xs text-amber-500 focus:outline-none placeholder-zinc-600 font-mono font-medium"
                  />
                  <span className="text-zinc-700 font-mono text-[10px]">-</span>
                  <input 
                    type="number"
                    placeholder={queryCurrency === "original" ? (lang === "tr" ? "Max" : "Max") : `Max ${queryCurrency}`}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-16 bg-transparent text-xs text-amber-500 focus:outline-none placeholder-zinc-600 font-mono font-medium"
                  />
                </div>

                {/* Query Currency Selector */}
                <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800/80 px-3 py-2.5 rounded-2xl shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{lang === "tr" ? "BİRİM:" : "CURR:"}</span>
                  <select
                    value={queryCurrency}
                    onChange={e => setQueryCurrency(e.target.value as any)}
                    className="bg-transparent text-xs text-white focus:outline-none font-mono font-semibold cursor-pointer select-none"
                  >
                    <option value="original" className="bg-neutral-950 text-white">{lang === "tr" ? "Hepsi" : "All/Orig"}</option>
                    <option value="TL" className="bg-neutral-950 text-white">TL (₺)</option>
                    <option value="USD" className="bg-neutral-950 text-white">USD ($)</option>
                    <option value="GBP" className="bg-neutral-950 text-white">GBP (£)</option>
                  </select>
                </div>

                {/* Featured star toggle */}
                <button
                  onClick={() => setFeaturedFilter(!featuredFilter)}
                  className={`px-4 py-3 text-xs font-semibold rounded-2xl transition-all flex items-center justify-center gap-1.5 shrink-0 border ${
                    featuredFilter 
                      ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10" 
                      : "bg-neutral-950 text-zinc-300 border-neutral-850 hover:bg-neutral-900"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${featuredFilter ? "fill-black" : ""}`} />
                  <span>{lang === "tr" ? "Yıldızlı" : "Sponsored"}</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Category + Exclusive Listings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Category Navigator Hub (spans 3 cols on large screens, vertical stack) */}
              <div className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl flex flex-col justify-between space-y-5 relative overflow-hidden group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest uppercase">
                      {lang === "tr" ? "KATEGORİ MERKEZİ" : "TAXONOMY REPOSITORY"}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {categories.filter(c => c.parentId === null).length} {lang === "tr" ? "Sektör" : "Roots"}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-medium text-white tracking-tight leading-snug">
                    {lang === "tr" ? "Prestijli Koleksiyonlar" : "Exclusive Taxonomies"}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {lang === "tr" ? "Yapay zekanın tasarladığı esnek niteliklerle donatılmış ürün grupları." : "Elite real estate, prestige automotive, and rare electronics."}
                  </p>

                  {/* Category selector list - beautifully laid out in a single vertical column for side-by-side design */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      onClick={() => setSelectedCatFilter("")}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border flex items-center justify-between ${
                        selectedCatFilter === "" 
                          ? "bg-amber-500 text-black border-amber-500 font-semibold" 
                          : "bg-neutral-950 text-zinc-400 border-neutral-800/80 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{lang === "tr" ? "Tüm İlanlar" : "All Classifieds"}</span>
                      </div>
                      <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full ${selectedCatFilter === "" ? "bg-black/10 text-black" : "bg-neutral-900 text-zinc-500"}`}>
                        {listings.filter(l => user?.role === "admin" || !l.status || l.status === "approved" || l.userId === user?.id).length}
                      </span>
                    </button>

                    {/* Recursive Drill-Down Tree Renderer */}
                    <CategoryTree
                      parentId={null}
                      categories={categories}
                      expandedCategories={expandedCategories}
                      setExpandedCategories={setExpandedCategories}
                      selectedCatFilter={selectedCatFilter}
                      setSelectedCatFilter={setSelectedCatFilter}
                      getListingCountForCategory={getListingCountForCategory}
                      lang={lang}
                    />
                  </div>
                </div>


              </div>

              {/* Right Column: Exclusive Portfolio Feed (seçkin kısmı) - displays ONLY featured (dopingli) listings */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                
                {/* Header Info */}
                <div className="flex justify-between items-center pb-2 border-b border-neutral-900/40">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "tr" ? "SEÇKİN PORTFÖY AKIŞI" : "EXCLUSIVE PORTFOLIO FEED"}
                    </span>
                    <span className="text-[10px] bg-neutral-900 px-2.5 py-1 rounded-full text-zinc-400 font-mono font-bold border border-neutral-800/40">
                      {searchedListings.filter(ad => ad.featured).length} {lang === "tr" ? "İlan" : "Matches"}
                    </span>
                  </div>
                </div>

                {/* SPACIOUS CLASSIFIED STREAM CONTAINER with beautiful scale entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <AnimatePresence mode="popLayout">
                    {searchedListings.filter(ad => ad.featured).map((ad, idx) => (
                      <motion.div
                        key={ad.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                        onMouseEnter={() => setHoveredListingId(ad.id)}
                        onMouseLeave={() => setHoveredListingId(null)}
                        onClick={() => setSelectedListing(ad)}
                        className={`group relative bg-neutral-900/40 border border-neutral-900/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer h-full hover:border-neutral-850 hover:bg-neutral-900/80 shadow-sm ${
                          ad.featured ? "ring-1 ring-amber-500/20 shadow-amber-500/2" : ""
                        }`}
                      >
                        {/* Primary Photo thumbnail with zoom on hover - height reduced by 20% (aspect ratio widened from 5/3 to 2.1/1) */}
                        <div className="w-full aspect-[2.1/1] bg-neutral-950 border-b border-neutral-900 relative overflow-hidden shrink-0">
                          <img src={ad.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                          
                          {/* Yıldızlı Badge */}
                          {ad.featured && (
                            <span className="absolute top-3 left-3 bg-amber-500 text-black text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 font-mono tracking-wider shadow shadow-amber-500/20">
                              <Star className="w-2 h-2 fill-black" />
                              <span>YILDIZLI</span>
                            </span>
                          )}

                          {/* Photo quantity tag */}
                          <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300">
                            📷 {ad.images?.length || 0}
                          </div>

                          {/* Status Indicator for Owner's Pending/Rejected Ads */}
                          {ad.status && ad.status !== "approved" && (
                            <span className="absolute top-3 right-3 bg-neutral-950/90 border border-neutral-800 text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 text-amber-500 font-mono shadow-sm">
                              <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                              <span>{ad.status === "pending" ? (lang === "tr" ? "Onayda" : "Review") : (lang === "tr" ? "Red" : "Rejected")}</span>
                            </span>
                          )}
                        </div>

                        {/* Listing Info Card content with Playfair display title - padding, spacing & description line-clamp reduced to reduce card height by 20% */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                              <span>
                                {(() => {
                                  const cat = categories.find(c => c.id === ad.categoryId);
                                  return cat ? (lang === "tr" ? cat.nameTr : cat.nameEn) : "";
                                })()}
                              </span>
                              <span>{(ad.createdAt || "").slice(0, 10)}</span>
                            </div>
                            
                            <h3 className="text-xs font-serif font-semibold text-white tracking-tight leading-snug group-hover:text-amber-500 transition-colors duration-200 line-clamp-1">
                              {ad.title}
                            </h3>
                            
                            <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
                              {ad.description}
                            </p>
                          </div>

                          {/* Attributes & Price Footer */}
                          <div className="pt-2 border-t border-neutral-900/50 flex items-center justify-between gap-2">
                            <span className="text-sm font-mono font-bold text-amber-500 tracking-tight">
                              {renderPriceElement(ad, "text-sm font-mono font-bold text-amber-500 tracking-tight")}
                            </span>
                            
                            {/* Compact Badge displaying critical attributes in JetBrains Mono */}
                            <div className="flex items-center gap-1.5 max-w-[60%] overflow-hidden">
                              {Object.entries(ad.attributes || {}).slice(0, 1).map(([k, v]) => {
                                let disp = String(v);
                                if (k === "model" && disp.includes(":")) {
                                  disp = disp.substring(disp.indexOf(":") + 1);
                                }
                                return (
                                  <span key={k} className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800/80 text-[9px] font-mono text-zinc-500 max-w-full truncate">
                                    {disp}
                                  </span>
                                );
                              })}
                              <span className="text-[9.5px] text-zinc-400 font-mono bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800/80 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-amber-500" />
                                {((ad.location?.address || "İstanbul").split(",")[0] || "").slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* EMPTY STATE RESULTS CHECK */}
                {searchedListings.filter(ad => ad.featured).length === 0 && (
                  <div className="border border-dashed border-neutral-800 rounded-3xl py-16 text-center text-zinc-500 bg-neutral-900/10">
                    <AlertTriangle className="w-8 h-8 mx-auto text-zinc-600 mb-2 animate-bounce" />
                    <h4 className="font-bold text-sm text-zinc-400">{lang === "tr" ? "Yıldızlı İlan Bulunamadı" : "No Featured Matches"}</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto px-4">
                      {lang === "tr" 
                        ? "Aradığınız kriterlere uygun yıldızlı (öne çıkarılmış) bir ilan kaydı eşleşmedi."
                        : "We couldn't resolve any featured/sponsored listings with your active search queries."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Listings Section with Side-by-Side Filters & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Dynamic Category Attributes Filter */}
              <div className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl flex flex-col justify-between space-y-5 relative overflow-hidden group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      {lang === "tr" ? "ÖZELLİK FİLTRESİ" : "ATTRIBUTE FILTER"}
                    </h3>
                    {Object.keys(selectedAttributesFilter).length > 0 && (
                      <button
                        onClick={() => setSelectedAttributesFilter({})}
                        className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>{lang === "tr" ? "TEMİZLE" : "CLEAR"}</span>
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-serif font-medium text-white tracking-tight leading-snug">
                    {(() => {
                      const cat = categories.find(c => c.id === selectedCatFilter || c.slug === selectedCatFilter);
                      return cat ? (lang === "tr" ? cat.nameTr : cat.nameEn) : (lang === "tr" ? "Seçilen Kategori" : "Selected Category");
                    })()}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {lang === "tr" ? "Kategoriye ait dinamik özelliklerle aramayı detaylandırın." : "Detail your search with category-specific traits."}
                  </p>

                  <div className="border-t border-neutral-800/60 my-3" />

                  {selectedCatFilter ? (
                    (() => {
                      const activeAttributes = getCategoryAttributesRecursively(selectedCatFilter);
                      if (activeAttributes.length === 0) {
                        return (
                          <div className="text-center py-6 text-zinc-500 space-y-2">
                            <Info className="w-5 h-5 mx-auto text-zinc-600" />
                            <p className="text-xs text-zinc-400">
                              {lang === "tr" ? "Bu kategoriye ait özel nitelik tanımlanmamıştır." : "No specific traits found for this category."}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-4">
                          {activeAttributes.map(attr => {
                            const label = lang === "tr" ? attr.label_tr : attr.label_en;
                            const value = selectedAttributesFilter[attr.key] || "";
                            return (
                              <div key={attr.key} className="space-y-1.5 text-left">
                                <label className="text-[10px] text-zinc-400 font-mono block mb-1 uppercase tracking-wider">
                                  {label}
                                </label>
                                {attr.type === "select" ? (
                                  (() => {
                                    let optionsToRender = attr.options || [];
                                    if (attr.key === "model") {
                                      const selectedMarka = selectedAttributesFilter["marka"];
                                      if (selectedMarka) {
                                        optionsToRender = optionsToRender.filter(opt => opt.startsWith(`${selectedMarka}:`));
                                      } else {
                                        optionsToRender = [];
                                      }
                                    }
                                    return (
                                      <select
                                        value={value}
                                        onChange={e => {
                                          setSelectedAttributesFilter(prev => {
                                            const copy = {
                                              ...prev,
                                              [attr.key]: e.target.value
                                            };
                                            if (attr.key === "marka") {
                                              delete copy["model"]; // Clear model filter when brand changes
                                            }
                                            return copy;
                                          });
                                        }}
                                        disabled={attr.key === "model" && !selectedAttributesFilter["marka"]}
                                        className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 font-sans cursor-pointer disabled:opacity-50"
                                      >
                                        <option value="" className="bg-neutral-950 text-zinc-500">
                                          {attr.key === "model" && !selectedAttributesFilter["marka"]
                                            ? (lang === "tr" ? "Önce Marka Seçiniz" : "Select Brand First")
                                            : (lang === "tr" ? "Tümü" : "All")}
                                        </option>
                                        {optionsToRender.map(opt => {
                                          const displayLabel = opt.includes(":") ? opt.substring(opt.indexOf(":") + 1) : opt;
                                          return (
                                            <option key={opt} value={opt} className="bg-neutral-950 text-white">
                                              {displayLabel}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    );
                                  })()
                                ) : attr.type === "number" ? (
                                  <input
                                    type="number"
                                    value={value}
                                    onChange={e => setSelectedAttributesFilter(prev => ({
                                      ...prev,
                                      [attr.key]: e.target.value
                                    }))}
                                    placeholder={lang === "tr" ? "Örn: 100" : "e.g. 100"}
                                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 font-mono"
                                  />
                                ) : attr.type === "boolean" ? (
                                  <select
                                    value={value}
                                    onChange={e => setSelectedAttributesFilter(prev => ({
                                      ...prev,
                                      [attr.key]: e.target.value
                                    }))}
                                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 font-sans cursor-pointer"
                                  >
                                    <option value="" className="bg-neutral-950 text-zinc-500">
                                      {lang === "tr" ? "Tümü" : "All"}
                                    </option>
                                    <option value="true" className="bg-neutral-950 text-white">
                                      {lang === "tr" ? "Evet / Var" : "Yes"}
                                    </option>
                                    <option value="false" className="bg-neutral-950 text-white">
                                      {lang === "tr" ? "Hayır / Yok" : "No"}
                                    </option>
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={value}
                                    onChange={e => setSelectedAttributesFilter(prev => ({
                                      ...prev,
                                      [attr.key]: e.target.value
                                    }))}
                                    placeholder={lang === "tr" ? "Değer girin..." : "Enter value..."}
                                    className="w-full bg-neutral-950 border border-neutral-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 font-sans"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-10 text-zinc-500 space-y-3">
                      <Sliders className="w-6 h-6 mx-auto text-zinc-700 animate-pulse" />
                      <p className="text-xs px-2 leading-relaxed text-zinc-500">
                        {lang === "tr" 
                          ? "Özellik filtrelerini aktifleştirmek için yukarıdan bir kategori seçin." 
                          : "Please select a category above to load dynamic attribute filters."}
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Listings Directory Table */}
              <div className="lg:col-span-9 bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl space-y-6 relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {lang === "tr" ? "TÜM PORTFÖY AKIŞI" : "ALL PORTFOLIO FEED"}
                  </h3>
                  <h2 className="text-xl font-serif font-medium text-white tracking-tight">
                    {lang === "tr" ? "İlanlar" : "Exclusive Listing Directory"}
                  </h2>
                </div>
                <div className="text-[10px] bg-neutral-950 px-2.5 py-1 rounded-full text-zinc-400 font-mono border border-neutral-800/60 self-start sm:self-auto">
                  {getSortedStandardListings().length} {lang === "tr" ? "İlan Bulundu" : "Adverts Found"}
                </div>
              </div>

              {/* Table / List View */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-neutral-800/80">
                    <tr>
                      <th className="py-3 px-3 cursor-pointer select-none hover:text-amber-500 transition-colors" onClick={() => handleSortNormal("title")}>
                        <div className="flex items-center gap-1">
                          <span>{lang === "tr" ? "İLAN / BAŞLIK" : "ADVERT / TITLE"}</span>
                          {normalSortField === "title" ? (
                            normalSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-3 cursor-pointer select-none hover:text-amber-500 transition-colors" onClick={() => handleSortNormal("category")}>
                        <div className="flex items-center gap-1">
                          <span>{lang === "tr" ? "KATEGORİ" : "CATEGORY"}</span>
                          {normalSortField === "category" ? (
                            normalSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-3 cursor-pointer select-none hover:text-amber-500 transition-colors" onClick={() => handleSortNormal("location")}>
                        <div className="flex items-center gap-1">
                          <span>{lang === "tr" ? "KONUM" : "LOCATION"}</span>
                          {normalSortField === "location" ? (
                            normalSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-3 cursor-pointer select-none hover:text-amber-500 transition-colors" onClick={() => handleSortNormal("createdAt")}>
                        <div className="flex items-center gap-1">
                          <span>{lang === "tr" ? "YAYIN TARİHİ" : "PUBLISH DATE"}</span>
                          {normalSortField === "createdAt" ? (
                            normalSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-3 cursor-pointer select-none hover:text-amber-500 transition-colors" onClick={() => handleSortNormal("price")}>
                        <div className="flex items-center gap-1">
                          <span>{lang === "tr" ? "FİYAT" : "PRICE"}</span>
                          {normalSortField === "price" ? (
                            normalSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <AnimatePresence mode="popLayout">
                      {getSortedStandardListings().map((ad, idx) => (
                        <motion.tr
                          key={ad.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                          onClick={() => setSelectedListing(ad)}
                          className="hover:bg-neutral-900/40 cursor-pointer group/row transition-all duration-150"
                        >
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-neutral-950 overflow-hidden border border-neutral-850 shrink-0 relative">
                                <img src={ad.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} alt={ad.title} className="w-full h-full object-cover group-hover/row:scale-105 transition-transform duration-300" />
                                <div className="absolute bottom-0.5 right-0.5 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono text-zinc-400">
                                  📷 {ad.images?.length || 0}
                                </div>
                              </div>
                              <div className="max-w-xs md:max-w-sm lg:max-w-md truncate">
                                <span className="font-semibold text-white group-hover/row:text-amber-500 transition-colors block truncate text-xs sm:text-sm">
                                  {ad.title}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-sans block truncate mt-0.5">
                                  {ad.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="text-[10px] text-zinc-400 font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800/40 font-semibold">
                              {(() => {
                                const cat = categories.find(c => c.id === ad.categoryId);
                                return cat ? (lang === "tr" ? cat.nameTr : cat.nameEn) : ad.categoryId;
                              })()}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="text-zinc-400 text-[11px] font-mono flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {ad.location?.address?.split(",")[0] || "İstanbul"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap font-mono text-zinc-500 text-[10px]">
                            {(ad.createdAt || "").slice(0, 10)}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap font-mono font-bold text-amber-500 text-xs sm:text-sm">
                            {renderPriceElement(ad, "font-mono font-bold text-amber-500 text-xs sm:text-sm")}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* EMPTY STATE RESULTS CHECK */}
              {getSortedStandardListings().length === 0 && (
                <div className="border border-dashed border-neutral-800 rounded-3xl py-12 text-center text-zinc-500 bg-neutral-900/10">
                  <AlertTriangle className="w-7 h-7 mx-auto text-zinc-600 mb-2 animate-bounce" />
                  <h4 className="font-bold text-xs text-zinc-400">{lang === "tr" ? "Standart İlan Bulunamadı" : "No Standard Listings Found"}</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto px-4">
                    {lang === "tr" 
                      ? "Filtreleme kriterlerinize uygun yıldızlı olmayan (standart) bir ilan kaydı bulunamadı."
                      : "No non-featured listings match your search criteria."}
                  </p>
                </div>
              )}
              </div>
            </div>
          </main>

          {/* PREMIUM ANTHRACITE FOOTER FRAME */}
          <footer className="w-full bg-[#111112] border-t border-neutral-900 mt-12 relative z-10 font-sans">
            <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 pt-16 pb-28">
              
              {/* Main Footer Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-neutral-900">
                
                {/* Column 1: Brand Info (Spans 2 cols on lg) */}
                <div className="lg:col-span-2 space-y-6 text-left">
                  <div className="flex items-center gap-3">
                    <Logo className="h-[62px] w-auto" />
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    {lang === "tr"
                      ? "Türkiye'nin en gelişmiş, çift onaylı güvenli üyelik ve akıllı fuzzy arama motoru entegreli yeni nesil ilan ve alışveriş ekosistemi. Güven ve hızın buluştuğu nokta."
                      : "Turkey's most advanced next-generation classifieds and trade ecosystem, powered by two-factor secure authentication and smart typo-tolerant fuzzy indexing."}
                  </p>
                  
                  {/* Security & Verification Certification */}
                  <div className="inline-flex items-center gap-2.5 bg-neutral-950/60 border border-neutral-900 px-4 py-2 rounded-2xl">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-zinc-200 block leading-tight">SSL SECURED TRUST FRAME</span>
                      <span className="text-[9px] text-zinc-400 font-mono">SHA-256 ENCRYPTION CERTIFIED</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Corporate Links */}
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                    {lang === "tr" ? "KURUMSAL" : "CORPORATE"}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-zinc-400 font-sans">
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Hakkımızda" : "About Us"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "İnsan Kaynakları (Kariyer)" : "Careers"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Basın Odası & Görseller" : "Press Kits"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Bize Ulaşın (İletişim)" : "Contact Us"}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Services & Quick Links */}
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                    {lang === "tr" ? "HİZMETLERİMİZ" : "SERVICES"}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-zinc-400 font-sans">
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Yıldızlı Öne Çıkar" : "Promoted (Featured) Ads"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Güvenli Alışveriş Rehberi" : "Secure Trading Guide"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Geliştirici API Sandbox" : "Developer API Sandbox"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "PWA Kurulum Kılavuzu" : "PWA Installation Guide"}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Legal Framework */}
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                    {lang === "tr" ? "YASAL MEVZUAT" : "LEGAL TERMS"}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-zinc-400 font-sans">
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Kullanım Koşulları" : "Terms of Use"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Gizlilik Politikası (KVKK)" : "Privacy & GDPR Policy"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Çerez Politikası" : "Cookie Policy"}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-amber-500 transition-colors">
                        {lang === "tr" ? "Fikri Mülkiyet Bildirimi" : "Intellectual Property"}
                      </a>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Row: Legal Warnings, Copyright, and Social Media Accounts */}
              <div className="pt-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                
                {/* Legal Warning and Content Ownership Text */}
                <div className="space-y-3 max-w-4xl text-left">
                  <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
                    {lang === "tr"
                      ? "AçıkBazar, 5651 sayılı Kanun kapsamında 'Yer Sağlayıcı' konumundadır. Bu platformda kullanıcılar tarafından yayınlanan her türlü ilan içeriğinin, görsel materyalin ve harita konum bilgisinin doğruluğu, güncelliği ve yasal uygunluğu tamamen ilanı veren kullanıcının sorumluluğundadır."
                      : "AçıkBazar acts as a 'Hosting Provider' under Law No. 5651. The accuracy, legality, and validity of all listings, description texts, visual assets, and map coordinates published by users are the sole responsibility of the respective publisher."}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                    {lang === "tr"
                      ? "© 2026 AçıkBazar Teknoloji Anonim Şirketi. Tüm hakları saklıdır. Sitedeki verilerin izinsiz kopyalanması, web scraping yöntemleriyle çekilmesi veya ticari amaçla harici mecralarda işlenmesi kesinlikle yasaktır."
                      : "© 2026 AçıkBazar Technology Joint Stock Company. All rights reserved. Copying, automated web scraping, or commercially processing the application data on external systems is strictly prohibited."}
                  </p>
                </div>

                {/* Social Media Accounts */}
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800/80 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter"
                    className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800/80 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800/80 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800/80 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800/80 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>

              </div>

            </div>
          </footer>
        </>
      )}

      {/* FLOAT DEV TOOLS TOGGLE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 border-t border-neutral-900 z-30 backdrop-blur-md">
        <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Terminal className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{lang === "tr" ? "Mimari ve Geliştirici Paneli" : "Architecture & Dev Panel:"}</span>
            <span className="text-zinc-600 hidden md:inline">PostgreSQL Şeması • API Swagger Sandbox • OneSignal Köprüsü</span>
          </div>
          
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-4 py-1.5 rounded-xl border border-amber-500/20 text-xs font-mono flex items-center gap-2 transition-all"
          >
            <Settings className={`w-4 h-4 ${showDevTools ? "rotate-90" : ""} transition-all duration-300`} />
            <span>{showDevTools ? (lang === "tr" ? "Kapat" : "Hide Details") : (lang === "tr" ? "Teknik Rapor & API Konsolunu Göster" : "Explore Technical Sandbox")}</span>
          </button>
        </div>

        {/* EXPANDED TECHNICAL SANDBOX PANEL */}
        <AnimatePresence>
          {showDevTools && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-neutral-900 bg-neutral-950 overflow-hidden"
            >
              <div className="w-full max-w-none px-4 lg:px-12 xl:px-16 py-8">
                
                {/* Tech internal tabs */}
                <div className="flex border-b border-neutral-900 pb-3 mb-6 gap-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: "docs", label: lang === "tr" ? "1. Teknik Rapor" : "1. Technical Report", icon: FileText },
                    { id: "schema", label: lang === "tr" ? "2. DB Şeması (SQL)" : "2. DB Schema (SQL)", icon: Database },
                    { id: "api", label: lang === "tr" ? "3. API Konsolu" : "3. API Playground", icon: FileCode },
                    { id: "onesignal", label: lang === "tr" ? "4. OneSignal Bridge" : "4. OneSignal Bridge", icon: Bell },
                    { id: "emails", label: lang === "tr" ? "5. E-posta Kutusu" : "5. Email Inbox", icon: Mail },
                    { id: "pwa", label: lang === "tr" ? "6. PWA Denetleyicisi" : "6. PWA Controller", icon: Smartphone }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDevToolsTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                        devToolsTab === tab.id 
                          ? "bg-amber-500 text-black font-bold" 
                          : "bg-neutral-900/60 text-zinc-400 border border-neutral-900 hover:text-white"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub Tab contents */}
                <div className="min-h-[250px] text-zinc-300 text-xs">
                  
                  {/* TAB A: TECHNICAL DOCUMENTATION */}
                  {devToolsTab === "docs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-extrabold text-sm text-white mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-amber-500" />
                          {technicalReport[lang].techStack.title}
                        </h4>
                        <p className="text-zinc-400 mb-4">{technicalReport[lang].techStack.subtitle}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {technicalReport[lang].techStack.items.map((it, i) => (
                            <div key={i} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                              <span className="font-mono text-amber-400 font-bold block">{it.name}</span>
                              <p className="text-[11px] text-zinc-500 mt-1">{it.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          {technicalReport[lang].solutions.title}
                        </h4>
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                          {technicalReport[lang].solutions.items.map((it, i) => (
                            <div key={i} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
                              <span className="font-bold text-white font-mono block mb-1">0{i+1}. {it.title}</span>
                              <p className="text-zinc-400 leading-relaxed text-[11px] whitespace-pre-line">{it.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB B: POSTGRESQL RELATIONAL SCHEMA */}
                  {devToolsTab === "schema" && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-amber-500" />
                            PostgreSQL SQL Schema Design Specifications
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Ucu açık sınırsız kategori ilişkileri (Parent-Child) ve dinamik ilan özellikleri için tasarlanan veri şeması.</p>
                        </div>

                        {/* Link to Admin Panel Categories Management */}
                        <button
                          onClick={() => {
                            setShowDevTools(false);
                            setCurrentPage("admin");
                            setAdminTab("categories");
                            window.history.pushState(null, "", "/admin");
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Yönetim Paneli Kategori Sistemine Git" : "Manage Categories in Admin Panel"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {databaseSchema.map(table => (
                          <div key={table.table} className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
                            <h5 className="font-mono font-bold text-amber-400 text-xs flex items-center gap-1.5 border-b border-neutral-800 pb-2 mb-3">
                              <span>📁 table:</span>
                              <span className="text-white font-extrabold">{table.table}</span>
                            </h5>
                            <p className="text-[11px] text-zinc-500 mb-3">{table.description}</p>
                            <div className="space-y-2">
                              {table.fields.map(f => (
                                <div key={f.name} className="flex justify-between items-start text-[11px] font-mono border-b border-neutral-950/40 pb-1.5">
                                  <div>
                                    <span className="text-zinc-300 font-semibold">{f.name}</span>
                                    <span className="text-zinc-600 ml-1.5">({f.type})</span>
                                  </div>
                                  <span className="text-zinc-500 text-[10px] text-right max-w-[120px] truncate">{f.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB C: SWAGGER PLAYGROUND */}
                  {devToolsTab === "api" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Endpoint selector */}
                      <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-1.5 max-h-[300px] overflow-y-auto">
                        <span className="text-[10px] font-mono text-zinc-500 block mb-2 uppercase">AVAILABLE REST ENDPOINTS</span>
                        {apiEndpointsList.map((ep, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedApiIndex(i);
                              setApiResponseMock(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg text-[11px] transition-all border flex flex-col gap-1 ${
                              selectedApiIndex === i 
                                ? "bg-amber-500/10 border-amber-500/30" 
                                : "bg-neutral-950 border-neutral-900 hover:border-neutral-800"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                ep.method === "POST" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                              }`}>{ep.method}</span>
                              <span className="text-zinc-300 font-bold font-mono truncate">{ep.path}</span>
                            </div>
                            <p className="text-zinc-500 truncate">{lang === "tr" ? ep.descriptionTr : ep.descriptionEn}</p>
                          </button>
                        ))}
                      </div>

                      {/* Right: Code request / response viewer */}
                      <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-green-500/20 text-green-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                              {apiEndpointsList[selectedApiIndex].method}
                            </span>
                            <span className="font-mono text-xs text-zinc-300">{apiEndpointsList[selectedApiIndex].path}</span>
                          </div>
                          
                          <button
                            onClick={runApiTest}
                            disabled={apiLoading}
                            className="bg-green-500 hover:bg-green-400 disabled:bg-neutral-800 text-black px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {apiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            <span>{apiLoading ? "Gönderiliyor..." : "İstek Gönder (Simulate)"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">REQUEST PAYLOAD</span>
                            <pre className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[10px] text-zinc-400 h-[180px] overflow-auto">
                              {JSON.stringify(apiEndpointsList[selectedApiIndex].body, null, 2)}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">SERVER RESPONSE (JSON)</span>
                            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 h-[180px] overflow-auto flex items-center justify-center">
                              {apiResponseMock ? (
                                <pre className="font-mono text-[10px] text-green-400 w-full text-left">
                                  {JSON.stringify(apiResponseMock, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-zinc-600 font-mono text-center">
                                  {lang === "tr" ? "İstek cevabını canlandırmak için 'İstek Gönder' butonuna basın." : "Hit 'Send Request' to output the REST API simulation payload."}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB D: ONESIGNAL REAL TIME DIAGNOSTICS */}
                  {devToolsTab === "onesignal" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Sub Info */}
                      <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">ONESIGNAL PUSH MAPPING SYSTEM</span>
                        <p className="text-zinc-400 leading-relaxed text-[11px]">
                          {lang === "tr" 
                            ? "Kullanıcıların mobil cihazları veya tarayıcıları OneSignal SDK'ya kaydolduğunda bir 'Player ID' oluşturulur. Biz bunu Express api ile kullanıcının veritabanı ID'siyle ('External User ID') ilişkilendirerek hedeflenmiş bildirim göndeririz."
                            : "When devices registers through OneSignal Web SDK, they provide unique Player tokens. Our system maps this as an 'External User ID' targeting specific users."}
                        </p>

                        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[10px] text-zinc-400 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Express User Link ID:</span>
                            <span className="text-white font-bold">{user.id}</span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-zinc-500">OneSignal Player ID:</span>
                            <input 
                              type="text" 
                              value={oneSignalPlayerId}
                              onChange={e => setOneSignalPlayerId(e.target.value)}
                              className="bg-neutral-900 text-amber-400 font-bold px-2 py-0.5 rounded outline-none border border-neutral-800 focus:border-amber-500 text-[10px] w-48"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Subscription Status:</span>
                            <span className={`font-bold ${isPushSubscribed ? "text-green-500 animate-pulse" : "text-red-500"}`}>
                              {isPushSubscribed ? "CONNECTED" : "DISCONNECTED"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleOneSignalRegister}
                          disabled={apiLoading}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isPushSubscribed 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                              : "bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/5"
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                          <span>{isPushSubscribed ? (lang === "tr" ? "OneSignal Eşleştirmesini İptal Et" : "Disconnect OneSignal Token") : (lang === "tr" ? "OneSignal Eşleştirmesini Aktif Et" : "Connect OneSignal Token")}</span>
                        </button>
                      </div>

                      {/* Push dispatch simulators */}
                      <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">TRIGGER DEMO PUSH EVENT PAYLOADS</span>
                        <p className="text-zinc-400 text-[11px]">
                          {lang === "tr" 
                            ? "OneSignal eşleştirmesi aktifse, aşağıdaki düğmeleri kullanarak Express sunucudan bu cihaza giden bildirim akışlarını anında test edebilirsiniz."
                            : "Dispatch custom server events targeting the synced player. Click a scenario below to fire notification payloads."}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            onClick={() => triggerPushDemo("price_drop")}
                            className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-xl text-center space-y-2 group transition-all"
                          >
                            <Star className="w-5 h-5 text-amber-500 mx-auto group-hover:scale-110 transition-all" />
                            <h5 className="font-bold text-[11px]">{lang === "tr" ? "Fiyat Güncellemesi" : "Price Update"}</h5>
                            <span className="text-[9px] text-zinc-500 block">{lang === "tr" ? "Takipteki İlan Değişimi" : "Favorite item drops"}</span>
                          </button>

                          <button
                            onClick={() => triggerPushDemo("chat_message")}
                            className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-xl text-center space-y-2 group transition-all"
                          >
                            <MessageSquare className="w-5 h-5 text-amber-500 mx-auto group-hover:scale-110 transition-all" />
                            <h5 className="font-bold text-[11px]">{lang === "tr" ? "Sohbet Bildirimi" : "Sohbet Bildirimi"}</h5>
                            <span className="text-[9px] text-zinc-500 block">{lang === "tr" ? "Alıcı / Satıcı mesajı" : "Buyer chat requests"}</span>
                          </button>

                          <button
                            onClick={() => triggerPushDemo("admin_alert")}
                            className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 p-4 rounded-xl text-center space-y-2 group transition-all"
                          >
                            <ShieldCheck className="w-5 h-5 text-amber-500 mx-auto group-hover:scale-110 transition-all" />
                            <h5 className="font-bold text-[11px]">{lang === "tr" ? "Sistem Duyurusu" : "System Alert"}</h5>
                            <span className="text-[9px] text-zinc-500 block">{lang === "tr" ? "Admin genel duyurusu" : "General server alerts"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB E: SIMULATED EMAIL INBOX */}
                  {devToolsTab === "emails" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Email Stats & Test Tool */}
                      <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">E-POSTA SİMÜLASYON SİSTEMİ</span>
                        <p className="text-zinc-400 leading-relaxed text-[11px]">
                          {lang === "tr" 
                            ? "Sistem SMTP sunucusu yerine tüm e-posta akışlarını sunucuda simüle eder. Yeni bir ilan girildiğinde yöneticiye, ilan onaylandığında/reddedildiğinde ise ilan sahibine gönderilen anlık e-posta bildirimlerini buradan gerçek zamanlı izleyebilirsiniz."
                            : "Rather than using real SMTP, our backend traps all email dispatches. You can monitor system emails triggered for new listings and status approvals in real-time."}
                        </p>

                        <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{lang === "tr" ? "Toplam E-posta:" : "Total Emails:"}</span>
                          <span className="bg-amber-500/20 text-amber-400 font-mono font-bold text-xs px-2 py-0.5 rounded border border-amber-500/30">
                            {simulatedEmails.length}
                          </span>
                        </div>

                        <button
                          onClick={async () => {
                            try {
                              const emailRes = await fetch("/api/simulated-emails");
                              const emailData = await emailRes.json();
                              if (emailData && emailData.data) {
                                setSimulatedEmails(emailData.data);
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 py-2 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Kutuyu Yenile" : "Refresh Mailbox"}</span>
                        </button>
                      </div>

                      {/* Right: Simulated Emails List */}
                      <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col h-[320px]">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-3">SIMULATED SYSTEM INBOX</span>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                          {simulatedEmails.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                              <Mail className="w-8 h-8 mb-2 opacity-30" />
                              <span className="text-xs font-mono">
                                {lang === "tr" ? "Henüz simüle edilmiş e-posta bildirim günlüğü bulunmuyor." : "No simulated system email dispatches found yet."}
                              </span>
                              <p className="text-[10px] text-zinc-500 max-w-sm mt-1">
                                {lang === "tr" ? "Bir ilan ekleyerek veya onay paneline gidip onay/ret işlemi yaparak ilk bildirimi tetikleyebilirsiniz." : "Post a listing or perform an approve/reject action in admin panel to trigger your first notification."}
                              </p>
                            </div>
                          ) : (
                            simulatedEmails.map(mail => (
                              <div key={mail.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2 hover:border-zinc-700 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-2 text-[10px] text-zinc-400 gap-1 font-mono">
                                  <div className="space-y-0.5">
                                    <div><span className="text-zinc-600">{lang === "tr" ? "Gönderen:" : "From:"}</span> <span className="text-amber-400/90">{mail.from}</span></div>
                                    <div><span className="text-zinc-600">{lang === "tr" ? "Alıcı:" : "To:"}</span> <span className="text-white font-semibold">{mail.to}</span></div>
                                  </div>
                                  <div className="text-zinc-500 text-right">
                                    📅 {new Date(mail.sentAt).toLocaleTimeString("tr-TR")} • {new Date(mail.sentAt).toLocaleDateString("tr-TR")}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                    {mail.subject}
                                  </h4>
                                  <pre className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-950 text-[10px] text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                                    {mail.body}
                                  </pre>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB F: PWA REAL-TIME CONTROL STATION */}
                  {devToolsTab === "pwa" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Interactive PWA Controllers */}
                      <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">PWA INTERACTIVE CONTROLLER</span>
                          <p className="text-zinc-400 text-[11px] leading-relaxed">
                            {lang === "tr" 
                              ? "Uygulama tam uyumlu bir Progressive Web App (PWA) olarak yapılandırılmıştır. Çevrimdışı çalışabilirlik, yüklenebilirlik ve akıllı önbellekleme mekanizmaları etkindir."
                              : "This application is fully structured as a Progressive Web App (PWA) featuring robust offline reliability, native installability, and smart background caching."}
                          </p>
                        </div>

                        {/* Real-time Status Card */}
                        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] space-y-2.5">
                          <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                            <span className="text-zinc-500">{lang === "tr" ? "Servis İşçisi (Service Worker):" : "Service Worker Status:"}</span>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>ACTIVE & RUNNING</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pb-1">
                            <span className="text-zinc-500">{lang === "tr" ? "Kapsam Alanı (Scope):" : "Worker Scope:"}</span>
                            <span className="text-zinc-300">/ (Root Scope)</span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pb-1">
                            <span className="text-zinc-500">{lang === "tr" ? "Önbellek Havuzu:" : "Cache Storage ID:"}</span>
                            <span className="text-amber-500 font-bold">sahibinden-hub-cache-v1</span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pb-1">
                            <span className="text-zinc-500">{lang === "tr" ? "Kurulum Türü:" : "Installation Type:"}</span>
                            <span className="text-zinc-300">W3C Web App Manifest v2</span>
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500">{lang === "tr" ? "Çevrimdışı Durum:" : "Network Connection:"}</span>
                            <span className={`font-bold ${isOfflineMode ? "text-rose-500" : "text-emerald-500"}`}>
                              {isOfflineMode 
                                ? (lang === "tr" ? "SIMULATED OFFLINE" : "SIMULATED OFFLINE") 
                                : (lang === "tr" ? "ONLINE (NORMAL)" : "ONLINE (NORMAL)")
                              }
                            </span>
                          </div>
                        </div>

                        {/* Interactive Offline Sim Trigger */}
                        <div className="bg-neutral-950/40 border border-neutral-900 p-3.5 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-white">{lang === "tr" ? "Çevrimdışı Simülasyonu" : "Offline Simulator"}</h5>
                              <p className="text-[10px] text-zinc-500">{lang === "tr" ? "Servis İşçisi önbellek tepkilerini simüle eder." : "Test cached offline fallback responses."}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsOfflineMode(!isOfflineMode);
                                setToastNotification({
                                  title: !isOfflineMode ? "Offline Mode Active" : "Online Mode Restored",
                                  message: !isOfflineMode 
                                    ? (lang === "tr" ? "İnternet bağlantısı kesildi simülasyonu aktif. Uygulama PWA önbelleğinden çalışıyor!" : "Simulated offline. App is now loading assets entirely from local PWA Cache.")
                                    : (lang === "tr" ? "Bağlantı başarıyla sağlandı. Sunucu istekleri aktif." : "Connected back to live express REST API servers."),
                                  type: !isOfflineMode ? "warning" : "success"
                                });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all ${
                                isOfflineMode 
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30" 
                                  : "bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border-neutral-800"
                              }`}
                            >
                              {isOfflineMode ? "OFFLINE" : "ONLINE"}
                            </button>
                          </div>
                        </div>

                        {/* Install App Prompt Guidance */}
                        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-3">
                          <h5 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-amber-500" />
                            <span>{lang === "tr" ? "PWA Kurulum Rehberi" : "PWA Installation Hub"}</span>
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            {lang === "tr"
                              ? "PWA'mız tüm mobil ve masaüstü işletim sistemlerinde doğrudan ana ekrana 'Yerel Uygulama' olarak kurulabilir."
                              : "Our PWA can be installed as a standalone desktop or mobile application directly on your device."}
                          </p>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-neutral-900 p-2.5 rounded-lg text-center border border-neutral-800">
                              <span className="font-bold text-[10px] text-amber-400 block mb-0.5">Android / Chrome</span>
                              <span className="text-[9px] text-zinc-500">{lang === "tr" ? "Seçenekler > Ana Ekrana Ekle" : "Menu > Add to Home Screen"}</span>
                            </div>
                            <div className="bg-neutral-900 p-2.5 rounded-lg text-center border border-neutral-800">
                              <span className="font-bold text-[10px] text-amber-400 block mb-0.5">iOS / Safari</span>
                              <span className="text-[9px] text-zinc-500">{lang === "tr" ? "Paylaş > Ana Ekrana Ekle" : "Share > Add to Home Screen"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Manifest Visualizer */}
                      <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col h-full space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">WEB APP MANIFEST DESCRIPTOR (JSON)</span>
                          <a 
                            href="/manifest.json" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-amber-500 hover:text-amber-400 text-[10px] font-mono flex items-center gap-1.5 hover:underline"
                          >
                            <span>view live manifest.json</span>
                            <span className="text-xs">→</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Manifest Preview Code */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">CONFIGURATION KEYS</span>
                            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 h-[210px] overflow-auto font-mono text-[9px] text-zinc-400 leading-normal scrollbar-none">
{`{
  "name": "Sahibinden Clone Architecture Hub",
  "short_name": "SahibindenHub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#ffc107",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" },
    { "src": "/icons/icon.svg", "type": "image/svg+xml" }
  ]
}`}
                            </div>
                          </div>

                          {/* App Icons Visualizer */}
                          <div className="space-y-1.5 flex flex-col">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">REGISTERED BRANDED ICONS</span>
                            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex-1 flex flex-col justify-between items-center text-center gap-2">
                              <div className="flex justify-center items-center gap-4 flex-1">
                                <div className="space-y-1">
                                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                                    <img src="/icons/icon.svg" className="w-full h-full object-contain" alt="PWA Icon SVG" />
                                  </div>
                                  <span className="text-[9px] text-zinc-500 font-mono">icon.svg (Vector)</span>
                                </div>

                                <div className="space-y-1">
                                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                                    <img src="/icons/icon-192x192.png" className="w-full h-full object-contain" alt="PWA Icon 192" />
                                  </div>
                                  <span className="text-[9px] text-zinc-500 font-mono">192x192 PNG</span>
                                </div>
                              </div>

                              <div className="border-t border-neutral-900 pt-2.5 w-full">
                                <span className="text-[10px] text-zinc-400 block font-bold mb-1">
                                  {lang === "tr" ? "Güvenli ve SEO Uyumlu Altyapı" : "Secure & SEO-Optimized Frame"}
                                </span>
                                <p className="text-[9px] text-zinc-500 leading-snug">
                                  {lang === "tr"
                                    ? "Manifest ve Servis İşçisi, tam SEO uyumluluğu için meta etiketleri ve dynamic routing motoruyla senkronize çalışır."
                                    : "Linked dynamically alongside SEO schema, meta headers, and express server-side deep link parsers."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 1: DETAILED CLASSIFIED VIEW DRAWERS */}
      <AnimatePresence>
        {selectedListing && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-8">
            
            {/* Click outside backdrop close */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => { setSelectedListing(null); setDetailImageIdx(0); }} />

            {/* Centered Large Vitrin Container */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto z-10"
            >
              {/* Close Button Top Right */}
              <button 
                onClick={() => { setSelectedListing(null); setDetailImageIdx(0); }}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-zinc-400 hover:text-white transition-all border border-neutral-800/80 z-30 shadow-md"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Flex columns wrapper */}
              <div className="flex flex-col lg:flex-row flex-1">
                {/* LEFT COLUMN: GIGANTIC PHOTO VITRIN (60% width) */}
                <div className="lg:w-3/5 bg-neutral-900/10 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-neutral-900">
                  
                  {/* Showcase Header with premium tabs */}
                  <div className="flex items-center justify-between border-b border-neutral-900/40 pb-3">
                    <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-900">
                      <button
                        onClick={() => setDetailActiveTab("photos")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
                          detailActiveTab === "photos"
                            ? "bg-amber-500 text-black shadow-md font-bold"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {lang === "tr" ? "Fotoğraflar" : "Photos"}
                      </button>
                      {getCategoryRootName(selectedListing.categoryId, categories).toLowerCase().includes("emlak") && (
                        <button
                          onClick={() => setDetailActiveTab("map")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                            detailActiveTab === "map"
                              ? "bg-amber-500 text-black shadow-md font-bold"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Map className="w-3.5 h-3.5" />
                          {lang === "tr" ? "Harita" : "Map"}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                      İLAN NO: #99018{selectedListing.id}
                    </span>
                  </div>

                  {detailActiveTab === "photos" ? (
                    <>
                      {/* Devasa Visual Container */}
                      <div className="w-full aspect-[4/3] bg-black rounded-2xl border border-neutral-900 overflow-hidden relative group shadow-inner">
                        <img 
                          src={(selectedListing.images || [])[detailImageIdx] || (selectedListing.images || [])[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} 
                          alt={selectedListing.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                        />
                        
                        {/* Sliding Arrow Controls inside Image */}
                        {(selectedListing.images || []).length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailImageIdx(prev => (prev === 0 ? (selectedListing.images || []).length - 1 : prev - 1));
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-neutral-800 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              ←
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailImageIdx(prev => (prev === (selectedListing.images || []).length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-neutral-800 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              →
                            </button>
                          </>
                        )}

                        <span className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 rounded-full text-[10px] font-mono text-zinc-300 border border-neutral-800/40">
                          📷 {detailImageIdx + 1} / {(selectedListing.images || []).length}
                        </span>
                      </div>

                      {/* Horizontal Scrolling Gallery Thumbnails */}
                      {(selectedListing.images || []).length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-1 select-none scrollbar-none">
                          {(selectedListing.images || []).map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setDetailImageIdx(i)}
                              className={`w-16 h-12 rounded-lg border overflow-hidden shrink-0 transition-all ${
                                detailImageIdx === i 
                                  ? "border-amber-500 scale-102 shadow-md shadow-amber-500/10" 
                                  : "border-neutral-800/60 hover:border-neutral-700"
                              }`}
                            >
                              <img src={img} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Harita Tab content */
                    <div className="w-full aspect-[4/3] bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden relative">
                      <InteractiveMap
                        lat={selectedListing.location.lat}
                        lng={selectedListing.location.lng}
                        title={selectedListing.title}
                        lang={lang}
                        onDoubleClick={() => {
                          const targetUrl = `/harita?lat=${selectedListing.location.lat}&lng=${selectedListing.location.lng}&title=${encodeURIComponent(selectedListing.title)}`;
                          window.history.pushState(null, "", targetUrl);
                          setCurrentPage("map-fullscreen");
                          setSelectedListing(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Micro Location Detail Card (GPS coordinates removed) */}
                  {getCategoryRootName(selectedListing.categoryId, categories).toLowerCase().includes("emlak") && (
                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/50 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs text-zinc-300 font-sans">{selectedListing.location.address}</span>
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN: PRESTIGIOUS SPECIFICATIONS & INFOS (40% width) */}
                <div className="lg:w-2/5 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6">
                  
                  {/* Details Top Section */}
                  <div className="space-y-4">
                    
                    {/* Category breadcrumb path */}
                    <div className="flex items-center gap-2 text-[10px] text-amber-500 font-mono tracking-wider uppercase font-bold">
                      <span>
                        {(() => {
                          const cat = categories.find(c => c.id === selectedListing.categoryId);
                          return cat ? (lang === "tr" ? cat.nameTr : cat.nameEn) : "";
                        })()}
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500">{(selectedListing.createdAt || "").slice(0, 10)}</span>
                    </div>

                    {/* Title in magnificent Playfair Display Serif */}
                    <h2 className="text-xl lg:text-2xl font-serif font-semibold text-white tracking-tight leading-snug">
                      {selectedListing.title}
                    </h2>

                    {/* Pricing in premium custom JetBrains Mono */}
                    <div className="text-2xl font-mono font-bold text-amber-500 tracking-tight border-b border-neutral-900 pb-4">
                      {renderPriceElement(selectedListing, "text-2xl font-mono font-bold text-amber-500 tracking-tight")}
                    </div>

                    {/* Specs board in high contrast lists */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">{lang === "tr" ? "MÜHENDİSLİK & NİTELİK DETAYLARI" : "TECHNICAL PROPERTIES"}</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[160px] lg:max-h-[220px] overflow-y-auto pr-1">
                        {(() => {
                          const cat = categories.find(c => c.id === selectedListing.categoryId);
                          const catAttrs = cat?.attributes || [];
                          const renderedAttrs: { key: string; label: string; value: string }[] = [];

                          // 1. Defined fields in category
                          catAttrs.forEach(attr => {
                            const rawValue = selectedListing.attributes?.[attr.key];
                            let displayValue = "-";
                            if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
                              if (typeof rawValue === "boolean") {
                                displayValue = rawValue ? (lang === "tr" ? "Evet" : "Yes") : (lang === "tr" ? "Hayır" : "No");
                              } else {
                                const valStr = String(rawValue);
                                if (attr.key === "model" && valStr.includes(":")) {
                                  displayValue = valStr.substring(valStr.indexOf(":") + 1);
                                } else {
                                  displayValue = valStr;
                                }
                              }
                            }
                            renderedAttrs.push({
                              key: attr.key,
                              label: lang === "tr" ? attr.label_tr : attr.label_en,
                              value: displayValue
                            });
                          });

                          // 2. Other attributes present in the listing but not explicitly in category attributes (e.g. legacy/AI generated fields)
                          if (selectedListing.attributes) {
                            Object.entries(selectedListing.attributes).forEach(([k, v]) => {
                              if (!catAttrs.some(attr => attr.key === k)) {
                                let displayValue = "-";
                                if (v !== undefined && v !== null && v !== "") {
                                  if (typeof v === "boolean") {
                                    displayValue = v ? (lang === "tr" ? "Evet" : "Yes") : (lang === "tr" ? "Hayır" : "No");
                                  } else {
                                    const valStr = String(v);
                                    if (k === "model" && valStr.includes(":")) {
                                      displayValue = valStr.substring(valStr.indexOf(":") + 1);
                                    } else {
                                      displayValue = valStr;
                                    }
                                  }
                                }
                                renderedAttrs.push({
                                  key: k,
                                  label: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
                                  value: displayValue
                                });
                              }
                            });
                          }

                          return renderedAttrs.map(attr => (
                            <div key={attr.key} className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/40 flex justify-between items-center text-xs">
                              <span className="text-zinc-500 font-mono">{attr.label}:</span>
                              <span className="text-zinc-200 font-mono font-semibold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800/40">
                                {attr.value}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Spacious Description Section */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">{lang === "tr" ? "PORTFÖY AÇIKLAMASI" : "PORTFOLIO DESCRIPTION"}</span>
                      <p className="text-xs text-zinc-400 bg-neutral-900/20 p-4 rounded-xl border border-neutral-900 font-sans leading-relaxed max-h-[120px] overflow-y-auto">
                        {selectedListing.description}
                      </p>
                    </div>

                  </div>

                  {/* Actions & Verified Owner Profile Cards */}
                  <div className="space-y-4 pt-4 border-t border-neutral-900">
                    
                    {(() => {
                      const seller = adminUsers.find(u => u.id === selectedListing.userId) || {
                        id: "user_ad_8891",
                        name: "Vadi İlan Portföy",
                        email: "destek@vadiilan.com",
                        phone: "+905051234567",
                        status: UserStatus.Fully_Verified,
                        role: "admin",
                        emailVerifiedAt: "2026-07-10T09:11:30.185Z",
                        phoneVerifiedAt: "2026-07-10T09:11:30.185Z",
                        oneSignalPlayerId: null,
                        oneSignalExternalId: null
                      };

                      return (
                        <div 
                          onClick={() => setSelectedSeller(seller)}
                          className="bg-neutral-900/40 hover:bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800/60 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs font-mono border border-amber-500/10 group-hover:border-amber-500/30 transition-all">
                              {seller.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-all flex items-center gap-1.5">
                                <span>{seller.name}</span>
                                <span className="text-[9px] text-zinc-500 font-normal">({lang === "tr" ? "Profili Gör" : "View Profile"})</span>
                              </h4>
                              <p className="text-[10px] text-zinc-500">{seller.role === "admin" ? (lang === "tr" ? "Yetkili Danışman" : "Authorized Broker") : (lang === "tr" ? "Bireysel Mağaza" : "Individual Store")}</p>
                            </div>
                          </div>
                          
                          {/* OneSignal targeted push watch */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening seller modal
                              if (!isPushSubscribed) {
                                setToastNotification({
                                  title: lang === "tr" ? "Bildirim Almak için Kaydolun" : "Subscribe to Alerts",
                                  message: lang === "tr" ? "Fiyat değişimlerini takip etmek için alttaki teknik panelden OneSignal aboneliğini açmalısınız." : "Subscribe first in the diagnostics dashboard down below.",
                                  type: "info"
                                });
                                setShowDevTools(true);
                                setDevToolsTab("onesignal");
                              } else {
                                setToastNotification({
                                  title: lang === "tr" ? "İlan Takibe Alındı" : "Ad Tracked",
                                  message: lang === "tr" ? "Fiyat düşüşü veya yeni mesaj geldiğinde OneSignal ile tarayıcı bildirimi alacaksınız." : "You will receive real time alerts for any price fluctuations.",
                                  type: "success"
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono transition-all flex items-center gap-1.5 border ${
                              isPushSubscribed 
                                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                : "bg-neutral-950 text-zinc-400 border-neutral-800 hover:text-zinc-200"
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            <span>{isPushSubscribed ? (lang === "tr" ? "Takipte" : "Tracking") : (lang === "tr" ? "Fiyat Takibi" : "Track price")}</span>
                          </button>
                        </div>
                      );
                    })()}

                    {showDirectMessageForm ? (
                      <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                          {lang === "tr" ? "İLAN SAHİBİNE MESAJ GÖNDER" : "SEND MESSAGE TO OWNER"}
                        </span>
                        <textarea
                          rows={3}
                          value={directMessageText}
                          onChange={(e) => setDirectMessageText(e.target.value)}
                          placeholder={lang === "tr" ? "Mesajınızı buraya yazın..." : "Type your message here..."}
                          className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-sans"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowDirectMessageForm(false);
                              setDirectMessageText("");
                            }}
                            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-zinc-400 font-bold text-xs py-2 rounded-xl border border-neutral-800 transition-all cursor-pointer"
                          >
                            {lang === "tr" ? "İptal" : "Cancel"}
                          </button>
                          <button
                            disabled={isSendingDirectMessage || !directMessageText.trim()}
                            onClick={async () => {
                              if (!directMessageText.trim()) return;
                              setIsSendingDirectMessage(true);
                              
                              const seller = adminUsers.find(u => u.id === selectedListing.userId) || {
                                name: "Vadi İlan Portföy",
                                email: "destek@vadiilan.com"
                              };

                              try {
                                const response = await fetch("/api/send-simulated-email", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    from: user.email || "guest@vadiilan.com",
                                    to: seller.email,
                                    subject: lang === "tr" ? `İlan Mesajı: ${selectedListing.title}` : `Listing Message: ${selectedListing.title}`,
                                    body: `Gönderen: ${user.name || "Ziyaretçi (Guest)"}\nMesaj: ${directMessageText}`
                                  })
                                });

                                const result = await response.json();
                                if (result.success) {
                                  setToastNotification({
                                    title: lang === "tr" ? "Mesaj Gönderildi" : "Message Sent",
                                    message: lang === "tr" ? "Mesajınız ilan sahibine başarıyla iletildi." : "Your message has been delivered to the owner.",
                                    type: "success"
                                  });
                                  
                                  // Refresh developer tools email log if open
                                  try {
                                    const emailsRes = await fetch("/api/simulated-emails");
                                    const emailsData = await emailsRes.json();
                                    if (emailsData.data) {
                                      setSimulatedEmails(emailsData.data);
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }

                                  setShowDirectMessageForm(false);
                                  setDirectMessageText("");
                                } else {
                                  setToastNotification({
                                    title: lang === "tr" ? "Hata" : "Error",
                                    message: lang === "tr" ? "Mesaj gönderilemedi." : "Failed to send message.",
                                    type: "error"
                                  });
                                }
                              } catch (err) {
                                console.error(err);
                                setToastNotification({
                                  title: lang === "tr" ? "Hata" : "Error",
                                  message: lang === "tr" ? "Bağlantı hatası oluştu." : "Connection error.",
                                  type: "error"
                                });
                              } finally {
                                setIsSendingDirectMessage(false);
                              }
                            }}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isSendingDirectMessage ? (
                              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{lang === "tr" ? "Gönder" : "Send"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Owner Controls vs Customer Controls */
                      user.id !== "guest" && (selectedListing.userId === user.id || user.role === "admin") ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              setUserEditingListing({
                                ...selectedListing,
                                attributes: selectedListing.attributes || {}
                              });
                              setSelectedListing(null);
                            }}
                            className="bg-neutral-900 hover:bg-neutral-800 text-amber-500 font-bold text-xs py-3 rounded-xl transition-all border border-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>{lang === "tr" ? "Düzenle" : "Edit"}</span>
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm(lang === "tr" ? "Bu ilanı silmek istediğinize emin misiniz?" : "Are you sure you want to delete this listing?")) {
                                try {
                                  const res = await fetch(`/api/listings/${selectedListing.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      "X-User-Role": user.role || "",
                                      "X-User-Id": user.id || ""
                                    }
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    setListings(prev => prev.filter(l => l.id !== selectedListing.id));
                                    setSelectedListing(null);
                                    setToastNotification({
                                      title: lang === "tr" ? "İlan Silindi" : "Listing Deleted",
                                      message: lang === "tr" ? "İlan başarıyla silindi." : "Listing deleted successfully.",
                                      type: "success"
                                    });
                                  } else {
                                    setToastNotification({
                                      title: lang === "tr" ? "Hata" : "Error",
                                      message: data.error || (lang === "tr" ? "İlan silinemedi." : "Failed to delete listing."),
                                      type: "error"
                                    });
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold text-xs py-3 rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{lang === "tr" ? "Sil" : "Delete"}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              setToastNotification({
                                title: lang === "tr" ? "Aranıyor..." : "Dialing...",
                                message: lang === "tr" ? "Sanal santral bağlandı. Telefon numarası: +90 505 123 4567" : "Virtual central routing setup to +90 505 123 4567",
                                type: "info"
                              });
                            }}
                            className="bg-neutral-900 hover:bg-neutral-800 text-zinc-200 font-bold text-xs py-3 rounded-xl transition-all border border-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Phone className="w-4 h-4 text-amber-500" />
                            <span>{lang === "tr" ? "Satıcıyı Ara" : "Call Seller"}</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              setShowDirectMessageForm(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/5 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{lang === "tr" ? "Mesaj Gönder" : "Send Message"}</span>
                          </button>
                        </div>
                      )
                    )}

                  </div>

                </div>
              </div>

              {/* INTERACTIVE MAP INTEGRATION - EXCLUSIVELY FOR REAL ESTATE (EMLAK) CATEGORY */}
              {getCategoryRootName(selectedListing.categoryId, categories).toLowerCase().includes("emlak") && (
                <div className="p-4 sm:p-6 md:p-8 bg-neutral-900/20 border-t border-neutral-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div>
                      <h3 className="text-[10px] font-semibold text-zinc-400 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {lang === "tr" ? "İNTERAKTİF HARİTA" : "INTERACTIVE REAL WORLD MAP"}
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {lang === "tr" ? "İlanın gerçek dünya haritasındaki konumu. Büyütmek için çift tıklayın." : "Physical real-world location. Double click map to open full viewport stand-alone view."}
                      </p>
                    </div>
                  </div>

                  {/* Fully Interactive Leaflet Map Wrapper */}
                  <div className="w-full aspect-[16/10] md:aspect-[21/9] min-h-[220px] md:min-h-[300px] bg-neutral-950 rounded-2xl relative overflow-hidden select-none">
                    <InteractiveMap
                      lat={selectedListing.location.lat}
                      lng={selectedListing.location.lng}
                      title={selectedListing.title}
                      lang={lang}
                      onDoubleClick={() => {
                        const targetUrl = `/harita?lat=${selectedListing.location.lat}&lng=${selectedListing.location.lng}&title=${encodeURIComponent(selectedListing.title)}`;
                        window.history.pushState(null, "", targetUrl);
                        setCurrentPage("map-fullscreen");
                        setSelectedListing(null);
                      }}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SELECTED SELLER DETAILS MODAL */}
      <AnimatePresence>
        {selectedSeller && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedSeller(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl space-y-6 z-10"
            >
              <button
                onClick={() => setSelectedSeller(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white transition-all border border-neutral-800/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Seller Header */}
              <div className="text-center space-y-3 pb-4 border-b border-neutral-900">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl font-mono border border-amber-500/10 mx-auto">
                  {selectedSeller.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedSeller.name}</h3>
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/10 uppercase inline-block mt-1">
                    {selectedSeller.role === "admin" ? (lang === "tr" ? "Yönetici" : "Administrator") : (lang === "tr" ? "Mağaza Sahibi / Bireysel" : "Store Owner / Individual")}
                  </span>
                </div>
              </div>

              {/* Verification Details */}
              <div className="space-y-3 text-xs font-sans">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">
                  {lang === "tr" ? "HESAP DOĞRULAMA BİLGİLERİ" : "ACCOUNT VERIFICATION"}
                </span>

                <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-900 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{lang === "tr" ? "E-posta Adresi" : "Email Address"}</span>
                    <span className="text-zinc-300 font-mono">{selectedSeller.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{lang === "tr" ? "Telefon Numarası" : "Phone Number"}</span>
                    <span className="text-zinc-300 font-mono">{selectedSeller.phone || "+90 505 123 4567"}</span>
                  </div>
                  <div className="h-px bg-neutral-900 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{lang === "tr" ? "Hesap Durumu" : "Account Status"}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {lang === "tr" ? "Tam Onaylı" : "Fully Verified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{lang === "tr" ? "Kayıt Tarihi" : "Registration Date"}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {selectedSeller.emailVerifiedAt && typeof selectedSeller.emailVerifiedAt === "string" ? selectedSeller.emailVerifiedAt.slice(0, 10) : "2026-07-10"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Other Listings by this Seller */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">
                  {lang === "tr" ? "ÜYENİN DİĞER İLANLARI" : "OTHER LISTINGS BY MEMBER"}
                </span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {listings.filter(l => l.userId === selectedSeller.id && (selectedListing ? l.id !== selectedListing.id : true)).length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic py-2">
                      {lang === "tr" ? "Başka aktif ilanı bulunmuyor." : "No other active listings found."}
                    </p>
                  ) : (
                    listings
                      .filter(l => l.userId === selectedSeller.id && (selectedListing ? l.id !== selectedListing.id : true))
                      .map(l => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setSelectedListing(l);
                            setSelectedSeller(null);
                            setDetailImageIdx(0);
                          }}
                          className="w-full text-left bg-neutral-900/20 hover:bg-neutral-900/60 p-2 rounded-lg border border-neutral-900 transition-all flex gap-3 items-center cursor-pointer"
                        >
                          <img src={l.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} alt={l.title} className="w-10 h-8 object-cover rounded" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-zinc-300 font-sans truncate font-medium">{l.title}</p>
                            <span className="text-[10px] font-mono text-amber-500">{renderPriceElement(l, "text-[10px] font-mono text-amber-500")}</span>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NEW LISTING POST MODAL */}
      <AnimatePresence>
        {showAddListingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-5xl w-full relative overflow-hidden shadow-2xl p-6 md:p-8 space-y-4 max-h-[95vh] overflow-y-auto"
            >
              
              {/* Saving overlay */}
              {isListingSaving && (
                <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-mono text-amber-500 font-extrabold">{savingElapsedSeconds}s</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-white">
                      {lang === "tr" ? "İlanınız Kaydediliyor..." : "Saving Your Ad..."}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      {lang === "tr" ? "Veriler güvenli bir şekilde sunucuya aktarılıyor. Lütfen pencereyi kapatmayın." : "Data is being securely uploaded to the server. Please do not close this window."}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="text-amber-500 w-5 h-5" />
                  <h3 className="text-base font-extrabold text-white">{lang === "tr" ? "YENİ İLAN YAYINLA" : "PUBLISH NEW AD"}</h3>
                </div>
                <button onClick={() => setShowAddListingModal(false)} className="text-zinc-500 hover:text-white p-1 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {listingError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{listingError}</p>
                </div>
              )}

              {/* Post form */}
              <form onSubmit={handleAddListing} className="space-y-4 text-xs font-sans">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Basic Details */}
                  <div className="space-y-4">
                    {/* Category selectors with AI sugeror */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-zinc-400">{lang === "tr" ? "Kategori Seçimi" : "Select Category"} <span className="text-red-500 font-extrabold">*</span></label>
                      </div>
                      <select
                        value={selectedCategoryId}
                        onChange={e => {
                          setSelectedCategoryId(e.target.value);
                          setNewListingAttrValues({});
                        }}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                      >
                        {categories
                          .filter(c => !categories.some(child => child.parentId === c.id))
                          .map(c => {
                            const parent = c.parentId ? categories.find(p => p.id === c.parentId) : null;
                            const displayName = parent 
                              ? `${lang === "tr" ? parent.nameTr : parent.nameEn} ➔ ${lang === "tr" ? c.nameTr : c.nameEn}` 
                              : (lang === "tr" ? c.nameTr : c.nameEn);
                            return (
                              <option key={c.id} value={c.id}>
                                {displayName}
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <label className="text-zinc-400 block mb-1">{lang === "tr" ? "İlan Başlığı" : "Ad Title"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="text" 
                          placeholder="Örn: Sahibinden 3+1"
                          value={newListingTitle}
                          onChange={e => setNewListingTitle(e.target.value)}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-zinc-400 block mb-1">{lang === "tr" ? "Fiyat" : "Price"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="number" 
                          placeholder="Örn: 2450000"
                          value={newListingPrice}
                          onChange={e => setNewListingPrice(e.target.value)}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-zinc-400 block mb-1">{lang === "tr" ? "Birim" : "Unit"}</label>
                        <select
                          value={newListingCurrency}
                          onChange={e => setNewListingCurrency(e.target.value as any)}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-semibold cursor-pointer"
                        >
                          <option value="TL">TL (₺)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    {/* New Listing Description Field */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-400">{lang === "tr" ? "İlan Açıklaması" : "Description"}</label>
                      <textarea 
                        rows={4}
                        value={newListingDesc} 
                        onChange={e => setNewListingDesc(e.target.value)}
                        className="w-full bg-black border border-neutral-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 transition-all text-xs"
                        placeholder={lang === "tr" ? "Ürün detayları, durum bilgisi..." : "Product specs, condition description..."}
                      />
                    </div>

                    {/* Render dynamic attributes suggested by AI Gemini */}
                    {(() => {
                      const attrs = getCategoryAttributesRecursively(selectedCategoryId);
                      if (attrs.length > 0) {
                        return (
                          <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                              {lang === "tr" ? "Kategoriye Özel Dinamik Form Alanları" : "Category Custom Attributes"}
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              {attrs.map(attr => (
                                <div key={attr.key}>
                                  <label className="text-zinc-400 block mb-1 text-[11px]">{lang === "tr" ? attr.label_tr : attr.label_en} {attr.required && <span className="text-red-500 font-extrabold">*</span>}</label>
                                  {attr.type === "select" ? (
                                    (() => {
                                      let optionsToRender = attr.options || [];
                                      if (attr.key === "model") {
                                        const selectedMarka = newListingAttrValues["marka"];
                                        if (selectedMarka) {
                                          optionsToRender = optionsToRender.filter(opt => opt.startsWith(`${selectedMarka}:`));
                                        } else {
                                          optionsToRender = []; // Empty if no brand is selected yet
                                        }
                                      }
                                      return (
                                        <select
                                          value={newListingAttrValues[attr.key] || ""}
                                          onChange={e => {
                                            const nextVal = e.target.value;
                                            setNewListingAttrValues(prev => {
                                              const copy = { ...prev, [attr.key]: nextVal };
                                              if (attr.key === "marka") {
                                                delete copy["model"]; // Clear model when brand changes
                                              }
                                              return copy;
                                            });
                                          }}
                                          disabled={attr.key === "model" && !newListingAttrValues["marka"]}
                                          className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white disabled:opacity-50"
                                        >
                                          <option value="">
                                            {attr.key === "model" && !newListingAttrValues["marka"]
                                              ? (lang === "tr" ? "Önce Marka Seçiniz" : "Select Brand First")
                                              : (lang === "tr" ? "Seçiniz" : "Select")}
                                          </option>
                                          {optionsToRender.map(opt => {
                                            const displayLabel = opt.includes(":") ? opt.substring(opt.indexOf(":") + 1) : opt;
                                            return (
                                              <option key={opt} value={opt}>
                                                {displayLabel}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      );
                                    })()
                                  ) : attr.type === "boolean" ? (
                                    <select
                                      value={newListingAttrValues[attr.key] || ""}
                                      onChange={e => setNewListingAttrValues({ ...newListingAttrValues, [attr.key]: e.target.value === "true" })}
                                      className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white"
                                    >
                                      <option value="">Seçiniz</option>
                                      <option value="true">Evet / Yes</option>
                                      <option value="false">Hayır / No</option>
                                    </select>
                                  ) : (
                                    <input 
                                      type={attr.type === "number" ? "number" : "text"}
                                      value={newListingAttrValues[attr.key] || ""}
                                      onChange={e => setNewListingAttrValues({ ...newListingAttrValues, [attr.key]: e.target.value })}
                                      className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500 w-4 h-4 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-xs text-amber-400">Yıldızlı Öne Çıkar</h4>
                          <p className="text-[10px] text-zinc-500">İlanınız listenin en üst sırasında altın yıldızla öne çıkarılır.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={newListingFeatured}
                        onChange={e => setNewListingFeatured(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Column: Photos & Maps */}
                  <div className="space-y-4">
                    {/* Photo quotas cap simulation */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-zinc-400 font-bold">{lang === "tr" ? "İlan Fotoğrafları" : "Ad Photos"} <span className="text-red-500 font-extrabold">*</span></label>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {(() => {
                            const cat = categories.find(c => c.id === selectedCategoryId);
                            return cat ? `${lang === "tr" ? "Limit" : "Limit"}: Max ${cat.maxImages}` : "";
                          })()}
                        </span>
                      </div>

                      {/* Drag and Drop Zone + Gallery Container */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            Array.from(files).forEach((file: any) => {
                              if (!file.type.startsWith("image/")) return;
                              const reader = new FileReader();
                              reader.onload = async (event) => {
                                if (event.target?.result) {
                                  const compressed = await compressImage(event.target.result as string);
                                  setNewListingImages(prev => [...prev, compressed]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                        className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 bg-neutral-900/40 rounded-2xl p-4 transition-all text-center space-y-4"
                      >
                        {/* Drag-drop prompt */}
                        <div className="space-y-1 py-2">
                          <Camera className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                          <p className="text-xs text-zinc-300 font-semibold">
                            {lang === "tr" ? "Fotoğrafları Buraya Sürükleyip Bırakın" : "Drag and Drop Photos Here"}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {lang === "tr" ? "veya aşağıdaki seçeneklerle kolayca yükleyin" : "or quickly upload using the options below"}
                          </p>
                        </div>

                        {/* Image Grid */}
                        {newListingImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 border-t border-neutral-900 pt-4">
                            {newListingImages.map((img, i) => (
                              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-neutral-800 shadow-md">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => setNewListingImages(newListingImages.filter((_, idx) => idx !== i))}
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Actions Row */}
                        <div className="flex gap-2 justify-center">
                          {/* File Select Label */}
                          <label 
                            className="bg-neutral-950 border border-neutral-800 hover:border-zinc-500 px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-500" />
                            <span>{lang === "tr" ? "Dosya Seç" : "Select File"}</span>
                            <input 
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  Array.from(files).forEach((file: any) => {
                                    const reader = new FileReader();
                                    reader.onload = async (event) => {
                                      if (event.target?.result) {
                                        const compressed = await compressImage(event.target.result as string);
                                        setNewListingImages(prev => [...prev, compressed]);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }
                              }}
                            />
                          </label>

                          {/* Random Sample Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const samples = [
                                "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"
                              ];
                              const randomImg = samples[Math.floor(Math.random() * samples.length)];
                              setNewListingImages([...newListingImages, randomImg]);
                            }}
                            className="bg-neutral-950 border border-neutral-800 hover:border-zinc-500 px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === "tr" ? "Örnek Resim Ekle" : "Add Sample Image"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Remote Image URL Input */}
                      <div className="mt-2 flex gap-2">
                        <input 
                          type="text"
                          placeholder={lang === "tr" ? "Veya resim web adresini (URL) buraya yapıştırıp Enter'a basın..." : "Or paste image web address (URL) and hit Enter..."}
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                          id="custom-image-url-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setNewListingImages([...newListingImages, val]);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("custom-image-url-input") as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              setNewListingImages([...newListingImages, val]);
                              input.value = "";
                            }
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl border border-neutral-700 transition-colors flex items-center gap-1"
                        >
                          <span>{lang === "tr" ? "URL Ekle" : "Add URL"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Location Selection (All categories) */}
                    <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">🗺️ {lang === "tr" ? "KONUM SEÇİMİ" : "LOCATION SELECTION"}</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Country */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Ülke *" : "Country *"}
                          </label>
                          <select
                            value={newListingCountry}
                            onChange={e => {
                              const country = e.target.value;
                              setNewListingCountry(country);
                              const availableCities = locations.find(c => c.name === country)?.cities || [];
                              const firstCity = availableCities[0]?.name || "";
                              setNewListingCity(firstCity);
                              const availableDistricts = availableCities[0]?.districts || [];
                              setNewListingDistrict(availableDistricts[0] || "");
                            }}
                            className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select Country"}</option>
                            {locations.map(l => (
                              <option key={l.name} value={l.name}>{l.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* City */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Şehir *" : "City *"}
                          </label>
                          <select
                            value={newListingCity}
                            disabled={!newListingCountry}
                            onChange={e => {
                              const city = e.target.value;
                              setNewListingCity(city);
                              const countryData = locations.find(c => c.name === newListingCountry);
                              const cityData = countryData?.cities.find(ct => ct.name === city);
                              const availableDistricts = cityData?.districts || [];
                              setNewListingDistrict(availableDistricts[0] || "");
                            }}
                            className="w-full bg-black border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select City"}</option>
                            {(locations.find(l => l.name === newListingCountry)?.cities || []).map(city => (
                              <option key={city.name} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* District */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Semt/İlçe *" : "District *"}
                          </label>
                          <select
                            value={newListingDistrict}
                            disabled={!newListingCity}
                            onChange={e => setNewListingDistrict(e.target.value)}
                            className="w-full bg-black border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select District"}</option>
                            {((locations.find(l => l.name === newListingCountry)?.cities || []).find(ct => ct.name === newListingCity)?.districts || []).map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Detailed Address */}
                      <div className="space-y-1">
                        <label className="text-zinc-400 block mb-1 text-[11px]">{lang === "tr" ? "Açık Adres" : "Full Address"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={newListingLocAddress}
                          onChange={e => setNewListingLocAddress(e.target.value)}
                          placeholder={lang === "tr" ? "Sokak, Bina No, Daire vb." : "Street, Building No, Apartment etc."}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Coordinates & Location select (exclusively for emlak category) */}
                    {getCategoryRootName(selectedCategoryId, categories).toLowerCase().includes("emlak") && (
                      <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">🗺️ {lang === "tr" ? "HARİTA VE COĞRAFİ KONUM" : "MAP & GPS COORDINATES"}</span>
                        
                        {/* Inline Interactive Map Picker */}
                        <div className="w-full h-44 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                          <InteractiveMap
                            lat={newListingLat}
                            lng={newListingLng}
                            title={newListingTitle || (lang === "tr" ? "Yeni İlan Konumu" : "New Ad Location")}
                            lang={lang}
                            onMapClick={(lat, lng) => {
                              setNewListingLat(lat);
                              setNewListingLng(lng);
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col">
                            <span className="text-zinc-500 text-[10px]">Lat:</span>
                            <input 
                              type="number"
                              step="any"
                              value={newListingLat}
                              onChange={e => setNewListingLat(parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-amber-400 border-none outline-none p-0 focus:ring-0 focus:outline-none font-mono text-xs w-full"
                            />
                          </div>
                          <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col">
                            <span className="text-zinc-500 text-[10px]">Lng:</span>
                            <input 
                              type="number"
                              step="any"
                              value={newListingLng}
                              onChange={e => setNewListingLng(parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-amber-400 border-none outline-none p-0 focus:ring-0 focus:outline-none font-mono text-xs w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neutral-900">
                  <button 
                    type="button"
                    disabled={isListingSaving}
                    onClick={() => setShowAddListingModal(false)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-zinc-300 font-bold py-2.5 rounded-xl text-center transition-all border border-neutral-800"
                  >
                    {lang === "tr" ? "Vazgeç" : "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    disabled={isListingSaving}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold py-2.5 rounded-xl text-center transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                  >
                    {isListingSaving ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin"></div>
                        <span>{lang === "tr" ? `Kaydediliyor... (${savingElapsedSeconds}sn)` : `Saving... (${savingElapsedSeconds}s)`}</span>
                      </>
                    ) : (
                      <span>{lang === "tr" ? "İlanı Canlıya Al" : "Publish Classified"}</span>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2.5: EDIT LISTING MODAL FOR OWNER */}
      <AnimatePresence>
        {userEditingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-5xl w-full relative overflow-hidden shadow-2xl p-6 md:p-8 space-y-4 max-h-[95vh] overflow-y-auto"
            >
              
              {/* Saving overlay */}
              {isListingSaving && (
                <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-mono text-amber-500 font-extrabold">{savingElapsedSeconds}s</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-white">
                      {lang === "tr" ? "Değişiklikler Kaydediliyor..." : "Saving Changes..."}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      {lang === "tr" ? "İlan güncelleniyor ve veriler sunucuya güvenli bir şekilde aktarılıyor. Lütfen pencereyi kapatmayın." : "Ad is being updated and data is being securely uploaded. Please do not close this window."}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="text-amber-500 w-5 h-5" />
                  <h3 className="text-base font-extrabold text-white">{lang === "tr" ? "İLANI DÜZENLE" : "EDIT CLASSIFIED"}</h3>
                </div>
                <button onClick={() => setUserEditingListing(null)} className="text-zinc-500 hover:text-white p-1 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Edit form */}
              <form onSubmit={handleUpdateUserListing} className="space-y-4 text-xs font-sans">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Basic details & Location */}
                  <div className="space-y-4">
                    
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <label className="text-zinc-400">{lang === "tr" ? "Kategori Seçimi" : "Select Category"} <span className="text-red-500 font-extrabold">*</span></label>
                      <select
                        value={userEditingListing.categoryId}
                        onChange={e => {
                          setUserEditingListing({
                            ...userEditingListing,
                            categoryId: e.target.value,
                            attributes: {} // Reset dynamic attributes when category changes
                          });
                        }}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white"
                      >
                        {categories
                          .filter(c => !categories.some(child => child.parentId === c.id))
                          .map(c => {
                            const parent = c.parentId ? categories.find(p => p.id === c.parentId) : null;
                            const displayName = parent 
                              ? `${lang === "tr" ? parent.nameTr : parent.nameEn} ➔ ${lang === "tr" ? c.nameTr : c.nameEn}` 
                              : (lang === "tr" ? c.nameTr : c.nameEn);
                            return (
                              <option key={c.id} value={c.id}>
                                {displayName}
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1">{lang === "tr" ? "İlan Başlığı" : "Ad Title"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="text" 
                          value={userEditingListing.title} 
                          onChange={e => setUserEditingListing({ ...userEditingListing, title: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 transition-all"
                          placeholder={lang === "tr" ? "Örn: Satılık temiz araç..." : "E.g., Clean car for sale..."}
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">{lang === "tr" ? "Fiyat (TL)" : "Price (TL)"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="number" 
                          value={userEditingListing.price} 
                          onChange={e => setUserEditingListing({ ...userEditingListing, price: Number(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white rounded-xl px-4 py-2.5 transition-all font-mono"
                          placeholder="E.g., 25000"
                        />
                      </div>
                    </div>

                    {/* Edit Location Selection (All categories) */}
                    <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">🗺️ {lang === "tr" ? "KONUM GÜNCELLEME" : "UPDATE LOCATION"}</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Country */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Ülke *" : "Country *"}
                          </label>
                          <select
                            value={userEditingListing.location?.country || ""}
                            onChange={e => {
                              const country = e.target.value;
                              const availableCities = locations.find(c => c.name === country)?.cities || [];
                              const firstCity = availableCities[0]?.name || "";
                              const availableDistricts = availableCities[0]?.districts || [];
                              const firstDistrict = availableDistricts[0] || "";
                              setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  country,
                                  city: firstCity,
                                  district: firstDistrict
                                }
                              });
                            }}
                            className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select Country"}</option>
                            {locations.map(l => (
                              <option key={l.name} value={l.name}>{l.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* City */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Şehir *" : "City *"}
                          </label>
                          <select
                            value={userEditingListing.location?.city || ""}
                            disabled={!userEditingListing.location?.country}
                            onChange={e => {
                              const city = e.target.value;
                              const countryData = locations.find(c => c.name === userEditingListing.location?.country);
                              const cityData = countryData?.cities.find(ct => ct.name === city);
                              const availableDistricts = cityData?.districts || [];
                              const firstDistrict = availableDistricts[0] || "";
                              setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  city,
                                  district: firstDistrict
                                }
                              });
                            }}
                            className="w-full bg-black border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select City"}</option>
                            {(locations.find(l => l.name === userEditingListing.location?.country)?.cities || []).map(city => (
                              <option key={city.name} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* District */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                            {lang === "tr" ? "Semt/İlçe *" : "District *"}
                          </label>
                          <select
                            value={userEditingListing.location?.district || ""}
                            disabled={!userEditingListing.location?.city}
                            onChange={e => {
                              setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  district: e.target.value
                                }
                              });
                            }}
                            className="w-full bg-black border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">{lang === "tr" ? "Seçiniz" : "Select District"}</option>
                            {((locations.find(l => l.name === userEditingListing.location?.country)?.cities || []).find(ct => ct.name === userEditingListing.location?.city)?.districts || []).map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Detailed Address */}
                      <div className="space-y-1">
                        <label className="text-zinc-400 block mb-1 text-[11px]">{lang === "tr" ? "Açık Adres" : "Full Address"} <span className="text-red-500 font-extrabold">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={userEditingListing.location?.address || ""}
                          onChange={e => setUserEditingListing({
                            ...userEditingListing,
                            location: {
                              ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                              address: e.target.value
                            }
                          })}
                          placeholder={lang === "tr" ? "Sokak, Bina No, Daire vb." : "Street, Building No, Apartment etc."}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Edit Coordinates & Location select (exclusively for emlak category) */}
                    {getCategoryRootName(userEditingListing.categoryId, categories).toLowerCase().includes("emlak") && (
                      <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                        <span className="text-[10px] font-mono text-zinc-500 block uppercase">🗺️ {lang === "tr" ? "HARİTA VE COĞRAFİ KONUM" : "MAP & GPS COORDINATES"}</span>
                        
                        {/* Inline Interactive Map Picker for Edit Modal */}
                        <div className="w-full h-48 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                          <InteractiveMap
                            lat={userEditingListing.location?.lat || 41.0082}
                            lng={userEditingListing.location?.lng || 28.9784}
                            title={userEditingListing.title || (lang === "tr" ? "İlan Konumu" : "Ad Location")}
                            lang={lang}
                            onMapClick={(lat, lng) => {
                              setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  lat,
                                  lng
                                }
                              });
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col">
                            <span className="text-zinc-500 text-[10px]">Lat:</span>
                            <input 
                              type="number"
                              step="any"
                              value={userEditingListing.location?.lat ?? 41.0082}
                              onChange={e => setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  lat: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-transparent text-amber-400 border-none outline-none p-0 focus:ring-0 focus:outline-none font-mono text-xs w-full"
                            />
                          </div>
                          <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-col">
                            <span className="text-zinc-500 text-[10px]">Lng:</span>
                            <input 
                              type="number"
                              step="any"
                              value={userEditingListing.location?.lng ?? 28.9784}
                              onChange={e => setUserEditingListing({
                                ...userEditingListing,
                                location: {
                                  ...(userEditingListing.location || { lat: 41.0082, lng: 28.9784, address: "" }),
                                  lng: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-transparent text-amber-400 border-none outline-none p-0 focus:ring-0 focus:outline-none font-mono text-xs w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Featured/Doping Status */}
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500 w-4 h-4" />
                        <div>
                          <h4 className="font-bold text-xs text-amber-400">Yıldızlı Öne Çıkar</h4>
                          <p className="text-[10px] text-zinc-500">İlanınız listenin en üst sırasında altın yıldızla öne çıkarılır.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={userEditingListing.featured || false}
                        onChange={e => setUserEditingListing({
                          ...userEditingListing,
                          featured: e.target.checked
                        })}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Right Column: Category Attributes, Ad Photos & Description */}
                  <div className="space-y-4">
                    
                    {/* Dynamic fields based on the category */}
                    {(() => {
                      const attrs = getCategoryAttributesRecursively(userEditingListing.categoryId);
                      if (attrs.length > 0) {
                        return (
                          <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-900 space-y-3">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                              {lang === "tr" ? "Kategoriye Özel Dinamik Form Alanları" : "Category Custom Attributes"}
                            </span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {attrs.map(attr => {
                                const currentVal = userEditingListing.attributes?.[attr.key] ?? "";
                                return (
                                  <div key={attr.key}>
                                    <label className="text-zinc-400 block mb-1 text-[11px]">{lang === "tr" ? attr.label_tr : attr.label_en} {attr.required && <span className="text-red-500 font-extrabold">*</span>}</label>
                                    {attr.type === "select" ? (
                                      (() => {
                                        let optionsToRender = attr.options || [];
                                        if (attr.key === "model") {
                                          const selectedMarka = userEditingListing.attributes?.["marka"];
                                          if (selectedMarka) {
                                            optionsToRender = optionsToRender.filter(opt => opt.startsWith(`${selectedMarka}:`));
                                          } else {
                                            optionsToRender = [];
                                          }
                                        }
                                        return (
                                          <select
                                            value={currentVal}
                                            onChange={e => {
                                              const updatedAttributes = {
                                                ...(userEditingListing.attributes || {}),
                                                [attr.key]: e.target.value
                                              };
                                              if (attr.key === "marka") {
                                                delete updatedAttributes["model"]; // Clear model when brand changes
                                              }
                                              setUserEditingListing({
                                                ...userEditingListing,
                                                attributes: updatedAttributes
                                              });
                                            }}
                                            disabled={attr.key === "model" && !userEditingListing.attributes?.["marka"]}
                                            className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white disabled:opacity-50"
                                          >
                                            <option value="">
                                              {attr.key === "model" && !userEditingListing.attributes?.["marka"]
                                                ? (lang === "tr" ? "Önce Marka Seçiniz" : "Select Brand First")
                                                : (lang === "tr" ? "Seçiniz" : "Select")}
                                            </option>
                                            {optionsToRender.map(opt => {
                                              const displayLabel = opt.includes(":") ? opt.substring(opt.indexOf(":") + 1) : opt;
                                              return (
                                                <option key={opt} value={opt}>
                                                  {displayLabel}
                                                </option>
                                              );
                                            })}
                                          </select>
                                        );
                                      })()
                                    ) : attr.type === "boolean" ? (
                                      <select
                                        value={currentVal === true ? "true" : currentVal === false ? "false" : ""}
                                        onChange={e => {
                                          const val = e.target.value === "true" ? true : e.target.value === "false" ? false : "";
                                          const updatedAttributes = {
                                            ...(userEditingListing.attributes || {}),
                                            [attr.key]: val
                                          };
                                          setUserEditingListing({
                                            ...userEditingListing,
                                            attributes: updatedAttributes
                                          });
                                        }}
                                        className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white"
                                      >
                                        <option value="">Seçiniz</option>
                                        <option value="true">Evet / Yes</option>
                                        <option value="false">Hayır / No</option>
                                      </select>
                                    ) : (
                                      <input 
                                        type={attr.type === "number" ? "number" : "text"}
                                        value={currentVal}
                                        onChange={e => {
                                          const updatedAttributes = {
                                            ...(userEditingListing.attributes || {}),
                                            [attr.key]: attr.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value
                                          };
                                          setUserEditingListing({
                                            ...userEditingListing,
                                            attributes: updatedAttributes
                                          });
                                        }}
                                        className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-2 text-white"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Edit Listing Photos */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-zinc-400 font-bold">{lang === "tr" ? "İlan Fotoğrafları" : "Ad Photos"} <span className="text-red-500 font-extrabold">*</span></label>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {(() => {
                            const cat = categories.find(c => c.id === userEditingListing.categoryId);
                            return cat ? `${lang === "tr" ? "Limit" : "Limit"}: Max ${cat.maxImages}` : "";
                          })()}
                        </span>
                      </div>

                      {/* Thumbnail Previews */}
                      {(userEditingListing.images || []).length > 0 && (
                        <div className="grid grid-cols-4 gap-2 border-t border-neutral-900 pt-4">
                          {(userEditingListing.images || []).map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-neutral-800 shadow-md">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setUserEditingListing({
                                  ...userEditingListing,
                                  images: (userEditingListing.images || []).filter((_, idx) => idx !== i)
                                })}
                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Actions Row */}
                      <div className="flex gap-2 justify-center pt-2">
                        {/* File Select Label */}
                        <label 
                          className="bg-neutral-950 border border-neutral-800 hover:border-zinc-500 px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-500" />
                          <span>{lang === "tr" ? "Dosya Seç" : "Select File"}</span>
                          <input 
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach((file: any) => {
                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    if (event.target?.result) {
                                      const compressed = await compressImage(event.target.result as string);
                                      setUserEditingListing(prev => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          images: [...(prev.images || []), compressed]
                                        };
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                          />
                        </label>

                        {/* Random Sample Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const samples = [
                              "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"
                            ];
                            const randomImg = samples[Math.floor(Math.random() * samples.length)];
                            setUserEditingListing({
                              ...userEditingListing,
                              images: [...(userEditingListing.images || []), randomImg]
                            });
                          }}
                          className="bg-neutral-950 border border-neutral-800 hover:border-zinc-500 px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Örnek Resim Ekle" : "Add Sample Image"}</span>
                        </button>
                      </div>

                      {/* Remote Image URL Input */}
                      <div className="mt-2 flex gap-2">
                        <input 
                          type="text"
                          placeholder={lang === "tr" ? "Veya resim web adresini (URL) buraya yapıştırıp Enter'a basın..." : "Or paste image web address (URL) and hit Enter..."}
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                          id="edit-image-url-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                setUserEditingListing({
                                  ...userEditingListing,
                                  images: [...(userEditingListing.images || []), val]
                                });
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("edit-image-url-input") as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              setUserEditingListing({
                                ...userEditingListing,
                                images: [...(userEditingListing.images || []), val]
                              });
                              input.value = "";
                            }
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl border border-neutral-700 transition-colors flex items-center gap-1"
                        >
                          <span>{lang === "tr" ? "URL Ekle" : "Add URL"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-400">{lang === "tr" ? "İlan Açıklaması" : "Description"}</label>
                      <textarea 
                        rows={4}
                        value={userEditingListing.description} 
                        onChange={e => setUserEditingListing({ ...userEditingListing, description: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white rounded-xl px-4 py-3.5 transition-all"
                        placeholder={lang === "tr" ? "Ürün detayları, durum bilgisi..." : "Product specs, condition description..."}
                      />
                    </div>

                  </div>

                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-neutral-900">
                  <button 
                    type="button"
                    disabled={isListingSaving}
                    onClick={() => setUserEditingListing(null)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-zinc-300 font-bold py-2.5 rounded-xl text-center transition-all border border-neutral-800"
                  >
                    {lang === "tr" ? "Vazgeç" : "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    disabled={isListingSaving}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold py-2.5 rounded-xl text-center transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                  >
                    {isListingSaving ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin"></div>
                        <span>{lang === "tr" ? `Kaydediliyor... (${savingElapsedSeconds}sn)` : `Saving... (${savingElapsedSeconds}s)`}</span>
                      </>
                    ) : (
                      <span>{lang === "tr" ? "Değişiklikleri Kaydet" : "Save Changes"}</span>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2.8: ADMIN EDIT CATEGORY & DYNAMIC ATTRIBUTES MODAL */}
      <AnimatePresence>
        {adminEditingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto text-xs"
            >
              
              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="text-amber-500 w-5 h-5" />
                  <h3 className="text-sm font-extrabold text-white">
                    {lang === "tr" ? "KATEGORİ VE ÖZELLİK DÜZENLE" : "EDIT CATEGORY & ATTRIBUTES"}
                  </h3>
                </div>
                <button 
                  onClick={() => setAdminEditingCategory(null)} 
                  className="text-zinc-500 hover:text-white p-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedCategoryAdmin} className="space-y-6">
                
                {/* Section 1: Category Meta */}
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900/60 space-y-3">
                  <h4 className="font-bold text-amber-500 tracking-wider uppercase text-[10px] mb-2">
                    {lang === "tr" ? "1. Genel Kategori Bilgileri" : "1. General Category Info"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1 font-mono text-[10px]">
                        {lang === "tr" ? "KATEGORİ ADI (TR)" : "CATEGORY TITLE (TR)"}
                      </label>
                      <input 
                        type="text" 
                        value={adminEditingCategory.nameTr} 
                        onChange={e => setAdminEditingCategory({ ...adminEditingCategory, nameTr: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 focus:border-amber-500/50"
                        placeholder="Örn: Konut / Ev"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1 font-mono text-[10px]">
                        {lang === "tr" ? "KATEGORİ ADI (EN)" : "CATEGORY TITLE (EN)"}
                      </label>
                      <input 
                        type="text" 
                        value={adminEditingCategory.nameEn} 
                        onChange={e => setAdminEditingCategory({ ...adminEditingCategory, nameEn: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 focus:border-amber-500/50"
                        placeholder="e.g. House"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1 font-mono text-[10px]">
                        {lang === "tr" ? "ÜST KATEGORİ" : "PARENT CATEGORY"}
                      </label>
                      <select 
                        value={adminEditingCategory.parentId || ""} 
                        onChange={e => setAdminEditingCategory({ ...adminEditingCategory, parentId: e.target.value || null })}
                        className="w-full bg-neutral-900 border border-neutral-800 text-zinc-300 rounded-xl px-3 py-2 focus:border-amber-500/50"
                      >
                        <option value="">{lang === "tr" ? "Yok (Kök Kategori)" : "None (Root Category)"}</option>
                        {categories
                          .filter(c => c.id !== adminEditingCategory.id) // cannot parent itself
                          .map(c => (
                            <option key={c.id} value={c.id}>{lang === "tr" ? c.nameTr : c.nameEn}</option>
                          ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-mono text-[10px]">
                          {lang === "tr" ? "MAKSİMUM FOTO" : "MAX PHOTOS"}
                        </label>
                        <input 
                          type="number" 
                          value={adminEditingCategory.maxImages} 
                          onChange={e => setAdminEditingCategory({ ...adminEditingCategory, maxImages: Number(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-mono text-[10px]">
                          ICON TYPE
                        </label>
                        <select 
                          value={adminEditingCategory.icon} 
                          onChange={e => setAdminEditingCategory({ ...adminEditingCategory, icon: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-800 text-zinc-300 rounded-xl px-3 py-2"
                        >
                          <option value="Building2">Building</option>
                          <option value="Car">Car</option>
                          <option value="Smartphone">Smartphone</option>
                          <option value="Tag">Tag/Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Manage Attributes / Dynamic Fields */}
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900/60 space-y-4">
                  <h4 className="font-bold text-amber-500 tracking-wider uppercase text-[10px] flex items-center justify-between">
                    <span>{lang === "tr" ? "2. Dinamik Özellikler (Kategori Alanları)" : "2. Dynamic Attributes (Category Fields)"}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {adminEditingCategory.attributes?.length || 0} {lang === "tr" ? "Özellik Tanımlı" : "Fields Defined"}
                    </span>
                  </h4>

                  {/* List of current attributes */}
                  {adminEditingCategory.attributes && adminEditingCategory.attributes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {adminEditingCategory.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-neutral-900/80 border border-neutral-800 p-2 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-[11px] flex items-center gap-1">
                              <span>{lang === "tr" ? attr.label_tr : attr.label_en}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">({attr.key})</span>
                            </div>
                            <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                              Type: {attr.type} | Required: {attr.required ? "Yes" : "No"}
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAttrIndexToEdit(idx);
                                setEditingAttrKey(attr.key);
                                setEditingAttrLabelTr(attr.label_tr);
                                setEditingAttrLabelEn(attr.label_en);
                                setEditingAttrType(attr.type);
                                setEditingAttrRequired(attr.required);
                                setEditingAttrOptionsString(attr.options?.join(", ") || "");
                              }}
                              className="text-amber-500 hover:bg-amber-500/10 p-1 rounded border border-neutral-800 transition-all"
                              title={lang === "tr" ? "Düzenle" : "Edit Field"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newAttrs = [...(adminEditingCategory.attributes || [])];
                                newAttrs.splice(idx, 1);
                                setAdminEditingCategory({
                                  ...adminEditingCategory,
                                  attributes: newAttrs
                                });
                                // Cancel any active attribute edit
                                setSelectedAttrIndexToEdit(null);
                              }}
                              className="text-rose-500 hover:bg-rose-500/10 p-1 rounded border border-neutral-800 transition-all"
                              title={lang === "tr" ? "Sil" : "Remove Field"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic text-[11px] py-1">
                      {lang === "tr" ? "Bu kategori için henüz dinamik özellik eklenmemiş." : "No custom attributes defined yet."}
                    </p>
                  )}

                  {/* Sub-form to Add or Edit an Attribute */}
                  <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 space-y-3 mt-2">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <span className="font-bold text-zinc-300 font-mono text-[10px]">
                        {selectedAttrIndexToEdit !== null 
                          ? (lang === "tr" ? "⚡ Özelliği Düzenle" : "⚡ Modify Attribute")
                          : (lang === "tr" ? "➕ Yeni Özellik Ekle" : "➕ Append New Attribute")
                        }
                      </span>
                      {selectedAttrIndexToEdit !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAttrIndexToEdit(null);
                            setEditingAttrKey("");
                            setEditingAttrLabelTr("");
                            setEditingAttrLabelEn("");
                            setEditingAttrType("text");
                            setEditingAttrRequired(false);
                            setEditingAttrOptionsString("");
                          }}
                          className="text-[9px] text-zinc-500 hover:text-zinc-300"
                        >
                          {lang === "tr" ? "İptal Et" : "Reset Form"}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] text-zinc-500 block mb-0.5">KEY (ID)</label>
                        <input 
                          type="text"
                          value={editingAttrKey}
                          onChange={e => setEditingAttrKey(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-[11px]"
                          placeholder="e.g. motor_hacmi"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 block mb-0.5">LABEL (TR)</label>
                        <input 
                          type="text"
                          value={editingAttrLabelTr}
                          onChange={e => setEditingAttrLabelTr(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-[11px]"
                          placeholder="Örn: Motor Hacmi"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 block mb-0.5">LABEL (EN)</label>
                        <input 
                          type="text"
                          value={editingAttrLabelEn}
                          onChange={e => setEditingAttrLabelEn(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-[11px]"
                          placeholder="e.g. Engine CC"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] text-zinc-500 block mb-0.5">{lang === "tr" ? "VERİ TİPİ" : "TYPE"}</label>
                        <select 
                          value={editingAttrType}
                          onChange={e => setEditingAttrType(e.target.value as any)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-zinc-300 rounded-lg px-2 py-1.5 text-[11px]"
                        >
                          <option value="text">Text (Yazı)</option>
                          <option value="number">Number (Sayı)</option>
                          <option value="select">Select (Seçenekler)</option>
                          <option value="boolean">Boolean Switch</option>
                        </select>
                      </div>

                      <div className="flex items-center pl-1 pt-3.5">
                        <label className="flex items-center gap-1.5 text-zinc-400 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={editingAttrRequired}
                            onChange={e => setEditingAttrRequired(e.target.checked)}
                            className="rounded bg-neutral-900 border-neutral-800 text-amber-500 focus:ring-0"
                          />
                          <span>{lang === "tr" ? "Zorunlu Alan" : "Required Field"}</span>
                        </label>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingAttrKey || !editingAttrLabelTr || !editingAttrLabelEn) {
                              setToastNotification({
                                title: lang === "tr" ? "Eksik Alan" : "Validation Error",
                                message: lang === "tr" ? "Lütfen tüm özellik alanlarını doldurun." : "Please fill out all attribute fields.",
                                type: "warning"
                              });
                              return;
                            }

                            const opts = editingAttrOptionsString 
                              ? editingAttrOptionsString.split(",").map(o => o.trim()).filter(Boolean)
                              : undefined;

                            const currentAttr: DynamicAttribute = {
                              key: editingAttrKey,
                              label_tr: editingAttrLabelTr,
                              label_en: editingAttrLabelEn,
                              type: editingAttrType,
                              required: editingAttrRequired,
                              options: opts
                            };

                            const list = [...(adminEditingCategory.attributes || [])];
                            if (selectedAttrIndexToEdit !== null) {
                              list[selectedAttrIndexToEdit] = currentAttr;
                            } else {
                              list.push(currentAttr);
                            }

                            setAdminEditingCategory({
                              ...adminEditingCategory,
                              attributes: list
                            });

                            // Reset state
                            setSelectedAttrIndexToEdit(null);
                            setEditingAttrKey("");
                            setEditingAttrLabelTr("");
                            setEditingAttrLabelEn("");
                            setEditingAttrType("text");
                            setEditingAttrRequired(false);
                            setEditingAttrOptionsString("");

                            setToastNotification({
                              title: lang === "tr" ? "Özellik Eklendi/Güncellendi" : "Attribute Updated",
                              message: lang === "tr" ? "Şema değişikliği uygulandı. Kaydetmeyi unutmayın." : "Schema fields updated. Do not forget to save the Category.",
                              type: "success"
                            });
                          }}
                          className="w-full bg-neutral-800 hover:bg-neutral-700 text-zinc-200 border border-neutral-700 py-1.5 rounded-lg font-bold"
                        >
                          {selectedAttrIndexToEdit !== null 
                            ? (lang === "tr" ? "Özelliği Güncelle" : "Update Field")
                            : (lang === "tr" ? "Özellik Ekle" : "Append Field")
                          }
                        </button>
                      </div>
                    </div>

                    {editingAttrType === "select" && (
                      <div>
                        <label className="text-[9px] text-zinc-500 block mb-0.5">
                          {lang === "tr" ? "SEÇENEKLER (VİRGÜLLE AYIRIN)" : "OPTIONS (COMMA SEPARATED)"}
                        </label>
                        <input 
                          type="text"
                          value={editingAttrOptionsString}
                          onChange={e => setEditingAttrOptionsString(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-[11px]"
                          placeholder="Örn: Manuel, Otomatik, Yarı Otomatik"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setAdminEditingCategory(null)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-zinc-300 font-bold py-2.5 rounded-xl text-center border border-neutral-800"
                  >
                    {lang === "tr" ? "Vazgeç" : "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-center shadow-lg shadow-amber-500/10"
                  >
                    {lang === "tr" ? "Kategoriyi ve Özellikleri Kaydet" : "Save Category & Schema"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DOUBLE-FACTOR SECURE AUTH OTP SIMULATOR */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-amber-500 w-5 h-5" />
                  <h3 className="text-base font-extrabold text-white">{lang === "tr" ? "ÇİFT ONAYLI ÜYELİK GÜVENLİĞİ" : "SECURE OTP PORTAL"}</h3>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="text-zinc-500 hover:text-white p-1 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === "tr" 
                  ? "Sahte ilanları ve bot hesap açılışlarını engellemek amacıyla hem E-posta hem SMS kanallı iki aşamalı doğrulama mecburiyeti bulunmaktadır. Brute force saldırılarına karşı blok mekanizmaları devrededir."
                  : "We leverage double factor (Email + Phone SMS OTP) validation vectors. Anti brute force filters lock code validation streams instantly upon 3 failed submissions."}
              </p>

              {/* Status Board */}
              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">CURRENT SECURITY MATRIX STATUS</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex justify-between">
                    <span className="text-zinc-500">Email:</span>
                    <span className={user.emailVerifiedAt ? "text-green-400 font-bold" : "text-amber-500"}>
                      {user.emailVerifiedAt ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex justify-between">
                    <span className="text-zinc-500">SMS OTP:</span>
                    <span className={user.phoneVerifiedAt ? "text-green-400 font-bold" : "text-amber-500"}>
                      {user.phoneVerifiedAt ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px]">
                  <span className="text-zinc-400">Doğrulama Durumu:</span>
                  <span className={`font-bold ${user.status === UserStatus.Fully_Verified ? "text-green-400" : "text-amber-500"}`}>
                    {user.status === UserStatus.Fully_Verified 
                      ? "Doğrulanmış Bireysel Satıcı" 
                      : user.status === UserStatus.Email_Verified 
                      ? "Sadece E-posta Doğrulandı" 
                      : "Doğrulanmamış Hesap"}
                  </span>
                </div>
              </div>

              {/* Live Status Messages */}
              {(authError || authSuccess) && (
                <div className="text-xs">
                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{authError}</p>
                    </div>
                  )}
                  {authSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex gap-2">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{authSuccess}</p>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Widgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* STEP 1: Email Auth */}
                <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5 border-b border-neutral-900 pb-2 mb-2">
                      <Mail className="w-4 h-4 text-amber-500" />
                      <span>1. E-posta Onayı</span>
                    </h5>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Sistem güvenli giriş linkini ve 6 haneli kodu h***@gmail.com adresine sevk eder.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => sendOtpCode("email")}
                      disabled={emailRateLimitTime > 0 || !!user.emailVerifiedAt}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-zinc-600 text-black text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      {emailRateLimitTime > 0 ? `Bekle: ${emailRateLimitTime}s` : "Onay Kodu Gönder"}
                    </button>

                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="Örn: 123456"
                        value={emailInputCode}
                        onChange={e => setEmailInputCode(e.target.value)}
                        disabled={!otpEmailCode || !!user.emailVerifiedAt}
                        className="bg-black text-[11px] border border-neutral-800 rounded px-2 py-1 text-white font-mono flex-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtpCode("email")}
                        disabled={!otpEmailCode || !emailInputCode || !!user.emailVerifiedAt}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1 rounded"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Phone SMS Auth */}
                <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5 border-b border-neutral-900 pb-2 mb-2">
                      <Phone className="w-4 h-4 text-amber-500" />
                      <span>2. SMS OTP Doğrulama</span>
                    </h5>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Twilio veya Netgsm üzerinden cep telefonunuza tek kullanımlık şifre gönderilir.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => sendOtpCode("sms")}
                      disabled={smsRateLimitTime > 0 || !user.emailVerifiedAt || !!user.phoneVerifiedAt}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-zinc-600 text-black text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      {smsRateLimitTime > 0 ? `Bekle: ${smsRateLimitTime}s` : "SMS Kodu Gönder"}
                    </button>

                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="Örn: 654321"
                        value={smsInputCode}
                        onChange={e => setSmsInputCode(e.target.value)}
                        disabled={!otpSmsCode || !!user.phoneVerifiedAt}
                        className="bg-black text-[11px] border border-neutral-800 rounded px-2 py-1 text-white font-mono flex-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => verifyOtpCode("sms")}
                        disabled={!otpSmsCode || !smsInputCode || !!user.phoneVerifiedAt}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1 rounded"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Simulator Reset */}
              <div className="flex gap-2 pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={resetVerificationSim}
                  className="bg-neutral-900 hover:bg-neutral-800 text-zinc-400 text-[10px] px-3 py-1.5 rounded-lg border border-neutral-800"
                >
                  🔄 Simülatör State Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs py-1.5 rounded-lg font-bold"
                >
                  Tamam, Kapat
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PROFILE WINDOW */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            
            {/* Click outside backdrop close */}
            <div className="absolute inset-0 cursor-default" onClick={() => setShowProfileModal(false)} />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 p-6 space-y-6 text-zinc-300 animate-fade-in"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-900/80 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {lang === "tr" ? "Profil Bilgilerim" : "My Profile Information"}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white transition-all border border-neutral-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status alerts */}
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-2 px-3 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Profile Details Form */}
              <div className="space-y-4">
                {/* Full Name - Read only */}
                <div>
                  <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-500 block mb-1">
                    {lang === "tr" ? "İsim Soyisim (Salt Okunur)" : "Full Name (Read-Only)"}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={user.name || ""} 
                      disabled
                      className="w-full bg-neutral-900/40 border border-neutral-900 rounded-xl px-3 py-2 text-xs text-zinc-400 font-medium cursor-not-allowed pr-8"
                    />
                    <Lock className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Email - Read only & Verification state */}
                <div>
                  <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-500 block mb-1">
                    {lang === "tr" ? "E-posta Adresi" : "Email Address"}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="email" 
                        value={user.email || ""} 
                        disabled
                        className="w-full bg-neutral-900/40 border border-neutral-900 rounded-xl px-3 py-2 text-xs text-zinc-400 font-medium cursor-not-allowed pr-8"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-2.5" />
                    </div>

                    {/* Verification Status/Button */}
                    {user.emailVerifiedAt ? (
                      <div className="flex gap-2 shrink-0">
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {lang === "tr" ? "Doğrulandı" : "Verified"}
                        </span>
                        <button
                          type="button"
                          onClick={handleProfileResetVerification}
                          className="bg-neutral-900 hover:bg-neutral-800 text-zinc-400 hover:text-white border border-neutral-800 text-[10px] font-bold px-2.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                          title={lang === "tr" ? "Onayı Sıfırla (Yeniden Doğrulamak İçin)" : "Reset Verification (To Verify Again)"}
                        >
                          {lang === "tr" ? "Sıfırla" : "Reset"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleProfileSendOtp}
                        disabled={profileRateLimitTime > 0}
                        className="bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-zinc-600 text-black text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {profileRateLimitTime > 0 
                          ? `${profileRateLimitTime}s` 
                          : (lang === "tr" ? "E-postayı Doğrula" : "Verify Email")}
                      </button>
                    )}
                  </div>

                  {/* Email Verification input sub-panel */}
                  {profileEmailVerificationSent && !user.emailVerifiedAt && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 bg-neutral-900/60 border border-neutral-900 p-3 rounded-xl space-y-2.5"
                    >
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {lang === "tr" 
                          ? "E-postanıza simüle edilmiş bir doğrulama kodu gönderdik. Aşağıya girin:" 
                          : "We sent a simulated verification code to your email. Enter it below:"}
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Örn: 123456"
                          value={profileEmailVerificationCode}
                          onChange={e => setProfileEmailVerificationCode(e.target.value)}
                          className="bg-black text-xs border border-neutral-800 rounded-xl px-3 py-1.5 text-white font-mono flex-1 text-center"
                        />
                        <button
                          type="button"
                          onClick={handleProfileVerifyOtp}
                          disabled={!profileEmailVerificationCode}
                          className="bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-zinc-600 text-black text-xs font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          {lang === "tr" ? "Doğrula" : "Verify"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Phone - Read only */}
                <div>
                  <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-500 block mb-1">
                    {lang === "tr" ? "Telefon Numarası (Salt Okunur)" : "Phone Number (Read-Only)"}
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={user.phone || ""} 
                      disabled
                      className="w-full bg-neutral-900/40 border border-neutral-900 rounded-xl px-3 py-2 text-xs text-zinc-400 font-medium cursor-not-allowed pr-8"
                    />
                    <Lock className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Country, City, District Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Country (Ülke) */}
                  <div>
                    <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-400 block mb-1">
                      {lang === "tr" ? "Ülke" : "Country"}
                    </label>
                    <select
                      value={profileCountry}
                      onChange={e => {
                        setProfileCountry(e.target.value);
                        setProfileCity("");
                        setProfileDistrict("");
                      }}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Ülke Seçin" : "Select Country"}</option>
                      {locations.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* City (Şehir) */}
                  <div>
                    <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-400 block mb-1">
                      {lang === "tr" ? "Şehir" : "City"}
                    </label>
                    <select
                      value={profileCity}
                      disabled={!profileCountry}
                      onChange={e => {
                        setProfileCity(e.target.value);
                        setProfileDistrict("");
                      }}
                      className="w-full bg-black border border-neutral-800 disabled:bg-neutral-900/50 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Şehir Seçin" : "Select City"}</option>
                      {profileCountry && (locations.find(c => c.name === profileCountry)?.cities || []).map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* District (Semt) */}
                  <div>
                    <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-400 block mb-1">
                      {lang === "tr" ? "Semt" : "District"}
                    </label>
                    <select
                      value={profileDistrict}
                      disabled={!profileCity}
                      onChange={e => setProfileDistrict(e.target.value)}
                      className="w-full bg-black border border-neutral-800 disabled:bg-neutral-900/50 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                    >
                      <option value="">{lang === "tr" ? "Semt Seçin" : "Select District"}</option>
                      {profileCity && ((locations.find(c => c.name === profileCountry)?.cities || []).find(ct => ct.name === profileCity)?.districts || []).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address - Editable */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-semibold font-mono tracking-wider text-zinc-400 block">
                      {lang === "tr" ? "Açık Adres" : "Detailed Address"}
                    </label>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      {lang === "tr" ? "Değiştirilebilir" : "Editable"}
                    </span>
                  </div>
                  <textarea 
                    value={profileAddress} 
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder={lang === "tr" ? "Sokak, kapı no, daire no vb." : "Street, building, apt number, etc."}
                    rows={3}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-neutral-900 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-zinc-400 hover:text-white border border-neutral-800 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {lang === "tr" ? "Kapat" : "Close"}
                </button>
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={profileIsSaving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-zinc-600 text-black text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {profileIsSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{lang === "tr" ? "Değişiklikleri Kaydet" : "Save Changes"}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
