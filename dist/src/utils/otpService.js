"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpSender = void 0;
const OtpSender = (phonenumber, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`http://indiasmstalks.in/api/mt/SendSMS?user=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&senderid=${process.env.SMS_SENDERID}&channel=Trans&DCS=0&flashsms=0&number=${phonenumber}&text=Dear ${otp} is your verification code.For your security,do not share this code -INTAKS THINK COMMUNICATION SERVICES&route=15&DLTTemplateId=1707175929910548838`, {
            method: "GET",
        })
            .then((res) => {
            return res.json();
        })
            .catch((err) => err);
        return { status: true, data: response };
    }
    catch (err) {
        return { status: false, data: err };
    }
});
exports.OtpSender = OtpSender;
