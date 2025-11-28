#!/usr/bin/env pwsh

# Test signup
Write-Host "Testing Signup..." -ForegroundColor Cyan
$signupBody = @{
    email = "test@example.com"
    password = "password123"
    username = "testuser"
} | ConvertTo-Json

$signupResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/signup" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $signupBody `
    -UseBasicParsing

$signupData = $signupResponse.Content | ConvertFrom-Json
Write-Host $signupData | ConvertTo-Json -Depth 10 -ForegroundColor Green

$token = $signupData.data.token
$userId = $signupData.data.user.id

Write-Host "`nSignup successful! Token: $token" -ForegroundColor Green

# Test signin with same user
Write-Host "`nTesting Signin..." -ForegroundColor Cyan
$signinBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$signinResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/signin" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $signinBody `
    -UseBasicParsing

$signinData = $signinResponse.Content | ConvertFrom-Json
Write-Host $signinData | ConvertTo-Json -Depth 10 -ForegroundColor Green

Write-Host "`nSignin successful! Token: $($signinData.data.token)" -ForegroundColor Green
