require("dotenv").config();
const csv = require("csv-parser");
const reader = require("xlsx");

// const { Telegraf } = require("telegraf");
const { Composer } = require('micro-bot')
const bot = new Composer()
// const bot = new Telegraf(process.env.BOT_TOKEN);

const DailyRecord = require("./model/daily-record");
const DailyAttendanceStatus = require("./model/daily-attendance-status");
const fs = require("fs");
const { stringIsEqual, isValidMongoObject,isValidMongoObjectId } = require("./helpers");
const mongoose = require("mongoose");
const dbHost = process.env.HOST || "localhost";
const dbName = process.env.DATABASE_NAME || "attendance_bot";
mongoose
  .connect(`${process.env.DATABASE_NAME_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((error) => {
    console.log("Database connection failed. exiting now....");
    console.error(error);
    process.exit(1);
  });

// Reading our test file

bot.start((ctx) => {
  ctx.reply("The bot Has started");
});
bot.help((ctx) => {
  ctx.reply(
    "This both can perform the following commands \n - /start \n - /help  \n /start_attendance \n /end_attendance"
  );
});
bot.command("/start_attendance", async (ctx) => {
  const { message } = ctx;
  const chatId = message.chat.id || "";
  const chatTitle = message.chat.title || "";
  const createdOn = new Date();
  const day = new Date(message.date * 1000).toDateString();

  const foundDailyAttendance = await DailyAttendanceStatus.findOne({
    status: 1,
    value: 1,
    chatId,
    createdDate: day,
  });
  if (isValidMongoObject(foundDailyAttendance)) {
    ctx.reply("Attendance already started \nDate:" + day);
  } else {
    const newDayAttendance = await new DailyAttendanceStatus({
      status: 1, //0:inactive,1:active
      value: 1, //0:inactive,1:active
      createdDate: day,
      chatId,
      chatTitle,
      createdOn,
    });
    newDayAttendance.save();

    ctx.reply("Attendance started \nDate:" + day);
  }
});

bot.command("/end_attendance", async (ctx) => {
  const { message } = ctx;
  const chatId = message.chat.id || "";
  const chatTitle = message.chat.title || "";
  const createdOn = new Date();
  const day = new Date(message.date * 1000).toDateString();

  const foundDailyAttendance = await DailyAttendanceStatus.findOne({
    status: 1,
    createdDate: day,
    chatId
  });
  const attendendanceId = !!foundDailyAttendance && foundDailyAttendance._id || ""

  if (!isValidMongoObjectId(attendendanceId) || !isValidMongoObject(foundDailyAttendance)) {
    ctx.reply("Attendance already ended \nDate:" + day);
  } else {
     const foundAttendance = await DailyRecord.find({
      createdDate: day,
      chatId,
      attendendanceId
    });

    let reducedFoundAttendance = foundAttendance.reduce((sum, student) => {
      sum.push({
        Username: student.username,
        Firstname: student.firstname,
        Lastname: student.lastname,
        Date: student.createdDate,
        Status: student.value,
       " clock in": !!student.inTime && student.inTime || "",
       " clock out": !!student.outTime && student.outTime || "",
      });
      return sum;
    }, []);
    try {
      const updateAttendance = await DailyAttendanceStatus.updateOne(
        {
          status: 1, //0:inactive,1:active
          value: 1, //0:inactive,1:active
          createdDate: day,
          chatId
        },
        {
          $set: { status: 0, value: 0, expiredOn: createdOn },
        }
      );
    } catch (err) {
      console.log(err);
    }

   
    const workSheet = reader.utils.json_to_sheet(reducedFoundAttendance);

    const workBook = reader.utils.book_new();

    reader.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
    reader.writeFile(workBook, "temp/data.xlsx");

    var readStream = fs.createReadStream("temp/data.xlsx");
    ctx.replyWithDocument({ source: readStream, filename: "temp/data.xlsx" });
    ctx.reply("Attendance ended \nDate:" + day);
  }
});

bot.on("message", async (ctx) => {
  const { message } = ctx;
  const text = message.text || "";
  const trimmedText = text.replace(/ /g, "").toLowerCase();
  text.split();

  if (stringIsEqual(trimmedText, "clockin")) {
    
    const chatId = message.chat.id || "";
    const chatTitle = message.chat.title || "";
    const createdOn = new Date();
    const day = new Date(message.date * 1000).toDateString();
    const inTime = new Date(message.date * 1000).toLocaleTimeString().toString();

    const foundAttendanceStatus = await DailyAttendanceStatus.findOne({
      chatId,
      status: 1, //0:inactive,1:active
      value: 1, //0:inactive,1:active
      createdDate: day,
    });
    const attendendanceId = !!foundAttendanceStatus && foundAttendanceStatus._id || ""

  
    if (!isValidMongoObjectId(attendendanceId) || !isValidMongoObject(foundAttendanceStatus)) {
      ctx.reply("Attendance not active \nDate:" + day);
    } else {
      if (!message.from.is_bot) {
        const firstname = message.from.first_name || "";
        const username = message.from.username || "";
        const lastname = message.from.last_name || "";
        const studentId = message.from.id || "";
        const foundDailyRecord = await DailyRecord.findOne({
          studentId,
          chatId,
          createdDate: day,
          value: 0,
          attendendanceId
        });
        if (isValidMongoObject(foundDailyRecord)) {
         return  ctx.telegram.sendMessage(chatId,"You already clockin")
          
        }
        const newDailyRecord = await new DailyRecord({
          status: 1, //0:inactive,1:active
          studentId,
          username,
          firstname,
          chatId,
          chatTitle,
          lastname,
          inTime,
          value: 0,
          createdDate: day,
          createdOn,
          attendendanceId
        });
        newDailyRecord.save();
      }
    }
  }

  if (stringIsEqual(trimmedText, "clockout")) {
    
    const chatId = message.chat.id || "";
    const chatTitle = message.chat.title || "";
    const createdOn = new Date();
    const day = new Date(message.date * 1000).toDateString();
    const outTime = new Date(message.date * 1000).toLocaleTimeString().toString();

    const foundAttendanceStatus = await DailyAttendanceStatus.findOne({
      chatId,
      status: 1, //0:inactive,1:active
      value: 1, //0:inactive,1:active
      createdDate: day,
    });
    const attendendanceId =!!foundAttendanceStatus && foundAttendanceStatus._id || ""


    if (!isValidMongoObjectId(attendendanceId) || !isValidMongoObject(foundAttendanceStatus)) {
      ctx.reply("Attendance not active \nDate:" + day);
    } else {
      if (!message.from.is_bot) {
        const studentId = message.from.id || "";
        const foundDailyRecord = await DailyRecord.findOne({
          chatId,
          studentId,
          createdDate: day,
          value: 0,
        });
        if (!isValidMongoObject(foundDailyRecord)) {
          ctx.reply("You didn't clockin");
        }
        try {
          const updateAttendance = await DailyRecord.updateOne(
            {
              status: 1, //0:inactive,1:active
              studentId,
              value: 0,
              createdDate: day,
              attendendanceId
            },
            {
              $set: { status: "0", value: 1, expiredOn: createdOn,outTime },
            }
          );
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
});

// bot.launch();
module.exports = bot


// serene-waters-85317
// https://serene-waters-85317.herokuapp.com/