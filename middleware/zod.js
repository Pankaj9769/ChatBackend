const { z } = require("zod");

const registerUserSchema = z.object({
  email: z.string().email({ message: "Enter Valid Email Id" }),
  name: z.string({ message: "Enter your Name" }),
  password: z
    .string()
    .min(8)
    .refine(
      (value) => {
        const hasUpperCase = /[A-Z]/.test(value);

        const hasLowerCase = /[a-z]/.test(value);

        const hasNumeric = /[0-9]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumeric;
      },
      {
        message:
          "Password must have at least one uppercase letter, one lowercase letter, and one numeric character",
      }
    ),
});

module.exports = { registerUserSchema };
