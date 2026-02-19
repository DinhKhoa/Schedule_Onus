/**
 * Migration script to clean up redundant fields in MongoDB
 * Run: node migrate.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Remove ptId from NgayTap
    console.log('Updating NgayTap...');
    const res1 = await db.collection('NgayTap').updateMany(
      {},
      { $unset: { ptId: "" } }
    );
    console.log(`✅ Removed ptId from ${res1.modifiedCount} NgayTap documents`);

    // 2. Remove ngayTapId from GioTap
    console.log('Updating GioTap...');
    const res2 = await db.collection('GioTap').updateMany(
      {},
      { $unset: { ngayTapId: "" } }
    );
    console.log(`✅ Removed ngayTapId from ${res2.modifiedCount} GioTap documents`);

    // 3. Remove hoiVienId and ptId from LichTap
    console.log('Updating LichTap...');
    const res3 = await db.collection('LichTap').updateMany(
      {},
      { $unset: { hoiVienId: "", ptId: "" } }
    );
    console.log(`✅ Removed redundant IDs from ${res3.modifiedCount} LichTap documents`);

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();
