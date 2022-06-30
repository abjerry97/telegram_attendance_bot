const mongoose = require("mongoose");
const defaultString = {
  type: String,
  default: "",
};
const defaultDate = {
  type: Date,
  default: new Date(),
};
const studentDetailsSchemaObject = {
  status: defaultString, //0:inactive,1:active
  username: defaultString,
  firstname: defaultString,
  lastname: defaultString,
  value: defaultString,
  createdBy: defaultString, // user ID of the user who created this entry
  createdOn: defaultDate,
};
const StudentDetailsSchema = new mongoose.Schema(studentDetailsSchemaObject);

StudentDetailsSchema.statics.getSchemaObject = () => studentDetailsSchemaObject;
const StudentDetails = mongoose.model("StudentDetails", StudentDetailsSchema);

module.exports = StudentDetails;
