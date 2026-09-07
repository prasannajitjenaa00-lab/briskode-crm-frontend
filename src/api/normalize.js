/**
 * The existing frontend components were built against mock data using `id`
 * (e.g. lead.id, user.id). MongoDB documents use `_id`. Rather than rewrite
 * every component, we recursively mirror `_id` -> `id` on every object that
 * comes back from the API, so the UI keeps working unmodified.
 */
export const normalizeIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeIds);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = normalizeIds(value[key]);
    }
    if (out._id && !out.id) {
      out.id = typeof out._id === 'object' && out._id.toString ? out._id.toString() : out._id;
    }
    return out;
  }
  return value;
};
