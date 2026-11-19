
"use client";

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

const STORAGE_KEY = "wjrfin-contacts-v1";

const demoContacts: Contact[] = [
  {
    id: "demo-1",
    name: "James Anderson",
    company: "Acme Solutions",
    email: "james@example.com",
    phone: "+1 555 0101",
    type: "Client",
  },
  {
    id: "demo-2",
    name: "Olivia Martinez",
    company: "Global Supply Co.",
    email: "olivia@example.com",
    phone: "+1 555 0102",
    type: "Supplier",
  },
  {
    id: "demo-3",
    name: "Daniel Roberts",
    company: "Tech Innovations",
    email: "daniel@example.com",
    phone: "+1 555 0103",
    type: "Client",
  },
  {
    id: "demo-4",
    name: "Sophia Williams",
    company: "Creative Studio",
    email: "sophia@example.com",
    phone: "+1 555 0104",
    type: "Client",
  },
  {
    id: "demo-5",
    name: "Michael Brown",
    company: "Office Essentials",
    email: "michael@example.com",
    phone: "+1 555 0105",
    type: "Supplier",
  },
];

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]";

function createId() {
  return crypto.randomUUID();
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);

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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setContacts(parsed as Contact[]);
        } else {
          setContacts(demoContacts);
        }
      } else {
        setContacts(demoContacts);
      }
    } catch {
      setContacts(demoContacts);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(contacts)
      );
    } catch (error) {
      console.error("Could not save contacts:", error);
    }
  }, [contacts, loaded]);

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

  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) return;

    const contact: Contact = {
      id: editingId ?? createId(),
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      type,
    };

    if (editingId) {
      setContacts((current) =>
        current.map((item) =>
          item.id === editingId ? contact : item
        )
      );
    } else {
      setContacts((current) => [contact, ...current]);
    }

    setModalOpen(false);
    resetForm();
  }

  function deleteContact(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    setContacts((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-[var(--text-secondary)]">
            Business Directory
          </p>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Contacts{" "}
            <span className="text-[var(--primary)]">✦</span>
          </h2>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your clients, suppliers and business relationships.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={17} />
          Add Contact
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Contacts"
          value={contacts.length}
          icon={<Users size={19} />}
        />

        <SummaryCard
          title="Clients"
          value={totalClients}
          icon={<Users size={19} />}
        />

        <SummaryCard
          title="Suppliers"
          value={totalSuppliers}
          icon={<Building2 size={19} />}
        />
      </div>

      {/* Contact directory */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold">
              Contact Directory
            </h3>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {filteredContacts.length} contacts
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
                placeholder="Search contacts..."
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
              <option value="All">All Contacts</option>
              <option value="Client">Clients</option>
              <option value="Supplier">Suppliers</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-[var(--sidebar)] text-xs text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">
                  Contact
                </th>
                <th className="px-6 py-4 font-medium">
                  Company
                </th>
                <th className="px-6 py-4 font-medium">
                  Email
                </th>
                <th className="px-6 py-4 font-medium">
                  Phone
                </th>
                <th className="px-6 py-4 font-medium">
                  Type
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  Actions
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
                      {contact.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditModal(contact)
                        }
                        aria-label={`Edit ${contact.name}`}
                        className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deleteContact(contact.id)
                        }
                        aria-label={`Delete ${contact.name}`}
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
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-[var(--text-secondary)]">
        Contacts are stored locally in this browser.
        Sample contacts are provided for demonstration.
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
                    ? "Edit Contact"
                    : "Add Contact"}
                </h3>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Business contact information
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
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
                  Full Name
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
                  Company
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
                  Email Address
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
                    Phone Number
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
                    Contact Type
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
                    <option value="Client">Client</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingId
                    ? "Save Changes"
                    : "Save Contact"}
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
