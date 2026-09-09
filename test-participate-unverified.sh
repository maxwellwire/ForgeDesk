curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Unverified","lastName":"User","username":"unverifieduser1","email":"YOUR_REAL_EMAIL+unverified@example.com","password":"testpassword123"}' \
  -c unverified-cookies.txt

curl -X POST http://localhost:3000/api/participations/cmtuow9oq00279j0i6ra9ntb \
  -b unverified-cookies.txt
