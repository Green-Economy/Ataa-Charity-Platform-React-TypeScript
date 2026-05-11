import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import '../../styles/css/donationForm.css';
import { donorApi } from './../../services/endpoints/donations';

/**
 * DonationForm.tsx
 * - Functional, typed, production-ready donation form component
 * - Image previews via URL.createObjectURL (revoked on remove/unmount)
 * - Validation, accessibility, keyboard support, micro-interactions
 */

/* ---------------------- Types ---------------------- */
type FormState = {
  type: string;
  size: string;
  quantity: number;
  condition: string;
  notes: string;
};

type Action =
  | { type: 'set'; key: keyof FormState; value: string | number }
  | { type: 'reset' };

type ImageItem = { id: string; file: File; url: string };

interface DonationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_MB = 5;

/* -------------------- Constants -------------------- */
const DONATION_TYPES = [
  { value: 'رجالي', label: 'رجالي' },
  { value: 'حريمي', label: 'حريمي' },
  { value: 'أطفال', label: 'أطفال' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'مقاس حر'];

const CONDITIONS = [
  { value: 'جديدة', label: 'جديد' },
  { value: 'ممتاز', label: 'ممتاز' },
  { value: 'جيد', label: 'جيد' },
  { value: 'مقبول', label: 'مقبول' },
];

const INITIAL_FORM: FormState = {
  type: '',
  size: '',
  quantity: 1,
  condition: '',
  notes: '',
};

/* -------------------- Reducer -------------------- */
function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.key]: action.value } as FormState;
    case 'reset':
      return INITIAL_FORM;
    default:
      return state;
  }
}

/* -------------------- Icons (SVG) -------------------- */
const SvgUpload = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path fill="currentColor" d="M12 2l-4 4h3v6h2V6h3l-4-4z" />
    <path fill="currentColor" d="M5 18v2h14v-2H5z" />
  </svg>
);
const SvgPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </svg>
);
const SvgMinus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path fill="currentColor" d="M5 11h14v2H5z" />
  </svg>
);

