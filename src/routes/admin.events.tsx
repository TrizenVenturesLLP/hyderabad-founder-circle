import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  createAdminEvent,
  deleteAdminEvent,
  fetchAdminEvents,
  updateAdminEvent,
  type AdminEvent,
  type AdminGuestFounder,
  type AdminHost,
  type AdminSpeaker,
} from "@/lib/admin-api";
import { invalidateMeetupsCache } from "@/lib/events";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/events")({
  component: AdminEventsPage,
  head: () => ({
    meta: [{ title: "Events — Admin" }],
  }),
});

const emptySpeaker = (): AdminSpeaker => ({
  name: "",
  role: "",
  org: "",
  badge: "",
  bio: "",
  linkedin: "",
  website: "",
  photo: "",
  photoPosition: "",
  photoPaddingBottom: "",
});

const emptyHost = (): AdminHost => ({
  name: "",
  role: "",
  startup: "",
  linkedin: "",
  photo: "",
});

const emptyGuest = (): AdminGuestFounder => ({
  name: "",
  bio: "",
  photo: "",
});

const emptyForm = (): AdminEvent => ({
  slug: "",
  title: "",
  dateISO: "",
  dateLabel: "",
  time: "11:00 AM – 1:00 PM",
  venue: "DraperU India",
  space: "5th floor event space",
  area: "Gachibowli",
  address:
    "DraperU India (Formerly Draper Startup House Hyderabad), Rajiv Gandhi Nagar, Gachibowli, Hyderabad, Telangana 500032",
  mapsUrl:
    "https://maps.app.goo.gl/KTRvgep4y9ciSCjSA?g_st=com.microsoft.skype.teams.extshare",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=DraperU+India+Gachibowli+Hyderabad&output=embed",
  city: "Hyderabad",
  seats: 40,
  format: "Offline",
  status: "open",
  blurb: "",
  speakers: [],
  hosts: [],
  guestFounder: emptyGuest(),
  published: true,
  sortOrder: 0,
});

