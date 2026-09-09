curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"benjamincyril2005@gmail.com","password":"testpassword123"}' \
  -c login-cookies.txt
