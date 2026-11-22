"use client";
import { translate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Building2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

type ContactType = "Client" | "Supplier";

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: ContactType;
};


const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]";

export default function ContactsPage({ companyId }: { companyId: string | null }) {
  const { language } = useLanguage();
  const t = (key: string) => translate(language, key);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<ContactType>("Client");

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      if (!companyId) {
        queueMicrotask(() => {
          if (!cancelled) {
            setContacts([]);
            setLoading(false);
          }
        });
        return;
      }

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("contacts")
        .select("id, name, company, email, phone, type")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setContacts([]);
      } else {
        setError("");
        setContacts((data ?? []) as Contact[]);
      }
      setLoading(false);
    }

    void loadContacts();
    return () => { cancelled = true; };
  }, [companyId]);

  const totalClients = contacts.filter(
    (contact) => contact.type === "Client"
  ).length;

  const totalSuppliers = contacts.filter(
    (contact) => contact.type === "Supplier"
  ).length;

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        `${contact.name} ${contact.company} ${contact.email} ${contact.phone}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        filter === "All" || contact.type === filter;

      return matchesSearch && matchesType;
    });
  }, [contacts, search, filter]);

  function resetForm(nextType: ContactType = "Client") {
    setEditingId(null);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setType(nextType);
  }

  function openNewModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(contact: Contact) {
    setEditingId(contact.id);
    setName(contact.name);
    setCompany(contact.company);
    setEmail(contact.email);
    setPhone(contact.phone);
    setType(contact.type);
    setModalOpen(true);
  }

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId || saving || !name.trim() || !email.trim()) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const values = {
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        type,
      };

      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("contacts")
          .update(values)
          .eq("id", editingId)
          .eq("company_id", companyId)
          .select("id, name, company, email, phone, type")
          .single();
        if (updateError) throw updateError;
        setContacts((current) => current.map((item) =>
          item.id === editingId ? (data as Contact) : item
        ));
      } else {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth.user) throw new Error("Authentication required.");
        const { data, error: insertError } = await supabase
          .from("contacts")
          .insert({ ...values, company_id: companyId, user_id: auth.user.id })
          .select("id, name, company, email, phone, type")
          .single();
        if (insertError) throw insertError;
        setContacts((current) => [data as Contact, ...current]);
      }

      setModalOpen(false);
      resetForm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save contact.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteContact(id: string) {
    if (!companyId || saving) return;
    const confirmed = window.confirm(t("Are you sure you want to delete this contact?"));
    if (!confirmed) return;
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: deleteError } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)
        .eq("company_id", companyId)
        .select("id");
      if (deleteError) throw deleteError;
      if (!data?.length) throw new Error("Contact could not be deleted. Check your permissions.");
      setContacts((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete contact.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      {error && (
        <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {loading && <p className="text-sm text-[var(--text-secondary)]">{t("Loading...")}</p>}
      {!companyId && !loading && (
        <p className="text-sm text-[var(--text-secondary)]">{t("No company found for this account.")}</p>
      )}
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-[var(--text-secondary)]">
            {t("Business Directory")}
          </p>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("Contacts")}{" "}
            <span className="text-[var(--primary)]">✦</span>
          </h2>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {t("Manage your clients, suppliers and business relationships.")}
          </p>
        </div>

        <button
          onClick={openNewModal}
          disabled={!companyId || loading || saving}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={17} />
          {t("Add Contact")}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title={t("Total Contacts")}
          value={contacts.length}
          icon={<Users size={19} />}
        />

        <SummaryCard
          title={t("Clients")}
          value={totalClients}
          icon={<Users size={19} />}
        />

        <SummaryCard
          title={t("Suppliers")}
          value={totalSuppliers}
          icon={<Building2 size={19} />}
        />
      </div>

      {/* Contact directory */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold">
              {t("Contact Directory")}
            </h3>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {filteredContacts.length} {t("contacts")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
              <Search
                size={16}
                className="text-[var(--text-secondary)]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t("Search contacts...")}
                className="w-40 bg-transparent text-sm outline-none md:w-52"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
            >
              <option value="All">{t("All Contacts")}</option>
              <option value="Client">{t("Clients")}</option>
              <option value="Supplier">{t("Suppliers")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-[var(--sidebar)] text-xs text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">
                  {t("Contact")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("Company")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("Email")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("Phone")}
                </th>
                <th className="px-6 py-4 font-medium">
                  {t("Type")}
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  {t("Actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-t border-[var(--border)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                        {contact.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </div>

                      <span className="font-semibold">
                        {contact.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {contact.company || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"
                    >
                      <Mail size={14} />
                      {contact.email}
                    </a>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                    {contact.phone || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        contact.type === "Client"
                          ? "bg-[#EAF3E7] text-[#427445]"
                          : "bg-[#FBEAE6] text-[#A54B3B]"
                      }`}
                    >
                      {t(contact.type)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditModal(contact)
                        }
                        aria-label={`${t("Edit Contact")}: ${contact.name}`}
                        className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => { void deleteContact(contact.id); }}
                        disabled={saving}
                        aria-label={`${t("Delete")}: ${contact.name}`}
                        className="rounded-lg p-2 text-[#A54B3B] transition hover:bg-[#FBEAE6]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContacts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[var(--text-secondary)]"
                  >
                    {t("No contacts found.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-[var(--text-secondary)]">
        {t("Contacts are saved securely for your company.")}
      </p>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3
                  id="contact-modal-title"
                  className="text-xl font-bold"
                >
                  {editingId
                    ? t("Edit Contact")
                    : t("Add Contact")}
                </h3>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {t("Business contact information")}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label={t("Close form")}
                className="rounded-lg p-2 hover:bg-[var(--primary-soft)]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveContact}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-xs font-semibold"
                >
                  {t("Full Name")}
                </label>

                <input
                  id="contact-name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. James Anderson"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-company"
                  className="mb-2 block text-xs font-semibold"
                >
                  {t("Company")}
                </label>

                <input
                  id="contact-company"
                  maxLength={120}
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="e.g. Acme Solutions"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-xs font-semibold"
                >
                  {t("Email Address")}
                </label>

                <input
                  id="contact-email"
                  type="email"
                  required
                  maxLength={150}
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="contact@company.com"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-xs font-semibold"
                  >
                    {t("Phone Number")}
                  </label>

                  <input
                    id="contact-phone"
                    type="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="+1 555 0000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-type"
                    className="mb-2 block text-xs font-semibold"
                  >
                    {t("Contact Type")}
                  </label>

                  <select
                    id="contact-type"
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target.value as ContactType
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Client">{t("Client")}</option>
                    <option value="Supplier">{t("Supplier")}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                >
                  {t("Cancel")}
                </button>

                <button
                  type="submit"
                  disabled={saving || !companyId}
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingId
                    ? t("Save Changes")
                    : t("Save Contact")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_rgba(80,60,35,0.035)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">
          {title}
        </span>

        <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
          {icon}
        </div>
      </div>

      <h3 className="text-3xl font-bold tracking-tight">
        {value}
      </h3>
    </div>
  );
}
