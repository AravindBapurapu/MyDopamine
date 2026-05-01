rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Habits collection
    match /habits/{document} {
      allow read, write: if request.auth != null && 
        resource == null || resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}