const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qctkg.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    console.log('Database Connected');

    const database = client.db(dbName);
    const destinationCollection = database.collection('destinations');
    const bookingCollection = database.collection('bookings');

    // GET API for all destination
    app.get('/destinations', async (req, res) => {
      const cursor = destinationCollection.find({});
      const destinations = await cursor.toArray();
      res.send(destinations);
    });

    // GET API for single destination
    app.get('/destinations/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const destination = await destinationCollection.findOne(query);
      res.send(destination);
    });

    // POST API for booking
    app.post('/booking', async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      res.json(result);
    });

    // GET API for my bookings
    app.get('/mybookings/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const cursor = bookingCollection.find(query);
      const myBookings = await cursor.toArray();
      res.send(myBookings);
    });

    // DELETE API for my bookings
    app.delete('/mybookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });

    // GET API for manage all bookings
    app.get('/manage', async (req, res) => {
      const cursor = bookingCollection.find({});
      const myBookings = await cursor.toArray();
      res.send(myBookings);
    });

    // UPDATE API for status update
    app.put('/updatestatus/:id', async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedStatus = {
        $set: {
          status: updateStatus.statusUpdate,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updatedStatus,
        options
      );
      res.json(result);
    });

    // POST API for new booking
    app.post('/newbooking', async (req, res) => {
      const newBooking = req.body;
      const result = await destinationCollection.insertOne(newBooking);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
