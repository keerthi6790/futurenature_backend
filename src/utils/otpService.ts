export const OtpSender = async (phonenumber: string, otp: number) => {
  try {
    const response = await fetch(
      `http://indiasmstalks.in/api/mt/SendSMS?user=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&senderid=${process.env.SMS_SENDERID}&channel=Trans&DCS=0&flashsms=0&number=${phonenumber}&text=Dear ${otp} is your verification code.For your security,do not share this code -INTAKS THINK COMMUNICATION SERVICES&route=15&DLTTemplateId=1707175929910548838`,
      {
        method: "GET",
      },
    )
      .then((res) => {
        return res.json();
      })
      .catch((err) => err);

    return { status: true, data: response };
  } catch (err) {
    return { status: false, data: err };
  }
};
