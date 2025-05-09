#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Counter for missing files
MISSING_FILES=0

# Function to check if a file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
  else
    echo -e "${RED}✗${NC} $1 is missing"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
}

# Function to check if any of multiple files exists
check_file_options() {
  if [ -f "$1" ] || [ -f "$2" ]; then
    if [ -f "$1" ]; then
      echo -e "${GREEN}✓${NC} $1 exists"
    else
      echo -e "${GREEN}✓${NC} $2 exists"
    fi
  else
    echo -e "${RED}✗${NC} Neither $1 nor $2 exists"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
}

# Function to check if a directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 directory exists"
  else
    echo -e "${RED}✗${NC} $1 directory is missing"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
}

# Start checking files
echo -e "${YELLOW}Checking for required project files...${NC}"
echo

echo -e "${YELLOW}Root files:${NC}"
check_file_options "docker-compose.yaml" "docker-compose.yaml"
check_file ".env.example"
check_file ".gitignore"
check_file "README.md"
echo

echo -e "${YELLOW}GitHub CI/CD files:${NC}"
check_dir ".github"
check_dir ".github/workflows"
check_file ".github/workflows/ci.yaml"
check_file ".github/workflows/security.yaml"
check_file ".github/PULL_REQUEST_TEMPLATE.md"
echo

echo -e "${YELLOW}Frontend directories:${NC}"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/public"
echo

echo -e "${YELLOW}Frontend files:${NC}"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/Dockerfile.dev"
check_file "frontend/Dockerfile"
check_file "frontend/nginx.conf"
check_file "frontend/src/index.tsx"
check_file "frontend/src/App.tsx"
check_file "frontend/src/App.css"
check_file "frontend/src/index.css"
check_file "frontend/src/reportWebVitals.ts"
check_file "frontend/public/index.html"
check_file "frontend/public/manifest.json"
echo

echo -e "${YELLOW}Backend directories:${NC}"
check_dir "backend"
check_dir "backend/src"
check_dir "backend/src/models"
check_dir "backend/src/config"
check_dir "backend/src/types"
check_dir "backend/src/services"
check_dir "backend/src/middleware"
check_dir "backend/src/controllers"
check_dir "backend/src/routes"
check_dir "backend/src/utils"
echo

echo -e "${YELLOW}Backend files:${NC}"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/Dockerfile.dev"
check_file "backend/Dockerfile"
check_file "backend/src/index.ts"
check_file "backend/src/config/database.ts"
check_file "backend/src/config/logger.ts"
check_file "backend/src/config.ts"
echo

echo -e "${YELLOW}Backend model types:${NC}"
check_file "backend/src/types/models.ts"
echo

echo -e "${YELLOW}Backend models:${NC}"
check_file "backend/src/models/index.ts"
check_file "backend/src/models/User.ts"
check_file "backend/src/models/Design.ts"
check_file "backend/src/models/Material.ts"
check_file "backend/src/models/Institution.ts"
check_file "backend/src/models/Classroom.ts"
check_file "backend/src/models/Product.ts"
check_file "backend/src/models/Order.ts"
echo

echo -e "${YELLOW}Backend Auth Components:${NC}"
check_file "backend/src/services/auth.service.ts"
check_file "backend/src/middleware/auth.middleware.ts"
check_file "backend/src/controllers/auth.controller.ts"
check_file "backend/src/routes/auth.routes.ts"
check_file "backend/src/utils/logger.ts"
echo

echo -e "${YELLOW}Backend Design Components:${NC}"
check_file "backend/src/services/design.service.ts"
check_file "backend/src/controllers/design.controller.ts"
check_file "backend/src/routes/design.routes.ts"
echo

echo -e "${YELLOW}Checking for obsolete files:${NC}"
if [ -f "backend/src/index.js" ]; then
  echo -e "${RED}✗${NC} backend/src/index.js should be removed (replaced by index.ts)"
  MISSING_FILES=$((MISSING_FILES + 1))
else
  echo -e "${GREEN}✓${NC} No obsolete backend/src/index.js file"
fi

if [ -f "frontend/src/index.js" ]; then
  echo -e "${RED}✗${NC} frontend/src/index.js should be removed (replaced by index.tsx)"
  MISSING_FILES=$((MISSING_FILES + 1))
else
  echo -e "${GREEN}✓${NC} No obsolete frontend/src/index.js file"
fi

if [ -f "frontend/src/App.js" ]; then
  echo -e "${RED}✗${NC} frontend/src/App.js should be removed (replaced by App.tsx)"
  MISSING_FILES=$((MISSING_FILES + 1))
else
  echo -e "${GREEN}✓${NC} No obsolete frontend/src/App.js file"
fi

if [ -f "frontend/src/reportWebVitals.js" ]; then
  echo -e "${RED}✗${NC} frontend/src/reportWebVitals.js should be removed (replaced by reportWebVitals.ts)"
  MISSING_FILES=$((MISSING_FILES + 1))
else
  echo -e "${GREEN}✓${NC} No obsolete frontend/src/reportWebVitals.js file"
fi
echo

# Summary
if [ $MISSING_FILES -eq 0 ]; then
  echo -e "${GREEN}All required files are present. Your project structure is correctly set up!${NC}"
else
  echo -e "${RED}$MISSING_FILES issues found in your project structure.${NC}"
  echo -e "Please address these issues before proceeding."
fi