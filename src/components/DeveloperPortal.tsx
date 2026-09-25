import { useState, useEffect } from 'react';
import {
  Shield, MapPin, Sparkles, Power, Bell, CreditCard, LogOut,
  Save, Crosshair, Trash2, Send, AlertTriangle, Building2, ImagePlus, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_SCHOOL_NAME, DEFAULT_LOGO_SRC, getSchoolName, getLogoSrc,
  fileToLogoDataUrl, slugifySchoolName,
} from '../lib/schoolIdentity';
import type { AppSettings, SchoolLocation, UserSession, AdminNotification, SubscriptionPlan, SubscriptionStatus } from '../types';
import { DEFAULT_SCHOOL_LOCATION, getCurrentPosition, reverseGeocode, DEMO_LOCATION_NAME_PATTERN as DEFAULT_LOC_NAME_PATTERN } from '../lib/geoUtils';
import { saveSchoolLocation, getAttendanceSettings, setAttendanceSettings } from '../lib/attendanceSettings';

interface DeveloperPortalProps {
  userSession: UserSession;
  appSettings: AppSettings;
  setAppSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onLogout: () => void;
}

type DevTab = 'overview' | 'identity' | 'location' | 'features' | 'app_control' | 'notifications' | 'subscription';

const DEV_TABS: { id: DevTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Shield size={16} /> },
  { id: 'identity', label: 'School Identity', icon: <Building2 size={16} /> },
  { id: 'location', label: 'Attendance Location', icon: <MapPin size={16} /> },
  { id: 'features', label: 'AI & Features', icon: <Sparkles size={16} /> },
  { id: 'app_control', label: 'App On / Off', icon: <Power size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
];

const FEATURE_LABELS: Record<string, string> = {
  teacher_pay: 'Teacher Pay / Salary',
  analytics: 'Analytics',
  monthly_report: 'Monthly Report',
  ai_paper: 'AI Paper Maker',
  certificates: 'Certificates',
  notices: 'Notices',
  calendar: 'Calendar',
  attendance_swipe: 'Attendance Swipe',
  quiz_module: 'Quiz Module',
  student_remarks: 'Student Remarks',
  class_diary: 'Class Diary',
  gps_checkin: 'GPS Check-in',
  whatsapp_auto: 'WhatsApp Auto',
  fees_module: 'Fees Module',
  id_cards: 'ID Cards',
  assignments: 'Assignments',
};

