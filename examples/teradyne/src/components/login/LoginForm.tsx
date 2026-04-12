'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { LoginFormProps } from './login-form.props';
import {
  DEMO2_LOGIN_EMAIL,
  DEMO_LOGIN_EMAIL,
  DEMO_LOGIN_PASSWORD,
  setDemoUserEmail,
  validateDemoLogin,
} from '@/lib/demo-auth';

export type { LoginFormProps, LoginFormSuccessBehavior } from './login-form.props';

/** Demo credentials — frontend only, not a real auth system. Re-exported from `@/lib/demo-auth`. */
export { DEMO2_LOGIN_EMAIL, DEMO_LOGIN_EMAIL, DEMO_LOGIN_PASSWORD } from '@/lib/demo-auth';

const FAKE_AUTH_DELAY_MIN_MS = 800;
const FAKE_AUTH_DELAY_MAX_MS = 1200;

const DEFAULT_TITLE = 'Sign in';
const DEFAULT_DESCRIPTION = 'Use the demo account to try the form. No backend is called.';
const DEFAULT_EMAIL_LABEL = 'Email';
const DEFAULT_PASSWORD_LABEL = 'Password';
const DEFAULT_REMEMBER_ME = 'Remember me';
const DEFAULT_SUBMIT = 'Sign in';
const DEFAULT_SIGNING_IN = 'Signing in…';
const DEFAULT_INVALID =
  'Invalid email or password. Try the demo account shown below.';
const DEFAULT_DEMO_HINT_PREFIX = 'Demo:';

function randomAuthDelayMs(): number {
  return (
    FAKE_AUTH_DELAY_MIN_MS +
    Math.floor(Math.random() * (FAKE_AUTH_DELAY_MAX_MS - FAKE_AUTH_DELAY_MIN_MS + 1))
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sitecore / SitecoreAI rendering entry — wire this component in your rendering host. */
export const Default: React.FC<LoginFormProps> = (props) => {
  const { fields, params } = props;
  const router = useRouter();
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const titleField = fields?.title;
  const descriptionField = fields?.description;

  const emailLabel = fields?.emailLabel?.value ?? DEFAULT_EMAIL_LABEL;
  const passwordLabel = fields?.passwordLabel?.value ?? DEFAULT_PASSWORD_LABEL;
  const rememberMeLabel = fields?.rememberMeLabel?.value ?? DEFAULT_REMEMBER_ME;
  const submitLabel = fields?.submitButtonLabel?.value ?? DEFAULT_SUBMIT;
  const signingInLabel = fields?.signingInLabel?.value ?? DEFAULT_SIGNING_IN;
  const invalidMessage = fields?.invalidCredentialsMessage?.value ?? DEFAULT_INVALID;
  const demoHintText = fields?.demoHintText?.value;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = useCallback(() => {
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    let hasFieldErrors = false;
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      hasFieldErrors = true;
    }
    if (!trimmedPassword) {
      setPasswordError('Password is required.');
      hasFieldErrors = true;
    }
    if (hasFieldErrors) {
      return;
    }

    setIsLoading(true);
    try {
      await sleep(randomAuthDelayMs());

      if (!validateDemoLogin(trimmedEmail, trimmedPassword)) {
        setFormError(invalidMessage);
        return;
      }

      setDemoUserEmail(trimmedEmail);
      router.push('/');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPagesPositionStyles = Boolean(params?.styles?.includes('position-'));

  return (
    <section
      data-component="LoginForm"
      className={cn('w-full', {
        'position-left': !hasPagesPositionStyles,
        [params?.styles ?? '']: Boolean(params?.styles),
      })}
    >
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          {titleField && (titleField.value || isEditing) ? (
            <Text
              tag="h3"
              className="text-2xl font-semibold leading-none tracking-tight"
              field={titleField}
            />
          ) : (
            <CardTitle>{DEFAULT_TITLE}</CardTitle>
          )}
          {descriptionField && (descriptionField.value || isEditing) ? (
            <Text
              tag="p"
              className="text-muted-foreground text-sm"
              field={descriptionField}
            />
          ) : (
            <CardDescription>{DEFAULT_DESCRIPTION}</CardDescription>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Could not sign in</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert>
                <AlertTitle>Welcome</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">{emailLabel}</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (formError) setFormError(null);
                  if (successMessage) setSuccessMessage(null);
                }}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'login-email-error' : undefined}
              />
              {emailError && (
                <p id="login-email-error" className="text-destructive text-sm" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{passwordLabel}</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={isLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (formError) setFormError(null);
                  if (successMessage) setSuccessMessage(null);
                }}
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
              />
              {passwordError && (
                <p id="login-password-error" className="text-destructive text-sm" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="login-remember"
                checked={rememberMe}
                disabled={isLoading}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="login-remember" className="text-sm font-normal leading-none">
                {rememberMeLabel}
              </Label>
            </div>

            <p className="text-muted-foreground text-xs">
              {demoHintText ? (
                demoHintText
              ) : (
                <>
                  {DEFAULT_DEMO_HINT_PREFIX}{' '}
                  <span className="font-mono">{DEMO_LOGIN_EMAIL}</span> or{' '}
                  <span className="font-mono">{DEMO2_LOGIN_EMAIL}</span> — password{' '}
                  <span className="font-mono">{DEMO_LOGIN_PASSWORD}</span>
                </>
              )}
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  {signingInLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};
