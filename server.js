import express from "express";
import mongoose from "mongoose";
import cron from "node-cron";
// import shell from "shelljs";
import cors from "cors";
import tasks from "./dbTask.js";
import moment from "moment";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;
var mTime = moment();
var increment = 0;

// Connection to mongoDb Cloud

const connection_url =
  "mongodb+srv://admin:h2f9vODlxrbzhUGa@cluster0.hl3ab.mongodb.net/Bdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// function responsible for deletion of expired documents

function deleteExpiredTask() {
  var startTime = moment(mTime.toDate()).add(increment, "seconds").toDate();
  tasks.deleteMany({ expired: { $lte: startTime } }, (err) => {
    if (err) return console.log("Error while erasing users " + err);
    else console.log("Script Running dont't worry your DB is up to date...");
  });
  increment++;
}



// myOwn Time parser

const timeParser = (time) => {
  const t = time[time.length - 1];
  var expireTime, currentTime;

  // m for min,h for hrs,d for days

  if (t === "m") {
    currentTime = time.slice(0, -1);
    expireTime = Number(currentTime);
  } else if (t === "h") {
    currentTime = time.slice(0, -1);
    expireTime = Number(currentTime) * 60;
  } else {
    currentTime = time.slice(0, -1);
    expireTime = Number(currentTime) * 1440;
  }

  return expireTime;
};

// * * * * * * means it will run every second

cron.schedule("* * * * * *", function () {
  console.log("---------------------");
  console.log("Schedular running...");
  deleteExpiredTask();
});

// alternate way we can use setInterval see the below commented code

// setInterval(deleteExpiredTask, 1000);

// API routes

app.get("/tasks", (req, res) => {
  tasks.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/addtasks", (req, res) => {
  var startdate = new Date();
  const durationInMinutes = timeParser(req.body.duration);
  const reqBody = req.body;

  const expireTime = {
    expired: moment(startdate).add(durationInMinutes, "m").toDate(),
  };

  const dbTaskInfo = Object.assign(reqBody, expireTime);

  tasks.create(dbTaskInfo, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`listening from ${port}`);
});
