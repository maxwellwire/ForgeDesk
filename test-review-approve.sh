curl -X POST http://localhost:3000/api/admin/submissions/cmturb759000c11qaftbjjp51/review \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d '{"action":"APPROVE","note":"Looks good, proof verified"}'
