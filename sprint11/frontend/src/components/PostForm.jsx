import { useRef, useState } from 'react';

const EMPTY = { title: '', body: '', author: '' };
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Sprint 11 - Phase 2/3: controlled form that dispatches multipart/form-data.
 * Client-side validation mirrors the server rules so users get instant feedback,
 * but the API remains the source of truth.
 */
export default function PostForm({ onSubmit, isSubmitting }) {
  const [fields, setFields] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const update = (key) => (event) => {
    setFields((previous) => ({ ...previous, [key]: event.target.value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setImageFile(null);
      setPreviewUrl('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setFieldErrors((p) => ({ ...p, image: 'Only image files can be uploaded' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setFieldErrors((p) => ({ ...p, image: 'Thumbnail must be 5 MB or smaller' }));
      return;
    }
    setFieldErrors((p) => ({ ...p, image: undefined }));
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errors = {};
    if (!fields.title.trim()) errors.title = 'Title is required';
    else if (fields.title.trim().length > 120) errors.title = 'Title must be 120 characters or fewer';
    if (!fields.body.trim()) errors.body = 'Body is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const created = await onSubmit({
      title: fields.title.trim(),
      body: fields.body.trim(),
      author: fields.author.trim() || 'Anonymous',
      imageFile,
    });

    if (created) {
      setFields(EMPTY);
      clearImage();
    }
  };

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <header className="panel-head">
        <h2>New post</h2>
        <p className="muted small">
          POST <code>/api/posts</code> · multipart/form-data
        </p>
      </header>

      <label className="field">
        <span>Title *</span>
        <input
          name="title"
          type="text"
          value={fields.title}
          onChange={update('title')}
          placeholder="Ship the integration pipeline"
          aria-invalid={Boolean(fieldErrors.title)}
          maxLength={140}
          disabled={isSubmitting}
          required
        />
        {fieldErrors.title && <em className="field-error">{fieldErrors.title}</em>}
      </label>

      <label className="field">
        <span>Body *</span>
        <textarea
          name="body"
          rows={4}
          value={fields.body}
          onChange={update('body')}
          placeholder="What changed in this sprint?"
          aria-invalid={Boolean(fieldErrors.body)}
          disabled={isSubmitting}
          required
        />
        {fieldErrors.body && <em className="field-error">{fieldErrors.body}</em>}
      </label>

      <label className="field">
        <span>Author</span>
        <input
          name="author"
          type="text"
          value={fields.author}
          onChange={update('author')}
          placeholder="Resident Engineer"
          disabled={isSubmitting}
        />
      </label>

      <label className="field">
        <span>Thumbnail (optional)</span>
        <input ref={fileInputRef} name="image" type="file" accept="image/*" onChange={handleFile} disabled={isSubmitting} />
        {fieldErrors.image && <em className="field-error">{fieldErrors.image}</em>}
      </label>

      {previewUrl && (
        <div className="preview">
          <img src={previewUrl} alt="Selected thumbnail preview" />
          <button type="button" className="btn btn-ghost" onClick={clearImage} disabled={isSubmitting}>
            Remove image
          </button>
        </div>
      )}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Uploading…' : 'Create post'}
      </button>
    </form>
  );
}
