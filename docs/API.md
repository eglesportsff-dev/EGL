# API Documentation

Base URL: `/api`

## Authentication

`POST /auth/register`

```json
{ "username": "Player", "email": "player@example.com", "password": "Secret123" }
```

`POST /auth/verify-otp`

```json
{ "email": "player@example.com", "otp": "123456" }
```

`POST /auth/login`

```json
{ "email": "player@example.com", "password": "Secret123" }
```

## Matches

`GET /matches`

Returns active matches only, sorted by match time.

`POST /matches/create`

Roles: `CONTROLLER`, `MASTER_CONTROLLER`, `ADMIN`.

`POST /matches/join`

Deducts entry fee from wallet only. Losses never reduce winning points.

## Wallet

`POST /wallet/deposit`

Amount must be `12` to `2000`. User enters UTR after manual QR payment.

`POST /wallet/withdraw`

User submits UPI ID, UID, and amount. Wallet is deducted only after Master Controller completion.

## Controller

`POST /controller/deposit/approve`

Approves deposit and credits wallet.

`POST /controller/deposit/reject`

Rejects deposit with reason.

`POST /controller/withdraw/verify`

Verifies balance and forwards to Master Controller.

## Master Controller

`POST /master/controllers`

Creates controller account.

`POST /master/withdraw/complete`

Confirms manual payment and deducts wallet.

## Admin

`POST /admin/master-controllers`

Creates Master Controller account.

## Public Data

`GET /leaderboard`

Team-based leaderboard only.

`GET /tournament/{id}/point-table`

Simplified point table: rank, team name, total winning points.

`GET /tournaments/updates`

Recent tournament updates.
