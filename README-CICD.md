# CI/CD Setup Guide

This project is configured with GitHub Actions for automated deployment.
To make it work, you need to add your Server's SSH Private Key to GitHub Secrets.

## Steps

1.  **Get the Private Key** form your server:
    Run this command on your server:
    ```bash
    cat /root/.ssh/id_ed25519
    ```
    Copy the entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).

2.  **Add to GitHub Secrets**:
    - Go to your Repository on GitHub.
    - Click **Settings** > **Secrets and variables** > **Actions**.
    - Click **New repository secret**.
    - **Name**: `SSH_KEY`
    - **Secret**: Paste the private key you copied.
    - Click **Add secret**.

3.  **Add Other Secrets** (Optional but recommended if not hardcoded):
    - `SSH_HOST`: `167.99.65.133`
    - `SSH_USER`: `root`

## How it works
- When you push to `main` branch, GitHub Actions will trigger.
- It SSHs into your server.
- Runs `/var/www/dlas/scripts/deploy.sh`.
- The script pulls the latest code, installs dependencies, migrates DB, builds Nuxt, and reloads PM2.
