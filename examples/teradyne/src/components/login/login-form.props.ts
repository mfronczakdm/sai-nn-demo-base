import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type LoginFormSuccessBehavior = 'redirect-home' | 'inline-message';

export interface LoginFormParams {
  RenderingIdentifier?: string;
  styles?: string;
  EnabledPlaceholders?: string;
  /**
   * Rendering parameter from Sitecore: `inline-message` (default) or `redirect-home`.
   */
  SuccessBehavior?: string;
  successBehavior?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface LoginFormFields {
  title?: Field<string>;
  description?: Field<string>;
  emailLabel?: Field<string>;
  passwordLabel?: Field<string>;
  rememberMeLabel?: Field<string>;
  submitButtonLabel?: Field<string>;
  signingInLabel?: Field<string>;
  invalidCredentialsMessage?: Field<string>;
  demoHintText?: Field<string>;
}

export interface LoginFormProps extends ComponentProps {
  params: LoginFormParams;
  fields?: LoginFormFields;
}
