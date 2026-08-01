# Order Request API Handoff

This document outlines the API endpoints and expected workflows for the Order Request (Quoting & Negotiation) system.

## Overview

The Order Request flow allows a Client to request a quote for a new order. It facilitates a negotiation process between the Client and Admin (counter-offers/proposals) until both parties agree. Finally, the Admin converts the request into an actual `Order`.

### Base Route
`POST /api/requests`

---

## 1. Create Initial Order Request
**Endpoint:** `POST /api/requests`
**Role:** Client
**Description:** The Client submits the initial request with the basic requirements and reference files (e.g., Tech Packs, blueprints).

### Request Payload
```json
{
  "name": "Winter Jacket Collection",
  "type": "JACKET",
  "description": "Need 50 pieces of the winter jacket design.",
  "targetDueDate": "2026-08-01T00:00:00.000Z",
  "originalReferenceFiles": [
    {
      "fileName": "techpack.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "publicId": "techpack_123",
      "resourceType": "auto"
    }
  ]
}
```

### Flow Notes
- **Status Change:** The request is created with `status: "PENDING_ADMIN"`.
- **Notifications:** Admins receive a "New Quote Request" notification.

---

## 2. Add Proposal / Counter-Offer
**Endpoint:** `POST /api/requests/:id/proposals`
**Role:** Admin or Client
**Description:** Either party can submit a proposal/counter-offer. 
- Admins will typically define the `amount`, `departmentSequenceIds`, `qcMemberId`, etc.
- Clients can respond with their own counter-offers (e.g., asking for a different due date or amount).

### Request Payload
```json
{
  "amount": 50000,
  "dueDate": "2026-08-05T00:00:00.000Z",
  "requiredDocs": ["Invoice", "QC Report"],
  "departmentSequenceIds": ["64b8a923..."], 
  "qcMemberId": "64b8a950...", 
  "referenceFiles": [
    {
      "fileName": "updated_techpack.pdf",
      "fileUrl": "https://...",
      "publicId": "updated_123",
      "resourceType": "auto"
    }
  ],
  "remarks": "Added cost for premium fabric."
}
```

### Flow Notes
- **Status Change:** 
  - If Admin proposes, status becomes `"PENDING_CLIENT"`.
  - If Client proposes, status becomes `"PENDING_ADMIN"`.
- **Notifications:** The opposing party receives a notification about the new proposal.

---

## 3. Convert Request to Order
**Endpoint:** `POST /api/requests/:id/convert`
**Role:** Admin (or Moderator)
**Description:** Once both parties agree on a proposal (usually the final one), the Admin triggers the conversion of the `OrderRequest` into an actual `Order`.

### Request Payload
*No request body needed. The conversion uses the data from the final proposal.*
```json
{}
```

### Flow Notes
- **Logic:** 
  - The endpoint takes the **last proposal** in the `proposals` array and uses its details (`amount`, `dueDate`, `departmentSequenceIds`, etc.).
  - It falls back to the `originalReferenceFiles` if no updated `proposedReferenceFiles` were provided in the proposals.
  - It then calls the internal `createOrder` controller function, effectively transferring the negotiated details into a finalized `Order`.
- **Status Change:** The request itself does not get mutated in this endpoint, but the `createOrder` function will create the Order and link it back to the request using `sourceRequestId`. (Note: Make sure to update the request status to `"CONVERTED"` after the order is created if not already handled).

---

## State Machine (Status Flow)

1. **PENDING_ADMIN:** Client just created it, OR Client just counter-offered. Admin needs to act.
2. **PENDING_CLIENT:** Admin just sent a proposal. Client needs to review/counter.
3. **CONVERTED:** Admin finalized the request and created an Order.
4. **CANCELED:** The request was aborted (handled separately).
