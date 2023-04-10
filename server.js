const {MongoClient} = require('mongodb');

async function main() {
    const uri ="mongodb+srv://tttuan19:tuan2001@cluster0.tnr23f5.mongodb.net/?retryWrites=true&w=majority"; 
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        console.log("databases:");
        await client.connect();
        await listDatabases(client);

        // await createListing(client,
        //     {
        //         name: "Lovely Loft",
        //         summary: "A charming loft in Paris",
        //         bedrooms: 1,
        //         bathrooms: 1
        //     }
        // );
  
        // Create 3 new listings
        // await createMultipleListings(client, [
        //     {
        //         name: "Infinite Views",
        //         summary: "Modern home with infinite views from the infinity pool",
        //         property_type: "House",
        //         bedrooms: 5,
        //         bathrooms: 4.5,
        //         beds: 5
        //     },
        //     {
        //         name: "Private room in London",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1
        //     },
        //     {
        //         name: "Beautiful Beach House",
        //         summary: "Enjoy relaxed beach living in this house with a private beach",
        //         bedrooms: 4,
        //         bathrooms: 2.5,
        //         beds: 7,
        //         last_review: new Date()
        //     }
        // ]);
        
        await findOneListingByPlaneCode(client, "1001");

        await findListingsWithTheBoardingTimeAfter(client, {
            boardingTimeFrom: "2023-04-10T10:00:00.000+00:00",
            maximumNumberOfResults: 5
        });
    }catch(e){
        console.log(e);
    }finally{
        await client.close();
    }
}

async function listDatabases(client){
    const databasesList = await client.db().admin().listDatabases(); 
    console.log("databases  :");
    databasesList.databases.forEach(db => console.log(`- ${db.name}`));
};

async function createListing(client, newListing){
    // write 1 object
    const result = await client.db("Agoda").collection("Flight").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function createMultipleListings(client, newListings){
    const result = await client.db("Agoda").collection("Flight").insertMany(newListings);
    // write nhiều object
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

async function findOneListingByPlaneCode(client, nameOfListing) {
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne for the findOne() docs
    const result = await client.db("Agoda").collection("Flight").findOne({ PlaneCode: nameOfListing });

    if (result) {
        console.log(`Found a listing in the collection with the Plane code '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the Plane code '${nameOfListing}'`);
    }
}

async function findListingsWithTheBoardingTimeAfter(client, {
    boardingTimeFrom = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {


    const cursor = client.db("Agoda").collection("Flight")
        .find({
            BoardingTime: { $gte: new Date(boardingTimeFrom) },
            //bathrooms: { $gte: minimumNumberOfBathrooms }
        }
        )
        .sort({ last_review: -1 })
        .limit(maximumNumberOfResults);

    // Store the results in an array
    const results = await cursor.toArray();

    // Print the results
    if (results.length > 0) {
        console.log(`Found listing(s) with the boarding time from ${boardingTimeFrom} :`);
        results.forEach((result, i) => {
            //const date = new Date(result.last_review).toDateString();

            console.log();
            console.log(`${i + 1}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   boarding Time: ${result.BoardingTime}`);
            console.log(`   Airline: ${result.Airline}`);
            console.log(`   most recent review date: ${date}`);
        });
    } else {
        console.log(`No listings found with the boarding time from ${boardingTimeFrom}`);
    }
}
main().catch(console.err);
