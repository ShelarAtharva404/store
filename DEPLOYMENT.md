# Coolify deployment guide

## VPS preparation

Use a fresh supported Linux VPS with SSH access. Coolify recommends at least 2 CPU cores, 2 GB RAM, and 10 GB free disk; allow ports 22, 80, and 443 in the firewall.

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Open `http://YOUR_VPS_IP:8000`, create the first admin account immediately, and securely back up `/data/coolify/source/.env`.

## Git deployment

1. Create a remote repository and push this project. Do not include `backend/.env`.
2. In Coolify, create a Project and Production environment.
3. Add your GitHub, GitLab, or other supported Git provider as a source, then select the repository and branch.
4. Create an Application with the Dockerfile build pack. Coolify will use the root `Dockerfile` automatically.
5. Set **Ports Exposes** to `3000`, **Health Check Path** to `/health`, and enable automatic deployments/webhooks for the production branch.

## Database and secrets

Create a PostgreSQL resource in the same Coolify environment. Paste its full Internal URL into the application's runtime-only `DATABASE_URL` secret (or use the individual `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` values). Generate a long random `JWT_SECRET`. Keep the database private; application containers should use the internal network instead of public port `5432`.

After the first deploy, open the application **Terminal** in Coolify and run this one-time initialization command. It uses the private `DATABASE_URL`; do not rerun it on a database that already contains production data.

```bash
npm run init-db
```
