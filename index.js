const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5001;
const bodyParser = require('body-parser');      //add body parser for hassel free to conver the req body into josn
require('dotenv').config()

//middleware


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://bikolpo.netlify.app"],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send("Thanks for reach out our biKolpo Server");

})
// app.use(cors())
app.use(bodyParser.json());
app.use(cookieParser());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.lm9a1gh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const recomendationCollection = client.db('biKolpo').collection('recomendation')
        const queriesCollection = client.db('biKolpo').collection("queries")

        //auth related api


        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign({ user: user.email }, process.env.Access_Token_Secret, { expiresIn: '24h' });
            res.cookie('token', token, cookieOptions).send({ success: true });
        })


        app.post("/logout", async (req, res) => {
            const user = req.body;
            console.log("logging out", user);
            res
                .clearCookie("token", { ...cookieOptions, maxAge: 0 })
                .send({ success: true });
        });


        app.post("/addQueries", async (req, res) => {
            try {
                const data = req.body;

                const result = await queriesCollection.insertOne(data)
                if (result.acknowledged === true) {
                    res.status(201).send("Query Added Successfully!")
                }
                else {
                    res.send("")
                }
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }


        })


        app.post("/addRecomendation/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const data = req.body;
                const result = await recomendationCollection.insertOne(data);
                const abc = await queriesCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { recomendationCount: 1 } });

                if (result.acknowledged === true) {
                    res.status(201).send("Recomendation Added Successfully!");
                }
                else {
                    res.send("No Inserted")
                }
            }

            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })


        app.post("/queryDetails/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = queriesCollection.find({ _id: new ObjectId(id) });
                const finalResult = await result.toArray();
                res.send(finalResult);

            }

            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })




        app.get("/allQeuries", async (req, res) => {
            try {
                const result = queriesCollection.find().sort({ currentDateTime: -1 });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })
        app.get("/noRecomendation", async (req, res) => {
            try {
                const specificEmailToSkip = req.query.email;
                const result = queriesCollection.find({ recomendationCount: 0, email: { $not: { $eq: specificEmailToSkip } } }).limit(10);
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })

        app.get("/allQueries/:ProductName", async (req, res) => {
            try {
                const searchTxt = req.params.ProductName;
                const searchWord = searchTxt.toLowerCase().split(/\s+/);
                const regex = new RegExp(searchWord.join('|'), 'i');
                const result = await queriesCollection.find({ ProductName: { $regex: regex } }).toArray();

                res.send(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ error: "Something went wrong (Code:500)" });
            }
        })


        app.get("/myQueries/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const result = queriesCollection.find({ email: email }).sort({ currentDateTime: -1 });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })

        app.get("/myRecomendetion/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const result = recomendationCollection.find({ recommernderEmail: email });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })

        app.get("/allRecomendation/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = recomendationCollection.find({ postId: id });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })


        app.get("/recomendationForMe/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const result = recomendationCollection.find({ quryUserEmail: email });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })


        app.get("/updateQuery/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = queriesCollection.find({ _id: new ObjectId(id) });
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })
        app.get("/sevenQueries", async (req, res) => {
            try {
                const result = queriesCollection.find().limit(7);
                const finalResult = await result.toArray();
                res.send(finalResult);
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })

        app.put("/queryUpdate/:id", async (req, res) => {
            try {

                const result = await queriesCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });


                res.status(201).send("Updated Successfully!");
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }

        })

        app.delete("/myAddedSpot/:id", async (req, res) => {
            try {
                const deleteStatus = await queriesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
                res.send(deleteStatus)
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })
        app.delete("/myRecomendation/:id", async (req, res) => {
            try {
                const getId = await recomendationCollection.findOne({ _id: new ObjectId(req.params.id) });
                const postId = getId.postId;
                await queriesCollection.updateOne({ _id: new ObjectId(postId) }, { $inc: { recomendationCount: -1 } })
                const deleteStatus = await recomendationCollection.deleteOne({ _id: new ObjectId(req.params.id) });
                res.send(deleteStatus)
            }
            catch {
                const error = new Error('Something went wrong (Code:500)');
                res.status(500).json({ error: error.message });
            }
        })






    } finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log("biKolpo are Running on PORT:...", port);
})