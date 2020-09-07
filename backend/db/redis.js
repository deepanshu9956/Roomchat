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
    },
    addMessage: async function(user, message) {
        return new Promise( (resolve, reject) => {
            const multi = client.multi()
            multi.rpush('chat.message', JSON.stringify({'username': user, 'message': message}));
            multi.exec(function(error, result) {
                if (error) {
                    reject(error);
                } else {
                    client.expire('chat.message', 500);
                    resolve(result);
                }
            })
        })
    },
    getMessages: async function() {
        return new Promise( (resolve, reject) => {
            console.log('HI HELLO1')
            client.lrange('chat.message', 0, -1, function(error, reply) {
                if (error) {
                    reject(error);
                } else {
                    resolve(reply);
                }
                // ['angularjs', 'backbone']
            });
            console.log('HI HELLO2')
        })
    }
}

module.exports = redisOperation;

