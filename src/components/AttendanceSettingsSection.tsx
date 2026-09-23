import { L } from '../lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Navigation, LocateFixed, CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { SchoolLocation } from '../types';
import { getAttendanceSettings, setAttendanceSettings, saveSchoolLocation } from '../lib/attendanceSettings';
import { reverseGeocode, DEMO_LOCATION_NAME_PATTERN } from '../lib/geoUtils';

interface AttendanceSettingsSectionProps {
  schoolLocation: SchoolLocation;
  onSaved?: (loc: SchoolLocation) => void;
}

/**
 * Attendance Collection Settings — Principal ke Settings tab ke liye.
 * GPS-restricted check-in toggle + school GPS location (lat/lng/radius)
 * yahan se configure hota hai. Teacher ka check-in isi par verify hota hai.
 */
export default function AttendanceSettingsSection({ schoolLocation, onSaved }: AttendanceSettingsSectionProps) {
  const [gpsRestricted, setGpsRestricted] = useState<boolean>(() => getAttendanceSettings().gpsRestricted);
  const [name, setName] = useState<string>(schoolLocation.name);
  const [lat, setLat] = useState<string>(String(schoolLocation.lat));
  const [lng, setLng] = useState<string>(String(schoolLocation.lng));
  const [radius, setRadius] = useState<string>(String(schoolLocation.radiusMeters));
  const [locating, setLocating] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const toggleGpsRestricted = () => {
    const next = !gpsRestricted;
    setGpsRestricted(next);
    setAttendanceSettings({ gpsRestricted: next });
    toast.success(next
      ? L('GPS-restricted check-in ON — teachers can check in only inside the school radius.', 'GPS محدود حاضری آن — اساتذہ صرف اسکول کے دائرے میں حاضری لگا سکتے ہیں۔')
      : L('GPS-restricted check-in OFF — teachers can check in from any location.', 'GPS محدود حاضری آف — اساتذہ کسی بھی جگہ سے حاضری لگا سکتے ہیں۔'));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(L('Geolocation is not available in this browser.', 'اس براؤزر میں لوکیشن دستیاب نہیں۔'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success(L('Current location found — press Save Location to confirm.', 'موجودہ مقام مل گیا — تصدیق کے لیے Save Location دبائیں۔'));
      },
      () => {
        setLocating(false);
        toast.error(L('Device location not found. Enter the coordinates manually (copy from Google Maps).', 'ڈیوائس کی لوکیشن نہیں ملی۔ کوآرڈینیٹس خود درج کریں (گوگل میپس سے کاپی کریں)۔'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveLocation = async () => {
    const nLat = Number(lat);
    const nLng = Number(lng);
    const nRadius = Number(radius);
    if (isNaN(nLat) || isNaN(nLng) || nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) {
      toast.error(L('Enter a valid Latitude (-90..90) and Longitude (-180..180).', 'درست Latitude (-90..90) اور Longitude (-180..180) درج کریں۔'));
      return;
    }
    if (isNaN(nRadius) || nRadius <= 0) {
      toast.error(L('Enter a valid radius in meters — minimum 1 m.', 'درست رداس (میٹر میں) درج کریں — کم از کم 1 میٹر۔'));
      return;
    }
    // Naam khali ho ya purana demo/placeholder (e.g. "Demo Academy") ho → lat/lng se ASLI naam fetch karein
    let resolvedName = name.trim();
    if (!resolvedName || DEMO_LOCATION_NAME_PATTERN.test(resolvedName)) {
      const fetched = await reverseGeocode(nLat, nLng);
      if (fetched) resolvedName = fetched;
    }
    const loc: SchoolLocation = {
      lat: nLat,
      lng: nLng,
      radiusMeters: Math.max(1, Math.round(nRadius)),
      name: resolvedName || `${nLat.toFixed(4)}, ${nLng.toFixed(4)}`,
    };
    setName(loc.name);
    saveSchoolLocation(loc);
    setAttendanceSettings({ gpsRestricted });
    onSaved?.(loc);
    flashSaved();
    toast.success(L('Attendance location saved — teacher GPS will now be checked against the new coordinates.', 'حاضری کا مقام محفوظ ہو گیا — اساتذہ کا GPS اب نئے کوآرڈینیٹس سے جانچا جائے گا۔'));
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm border-t-4 border-t-sky-500">
      {/* Decorative glows */}
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-sky-500/15 to-blue-500/10 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative p-3 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-xl text-white shadow-lg shadow-sky-200 ring-4 ring-sky-500/15">
            <MapPin size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Attendance Collection — Location Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {L('Teacher check-in verification is controlled here.', 'اساتذہ کی حاضری کی تصدیق یہاں سے کنٹرول ہوتی ہے۔')}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
            gpsRestricted ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20'
          }`}
        >
          {gpsRestricted ? (
            <><ShieldCheck size={13} /> GPS Restricted — ON</>
          ) : (
            <><ShieldAlert size={13} /> GPS Restricted — OFF</>
          )}
        </span>
      </div>

      {/* GPS toggle */}
      <div className="mt-4 flex items-center justify-between p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="space-y-0.5">
          <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">GPS-Restricted Check-In</p>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            {gpsRestricted
              ? L('Teachers can check in only INSIDE the school radius.', 'اساتذہ صرف اسکول کے دائرے کے اندر حاضری لگا سکتے ہیں۔')
              : L('Teachers can check in from any location (manual allowance).', 'اساتذہ کسی بھی جگہ سے حاضری لگا سکتے ہیں (دستی اجازت)۔')}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleGpsRestricted}
          className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ${gpsRestricted ? 'bg-sky-600' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${gpsRestricted ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {/* School location form */}
      <div className="mt-4">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">
          School GPS Location (Attendance Radius)
        </label>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
          {L('Teacher check-in works only INSIDE this radius. Copy the coordinates from Google Maps.', 'اساتذہ کی حاضری صرف اسی دائرے کے اندر قبول ہوتی ہے۔ کوآرڈینیٹس گوگل میپس سے کاپی کریں۔')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Latitude</label>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="24.860700"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:focus:ring-sky-400/30"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Longitude</label>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="67.001100"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:focus:ring-sky-400/30"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Radius (m)</label>
            <input
              type="number"
              min={1}
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="500"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:focus:ring-sky-400/30"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Location Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gulshan-e-Iqbal, Karachi"
              className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:focus:ring-sky-400/30"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="px-4 py-2 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <LocateFixed size={13} className={locating ? 'animate-pulse' : ''} />
            {locating ? 'Locating...' : 'Use My Location'}
          </button>
          <button
            type="button"
            onClick={handleSaveLocation}
            className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-sky-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Navigation size={13} /> {savedFlash ? 'Saved ✓' : 'Save Location'}
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-slate-500">
            {gpsRestricted ? (
              <><CheckCircle2 size={12} className="text-sky-600" /> {L('Check-in only from inside the school', 'حاضری صرف اسکول کے اندر سے')}</>
            ) : (
              <><XCircle size={12} className="text-amber-500" /> {L('Check-in allowed from any location', 'حاضری کسی بھی جگہ سے ممکن ہے')}</>
            )}
          </span>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-xl text-[11px] text-sky-800 dark:text-sky-200 leading-relaxed">
        <p className="font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
          <MapPin size={11} /> How It Works
        </p>
        {L("In the teacher's ", 'استاد کے ')}<strong>{L('My Attendance', 'میری حاضری')}</strong>{L(' tab, pressing ', ' ٹیب میں ')}<strong>{L('Check-In', 'حاضری لگائیں')}</strong>{L(" compares the browser's live GPS", ' دبانے پر براؤزر کا لائیو GPS')}
        {L(' with the school location (Haversine distance). With ', ' اسکول کے مقام سے موازنہ ہوتا ہے۔ ')}<strong>{L('GPS Restricted ON', 'GPS محدود آن')}</strong>{L(', if the distance is too large', ' ہونے پر فاصلہ زیادہ ہو تو')}
        {L(' check-in is blocked. If the device GPS is unavailable, the teacher can use the "Demo GPS (School Location)" checkbox.', ' حاضری بلاک ہو جاتی ہے۔ ڈیوائس GPS نہ ملے تو استاد "Demo GPS (School Location)" چیک باکس استعمال کر سکتا ہے۔')}
      </div>
    </div>
  );
}