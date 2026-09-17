# Project Requirements & Features (Instagram Assistant)

## Project Goal
To build a comprehensive marketing automation and sales platform for Instagram (similar to the Befroosh platform) designed to automatically manage interactions, increase followers, generate leads, and finalize orders 24/7.

## Target Audience
- Instagram Stores (E-commerce)
- Instructors and Course Providers
- Real Estate Consultants, Doctors, and Clinics
- Service Providers

## Core Features

### 1. Smart Comment Management (Comment Automation)
- Detect comments containing specific keywords (e.g., "price", "available").
- Post randomized responses (Spinning) in the comments to avoid being flagged as spam.
- Automatically send a direct message (DM) to the commenter simultaneously.

### 2. Smart Direct Messages & Chatbot (Smart DM)
- Send various types of messages: text, images, quick reply buttons, and carousels.
- Manage decision trees and conditional conversations via a Finite State Machine (FSM).
- Support for Story Mentions and Story Replies.

### 3. Follow Gate (Mandatory Follow)
- Check the user's follow status before providing services (e.g., sending a download link or catalog).
- Interactive capability to re-verify the status once the user claims to have followed.

### 4. In-Direct Storefront
- Display product carousels complete with images, prices, and "buy" buttons without requiring the user to leave the Instagram app.

### 5. Smart Form Builder (Lead Generation)
- Collect user information step-by-step (Name, Phone Number, Address, Postal Code).
- Validate mobile number formats and other data inputs.

### 6. Automated Order Registration & Checkout (In-Chat Checkout)
- Calculate the final price and issue invoices directly in the DM.
- Generate one-time payment links connected to local Iranian payment gateways (e.g., Zarinpal).
- Automatically confirm the order after a successful callback from the payment gateway.

### 7. Follow-up & Abandoned Cart Recovery
- Identify users who have abandoned the checkout process or a form halfway.
- Send automated follow-up messages (e.g., after 2 hours) while strictly adhering to Meta's 24-hour messaging window policy.

## Non-Functional Requirements
- **Scalability:** Handle thousands of concurrent webhook requests when a post goes viral.
- **Security:** Connect to Instagram using OAuth 2.0 without requiring the user's password. Securely store access tokens.
- **Meta Compliance:** Strictly adhere to Meta's API rate limits and the 24-hour messaging rule.
- **Reliability:** Utilize a Message Queue to guarantee the processing of all incoming events from Meta webhooks without data loss.
- **Localization & UI:** The entire platform UI (dashboard and website) must be in Persian (Farsi) with full Right-to-Left (RTL) support.
