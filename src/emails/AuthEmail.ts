import { transport } from "../config/nodemailer";

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "CashTracker <admin@cashtracker.com>",
      to: user.email,
      subject: "Confirm your account on CashTracker",
      html: `<p>Hello <strong>${user.name}</strong>, please confirm your account on CashTracker using this token: <strong>${user.token}</strong></p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account</a>
      `,
    });

    // console.log("Message sent", email.messageId);
  };

  static sendPasswordResetToken = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "CashTracker <admin@cashtracker.com>",
      to: user.email,
      subject: "Reset your password on CashTracker",
      html: `<p>Hello <strong>${user.name}</strong>, you have requested to reset your password on CashTracker. Use this token to reset it: <strong>${user.token}</strong></p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
      `,
    });
    // console.log("Message sent", email.messageId);
  };
}
