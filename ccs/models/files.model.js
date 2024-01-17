module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: String,
      path: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        allowNull: false,
        required: true,
      },
      dateAdded: String,
      dateLastEdited: String,
    },
    { timestamps: false }
  );
  const File = mongoose.model("files", schema);
  return File;
};
//hello?