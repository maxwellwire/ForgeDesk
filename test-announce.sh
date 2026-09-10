curl -X POST http://localhost:3000/api/admin/winners/announce \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d '{"winnerIds":["cmtuse777000j11qauhi8ls5k"]}'
