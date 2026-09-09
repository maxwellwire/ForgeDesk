curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d '{"campaignId":"cmtuow9oq000279j0i6ra9ntb","taskId":"PASTE_YOUR_ACTUAL_TASK_ID_HERE","proofUrl":"https://twitter.com/example/status/123"}'
