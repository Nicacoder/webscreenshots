# Authentication Guide

Webscreenshots supports several authentication methods to handle websites that require login or special access:

---

## Supported Authentication Methods

### 1. Basic Authentication

This method uses HTTP Basic Auth headers to provide a username and password for protected resources.

**Environment Variables Example:**

```env
WEBSCREENSHOTS__AUTHOPTIONS__METHOD=basic
WEBSCREENSHOTS__AUTHOPTIONS__BASIC__USERNAME=admin
WEBSCREENSHOTS__AUTHOPTIONS__BASIC__PASSWORD=your_password
```

---

### 2. Cookie-based Authentication

Use a pre-exported cookies file to authenticate sessions. This is useful when your site relies on cookies to manage user sessions.

**Environment Variables Example:**

```env
WEBSCREENSHOTS__AUTHOPTIONS__METHOD=cookie
WEBSCREENSHOTS__AUTHOPTIONS__COOKIESPATH=./cookies.json
```

**Example `cookies.json` file:**

```json
[
  {
    "name": "AuthCookie",
    "value": "token_value_here",
    "domain": "example.com",
    "path": "/",
    "expires": -1,
    "httpOnly": false,
    "secure": false,
    "sourceScheme": "NonSecure"
  }
]
```

- `expires: -1` means the cookie is a session cookie
- Make sure the cookie domain matches the site domain

---

### 3. Form-based Authentication

Automates login by submitting credentials through a form. Webscreenshots will:

- Navigate to the specified login page URL.
- Fill in the provided input selectors with their corresponding values (e.g., email and password fields).
- Click the submit button selector to submit the form.
- After submission, it will check for:

  - A **success selector**: if found, login is considered successful.
  - An **error selector**: if found, login is considered failed.

- If the page redirects away from the login URL after submission, authentication is assumed successful.
- If none of the above conditions are met within the specified timeout, the login attempt is considered failed.

**Environment Variables Example:**

```env
WEBSCREENSHOTS__AUTHOPTIONS__METHOD=form
WEBSCREENSHOTS__AUTHOPTIONS__FORM__LOGINURL=https://example.com/login
WEBSCREENSHOTS__AUTHOPTIONS__FORM__INPUTS={"input[name=email]":"user@example.com","input[name=password]":"password123"}
WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUBMIT=button[type=submit]
WEBSCREENSHOTS__AUTHOPTIONS__FORM__ERRORSELECTOR=.login-error
WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUCCESSSELECTOR=.dashboard
WEBSCREENSHOTS__AUTHOPTIONS__FORM__TIMEOUT_MS=5000
```

- `LOGINURL`: The URL of the login page to visit.
- `INPUTS`: JSON object mapping CSS selectors to input values.
- `SUBMIT`: CSS selector for the submit button.
- `ERRORSELECTOR`: CSS selector indicating a login failure (optional).
- `SUCCESSSELECTOR`: CSS selector indicating a successful login (optional).
- `TIMEOUT_MS`: Maximum wait time after submission for success or failure indicators (optional).

---

### 4. Token-based Authentication

Adds a custom token to HTTP request headers, commonly used for bearer tokens or API keys.

**Environment Variables Example:**

```env
WEBSCREENSHOTS__AUTHOPTIONS__METHOD=token
WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__HEADER=Authorization
WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__VALUE=Bearer your_token_here
```

---

## Notes

- Only one authentication method should be configured at a time.
- Form selectors must match your website's login form HTML elements.
- Ensure the cookies file is properly formatted and accessible when using cookie authentication.

---

For complete configuration options and details, see the [CONFIGURATION.md Authentication section](./CONFIGURATION.md#authentication).

---
