import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Users, UserPlus, UserCheck, LoaderCircle, BookOpen } from "lucide-react";
import { getPublicProfile, getFollowList, toggleFollow } from "../../services/communityService";

export default function CommunityProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("followers");
  const [rows, setRows] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicProfile(username).then((data) => active && setProfile(data))
      .catch((e) => active && setError(e.response?.data?.detail || "یہ پروفائل لوڈ نہیں ہو سکی۔"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [username]);

  async function loadList(which = tab, page = 1) {
    setListLoading(true);
    try {
      const data = await getFollowList(username, which, page);
      const items = Array.isArray(data) ? data : (data.results || []);
      setRows((current) => page === 1 ? items : [...current, ...items]);
      setNext(data.next || null);
    } catch { setError("یہ فہرست لوڈ نہیں ہو سکی۔"); }
    finally { setListLoading(false); }
  }

  useEffect(() => { if (profile) loadList(tab, 1); }, [profile, tab, username]);

  async function handleListFollow(targetUsername, currentFollowing) {
    if (!localStorage.getItem("access_token")) { setError("قارئین کو فالو کرنے کے لیے لاگ اِن کیجیے۔"); return; }
    try {
      const result = await toggleFollow(targetUsername, currentFollowing);
      setRows((current) => current.map((row) => row.username === targetUsername ? { ...row, is_following: result.following } : row));
      if (targetUsername === username) setProfile((current) => ({ ...current, is_following: result.following, followers_count: result.followers_count }));
    } catch (e) { setError(e.response?.data?.detail || "فالو کی درخواست مکمل نہیں ہو سکی۔"); }
  }

  async function handleFollow() {
    if (!localStorage.getItem("access_token")) { setError("اس قاری کو فالو کرنے کے لیے لاگ اِن کیجیے۔"); return; }
    setBusy(true); setError("");
    try {
      const result = await toggleFollow(username, profile.is_following);
      setProfile((current) => ({ ...current, is_following: result.following, followers_count: result.followers_count }));
    } catch (e) { setError(e.response?.data?.detail || "فالو کی درخواست مکمل نہیں ہو سکی۔"); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="py-32 text-center text-slate-500">پروفائل لوڈ ہو رہی ہے...</div>;
  if (!profile) return <div className="py-32 text-center text-slate-600">{error || "پروفائل نہیں ملی۔"}</div>;

  return <main className="min-h-screen bg-[#f8f7f3] px-5 py-16"><div className="mx-auto max-w-5xl">
    <div className="rounded-3xl border border-[#e8dfd0] bg-white p-7 shadow-sm sm:p-10">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        {profile.avatar ? <img src={profile.avatar} alt="" className="h-24 w-24 rounded-full border-4 border-amber-50 object-cover"/> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#eee6d6] font-serif text-3xl font-bold text-slate-700">{profile.display_name.slice(0,1).toUpperCase()}</div>}
        <div className="flex-1"><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">قارئین کی برادری کا تعارف</p><h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">{profile.display_name}</h1><p className="mt-1 text-sm text-slate-500">@{profile.username}</p>{profile.bio && <p className="mt-4 max-w-2xl leading-7 text-slate-700">{profile.bio}</p>}</div>
        {localStorage.getItem("access_token") && <button onClick={handleFollow} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : profile.is_following ? <UserCheck size={17}/> : <UserPlus size={17}/>} {profile.is_following ? "فالو کر رہے ہیں" : "فالو کریں"}</button>}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#eee7dc] pt-6 sm:max-w-md"><div className="rounded-xl bg-[#faf7f0] p-4 text-center"><p className="text-2xl font-bold text-slate-900">{profile.followers_count}</p><p className="text-sm text-slate-500">فالوورز</p></div><div className="rounded-xl bg-[#faf7f0] p-4 text-center"><p className="text-2xl font-bold text-slate-900">{profile.following_count}</p><p className="text-sm text-slate-500">فالو کر رہے ہیں</p></div></div>
    </div>
    <section className="mt-8 rounded-3xl border border-[#e8dfd0] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap gap-3 border-b border-[#eee7dc] pb-4">{["followers","following"].map((value) => <button key={value} onClick={() => setTab(value)} className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${tab === value ? "bg-slate-900 text-white" : "bg-[#f5f0e6] text-slate-700 hover:bg-[#eee4d3]"}`}>{value === "followers" ? "فالوورز" : "فالو کیے گئے قارئین"}</button>)}</div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {listLoading && rows.length === 0 ? <div className="py-10 text-center text-slate-500">{tab === "followers" ? "فالوورز لوڈ ہو رہے ہیں..." : "فالو کیے گئے قارئین لوڈ ہو رہے ہیں..."}</div> : rows.length === 0 ? <div className="py-12 text-center"><Users className="mx-auto text-amber-700"/><p className="mt-3 text-slate-600">{tab === "followers" ? "ابھی کوئی فالوور موجود نہیں۔" : "ابھی کسی کو فالو نہیں کیا گیا۔"}</p></div> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{rows.map((item) => <div key={item.username} className="flex items-center gap-3 rounded-xl border border-[#eee7dc] p-4 transition hover:border-amber-400 hover:bg-[#fffdf8]">{item.avatar ? <img src={item.avatar} alt="" className="h-11 w-11 rounded-full object-cover"/> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eee6d6] font-serif font-bold text-slate-700">{item.display_name.slice(0,1).toUpperCase()}</div>}<Link to={`/community/${encodeURIComponent(item.username)}`} className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{item.display_name}</p><p className="text-xs text-slate-500">@{item.username}</p></Link>{localStorage.getItem("access_token") && item.username !== (profile?.username) && <button type="button" onClick={() => handleListFollow(item.username, Boolean(item.is_following))} className="shrink-0 rounded-full border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50">{item.is_following ? "فالو کر رہے ہیں" : "فالو کریں"}</button>}</div>)}</div>}
      {next && <button disabled={listLoading} onClick={() => loadList(tab, Math.floor(rows.length / 20) + 1)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#ded4c3] py-3 font-semibold text-slate-700 hover:bg-[#faf7f0] disabled:opacity-50">{listLoading && <LoaderCircle size={16} className="animate-spin"/>}مزید دیکھیے</button>}
    </section>
    <Link to="/literature" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-800"><BookOpen size={16}/> ادبی تحریریں دیکھیے</Link>
  </div></main>;
}
