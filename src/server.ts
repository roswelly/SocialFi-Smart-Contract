import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDb from './components/connection';
import scoreDb from './components/scores';
import { ScoreRequest, UserScore } from './types';

const app = express();

app.use(cors());
app.use(express.json());

// connects to the database
connectDb();

app.get("/", (_req: Request, res: Response) => {
    res.send("Server Running");
});

app.post("/userScores", async (req: Request<{}, {}, ScoreRequest>, res: Response) => {
    const { userImage: picture, userName: name, userScore: score } = req.body;

    const message = new scoreDb({
        UserImage: picture,
        UserName: name,
        UserScore: score
    });

    try {
        await message.save();
        console.log("Saved");
        res.send("Success");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving score");
    }
});

app.get("/ScoreBoard", async (_req: Request, res: Response) => {
    try {
        const result = await scoreDb.find({});
        const topScores = result.sort((a, b) => b.UserScore - a.UserScore);
        res.send(topScores.slice(0, 10));
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching scores");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 