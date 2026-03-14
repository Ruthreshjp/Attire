const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./server/models/User');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/attire');
    const admin = await User.findOne({ role: 1 });
    console.log(admin ? "Admin found: " + admin.email : "No admin");
    process.exit(0);
}
test();
