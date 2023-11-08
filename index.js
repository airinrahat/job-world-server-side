const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

console.log(process.env.DB_PASS);
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbdkno8.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log("token in the middleware", token);

  //no token avaible
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
  // next();
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const JobCollection = client.db("jobWorldDB").collection("addjob");
    const AppliedJobCollection = client
      .db("jobWorldDB")
      .collection("appliedjob");

    // jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    //my job data get
    app.get("/addjob", async (req, res) => {
      const cursor = JobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //my job data id gat

    app.get("/addjob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobCollection.findOne(query);
      res.send(result);
    });

    //my job data category gat

    app.get("/alljobscategory", async (req, res) => {
      console.log(req.query.jobcategory);
      let query = {};
      if (req.query?.jobcategory) {
        query = { jobcategory: req.query.jobcategory };
      }
      const result = await JobCollection.find(query).toArray();
      res.send(result);
    });

    //my job data get emaill
    app.get("/myjobs", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await JobCollection.find(query).toArray();
      res.send(result);
    });

    //my job data post
    app.post("/addjob", async (req, res) => {
      const newaddJob = req.body;
      console.log(newaddJob);
      const result = await JobCollection.insertOne(newaddJob);
      res.send(result);
    });

    //applied job data post
    app.post("/appliedjob", async (req, res) => {
      const newappliedJob = req.body;
      console.log(newappliedJob);
      const result = await AppliedJobCollection.insertOne(newappliedJob);
      res.send(result);
    });

    //applied job data get
    app.get("/appliedjob", async (req, res) => {
      const cursor = AppliedJobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //applied job data get email
    app.get("/myappliedjobs", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await AppliedJobCollection.find(query).toArray();
      res.send(result);
    });

    //my job data update

    app.put("/addjob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJob = req.body;
      const job = {
        $set: {
          name: updatedJob.name,
          datepic: updatedJob.datepic,
          jobtitle: updatedJob.jobtitle,
          jobcategory: updatedJob.jobcategory,
          salary: updatedJob.salary,
          photo: updatedJob.photo,
          description: updatedJob.description,
          applicationDeadline: updatedJob.applicationDeadline,
          JobApplicant: updatedJob.JobApplicant,
        },
      };
      const result = await JobCollection.updateOne(filter, job, options);

      res.send(result);
    });

    //my job data deleted
    app.delete("/addjob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobCollection.deleteOne(query);
      res.send(result);
    });

    //add a all job

    app.get("/addjob", async (req, res) => {
      const cursor = JobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job world site is running");
});
app.listen(port, () => {
  console.log(`job server is runnig on port :${port}`);
});
