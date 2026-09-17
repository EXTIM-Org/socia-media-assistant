# Platform Technical Architecture (System Architecture)

## 1. Tech Stack

### Backend
- **Framework:** Node.js (NestJS). Chosen for its robust architecture, excellent TypeScript support, and ease of managing microservices and message queues.
- **Primary Database:** PostgreSQL (for storing users, stores, products, orders, and transactional data).
- **ORM:** Prisma or TypeORM (to be decided during setup).
- **Cache & State Database:** Redis (for managing chatbot state/FSM, caching, and serving as the message broker backend).
- **Message Broker:** BullMQ (running on Redis) to handle incoming high-volume webhook events asynchronously.

### Frontend (User Dashboard)
- **Framework:** Next.js (React).
- **Styling:** Tailwind CSS (for building a modern, responsive user interface).
- **State Management:** Zustand or React Context/Hooks.

### Infrastructure
- **Dual Server Architecture (Proxy / Relay Setup):**
  - **External Server (e.g., Hetzner/AWS):** Hosted outside of Iran to receive Meta webhooks with zero latency and bypass local filtering restrictions on the Instagram API.
  - **Internal Server (Iran):** Hosted locally to communicate with Iranian payment gateways (Shaparak) and local SMS providers which often restrict non-Iranian IPs.
  - (Communication between the two will be established via secure tunnels or distributed APIs).

## 2. Webhook Data Flow & Processing

The platform's core is designed around an Event-Driven architecture to handle massive scale.

```mermaid
flowchart TD
    IG((Instagram)) -->|HTTP POST Webhook| API_Gateway[API Gateway / Webhook Receiver]
    API_Gateway -->|Validate Signature (SHA256)| Validator{Valid?}
    Validator -- Yes --> Queue[(Message Queue - BullMQ)]
    Validator -- No --> Drop[Drop Request]
    Queue --> Worker[Worker Node / FSM Engine]
    
    Worker --> State_DB[(Redis State DB)]
    Worker --> Main_DB[(PostgreSQL DB)]
    
    Worker --> Meta_API[Meta Graph API]
    Meta_API -->|Send DM / Reply Comment| IG
    
    Worker --> IPG[Iranian Payment Gateway]
    Worker --> SMS[SMS Provider]
```

## 3. Finite State Machine (FSM) Engine

To track which step of a scenario a user is currently in (e.g., waiting for a phone number or awaiting payment):
- The user's unique Instagram Scoped ID (`IGSID`) is used as the key.
- A state object is stored in the Redis database, representing the user's current step (e.g., `AWAITING_PHONE_NUMBER`).
- Subsequent incoming messages are processed contextually based on this state, allowing conditional scenarios and forms to function correctly.

## 4. Meta OAuth Authentication Flow
1. The page admin logs into the Next.js dashboard.
2. They click the "Connect to Instagram" button, redirecting them to the Facebook Login for Business page.
3. Required permissions (Scopes) such as `instagram_manage_messages` and `instagram_manage_comments` are granted.
4. The backend server exchanges the temporary short-lived token for a 60-day long-lived token and securely stores it in the database.

## 5. Follow Check Mechanism
- During an interaction, the system uses the Page Access Token to query the relationship/follower status endpoint on the Meta Graph API.
- If the user is not following the page, the flow halts, and a message requesting them to follow is sent instead of the requested content.
