const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/payment/create-order', {
            amount: 1000
        }, {
            headers: {
                'x-auth-token': 'invalid-or-fake-token' // Auth will fail! We need a real token or mock auth to test creating order.
            }
        });
        console.log(res.data);
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