function AdminEventsPage() {
  const [items, setItems] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState<AdminEvent>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminEvents();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ ...emptyForm(), sortOrder: items.length });
    setEditorOpen(true);
  }

  function startEdit(item: AdminEvent) {
    setEditing(item);
    setForm({
      ...emptyForm(),
      ...item,
      speakers: item.speakers?.length
        ? item.speakers.map((s) => ({ ...emptySpeaker(), ...s }))
        : [],
      hosts: item.hosts?.length
        ? item.hosts.map((h) => ({ ...emptyHost(), ...h }))
        : [],
      guestFounder: { ...emptyGuest(), ...(item.guestFounder || {}) },
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditing(null);
    setForm(emptyForm());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: AdminEvent = {
        ...form,
        speakers: (form.speakers || []).filter((s) => s.name.trim()),
        hosts: (form.hosts || []).filter((h) => h.name.trim()),
        guestFounder: form.guestFounder?.name?.trim()
          ? form.guestFounder
          : {},
      };
      if (editing?._id) {
        await updateAdminEvent(editing._id, payload);
      } else {
        await createAdminEvent(payload);
      }
      invalidateMeetupsCache();
      closeEditor();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteAdminEvent(id);
      invalidateMeetupsCache();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function updateField<K extends keyof AdminEvent>(key: K, value: AdminEvent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpeaker(index: number, key: keyof AdminSpeaker, value: string) {
    setForm((prev) => {
      const speakers = [...(prev.speakers || [])];
      speakers[index] = { ...speakers[index], [key]: value };
      return { ...prev, speakers };
    });
  }

  function updateHost(index: number, key: keyof AdminHost, value: string) {
    setForm((prev) => {
      const hosts = [...(prev.hosts || [])];
      hosts[index] = { ...hosts[index], [key]: value };
      return { ...prev, hosts };
    });
  }

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)] lg:block">
            Admin
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight text-foreground md:text-[1.75rem]">
            Events
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {loading ? "Loading…" : `${items.length} event(s)`} — edit full page
            content including speakers & venue.
          </p>
        </div>
        <button type="button" className="btn-primary gap-1.5" onClick={startCreate}>
          <Plus className="size-4" strokeWidth={2} />
          Add event
        </button>
      </div>

      {error && !editorOpen ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <article
            key={item._id}
            className="rounded-[16px] border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_2px_rgba(59,35,24,0.04)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg tracking-tight text-foreground">
                    {item.title}
                  </h2>
                  <StatusPill status={item.status} published={item.published} />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  /{item.slug}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--color-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" strokeWidth={1.75} />
                    {item.dateLabel} · {item.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" strokeWidth={1.75} />
                    {item.venue}
                    {item.area ? ` · ${item.area}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" strokeWidth={1.75} />
                    {item.speakers?.length || 0} speaker(s) ·{" "}
                    {item.hosts?.length || 0} host(s)
                  </span>
                </div>
                {item.blurb ? (
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                    {item.blurb}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => startEdit(item)}
                >
                  Edit
                </button>
                {item._id ? (
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    onClick={() => void onDelete(item._id!)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}

        {!loading && items.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-white px-5 py-14 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No events yet. Add one to publish on the site.
            </p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={startCreate}
            >
              Add event
            </button>
          </div>
        ) : null}
      </div>

      {editorOpen ? (
        <EventEditorModal
          form={form}
          editing={!!editing}
          saving={saving}
          error={error}
          onClose={closeEditor}
          onSubmit={onSubmit}
          updateField={updateField}
          updateSpeaker={updateSpeaker}
          updateHost={updateHost}
          addSpeaker={() =>
            updateField("speakers", [...(form.speakers || []), emptySpeaker()])
          }
          removeSpeaker={(i) =>
            updateField(
              "speakers",
              (form.speakers || []).filter((_, idx) => idx !== i),
            )
          }
          addHost={() =>
            updateField("hosts", [...(form.hosts || []), emptyHost()])
          }
          removeHost={(i) =>
            updateField(
              "hosts",
              (form.hosts || []).filter((_, idx) => idx !== i),
            )
          }
        />
      ) : null}
    </div>
  );
}

function StatusPill({
  status,
  published,
}: {
  status: string;
  published?: boolean;
}) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
          status === "open"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700",
        )}
      >
        {status}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
          published !== false
            ? "bg-[var(--brand-accent-soft)] text-[var(--brand-primary)]"
            : "bg-zinc-100 text-zinc-500",
        )}
      >
        {published !== false ? "Published" : "Draft"}
      </span>
    </span>
  );
}

function EventEditorModal({
  form,
  editing,
  saving,
  error,
  onClose,
  onSubmit,
  updateField,
  updateSpeaker,
  updateHost,
  addSpeaker,
  removeSpeaker,
  addHost,
  removeHost,
}: {
  form: AdminEvent;
  editing: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  updateField: <K extends keyof AdminEvent>(key: K, value: AdminEvent[K]) => void;
  updateSpeaker: (i: number, key: keyof AdminSpeaker, value: string) => void;
  updateHost: (i: number, key: keyof AdminHost, value: string) => void;
  addSpeaker: () => void;
  removeSpeaker: (i: number) => void;
  addHost: () => void;
  removeHost: (i: number) => void;
}) {
  const [tab, setTab] = useState<EditorTab>("details");
  const [localError, setLocalError] = useState("");

  const tabs: { id: EditorTab; label: string; hint?: string }[] = [
    { id: "details", label: "Details" },
    { id: "venue", label: "Venue" },
    {
      id: "speakers",
      label: "Speakers",
      hint: String(form.speakers?.length || 0),
    },
    { id: "hosts", label: "Hosts", hint: String(form.hosts?.length || 0) },
    { id: "guest", label: "Guest" },
  ];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError("");
    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.dateISO.trim() ||
      !form.dateLabel.trim() ||
      !form.time.trim()
    ) {
      setTab("details");
      setLocalError("Fill in title, slug, date, date label, and time.");
      return;
    }
    if (!form.venue.trim() || !form.city.trim()) {
      setTab("venue");
      setLocalError("Venue name and city are required.");
      return;
    }
    onSubmit(e);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-5">
      <div className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_80px_-24px_rgba(59,35,24,0.45)] sm:rounded-2xl">
        <header className="shrink-0 border-b border-[var(--color-border)] px-5 pt-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl tracking-tight text-foreground">
                {editing ? "Edit event" : "New event"}
              </h2>
              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                {form.title?.trim() || "Untitled event"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-background-warm)] hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="-mx-1 mt-4 flex gap-0.5 overflow-x-auto pb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative shrink-0 rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-foreground",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t.label}
                  {t.hint && t.hint !== "0" ? (
                    <span className="rounded-md bg-[var(--brand-accent-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-primary)]">
                      {t.hint}
                    </span>
                  ) : null}
                </span>
                {tab === t.id ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--brand-accent)]" />
                ) : null}
              </button>
            ))}
          </nav>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {tab === "details" ? (
              <div className="space-y-4">
                <Field label="Title">
                  <input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="field"
                    placeholder="Hyderabad Founders Network – July"
                  />
                </Field>
                <Field label="Short description">
                  <textarea
                    value={form.blurb}
                    onChange={(e) => updateField("blurb", e.target.value)}
                    rows={3}
                    className="field"
                    placeholder="One or two sentences for the event page…"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="URL slug">
                    <input
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      className="field"
                      placeholder="hyderabad-founders-network-july"
                    />
                  </Field>
                  <Field label="Date">
                    <input
                      type="date"
                      value={form.dateISO}
                      onChange={(e) => updateField("dateISO", e.target.value)}
                      className="field"
                    />
                  </Field>
                  <Field label="Date label (display)">
                    <input
                      value={form.dateLabel}
                      onChange={(e) => updateField("dateLabel", e.target.value)}
                      className="field"
                      placeholder="Saturday, 18 July 2026"
                    />
                  </Field>
                  <Field label="Time">
                    <input
                      value={form.time}
                      onChange={(e) => updateField("time", e.target.value)}
                      className="field"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value as AdminEvent["status"],
                        )
                      }
                      className="field"
                    >
                      <option value="open">Open</option>
                      <option value="coming-soon">Coming soon</option>
                    </select>
                  </Field>
                  <Field label="Format">
                    <select
                      value={form.format}
                      onChange={(e) =>
                        updateField(
                          "format",
                          e.target.value as AdminEvent["format"],
                        )
                      }
                      className="field"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </Field>
                  <Field label="Seats">
                    <input
                      type="number"
                      value={form.seats ?? 40}
                      onChange={(e) =>
                        updateField("seats", Number(e.target.value))
                      }
                      className="field"
                    />
                  </Field>
                  <Field label="Sort">
                    <input
                      type="number"
                      value={form.sortOrder ?? 0}
                      onChange={(e) =>
                        updateField("sortOrder", Number(e.target.value))
                      }
                      className="field"
                    />
                  </Field>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand-accent)]"
                    checked={form.published !== false}
                    onChange={(e) => updateField("published", e.target.checked)}
                  />
                  <span>
                    <span className="font-medium text-foreground">
                      Published on website
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                      Uncheck to keep as draft
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {tab === "venue" ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Venue name">
                    <input
                      value={form.venue}
                      onChange={(e) => updateField("venue", e.target.value)}
                      className="field"
                    />
                  </Field>
                  <Field label="Space / floor">
                    <input
                      value={form.space || ""}
                      onChange={(e) => updateField("space", e.target.value)}
                      className="field"
                    />
                  </Field>
                  <Field label="Area">
                    <input
                      value={form.area || ""}
                      onChange={(e) => updateField("area", e.target.value)}
                      className="field"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="field"
                    />
                  </Field>
                </div>
                <Field label="Full address">
                  <textarea
                    value={form.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={2}
                    className="field"
                  />
                </Field>
                <Field label="Maps link">
                  <input
                    value={form.mapsUrl || ""}
                    onChange={(e) => updateField("mapsUrl", e.target.value)}
                    className="field"
                    placeholder="https://maps.app.goo.gl/…"
                  />
                </Field>
                <Field label="Maps embed URL">
                  <input
                    value={form.mapsEmbedUrl || ""}
                    onChange={(e) =>
                      updateField("mapsEmbedUrl", e.target.value)
                    }
                    className="field"
                    placeholder="https://www.google.com/maps?…&output=embed"
                  />
                </Field>
              </div>
            ) : null}

            {tab === "speakers" ? (
              <PeopleTab
                emptyLabel="No speakers yet"
                addLabel="Add speaker"
                onAdd={addSpeaker}
                count={form.speakers?.length || 0}
              >
                {(form.speakers || []).map((speaker, i) => (
                  <PersonCard
                    key={i}
                    title={speaker.name?.trim() || `Speaker ${i + 1}`}
                    onRemove={() => removeSpeaker(i)}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name">
                        <input
                          value={speaker.name}
                          onChange={(e) =>
                            updateSpeaker(i, "name", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Role">
                        <input
                          value={speaker.role}
                          onChange={(e) =>
                            updateSpeaker(i, "role", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Org">
                        <input
                          value={speaker.org || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "org", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Badge">
                        <input
                          value={speaker.badge || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "badge", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Bio" className="sm:col-span-2">
                        <textarea
                          value={speaker.bio || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "bio", e.target.value)
                          }
                          rows={2}
                          className="field"
                        />
                      </Field>
                      <Field label="LinkedIn">
                        <input
                          value={speaker.linkedin || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "linkedin", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Website">
                        <input
                          value={speaker.website || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "website", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Photo" className="sm:col-span-2">
                        <input
                          value={speaker.photo || ""}
                          onChange={(e) =>
                            updateSpeaker(i, "photo", e.target.value)
                          }
                          className="field"
                          placeholder="Name key or image URL"
                        />
                      </Field>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] hover:text-foreground">
                        Photo layout (optional)
                      </summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Position">
                          <input
                            value={speaker.photoPosition || ""}
                            onChange={(e) =>
                              updateSpeaker(i, "photoPosition", e.target.value)
                            }
                            className="field"
                            placeholder="center top"
                          />
                        </Field>
                        <Field label="Padding bottom">
                          <input
                            value={speaker.photoPaddingBottom || ""}
                            onChange={(e) =>
                              updateSpeaker(
                                i,
                                "photoPaddingBottom",
                                e.target.value,
                              )
                            }
                            className="field"
                          />
                        </Field>
                      </div>
                    </details>
                  </PersonCard>
                ))}
              </PeopleTab>
            ) : null}

            {tab === "hosts" ? (
              <PeopleTab
                emptyLabel="No hosts yet"
                addLabel="Add host"
                onAdd={addHost}
                count={form.hosts?.length || 0}
              >
                {(form.hosts || []).map((host, i) => (
                  <PersonCard
                    key={i}
                    title={host.name?.trim() || `Host ${i + 1}`}
                    onRemove={() => removeHost(i)}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name">
                        <input
                          value={host.name}
                          onChange={(e) =>
                            updateHost(i, "name", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Role">
                        <input
                          value={host.role || ""}
                          onChange={(e) =>
                            updateHost(i, "role", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Startup">
                        <input
                          value={host.startup || ""}
                          onChange={(e) =>
                            updateHost(i, "startup", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="LinkedIn">
                        <input
                          value={host.linkedin || ""}
                          onChange={(e) =>
                            updateHost(i, "linkedin", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                      <Field label="Photo" className="sm:col-span-2">
                        <input
                          value={host.photo || ""}
                          onChange={(e) =>
                            updateHost(i, "photo", e.target.value)
                          }
                          className="field"
                        />
                      </Field>
                    </div>
                  </PersonCard>
                ))}
              </PeopleTab>
            ) : null}

            {tab === "guest" ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Optional guest founder spotlight for this meetup.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      value={form.guestFounder?.name || ""}
                      onChange={(e) =>
                        updateField("guestFounder", {
                          ...form.guestFounder,
                          name: e.target.value,
                        })
                      }
                      className="field"
                    />
                  </Field>
                  <Field label="Photo">
                    <input
                      value={form.guestFounder?.photo || ""}
                      onChange={(e) =>
                        updateField("guestFounder", {
                          ...form.guestFounder,
                          photo: e.target.value,
                        })
                      }
                      className="field"
                    />
                  </Field>
                  <Field label="Bio" className="sm:col-span-2">
                    <textarea
                      value={form.guestFounder?.bio || ""}
                      onChange={(e) =>
                        updateField("guestFounder", {
                          ...form.guestFounder,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className="field"
                    />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>

          {(localError || error) ? (
            <p className="shrink-0 border-t border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">
              {localError || error}
            </p>
          ) : null}

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
            <p className="hidden text-xs text-[var(--color-text-muted)] sm:block">
              {tabLabel(tab)} · save anytime
            </p>
            <div className="ml-auto flex gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create event"}
              </button>
            </div>
          </footer>
        </form>
      </div>

      <style>{`
        .field {
          width: 100%;
          margin-top: 0.4rem;
          border-radius: 0.7rem;
          border: 1px solid var(--color-border);
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          line-height: 1.35;
          background: var(--color-background-alt);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .field:hover {
          border-color: color-mix(in srgb, var(--color-border) 60%, var(--brand-primary));
        }
        .field:focus {
          border-color: var(--brand-accent);
          background: white;
        }
        textarea.field {
          resize: vertical;
          min-height: 4.5rem;
        }
      `}</style>
    </div>
  );
}

type EditorTab = "details" | "venue" | "speakers" | "hosts" | "guest";

function tabLabel(tab: EditorTab) {
  switch (tab) {
    case "details":
      return "Event details";
    case "venue":
      return "Venue & maps";
    case "speakers":
      return "Speakers";
    case "hosts":
      return "Hosts";
    case "guest":
      return "Guest founder";
  }
}

function PeopleTab({
  emptyLabel,
  addLabel,
  onAdd,
  count,
  children,
}: {
  emptyLabel: string;
  addLabel: string;
  onAdd: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {count === 0 ? emptyLabel : `${count} added`}
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]"
        >
          <Plus className="size-3.5" strokeWidth={2.25} />
          {addLabel}
        </button>
      </div>
      {count === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background-alt)] px-4 py-10 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--brand-accent)] hover:text-foreground"
        >
          <Plus className="size-5 opacity-50" />
          {addLabel}
        </button>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function PersonCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[0_1px_2px_rgba(59,35,24,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600"
          aria-label="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
