const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "landsurvey-ebb3b",
});

const db = admin.firestore();
db.settings({ databaseId: "datacollectionportal" });

async function checkUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

checkUsers().catch(console.error);
