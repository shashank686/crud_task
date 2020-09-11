import express from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import cors from "cors";
import tasks from "./dbTask.js";
import moment from "moment";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;
var mTime = moment();
var increment = 0;
app.use("/assets", express.static("assets"));
app.set("view engine", "ejs");

// Connection to mongoDb Cloud

const connection_url = process.env.MY_CONN_URL;
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
  } else if (t === "d") {
    currentTime = time.slice(0, -1);
    expireTime = Number(currentTime) * 1440;
  } else {
    expireTime = -1;
  }

  return expireTime;
};

//* * * * * * means it will run every second

cron.schedule("* * * * * *", function () {
  console.log("---------------------");
  console.log("Schedular running...");
  deleteExpiredTask();
});

// alternate way we can use setInterval see the below commented code

// setInterval(deleteExpiredTask, 1000);

// API routes

app.get("/form", (req, res) => {
  res.render("index");
});

app.get("/tasks", (req, res) => {
  tasks.find({}, "-_id -__v", (err, data) => {
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
  if (durationInMinutes === -1) {
    res.json({
      Error:
        "For Time field use (m) for minutes, (h) for hours , (d) for days sorry for inconvenience",
    });
    return;
  }
  const reqBody = req.body;

  const expireTime = {
    expired: moment(startdate).add(durationInMinutes, "m").toDate(),
  };

  const dbTaskInfo = Object.assign(reqBody, expireTime);
  tasks.create(dbTaskInfo, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const {
        taskname,
        taskdescription,
        creator,
        duration,
        createdAt,
        expired,
      } = data;
      const response = {
        taskname: taskname,
        taskdescription: taskdescription,
        creator: creator,
        duration: duration,
        createdAt: createdAt,
        expired: expired,
      };
      res.status(201).send(response);
    }
  });
});

app.listen(port, () => {
  console.log(`listening from ${port}`);
});
