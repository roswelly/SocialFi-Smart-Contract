const express = require('express')
const cors = require('cors')
const connectDb = require('./components/connection')
const scoreDb = require('./components/scores')
const app = express()

// const baseUrl = "https://robo-dash.netlify.app"
// const baseUrl = "http://localhost:3000"

app.use(cors())
app.use(express.json())

// connects to the database
connectDb()


app.get("/", (req, res) => {
    res.send("Server Running")
})

app.post("/userScores", async (req, res) => {
    // console.log(req.body)
    const picture = req.body.userImage
    const name = req.body.userName
    const score = req.body.userScore

    const message = new scoreDb(
        {
            UserImage: picture,
            UserName: name,
            UserScore: score
        })

    try {
        await message.save()
        console.log("Saved");
        res.send("Success")

    } catch (error) {
        console.log(error.message);
    }
})

app.get("/ScoreBoard", (req, res) => {

    scoreDb.find({}, (error, result) => {
        if (error) {
            res.send(error.message)
        }

        const topScores = result.sort((a, b) => {
            return parseInt(b.UserScore) - parseInt(a.UserScore)
        })

        // console.log(topScores)
        // console.log(result)
        res.send(topScores.slice(0, 10))
    })
})

app.listen(process.env.PORT || 5000, () => {
    console.log("server running");
})