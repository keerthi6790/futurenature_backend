"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSixDigitOtp = void 0;
const GenerateSixDigitOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
exports.GenerateSixDigitOtp = GenerateSixDigitOtp;
