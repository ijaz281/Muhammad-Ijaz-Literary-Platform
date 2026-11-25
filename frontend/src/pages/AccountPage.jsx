import { useEffect, useRef, useState } from "react";
import { User, Mail, Lock, LogIn, UserPlus, LogOut, LoaderCircle, Save, ShieldCheck, RefreshCw } from "lucide-react";
import Container from "../components/ui/Container";
import { getMyCommunityProfile, updateMyCommunityProfile } from "../services/communityService";
import {
  loginUser, registerUser, verifySignupOTP, verifyLoginOTP, resendOTP,
  getCurrentUser, updateCurrentUser, logoutUser, isAuthenticated,
} from "../services/authService";

const initialForm = { username: "", email: "", first_name: "", last_name: "", password: "", password_confirm: "" };

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(null);
  const [communityProfile, setCommunityProfile] = useState({ bio: "", avatar: null, is_private: false });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [challenge, setChallenge] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [resendLeft, setResendLeft] = useState(60);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([getCurrentUser(), getMyCommunityProfile()]).then(([account, profile]) => { setUser(account); setCommunityProfile(profile); }).catch(() => {
      getCurrentUser().then(setUser).catch(() => { logoutUser(); setAuthenticated(false); setUser(null); });
    });
  }, [authenticated]);

  useEffect(() => {
    if (!challenge) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((v) => Math.max(0, v - 1));
      setResendLeft((v) => Math.max(0, v - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function showError(err) {
    const data = err.response?.data;
    if (data && typeof data === "object") {
      const first = Object.values(data).flat()[0];
      setError(String(first || "آپ کی درخواست مکمل نہیں ہو سکی۔"));
    } else setError("آپ کی درخواست مکمل نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔");
  }

  async function handleSubmit(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const result = mode === "register"
        ? await registerUser(form)
        : await loginUser({ username: form.username, password: form.password });
      setChallenge({ id: result.challenge_id, purpose: mode === "register" ? "signup" : "login", email: mode === "register" ? form.email : "آپ کا رجسٹرڈ ای میل" });
      setOtp(["", "", "", ""]); setSecondsLeft(300); setResendLeft(60);
      setMessage(result.detail || "تصدیقی کوڈ آپ کے ای میل پتے پر بھیج دیا گیا ہے۔");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  async function handleVerify(event) {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) { setError("براہِ کرم چار ہندسوں کا مکمل تصدیقی کوڈ درج کریں۔"); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const payload = { challenge_id: challenge.id, otp: code };
      if (challenge.purpose === "signup") {
        const result = await verifySignupOTP(payload);
        setChallenge(null); setMode("login"); setForm((f) => ({ ...initialForm, username: f.username }));
        setMessage(result.detail || "اکاؤنٹ کی تصدیق کامیابی سے مکمل ہو گئی۔ براہِ کرم لاگ اِن کریں۔");
      } else {
        await verifyLoginOTP(payload);
        setChallenge(null); setAuthenticated(true); setMessage("آپ کے ای میل کی تصدیق ہو گئی ہے۔ آپ لاگ اِن ہو چکے ہیں۔");
      }
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  function updateOtp(index, value) {
    const digits = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, i) => i === index ? digits : item));
    if (digits && index < 3) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpPaste(event) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!digits) return;
    event.preventDefault();
    setOtp([0, 1, 2, 3].map((i) => digits[i] || ""));
    otpRefs.current[Math.min(digits.length, 3)]?.focus();
  }

  async function handleResend() {
    if (resendLeft > 0 || !challenge) return;
    setLoading(true); setError("");
    try {
      await resendOTP(challenge.id); setSecondsLeft(300); setResendLeft(60); setOtp(["", "", "", ""]);
      setMessage("نیا تصدیقی کوڈ بھیج دیا گیا ہے۔"); otpRefs.current[0]?.focus();
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  async function handleProfileSave(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const updated = await updateCurrentUser({ first_name: user.first_name, last_name: user.last_name, email: user.email });
      setUser(updated); setMessage("پروفائل کامیابی سے اپ ڈیٹ ہو گئی۔");
    } catch { setError("پروفائل اپ ڈیٹ نہیں ہو سکی۔"); }
    finally { setLoading(false); }
  }

  function handleLogout() {
    logoutUser(); setAuthenticated(false); setUser(null); setMessage("آپ کامیابی سے لاگ آؤٹ ہو گئے ہیں۔"); setError("");
  }

  async function handleCommunityProfileSave(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const payload = new FormData();
      payload.append("bio", communityProfile.bio || "");
      payload.append("is_private", String(Boolean(communityProfile.is_private)));
      if (avatarFile) payload.append("avatar", avatarFile);
      const updated = await updateMyCommunityProfile(payload);
      setCommunityProfile(updated); setAvatarFile(null); setMessage("کمیونٹی پروفائل کامیابی سے اپ ڈیٹ ہو گئی۔");
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  const clock = (value) => `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;

  const fieldClass = "w-full rounded-xl border border-[#e7e0d3] bg-[#fffdf9] px-4 py-3.5 text-right text-base text-literary-ink outline-none transition placeholder:text-gray-400 focus:border-literary-gold focus:ring-4 focus:ring-literary-gold/10";
  const labelClass = "mb-2 block text-lg font-bold text-literary-navy";

  return (
    <main dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top_right,#efe5d1_0,transparent_34%),linear-gradient(135deg,#f8f5ee_0%,#f2ecdf_100%)] px-4 py-12 sm:px-6 sm:py-20">
      <Container>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#e4dac8] bg-white shadow-[0_28px_90px_rgba(16,45,37,0.13)] lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-literary-navy p-8 text-white sm:p-10 lg:min-h-full">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-literary-gold/20" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-literary-gold/10 blur-3xl" />
            <div className="relative">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-literary-gold/40 bg-white/5 text-3xl text-literary-gold">✦</div>
              <p className="font-urdu text-lg text-literary-gold">اعجاز الحق — ادبی پلیٹ فارم</p>
              <h1 className="mt-5 font-urdu text-4xl font-bold leading-[1.8] sm:text-5xl">آپ کی ادبی دنیا، آپ کے نام</h1>
              <p className="mt-5 font-urdu text-xl leading-[2.2] text-white/75">اپنا اکاؤنٹ بنائیے، پسندیدہ تحریروں سے جڑیے اور ادبی برادری کا حصہ بنیے۔</p>
            </div>
            <div className="relative mt-10 border-t border-white/15 pt-5">
              <p className="font-urdu text-lg leading-[2] text-white/60">علم، ادب اور خیال کے سفر میں خوش آمدید۔</p>
            </div>
          </aside>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 text-center">
              <p className="font-urdu text-lg font-bold text-literary-gold-dark">آپ کی ذاتی جگہ</p>
              <h2 className="mt-2 font-urdu text-4xl font-bold text-literary-navy sm:text-5xl">میرا اکاؤنٹ</h2>
              <p className="mt-3 font-urdu text-lg leading-8 text-gray-500">جاری رکھنے کے لیے اپنی معلومات درج کریں۔</p>
            </div>

            {message && <p role="status" className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-urdu text-lg leading-8 text-green-800">{message}</p>}
            {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-urdu text-lg leading-8 text-red-700">{error}</p>}

            {challenge ? (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><ShieldCheck size={30}/></div>
                <h3 className="mt-5 font-urdu text-3xl font-bold text-literary-navy">ای میل کی تصدیق</h3>
                <p className="mt-3 font-urdu text-lg leading-[2] text-gray-600">آپ کے ای میل پتے <strong dir="auto" className="inline-block">{challenge.email}</strong> پر بھیجا گیا چار ہندسوں کا کوڈ درج کریں۔ کوڈ پانچ منٹ تک مؤثر رہے گا۔</p>
                <form onSubmit={handleVerify} className="mt-7">
                  <div className="flex justify-center gap-3" dir="ltr" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => <input key={index} ref={(el) => { otpRefs.current[index] = el; }} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`تصدیقی کوڈ کا ہندسہ ${index + 1}`} value={digit} maxLength={1} onChange={(e) => updateOtp(index, e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !digit && index > 0) otpRefs.current[index - 1]?.focus(); }} className="h-14 w-12 rounded-xl border border-gray-300 text-center text-2xl font-bold text-literary-navy outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 sm:h-16 sm:w-14" />)}
                  </div>
                  <div className="mt-4 flex justify-between gap-3 font-urdu text-base text-gray-500"><span>کوڈ کی مدت: <b dir="ltr">{clock(secondsLeft)}</b></span><span>دوبارہ بھیجیں: <b dir="ltr">{clock(resendLeft)}</b></span></div>
                  {secondsLeft === 0 && <p className="mt-3 font-urdu text-base text-red-600">کوڈ کی مدت ختم ہو گئی ہے۔ نیا کوڈ حاصل کریں۔</p>}
                  <button type="submit" disabled={loading || otp.join("").length !== 4 || secondsLeft === 0} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-literary-navy px-6 py-4 font-urdu text-xl font-bold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:opacity-50">{loading ? <LoaderCircle size={18} className="animate-spin"/> : <ShieldCheck size={18}/>} کوڈ کی تصدیق کریں</button>
                </form>
                <button type="button" onClick={handleResend} disabled={loading || resendLeft > 0} className="mt-5 inline-flex items-center gap-2 font-urdu text-lg font-bold text-amber-800 disabled:text-gray-400"><RefreshCw size={16}/> تصدیقی کوڈ دوبارہ بھیجیں</button>
                <button type="button" onClick={() => { setChallenge(null); setError(""); setMessage(""); }} className="mt-4 block w-full font-urdu text-base text-gray-500 hover:text-gray-800">تصدیق منسوخ کریں</button>
              </div>
            ) : authenticated && user ? (
              <>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-literary-cream p-5">
                  <div><h3 className="font-urdu text-2xl font-bold text-literary-navy">خوش آمدید، {user.first_name || user.username}</h3><p className="mt-1 font-urdu text-base text-gray-500">اپنے اکاؤنٹ کی معلومات میں ترمیم کریں۔</p></div>
                  <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 font-urdu text-lg font-bold text-red-600 hover:bg-red-50"><LogOut size={17}/> لاگ آؤٹ</button>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div><label className={labelClass}>صارف نام</label><input value={user.username || ""} disabled dir="ltr" className={`${fieldClass} bg-gray-100 text-left`} /></div>
                  {[["پہلا نام","first_name"],["خاندانی نام","last_name"],["ای میل","email"]].map(([label,key]) => <div key={key}><label className={labelClass}>{label}</label><input type={key === "email" ? "email" : "text"} dir={key === "email" ? "ltr" : "rtl"} value={user[key] || ""} onChange={(e) => setUser({ ...user, [key]: e.target.value })} className={fieldClass}/></div>)}
                  <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-literary-navy px-7 py-3.5 font-urdu text-xl font-bold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60"><Save size={18}/> پروفائل محفوظ کریں</button>
                </form>
                <form onSubmit={handleCommunityProfileSave} className="mt-10 space-y-5 border-t border-gray-200 pt-8">
                  <div><h3 className="font-urdu text-2xl font-bold text-literary-navy">کمیونٹی پروفائل</h3><p className="mt-2 font-urdu text-lg leading-8 text-gray-500">اپنے قاری کے پروفائل کے لیے مختصر تعارف اور تصویر شامل کریں۔</p></div>
                  {communityProfile.avatar && <img src={communityProfile.avatar} alt="موجودہ پروفائل" className="h-20 w-20 rounded-full border border-gray-200 object-cover"/>}
                  <div><label className={labelClass}>پروفائل تصویر</label><input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600"/></div>
                  <div><label className={labelClass}>تعارف (زیادہ سے زیادہ 500 حروف)</label><textarea rows={4} maxLength={500} value={communityProfile.bio || ""} onChange={(e) => setCommunityProfile({ ...communityProfile, bio: e.target.value })} className={fieldClass}/></div>
                  <label className="flex items-center gap-3 font-urdu text-lg text-gray-700"><input type="checkbox" checked={Boolean(communityProfile.is_private)} onChange={(e) => setCommunityProfile({ ...communityProfile, is_private: e.target.checked })}/> میرا کمیونٹی پروفائل نجی رکھیں</label>
                  <button disabled={loading} className="flex items-center gap-2 rounded-xl border border-literary-navy px-7 py-3.5 font-urdu text-xl font-bold text-literary-navy transition hover:bg-literary-navy hover:text-white disabled:opacity-60"><Save size={18}/> کمیونٹی پروفائل محفوظ کریں</button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 grid grid-cols-2 rounded-xl bg-literary-cream p-1.5">
                  {[["login","لاگ اِن",LogIn],["register","نیا اکاؤنٹ",UserPlus]].map(([key,label,Icon]) => <button key={key} onClick={() => { setMode(key); setError(""); setMessage(""); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3.5 font-urdu text-xl font-bold transition ${mode === key ? "bg-literary-navy text-white shadow-md" : "text-gray-500 hover:text-literary-navy"}`}><Icon size={18}/>{label}</button>)}
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "register" && <>
                    <div><label className={labelClass}>ای میل ایڈریس</label><input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" dir="ltr" className={`${fieldClass} text-left`} placeholder="مثلاً: name@example.com"/></div>
                    <div><label className={labelClass}>پہلا نام</label><input name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" className={fieldClass} placeholder="اپنا پہلا نام درج کریں"/></div>
                    <div><label className={labelClass}>خاندانی نام</label><input name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" className={fieldClass} placeholder="اپنا خاندانی نام درج کریں"/></div>
                  </>}
                  <div><label className={labelClass}>صارف نام</label><div className="relative"><User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/><input name="username" value={form.username} onChange={handleChange} required autoComplete="username" dir="ltr" className={`${fieldClass} pr-11 text-left`} placeholder="صارف نام درج کریں"/></div></div>
                  <div><label className={labelClass}>پاس ورڈ</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete={mode === "login" ? "current-password" : "new-password"} dir="ltr" className={`${fieldClass} pr-11 text-left`} placeholder="پاس ورڈ درج کریں"/></div></div>
                  {mode === "register" && <div><label className={labelClass}>پاس ورڈ کی تصدیق</label><input type="password" name="password_confirm" value={form.password_confirm} onChange={handleChange} required autoComplete="new-password" dir="ltr" className={`${fieldClass} text-left`} placeholder="پاس ورڈ دوبارہ درج کریں"/></div>}
                  <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl bg-literary-navy px-7 py-4 font-urdu text-xl font-bold text-white shadow-lg shadow-literary-navy/10 transition hover:-translate-y-0.5 hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={19}/> : mode === "login" ? <LogIn size={19}/> : <Mail size={19}/>} {loading ? "براہِ کرم انتظار کریں..." : mode === "login" ? "ای میل کی تصدیق کے لیے آگے بڑھیں" : "رجسٹریشن کریں اور ای میل کی تصدیق کریں"}</button>
                </form>
                <p className="mt-6 text-center font-urdu text-base leading-8 text-gray-500">آپ کی معلومات محفوظ رہیں گی اور صرف اکاؤنٹ سے متعلقہ مقاصد کے لیے استعمال ہوں گی۔</p>
              </>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
