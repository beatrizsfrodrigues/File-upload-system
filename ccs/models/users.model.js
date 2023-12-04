module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      email: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      username: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      name: String,
      password: String,
    },
    { timestamps: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};
