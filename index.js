const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4tbjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const trandingProductCollection = client.db('bookStore').collection('trandingProduct');
        const myItemCollection = clint.db('bookStore').collection('myItem');


        app.get('/trandingProduct', async (req, res) => {
            const query = {};
            const cursor = trandingProductCollection.find(query);
            const trandingProducts = await cursor.toArray();
            res.send(trandingProducts);
        });

        app.get('/trandingProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const trandingProduct = await trandingProductCollection.findOne(query);
            res.send(trandingProduct);
        });

        // POST
        app.post('/trandingProduct', async (req, res) => {
            const newTrandingProduct = req.body;
            const result = await trandingProductCollection.insertOne(newTrandingProduct);
            res.send(result);
        });

        // Delete
        app.delete('/trandingProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await trandingProductCollection.deleteOne(query);
            res.send(result);
        });

        // MyItem Collection Api
        app.post('/myItem', async (req, res) => {
            const myItem = req.body;
            const result = await myItemCollection.insertOne(myItem);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Book Server');
});

app.listen(port, () => {
    console.log('Listening To port', port);
})