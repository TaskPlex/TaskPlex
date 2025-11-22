# Security Policy

## 🔒 Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## 🚨 Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability, please follow these steps:

### 1. **Report Privately**

Report the vulnerability through one of these channels:

- **GitHub Security Advisories** (Preferred): 
  - Go to [Security Advisories](https://github.com/tangjuyo/TaskPlex/security/advisories/new)
  - Click "Report a vulnerability"
  - Fill out the form with details

- **Email** (if GitHub is not accessible):
  - Contact: [Your email or security contact]
  - Subject: `[SECURITY] TaskPlex Vulnerability Report`

### 2. **What to Include**

Please provide the following information:

- **Type of vulnerability** (e.g., XSS, SQL injection, path traversal)
- **Affected component** (Frontend, Backend, API, etc.)
- **Steps to reproduce** the vulnerability
- **Potential impact** and severity
- **Suggested fix** (if you have one)
- **Proof of concept** (if applicable)

### 3. **Response Timeline**

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - **Critical**: As soon as possible (typically < 7 days)
  - **High**: Within 30 days
  - **Medium/Low**: Next release cycle

### 4. **Disclosure Policy**

- We will acknowledge receipt of your report within 48 hours
- We will keep you informed of the progress
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will coordinate public disclosure after a fix is available

## 🛡️ Security Best Practices

### For Users

- **Keep TaskPlex updated** to the latest version
- **Review file uploads** before processing (especially from untrusted sources)
- **Use strong passwords** if authentication is implemented
- **Run in isolated environments** when processing sensitive files
- **Monitor logs** for suspicious activity

### For Developers

- **Follow secure coding practices**
- **Validate all inputs** (file types, sizes, paths)
- **Sanitize filenames** to prevent path traversal
- **Use parameterized queries** (if database is added)
- **Implement rate limiting** for production deployments
- **Keep dependencies updated** (use Dependabot)
- **Review security advisories** regularly

## 🔍 Security Features

### Current Security Measures

- ✅ **Input validation** on all file uploads
- ✅ **Filename sanitization** to prevent path traversal
- ✅ **File type validation** (MIME type + extension)
- ✅ **File size limits** (configurable)
- ✅ **CORS configuration** for web mode
- ✅ **Dependency scanning** (Dependabot)
- ✅ **Security scanning** in CI/CD pipeline

### Planned Security Enhancements

- [ ] **Authentication/Authorization** for production use
- [ ] **API rate limiting**
- [ ] **Content Security Policy (CSP)** headers
- [ ] **HTTPS enforcement** for web mode
- [ ] **Security headers** (X-Frame-Options, etc.)
- [ ] **Audit logging** for sensitive operations
- [ ] **Encryption at rest** for temporary files

## 📋 Known Security Considerations

### File Processing

- **Large files** can cause DoS (handled with size limits)
- **Malicious files** could exploit processing libraries (validated file types)
- **Temporary files** are cleaned up automatically

### Network

- **CORS** is configured but should be tightened for production
- **No authentication** currently - add for production deployments
- **No rate limiting** - implement for public APIs

### Dependencies

- **Regular updates** via Dependabot
- **Security scanning** in CI/CD pipeline
- **Vulnerability alerts** enabled

## 🏆 Security Acknowledgments

We thank the following security researchers for responsibly disclosing vulnerabilities:

<!-- Add acknowledgments here as vulnerabilities are reported -->

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security](https://react.dev/learn/escape-hatches)

## 📧 Contact

For security-related questions or concerns:

- **GitHub Security Advisories**: [Report here](https://github.com/tangjuyo/TaskPlex/security/advisories/new)
- **Issues**: Use the security issue template (private)

---

**Last Updated**: 2025-01-22

