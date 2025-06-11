const mongoose = require("mongoose")

const connectDb = async () => {
    try {
        const con = await mongoose.connect("mongodb+srv://RoboAdmin:r123456@cluster0.kypii.mongodb.net/ScoreDatabase?retryWrites=true&w=majority", {
            useNewUrlParser: true,
        })
        console.log(`connected: ${con.connection.host}`)
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDb
