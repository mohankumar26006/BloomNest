Audit Mode: STRICT READ-ONLY
Source Code Changes: 0
Prisma Changes: 0
Database Writes: 0

# BLOOMNEST — FINAL SECURITY & TENANT ISOLATION CONTRACT

## EXECUTIVE OVERVIEW

This document specifies the **Mandatory Security & Tenant Isolation Contract** for BloomNest. 

It defines the strict authentication, authorization, tenant isolation, and AI security boundaries required before Prisma database migrations are executed.

---

## 1. IMPLEMENTATION SEPARATION DEFINITION

To ensure complete transparency during audit:
* **`CONTRACT DEFINED`**: `PASS`. The security architecture, token model, tenant isolation rules, and middleware contracts are 100% specified and verified.
* **`CODE ENFORCED`**: `WARNING`. In the current development `server.ts`, API endpoints have fallback in-memory auth for preview mode. During Phase 1 implementation, `requireAuth` JWT middleware WILL be wired to all `/api/*` routes to enforce 100% server-side tenant isolation.

---

## 2. AUTHENTICATION & TRUSTED USER IDENTITY

### 2.1 Authentication Mechanism
* **Token Format**: Standard JSON Web Token (JWT) signed with `JWT_SECRET` environment variable.
* **Token Transport**: 
  - `Authorization: Bearer <token>` HTTP Header.
  - HTTP-Only `SameSite=Strict` Cookie (`bloomnest_session`).
* **Session Lifecycle**: 7-day token expiration; silent refresh via `/api/auth/refresh`.

### 2.2 Trusted `req.user.id` Source
* **Middleware Enforcement**: `requireAuth` middleware MUST run on ALL `/api/*` routes (except `/api/health`, `/api/auth/signup`, `/api/auth/signin`, `/api/auth/forgot-password`).
* **Identity Injection**: `requireAuth` decodes and verifies the JWT signature and attaches the verified payload to `req.user = { id: string, email: string, role: string }`.
* **Rejection of Client Overrides**:
  > **CRITICAL RULE**: The backend MUST NEVER accept or trust `userId` from `req.body.userId`, `req.query.userId`, or `req.params.userId`. Any client-supplied `userId` in request payloads MUST be ignored and overridden with `req.user.id`.

```typescript
// MANDATORY BACKEND SECURITY PATTERN
app.post("/api/vitals", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user.id; // STRICTLY FROM JWT MIDDLEWARE - NEVER FROM REQ.BODY
  
  const vitalLog = await prisma.healthVitalLog.create({
    data: {
      ...req.body,
      userId // GUARANTEED TENANT ISOLATION
    }
  });
  res.json({ success: true, vitalLog });
});
```

---

## 3. ENDPOINT SECURITY CONTRACT MATRIX

| Endpoint Route | HTTP Method | Auth Required | Trusted User ID Source | Ownership Filter | Authorization Enforcement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | No | System | N/A | Creates new `User` & `JourneyProfile` with bcrypt hash |
| `/api/auth/signin` | `POST` | No | System | N/A | Validates bcrypt hash; returns JWT token & user payload |
| `/api/state` | `GET` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Rejects unauthenticated requests (401) |
| `/api/state` | `POST` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Ignores body `userId`; updates `req.user.id` state |
| `/api/vitals` | `POST` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Saves vital reading strictly under `req.user.id` |
| `/api/agent/ask` | `POST` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Passes `req.user.id` into `AgentContext` |
| `/api/agent/care-plan` | `GET` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Returns care plan generated for `req.user.id` |
| `/api/agent/doctor-brief`| `GET` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Generates doctor brief filtered by `req.user.id` |
| `/api/scan/extract` | `POST` | **YES** | `req.user.id` | `where: { userId: req.user.id }` | Saves report metadata under `req.user.id` |
| `/api/scan/report/:id` | `GET` | **YES** | `req.user.id` | `where: { id, userId: req.user.id }` | Verifies `report.userId === req.user.id` before file stream |

---

## 4. AI SWARM & MATERNAL MEMORY SECURITY BOUNDARIES

### 4.1 AI Tool Execution Authorization
* All tools executed by `runAgentOrchestrator` (`get_vitals_history`, `get_medical_reports`, `save_agent_memory`, `get_kick_history`) receive `context: AgentContext` where `context.userId` is explicitly set to `req.user.id`.
* Tools CANNOT accept arbitrary target `userId` parameters from Gemini function calling output.

### 4.2 Agent Memory Authorization
* `AgentMemory` queries execute strictly with `where: { userId: req.user.id }`.
* Memory creation (`MaternalMemoryService.saveMemory`) validates ownership of the target user profile.

### 4.3 Agent Run Audit Logging Authorization
* `AgentRun` logs record `userId: req.user.id`. Anonymous guest agent runs are disallowable for clinical tracking features.

---

## 5. MEDICAL REPORT FILE AUTHORIZATION

* **File Storage**: Uploaded PDF lab reports & scan images are assigned a unique non-guessable storage path (`/uploads/med_<uuid>.<ext>`).
* **Access Control**: Static directory file browsing is DISABLED. All medical files must be retrieved via authenticated endpoint `/api/scan/report/:id` which performs:
  1. Token verification (`requireAuth`).
  2. Database lookup: `const report = await prisma.medicalReportAttachment.findUnique({ where: { id: req.params.id } })`.
  3. Ownership check: `if (report.userId !== req.user.id) return res.status(403).json({ error: "Access Denied" })`.

---

## 6. SECURITY READINESS CLASSIFICATION

> **SECURITY CONTRACT STATUS**: **`PASS (CONTRACT DEFINED)`**
> **SECURITY CODE STATUS**: **`WARNING (MIDDLEWARE PENDING PHASE 1 IMPLEMENTATION)`**
> 
> *The security contract is 100% specified and mandatory for execution. All API routes will be gated by JWT `requireAuth` middleware during Phase 1 code implementation.*

---
FINAL VERDICT: GO (Security Contract Defined & Enforceable)
