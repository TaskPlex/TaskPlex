# Contributing to TaskPlex

Thank you for your interest in contributing to TaskPlex! 🎉

This document provides guidelines and instructions for contributing to the project. Please read it carefully before submitting issues or pull requests.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](.github/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites

- **Git** installed
- **Python 3.11+** (for backend)
- **Node.js 20+** (for frontend)
- **Rust & Cargo** (for Tauri desktop app)
- **Docker** (optional, for web mode)

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TaskPlex.git
   cd TaskPlex
   ```

3. **Set up the backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   ```

5. **Set up pre-commit hooks** (optional but recommended):
   ```bash
   # Install pre-commit
   pip install pre-commit
   pre-commit install
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

**Backend:**
```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

**Frontend:**
```bash
cd frontend
npm run test
npm run lint
npm run build  # Ensure build succeeds
```

### 4. Commit Your Changes

Use clear, descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: Add WebP support for image conversion"
```

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(video): Add support for HEVC codec
fix(pdf): Handle corrupted PDF files gracefully
docs: Update installation instructions
test(image): Add unit tests for compression
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub using the [PR template](.github/pull_request_template.md).

## 📝 Coding Standards

### Python (Backend)

- Follow **PEP 8** style guidelines
- Use **type hints** for all function signatures
- Write **docstrings** for all functions, classes, and modules
- Maximum line length: **100 characters**
- Use **Black** for formatting (configured)
- Use **Ruff** for linting (configured)
- Use **isort** for import sorting (configured)

**Example:**
```python
def compress_image(
    input_path: Path,
    output_path: Path,
    quality: str = "medium"
) -> ImageProcessingResponse:
    """
    Compress an image with the specified quality.
    
    Args:
        input_path: Path to the input image file
        output_path: Path to save the compressed image
        quality: Quality preset ('low', 'medium', 'high')
        
    Returns:
        ImageProcessingResponse with compression results
        
    Raises:
        ValueError: If quality is invalid
        FileNotFoundError: If input file doesn't exist
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

- Follow **TypeScript** best practices
- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Use **ESLint** and **Prettier** (configured)
- Maximum line length: **100 characters**
- Use **meaningful variable names**

**Example:**
```typescript
interface VideoCompressProps {
  file: File;
  quality: 'low' | 'medium' | 'high';
  onComplete: (result: VideoProcessingResponse) => void;
}

export const VideoCompress: React.FC<VideoCompressProps> = ({
  file,
  quality,
  onComplete,
}) => {
  // Implementation
};
```

### General

- **Keep functions small and focused** (single responsibility)
- **Avoid deep nesting** (max 3-4 levels)
- **Use meaningful names** for variables and functions
- **Comment complex logic**, not obvious code
- **Remove dead code** and unused imports

## 🧪 Testing Guidelines

### Backend Tests

- Write **unit tests** for all new features
- Aim for **>70% code coverage**
- Test both **success and failure** cases
- Use **pytest fixtures** for common setup
- Mock external dependencies (file system, APIs)

**Example:**
```python
def test_image_compression_success(tmp_path: Path):
    """Test that image compression works correctly."""
    input_file = tmp_path / "test.jpg"
    output_file = tmp_path / "compressed.jpg"
    
    # Create test image
    create_test_image(input_file)
    
    # Compress
    result = compress_image(input_file, output_file, quality="medium")
    
    # Assertions
    assert result.success is True
    assert output_file.exists()
    assert output_file.stat().st_size < input_file.stat().st_size
```

### Frontend Tests

- Write **component tests** using Vitest and React Testing Library
- Test **user interactions** and **rendering**
- Mock **API calls** and **external dependencies**
- Test **error states** and **loading states**

**Example:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { VideoScreen } from './VideoScreen';

describe('VideoScreen', () => {
  it('should render upload button', () => {
    render(<VideoScreen />);
    expect(screen.getByText('Upload Video')).toBeInTheDocument();
  });
  
  it('should handle file upload', async () => {
    // Test implementation
  });
});
```

## 🔍 Pull Request Process

1. **Fill out the PR template** completely
2. **Ensure all tests pass** (CI will check)
3. **Ensure code coverage** is maintained or improved
4. **Update documentation** if needed
5. **Link related issues** in the PR description
6. **Request review** from maintainers
7. **Address review comments** promptly

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] No new warnings generated
- [ ] Breaking changes documented (if applicable)

## 🐛 Issue Reporting

Use the appropriate [issue template](.github/ISSUE_TEMPLATE/):

- **Bug Report** - For bugs and unexpected behavior
- **Feature Request** - For new features or enhancements
- **Question** - For questions and help

**Before creating an issue:**
- Search existing issues to avoid duplicates
- Check documentation and README
- Provide all relevant information

## 📚 Documentation

### Code Documentation

- **Docstrings** for all public functions/classes
- **Type hints** for better IDE support
- **Comments** for complex algorithms
- **README updates** for new features

### API Documentation

- Update **API examples** in README
- Document **new endpoints** in backend README
- Add **usage examples** for complex features

## 🏗️ Architecture Guidelines

### Backend Structure

```
backend/
├── app/
│   ├── api/          # FastAPI route handlers
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── utils/        # Utilities
└── tests/            # Test files
```

**When adding features:**
1. Define **models** (request/response schemas)
2. Implement **services** (business logic)
3. Create **API routes** (endpoints)
4. Add **tests** (all layers)

### Frontend Structure

```
frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── services/    # API services
│   └── utils/        # Utilities
└── tests/            # Test files
```

## 🎯 Getting Help

- **Documentation**: Check README and docs
- **Discussions**: Use GitHub Discussions
- **Issues**: Search existing issues
- **Questions**: Use the question template

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (if created)
- Credited in release notes
- Acknowledged in security advisories (for security reports)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to TaskPlex!** 🚀

For questions or concerns, please open an issue or start a discussion.

