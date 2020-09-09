import mongoose from "mongoose";
import moment from "moment";
var now = moment();
const taskSchema = mongoose.Schema({
  taskname: String,
  taskdescription: String,
  creator: String,
  duration: String,
  createdAt: { type: Date, default: now.toDate() },
  expired: { type: Date },
});
// taskSchema.index({ expireAt: 1 }, { expiresAfterSeconds: 0 });
export default mongoose.model("taskinfo", taskSchema);
