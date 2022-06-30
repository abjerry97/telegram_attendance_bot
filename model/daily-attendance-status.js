const mongoose = require("mongoose");
const defaultString = {
  type: String,
  default: "",
};
const defaultDate = {
  type: Date,
  default: new Date(),
};
const dailyAttendanceStatusSchemaObject = {
  status: defaultString, //0:inactive,1:active
  value: defaultString, //0:inactive,1:active
  createdDate: defaultString,
  chatId: defaultString,
  chatTitle :defaultString,
  createdOn: defaultDate,
  expiredOn:defaultDate,
};
const DailyAttendanceStatusSchema = new mongoose.Schema(dailyAttendanceStatusSchemaObject);

DailyAttendanceStatusSchema.statics.getSchemaObject = () => dailyAttendanceStatusSchemaObject;
const DailyAttendanceStatus = mongoose.model("DailyAttendanceStatus", DailyAttendanceStatusSchema);

module.exports = DailyAttendanceStatus;
