curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d '{"campaignId":"cmtuow9oq000279j0i6ra9ntb","taskId":"cmtuqmeei00017kagy2qslfh5","proofUrl":"https://twitter.com/example/status/123"}'
