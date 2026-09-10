curl -X POST http://localhost:3000/api/admin/winners \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d '{"campaignId":"cmtuow9oq000279j0i6ra9ntb","userId":"cmtroshr100008yiirh4mkica","rewardDescription":"100 USDC","adminNotes":"First winner selected"}'
