import { useCallback, useEffect, useState } from "react";
import { Heart, MessageCircle, Send, LoaderCircle, Trash2, Pencil, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getPublicationLikeState, togglePublicationLike,
  getPublicationComments, createPublicationComment,
  updateComment, deleteComment,
} from "../../services/communityService";

const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, {
  day: "numeric", month: "short", year: "numeric",
});

export default function PublicationEngagement({ publicationId, slug }) {
  const authenticated = Boolean(localStorage.getItem("access_token"));
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [comments, setComments] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const loadComments = useCallback(async (page = 1) => {
    const data = await getPublicationComments(publicationId, page);
    const rows = Array.isArray(data) ? data : (data.results || []);
    setComments((current) => page === 1 ? rows : [...current, ...rows]);
    setNextPage(data.next || null);
  }, [publicationId]);

  useEffect(() => {
    let active = true;
    Promise.all([getPublicationLikeState(slug), getPublicationComments(publicationId, 1)])
      .then(([likeData, commentData]) => {
        if (!active) return;
        setLikes(likeData.likes_count || 0);
        setLiked(Boolean(likeData.liked));
        const rows = Array.isArray(commentData) ? commentData : (commentData.results || []);
        setComments(rows);
        setNextPage(commentData.next || null);
      })
      .catch(() => active && setError("اس وقت قارئین کی سرگرمیاں لوڈ نہیں ہو سکیں۔"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, publicationId]);

  async function handleLike() {
    if (!authenticated) {
      setError("اس تحریر کو پسند کرنے کے لیے لاگ اِن کریں۔");
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    setError("");
    const oldLiked = liked;
    const oldCount = likes;
    setLiked(!oldLiked);
    setLikes(Math.max(0, oldCount + (oldLiked ? -1 : 1)));
    try {
      const result = await togglePublicationLike(slug, oldLiked);
      setLiked(Boolean(result.liked));
      setLikes(result.likes_count || 0);
    } catch (e) {
      setLiked(oldLiked);
      setLikes(oldCount);
      setError(e.response?.data?.detail || "پسندیدگی اپ ڈیٹ نہیں ہو سکی۔");
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!authenticated) {
      setError("گفتگو میں شامل ہونے کے لیے لاگ اِن کریں۔");
      return;
    }
    const value = comment.trim();
    if (!value) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      if (editing) {
        await updateComment(editing, value);
        setNotice("آپ کا تبصرہ اپ ڈیٹ ہو گیا ہے۔");
      } else {
        await createPublicationComment(publicationId, value);
        setNotice("شکریہ۔ آپ کا تبصرہ منظوری کے لیے جمع کر دیا گیا ہے۔");
      }
      setComment("");
      setEditing(null);
      await loadComments(1);
    } catch (e) {
      const data = e.response?.data;
      setError(data?.content?.[0] || data?.detail || "آپ کا تبصرہ جمع نہیں ہو سکا۔");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("کیا آپ یہ تبصرہ حذف کرنا چاہتے ہیں؟")) return;
    try {
      await deleteComment(id);
      setComments((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("تبصرہ حذف نہیں ہو سکا۔");
    }
  }

  return (
    <section className="mt-16 border-t border-[#e8e1d4] pt-10" aria-label="تحریر پر قارئین کی رائے">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">قارئین کی برادری</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">اظہارِ پسندیدگی اور گفتگو</h2>
        </div>
        <button type="button" onClick={handleLike} disabled={likeBusy}
          aria-pressed={liked} aria-label={liked ? "تحریر سے پسندیدگی ختم کریں" : "تحریر پسند کریں"}
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 ${liked ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-white text-slate-800 hover:border-amber-500"}`}>
          <Heart size={19} className={liked ? "fill-current animate-pulse" : ""} />
          {liked ? "پسند کیا گیا" : "پسند کریں"}
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-sm tabular-nums">{likes}</span>
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <div className="rounded-2xl border border-[#e9e1d2] bg-[#fffdf8] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-2 text-slate-900">
            <MessageCircle size={20} className="text-amber-700" />
            <h3 className="font-serif text-xl font-bold">قارئین کے تبصرے</h3>
            <span className="text-sm text-slate-500">({comments.length}{nextPage ? "+" : ""})</span>
          </div>
          {loading ? <p className="text-sm text-slate-500">گفتگو لوڈ ہو رہی ہے...</p> : comments.length === 0 ? (
            <div className="rounded-xl bg-white px-5 py-8 text-center text-sm text-slate-500">ابھی کوئی منظور شدہ تبصرہ موجود نہیں۔ اپنی رائے دینے والے پہلے فرد بنیے۔</div>
          ) : <div className="space-y-5">
            {comments.map((item) => (
              <article key={item.id} className="border-b border-[#eee7dc] pb-5 last:border-0">
                <div className="flex items-start gap-3">
                  {item.avatar ? <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> :
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee6d6] font-serif font-bold text-slate-700">{(item.display_name || item.username || "R").slice(0, 1).toUpperCase()}</div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div><Link to={`/community/${encodeURIComponent(item.username)}`} className="font-semibold text-slate-900 hover:text-amber-700">{item.display_name || item.username}</Link>
                        <p className="text-xs text-slate-500">{dateLabel(item.created_at)}</p></div>
                      {(item.can_edit || item.can_delete) && <div className="flex gap-2">
                        {item.can_edit && <button type="button" title="تبصرہ ترمیم کریں" onClick={() => { setEditing(item.id); setComment(item.content); }} className="rounded p-1 text-slate-500 hover:text-amber-700"><Pencil size={15}/></button>}
                        {item.can_delete && <button type="button" title="تبصرہ حذف کریں" onClick={() => handleDelete(item.id)} className="rounded p-1 text-slate-500 hover:text-red-700"><Trash2 size={15}/></button>}
                      </div>}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.content}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>}
          {nextPage && <button type="button" onClick={() => loadComments(comments.length ? Math.floor(comments.length / 10) + 1 : 2)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-slate-900">مزید تبصرے دیکھیے <ChevronDown size={16}/></button>}
        </div>

        <div className="h-fit rounded-2xl bg-[#f5f0e6] p-5 sm:p-7">
          <h3 className="font-serif text-xl font-bold text-slate-900">گفتگو میں شامل ہوں</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">بامقصد آرا اس ادبی ماحول کو خوشگوار بناتی ہیں۔ تبصرے عوامی طور پر دکھانے سے پہلے جانچے جاتے ہیں۔</p>
          <form onSubmit={handleCommentSubmit} className="mt-5">
            <label htmlFor={`comment-${publicationId}`} className="mb-2 block text-sm font-semibold text-slate-800">آپ کا تبصرہ</label>
            <textarea id={`comment-${publicationId}`} value={comment} onChange={(e) => setComment(e.target.value.slice(0, 3000))}
              rows={6} maxLength={3000} placeholder={authenticated ? "اپنی رائے تحریر کریں..." : "تبصرہ لکھنے کے لیے لاگ اِن کریں..."}
              className="w-full resize-y rounded-xl border border-[#ddd2bf] bg-white p-4 text-sm leading-6 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15" />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>زیادہ سے زیادہ 3,000 حروف</span><span>{comment.length}/3000</span></div>
            <button type="submit" disabled={submitting || !comment.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <LoaderCircle size={17} className="animate-spin"/> : <Send size={16}/>} {editing ? "تبصرہ اپ ڈیٹ کریں" : "جائزے کے لیے جمع کریں"}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setComment(""); }} className="mt-2 w-full text-sm text-slate-600 hover:text-slate-900">ترمیم منسوخ کریں</button>}
          </form>
          {notice && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!authenticated && <p className="mt-4 text-center text-sm text-slate-600">پسندیدگی یا تبصرہ کرنے کے لیے <Link to="/account" className="font-semibold text-amber-800 underline">لاگ اِن کریں</Link>۔</p>}
        </div>
      </div>
    </section>
  );
}
