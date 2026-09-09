#!/bin/bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -b login-cookies.txt \
  -d "{\"code\":\"$1\"}"
