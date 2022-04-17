import { openDB } from "../../node_modules/idb/build/index.js";

const DB_NAME = "idb1";
const STORE_NAME = "idb_store";

async function test() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        let dbStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          //autoIncrement: true,
        });
        dbStore.createIndex("id", "id");
      }
    },
  });

  //The second parameter of the openDB is the version. This is used to upgrade the schema when
  //a first version is already in production.

  //una forma:
  //await db.add(STORE_NAME, { id: 11, bla: 1, bla2: 2 });

  //otra forma:
  //  const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
  //  await store.add({ id: 12, bla: 1, bla2: 2 });

  //ooootra forma:
  //const store = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
  //await store.put({ bla: 1, bla2: 2, id: 13 });

  //otra mas
  //db.put(STORE_NAME, { a: 1, id: 15 });

  //Tx en un unico store
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.add({ id: 16, bla: 1, bla2: 2 });
  await store.add({ id: 19, bla: 1, bla2: 2 });
  await tx.done;

  //get

  //count

  //clear

  //delete

  //update

  //get all from index
}

test();

// preguntar si tengo indexDB sino no pueden usar la aplicacion
