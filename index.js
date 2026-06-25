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
        const applicationsCollection = database.collection("applications");
        const planCollection = database.collection("plans");
        const paymentCollection = database.collection("payments");


        // Get User
        app.get('/api/users', async (req, res) => {
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Update User
        app.patch('/api/users/:id', async (req, res) => {
            const id = req.params.id;
            const { name, image, skills, bio, isBlocked } = req.body;
            const filter = {
                _id: new ObjectId(id)
            };

            const updateFields = {};
            if (name !== undefined) updateFields.name = name;
            if (image !== undefined) updateFields.image = image;
            if (skills !== undefined) updateFields.skills = skills;
            if (bio !== undefined) updateFields.bio = bio;
            if (isBlocked !== undefined) updateFields.isBlocked = isBlocked;

            const updateDocument = {
                $set: updateFields
            };
            const result = await usersCollection.updateOne(filter, updateDocument);
            res.send(result);
        })

       // ALL ABOUT OPPORTUNITY //

        // Create an opportunity
        app.post('/api/opportunities', async (req, res) => {
            const opportunity = req.body;
            const newOpportunity = {
                ...opportunity,
                createdAt: new Date()
            }
            const result = await opportunitiesCollection.insertOne(newOpportunity);
            res.send(result);
        })

        // Get active opportunity
        app.get('/api/opportunities', async (req, res) => {
            const query = {};
            if (req.query.opportunityId) {
                query.opportunityId = req.query.opportunityId;
            }
            if (req.query.startupId) {
                query.startupId = req.query.startupId;
            }
            if (req.query.status) {
                query.status = req.query.status;
            }
            if (req.query.search) {
                query.roleTitle = { $regex: req.query.search, $options: 'i' };
            }
            if (req.query.skills) {
                query.requiredSkills = { $regex: req.query.skills, $options: 'i' };
            }
            if (req.query.workType) {
                query.workType = { $in: [].concat(req.query.workType) };
            }

            const cursor = opportunitiesCollection.find(query).sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        // get a opportunity details
        app.get('/api/opportunities/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await opportunitiesCollection.findOne(query);
            res.send(result);
        })

        // update opportunity
        app.patch('/api/opportunity/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOpportunity = req.body;
            const filter = {
                _id: new ObjectId(id)
            };
            const updateDocument = {
                $set: {
                    ...updatedOpportunity
                }
            }
            const result = await opportunitiesCollection.updateOne(filter, updateDocument);
            res.send(result);
        })

        // Delete opportunity
        app.delete('/api/opportunity/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await opportunitiesCollection.deleteOne(query);
            res.send(result);
        })



        // ALL ABOUT STARTUP //

        // Create a startup
        app.post('/api/startups', async (req, res) => {
            const startup = req.body;
            const newStartup = {
                ...startup,
                createdAt: new Date()
            }
            const result = await startupsCollection.insertOne(newStartup);
            res.send(result);
        })

        // Get startup
        app.get('/api/startups', async (req, res) => {
            const cursor = startupsCollection.find({}).sort({ createdAt: -1 });
            const startups = await cursor.toArray();

            for (const startup of startups) {
                const filter = {
                    startupId: startup._id.toString()
                }
                const opportunityCount = await opportunitiesCollection.countDocuments(filter);
                startup.opportunityCount = opportunityCount;
            }
            res.send(startups);
        })


        // Get startup by founder
        app.get('/api/my/startups', async (req, res) => {
            const query = {};
            if (req.query.founderId) {
                query.founderId = req.query.founderId;
            }
            const result = await startupsCollection.findOne(query);
            res.send(result || {});
        })

        // update startup info
        app.patch('/api/startup/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStartup = req.body;
            const filter = {
                _id: new ObjectId(id)
            };
            const updateDocument = {
                $set: {
                    ...updatedStartup
                    // status: updatedStartup.status
                }
            }
            const result = await startupsCollection.updateOne(filter, updateDocument);
            res.send(result);
        })

        // Delete startup
        app.delete('/api/startup/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await startupsCollection.deleteOne(query);
            res.send(result);
        })


        // APPLICATIONS //

        // Apply for an opportunity
        app.post('/api/applications', async (req, res) => {
            const application = req.body;
            const newApplication = {
                ...application,
                createdAt: new Date()
            }
            const result = await applicationsCollection.insertOne(newApplication);
            res.send(result);
        })

        // get the application
        app.get('/api/applications', async (req, res) => {
            const query = {};
            if (req.query.applicationId) {
                query.applicationId = req.query.applicationId;
            }
            if (req.query.opportunityId) {
                query.opportunityId = req.query.opportunityId;
            }
            if (req.query.email) {
                query.Applicant_email = req.query.email;
            }
            if (req.query.applicantId) {
                query.Applicatnt_id = req.query.applicantId;
            }
            if (req.query.startupId) {
                query.startup_id = req.query.startupId;
            }
            const cursor = applicationsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // update application status
        app.patch('/api/applications/:id', async (req, res) => {
            const id = req.params.id;
            const updatedApplication = req.body;
            const filter = {
                _id: new ObjectId(id)
            };
            const updateDocument = {
                $set: {
                    Status: updatedApplication.Status
                }
            }
            const result = await applicationsCollection.updateOne(filter, updateDocument);
            res.send(result);
        })


        // Plans
        app.get('/api/plans', async (req, res) => {
            const query = {};
            if (req.query.plan_id) {
                query.id = req.query.plan_id === "free" ? "free" : req.query.plan_id;
            }
            const plan = await planCollection.findOne(query);
            res.send(plan);
        })

        // Payment related
        // Get all payments (for admin)
        app.get('/api/payments', async (req, res) => {
            const cursor = paymentCollection.find().sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/api/payments', async (req, res) => {
            const data = req.body;
            const newPayment = {
                email: data.email,
                amount: data.amount,
                status: data.status,
                planId: data.planId,
                transactionId: data.transactionId,
                createdAt: new Date()
            }
            const result = await paymentCollection.insertOne(newPayment);
            const filter = {
                $or: [
                    { email: data.email },
                    { founderEmail: data.email }
                ]
            };
            const updateDocument = {
                $set: {
                    plan: data.planId,
                    paymentStatus: data.status,
                    transactionId: data.transactionId
                }
            }
            await startupsCollection.updateOne(filter, updateDocument);
            res.send(result);
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