import { selectProjectId } from "redux/Metadata";
import { Project, defaultProject, isProject } from "types/Project";
import { User, UserUpdate, initializeUser } from "types/User";

// Database
export var db: IDBDatabase;
export const DATABASE_NAME = "garbageDB";

// Stores
export const PROJECT_STORE = "projects";
export const CURRENT_ID_STORE = "currentProjectId";
export const USER_STORE = "user";

const request = indexedDB.open(DATABASE_NAME, 2);

// Delete the database and refresh the version.

/** Upgrade the database when the shape of the store changes.*/
request.onupgradeneeded = (event) => {
  db = (event.target as IDBOpenDBRequest).result;

  // Create the user.
  if (!db.objectStoreNames.contains(USER_STORE)) {
    db.createObjectStore(USER_STORE);
  }

  // Create the current project ID store.
  if (!db.objectStoreNames.contains(CURRENT_ID_STORE)) {
    db.createObjectStore(CURRENT_ID_STORE);
  }

  // Create the list of projects.
  if (!db.objectStoreNames.contains(PROJECT_STORE)) {
    db.createObjectStore(PROJECT_STORE, { keyPath: "meta.id" });
  }
};

/** Update the database when the connection succeeds. */
request.onsuccess = (event) => {
  db = (event.target as IDBOpenDBRequest).result;

  // Try to get the user.
  const userTransaction = db.transaction([USER_STORE], "readonly");
  const userStore = userTransaction.objectStore(USER_STORE);
  const userRequest = userStore.get("user");

  // If no user, try to add the user to the database.
  userRequest.onsuccess = () => {
    const user = initializeUser();
    const transaction = db.transaction([USER_STORE], "readwrite");
    const objectStore = transaction.objectStore(USER_STORE);
    objectStore.add(user, "user");
  };

  // Try to get the current list of projects
  const projectsTransaction = db.transaction([PROJECT_STORE], "readwrite");
  const projectsStore = projectsTransaction.objectStore(PROJECT_STORE);
  const projectsRequest = projectsStore.getAll();

  // If successful, try to add a new project if none exist.
  projectsRequest.onsuccess = () => {
    if (!projectsRequest.result || projectsRequest.result.length === 0) {
      const newProject = { ...defaultProject };
      const id = newProject.meta.id;
      const request = projectsStore.add(newProject);

      // If successful, set the current project to the new project.
      request.onsuccess = async () => {
        await setCurrentProjectId(id);
      };
    }
  };
};

/** Handle any database errors by logging them. */
request.onerror = (event) => {
  console.error("Request Error: ", event);
};

/**
 * Try to get the user from the database.
 * @returns A promise that resolves to the user or undefined if it doesn't exist.
 */
export const getUserFromDB = (): Promise<User | undefined> => {
  return new Promise((resolve) => {
    if (!db) return resolve(undefined);

    // Try to get the user from the database.
    const transaction = db.transaction([USER_STORE], "readonly");
    const objectStore = transaction.objectStore(USER_STORE);
    const request = objectStore.get("user");

    // If successful, resolve with the result of the request.
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Try to update the user in the database.
 * @param user Partial. The user to update.
 * @returns A promise that resolves to true if the update was successful.
 */
export const updateUserInDB = (user: UserUpdate): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(false);

    // Try to get the user from the database.
    const transaction = db.transaction([USER_STORE], "readwrite");
    const objectStore = transaction.objectStore(USER_STORE);
    const getRequest = objectStore.get("user");

    // If successful, update the user in the database.
    getRequest.onsuccess = () => {
      if (!getRequest.result) return resolve(false);
      const putRequest = objectStore.put(
        { ...getRequest.result, ...user },
        "user"
      );
      putRequest.onsuccess = () => resolve(true);
    };
  });
};

/**
 * Create a new project in the database.
 * @param project The project to upload.
 * @returns A promise that resolves to true if the upload was successful.
 * @error The promise is rejected if the project is invalid.
 */
export const uploadProjectToDB = async (project: Project): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    // Make sure the database is open and the project is valid.
    if (!db) return resolve(false);
    if (!isProject(project)) return reject("Invalid project.");

    // Add the project to the database.
    const transaction = db.transaction([PROJECT_STORE], "readwrite");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const req = objectStore.add(project);

    // Set the current project to the new project and resolve.
    req.onsuccess = async () => {
      await setCurrentProjectId(project.meta.id);
      resolve(true);
    };
  });
};

