import { openDB } from "../../node_modules/idb/build/index.js";

const DB_NAME = "idb1";
const STORE_NAME = "idb_store";

const DB_NAME_MULTIPLE = "idb_multi";
const STORE_NAME_1 = "idb_store_1";
const STORE_NAME_2 = "idb_store_2";

async function open() {
  //The second parameter of the openDB is the version. This is used to upgrade the schema when
  //a first version is already in production.
  return openDB(DB_NAME, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        //https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology#object_store
        let dbStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          //this can be used instead of provide an id manually
          //autoIncrement: true,
        });
        //https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology#index
        dbStore.createIndex("id", "id");
      }
    },
  });
}

async function openWithTwoStores() {
  return openDB(DB_NAME_MULTIPLE, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME_1)) {
        let dbStore = db.createObjectStore(STORE_NAME_1, {
          keyPath: "id",
        });
        dbStore.createIndex("id", "id");
      }
      if (!db.objectStoreNames.contains(STORE_NAME_2)) {
        let dbStore = db.createObjectStore(STORE_NAME_2, {
          keyPath: "id",
        });
        dbStore.createIndex("id", "id");
      }
    },
  });
}

async function save1() {
  const db = await open();
  await db.add(STORE_NAME, { id: 22, bla: 1, bla2: 2 });
}

async function save2() {
  const db = await open();
  db.put(STORE_NAME, { id: 23, a: 1 });
}

//Tx example with a single store
async function txExample() {
  const db = await open();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.add({ id: 16, bla: 1, bla2: 2 });
  await store.add({ id: 19, bla: 1, bla2: 2 });
  await tx.done;
}

async function retrieve1() {
  const db = await open();
  console.log("key 16: ", await db.get(STORE_NAME, 16));
}

async function retrieve2() {
  const db = await open();
  const tx = db.transaction(STORE_NAME, "readonly");
  // when there is only one store tx.store will have that one
  // otherwise tx.objectStore(STORE_NAME); must be used
  console.log("key 16: ", await tx.store.get(16));
}

async function retrieve3() {
  const db = await open();
  console.log("just key: ", await db.getKey(STORE_NAME, 16));
}

async function retrieve4() {
  const db = await open();
  console.log("all: ", await db.getAll(STORE_NAME));
}

async function retrieve5() {
  const db = await open();
  console.log("all keys: ", await db.getAllKeys(STORE_NAME));
}

async function count() {
  const db = await open();
  console.log("total: ", await db.count(STORE_NAME));
}

async function deleteOne() {
  const db = await open();
  await db.delete(STORE_NAME, 16);
}

async function update() {
  const db = await open();
  db.put(STORE_NAME, { id: 19, a: 1 });
}

//Indexes: Created and named on an upgrade.
//A specific data structure for faster access to data
//https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology#index

//get item from index
async function fromIndex() {
  const db = await open();
  console.log("from index: ", await db.getFromIndex(STORE_NAME, "id", 19));
}

//get all from index
async function allFromIndex() {
  const db = await open();
  console.log("all from index: ", await db.getAllFromIndex(STORE_NAME, "id"));
}

//clear
async function deleteAll() {
  const db = await open();
  await db.clear(STORE_NAME);
}

//multiple store transactions
async function txMultipleStore() {
  const db = await openWithTwoStores();
  const tx = db.transaction([STORE_NAME_1, STORE_NAME_2], "readwrite");
  const store = tx.objectStore(STORE_NAME_1);
  await store.add({ id: 18, bla: 1, bla2: 2 });
  await store.add({ id: 10, bla: 1, bla2: 2 });

  const store2 = tx.objectStore(STORE_NAME_2);
  await store2.add({ id: 2, a: 1, bla2: 2 });
  await store2.add({ id: 22, b: 1, bla2: 2 });
  tx.done.then(() => {
    console.log("tx commited successfully");
  });
}

//txMultipleStore();
