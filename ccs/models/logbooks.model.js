module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      user: mongoose.Schema.Types.ObjectId,
      logInDate: Number,
      logInHour: Number,
      logOutDate: Number,
      logOutHour: Number,
      actions: Array,
    },
    { timestamps: false }
  );
  const File = mongoose.model("files", schema);
  return File;
};
