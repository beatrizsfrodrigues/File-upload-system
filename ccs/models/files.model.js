module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        allowNull: false,
        required: true,
      },
      dateAdded: String,
      dateLastEdited: String,
      file: { type: String }
    },
    { timestamps: false }
  );
  const File = mongoose.model("files", schema);
  return File;
};
//hello?