const express = require("express");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
    usedNewUrlParser: true,
    useFindAndModify: false
});

app.use(require("./routes/api.js"));

app.listen(PORT, ()=>{
    console.log(`app is running on port ${PORT}`)
});