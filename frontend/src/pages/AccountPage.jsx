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
      setError(String(first || "Unable to complete your request."));
    } else setError("Unable to complete your request. Please try again.");
  }

  async function handleSubmit(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const result = mode === "register"
        ? await registerUser(form)
        : await loginUser({ username: form.username, password: form.password });
      setChallenge({ id: result.challenge_id, purpose: mode === "register" ? "signup" : "login", email: mode === "register" ? form.email : "your registered email" });
      setOtp(["", "", "", ""]); setSecondsLeft(300); setResendLeft(60);
      setMessage(result.detail || "A verification code has been sent to your email.");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  async function handleVerify(event) {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) { setError("Enter the complete four-digit verification code."); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const payload = { challenge_id: challenge.id, otp: code };
      if (challenge.purpose === "signup") {
        const result = await verifySignupOTP(payload);
        setChallenge(null); setMode("login"); setForm((f) => ({ ...initialForm, username: f.username }));
        setMessage(result.detail || "Account verified successfully. Please log in.");
      } else {
        await verifyLoginOTP(payload);
        setChallenge(null); setAuthenticated(true); setMessage("Your email is verified. You are now logged in.");
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
      setMessage("A new verification code has been sent."); otpRefs.current[0]?.focus();
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  async function handleProfileSave(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const updated = await updateCurrentUser({ first_name: user.first_name, last_name: user.last_name, email: user.email });
      setUser(updated); setMessage("Profile updated successfully.");
    } catch { setError("Unable to update your profile."); }
    finally { setLoading(false); }
  }

  function handleLogout() {
    logoutUser(); setAuthenticated(false); setUser(null); setMessage("You have been logged out."); setError("");
  }

  async function handleCommunityProfileSave(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const payload = new FormData();
      payload.append("bio", communityProfile.bio || "");
      payload.append("is_private", String(Boolean(communityProfile.is_private)));
      if (avatarFile) payload.append("avatar", avatarFile);
      const updated = await updateMyCommunityProfile(payload);
      setCommunityProfile(updated); setAvatarFile(null); setMessage("Community profile updated successfully.");
    } catch (err) { showError(err); }
    finally { setLoading(false); }
  }

  const clock = (value) => `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-[#f8f7f3] py-16 sm:py-24"><Container><div className="mx-auto max-w-2xl">
      <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.3em] text-literary-gold">Your Personal Space</p><h1 className="mt-4 font-serif text-4xl font-bold text-literary-navy sm:text-5xl">My Account</h1></div>
      <div className="mt-12 border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
        {message && <p role="status" className="mb-6 bg-green-50 p-4 text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="mb-6 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        {challenge ? (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700"><ShieldCheck size={30}/></div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-literary-navy">Verify your email</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Enter the four-digit code sent to <strong>{challenge.email}</strong>. The code expires in five minutes.</p>
            <form onSubmit={handleVerify} className="mt-7">
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => <input key={index} ref={(el) => { otpRefs.current[index] = el; }} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`OTP digit ${index + 1}`} value={digit} maxLength={1} onChange={(e) => updateOtp(index, e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !digit && index > 0) otpRefs.current[index - 1]?.focus(); }} className="h-14 w-12 rounded-lg border border-gray-300 text-center text-2xl font-bold text-literary-navy outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 sm:h-16 sm:w-14" />)}
              </div>
              <div className="mt-4 flex justify-between text-xs text-gray-500"><span>Code expires in {clock(secondsLeft)}</span><span>Resend in {clock(resendLeft)}</span></div>
              {secondsLeft === 0 && <p className="mt-3 text-sm text-red-600">This code has expired. Request a new one.</p>}
              <button type="submit" disabled={loading || otp.join("").length !== 4 || secondsLeft === 0} className="mt-6 flex w-full items-center justify-center gap-2 bg-literary-navy px-6 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:opacity-50">{loading ? <LoaderCircle size={18} className="animate-spin"/> : <ShieldCheck size={18}/>} Verify code</button>
            </form>
            <button type="button" onClick={handleResend} disabled={loading || resendLeft > 0} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 disabled:text-gray-400"><RefreshCw size={15}/> Resend verification code</button>
            <button type="button" onClick={() => { setChallenge(null); setError(""); setMessage(""); }} className="mt-4 block w-full text-sm text-gray-500 hover:text-gray-800">Cancel verification</button>
          </div>
        ) : authenticated && user ? (
          <>
            <div className="mb-8 flex items-center justify-between gap-4"><div><h2 className="font-serif text-2xl font-bold text-literary-navy">Welcome, {user.first_name || user.username}</h2><p className="mt-2 text-sm text-gray-500">Manage your account information.</p></div><button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800"><LogOut size={18}/> Logout</button></div>
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div><label className="mb-2 block text-sm font-semibold">Username</label><input value={user.username || ""} disabled className="w-full border border-gray-200 bg-gray-100 px-4 py-3"/></div>
              {[['First Name','first_name'],['Last Name','last_name'],['Email','email']].map(([label,key]) => <div key={key}><label className="mb-2 block text-sm font-semibold">{label}</label><input type={key === "email" ? "email" : "text"} value={user[key] || ""} onChange={(e) => setUser({ ...user, [key]: e.target.value })} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold"/></div>)}
              <button disabled={loading} className="flex items-center gap-2 bg-literary-navy px-7 py-3 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60"><Save size={18}/> Save Profile</button>
            </form>
            <form onSubmit={handleCommunityProfileSave} className="mt-10 space-y-5 border-t border-gray-200 pt-8">
              <div><h3 className="font-serif text-xl font-bold text-literary-navy">Community profile</h3><p className="mt-1 text-sm text-gray-500">Add a short biography and profile image for your reader profile.</p></div>
              {communityProfile.avatar && <img src={communityProfile.avatar} alt="Current profile" className="h-20 w-20 rounded-full border border-gray-200 object-cover"/>}
              <div><label className="mb-2 block text-sm font-semibold">Profile image</label><input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600"/></div>
              <div><label className="mb-2 block text-sm font-semibold">Biography (500 characters maximum)</label><textarea rows={4} maxLength={500} value={communityProfile.bio || ""} onChange={(e) => setCommunityProfile({ ...communityProfile, bio: e.target.value })} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold"/></div>
              <label className="flex items-center gap-3 text-sm text-gray-700"><input type="checkbox" checked={Boolean(communityProfile.is_private)} onChange={(e) => setCommunityProfile({ ...communityProfile, is_private: e.target.checked })}/> Make my community profile private</label>
              <button disabled={loading} className="flex items-center gap-2 border border-literary-navy px-7 py-3 font-semibold text-literary-navy hover:bg-literary-navy hover:text-white disabled:opacity-60"><Save size={18}/> Save community profile</button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 flex border-b border-gray-200">
              {[["login","Login",LogIn],["register","Register",UserPlus]].map(([key,label,Icon]) => <button key={key} onClick={() => { setMode(key); setError(""); setMessage(""); }} className={`flex-1 border-b-2 py-4 font-semibold ${mode === key ? "border-literary-gold text-literary-navy" : "border-transparent text-gray-500"}`}><span className="inline-flex items-center gap-2"><Icon size={18}/>{label}</span></button>)}
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && <>
                <div><label className="mb-2 block text-sm font-semibold">Email Address</label><input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold" placeholder="you@example.com"/></div>
                <div><label className="mb-2 block text-sm font-semibold">First Name</label><input name="first_name" value={form.first_name} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold" placeholder="First name"/></div>
                <div><label className="mb-2 block text-sm font-semibold">Last Name</label><input name="last_name" value={form.last_name} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold" placeholder="Last name"/></div>
              </>}
              <div><label className="mb-2 block text-sm font-semibold">Username</label><div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input name="username" value={form.username} onChange={handleChange} required autoComplete="username" className="w-full border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-literary-gold" placeholder="Enter username"/></div></div>
              <div><label className="mb-2 block text-sm font-semibold">Password</label><div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-literary-gold" placeholder="Enter password"/></div></div>
              {mode === "register" && <div><label className="mb-2 block text-sm font-semibold">Confirm Password</label><input type="password" name="password_confirm" value={form.password_confirm} onChange={handleChange} required autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold" placeholder="Confirm password"/></div>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 bg-literary-navy px-7 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={19}/> : mode === "login" ? <LogIn size={19}/> : <Mail size={19}/>} {loading ? "Please wait..." : mode === "login" ? "Continue to email verification" : "Register and verify email"}</button>
            </form>
          </>
        )}
      </div>
    </div></Container></main>
  );
}
