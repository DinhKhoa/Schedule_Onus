import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

import bcrypt from 'bcrypt';

// ... (previous code)

async function registerUser(db, username, password) {
  const collection = db.collection('users');
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await collection.insertOne({ username, password: hashedPassword });
    console.log(`User registered: ${username}`);
    return result;
  } catch (error) {
    if (error.code === 11000) {
        console.log(`Username already exists: ${username}`);
    } else {
        throw error;
    }
  }
}

async function loginUser(db, username, password) {
    const collection = db.collection('users');
    const user = await collection.findOne({ username });
    if (!user) {
        console.log(`Login failed: User ${username} not found`);
        return false;
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        console.log(`Login successful for: ${username}`);
        return true;
    } else {
        console.log(`Login failed: Incorrect password for ${username}`);
        return false;
    }
}

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  // Create unique index for username
  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  const collection = db.collection('documents');

  const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
  console.log('Inserted documents =>', insertResult);

  const findResult = await collection.find({}).toArray();
  console.log('Found documents =>', findResult);

  // Auth Demo
  await registerUser(db, 'user1', 'password123');
  await loginUser(db, 'user1', 'password123'); // Success
  await loginUser(db, 'user1', 'wrongpass');   // Fail

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
