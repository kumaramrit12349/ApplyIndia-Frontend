import type { IContact, IContactNote, IContactReply, IContactStats } from "../../interface/ContactInterface";
import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export const listAdminContacts = (filters: {
  search?: string;
  searchField?: "reference_id" | "name" | "email" | "message" | "page_url";
  category?: string;
  status?: string;
  priority?: string;
  is_spam?: boolean;
  dateFrom?: number;
  dateTo?: number;
  limit?: number;
  startKey?: { pk: string; sk: string };
}) => {
  return privateFetch<{ success: boolean; results: IContact[]; lastEvaluatedKey?: { pk: string; sk: string } }>(
    PRIVATE_API.CONTACT_ADMIN.LIST,
    { method: "POST", body: JSON.stringify(filters) },
  );
};

export const listTrashedContacts = () => {
  return privateFetch<{ success: boolean; results: IContact[] }>(PRIVATE_API.CONTACT_ADMIN.TRASH_LIST, {
    method: "POST",
  });
};

export const fetchContactStats = () => {
  return privateFetch<{ success: boolean; data: IContactStats }>(PRIVATE_API.CONTACT_ADMIN.STATS);
};

export const getAdminContact = (id: string) => {
  return privateFetch<{ success: boolean; data: IContact }>(PRIVATE_API.CONTACT_ADMIN.GET(id));
};

export const updateContactStatus = (id: string, status: ContactStatusInput) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.STATUS(id), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const updateContactPriority = (id: string, priority: ContactPriorityInput) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.PRIORITY(id), {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
};

export const getContactNotes = (id: string) => {
  return privateFetch<{ success: boolean; data: IContactNote[] }>(PRIVATE_API.CONTACT_ADMIN.NOTES(id));
};

export const addContactNote = (id: string, body: string) => {
  return privateFetch<{ success: boolean; data: IContactNote }>(PRIVATE_API.CONTACT_ADMIN.NOTES(id), {
    method: "POST",
    body: JSON.stringify({ body }),
  });
};

export const getContactReplies = (id: string) => {
  return privateFetch<{ success: boolean; data: IContactReply[] }>(PRIVATE_API.CONTACT_ADMIN.REPLIES(id));
};

export const sendContactReply = (id: string, body: string) => {
  return privateFetch<{ success: boolean; data: IContactReply }>(PRIVATE_API.CONTACT_ADMIN.REPLIES(id), {
    method: "POST",
    body: JSON.stringify({ body }),
  });
};

export const setContactSpam = (id: string, isSpam: boolean) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.SPAM(id), {
    method: "POST",
    body: JSON.stringify({ is_spam: isSpam }),
  });
};

export const softDeleteContact = (id: string) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.DELETE(id), { method: "POST" });
};

export const restoreContact = (id: string) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.RESTORE(id), { method: "POST" });
};

export const bulkSoftDeleteContacts = (ids: string[]) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.DELETE_BULK, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
};

export const permanentlyDeleteContact = (id: string) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.DELETE_PERMANENT(id), { method: "DELETE" });
};

export const bulkPermanentlyDeleteContacts = (ids: string[]) => {
  return privateFetch<{ success: boolean }>(PRIVATE_API.CONTACT_ADMIN.DELETE_BULK_PERMANENT, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};

type ContactStatusInput = "new" | "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
type ContactPriorityInput = "high" | "medium" | "low";