/* -------------------- Component -------------------- */
export default function DonationForm({ onSuccess, onCancel }: DonationFormProps): JSX.Element {
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    return () => {
      images.forEach(i => URL.revokeObjectURL(i.url));
    };
  }, [images]);

  const setField = useCallback((k: keyof FormState, v: string | number) => {
    dispatch({ type: 'set', key: k, value: v });
  }, []);

  const touch = useCallback((key: string) => setTouched(prev => ({ ...prev, [key]: true })), []);

  /* Image handling */
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= MAX_FILE_MB * 1024 * 1024);
    if (arr.length === 0) {
      setGlobalError(`اختر صور PNG/JPG بحجم أقل من ${MAX_FILE_MB}MB`);
      return;
    }
    const space = MAX_IMAGES - images.length;
    if (space <= 0) {
      setGlobalError(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    const allowed = arr.slice(0, space);
    const items = allowed.map(f => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...items]);
    setGlobalError('');
  }, [images.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.currentTarget.value = '';
  };

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const found = prev.find(p => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  /* Validation */
  const errors = useMemo(() => ({
    type: !form.type ? 'يرجى اختيار نوع المنتج' : '',
    size: !form.size ? 'يرجى اختيار المقاس' : '',
    condition: !form.condition ? 'يرجى اختيار حالة المنتج' : '',
    quantity: form.quantity < 1 ? 'الكمية لا يمكن أن تكون أقل من 1' : '',
    images: images.length === 0 ? 'يرجى إضافة صورة واحدة على الأقل' : '',
  }), [form, images.length]);

  const validateAll = useCallback(() => {
    setTouched({ type: true, size: true, condition: true, quantity: true, images: true });
    if (images.length === 0) { setGlobalError('❌ يرجى إضافة صورة واحدة على الأقل'); return false; }
    if (!form.type || !form.size || !form.condition || form.quantity < 1) { setGlobalError('يرجى إكمال الحقول المطلوبة'); return false; }
    setGlobalError('');
    return true;
  }, [form, images.length]);

  const resetForm = useCallback(() => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    dispatch({ type: 'reset' });
    setTouched({});
    setGlobalError('');
  }, [images]);

  /* Submit */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    setGlobalError('');
    try {
      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('size', form.size);
      fd.append('quantity', String(form.quantity));
      fd.append('condition', form.condition);
      if (form.notes) fd.append('description', form.notes);
      images.slice(0, MAX_IMAGES).forEach(it => fd.append('images', it.file, it.file.name));

      await donorApi.create(fd);

      setLoading(false);
      resetForm();

      if (onSuccess) {
        onSuccess();
      } else {
        setLocation('/user-dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال';
      setGlobalError(`❌ ${message}. حاول مجدداً.`);
      setLoading(false);
    }
  }, [form, images, setLocation, validateAll, resetForm, onSuccess]);

  /* Helpers */
  const inc = () => setField('quantity', Math.min(999, form.quantity + 1));
  const dec = () => setField('quantity', Math.max(1, form.quantity - 1));

  return (
    <main className="donation-page" dir="rtl" lang="ar">
      <div className="donation-card animate-up">
        <header className="donation-header">
          <h1>إضافة منتج للتبرع</h1>
          <p>ساهم في إسعاد الآخرين من خلال التبرع بأغراضك المستعملة بحالة جيدة</p>
        </header>

        <form className="donation-form" onSubmit={handleSubmit} noValidate>
          <div className="grid two-cols">
            <div className="form-group">
              <label htmlFor="type">نوع المنتج <span className="req">*</span></label>
              <select
                id="type"
                value={form.type}
                onChange={e => setField('type', e.target.value)}
                onBlur={() => touch('type')}
                className="input"
                aria-invalid={!!(touched.type && errors.type)}
              >
                <option value="">اختر النوع...</option>
                {DONATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {touched.type && errors.type && <div className="field-error" role="alert">{errors.type}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="size">المقاس <span className="req">*</span></label>
              <select
                id="size"
                value={form.size}
                onChange={e => setField('size', e.target.value)}
                onBlur={() => touch('size')}
                className="input"
                aria-invalid={!!(touched.size && errors.size)}
              >
                <option value="">اختر المقاس...</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {touched.size && errors.size && <div className="field-error" role="alert">{errors.size}</div>}
            </div>
          </div>

          <div className="grid">
            <div className="form-group inline-qty">
              <label>العدد</label>
              <div className="qty-control" role="group" aria-label="عداد الكمية">
                <button type="button" className="qty-btn" onClick={dec} aria-label="نقص"> <SvgMinus /> </button>
                <input
                  className="qty-input"
                  type="number"
                  value={form.quantity}
                  min={1}
                  onChange={e => setField('quantity', Math.max(1, Number(e.target.value || 1)))}
                  onBlur={() => touch('quantity')}
                />
                <button type="button" className="qty-btn" onClick={inc} aria-label="زود"> <SvgPlus /> </button>
              </div>
              {touched.quantity && errors.quantity && <div className="field-error">{errors.quantity}</div>}
            </div>
          </div>

          <div className="grid">
            <label>حالة المنتج <span className="req">*</span></label>
            <div className="conditions" role="radiogroup" aria-label="حالة المنتج">
              {CONDITIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`cond-btn ${form.condition === c.value ? 'active' : ''}`}
                  onClick={() => { setField('condition', c.value); touch('condition'); }}
                  aria-pressed={form.condition === c.value}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {touched.condition && errors.condition && <div className="field-error">{errors.condition}</div>}
          </div>

          <div className="grid">
            <label>صور المنتج</label>
            <div
              className={`upload-area ${dragOver ? 'dragover' : ''} ${images.length >= MAX_IMAGES ? 'full' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && fileRef.current) fileRef.current.click(); }}
              aria-label="منطقة رفع الصور"
            >
              <div className="upload-inner">
                <div className="upload-ico"><SvgUpload /></div>
                <div className="upload-text">انقر لرفع صورة أو اسحبها هنا</div>
                <div className="upload-hint">PNG, JPG حتى {MAX_FILE_MB}MB (يمكنك اختيار أكثر من صورة)</div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            </div>

            {touched.images && errors.images && <div className="field-error">{errors.images}</div>}
            {globalError && <div className="global-error" role="alert">{globalError}</div>}

            {images.length > 0 && (
              <div className="preview-grid" aria-live="polite">
                {images.map((it, i) => (
                  <div className="preview-item" key={it.id}>
                    <img src={it.url} alt={`معاينة ${i + 1}`} />
                    <button type="button" className="preview-rm" onClick={() => removeImage(it.id)} aria-label={`حذف الصورة ${i + 1}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid">
            <label htmlFor="notes">ملاحظات إضافية (اختياري)</label>
            <textarea
              id="notes"
              className="notes-area"
              placeholder="اكتب أي تفاصيل أخرى عن المنتج..."
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="notes-meta">{form.notes.length}/500</div>
          </div>

          <div className="actions-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                resetForm();
                if (onCancel) onCancel();
              }}
            >
              إلغاء
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'تقديم التبرع'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
