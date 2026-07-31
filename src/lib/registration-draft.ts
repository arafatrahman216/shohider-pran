// Save-and-resume for the registration wizard (Section 1). Pure localStorage
// persistence — nothing here touches the server; a draft is just unsent
// form state living in the browser until the user submits or discards it.

export const DRAFT_STORAGE_KEY = "sp-register-draft-v1";
const DRAFT_EVENT = "sp-register-draft-change";

export type RegistrationDraft<TForm> = {
  form: TForm;
  stepIndex: number;
  savedAt: string;
};

export function saveDraft<TForm>(form: TForm, stepIndex: number): void {
  const draft: RegistrationDraft<TForm> = { form, stepIndex, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

export function subscribeDraft(callback: () => void): () => void {
  window.addEventListener(DRAFT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(DRAFT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getDraftSnapshot(): string | null {
  return localStorage.getItem(DRAFT_STORAGE_KEY);
}

export function getServerDraftSnapshot(): string | null {
  return null;
}
