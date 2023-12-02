module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: String,
      path: String,
      userId: String,
      dateAdded: String,
      dateLastEdited: String,
    },
    { timestamps: false }
  );
  const File = mongoose.model("files", schema);
  return File;
};
