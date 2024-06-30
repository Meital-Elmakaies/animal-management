const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
let db;
const multer = require("multer");
const sanitizeHTML = require("sanitize-html");
const upload = multer();
const sharp = require("sharp");
const fse = require("fs-extra");
const path = require("path");
const React = require("react");
const reactDOMServer = require("react-dom/server");
//the default make it easy with the syntax
const AnimalCard = require("./src/components/AnimalCard").default;

//when the app first launches, make sure the public/uploaded-photos exists
//this create the folder uploaded-photos in public (the path is for windows to make sure it create it right)
fse.ensureDirSync(path.join("public", "uploaded-photos"));

//run the app
const app = express();
//make a pages html that i can res.render info to the html page & show this ejs page to the user.
app.set("view engine", "ejs");
app.set("views", "./views");

//will reload the maim.js in public when it start the app
app.use(express.static("public"));

//you can read json- like req.body(from the browser to the server)and can easily acss to the data
app.use(express.json());
//it allow you to read files that send to the server (like html) and to pull data from it
app.use(express.urlencoded({ extended: false }));

//this function is used by express to check user and password if it corret then it can do the next function - to render another page
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Our MERN App'");
  if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
    next();
  } else {
    console.log(req.headers.authorization);

    res.status(401).send("Try Again");
  }
}

// "/" define the home page route
app.get("/", async (req, res) => {
  // find the animals in db and return as mongodb format
  //and to array will be understood for us
  // await - for waiting to get all the data in the db
  const allAnimals = await db.collection("animals").find().toArray();
  //this will render to an html file at "home.ejs" with ejs

  const generatedHTML = reactDOMServer.renderToString(
    React.createElement(
      "div",
      { className: "container" },
      !allAnimals.length &&
        React.createElement(
          "p",
          null,
          "There are no animals yet, The admin needs to add a few."
        ),
      React.createElement(
        "div",
        { className: "animal-grid mb-3" },
        allAnimals.map((animal) =>
          React.createElement(AnimalCard, {
            key: animal._id,
            name: animal.name,
            species: animal.species,
            photo: animal.photo,
            id: animal._id,
            readOnly: true,
          })
        )
      ),
      React.createElement(
        "p",
        null,
        React.createElement(
          "a",
          { href: "/admin" },
          "Login / manage animal listing."
        )
      )
    )
  );
  res.render("home", { generatedHTML });
});

app.post(
  "/create-animal",
  upload.single("photo"),
  ourCleanup,
  async (req, res) => {
    //take the photo by useing muler pacage that takes care of it - upload.single(photo)
    if (req.file) {
      //give a uniq name from the data time (by milsec)
      const photofilename = `${Date.now()}.jpg`;
      //give it a new resize (wild,tall) with small&good qulity of 60 and put it in the file uploaded-photos that in the public with the name we create - photofilename (saves in hard drive)
      await sharp(req.file.buffer)
        .resize(884, 456)
        .jpeg({ quality: 60 })
        .toFile(path.join("public", "uploaded-photos", photofilename));
      //now after we resize the photo and saved it in the file we will save it it in the data by using the object cleanData.photo with the photoofilename (that saving after in the db - animal)
      req.cleanData.photo = photofilename;
    }

    console.log(req.body);
    //insert the req of animal and we clean the data with cleanData , info will contine the _id
    const info = await db.collection("animals").insertOne(req.cleanData);
    //we will find all the data info and save it in new object that called newAnimal with the info (that contine _id)
    const newAnimal = await db
      .collection("animals")
      .findOne({ _id: new ObjectId(info.insertId) });
    res.send(newAnimal);
  }
);

function ourCleanup(req, res, next) {
  if (typeof req.body.name != "string") req.body.name = "";
  if (typeof req.body.species != "string") req.body.species = "";
  if (typeof req.body._id != "string") req.body._id = "";

  //will clean the data from extra speace - begin and end (trim) and from html tags (allowTags, allowAttribues- any elmants thats from html)
  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    species: sanitizeHTML(req.body.species.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
  };
  next();
}

app.delete("/animal/:id", async (req, res) => {
  //check the params.id (id that transfer from the animalcard - the /:id in the route represnt the props.id in animal card ) is a string if not make it as empty string
  if (typeof req.params.id != "string") req.params.id = "";
  //find the animal by id, and make a new object of it to doc
  const doc = await db
    .collection("animals")
    .findOne({ _id: new ObjectId(req.params.id) });
  // if there is a photo to the animal we need to delete it from the file uploaded-photos and then from the db for good
  if (doc.photo) {
    fse.remove(path.join("public", "uploaded-photos", doc.photo));
  }
  //delete from the db
  db.collection("animals").deleteOne({ _id: new ObjectId(req.params.id) });
  res.send("deleted !!");
});

app.post(
  "/update-animal",
  upload.single("photo"),
  ourCleanup,
  async (req, res) => {
    //if there is a new photo
    if (req.file) {
      //create a name for the folder uploaded-photos and insert the photo there after resize it
      const photofilename = `${Date.now()}.jpg`;
      await sharp(req.file.buffer)
        .resize(884, 456)
        .jpeg({ quality: 60 })
        .toFile(path.join("public", "uploaded-photos", photofilename));
      //take the photo and insert to the clean data first and then to data
      req.cleanData.photo = photofilename;
      const info = await db
        .collection("animals")
        .findOneAndUpdate(
          { _id: new ObjectId(req.body._id) },
          { $set: req.cleanData }
        );
      //info hold the prev data - so now we will delete the photo before if is exsit
      if (info.value.photo) {
        fse.remove(path.join("public", "uploaded-photos", info.value.photo));
      }
      res.send(photofilename);
    } else {
      //if there is no photo to uploaded - we will just uploaded the info - which is probblay the same and no need to wait (name and species probbly will not change)
      db.collection("animals").findOneAndUpdate(
        { _id: new ObjectId(req.body._id) },
        { $set: req.cleanData }
      );
      //didnt uploaded nothing so there is not what to return the other data is probbley the same
      res.send(false);
    }
  }
);

//this will check for all the functions below the password ! and then will render the page if the password is corret
app.use(passwordProtected);

// this app will send by json the data to the router /api/animals ->
//the axios lebiry will take the json with the data inside and show to the client with the compons App
app.get("/api/animals", async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray();
  res.json(allAnimals);
});

// "/admin" define the home page route
app.get("/admin", (req, res) => {
  res.render("admin");
});

async function start() {
  //conect to the client db
  const client = new MongoClient(
    "mongodb://localhost:27017/AmazingMernApp?&authSource=admin"
  );
  await client.connect();
  db = client.db();
  //listen to port 3000
  app.listen(3000);
}

//will conect the db and to port 3000
start();
