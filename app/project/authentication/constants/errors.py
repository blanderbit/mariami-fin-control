# the error that means that the user's email has already been
# verified and he cannot send a verification request again
ALREADY_VERIFIED_ERROR: dict[str, str] = {
    "code": "account_already_verified",
    "message": "Account has already been verified"
}


# the error that means that the user's password
# does not match his current password
WRONG_PASSWORD_ERROR: dict[str, str] = {
    "code": "wrong_old_password",
    "message": "Current password is incorrect"
}

# the error meaning that the passwords entered by the user do not match
PASSWORDS_DO_NOT_MATCH_ERROR: dict[str, str] = {
    "code": "passwords_do_not_match",
    "message": "Passwords do not match"
}

# the error that means that the user entered
# incorrect data to enter the account
INVALID_CREDENTIALS_ERROR: dict[str, str] = {
    "code": "invalid_credentials",
    "message": "Invalid email or password"
}

# the error that means that the user's email
# has not yet been verified and he does not
# have access to some part of the functionality
NOT_VERIFIED_BY_EMAIL_ERROR: dict[str, str] = {
    "code": "not_verified",
    "message": "Email address has not been verified"
}

# the error that means that the user does not
# have access to the action for some reason
NO_PERMISSIONS_ERROR: dict[str, str] = {
    "code": "no_permissions",
    "message": "You do not have permission to perform this action"
}

# the error that means that the refresh token is invalid
INVALID_REFRESH_TOKEN: dict[str, str] = {
    "code": "invalid_refresh_token",
    "message": "Refresh token is invalid or expired"
}

# the error that means that the user
# entered an invalid confirmation code
BAD_CODE_ERROR: dict[str, str] = {
    "code": "bad_verify_code",
    "message": "Verification code is invalid"
}

# the error that means that the verification code has expired
CODE_EXPIRED_ERROR: dict[str, str] = {
    "code": "verify_code_expired",
    "message": "Verification code has expired"
}

# the error that means that the email entered by the user is already in use
THIS_EMAIL_ALREADY_IN_USE_ERROR: dict[str, str] = {
    "code": "email_already_in_use",
    "message": "This email address is already registered"
}

# the error that means that the image uploaded by the
# user exceeds the weight limit
AVATAR_MAX_SIZE_ERROR: dict[str, str] = {
    "code": "avatar_max_size_1mb",
    "message": "Avatar image size must not exceed 1MB"
}
