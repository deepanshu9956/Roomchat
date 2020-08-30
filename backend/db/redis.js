require('dotenv').config();

const redis = require('redis');
const client = redis.createClient({
    port      : process.env.REDIS_PORT,
    host      : process.env.REDIS_HOST,
});

redisOperation = {
    login: function (email, ttl) {
        return new Promise( (resolve, reject)=> {
            client.set(`login_session.${email}`, true, (err, res)=>{
                if (err) {
                    reject(err);
                } else {
                    client.expire(`login_session.${email}`, ttl);
                    resolve(res);
                }
            });
        })
    },
    logout: function (email) {
        return new Promise((resolve, reject)=> {
            client.del(`login_session.${email}`, true, (err, res)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    },
    validate: async function(email) {
        return new Promise((resolve, reject)=> {
            client.get(`login_session.${email}`, (err, res)=>{
                if (err) {
                    reject (err);
                } else {
                    resolve(res)
                }
            })
        })
    }
}

module.exports = redisOperation;
