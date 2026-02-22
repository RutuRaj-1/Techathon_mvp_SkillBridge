"""
GitHub Repository Analysis Service using Playwright.
Extracts: tech stack, frameworks, libraries, stars, forks, README length, CI/CD detection.
"""
import re
import json
import asyncio
from datetime import datetime
from typing import Optional, Dict, List, Tuple, Any
from urllib.parse import urlparse
import logging
from app.models.report import RepoAnalysis

# Configure logging
logger = logging.getLogger(__name__)

# Known framework patterns (name → keyword in deps/files)
FRAMEWORK_PATTERNS = {
    "React": ["react", "react-dom", "reactjs"],
    "Vue": ["vue", "@vue/", "vuejs"],
    "Angular": ["@angular/core", "angular"],
    "Next.js": ["next", "nextjs"],
    "Nuxt": ["nuxt", "@nuxt/"],
    "Svelte": ["svelte", "sveltekit"],
    "Express": ["express", "expressjs"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Spring Boot": ["spring-boot", "springboot", "spring framework"],
    "Rails": ["rails", "ruby on rails"],
    "Laravel": ["laravel"],
    "TailwindCSS": ["tailwindcss", "tailwind"],
    "Bootstrap": ["bootstrap"],
    "Vite": ["vite"],
    "Webpack": ["webpack"],
    "Electron": ["electron"],
    "React Native": ["react-native", "reactnative"],
    "PyTorch": ["torch", "pytorch"],
    "TensorFlow": ["tensorflow", "tf"],
    "Sklearn": ["scikit-learn", "sklearn"],
    "Jest": ["jest"],
    "Mocha": ["mocha"],
    "Cypress": ["cypress"],
}

FEATURE_PATTERNS = {
    "Authentication": ["auth", "passport", "jwt", "oauth", "firebase-auth", "authentication", "login", "signup"],
    "Database Integration": ["mongoose", "sequelize", "prisma", "sqlalchemy", "typeorm", "pymongo", "postgresql", "mysql", "mongodb", "redis"],
    "REST API": ["express", "fastapi", "flask", "axios", "fetch", "rest", "endpoint"],
    "GraphQL": ["graphql", "apollo", "gql"],
    "WebSockets": ["socket.io", "ws", "websocket", "socketio"],
    "Docker": ["dockerfile", "docker-compose", "docker", "container"],
    "Testing": ["jest", "pytest", "mocha", "vitest", "unittest", "test", "spec"],
    "CI/CD": [".github/workflows", ".travis.yml", "circle.ci", "gitlab-ci", "jenkins", "azure-pipelines"],
    "TypeScript": ["typescript", "tsconfig", ".ts", ".tsx"],
    "Machine Learning": ["torch", "tensorflow", "sklearn", "transformers", "keras", "llm", "ai", "ml"],
    "Cloud Services": ["aws", "azure", "gcp", "cloud", "serverless", "lambda"],
    "Microservices": ["microservice", "service mesh", "kubernetes", "k8s"],
    "Monitoring": ["prometheus", "grafana", "datadog", "newrelic", "sentry"],
}

class GitHubAnalysisError(Exception):
    """Custom exception for GitHub analysis errors"""
    pass

class GitHubRepoAnalyzer:
    """Handles GitHub repository analysis with Playwright"""
    
    def __init__(self, headless: bool = True, timeout: int = 30000):
        self.headless = headless
        self.timeout = timeout
        self.playwright = None
        self.browser = None
        
    async def __aenter__(self):
        await self.initialize()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.cleanup()
        
    async def initialize(self):
        """Initialize Playwright and browser"""
        try:
            from playwright.async_api import async_playwright
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=self.headless,
                args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            )
            logger.info("Playwright browser initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Playwright: {repr(e)}", exc_info=True)
            raise GitHubAnalysisError(f"Browser initialization failed: {repr(e)}")
    
    async def cleanup(self):
        """Clean up resources"""
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            logger.info("Playwright resources cleaned up")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
    
    async def analyze_repository(self, repo_url: str) -> RepoAnalysis:
        """Main analysis method"""
        try:
            # Parse repository info
            owner, repo_name = self._parse_owner_repo(repo_url)
            logger.info(f"Analyzing repository: {owner}/{repo_name}")
            
            # Create browser context
            context = await self.browser.new_context(
                viewport={'width': 1280, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                # Navigate to repository
                await page.goto(repo_url, timeout=self.timeout, wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)
                
                # Extract all data concurrently where possible
                analysis_data = await self._extract_all_data(page, owner, repo_name, repo_url)
                
                return self._create_repo_analysis(repo_url, owner, repo_name, analysis_data)
                
            finally:
                await page.close()
                await context.close()
                
        except Exception as e:
            logger.error(f"Error analyzing repository {repo_url}: {str(e)}", exc_info=True)
            raise GitHubAnalysisError(f"Failed to analyze repository: {str(e)}")
    
    async def _extract_all_data(self, page, owner: str, repo_name: str, repo_url: str) -> Dict[str, Any]:
        """Extract all repository data"""
        
        # Define extraction tasks
        extraction_tasks = {
            'basic_info': self._extract_basic_info(page),
            'languages': self._extract_languages(page),
            'readme': self._extract_readme(page),
            'files': self._extract_file_names(page),
            'package_data': self._extract_package_data(owner, repo_name),
        }
        
        # Run tasks concurrently
        results = {}
        for key, coro in extraction_tasks.items():
            try:
                results[key] = await coro
            except Exception as e:
                logger.warning(f"Failed to extract {key}: {str(e)}")
                results[key] = {} if key != 'readme' else {'text': '', 'length': 0}
        
        # Combine all data
        combined_text = self._combine_text_for_detection(results)
        
        # Detect frameworks and features
        frameworks = self._detect_frameworks(combined_text, results.get('package_data', {}))
        features = self._detect_features(combined_text)
        
        return {
            **results['basic_info'],
            'languages': results.get('languages', {}),
            'readme_length': results['readme'].get('length', 0),
            'file_names': results.get('files', []),
            'frameworks': frameworks,
            'features': features,
            'has_tests': self._detect_tests(combined_text, results.get('files', [])),
            'has_ci': self._detect_ci(combined_text, results.get('files', [])),
        }
    
    async def _extract_basic_info(self, page) -> Dict[str, Any]:
        """Extract basic repository information"""
        info = {
            'description': '',
            'stars': 0,
            'forks': 0,
            'primary_language': '',
            'last_updated': datetime.utcnow().isoformat(),
        }
        
        try:
            # Description
            info['description'] = await self._safe_text(page, '[data-testid="repo-description"] p, .f4.my-3')
            
            # Stars
            stars_text = await self._safe_text(page, '#repo-stars-counter, [data-testid="stargazers-count"]')
            info['stars'] = self._parse_number(stars_text)
            
            # Forks
            forks_text = await self._safe_text(page, '#repo-network-counter, [data-testid="forks-count"]')
            info['forks'] = self._parse_number(forks_text)
            
            # Primary language
            info['primary_language'] = await self._safe_text(page, '[data-testid="language-name"], .ml-1.color-fg-default')
            
            # Last updated
            last_updated = await self._safe_text(page, 'relative-time, time-ago')
            if last_updated:
                info['last_updated'] = last_updated
                
        except Exception as e:
            logger.warning(f"Error extracting basic info: {str(e)}")
            
        return info
    
    async def _extract_languages(self, page) -> Dict[str, float]:
        """Extract language breakdown"""
        languages = {}
        
        try:
            # Try different selectors for language stats
            lang_selectors = [
                '[aria-label*="% of files are"] span',
                '.d-inline-flex.flex-items-center.flex-nowrap',
                '.language-color + span',
                '[data-testid="repository-languages-stats"] li'
            ]
            
            for selector in lang_selectors:
                lang_els = await page.query_selector_all(selector)
                if lang_els:
                    for el in lang_els[:10]:
                        text = await el.inner_text()
                        parsed = self._parse_language_line(text)
                        if parsed:
                            lang, pct = parsed
                            languages[lang] = pct
                    break
                    
        except Exception as e:
            logger.warning(f"Error extracting languages: {str(e)}")
            
        return languages
    
    async def _extract_readme(self, page) -> Dict[str, Any]:
        """Extract README content"""
        try:
            readme_text = await self._safe_text(page, '#readme article, .markdown-body, [data-testid="readme"]')
            return {
                'text': readme_text,
                'length': len(readme_text)
            }
        except Exception as e:
            logger.warning(f"Error extracting README: {str(e)}")
            return {'text': '', 'length': 0}
    
    async def _extract_file_names(self, page) -> List[str]:
        """Extract file names from repository"""
        files = []
        
        try:
            file_selectors = [
                '[data-testid="file-name-id-stable"]',
                '.js-navigation-item .content span',
                '[role="rowheader"] a',
                '.react-directory-row-name-cell a'
            ]
            
            for selector in file_selectors:
                file_els = await page.query_selector_all(selector)
                if file_els:
                    for el in file_els[:50]:
                        name = await el.inner_text()
                        if name and not name.startswith('..'):
                            files.append(name.strip())
                    break
                    
        except Exception as e:
            logger.warning(f"Error extracting file names: {str(e)}")
            
        return files
    
    async def _extract_package_data(self, owner: str, repo_name: str) -> Dict[str, Any]:
        """Extract package.json or other dependency files"""
        package_data = {'dependencies': {}, 'libraries': []}
        
        # Try to fetch package.json from main/master branch
        for branch in ['main', 'master']:
            try:
                raw_url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/package.json"
                
                from playwright.async_api import async_playwright
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=True)
                    page = await browser.new_page()
                    
                    await page.goto(raw_url, timeout=5000, wait_until="domcontentloaded")
                    content = await page.content()
                    
                    # Extract JSON from pre tags
                    match = re.search(r'<pre[^>]*>(.*?)</pre>', content, re.DOTALL | re.IGNORECASE)
                    if match:
                        json_text = match.group(1).strip()
                        pkg = json.loads(json_text)
                        
                        deps = {**pkg.get('dependencies', {}), **pkg.get('devDependencies', {})}
                        package_data['dependencies'] = deps
                        package_data['libraries'] = list(deps.keys())[:30]
                        
                    await browser.close()
                    break
                    
            except Exception as e:
                logger.debug(f"Could not fetch package.json from {branch} branch: {str(e)}")
                continue
                
        return package_data
    
    def _combine_text_for_detection(self, results: Dict) -> str:
        """Combine all text content for pattern detection"""
        texts = []
        
        # Add README
        if 'readme' in results:
            texts.append(results['readme'].get('text', ''))
        
        # Add file names
        if 'files' in results:
            texts.append(' '.join(results['files']))
        
        # Add package data
        if 'package_data' in results:
            texts.append(' '.join(results['package_data'].get('libraries', [])))
        
        # Add description
        if 'basic_info' in results:
            texts.append(results['basic_info'].get('description', ''))
        
        return ' '.join(texts).lower()
    
    def _detect_frameworks(self, text: str, package_data: Dict) -> List[str]:
        """Detect frameworks from text and dependencies"""
        frameworks = set()
        
        # Check dependencies first (more accurate)
        deps = package_data.get('dependencies', {})
        all_deps = ' '.join(list(deps.keys()) + list(deps.values())).lower()
        
        for framework, keywords in FRAMEWORK_PATTERNS.items():
            if any(kw in all_deps for kw in keywords):
                frameworks.add(framework)
            elif any(kw in text for kw in keywords):
                frameworks.add(framework)
        
        return sorted(list(frameworks))[:15]
    
    def _detect_features(self, text: str) -> List[str]:
        """Detect features from text"""
        features = set()
        
        for feature, keywords in FEATURE_PATTERNS.items():
            if any(kw in text for kw in keywords):
                features.add(feature)
        
        return sorted(list(features))[:15]
    
    def _detect_tests(self, text: str, files: List[str]) -> bool:
        """Detect if repository has tests"""
        test_patterns = [
            '.test.', 'spec.', 'pytest', '__test__', 'testing',
            'jest', 'mocha', 'vitest', 'unittest', 'test/',
            'tests/', 'spec/'
        ]
        
        if any(pattern in text for pattern in test_patterns):
            return True
            
        if any(any(pattern in file.lower() for pattern in test_patterns) for file in files):
            return True
            
        return False
    
    def _detect_ci(self, text: str, files: List[str]) -> bool:
        """Detect CI/CD configuration"""
        ci_patterns = [
            '.github/workflows', '.travis', 'circle', 'gitlab-ci',
            'jenkins', 'azure-pipelines', 'build.yml', 'ci.yml'
        ]
        
        if any(pattern in text for pattern in ci_patterns):
            return True
            
        if any(any(pattern in file.lower() for pattern in ci_patterns) for file in files):
            return True
            
        return False
    
    def _parse_language_line(self, line: str) -> Optional[Tuple[str, float]]:
        """Parse a language line to extract name and percentage"""
        try:
            line = line.strip()
            parts = line.split()
            
            if len(parts) >= 2:
                # Try to extract percentage from the last part
                last_part = parts[-1]
                if '%' in last_part:
                    pct = float(last_part.replace('%', '').replace(',', '.'))
                    lang = ' '.join(parts[:-1])
                    return lang.strip(), pct
                    
        except (ValueError, IndexError) as e:
            logger.debug(f"Error parsing language line '{line}': {str(e)}")
            
        return None
    
    def _parse_owner_repo(self, url: str) -> Tuple[str, str]:
        """Parse owner and repository name from GitHub URL"""
        # Remove trailing slash and split
        parts = url.rstrip('/').split('/')
        
        if len(parts) >= 5 and 'github.com' in parts:
            owner = parts[-2]
            repo = parts[-1]
            
            # Remove .git extension if present
            if repo.endswith('.git'):
                repo = repo[:-4]
                
            return owner, repo
            
        raise GitHubAnalysisError(f"Invalid GitHub URL: {url}")
    
    def _parse_number(self, text: str) -> int:
        """Parse numbers with K/M suffixes and commas"""
        if not text:
            return 0
            
        # Remove commas
        text = text.replace(',', '')
        
        # Handle K/M suffixes
        if text.endswith('k') or text.endswith('K'):
            try:
                return int(float(text[:-1]) * 1000)
            except ValueError:
                pass
        elif text.endswith('m') or text.endswith('M'):
            try:
                return int(float(text[:-1]) * 1000000)
            except ValueError:
                pass
        
        # Try regular integer conversion
        try:
            return int(float(text))
        except (ValueError, TypeError):
            return 0
    
    async def _safe_text(self, page, selector: str) -> str:
        """Safely extract text from element"""
        try:
            el = await page.query_selector(selector)
            if el:
                return (await el.inner_text()).strip()
        except Exception as e:
            logger.debug(f"Error extracting text with selector '{selector}': {str(e)}")
        return ""
    
    def _calculate_repo_strength(self, stars: int, forks: int, readme_len: int, 
                                has_tests: bool, has_ci: bool, framework_count: int) -> int:
        """Calculate repository strength score (0-100)"""
        score = 0
        
        # Stars (max 25) - based on 0-10k stars scale
        star_score = min(25, int((stars / 400) * 25))
        score += star_score
        
        # Forks (max 15) - based on 0-2k forks scale
        fork_score = min(15, int((forks / 133) * 15))
        score += fork_score
        
        # README quality (max 25) - based on length
        readme_score = min(25, int((readme_len / 800) * 25))
        score += readme_score
        
        # Tests (15 pts)
        score += 15 if has_tests else 0
        
        # CI/CD (10 pts)
        score += 10 if has_ci else 0
        
        # Frameworks (max 10) - diversity bonus
        framework_score = min(10, framework_count * 2)
        score += framework_score
        
        return min(100, score)
    
    def _create_repo_analysis(self, repo_url: str, owner: str, repo_name: str, 
                              data: Dict[str, Any]) -> RepoAnalysis:
        """Create RepoAnalysis object from extracted data"""
        
        # Ensure languages dict is populated with at least primary language
        languages = data.get('languages', {})
        primary_lang = data.get('primary_language', 'Unknown')
        
        if not languages and primary_lang and primary_lang != 'Unknown':
            languages = {primary_lang: 100.0}
        
        # Calculate repository strength
        strength_score = self._calculate_repo_strength(
            stars=data.get('stars', 0),
            forks=data.get('forks', 0),
            readme_len=data.get('readme_length', 0),
            has_tests=data.get('has_tests', False),
            has_ci=data.get('has_ci', False),
            framework_count=len(data.get('frameworks', []))
        )
        
        return RepoAnalysis(
            repoUrl=repo_url,
            owner=owner,
            repoName=repo_name,
            description=data.get('description', 'No description provided'),
            stars=data.get('stars', 0),
            forks=data.get('forks', 0),
            language=primary_lang or 'Unknown',
            languages=languages,
            frameworks=data.get('frameworks', [])[:15],
            libraries=data.get('package_data', {}).get('libraries', [])[:30],
            features=data.get('features', [])[:15],
            readmeLength=data.get('readme_length', 0),
            hasTests=data.get('has_tests', False),
            hasCI=data.get('has_ci', False),
            lastUpdated=data.get('last_updated', datetime.utcnow().isoformat()),
            repoStrengthScore=strength_score,
        )

# Convenience function for single repository analysis
async def analyze_repository(repo_url: str) -> RepoAnalysis:
    """Analyze a single GitHub repository"""
    async with GitHubRepoAnalyzer() as analyzer:
        return await analyzer.analyze_repository(repo_url)

# Batch analysis function
async def analyze_repositories(repo_urls: List[str], max_concurrent: int = 3) -> List[RepoAnalysis]:
    """Analyze multiple repositories concurrently"""
    import asyncio
    
    # Run them concurrently
    tasks = [analyze_repository(url) for url in repo_urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out failures
    valid_results = [
        r for r in results 
        if r is not None and not isinstance(r, Exception)
    ]
    
    return valid_results