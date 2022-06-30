const mongoose = require("mongoose");
const defaultString = {
  type: String,
  default: "",
};
const defaultDate = {
  type: Date,
  default: new Date(),
};
const dailyRecordSchemaObject = {
  status: defaultString, //0:inactive,1:active
  username: defaultString,
  firstname: defaultString,
  lastname: defaultString,
  studentId: defaultString,
  chatId: defaultString,
  chatTitle :defaultString,
  attendendanceId :defaultString,
  inTime:defaultString,
  outTime:defaultString,
  value: defaultString,
  createdDate: defaultString,
  createdOn: defaultDate,
  expiredOn: defaultString
};
const DailyRecordSchema = new mongoose.Schema(dailyRecordSchemaObject);

DailyRecordSchema.statics.getSchemaObject = () => dailyRecordSchemaObject;
const DailyRecord = mongoose.model("DailyRecord", DailyRecordSchema);

module.exports = DailyRecord;