/**
 * Update the project in the database only if it exists.
 * @param project The state to update.
 * @returns A promise that resolves to true if the update was successful.
 * @error The promise is rejected if the state is invalid.
 */
export const updateProjectInDB = (project: Project): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(false);
    if (!isProject(project)) return reject("Invalid state.");

    // Try to get the project from the database.
    const id = selectProjectId(project);
    const transaction = db.transaction([PROJECT_STORE], "readwrite");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const getRequest = objectStore.get(id);

    // If successful, update the project in the database.
    getRequest.onsuccess = () => {
      if (!getRequest.result) return resolve(false);
      const putRequest = objectStore.put(project);
      putRequest.onsuccess = () => resolve(true);
    };
  });
};

/**
 * Delete the project from the database.
 * @param id The ID of the project to delete.
 * @returns A promise that resolves to true if the deletion was successful.
 */
export const deleteProjectFromDB = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(false);

    // Try to delete the project from the database.
    const transaction = db.transaction([PROJECT_STORE], "readwrite");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const req = objectStore.delete(id);

    // If successful, delete the current project if it is the one being deleted.
    req.onsuccess = async () => {
      // Try to get the current project.
      const transaction = db.transaction([CURRENT_ID_STORE], "readwrite");
      const objectStore = transaction.objectStore(CURRENT_ID_STORE);
      const getRequest = objectStore.get("currentProject");

      // If successful, delete the current project if it matches the given one.
      getRequest.onsuccess = () => {
        if (getRequest.result?.id === id) {
          const deleteReq = objectStore.delete("currentProject");
          deleteReq.onsuccess = () => resolve(true);
        } else {
          resolve(true);
        }
      };
    };
  });
};

/**
 * Get all projects from the database.
 * @returns A promise that resolves to an array of projects.
 */
export const getProjectsFromDB = async (): Promise<Project[]> => {
  return new Promise((resolve) => {
    if (!db) return resolve([]);

    // Try to get all the projects from the database.
    const transaction = db.transaction([PROJECT_STORE], "readonly");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const request = objectStore.getAll();

    // If successful, resolve with the result of the request.
    request.onsuccess = () => {
      resolve(request.result as Project[]);
    };
  });
};

/**
 * Get the project with the given ID from the database.
 * @param id The ID of the project to get.
 * @returns A promise that resolves to the project or undefined if it doesn't exist.
 */
export const getProjectFromDB = (id: string): Promise<Project | undefined> => {
  return new Promise((resolve) => {
    if (!db) return resolve(undefined);

    // Try to get the project from the database.
    const transaction = db.transaction([PROJECT_STORE], "readonly");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const request = objectStore.get(id);

    // If successful, resolve with the result of the request.
    request.onsuccess = () => {
      resolve(request.result as Project);
    };
  });
};

/**
 * Set the ID of the current project in the database.
 * @param id The ID of the project to set as current.
 * @returns A promise that resolves to true if the update was successful.
 */
export const setCurrentProjectId = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!db) return resolve(false);

    // Check if the project exists.
    const transaction = db.transaction([PROJECT_STORE], "readonly");
    const objectStore = transaction.objectStore(PROJECT_STORE);
    const getReq = objectStore.get(id);

    // If successful, try to set the current project.
    getReq.onsuccess = () => {
      if (!getReq.result) return resolve(false);

      // Set the current project.
      const transaction = db.transaction([CURRENT_ID_STORE], "readwrite");
      const objectStore = transaction.objectStore(CURRENT_ID_STORE);
      const putReq = objectStore.put({ id }, "currentProject");

      // If successful, resolve.
      putReq.onsuccess = () => resolve(true);
    };
  });
};

/**
 * Get the ID of the current project from the database.
 * @returns A promise that resolves to the current project ID or undefined if it doesn't exist.
 */
export const getCurrentProjectId = (): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (!db) return resolve(undefined);

    // Try to get the current project from the database.
    const transaction = db.transaction([CURRENT_ID_STORE], "readonly");
    const objectStore = transaction.objectStore(CURRENT_ID_STORE);
    const request = objectStore.get("currentProject");

    // If successful, resolve with the result of the request.
    request.onsuccess = () => {
      resolve(request.result?.id);
    };
  });
};
