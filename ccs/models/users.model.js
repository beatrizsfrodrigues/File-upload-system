module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      email: String,
      username: String,
      name: String,
      password: String,
    },
    { timestamps: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};
