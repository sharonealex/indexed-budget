let db;
let budgetVersion;


//create new db request for a "budget" database

const request = indexedDB.open("BudgetDB", budgetVersion || 21);

request.onupgradeneeded = function(e) {
    console.log('Upgrade needed in IndexDb');
    const {oldVersion} = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    db = e.target.result;
    if(db.objectStoreNames.length === 0){
        db.createObjectStore("BudgetStore", {autoIncrement : true});
    }
};

request.onerror = function(e){
    console.log(`Whoopes! ${e.target.errorCode}`);
};

function checkDatabase(){
    console.log("check db invoked");

    //open a transaction on the budget store db
    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    //access your budget store
    const store = transaction.objectStore('BudgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    "Accept":'application/json, text/plain, "*',
                    "Content-Type": "application/json"
                }
            }).then((response)=>{
                response.json();
            }).then((res)=>{
                if(res.length !== 0){
                    transaction = db.transaction(['BudgetStore'], 'readwrite');
                    const currentStore = transaction.objectStore('BudgetStore');
                    currentStore.clear();
                    console.log('clearing store')
                }
            })
        }
    }
}

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;
  
    // Check if app is online before reading from db
    if (navigator.onLine) {
      console.log('Backend online! 🗄️');
      checkDatabase();
    }
  };

  const saveRecord = (record) => {
    console.log('Save record invoked');
    // Create a transaction on the BudgetStore db with readwrite access
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
  
    // Access your BudgetStore object store
    const store = transaction.objectStore('BudgetStore');
  
    // Add record to your store with add method.
    store.add(record);
  };
  
  // Listen for app coming back online
  window.addEventListener('online', checkDatabase);
  