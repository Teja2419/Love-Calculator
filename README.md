# Love Calculator (full stack)

## Run locally
1. In the project folder:
   npm install
2. Set server secret and start:
   # linux/mac
   export SERVER_SECRET="replace_with_secret"
   npm start
   # windows powershell
   $env:SERVER_SECRET="replace_with_secret"; npm start

3. Open:
   - http://localhost:3000/index.html (user)
   - http://localhost:3000/admin.html (admin)

## Notes
- Server stores only hashed identifiers when users opt-in.
- Use HTTPS and a strong SERVER_SECRET in production.