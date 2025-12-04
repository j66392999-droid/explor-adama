import * as yup from 'yup';
import { AuthConstants } from '../constants/auth.constants';

// Common validation messages
const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  passwordLength: `Password must be at least ${AuthConstants.PASSWORD_MIN_LENGTH} characters`,
  passwordRequirements: 'Password must include at least one letter and one number',
  passwordMatch: 'Passwords must match',
  acceptTerms: 'You must accept the terms and conditions',
};

// Base schemas for reusable validation rules
export const emailSchema = yup
  .string()
  .required(validationMessages.required)
  .email(validationMessages.email)
  .trim()
  .lowercase();

export const passwordSchema = yup
  .string()
  .required(validationMessages.required)
  .min(AuthConstants.PASSWORD_MIN_LENGTH, validationMessages.passwordLength)
  .matches(AuthConstants.PASSWORD_REGEX, validationMessages.passwordRequirements);

export const phoneSchema = yup
  .string()
  .optional()
  .test('phone', validationMessages.phone, (value) => {
    if (!value) return true; // Optional field
    return AuthConstants.PHONE_REGEX.test(value);
  });

export const nameSchema = yup
  .string()
  .required(validationMessages.required)
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
  .trim();

// Complete validation schemas
export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required(validationMessages.required)
    .oneOf([yup.ref('password')], validationMessages.passwordMatch),
  acceptTerms: yup
    .boolean()
    .required(validationMessages.acceptTerms)
    .oneOf([true], validationMessages.acceptTerms),
  acceptPrivacy: yup
    .boolean()
    .required('You must accept the privacy policy')
    .oneOf([true], 'You must accept the privacy policy'),
  acceptMarketing: yup.boolean().optional(),
});

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required('Token is required'),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required(validationMessages.required)
    .oneOf([yup.ref('password')], validationMessages.passwordMatch),
});

export const otpVerificationSchema = yup.object({
  code: yup
    .string()
    .required('Verification code is required')
    .length(AuthConstants.OTP_LENGTH, `Verification code must be ${AuthConstants.OTP_LENGTH} digits`)
    .matches(/^\d+$/, 'Verification code must contain only numbers'),
});

export const profileUpdateSchema = yup.object({
  name: nameSchema,
  phone: phoneSchema,
  gender: yup.string().optional().oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
  country: yup.string().optional().max(50, 'Country name is too long'),
  bio: yup.string().optional().max(500, 'Bio must be less than 500 characters'),
  dateOfBirth: yup
    .string()
    .optional()
    .test('date', 'Please enter a valid date', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('age', 'You must be at least 13 years old', (value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age >= 13;
    }),
});

// Type inference from schemas
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
export type OTPVerificationFormData = yup.InferType<typeof otpVerificationSchema>;
export type ProfileUpdateFormData = yup.InferType<typeof profileUpdateSchema>;

// Validation helper functions
export const validateForm = async <T>(
  schema: yup.AnySchema,
  data: T
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Quick validation for single fields
export const validateField = async (
  schema: yup.AnySchema,
  field: string,
  value: any
): Promise<string | null> => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation error';
  }
};