const express = require('express');
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config()

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const database = client.db("startupfordge_db");
    const opportunitiesCollection = database.collection("opportunities");
    const startupsCollection = database.collection("startups");
    const usersCollection = database.collection("user");


    app.get('/api/users',async(req, res)=>{
        const cursor = usersCollection.find().skip(3); 
        const result = await cursor.toArray();
        res.send(result);
    })
 
    app.get('/api/startups', async (req, res)=>{
        const cursor = startupsCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
    })

    // Get active opportunity
    app.get('/api/opportunities',async(req, res) => {
        const query = {};
        if(req.query.opportunityId){
            query.opportunityId = req.query.opportunityId;
        }
        if(req.query.status){
            query.status = req.query.status;
        }

        const cursor = opportunitiesCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })


    // get a opportunity details
    app.get('/api/opportunities/:id', async(req, res) => {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id)
        };
        const result = await opportunitiesCollection.findOne(query);
        res.send(result);
    }) 


    // Create an opportunity
    app.post('/api/opportunities', async(req, res) => {
        const opportunity = req.body;
        const newOpportunity = {
            ...opportunity,
            createdAt: new Date()
        }
        const result = await opportunitiesCollection.insertOne(newOpportunity);
        res.send(result);
    })

    // Create a startup
    app.post('/api/startups', async(req, res) => {
        const startup = req.body;
        const newStartup = {
            ...startup,
            createdAt: new Date()
        }
        const result = await startupsCollection.insertOne(newStartup);
        res.send(result);
    })

    // Get startup by founder
    app.get('/api/my/startups', async(req, res) => {
        const query = {};
        if(req.query.founderId){
            query.founderId = req.query.founderId;
        }
        const result = await startupsCollection.findOne(query);
        res.send(result || {});
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})