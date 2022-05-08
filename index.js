const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4tbjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        // console.log('db connscted');
        const trandingProductCollection = client.db('bookStore').collection('trandingProduct');
        const myItemCollection = client.db('bookStore').collection('myItem');


        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })



        // TrandingProduct Api
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

        app.get('/myItem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = myItemCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

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