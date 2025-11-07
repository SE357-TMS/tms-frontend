# Test API connection and CORS
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TMS Frontend - API Debug Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check backend is running
Write-Host "[1] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -ErrorAction SilentlyContinue
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running at port 8081" -ForegroundColor Red
    Write-Host "   Please start backend first!" -ForegroundColor Red
    exit 1
}

# 2. Test login endpoint
Write-Host ""
Write-Host "[2] Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "   Token: $($response.token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "   RefreshToken: $($response.refreshToken.Substring(0, 50))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed - No token in response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "   → Check credentials: admin/admin123" -ForegroundColor Yellow
        Write-Host "   → Check user exists in database" -ForegroundColor Yellow
    }
}

# 3. Check .env file
Write-Host ""
Write-Host "[3] Checking .env configuration..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^VITE_") {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ .env file NOT found!" -ForegroundColor Red
    Write-Host "   Please create .env from .env.example" -ForegroundColor Yellow
}

# 4. CORS warning
Write-Host ""
Write-Host "[4] CORS Configuration Check" -ForegroundColor Yellow
Write-Host "   ⚠️  Make sure backend has CORS config for:" -ForegroundColor Yellow
Write-Host "      - http://localhost:3000" -ForegroundColor Cyan
Write-Host "      - http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Add to backend WebConfig.java:" -ForegroundColor Gray
Write-Host "   @Configuration" -ForegroundColor DarkGray
Write-Host "   public class WebConfig implements WebMvcConfigurer {" -ForegroundColor DarkGray
Write-Host "       @Override" -ForegroundColor DarkGray
Write-Host "       public void addCorsMappings(CorsRegistry registry) {" -ForegroundColor DarkGray
Write-Host "           registry.addMapping(`"/**`")" -ForegroundColor DarkGray
Write-Host "                   .allowedOrigins(`"http://localhost:3000`", `"http://localhost:5173`")" -ForegroundColor DarkGray
Write-Host "                   .allowedMethods(`"*`")" -ForegroundColor DarkGray
Write-Host "                   .allowedHeaders(`"*`")" -ForegroundColor DarkGray
Write-Host "                   .allowCredentials(true);" -ForegroundColor DarkGray
Write-Host "       }" -ForegroundColor DarkGray
Write-Host "   }" -ForegroundColor DarkGray

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools Console" -ForegroundColor White
Write-Host "3. Look for [Auto-login] logs" -ForegroundColor White
Write-Host "4. If CORS error → Add CORS config to backend" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan
