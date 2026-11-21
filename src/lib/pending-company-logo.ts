
const DB_NAME = "wjrfin-onboarding";
const STORE_NAME = "pending-company-logos";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open logo storage."));
  });
}

export async function savePendingCompanyLogo(
  userId: string,
  file: File
): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put(file, userId);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Unable to save logo."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Logo storage cancelled."));
    });
  } finally {
    db.close();
  }
}

export async function getPendingCompanyLogo(
  userId: string
): Promise<File | null> {
  const db = await openDatabase();

  try {
    return await new Promise<File | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(userId);

      request.onsuccess = () => resolve((request.result as File) ?? null);
      request.onerror = () =>
        reject(request.error ?? new Error("Unable to read logo."));
    });
  } finally {
    db.close();
  }
}

export async function clearPendingCompanyLogo(
  userId: string
): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).delete(userId);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Unable to delete logo."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Logo deletion cancelled."));
    });
  } finally {
    db.close();
  }
}
