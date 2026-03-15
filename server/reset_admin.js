const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/attire')
    .then(async () => {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('admin123', salt);
        await User.findOneAndUpdate({ email: 'admin@attire.com' }, { password: hashed, role: 1 });
        console.log('Admin user updated successfully');
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
