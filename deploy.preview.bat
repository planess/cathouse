@echo Deploying to Vercel Preview Environment
@REM disable console output
@echo off

@REM rename .env file temporarily
ren .env .env.temp
ren .env.local .env.local.temp

@REM run deploy command
call npm run vercel deploy -- --debug

@REM rename .env files back to original
ren .env.temp .env
ren .env.local.temp .env.local

@echo Deployment to Vercel Preview Environment completed
