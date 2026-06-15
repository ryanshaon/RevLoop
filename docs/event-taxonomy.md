# RevLoop — Event Taxonomy

This document defines every event name used in the system, its meaning, which funnel stage it belongs to, and how it is used in analytics calculations.

---

## Funnel Stages

```
Visitor → Signup → Activation → Retention → Revenue
```

| Stage | Definition |
|---|---|
| Visitor | Any browser session, anonymous or identified |
| Signup | User creates an account |
| Activation | User reaches the "aha moment" (event registered or onboarding complete) |
| Retention | User returns to the product in a later session after signup week |
| Revenue | User completes a payment |

---

## Event Definitions

### `page_viewed`
- **What it means:** A page in the product was loaded by a visitor or user.
- **Funnel stage:** Visitor
- **Actor:** Anonymous visitor or signed-up user
- **Key properties:** `page`, `channel`, `device`
- **Used for:** Session depth analysis, landing page performance, traffic source mapping

---

### `signup_started`
- **What it means:** The user clicked into the signup flow (e.g., "Create account" CTA).
- **Funnel stage:** Visitor → Signup
- **Actor:** Anonymous visitor (user_id not yet assigned)
- **Key properties:** `channel`
- **Used for:** Top-of-funnel conversion rate (visitors who intent to sign up)

---

### `signup_completed`
- **What it means:** The user successfully created an account.
- **Funnel stage:** Signup
- **Actor:** Newly created user (first event with `user_id`; retains `anonymous_id` for identity stitching)
- **Key properties:** `channel`, `device`
- **Used for:** Signup conversion rate, channel attribution, new user counts

---

### `onboarding_completed`
- **What it means:** The user finished the onboarding checklist or wizard.
- **Funnel stage:** Activation
- **Actor:** Signed-up user
- **Key properties:** none (completion is binary)
- **Used for:** Activation rate calculation, onboarding funnel analysis

---

### `event_viewed`
- **What it means:** The user opened the detail page for a campus event.
- **Funnel stage:** Activation / Retention
- **Actor:** Signed-up user
- **Key properties:** `event_id`
- **Used for:** Engagement depth, content popularity ranking

---

### `event_registered`
- **What it means:** The user RSVPed or registered for a campus event.
- **Funnel stage:** Activation
- **Actor:** Signed-up user
- **Key properties:** `event_id`
- **Used for:** Core activation signal; users who register for ≥1 event are considered activated

---

### `search_performed`
- **What it means:** The user submitted a search query.
- **Funnel stage:** Activation / Retention
- **Actor:** Signed-up user
- **Key properties:** `query`
- **Used for:** Feature engagement depth, intent signals for personalization

---

### `invite_sent`
- **What it means:** The user sent an invite to a friend or contact.
- **Funnel stage:** Activation / Retention
- **Actor:** Signed-up user
- **Key properties:** `invites_sent` (count in the batch)
- **Used for:** Virality coefficient (K-factor), referral program measurement

---

### `user_returned`
- **What it means:** A signed-up user opened the product in a later calendar week than their signup.
- **Funnel stage:** Retention
- **Actor:** Signed-up user
- **Key properties:** `days_since_signup`
- **Used for:** D7 / D14 / D30 retention cohort calculations; weekly active user counts

---

### `payment_started`
- **What it means:** The user opened the payment or upgrade flow.
- **Funnel stage:** Revenue
- **Actor:** Signed-up user
- **Key properties:** `plan`
- **Used for:** Checkout funnel analysis, payment abandonment rate

---

### `payment_completed`
- **What it means:** The user's payment was successfully processed.
- **Funnel stage:** Revenue
- **Actor:** Signed-up user
- **Key properties:** `plan`, `amount`
- **Used for:** MRR calculations, paid conversion rate, channel revenue attribution

---

### `inactive_14_days`
- **What it means:** A system-generated event fired exactly 14 days after a user's latest tracked activity, when that timestamp falls inside the demo window.
- **Funnel stage:** Churn signal
- **Actor:** System (not user-initiated)
- **Key properties:** none
- **Used for:** Churn model training label, re-engagement trigger, inactive cohort segmentation

---

## Analytics Mapping

| Calculation | Events Used |
|---|---|
| Signup conversion rate | `signup_started` → `signup_completed` |
| Activation rate | `signup_completed` → `onboarding_completed` OR `event_registered` |
| Weekly retention | `signup_completed` + `user_returned` in a later calendar week |
| D7 retention | `signup_completed` + any identified activity 7 or more days later |
| D30 retention | `signup_completed` + any identified activity 30 or more days later |
| Churn label (ML) | `inactive_14_days` present; no `user_returned` after it |
| Paid conversion rate | `signup_completed` → `payment_completed` |
| Payment abandonment | `payment_started` without subsequent `payment_completed` |
| Virality (K-factor) | `invite_sent.invites_sent` × signup conversion rate |
| Channel attribution | `signup_completed.channel` joined to all downstream events for that user |
