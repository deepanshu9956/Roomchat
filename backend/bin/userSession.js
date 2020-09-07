const sqlOperation = require('../db/mysql');
const redisOperation = require('../db/redis');
const jwt = require('jsonwebtoken');

userOperation = {
    register: async function (name, email, password, res) {
        try {
            await sqlOperation.register(name, email, password)
            return {response: "Registration Successful", error: null}
        } catch(err) {
            return {response: null, error: err}
        }
    },
    login: async function (email, password, ttl) {
        try {
            const session = await redisOperation.validate(email)
            const user = await sqlOperation.find(email);
            if (!user) {
                return {response: null, error: "User not found"}
            }
            if (password !== user.password) {
                return {response: null, error: "Wrong Password"}
            }
            await redisOperation.login(email, ttl);
            const userInfo = {
                "email": user.email,
                "ttl": ttl,
                "dt": new Date()
            }
            const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
            const username = user.name;
            return {response: {accessToken, username}, error: null}
        } catch(err) {
            return {response: null, error: err}
        }
    },
    logout: async function (loginToken) {
        try {
            const logoutMessage = await new Promise( (resolve ,reject) => {
                jwt.verify(loginToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
                    try {
                        if (!user) {
                            reject("Invalid token");
                            return;
                        }
                        const regUser = await sqlOperation.find(user.email);
                        if (!regUser) {
                            reject("User not registered");
                        }
                        const session = await redisOperation.validate(user.email)
                        if (!session) {
                            reject("No Active Session");
                            return;
                        }
                        await redisOperation.logout(user.email)
                        resolve("Logout Successful");
                    } catch(err) {
                        reject(err);
                    }
                })
            })
            return {response: logoutMessage, error: null}
        } catch(err) {
            return {response: null, error: err}
        }
    },
    validate: async function(loginToken) {
        try {
            const session = await new Promise( (resolve ,reject) => {
                jwt.verify(loginToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
                    try {
                        if (!user) {
                            reject("Invalid token");
                            return;
                        }
                        const regUser = await sqlOperation.find(user.email);
                        if (!regUser) {
                            reject("User not registered");
                        }
                        const session = await redisOperation.validate(user.email)
                        if (!session) {
                            reject("No Active Session");
                            return;
                        }
                        resolve(regUser);
                    } catch(err) {
                        reject(err);
                    }
                })
            })
            return {response: session, error: null}
        } catch(err) {
            return {response: null, error: err}
        }
    },
    refresh: async function(loginToken, ttl) {
        try {
            const session = await new Promise( (resolve ,reject) => {
                jwt.verify(loginToken, process.env.ACCESS_TOKEN_SECRET, async function (err, user) {
                    try {
                        if (!user) {
                            reject("Invalid token");
                            return;
                        }
                        const regUser = await sqlOperation.find(user.email);
                        if (!regUser) {
                            reject("User not registered");
                        }
                        const session = await redisOperation.validate(regUser.email)
                        if (!session) {
                            reject("No Active Session");
                            return;
                        }
                        await redisOperation.login(regUser.email, ttl);
                        const userInfo = {
                            "email": user.email,
                            "ttl": ttl,
                            "dt": new Date()
                        }
                        const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
                        const username = regUser.name;
                        resolve({accessToken, username});
                    } catch(err) {
                        reject(err);
                    }
                })
            })
            return {response: session, error: null}
        } catch(err) {
            return {response: null, error: err}
        }
    },
    setMessage: async function(email, message) {
        try {
            const user = await sqlOperation.find(email);
            if (!user) {
                return {response: null, error: "User not found"}
            }
            await redisOperation.addMessage(user.name, message);
        } catch (err) {
            return {response: null, error: err}
        }
    },
    getAllMessages: async function() {
        try {
            console.log('1')
            const messages = await redisOperation.getMessages()
            console.log('2')
            return {response: messages, error: null};
        } catch (err) {
            return {response: null, error: err}
        }
    }
}

module.exports = userOperation;