export default function DeveloperPortal({ userSession, appSettings, setAppSettings, onLogout }: DeveloperPortalProps) {
  const [activeTab, setActiveTab] = useState<DevTab>('overview');

  // ---- Attendance Location state ----
  const loc = appSettings.attendanceLocation ?? DEFAULT_SCHOOL_LOCATION;
  // Demo/placeholder naam (e.g. "Demo Academy (Karachi)") field mein na dikhayein —
  // Save par lat/lng se ASLI naam khud fetch ho jata hai.
  const [locName, setLocName] = useState(() =>
    DEFAULT_LOC_NAME_PATTERN.test(loc.name) ? '' : loc.name
  );
  const [locLat, setLocLat] = useState(String(loc.lat));
  const [locLng, setLocLng] = useState(String(loc.lng));
  const [locRadius, setLocRadius] = useState(String(loc.radiusMeters));
  const [gpsRestricted, setGpsRestricted] = useState(() => getAttendanceSettings().gpsRestricted);
  const [locBusy, setLocBusy] = useState(false);
  const [locFetching, setLocFetching] = useState(false);
  const [locSaving, setLocSaving] = useState(false);

  // ---- Purana demo/placeholder naam (e.g. "Demo Academy (Karachi)") localStorage mein
  // save ho chuka ho to usay lat/lng se ASLI naam se replace karein, taake admin portal
  // mein hamesha SAHI location ka naam dikhe. ----
  useEffect(() => {
    const saved = appSettings.attendanceLocation;
    if (!saved) return;
    const stale = !saved.name || DEFAULT_LOC_NAME_PATTERN.test(saved.name);
    if (!stale) return;
    let cancelled = false;
    (async () => {
      const real = await reverseGeocode(saved.lat, saved.lng);
      if (cancelled) return;
      const fixedName = real || `${saved.lat.toFixed(4)}, ${saved.lng.toFixed(4)}`;
      if (DEFAULT_LOC_NAME_PATTERN.test(fixedName)) return; // safety
      const fixed: SchoolLocation = { ...saved, name: fixedName };
      setLocName(fixedName);
      setAppSettings(prev => ({ ...prev, attendanceLocation: fixed }));
      saveSchoolLocation(fixed);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSettings.attendanceLocation?.lat, appSettings.attendanceLocation?.lng, appSettings.attendanceLocation?.name]);

  // ---- Notifications state ----
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // ---- Subscription state ----
  const sub = appSettings.subscription ?? null;
  const [subPlan, setSubPlan] = useState<SubscriptionPlan>(sub?.plan ?? 'monthly');
  const [subPrice, setSubPrice] = useState(String(sub?.pricePKR ?? 5000));
  const [subStart, setSubStart] = useState(sub?.startDate ?? new Date().toISOString().slice(0, 10));
  const [subExpiry, setSubExpiry] = useState(sub?.expiryDate ?? '');
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(sub?.status ?? 'active');
  const [subMethod, setSubMethod] = useState(sub?.paymentMethod ?? '');
  const [subNotes, setSubNotes] = useState(sub?.notes ?? '');

  // ---- School Identity state (naam + logo — poore app mein yehi use hota hai) ----
  const [idName, setIdName] = useState(() => getSchoolName(appSettings));
  const [idLogo, setIdLogo] = useState(() => getLogoSrc(appSettings));
  const [idLogoSaving, setIdLogoSaving] = useState(false);

  const notifications: AdminNotification[] = appSettings.notifications ?? [];
  const features = appSettings.featureFlags ?? {};

  /** Naam/logo sirf `appSettings` mein likhte hain — baqi sync (localStorage +
   *  Supabase `app_settings/global`) aur poori app ka display khud ho jata hai. */
  const applyIdentity = (next: { schoolName?: string; logoSrc?: string }) => {
    setAppSettings(prev => ({
      ...prev,
      ...(next.schoolName !== undefined ? { schoolName: next.schoolName } : {}),
      ...(next.logoSrc !== undefined ? { logoSrc: next.logoSrc } : {}),
    }));
  };

  const handleIdentitySave = () => {
    const clean = idName.trim();
    if (!clean) {
      toast.error('School name khali nahi ho sakta — "Reset Default" se default naam wapas lein.');
      return;
    }
    if (clean.length > 60) {
      toast.error('Naam bohat lamba hai (max 60 characters).');
      return;
    }
    setIdName(clean);
    applyIdentity({ schoolName: clean });
    toast.success(`School name saved: ${clean} — ab poori app mein yehi naam dikhega.`);
  };

  const handleIdentityReset = () => {
    setIdName(DEFAULT_SCHOOL_NAME);
    setIdLogo(DEFAULT_LOGO_SRC);
    applyIdentity({ schoolName: DEFAULT_SCHOOL_NAME, logoSrc: DEFAULT_LOGO_SRC });
    toast.success('Default school identity restore ho gayi.');
  };

  const handleLogoPick = async (file?: File | null) => {
    if (!file) return;
    setIdLogoSaving(true);
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      setIdLogo(dataUrl);
      applyIdentity({ logoSrc: dataUrl });
      toast.success('Logo save ho gaya — headers, login screen aur printouts par update ho gaya.');
    } catch (e: any) {
      toast.error(e?.message || 'Logo save nahi ho saka.');
    } finally {
      setIdLogoSaving(false);
    }
  };

  const handleLogoReset = () => {
    setIdLogo(DEFAULT_LOGO_SRC);
    applyIdentity({ logoSrc: DEFAULT_LOGO_SRC });
    toast.success('Default logo wapas laga diya.');
  };

  const toggleFlag = (key: string) => {
    setAppSettings(prev => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [key]: !prev.featureFlags[key] },
    }));
  };

  const saveLocation = async () => {
    const lat = parseFloat(locLat), lng = parseFloat(locLng), radius = parseFloat(locRadius);
    if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
      toast.error('Invalid latitude, longitude or radius.');
      return;
    }
    setLocSaving(true);
    // Agar naam khali / demo placeholder hai → lat/lng se ASLI naam khud fetch karein
    let name = locName.trim();
    if (!name || DEFAULT_LOC_NAME_PATTERN.test(name)) {
      const fetched = await fetchLocationName(lat, lng, { silent: true });
      if (fetched) name = fetched;
    }
    setLocSaving(false);
    // Naam phir bhi na mile → coordinates dikhayein (galat demo naam se behtar)
    const finalName = name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const newLoc: SchoolLocation = {
      lat,
      lng,
      radiusMeters: Math.max(1, Math.round(radius)),
      name: finalName,
    };
    setAppSettings(prev => ({ ...prev, attendanceLocation: newLoc }));
    saveSchoolLocation(newLoc);
    setAttendanceSettings({ gpsRestricted });
    setLocName(finalName);
    toast.success(`Attendance location saved — ${finalName}.`);
  };

  // Lat/Lng → asli location ka naam (geoUtils.reverseGeocode — Nominatim + BigDataCloud fallback)
  const fetchLocationName = async (
    lat: number,
    lng: number,
    opts: { silent?: boolean } = {}
  ): Promise<string | null> => {
    if (isNaN(lat) || isNaN(lng)) {
      if (!opts.silent) toast.error('Pehle valid latitude / longitude daalein.');
      return null;
    }
    if (!opts.silent) setLocFetching(true);
    try {
      const name = await reverseGeocode(lat, lng);
      if (name) {
        setLocName(name);
        if (!opts.silent) toast.success(`Location name fetched: ${name}`);
        return name;
      }
      if (!opts.silent) toast.error('Location name nahi mila — manually type karein.');
      return null;
    } catch {
      if (!opts.silent) toast.error('Reverse geocoding failed (internet check karein).');
      return null;
    } finally {
      if (!opts.silent) setLocFetching(false);
    }
  };

  const captureMyLocation = async () => {
    setLocBusy(true);
    const pos = await getCurrentPosition();
    setLocBusy(false);
    if (!pos) {
      toast.error('Could not get GPS position (needs HTTPS/localhost + permission).');
      return;
    }
    setLocLat(String(pos.latitude));
    setLocLng(String(pos.longitude));
    toast.success('GPS position captured — press Save to apply.');
    // GPS milte hi asli location ka naam khud fetch karein
    void fetchLocationName(pos.latitude, pos.longitude);
  };

  const setMaintenance = (on: boolean) => {
    setAppSettings(prev => ({ ...prev, maintenanceMode: on }));
    toast[on ? 'warning' : 'success'](on ? 'App is now OFF for non-developer users.' : 'App is now ON for everyone.');
  };

  const togglePortal = (portalKey: 'teacher' | 'student' | 'principal') => {
    setAppSettings(prev => {
      const field = `${portalKey}PortalDisabled` as const;
      const nextVal = !prev[field];
      toast[nextVal ? 'warning' : 'success'](
        `${portalKey.charAt(0).toUpperCase() + portalKey.slice(1)} Portal is now ${nextVal ? 'SUSPENDED (OFF)' : 'ACTIVE (ON)'}.`
      );
      return { ...prev, [field]: nextVal };
    });
  };

  const setPortalMsg = (portalKey: 'teacher' | 'student' | 'principal', msg: string) => {
    setAppSettings(prev => ({
      ...prev,
      [`${portalKey}PortalMessage`]: msg,
    }));
  };

  const sendNotification = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    const n: AdminNotification = {
      id: `n_${Date.now()}`,
      title: notifTitle.trim(),
      message: notifBody.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setAppSettings(prev => ({ ...prev, notifications: [n, ...(prev.notifications ?? [])] }));
    setNotifTitle('');
    setNotifBody('');
    toast.success('Notification sent to Principal.');
  };

  const removeNotification = (id: string) => {
    setAppSettings(prev => ({ ...prev, notifications: (prev.notifications ?? []).filter(n => n.id !== id) }));
  };

  const saveSubscription = () => {
    if (!subExpiry) {
      toast.error('Expiry date is required.');
      return;
    }
    setAppSettings(prev => ({
      ...prev,
      subscription: {
        plan: subPlan,
        pricePKR: Number(subPrice) || 0,
        startDate: subStart,
        expiryDate: subExpiry,
        status: subStatus,
        paymentMethod: subMethod || undefined,
        notes: subNotes || undefined,
      },
    }));
    toast.success('Subscription updated.');
  };

  const daysLeft = sub?.expiryDate
    ? Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shadow-md">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Developer Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userSession.name}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ===== SIDEBAR TABS ===== */}
        <nav className="lg:w-60 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-2 flex lg:flex-col gap-1 overflow-x-auto shrink-0">
          {DEV_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* --- OVERVIEW --- */}
          {activeTab === 'overview' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <Power size={18} className={appSettings.maintenanceMode ? 'text-red-500' : 'text-emerald-500'} />
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">App Status</p>
                  <p className={`text-sm font-black uppercase ${appSettings.maintenanceMode ? 'text-red-600' : 'text-emerald-600'}`}>
                    {appSettings.maintenanceMode ? 'OFF (Maintenance)' : 'ON'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <Sparkles size={18} className="text-teal-500" />
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Features</p>
                  <p className="text-sm font-black text-slate-900">
                    {Object.values(features).filter(Boolean).length} / {Object.keys(features).length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <Bell size={18} className="text-amber-500" />
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</p>
                  <p className="text-sm font-black text-slate-900">{notifications.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <CreditCard size={18} className="text-indigo-500" />
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription</p>
                  <p className="text-sm font-black text-slate-900 uppercase">{sub?.plan ?? 'free'}</p>
                </div>
              </div>

              {/* Portal Status Quick Overview */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Portals Access Status</span>
                  <button
                    onClick={() => setActiveTab('app_control')}
                    className="text-[10px] font-bold text-teal-600 hover:underline uppercase"
                  >
                    Manage Access →
                  </button>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    appSettings.principalPortalDisabled ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span className="text-xs font-bold text-slate-800">Principal</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      appSettings.principalPortalDisabled ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {appSettings.principalPortalDisabled ? 'OFF' : 'ON'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    appSettings.teacherPortalDisabled ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>👨‍🏫</span>
                      <span className="text-xs font-bold text-slate-800">Teacher</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      appSettings.teacherPortalDisabled ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {appSettings.teacherPortalDisabled ? 'OFF' : 'ON'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    appSettings.studentPortalDisabled ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <span className="text-xs font-bold text-slate-800">Student</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      appSettings.studentPortalDisabled ? 'bg-sky-200 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {appSettings.studentPortalDisabled ? 'OFF' : 'ON'}
                    </span>
                  </div>
                </div>
              </div>

            </section>
          )}

          {/* --- SCHOOL IDENTITY (school name + logo) --- */}
          {activeTab === 'identity' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">School Identity</h2>
              <p className="text-xs text-slate-500 font-bold max-w-3xl">
                Yahan set kiya gaya <b>naam</b> aur <b>logo</b> poori app mein use hota hai — sare portals ke headers,
                login screen, fee receipts, report cards, certificates, AI papers, WhatsApp messages aur backup file ke
                naam mein. Ye settings cloud (Supabase) mein sync hoti hain, is liye har device par khud update ho jati hain.
              </p>

              <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
                {/* ---- School Name ---- */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">School / Academy Name</p>
                  <input
                    value={idName}
                    onChange={e => setIdName(e.target.value)}
                    maxLength={60}
                    placeholder="e.g. Al-Noor Public School"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleIdentitySave}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700">
                      <Save size={14} /> Save Name
                    </button>
                    <button onClick={handleIdentityReset}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">
                      <RotateCcw size={14} /> Reset Default
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">
                    Backup file banega:{' '}
                    <span className="font-mono text-slate-500">
                      {slugifySchoolName(idName)}_backup_{new Date().toISOString().slice(0, 10)}.json
                    </span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    Blank chhodne par default <b>{DEFAULT_SCHOOL_NAME}</b> chalega.
                  </p>
                </div>

                {/* ---- School Logo ---- */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">School Logo</p>
                  <div className="flex items-center gap-4">
                    <img src={idLogo} alt="logo preview"
                      className="h-20 w-20 object-contain rounded-lg border border-slate-200 bg-white p-1.5" />
                    <div className="flex flex-col gap-2">
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-800 ${idLogoSaving ? 'opacity-60 pointer-events-none' : ''}`}>
                        <ImagePlus size={14} /> {idLogoSaving ? 'Saving…' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0] ?? null;
                            e.target.value = '';
                            void handleLogoPick(f);
                          }}
                        />
                      </label>
                      <button onClick={handleLogoReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">
                        <RotateCcw size={14} /> Default Logo
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">
                    PNG / JPG / WebP / SVG — 5 MB tak. Upload par khud compress (max 512px, WebP) hota hai taake cloud
                    sync halka rahe. Default logo: <span className="font-mono text-slate-500">{DEFAULT_LOGO_SRC}</span>
                  </p>
                </div>
              </div>
              {/* ---- Live preview (aisa hi poore app mein dikhega) ---- */}
              <div className="max-w-4xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview</p>
                <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-3">
                  <img src={idLogo} alt="logo preview" className="h-10 w-auto object-contain" />
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      {idName.trim() || DEFAULT_SCHOOL_NAME}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Principal Portal · Fee Receipt · Report Card
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <img src={idLogo} alt="logo preview" className="h-10 w-auto object-contain" />
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {idName.trim() || DEFAULT_SCHOOL_NAME}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Printable / Certificate / AI Paper header
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-4xl flex gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-800">
                  Save karte hi localStorage + Supabase (<span className="font-mono">app_settings/global</span>) mein likha
                  jata hai aur sab portals par turant update ho jata hai. Purane WhatsApp/receipt texts mein jo bhi
                  "Demo School / Demo Academy / NSB Academy" likha ho, woh bhi naye naam se replace ho jata hai.
                </p>
              </div>
            
            </section>
          )}


          {activeTab === 'location' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Teacher Attendance Location</h2>
              <p className="text-xs text-slate-500 font-bold">
                Set the school GPS location + radius. Teachers can only check in from inside this geofence.
              </p>

              {/* Currently saved location — asli naam yahan show hota hai */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 max-w-lg">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-700">Currently Saved Location</p>
                <p className="mt-1 text-sm font-black text-teal-900">
                  {appSettings.attendanceLocation?.name ?? 'Not set yet'}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-teal-700/80">
                  {appSettings.attendanceLocation
                    ? `${appSettings.attendanceLocation.lat.toFixed(5)}, ${appSettings.attendanceLocation.lng.toFixed(5)} · ${appSettings.attendanceLocation.radiusMeters} m radius`
                    : 'Set the location below and press Save.'}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 max-w-lg">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location Name</span>
                  <div className="mt-1 flex gap-2">
                    <input value={locName} onChange={e => setLocName(e.target.value)}
                      placeholder="e.g. Gulshan-e-Iqbal, Karachi"
                      className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                    <button type="button"
                      onClick={() => fetchLocationName(parseFloat(locLat), parseFloat(locLng))}
                      disabled={locFetching}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50">
                      <MapPin size={13} /> {locFetching ? 'Fetching…' : 'Fetch Name'}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 font-bold">
                    Naam khali chhor dein — “Save Location” par lat/lng se asli area naam khud aa jata hai
                    (OpenStreetMap, fallback: BigDataCloud — dono free).
                  </p>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latitude</span>
                    <input value={locLat} onChange={e => setLocLat(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Longitude</span>
                    <input value={locLng} onChange={e => setLocLng(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Radius (meters)</span>
                  <input value={locRadius} onChange={e => setLocRadius(e.target.value)} type="number"
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={gpsRestricted} onChange={e => setGpsRestricted(e.target.checked)} />
                  GPS restriction ON (teachers must be inside radius)
                </label>
                <div className="flex gap-2 pt-1">
                  <button onClick={captureMyLocation} disabled={locBusy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 disabled:opacity-50">
                    <Crosshair size={14} /> {locBusy ? 'Locating…' : 'Use My GPS'}
                  </button>
                  <button onClick={saveLocation}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700">
                    <Save size={14} /> Save Location
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* --- AI & FEATURES --- */}
          {activeTab === 'features' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI & Feature Controls</h2>
              <p className="text-xs text-slate-500 font-bold">Turn features ON/OFF for all users of the app.</p>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {Object.keys(FEATURE_LABELS).map(key => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{FEATURE_LABELS[key]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</p>
                    </div>
                    <button
                      onClick={() => toggleFlag(key)}
                      className={`w-11 h-6 rounded-full transition-all relative ${
                        features[key] ? 'bg-teal-500' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        features[key] ? 'left-[22px]' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- APP ON / OFF & PORTAL ACCESS CONTROL --- */}
          {activeTab === 'app_control' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">App & Portal Access Control</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Global app kill-switch or fine-grained portal suspension for Principal, Teachers, and Students.
                </p>
              </div>

              {/* Master App Switch */}
              <div className={`rounded-xl border-2 p-6 max-w-2xl ${
                appSettings.maintenanceMode ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'
              }`}>
                <div className="flex items-center gap-3">
                  {appSettings.maintenanceMode
                    ? <AlertTriangle size={28} className="text-red-500" />
                    : <Power size={28} className="text-emerald-500" />}
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      Global App is {appSettings.maintenanceMode ? 'OFF' : 'ON'}
                    </p>
                    <p className="text-xs text-slate-500 font-bold">
                      {appSettings.maintenanceMode
                        ? 'Principal, Teachers & Students see a maintenance screen. You (developer) keep full access.'
                        : 'All users can access the app normally.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMaintenance(!appSettings.maintenanceMode)}
                  className={`mt-4 w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-md ${
                    appSettings.maintenanceMode
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {appSettings.maintenanceMode ? 'Turn Entire App ON' : 'Turn Entire App OFF (Maintenance Mode)'}
                </button>
              </div>

              {/* Individual Portal Controls */}
              <div className="max-w-2xl space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Individual Portal Switches
                </h3>

                {/* 1. Teacher Portal */}
                <div className={`p-4 rounded-xl border transition-all ${
                  appSettings.teacherPortalDisabled
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        appSettings.teacherPortalDisabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        👨‍🏫
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase text-slate-900">Teacher Portal</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            appSettings.teacherPortalDisabled
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {appSettings.teacherPortalDisabled ? 'Suspended (OFF)' : 'Active (ON)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Control whether teachers can log in or access dashboard.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePortal('teacher')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shrink-0 ${
                        appSettings.teacherPortalDisabled
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {appSettings.teacherPortalDisabled ? 'Enable Portal' : 'Suspend Portal'}
                    </button>
                  </div>
                  {appSettings.teacherPortalDisabled && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">
                        Notice message shown to teachers
                      </label>
                      <input
                        type="text"
                        value={appSettings.teacherPortalMessage ?? ''}
                        onChange={(e) => setPortalMsg('teacher', e.target.value)}
                        placeholder="Teacher portal is temporarily suspended by administration."
                        className="w-full text-xs font-bold px-3 py-2 border border-amber-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>
                {/* 2. Student Portal */}
                <div className={`p-4 rounded-xl border transition-all ${
                  appSettings.studentPortalDisabled
                    ? 'bg-sky-50/70 border-sky-300'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        appSettings.studentPortalDisabled ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        🎓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase text-slate-900">Student Portal</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            appSettings.studentPortalDisabled
                              ? 'bg-sky-200 text-sky-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {appSettings.studentPortalDisabled ? 'Suspended (OFF)' : 'Active (ON)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Block or allow student portal view, marks, quizzes & diary.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePortal('student')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shrink-0 ${
                        appSettings.studentPortalDisabled
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-sky-600 hover:bg-sky-700'
                      }`}
                    >
                      {appSettings.studentPortalDisabled ? 'Enable Portal' : 'Suspend Portal'}
                    </button>
                  </div>
                  {appSettings.studentPortalDisabled && (
                    <div className="mt-3 pt-3 border-t border-sky-200/60">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-sky-800 mb-1">
                        Notice message shown to students
                      </label>
                      <input
                        type="text"
                        value={appSettings.studentPortalMessage ?? ''}
                        onChange={(e) => setPortalMsg('student', e.target.value)}
                        placeholder="Student portal is temporarily closed for maintenance."
                        className="w-full text-xs font-bold px-3 py-2 border border-sky-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>
                {/* 3. Principal Portal */}
                <div className={`p-4 rounded-xl border transition-all ${
                  appSettings.principalPortalDisabled
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        appSettings.principalPortalDisabled ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        🏛️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase text-slate-900">Principal Portal</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            appSettings.principalPortalDisabled
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {appSettings.principalPortalDisabled ? 'Suspended (OFF)' : 'Active (ON)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Disable Principal/Coordinator administrative workspace.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePortal('principal')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shrink-0 ${
                        appSettings.principalPortalDisabled
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {appSettings.principalPortalDisabled ? 'Enable Portal' : 'Suspend Portal'}
                    </button>
                  </div>
                  {appSettings.principalPortalDisabled && (
                    <div className="mt-3 pt-3 border-t border-rose-200/60">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-rose-800 mb-1">
                        Notice message shown to Principal/Coordinator
                      </label>
                      <input
                        type="text"
                        value={appSettings.principalPortalMessage ?? ''}
                        onChange={(e) => setPortalMsg('principal', e.target.value)}
                        placeholder="Principal portal access is temporarily disabled by developer admin."
                        className="w-full text-xs font-bold px-3 py-2 border border-rose-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>


              </div>
            </section>
          )}

          {/* --- NOTIFICATIONS --- */}
          {activeTab === 'notifications' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Notifications → Principal</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 max-w-lg">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Title</span>
                  <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="e.g. System Update"
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message</span>
                  <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} rows={3}
                    placeholder="Message for the Principal…"
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold resize-none" />
                </label>
                <button onClick={sendNotification}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700">
                  <Send size={14} /> Send to Principal
                </button>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 && (
                  <p className="text-xs font-bold text-slate-400">No notifications sent yet.</p>
                )}
                {notifications.map(n => (
                  <div key={n.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 font-bold">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeNotification(n.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- SUBSCRIPTION --- */}
          {activeTab === 'subscription' && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Subscription</h2>

              {/* Status cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <CreditCard size={18} className="text-teal-500" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</p>
                  <p className="text-sm font-black text-slate-800 uppercase">{sub?.plan ?? 'free'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <Save size={18} className="text-emerald-500" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Price</p>
                  <p className="text-sm font-black text-slate-800">PKR {sub?.pricePKR?.toLocaleString() ?? '0'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <AlertTriangle size={18} className={daysLeft !== null && daysLeft <= 7 ? 'text-red-500' : 'text-amber-500'} />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Days Left</p>
                  <p className="text-sm font-black text-slate-800">{daysLeft !== null ? `${daysLeft} din` : '—'}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <Power size={18} className={sub?.status === 'active' ? 'text-emerald-500' : 'text-red-500'} />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                  <p className={`text-sm font-black uppercase ${sub?.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>{sub?.status ?? 'expired'}</p>
                </div>
              </div>

              {/* Expiry warning */}
              {daysLeft !== null && daysLeft <= 7 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    Subscription {daysLeft <= 0 ? 'expire ho chuki hai' : `${daysLeft} din mein expire hone wali hai`} — Principal ko warning dikhegi.
                  </p>
                </div>
              )}

              {/* Edit form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 grid sm:grid-cols-2 gap-3 max-w-2xl">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</span>
                  <select value={subPlan} onChange={e => setSubPlan(e.target.value as SubscriptionPlan)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold bg-white">
                    <option value="free">Free</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price (PKR)</span>
                  <input type="number" value={subPrice} onChange={e => setSubPrice(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date</span>
                  <input type="date" value={subStart} onChange={e => setSubStart(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date</span>
                  <input type="date" value={subExpiry} onChange={e => setSubExpiry(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</span>
                  <select value={subStatus} onChange={e => setSubStatus(e.target.value as SubscriptionStatus)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold bg-white">
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="expired">Expired</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Method</span>
                  <input value={subMethod} onChange={e => setSubMethod(e.target.value)} placeholder="e.g. JazzCash / Bank"
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notes</span>
                  <textarea value={subNotes} onChange={e => setSubNotes(e.target.value)} rows={2}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold resize-none" />
                </label>
                <div className="sm:col-span-2">
                  <button onClick={saveSubscription}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700">
                    <Save size={14} /> Save Subscription
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}


