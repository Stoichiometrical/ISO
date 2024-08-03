'use server'

import { redirect } from 'next/navigation'
// import nodemailer from "nodemailer";
// import {render} from "@react-email/render";
// import {PromotionalEmail} from "@/react-email-starter/email";

export async function navigateToReports() {
    redirect('/reports')
}

export async function navigateToProject() {
    redirect('/project')
}

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     auth: {
//         user: 'infinitimetrics@gmail.com',
//         pass: 'bcegxksrdffqcfxl',
//     },
// });
//
//
// export async function sendEmail() {
//     const emailHtml = render(<PromotionalEmail />);
//
//     const options = {
//         from: 'infinitimetrics@gmail.com',  // Sender's email
//         to: 'davidtgondo@gmail.com',    // Recipient's email
//         subject: 'BIG PROMOTIONS THIS SEASON!!!!',
//         html: emailHtml,
//     };
//
//     try {
//         await transporter.sendMail(options);
//         console.log('Email sent successfully!');
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }