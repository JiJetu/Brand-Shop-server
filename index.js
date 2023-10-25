const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dscp8or.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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


        const brandCollection = client.db("brandDB").collection("brand");


        app.get('/brand', async (req, res) => {
            const query = {};
            const options = {};
            const cursor = await brandCollection.find(query, options).toArray();
            res.send(cursor)
        })

        app.get('/brand/:name', async (req, res) => {
            const name = req.params.name;
            const query = { name: name }
            const result = await brandCollection.findOne(query);
            // console.log(query);
            res.send(result)
        })

        app.post('/brand', async (req, res) => {
            const data = req.body;
            const brands = await brandCollection.insertMany(data)
            res.send(brands)
        })



        const productCollection = client.db('productDB').collection('product')

        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        app.patch('/product/:id', async (req, res) => {
            const newProduct = req.body;
            const id = req.params.id;
            console.log(newProduct);
            const filter = { _id: new ObjectId(id) };
            const update = { $set: newProduct };
            const options = { upsert: false };

            const result = await productCollection.updateOne(
                filter,
                update,
                options
            );
            res.send(result);
        })

        app.get('/product/single/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.get('/product/:brandname', async (req, res) => {
            const name = req.params.brandname;
            //  console.log("id",id);
            const query = { bname: name }
            // console.log("query",query);
            const result = await productCollection.find(query).toArray()
            // console.log(result);
            res.send(result)
        })



        const addedProductCollection = client.db('productDB').collection('addedProduct')

        app.get('/addedProduct', async (req, res) => {
            const cursor = addedProductCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/addedProduct', async (req, res) => {
            const newProduct = req.body;
            const isExists = await addedProductCollection.findOne(newProduct);
            if (isExists) {
                return res.json("Product already exists in the cart")
            }

            const result = await addedProductCollection.insertOne(newProduct);
            res.send(result);
        })

        app.delete('/addedProduct/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: id };
            const data = await addedProductCollection.deleteOne(filter);
            res.send(data)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server in running on port: ${port}`);
})