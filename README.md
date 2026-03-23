# Synz Key System

A REST API for managing license keys with HWID (hardware ID) binding, built with Express.js and SQLite.

## Features

- **Key Generation** — Create license keys with custom expiration periods
- **HWID Binding** — Keys lock to a device on first use
- **Key Validation** — Verify keys with automatic HWID enforcement
- **Admin Authentication** — All management endpoints are protected
- **Key Management** — Extend, delete, reset HWID, and list keys
- **Dashboard Stats** — Total, active, expired, and redeemed key counts

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=3000
JWT_SECRET=your_secret_here
```

### 3. Run migrations

```bash
node database/migrate.js
```

### 4. Create an admin user

```bash
node addAdmin.js <username> <password>
```

### 5. Start the server

```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured `PORT`).

## Database Schema

### `keys`

| Column       | Type         | Description                        |
|--------------|--------------|------------------------------------|
| id           | INTEGER    | Primary key                        |
| key          | TEXT       | Unique license key (`SYNZ-...`)    |
| hwid         | TEXT       | Bound hardware ID (null if unbound)|
| created_at   | TEXT       | When the key was created           |
| expires_at   | TEXT       | When the key expires               |
| redeemed_at  | TEXT       | When the key was first used        |
| note         | TEXT         | Admin label/note for the key       |

### `admins`

| Column        | Type         | Description              |
|---------------|--------------|--------------------------|
| id            | INTEGER    | Primary key              |
| username      | TEXT       | Unique admin username     |
| password_hash | TEXT       | SHA-256 hashed password  |
| created_at    | TEXT       | When the admin was created|

## API Reference

Base URL: `/api/v1`

### Authentication

**Admin endpoints** require these headers:

| Header         | Description        |
|----------------|--------------------|
| `x-admin-user` | Admin username     |
| `x-admin-pass` | Admin password     |

**User endpoints** require these headers:

| Header     | Description                          |
|------------|--------------------------------------|
| `x-api-key`| The license key (`SYNZ-...`)        |
| `x-hwid`   | Hardware ID (required on first use) |

---

### Admin Endpoints

#### Generate Key

```
POST /api/v1/genKey
```

**Body:**
```json
{
    "name": "customer-name",
    "expires_in": 30
}
```

| Field      | Type   | Description                         |
|------------|--------|-------------------------------------|
| name       | string | Label for the key (unique — regenerates if exists) |
| expires_in | number | Days until expiration               |

**Response:**
```json
{
    "success": true,
    "key": "SYNZ-A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

---

#### List Keys

```
GET /api/v1/listKeys
```

**Query Parameters (all optional):**

| Param  | Values                          | Description            |
|--------|---------------------------------|------------------------|
| status | `active`, `expired`, `redeemed` | Filter by key status   |
| note   | string                          | Search notes (partial) |

**Response:**
```json
{
    "success": true,
    "count": 2,
    "keys": [
        {
            "id": 1,
            "key": "SYNZ-...",
            "hwid": null,
            "note": "customer-name",
            "created_at": "2026-03-22T...",
            "expires_at": "2026-04-21T...",
            "redeemed_at": null
        }
    ]
}
```

---

#### Get Key Details

```
GET /api/v1/getKey?key=SYNZ-...
```

**Response:**
```json
{
    "success": true,
    "key": {
        "id": 1,
        "key": "SYNZ-...",
        "hwid": "device-abc",
        "note": "customer-name",
        "created_at": "2026-03-22T...",
        "expires_at": "2026-04-21T...",
        "redeemed_at": "2026-03-22T...",
        "is_expired": false,
        "is_redeemed": true
    }
}
```

---

#### Extend Key

```
POST /api/v1/extendKey
```

**Body:**
```json
{
    "key": "SYNZ-...",
    "days": 30
}
```

If the key is still active, days are added from the current expiry date. If expired, days are added from now.

**Response:**
```json
{
    "success": true,
    "message": "Key extended successfully.",
    "expires_at": "2026-05-21T..."
}
```

---

#### Delete Key

```
POST /api/v1/delKey
```

**Body:**
```json
{
    "key": "SYNZ-..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Key deleted successfully."
}
```

---

#### Reset / Update HWID

```
POST /api/v1/resetHWID
```

**Body:**
```json
{
    "key": "SYNZ-...",
    "new_hwid": "new-device-456"
}
```

Omit `new_hwid` to clear the HWID entirely (allows re-binding to any device).

**Response:**
```json
{
    "success": true,
    "message": "HWID updated successfully."
}
```

---

#### Stats

```
GET /api/v1/stats
```

**Response:**
```json
{
    "success": true,
    "stats": {
        "total": 10,
        "active": 7,
        "expired": 3,
        "redeemed": 5
    }
}
```

---

### User Endpoints

#### Validate Key

```
POST /api/v1/checkKey
```

Headers: `x-api-key` and `x-hwid`

On first use, the key is bound to the provided HWID. Subsequent requests must use the same HWID.

**Response:**
```json
{
    "success": true,
    "message": "Key is valid."
}
```

## Project Structure

```
synz-key-system/
├── server.js              # Express app & dynamic route loading
├── config.js              # Environment configuration
├── addAdmin.js            # CLI tool to create admin users
├── package.json
├── .env                   # Environment variables (not committed)
├── .env.example           # Template for .env
├── database/
│   ├── index.js           # PostgreSQL connection pool
│   └── migrate.js         # Table creation script
├── middleware/
│   ├── errorHandler.js    # Global error handler
│   ├── validateKey.js     # Key + HWID validation middleware
│   └── validatePerms.js   # Admin auth middleware
└── routes/
    ├── index.js           # Root route
    └── api/
        ├── index.js       # /api route
        └── v1/
            ├── checkKey.js    # Validate a key (user)
            ├── delKey.js      # Delete a key (admin)
            ├── extendKey.js   # Extend key expiry (admin)
            ├── genKey.js      # Generate a key (admin)
            ├── getKey.js      # Get key details (admin)
            ├── listKeys.js    # List all keys (admin)
            ├── resetHWID.js   # Reset/update HWID (admin)
            └── stats.js       # Key statistics (admin)
```

## License

ISC
