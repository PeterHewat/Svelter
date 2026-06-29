---
title: "Getting started"
description: "Clone the template, install dependencies, and run the product and marketing apps locally."
order: 1
---

Welcome to the template. This guide walks through a local setup with Bun.

## Prerequisites

- [Bun](https://bun.sh) installed
- A [Convex](https://convex.dev) account (for the product app backend)
- A [Clerk](https://clerk.com) application (for authentication)

## Install

From the repo root:

```bash
bun install
bun run setup
```

`setup` links Convex, installs agent skills, and runs codegen when a deployment is available.

## Run locally

```bash
bun run dev:convex    # convex backend required by the product app
bun run dev:web       # product app — http://localhost:3000
bun run dev:marketing # marketing site — http://localhost:3001
```

Sign up through the product app to verify Clerk and Convex are wired correctly.

## Next steps

- Read **Configuration** in the sidebar for environment variables
- See **Deployment** for production builds
