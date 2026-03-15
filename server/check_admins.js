const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/attire') // Correct DB Name
    .then(async () => {
        const admins = await User.find({ role: 1 });
        console.log('Admins found:', admins.map(a => ({ name: a.name, email: a.email })));
        mongoose.disconnect();
    })
    .catch(err => console.error('Error connecting:', err));
